const Pricing = require('../public/js/pricing');
const config = require('./config');
const art = require('./art');

// Flavour ink for the swatch dots on place cards and labels.
const swatch = (flavour) => art.flavourColor(flavour);

const SIZE_ORDER = ['60ml', '100ml', '110ml', '125ml', '150ml', '500ml', '700ml', '1L', '4L', '5L', '2kg', '5kg', '10kg', '25kg', '50kg', 'Gift box', 'Kit', 'Service'];

function sortSizes(list) {
  return [...new Set(list)].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a), ib = SIZE_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

const money = (n) => Pricing.money(n);

function fromPrice(product) {
  const prices = product.sizes.map((s) => Pricing.fromPrice(s)).filter(Boolean);
  return prices.length ? Math.min(...prices) : 0;
}

// The size shown on cards and added by quick "Add to quote" buttons.
const defaultSize = (product) => product.sizes[0];

const artUrl = (p, variant) => `/art/p/${encodeURIComponent(p.id)}.svg${variant === 'plain' ? '?plain=1' : variant ? `?v=${variant}` : ''}`;
const shapeUrl = (art, plain) => {
  const qs = new URLSearchParams();
  if (plain) qs.set('plain', '1');
  if (art.color) qs.set('c', art.color.replace('#', ''));
  if (art.label) qs.set('l', art.label);
  const s = qs.toString();
  return `/art/s/${art.shape}.svg${s ? '?' + s : ''}`;
};

// JSON for embedding in <script type="application/json">.
const jsonScript = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

// Compact catalogue for the browser: just what the quote cart / calculator need.
function clientCatalog(products) {
  return products.filter((p) => p.active).map((p) => ({
    id: p.id, name: p.name, category: p.category, flavours: p.flavours, art: artUrl(p, 'plain'),
    sizes: p.sizes.map((s) => ({ id: s.id, label: s.label, unit: s.unit, contains: s.contains, unitsPerCarton: s.unitsPerCarton, moq: s.moq, tiers: s.tiers })),
  }));
}

const clean = (v, max = 500) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const isPhone = (v) => (v.replace(/\D/g, '').length >= 10 && v.replace(/\D/g, '').length <= 13);
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const STATUSES = [
  { id: 'new', label: 'New' },
  { id: 'quoted', label: 'Quoted' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
const fmtDateTime = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

const waLink = (text) => `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(text)}`;

module.exports = { swatch, Pricing, money, fromPrice, defaultSize, artUrl, shapeUrl, jsonScript, clientCatalog, clean, isEmail, isPhone, GSTIN_RE, STATUSES, sortSizes, fmtDate, fmtDateTime, waLink };
