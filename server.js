const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const config = require('./src/config');
const content = require('./src/content');
const h = require('./src/helpers');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProd = process.env.NODE_ENV === 'production';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
  });
  next();
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: isProd ? '7d' : 0 }));

app.use('/admin', session({
  name: 'admin.sid',
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'strict', secure: isProd, maxAge: 8 * 3600 * 1000 },
}));

// Values every template can use.
app.use((req, res, next) => {
  Object.assign(res.locals, {
    site: config, content, h, path: req.path, query: req.query,
    meta: { title: config.brand, description: config.tagline },
    year: new Date().getFullYear(),
  });
  next();
});

app.use('/admin', require('./src/routes/admin'));
app.use('/', require('./src/routes/public'));

app.use((req, res) => res.status(404).render('404', { meta: { title: `Page not found | ${config.brand}`, noindex: true } }));

app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith('/api/')) return res.status(500).json({ ok: false, errors: ['Something went wrong. Please call or WhatsApp us.'] });
  res.status(500).render('404', { meta: { title: 'Something went wrong', noindex: true }, error: true });
});

// Vercel imports the app as a serverless handler; everywhere else, run a normal server.
if (require.main === module && !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`${config.brand} site running on http://localhost:${PORT}`));
}

module.exports = app;
