const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../db');
const config = require('../config');
const content = require('../content');
const art = require('../art');
const h = require('../helpers');
const { UPLOAD_DIR } = require('./public');

const router = express.Router();
router.use(express.urlencoded({ extended: true, limit: '200kb' }));
router.use((req, res, next) => { res.locals.admin = true; res.locals.meta = { title: `Admin | ${config.brand}`, noindex: true }; next(); });

let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  ADMIN_PASSWORD = crypto.randomBytes(9).toString('base64url');
  console.warn(`[admin] ADMIN_PASSWORD is not set. Temporary password for this run: ${ADMIN_PASSWORD}`);
}
const digest = (s) => crypto.createHash('sha256').update(String(s)).digest();

const loginAttempts = new Map();

router.get('/login', (req, res) => res.render('admin/login', { error: '' }));
router.post('/login', (req, res) => {
  const now = Date.now();
  const list = (loginAttempts.get(req.ip) || []).filter((t) => now - t < 15 * 60 * 1000);
  if (list.length >= 10) return res.status(429).render('admin/login', { error: 'Too many attempts. Try again in 15 minutes.' });
  if (crypto.timingSafeEqual(digest(req.body.password || ''), digest(ADMIN_PASSWORD))) {
    loginAttempts.delete(req.ip);
    return req.session.regenerate(() => { req.session.admin = true; res.redirect('/admin'); });
  }
  list.push(now);
  loginAttempts.set(req.ip, list);
  res.status(401).render('admin/login', { error: 'Incorrect password.' });
});
router.post('/logout', (req, res) => req.session.destroy(() => res.redirect('/admin/login')));

router.use((req, res, next) => (req.session && req.session.admin ? next() : res.redirect('/admin/login')));
router.use((req, res, next) => {
  res.locals.nav = {
    newQuotes: db.all('quotes').filter((q) => q.status === 'new').length,
    unread: db.all('messages').filter((m) => !m.read).length,
    pending: db.all('accounts').filter((a) => a.status === 'pending').length,
  };
  next();
});

const lowStock = () => db.all('products')
  .filter((p) => p.active && !['custom', 'addons'].includes(p.category))
  .flatMap((p) => p.sizes.filter((s) => s.stock <= Math.max(s.moq * 3, 20)).map((s) => ({ p, s })));

// ---------- dashboard ----------
router.get('/', (req, res) => {
  const quotes = db.all('quotes');
  const today = new Date().toISOString().slice(0, 10);
  const week = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const byStatus = Object.fromEntries(h.STATUSES.map((s) => [s.id, quotes.filter((q) => q.status === s.id).length]));
  const open = quotes.filter((q) => ['new', 'quoted', 'confirmed'].includes(q.status));
  res.render('admin/dashboard', {
    byStatus,
    pipeline: open.reduce((s, q) => s + (q.quotedAmount || q.estimate || 0), 0),
    upcoming: quotes.filter((q) => q.status === 'confirmed' && q.deliveryDate >= today && q.deliveryDate <= week).sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate)),
    recent: quotes.slice(0, 8),
    low: lowStock(),
    pendingAccounts: db.all('accounts').filter((a) => a.status === 'pending'),
  });
});

// ---------- quotes ----------
router.get('/quotes', (req, res) => {
  const status = h.clean(req.query.status, 20);
  const search = h.clean(req.query.q, 80).toLowerCase();
  const list = db.all('quotes').filter((q) =>
    (!status || q.status === status) &&
    (!search || `${q.ref} ${q.customer.name} ${q.customer.company} ${q.customer.phone} ${q.customer.email}`.toLowerCase().includes(search)));
  res.render('admin/quotes', { list, status, search });
});

router.get('/quotes/:id', (req, res, next) => {
  const q = db.get('quotes', req.params.id);
  if (!q) return next();
  const account = q.accountId ? db.get('accounts', q.accountId) : null;
  res.render('admin/quote', { q, account, saved: req.query.saved === '1' });
});

router.post('/quotes/:id', (req, res, next) => {
  const q = db.get('quotes', req.params.id);
  if (!q) return next();
  const status = h.STATUSES.some((s) => s.id === req.body.status) ? req.body.status : q.status;
  const quotedAmount = req.body.quotedAmount === '' ? null : Math.max(0, Math.round(Number(req.body.quotedAmount) || 0));
  const note = h.clean(req.body.note, 500);
  const history = q.history || [];
  if (status !== q.status || note) history.push({ status, at: new Date().toISOString(), note });
  db.update('quotes', q.id, { status, quotedAmount, adminNotes: h.clean(req.body.adminNotes, 3000), history });
  res.redirect(`/admin/quotes/${q.id}?saved=1`);
});

router.get('/quotes/:id/logo', (req, res, next) => {
  const q = db.get('quotes', req.params.id);
  if (!q || !q.logo) return next();
  const file = path.join(UPLOAD_DIR, path.basename(q.logo.file));
  if (!fs.existsSync(file)) return next();
  res.set('X-Content-Type-Options', 'nosniff');
  res.download(file, q.logo.originalName.replace(/[^\w.\- ]/g, '_'));
});

// ---------- products ----------
router.get('/products', (req, res) => {
  res.render('admin/products', { list: db.all('products'), saved: req.query.saved });
});

const blankProduct = () => ({
  id: '', name: '', category: 'ice-cream', format: 'tub', flavours: [], dietary: [], description: '', highlights: [],
  shelfLife: '', storageTemp: '−18°C or colder', leadTime: 'Next day', active: true, featured: false, seasonal: false,
  art: { shape: 'tub', color: '#F4A3B4', label: '' },
  sizes: [{ id: '', label: '', packSize: '', unit: 'carton', contains: '', unitsPerCarton: 1, moq: 10, stock: 0, tiers: [{ min: 10, price: 0 }, { min: 50, price: 0 }, { min: 200, price: 0 }] }],
});

const editView = (res, p, isNew, errors = []) => res.status(errors.length ? 400 : 200).render('admin/product-edit', {
  p, isNew, errors, categories: content.categories, formats: content.formats, dietary: content.dietary, shapes: art.shapes,
});

router.get('/products/new', (req, res) => editView(res, blankProduct(), true));
router.get('/products/:id', (req, res, next) => {
  const p = db.get('products', req.params.id);
  if (!p) return next();
  editView(res, p, false);
});

// "10:1920, 50:1820, 200:1730" -> [{min, price}]
function parseTiers(str) {
  return String(str || '').split(/[,\n]/).map((t) => t.split(':').map((x) => Number(String(x).replace(/[^\d.]/g, ''))))
    .filter(([min, price]) => min > 0 && price >= 0 && Number.isFinite(price)).map(([min, price]) => ({ min: Math.floor(min), price: Math.round(price) }))
    .sort((a, b) => a.min - b.min);
}

function readProduct(body, existing) {
  const list = (v) => String(v || '').split(/[,\n]/).map((x) => h.clean(x, 60)).filter(Boolean);
  const rows = Object.values(body.sizes || {});
  const sizes = rows.filter((r) => h.clean(r.label, 60)).map((r) => {
    const tiers = parseTiers(r.tiers);
    const moq = Math.max(1, Math.floor(Number(r.moq) || 1));
    return {
      id: config.slugify(h.clean(r.id, 30) || h.clean(r.label, 30)),
      label: h.clean(r.label, 60), packSize: h.clean(r.packSize, 20) || h.clean(r.label, 20), unit: h.clean(r.unit, 20) || 'carton',
      contains: h.clean(r.contains, 80), unitsPerCarton: Math.max(1, Math.floor(Number(r.unitsPerCarton) || 1)), moq,
      stock: Math.max(0, Math.floor(Number(r.stock) || 0)), tiers: tiers.length ? tiers : [{ min: moq, price: 0 }],
    };
  });
  return {
    id: existing ? existing.id : config.slugify(h.clean(body.id, 60) || h.clean(body.name, 60)),
    name: h.clean(body.name, 120),
    category: content.categories.some((c) => c.id === body.category) ? body.category : 'ice-cream',
    format: content.formats[body.format] ? body.format : 'tub',
    flavours: list(body.flavours),
    dietary: [].concat(body.dietary || []).filter((d) => content.dietary[d]),
    description: h.clean(body.description, 1000),
    highlights: String(body.highlights || '').split('\n').map((x) => h.clean(x, 120)).filter(Boolean).slice(0, 6),
    shelfLife: h.clean(body.shelfLife, 120), storageTemp: h.clean(body.storageTemp, 120), leadTime: h.clean(body.leadTime, 120),
    active: body.active === 'on', featured: body.featured === 'on', seasonal: body.seasonal === 'on',
    art: {
      shape: art.shapes.includes(body.artShape) ? body.artShape : 'tub',
      color: /^#[0-9a-f]{6}$/i.test(body.artColor || '') ? body.artColor : '#F4A3B4',
      label: h.clean(body.artLabel, 14),
    },
    sizes,
  };
}

function validateProduct(p, isNew) {
  const errors = [];
  if (!p.name) errors.push('Name is required.');
  if (!p.id) errors.push('URL slug is required.');
  if (isNew && db.get('products', p.id)) errors.push(`A product with slug "${p.id}" already exists.`);
  if (!p.sizes.length) errors.push('Add at least one pack size.');
  const ids = p.sizes.map((s) => s.id);
  if (new Set(ids).size !== ids.length) errors.push('Pack size IDs must be unique.');
  p.sizes.forEach((s) => { if (!s.tiers.some((t) => t.price > 0)) errors.push(`Set tier prices for "${s.label}".`); });
  return errors;
}

router.post('/products/new', (req, res) => {
  const p = readProduct(req.body);
  const errors = validateProduct(p, true);
  if (errors.length) return editView(res, p, true, errors);
  db.insert('products', p);
  res.redirect('/admin/products?saved=' + encodeURIComponent(p.name));
});

router.post('/products/:id', (req, res, next) => {
  const existing = db.get('products', req.params.id);
  if (!existing) return next();
  const p = readProduct(req.body, existing);
  const errors = validateProduct(p, false);
  if (errors.length) return editView(res, p, false, errors);
  db.update('products', existing.id, p);
  res.redirect('/admin/products?saved=' + encodeURIComponent(p.name));
});

router.post('/products/:id/stock', (req, res, next) => {
  const p = db.get('products', req.params.id);
  if (!p) return next();
  const stock = req.body.stock || {};
  const sizes = p.sizes.map((s) => (stock[s.id] !== undefined ? { ...s, stock: Math.max(0, Math.floor(Number(stock[s.id]) || 0)) } : s));
  db.update('products', p.id, { sizes, active: req.body.active === 'on' });
  res.redirect('/admin/products?saved=' + encodeURIComponent(p.name));
});

router.post('/products/:id/delete', (req, res) => {
  db.remove('products', req.params.id);
  res.redirect('/admin/products');
});

// ---------- accounts & messages ----------
router.get('/accounts', (req, res) => {
  const quotes = db.all('quotes');
  const list = db.all('accounts').map((a) => ({ ...a, orders: quotes.filter((q) => q.accountId === a.id) }));
  res.render('admin/accounts', { list });
});

router.post('/accounts/:id', (req, res) => {
  if (['approved', 'rejected', 'pending'].includes(req.body.status)) db.update('accounts', req.params.id, { status: req.body.status, notes: h.clean(req.body.notes, 500) });
  res.redirect('/admin/accounts');
});

router.get('/messages', (req, res) => {
  const list = db.all('messages');
  res.render('admin/messages', { list });
  list.filter((m) => !m.read).forEach((m) => db.update('messages', m.id, { read: true }));
});

module.exports = router;
