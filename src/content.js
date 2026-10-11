// Marketing copy and static content. Client names and testimonials are placeholders —
// replace with real ones (with permission) before launch.
const config = require('./config');

const categories = [
  { id: 'ice-cream', name: 'Ice Creams', blurb: 'Tubs, cups, cones, sticks, kulfi, sundaes & family packs', art: { shape: 'tub', color: '#F4A3B4', label: '4L' } },
  { id: 'custom', name: 'Custom Packaging', blurb: 'Your logo on cups & tubs, wedding packs, gift boxes', art: { shape: 'branded', color: '#F7B2C4', label: 'YOUR' } },
  { id: 'ice', name: 'Ice Blocks & Ice', blurb: 'Blocks, cubes, crushed ice and food-grade dry ice', art: { shape: 'block' } },
  { id: 'addons', name: 'Add-ons & Rentals', blurb: 'Freezer rental, serving counters, insulated delivery', art: { shape: 'freezer' } },
];

const formats = {
  tub: 'Tubs', cup: 'Cups', cone: 'Cones', stick: 'Sticks & bars', kulfi: 'Kulfi', sundae: 'Sundaes',
  'family-pack': 'Family packs', branded: 'Branded packs', 'gift-box': 'Gift boxes', block: 'Ice blocks',
  cube: 'Ice cubes', crushed: 'Crushed ice', 'dry-ice': 'Dry ice', service: 'Services & rentals',
};

const dietary = { vegan: 'Vegan', 'sugar-free': 'Sugar-free', eggless: 'Eggless' };

const clients = ['Grand Orchid Hotels', 'Spice Route Caterers', 'Mehfil Weddings', 'Brew & Bean Café', 'UrbanFresh Mart', 'Nova Tech Park', 'Biryani House', 'Lakeview Resorts'];

const testimonials = [
  { quote: 'We serve 2,000 guests on a big wedding day. The cups arrive rock-hard frozen, on time, every time — and the freezer is already running when our team gets to the venue.', name: 'Ravi K.', role: 'Owner, Spice Route Caterers' },
  { quote: 'The kesar and pista tubs replaced our in-house dessert prep. Tier pricing at 50+ cartons made it cheaper than making it ourselves.', name: 'Anjali M.', role: 'F&B Manager, Grand Orchid Hotels' },
  { quote: 'Our logo cups for the Diwali gifting run came out beautifully. Proof in two days, delivered to five offices in one morning.', name: 'Sameer T.', role: 'HR Lead, Nova Tech Park' },
];

const steps = [
  { title: 'Choose', text: 'Browse the catalogue, pick flavours and pack sizes, and add them to your quote. Not sure how much? Use the guest calculator.' },
  { title: 'Get quote', text: 'Send your list with date and venue. We confirm stock, delivery slot and final price within 2 business hours — no payment online.' },
  { title: 'Delivered frozen', text: 'Our −18°C reefer vans deliver to your kitchen, store or venue in your chosen slot, with freezers set up if you need them.' },
];

const coldChain = [
  { title: 'Made fresh', text: 'Pasteurised, homogenised and aged in our FSSAI-licensed plant.' },
  { title: 'Blast-frozen at −35°C', text: 'Locks in a smooth texture with small ice crystals.' },
  { title: 'Stored at −22°C', text: 'Monitored cold rooms with 24×7 temperature logging and backup power.' },
  { title: 'Reefer vans at −18°C', text: 'GPS-tracked refrigerated vans with data loggers on every trip.' },
  { title: 'Handed over frozen', text: 'Probe-checked at your door. If it is not frozen, we replace it.' },
];

const gallery = [
  { title: 'Wedding sleeves — “A ♥ R”', caption: '1,200 cups, kesar & mango', art: { shape: 'branded', color: '#F7B2C4', label: 'A ♥ R' } },
  { title: 'Hotel in-room dessert', caption: '125ml logo cups, 3 flavours', art: { shape: 'branded', color: '#E3A857', label: 'ORCHID' } },
  { title: 'Diwali corporate gifting', caption: '600 insulated gift boxes', art: { shape: 'giftBox', color: '#F2B66D' } },
  { title: 'Café private label', caption: '500ml tubs, own brand', art: { shape: 'tub', color: '#D9D3CA', label: 'BREW&BEAN' } },
  { title: 'Tech-park family day', caption: '2,400 cups with event theme', art: { shape: 'branded', color: '#9AD6F2', label: 'NOVA' } },
  { title: 'Birthday party pack', caption: 'Name sleeves, strawberry cups', art: { shape: 'branded', color: '#F4A3B4', label: 'AARAV 5' } },
];

const eventPackages = [
  {
    id: 'wedding', name: 'Weddings', from: 38, perGuest: 1.5, format: 'cup100',
    includes: ['2–4 flavours of cups or tubs + kulfi', 'Name / monogram sleeves (optional)', 'Chest freezer pre-cooled at venue', 'Serving counter with uniformed staff'],
  },
  {
    id: 'birthday', name: 'Birthdays', from: 28, perGuest: 1, format: 'cup100',
    includes: ['Cups, cones or sticks for kids', 'Theme sleeves with the child’s name', 'Dry ice to keep it frozen for 6 hours', 'Scoops & spoons kit'],
  },
  {
    id: 'corporate', name: 'Corporate events', from: 32, perGuest: 1, format: 'cup125',
    includes: ['Logo cups or gift boxes', 'Multi-office delivery in one morning', 'GST invoice & 15-day credit for registered accounts', 'Sugar-free and vegan options'],
  },
  {
    id: 'festival', name: 'Festivals & melas', from: 22, perGuest: 1.5, format: 'stick',
    includes: ['Bulk sticks, kulfi and cones', 'Ice blocks & crushed ice for stalls', 'Multiple freezers on rental', 'Restock runs during the event'],
  },
];

// Serving options for the guest calculator. productId/sizeId refer to catalogue items.
const servingFormats = [
  { id: 'cup100', label: '100ml cups', productId: 'ice-cream-cups', sizeId: '100ml', perUnit: 1 },
  { id: 'cup125', label: '125ml cups', productId: 'ice-cream-cups', sizeId: '125ml', perUnit: 1 },
  { id: 'tub4l', label: 'Scoops from 4L tubs (≈ 50 scoops per tub)', productId: 'classic-tubs', sizeId: '4l', perUnit: 50 },
  { id: 'kulfi', label: 'Malai kulfi sticks', productId: 'malai-kulfi-sticks', sizeId: '60ml', perUnit: 1 },
  { id: 'cone', label: 'Cones', productId: 'ice-cream-cones', sizeId: '110ml', perUnit: 1 },
  { id: 'stick', label: 'Stick bars', productId: 'stick-bars', sizeId: '60ml', perUnit: 1 },
];

const faqs = [
  {
    topic: 'Storage', items: [
      ['How should we store the ice cream after delivery?', 'Keep it at −18°C or colder in a deep freezer or chest freezer. A normal fridge freezer compartment (−6 to −12°C) is fine for a few hours but will soften the texture overnight. Do not refreeze ice cream that has melted.'],
      ['How much freezer space do I need?', 'Roughly: a 200 L chest freezer holds about 25 cartons of 100ml cups or 30 × 4L tubs. If you are short on space, rent a freezer from us — it arrives pre-cooled.'],
      ['What is the shelf life?', 'Most ice creams have a 9–12 month shelf life when stored frozen. Ice blocks and ice cubes are best used within 24 hours of delivery.'],
    ],
  },
  {
    topic: 'Melting & transport', items: [
      ['How do you keep it frozen during delivery?', 'All ice cream travels in −18°C refrigerated vans with temperature loggers. For outdoor venues without power we add dry ice in insulated boxes, which keeps product frozen for 6–8 hours.'],
      ['Can we pick up the order ourselves?', 'Yes, from our cold store. Bring insulated boxes or we can sell you dry ice. We recommend reaching your freezer within 45 minutes.'],
      ['What if the product arrives soft?', 'Our driver probe-checks temperature at handover. If anything is not frozen, refuse it on the spot and we replace it free of charge.'],
    ],
  },
  {
    topic: 'Ordering & advance notice', items: [
      ['How much notice do you need?', `Standard catalogue items: ${config.advanceNoticeHours} hours (same day in Zone A if ordered by 11 AM). Events with freezers or counters: 48–72 hours. Custom logo cups: 10–14 working days after artwork approval.`],
      ['Is there a minimum order?', `Yes — ₹${config.minOrderValue.toLocaleString('en-IN')} per delivery, and each product has a minimum order quantity (MOQ) shown on its card.`],
      ['Can I mix flavours in one carton?', 'For 4L and 5L tubs, yes. For cups, cones and sticks you can mix flavours across cartons, and we can pack mixed cartons for orders above 50 cartons.'],
    ],
  },
  {
    topic: 'Cancellation & changes', items: [
      ['Can I cancel or change an order?', 'Free changes or cancellation up to 24 hours before delivery. Within 24 hours, a 25% charge applies on catalogue items. Custom-printed packaging cannot be cancelled once printing starts.'],
      ['What if my event guest count changes?', 'Tell us up to 24 hours before — we will adjust quantities. On the day, our van can usually bring top-ups within Zone A.'],
    ],
  },
  {
    topic: 'Payment terms', items: [
      ['Do I pay online?', 'No. You submit a quote request; we confirm the price and send a proforma invoice. Pay by UPI, bank transfer (NEFT/RTGS) or cheque.'],
      ['What are the payment terms?', 'First orders and events: 50% advance, balance on delivery. Registered business accounts with GSTIN can apply for 7–15 day credit after three orders.'],
      ['Do you provide GST invoices?', 'Yes, every order gets a GST invoice. Add your GSTIN to your quote or register a business account to claim input tax credit.'],
    ],
  },
];

// SEO landing pages targeting local search terms.
const landings = {
  [`bulk-ice-cream-supplier-${config.citySlug}`]: {
    title: `Bulk Ice Cream Supplier in ${config.city} | Wholesale Tubs, Cups & Kulfi`,
    h1: `Bulk ice cream supplier in ${config.city}`,
    description: `Wholesale ice cream tubs, cups, cones, kulfi and family packs delivered frozen across ${config.city}. Tier pricing for restaurants, hotels, caterers and events. Request a quote.`,
    intro: `${config.brand} supplies restaurants, hotels, caterers, cafés and event planners across ${config.city} with ice cream by the carton — delivered at −18°C in our own reefer vans.`,
    category: 'ice-cream',
    points: ['Tier pricing from 5 cartons', 'Same-day delivery in core city areas', 'Eggless, sugar-free and vegan ranges', 'GST invoices and credit for registered businesses'],
  },
  [`ice-blocks-wholesale-${config.citySlug}`]: {
    title: `Ice Blocks Wholesale in ${config.city} | Ice Cubes, Crushed & Dry Ice`,
    h1: `Ice blocks wholesale in ${config.city}`,
    description: `5, 10, 25 and 50 kg ice blocks, food-grade ice cubes, crushed ice and dry ice delivered across ${config.city} from 6 AM. Bulk pricing for caterers, fish markets and events.`,
    intro: `Clear, dense ice blocks and food-grade cubes made from RO-purified water — delivered early morning to kitchens, fish counters, bars and event venues across ${config.city}.`,
    category: 'ice',
    points: ['Blocks from 5 kg to 50 kg', 'Food-grade cubes for bars & beverages', 'Food-grade dry ice for transport & fog effects', 'Delivery from 6 AM'],
  },
  'custom-ice-cream-cups-with-logo': {
    title: 'Custom Ice Cream Cups with Logo | Branded & Wedding Ice Cream Cups',
    h1: 'Custom ice cream cups with your logo',
    description: `Branded ice cream cups and tubs with your logo, wedding name sleeves and corporate gift boxes. Free digital proof, MOQ from 480 cups, delivered frozen in ${config.city}.`,
    intro: 'Serve dessert under your own name. We print your logo on cups and lids, or wrap cups in personalised sleeves for weddings and parties.',
    category: 'custom',
    points: ['Free digital proof in 48 hours', 'Wedding sleeves from 480 cups', 'Logo-printed cups from ~2,000 cups', 'Corporate gift boxes that arrive frozen'],
  },
};

module.exports = { categories, formats, dietary, clients, testimonials, steps, coldChain, gallery, eventPackages, servingFormats, faqs, landings };
