// Tiny JSON-file datastore. Good for a single-server small business; swap for Postgres/SQLite
// later by re-implementing these few functions.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const seed = require('./seed');

// Vercel functions can only write to /tmp, and /tmp is wiped between cold starts, so data there is
// temporary. Use a real database (see README) before relying on a Vercel deployment for orders.
const DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL ? '/tmp/chillcrate-data' : path.join(__dirname, '..', 'data'));
const FILE = path.join(DATA_DIR, 'db.json');
const COLLECTIONS = ['products', 'quotes', 'accounts', 'messages'];

let state;

function fresh() {
  return {
    products: JSON.parse(JSON.stringify(seed.products)).map((p) => ({ ...p, createdAt: new Date().toISOString() })),
    quotes: [],
    accounts: [],
    messages: [],
    seq: { quote: 0 },
  };
}

function load() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(FILE)) {
    state = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    for (const c of COLLECTIONS) state[c] = state[c] || [];
    state.seq = state.seq || { quote: 0 };
  } else {
    state = fresh();
    save();
  }
}

function save() {
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, FILE);
}

function reset() {
  state = fresh();
  save();
}

const all = (col) => state[col];
const get = (col, id) => state[col].find((r) => r.id === id);

function insert(col, record) {
  const row = { id: record.id || crypto.randomUUID(), createdAt: new Date().toISOString(), ...record };
  state[col].unshift(row);
  save();
  return row;
}

function update(col, id, patch) {
  const row = get(col, id);
  if (!row) return null;
  Object.assign(row, patch, { updatedAt: new Date().toISOString() });
  save();
  return row;
}

function remove(col, id) {
  const i = state[col].findIndex((r) => r.id === id);
  if (i >= 0) {
    state[col].splice(i, 1);
    save();
  }
}

function nextQuoteRef() {
  state.seq.quote += 1;
  save();
  return `Q-${new Date().getFullYear()}-${String(state.seq.quote).padStart(4, '0')}`;
}

load();

module.exports = { all, get, insert, update, remove, nextQuoteRef, reset, DATA_DIR };
