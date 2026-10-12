# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Business buyers ordering ice cream, ice and event services in bulk, never single items:

- **Restaurants, hotels, cafés and retail shops** restocking their freezers on a regular cycle. They know their usual products and want pack sizes, carton quantities, minimum orders and price tiers at a glance.
- **Caterers, event planners and wedding organisers** sourcing for a specific date and guest count. They often don't know how much to order and need ice cream, freezers, serving staff and delivery to arrive together and on time.
- **Offices and corporate buyers** ordering for events or gifting, often in branded packaging.

Most visitors arrive on a phone and want to hand off to a person quickly, by WhatsApp or phone.

## Product Purpose

A wholesale storefront that takes bulk orders through a cart, with no online payment. The buyer fills a cart, picks the exact delivery spot on a map (required; it sets the delivery zone, charge and minimum), a date and slot, and places the order. The site shows a firm total: tier-priced subtotal plus the zone delivery charge plus 18% GST, which the server recomputes. A person at the supplier confirms stock and the slot, and the buyer pays on confirmation (UPI, bank transfer or cash on delivery).

Success means a placed order with quantities, an exact map pin, a date and a firm total, arriving by email to the owner and in the admin dashboard. (Changed on 2026-10-12 from quote requests to a cart, at the owner's request.)

## Positioning

**Full-service events.** The supplier delivers the whole event setup, not just cartons: ice cream sized to the guest count, freezers pre-cooled at the venue, staffed serving counters, and dry ice for venues without power. A plain distributor can't truthfully claim this.

The cold chain, custom packaging and tier pricing support this, but events are the lead claim.

## Operating Context

- **The order flow:** browse the catalogue → add to cart (it persists in the browser) → pick the exact delivery spot on the map, date and slot → place the order with a firm total → the owner confirms by phone or WhatsApp within business hours, and the buyer pays on confirmation.
- **The event guest calculator** turns guests × servings per guest plus a buffer into cartons, an estimated cost and suggested add-ons (freezer, dry ice, serving counter).
- **Repeat buyers** can register a business account with a GSTIN, and are linked to their quotes by GSTIN or phone.
- **The owner** works the quote pipeline in `/admin`: New → Quoted → Confirmed → Delivered (or Cancelled). They also manage products, tier prices and stock there.
- **Regional context:** India. The cold store is in Hyderabad; delivery covers all of Telangana and Andhra Pradesh (Hyderabad zones same/next day, regional reefer routes in 1–2 days, higher per-drop minimums outside Hyderabad). Prices are in INR and exclude GST; an FSSAI food-safety licence is expected; WhatsApp is the main channel.

## Capabilities and Constraints

- **Stack:** Node + Express + EJS, server-rendered for SEO, with a JSON file store and no build step. Business settings are in `src/config.js` and `.env`, content in `src/content.js`, and the seed catalogue in `src/seed.js`.
- **Catalogue:** 25 product lines in four categories: ice creams, custom and private-label packaging, ice blocks and ice, and add-ons and rentals. Each product has pack sizes, units per carton, a minimum order (MOQ), stock and three price tiers.
- **Required on every page:** a floating "Get Bulk Quote" button and a WhatsApp click-to-chat button.
- **SEO landing pages** target "bulk ice cream supplier [city]", "ice blocks wholesale [city]" and "custom ice cream cups with logo".
- **Terminology:** cart, order and "place order"; never "checkout" or "pay now", because payment is offline. Also carton, MOQ, tier, pack size, cold chain, delivery spot.

## Brand Commitments

This is a **demo / portfolio project**, not a live business.

- "ChillCrate", Hyderabad and all contact details are placeholders.
- The current visual system came from `DESIGN.md`, an analysis of Airbnb's design used as a reference. It is not a brand the product owns.
- No voice or identity has been committed beyond a plain, trustworthy B2B tone.

## Evidence on Hand

None of the following is real yet, so future work must not present any of it as real:

- **Imagery:** product and facility images are generated SVG illustrations (`src/art.js`). There are no real photos.
- **Testimonials and client names** in `src/content.js` are invented placeholders.
- **The trust stats** (orders delivered, clients, cities) in `src/config.js` are placeholders.
- **The FSSAI licence and GSTIN numbers** are placeholders.

Any new testimonial, client, statistic, certification or photo must be labelled as illustrative.

## Product Principles

1. **Get to a person fast.** Every page leads to a quote or a WhatsApp conversation. Never a dead end, never online payment.
2. **Answer the bulk buyer's questions up front.** Pack size, units per carton, MOQ, tier price, lead time and storage are visible before anyone has to ask.
3. **Size the event for them.** Turn a guest count into a confident order, including the freezer, staff and delivery logistics.
4. **Frozen on arrival is the promise.** Cold-chain handling, delivery slots and storage guidance are part of the product, not footnotes.
5. **Honest demo content.** Placeholder proof stays clearly placeholder.

## Accessibility & Inclusion

No product-specific requirement has been established beyond meeting WCAG 2.1 AA. Phone-first use matters: comfortable touch targets, and readable text outdoors at event venues.
