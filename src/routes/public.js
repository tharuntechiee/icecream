const express = require('express');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const db = require('../db');
const config = require('../config');
const content = require('../content');
const art = require('../art');
const mailer = require('../mailer');
const h = require('../helpers');
const Totals = require('../../public/js/totals');

const router = express.Router();

// ---------- spam protection: honeypot + simple per-IP rate limit ----------
const hits = new Map();
function rateLimited(req, max = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const list = (hits.get(req.ip) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(req.ip, list);
  return list.length > max;
}

// ---------- logo uploads (custom packaging) ----------
const UPLOAD_DIR = path.join(db.DATA_DIR, 'uploads');
const ALLOWED = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/svg+xml': '.svg', 'application/pdf': '.pdf', 'application/postscript': '.eps', 'application/illustrator': '.ai' };
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => { require('fs').mkdirSync(UPLOAD_DIR, { recursive: true }); cb(null, UPLOAD_DIR); },
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + (ALLOWED[file.mimetype] || '.bin')),
  }),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => cb(null, Boolean(ALLOWED[file.mimetype])),
});

// ---------- shared ----------
const activeProducts = () => db.all('products').filter((p) => p.active);

// Recompute every line from the catalogue — never trust prices sent by the browser.
function buildItems(rawItems) {
  const items = [];
  const errors = [];
  for (const raw of (Array.isArray(rawItems) ? rawItems : []).slice(0, 60)) {
    const p = db.get('products', String(raw.productId || ''));
    if (!p || !p.active) continue;
    const s = p.sizes.find((x) => x.id === String(raw.sizeId || ''));
    if (!s) continue;
    const qty = Math.floor(Number(raw.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > 100000) continue;
    const flavour = p.flavours.includes(raw.flavour) ? raw.flavour : (raw.flavour === 'Assorted' && p.flavours.length ? 'Assorted' : '');
    const unitPrice = h.Pricing.unitPrice(s, qty);
    if (qty < s.moq) errors.push(`${p.name} (${s.label}) is below the minimum of ${s.moq} ${s.unit}s`);
    items.push({
      productId: p.id, sizeId: s.id, name: p.name, sizeLabel: s.label, unit: s.unit, contains: s.contains,
      flavour, qty, unitPrice, lineTotal: unitPrice * qty, belowMoq: qty < s.moq,
    });
  }
  return { items, errors, estimate: items.reduce((sum, i) => sum + i.lineTotal, 0) };
}

function findAccount(phone) {
  const digits = (phone || '').replace(/\D/g, '').slice(-10);
  return db.all('accounts').find((a) => digits && a.phone.replace(/\D/g, '').slice(-10) === digits);
}

function saveQuote(data) {
  const q = db.insert('quotes', {
    ref: db.nextQuoteRef(),
    status: 'new',
    history: [{ status: 'new', at: new Date().toISOString(), note: 'Submitted on website' }],
    ...data,
  });
  mailer.quoteEmail(q);
  return q;
}

const minDeliveryDate = () => {
  const d = new Date(Date.now() + config.advanceNoticeHours * 3600 * 1000);
  return d.toISOString().slice(0, 10);
};

// ---------- pages ----------
router.get('/', (req, res) => {
  const products = activeProducts();
  res.render('home', {
    meta: {
      title: `Bulk Ice Cream & Ice Supplier in ${config.city} | ${config.brand}`,
      description: `${config.brand} supplies bulk ice cream tubs, cups, kulfi, custom logo cups, ice blocks and dry ice to restaurants, hotels, caterers and events across ${config.city}. Get a wholesale quote.`,
    },
    featured: products.filter((p) => p.featured).slice(0, 8),
    counts: Object.fromEntries(content.categories.map((c) => [c.id, products.filter((p) => p.category === c.id).length])),
    catalog: h.clientCatalog(products.filter((p) => ['ice-cream-cups'].includes(p.id))),
  });
});

router.get('/products', (req, res) => {
  const all = activeProducts();
  const q = {
    category: h.clean(req.query.category, 40),
    format: h.clean(req.query.format, 40),
    flavour: h.clean(req.query.flavour, 40),
    size: h.clean(req.query.size, 40),
    diet: [].concat(req.query.diet || []).map((d) => h.clean(d, 20)).filter((d) => content.dietary[d]),
    search: h.clean(req.query.q, 80),
    sort: h.clean(req.query.sort, 20) || 'popular',
  };
  const inCategory = q.category ? all.filter((p) => p.category === q.category) : all;
  let list = inCategory.filter((p) =>
    (!q.format || p.format === q.format) &&
    (!q.flavour || p.flavours.includes(q.flavour)) &&
    (!q.size || p.sizes.some((s) => s.packSize === q.size)) &&
    q.diet.every((d) => p.dietary.includes(d)) &&
    (!q.search || `${p.name} ${p.description} ${p.flavours.join(' ')}`.toLowerCase().includes(q.search.toLowerCase())));
  if (q.sort === 'price-asc') list = [...list].sort((a, b) => h.fromPrice(a) - h.fromPrice(b));
  if (q.sort === 'price-desc') list = [...list].sort((a, b) => h.fromPrice(b) - h.fromPrice(a));
  if (q.sort === 'popular') list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  const cat = content.categories.find((c) => c.id === q.category);
  res.render('products', {
    meta: {
      title: `${cat ? cat.name : 'Wholesale Catalogue'} — Bulk Prices | ${config.brand} ${config.city}`,
      description: `Browse ${cat ? cat.name.toLowerCase() : 'bulk ice cream, custom packaging, ice and add-ons'} with pack sizes, carton quantities, MOQ and tier pricing. Add to your quote — delivered frozen in ${config.city}.`,
      canonical: q.category && Object.keys(req.query).length === 1 ? `/products?category=${q.category}` : '/products',
    },
    list, q, cat,
    options: {
      formats: [...new Set(inCategory.map((p) => p.format))],
      flavours: [...new Set(inCategory.flatMap((p) => p.flavours))].sort(),
      sizes: h.sortSizes(inCategory.flatMap((p) => p.sizes.map((s) => s.packSize))),
      hasDietary: inCategory.some((p) => p.dietary.length) || q.diet.length > 0,
    },
    catalog: h.clientCatalog(all),
  });
});

router.get('/products/:id', (req, res, next) => {
  const p = db.get('products', req.params.id);
  if (!p || !p.active) return next();
  const related = activeProducts().filter((x) => x.category === p.category && x.id !== p.id).slice(0, 3);
  res.render('product', {
    meta: {
      title: `${p.name} — Wholesale ${h.Pricing.money(h.fromPrice(p))}+ per ${p.sizes[0].unit} | ${config.brand}`,
      description: `${p.description} Available in ${p.sizes.map((s) => s.label).join(', ')}. MOQ ${p.sizes[0].moq} ${p.sizes[0].unit}s. Bulk tier pricing, delivered frozen in ${config.city}.`,
      image: h.artUrl(p),
    },
    p, related, catalog: h.clientCatalog([p, ...related]),
  });
});

// The order cart. /quote was its old address; keep old links and bookmarks working.
router.get('/quote', (req, res) => res.redirect(301, '/cart' + (req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '')));
router.get('/cart', (req, res) => {
  res.render('quote', {
    meta: { title: `Your Cart | ${config.brand}`, description: 'Review your bulk order, choose the delivery date and spot, and place it. Pay on confirmation: no online payment.', noindex: true },
    catalog: h.clientCatalog(db.all('products')),
    minDate: minDeliveryDate(),
    preset: { eventType: h.clean(req.query.event, 60), guests: h.clean(req.query.guests, 6) },
  });
});

router.post(['/api/order', '/api/quote'], express.json({ limit: '100kb' }), (req, res) => {
  const b = req.body || {};
  if (b.website) return res.json({ ok: true, ref: 'ORD-0000' }); // honeypot: pretend success
  if (rateLimited(req)) return res.status(429).json({ ok: false, errors: ['Too many requests. Please call or WhatsApp us instead.'] });

  const c = b.customer || {};
  const customer = {
    name: h.clean(c.name, 80), company: h.clean(c.company, 120), phone: h.clean(c.phone, 20),
    email: h.clean(c.email, 120).toLowerCase(),
  };
  const data = {
    eventType: config.eventTypes.includes(b.eventType) ? b.eventType : '',
    deliveryDate: /^\d{4}-\d{2}-\d{2}$/.test(b.deliveryDate || '') ? b.deliveryDate : '',
    area: h.clean(b.area, 80), address: h.clean(b.address, 400), pincode: h.clean(b.pincode, 10),
    guests: Math.max(0, Math.floor(Number(b.guests) || 0)) || '', notes: h.clean(b.notes, 1500),
  };
  // Optional map pin from the location picker; kept only when it is a real coordinate.
  const lat = Number(b.lat), lng = Number(b.lng);
  if (b.lat && b.lng && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) data.location = { lat: +lat.toFixed(6), lng: +lng.toFixed(6) };
  const errors = [];
  if (!customer.name) errors.push('Please enter your name.');
  if (!h.isPhone(customer.phone)) errors.push('Please enter a valid phone number.');
  if (customer.email && !h.isEmail(customer.email)) errors.push('Please enter a valid email address.');
  if (!data.deliveryDate) errors.push('Please choose a delivery date.');
  else if (data.deliveryDate < new Date().toISOString().slice(0, 10)) errors.push('Delivery date cannot be in the past.');
  if (!data.address) errors.push('Please enter the delivery address.');

  const built = buildItems(b.items);
  if (!built.items.length) errors.push('Your cart is empty.');
  // Orders are delivered to an exact map spot inside our zones; the zone sets delivery charge and minimum.
  const zone = data.location ? Totals.zoneFor(config.serviceZones, config.hyderabadCentre, { area: data.area, lat: data.location.lat, lng: data.location.lng }) : null;
  if (!data.location) errors.push('Choose your exact delivery spot on the map.');
  else if (!zone) errors.push('That spot is outside our delivery areas in Telangana and Andhra Pradesh. Call or WhatsApp us and we will try to arrange it.');
  if (errors.length) return res.status(400).json({ ok: false, errors });

  // Firm totals, recomputed here from the catalogue and the delivery zone; the browser's figures are never trusted.
  const totals = Totals.compute(built.estimate, zone);
  if (totals.belowMin) built.errors.push(`Below the ${zone.name} minimum order of ${h.money(zone.minOrder)}`);
  const account = findAccount(customer.phone);
  const q = saveQuote({ source: 'cart', customer, ...data, items: built.items, estimate: built.estimate, totals, moqWarnings: built.errors, accountId: account ? account.id : null });
  res.json({ ok: true, ref: q.ref });
});

router.get('/custom-packaging', (req, res) => renderCustom(res, {}));

function renderCustom(res, { values = {}, errors = [], status = 200 }) {
  const products = activeProducts().filter((p) => p.category === 'custom');
  res.status(status).render('custom', {
    meta: {
      title: `Custom Ice Cream Cups with Logo & Private-Label Tubs | ${config.brand}`,
      description: `Branded ice cream cups and tubs with your logo, wedding name sleeves and corporate gift boxes. Free digital proof, low MOQs, delivered frozen in ${config.city}.`,
    },
    products, values, errors,
  });
}

router.post('/custom-packaging', (req, res) => {
  upload.single('logo')(req, res, (err) => {
    const b = req.body || {};
    const values = { ...b };
    const errors = [];
    if (err) errors.push(err.code === 'LIMIT_FILE_SIZE' ? 'Logo file must be under 8 MB.' : 'Could not upload that file.');
    if (b.website) return res.redirect('/thanks');
    if (rateLimited(req)) errors.push('Too many requests — please call or WhatsApp us.');
    const customer = { name: h.clean(b.name, 80), company: h.clean(b.company, 120), phone: h.clean(b.phone, 20), email: h.clean(b.email, 120).toLowerCase() };
    if (!customer.name) errors.push('Please enter your name.');
    if (!h.isPhone(customer.phone)) errors.push('Please enter a valid phone number.');
    if (customer.email && !h.isEmail(customer.email)) errors.push('Please enter a valid email address.');

    const p = db.get('products', h.clean(b.productId, 60));
    const s = p && p.sizes.find((x) => x.id === b.sizeId) || (p && p.sizes[0]);
    const units = Math.floor(Number(b.units) || 0);
    if (!p || p.category !== 'custom') errors.push('Please choose a packaging type.');
    if (units < 1) errors.push('Please enter an approximate quantity.');

    if (errors.length) {
      if (req.file) require('fs').unlink(req.file.path, () => {});
      return renderCustom(res, { values, errors, status: 400 });
    }
    const cartons = Math.max(1, Math.ceil(units / (s.unitsPerCarton || 1)));
    const built = buildItems([{ productId: p.id, sizeId: s.id, qty: cartons, flavour: p.flavours.includes(b.flavour) ? b.flavour : 'Assorted' }]);
    const q = saveQuote({
      source: 'custom-packaging', customer,
      eventType: config.eventTypes.includes(b.eventType) ? b.eventType : '',
      deliveryDate: /^\d{4}-\d{2}-\d{2}$/.test(b.date || '') ? b.date : '',
      area: '', address: h.clean(b.city, 120),
      notes: [`Approx. ${units} units requested.`, h.clean(b.notes, 1500)].filter(Boolean).join(' '),
      sampleRequested: b.sample === 'on',
      items: built.items, estimate: built.estimate, moqWarnings: built.errors,
      logo: req.file ? { file: req.file.filename, originalName: h.clean(req.file.originalname, 120), size: req.file.size, mimetype: req.file.mimetype } : null,
    });
    res.redirect(`/thanks?ref=${encodeURIComponent(q.ref)}`);
  });
});

router.get('/events', (req, res) => {
  const catalog = h.clientCatalog(activeProducts());
  res.render('events', {
    meta: {
      title: `Ice Cream for Weddings, Parties & Corporate Events in ${config.city} | ${config.brand}`,
      description: `Wedding, birthday, corporate and festival ice cream packages with freezer rental and serving counters. Use the guest calculator to see how much you need.`,
    },
    catalog,
  });
});

router.get('/about', (req, res) => res.render('about', {
  meta: { title: `About ${config.brand} — Cold-Chain Ice Cream Manufacturer in ${config.city}`, description: `Our story, FSSAI-licensed plant, cold-chain process and hygiene standards. ${config.brand} has supplied bulk ice cream and ice to ${config.city} businesses since 2012.` },
}));

router.get('/delivery', (req, res) => res.render('delivery', {
  meta: { title: `Delivery Areas & Charges in ${config.city} | ${config.brand}`, description: `Serviceable areas, minimum order value, delivery charges and our −18°C refrigerated vans across ${config.city} and nearby cities.` },
}));

router.get('/faq', (req, res) => res.render('faq', {
  meta: { title: `FAQ — Storage, Delivery, Cancellation & Payment | ${config.brand}`, description: 'Answers on ice cream storage, transport without melting, advance notice, cancellation and payment terms for bulk orders.' },
}));

router.get('/contact', (req, res) => res.render('contact', {
  meta: { title: `Contact ${config.brand} — Bulk Ice Cream Orders in ${config.city}`, description: `Call, WhatsApp or email ${config.brand} for bulk ice cream and ice orders in ${config.city}. Open ${config.hours[0].days} ${config.hours[0].time}.` },
  values: {}, errors: [], sent: false,
}));

router.post('/contact', express.urlencoded({ extended: false }), (req, res) => {
  const b = req.body;
  if (b.website) return res.redirect('/contact');
  const values = { name: h.clean(b.name, 80), phone: h.clean(b.phone, 20), email: h.clean(b.email, 120), subject: h.clean(b.subject, 120), message: h.clean(b.message, 3000) };
  const errors = [];
  if (!values.name) errors.push('Please enter your name.');
  if (!h.isPhone(values.phone) && !h.isEmail(values.email)) errors.push('Please give a phone number or email so we can reply.');
  if (!values.message) errors.push('Please write a message.');
  if (rateLimited(req)) errors.push('Too many messages — please call or WhatsApp us.');
  const meta = { title: `Contact ${config.brand}`, description: `Contact ${config.brand}.` };
  if (errors.length) return res.status(400).render('contact', { meta, values, errors, sent: false });
  db.insert('messages', { ...values, read: false });
  mailer.simpleEmail(`Website message: ${values.subject || values.name}`, Object.entries(values), values.email);
  res.render('contact', { meta, values: {}, errors: [], sent: true });
});

router.get('/register', (req, res) => res.render('register', {
  meta: { title: `Register a Business Account | ${config.brand}`, description: 'Register your restaurant, hotel, café, catering or retail business for faster repeat orders, GST invoices and credit terms.' },
  values: {}, errors: [], done: false,
}));

router.post('/register', express.urlencoded({ extended: false }), (req, res) => {
  const b = req.body;
  if (b.website) return res.redirect('/register');
  const values = {
    businessName: h.clean(b.businessName, 120), contactName: h.clean(b.contactName, 80), phone: h.clean(b.phone, 20),
    email: h.clean(b.email, 120).toLowerCase(), gstin: h.clean(b.gstin, 15).toUpperCase(), businessType: h.clean(b.businessType, 60),
    address: h.clean(b.address, 400), area: h.clean(b.area, 80), monthlyVolume: h.clean(b.monthlyVolume, 40),
  };
  const errors = [];
  if (!values.businessName) errors.push('Please enter your business name.');
  if (!values.contactName) errors.push('Please enter a contact person.');
  if (!h.isPhone(values.phone)) errors.push('Please enter a valid phone number.');
  if (!h.isEmail(values.email)) errors.push('Please enter a valid email address.');
  if (!h.GSTIN_RE.test(values.gstin)) errors.push('Please enter a valid 15-character GSTIN, e.g. 36ABCDE1234F1Z5.');
  if (!config.businessTypes.includes(values.businessType)) errors.push('Please choose your business type.');
  if (!values.address) errors.push('Please enter your delivery address.');
  if (!errors.length && db.all('accounts').some((a) => a.gstin === values.gstin)) errors.push('An account with this GSTIN already exists — call us and we will link your orders.');
  if (rateLimited(req)) errors.push('Too many requests — please call us.');
  const meta = { title: `Register a Business Account | ${config.brand}`, description: 'Register your business.' };
  if (errors.length) return res.status(400).render('register', { meta, values, errors, done: false });
  db.insert('accounts', { ...values, status: 'pending' });
  mailer.simpleEmail(`New business account: ${values.businessName}`, Object.entries(values), values.email);
  res.render('register', { meta, values, errors: [], done: true });
});

router.get('/thanks', (req, res) => {
  const ref = h.clean(req.query.ref, 20);
  res.render('thanks', { meta: { title: `Order placed | ${config.brand}`, description: 'Thank you.', noindex: true }, ref });
});

// SEO landing pages: /bulk-ice-cream-supplier-<city>, /ice-blocks-wholesale-<city>, /custom-ice-cream-cups-with-logo
router.get('/:slug', (req, res, next) => {
  const page = content.landings[req.params.slug];
  if (!page) return next();
  const products = activeProducts().filter((p) => p.category === page.category);
  res.render('landing', { meta: { title: page.title, description: page.description }, page, products, catalog: h.clientCatalog(products) });
});

// ---------- generated artwork ----------
router.get('/art/p/:id.svg', (req, res, next) => {
  const p = db.get('products', req.params.id);
  if (!p) return next();
  const color = p.art.color || art.flavourColor(p.flavours[0]);
  res.type('image/svg+xml').set('Cache-Control', 'public, max-age=3600')
    .send(art.render(p.art.shape, { color, label: p.art.label, title: p.name, variant: req.query.v, plain: req.query.plain === '1' }));
});

router.get('/art/s/:shape.svg', (req, res, next) => {
  if (!art.shapes.includes(req.params.shape)) return next();
  const c = /^[0-9a-f]{6}$/i.test(req.query.c || '') ? '#' + req.query.c : undefined;
  res.type('image/svg+xml').set('Cache-Control', 'public, max-age=86400')
    .send(art.render(req.params.shape, { color: c, label: h.clean(req.query.l, 14), variant: req.query.v, plain: req.query.plain === '1' }));
});

// ---------- SEO plumbing ----------
router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /api\nDisallow: /quote\nDisallow: /thanks\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
});

router.get('/sitemap.xml', (req, res) => {
  const pages = ['/', '/products', '/custom-packaging', '/events', '/about', '/delivery', '/faq', '/contact', '/register',
    ...content.categories.map((c) => `/products?category=${c.id}`),
    ...Object.keys(content.landings).map((s) => `/${s}`),
    ...activeProducts().map((p) => `/products/${p.id}`)];
  const urls = pages.map((u) => `<url><loc>${config.siteUrl}${u.replace(/&/g, '&amp;')}</loc></url>`).join('');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
});

module.exports = router;
module.exports.UPLOAD_DIR = UPLOAD_DIR;
