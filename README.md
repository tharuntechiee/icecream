# Bulk ice cream & ice supplier website

A mobile-first B2B site for wholesale ice cream, custom-branded packaging, ice and event rentals. Visitors build a **quote cart** (not a checkout), send an enquiry, and the owner manages everything in `/admin`.

Built with Node + Express + EJS. Pages are server-rendered for SEO, data lives in a JSON file and there is no build step. Visual design follows the tokens in `DESIGN.md`.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. The admin is at http://localhost:3000/admin. The password is `ADMIN_PASSWORD` in `.env`; if it isn't set, a temporary password is printed in the console on each start.

## Make it yours

| What | Where |
|---|---|
| Brand name, city, phone, WhatsApp, emails, address, hours, FSSAI/GSTIN | `.env` (see `.env.example`) or `src/config.js` |
| Delivery zones, areas, charges, minimum order, time slots | `src/config.js` |
| Testimonials, client names, FAQs, event packages, gallery, SEO landing pages | `src/content.js` (client names and testimonials are placeholders) |
| Starting catalogue | `src/seed.js`, loaded on first run. After that, edit products in `/admin` |

Changing `CITY` also renames the SEO landing pages (e.g. `/bulk-ice-cream-supplier-pune`).

## Features

- **Pages:** Home, Catalogue (filters for category, type, flavour, pack size and dietary), Product detail (tier pricing, size picker, quantity stepper), Quote cart, Custom packaging (with logo upload), Events (packages and guest calculator), About, Delivery (area checker), FAQ, Contact, Business registration.
- **Quote cart:** stored in the browser (`localStorage`), so items persist while browsing. It shows live tier pricing and a "next price break" hint, warns about MOQ and minimum order value, remembers the customer's details, and has a one-click "repeat my last order".
- **Server-side pricing:** totals are always recalculated from the catalogue, so a browser can't change prices.
- **Admin:** dashboard (status counts, pipeline value, upcoming deliveries, low stock, pending accounts), quotes with the New → Quoted → Confirmed → Delivered (or Cancelled) workflow plus quoted amount, notes and history, product editor (sizes, MOQ, tier prices, stock, illustration), quick stock updates, business-account approval, and contact messages.
- **Email to the owner** for every quote, custom-packaging enquiry, registration and contact message. Set the `SMTP_*` variables to send real email; without them, emails are saved to `data/outbox/*.eml`.
- **SEO:** per-page titles, descriptions, canonical URLs and Open Graph tags; JSON-LD (WholesaleStore, Product, FAQPage); `sitemap.xml` and `robots.txt`. Landing pages:
  - `/bulk-ice-cream-supplier-<city>`
  - `/ice-blocks-wholesale-<city>`
  - `/custom-ice-cream-cups-with-logo`
- **Spam protection:** a honeypot field and per-IP rate limiting on all forms. The admin login is also rate-limited.

## Images

Product and gallery images are generated SVG illustrations (`src/art.js`), served at `/art/...`. To use real photos, put them in `public/img/` and change `artUrl()` in `src/helpers.js` (and the `<img>` tags in `views/about.ejs` and the custom-packaging gallery) to point at them.

## Data & deployment

- All data is in `data/db.json`. Uploaded logos are in `data/uploads/`. Back up the `data/` folder.
- `npm run reset-data` wipes quotes, accounts and messages and restores the seed catalogue. Stop the server first.
- For production, set `NODE_ENV=production`, `SITE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET` and SMTP, and run behind HTTPS (for example nginx or Caddy) with a persistent disk for `data/`.
- The JSON store suits a single server. If you outgrow it, re-implement the few functions in `src/db.js` against Postgres or SQLite.
