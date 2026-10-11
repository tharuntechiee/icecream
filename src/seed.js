// Initial catalogue. Loaded into data/db.json on first run; after that, edit products in /admin.
const tiers = (base, moq = 10, breaks = [50, 200], steps = [0.95, 0.9]) => [
  { min: moq, price: base },
  ...breaks.map((b, i) => ({ min: b, price: Math.round(base * steps[i]) })),
];

const size = (id, label, packSize, unit, contains, unitsPerCarton, moq, stock, base, breaks, steps) => ({
  id, label, packSize, unit, contains, unitsPerCarton, moq, stock, tiers: tiers(base, moq, breaks, steps),
});

const ICE_CREAM_STORAGE = '−18°C or colder';
const ICE_CREAM_SHELF = '12 months from manufacture (frozen)';

const products = [
  // ---------- Ice creams ----------
  {
    id: 'classic-tubs', name: 'Classic Ice Cream Tubs', category: 'ice-cream', format: 'tub',
    flavours: ['Vanilla', 'Chocolate', 'Strawberry', 'Butterscotch', 'Black Currant'], dietary: ['eggless'],
    description: 'Our best-selling scooping tubs for restaurants, buffets and banquet desserts. Smooth, slow-melt base made with fresh milk and real cream.',
    highlights: ['~50 scoops per 4L tub', 'Slow-melt buffet formula', 'Mix flavours within a carton (4L & 5L)'],
    shelfLife: ICE_CREAM_SHELF, storageTemp: ICE_CREAM_STORAGE, leadTime: 'Same / next day',
    sizes: [
      size('1l', '1L tub', '1L', 'carton', '12 × 1L tubs', 12, 5, 420, 1920, [50, 200]),
      size('4l', '4L tub', '4L', 'carton', '4 × 4L tubs', 4, 5, 380, 2400, [50, 200]),
      size('5l', '5L tub', '5L', 'carton', '4 × 5L tubs', 4, 5, 160, 2880, [50, 200]),
    ],
    art: { shape: 'tub', color: '#F5E6B8', label: 'CLASSIC' }, featured: true, active: true,
  },
  {
    id: 'premium-indian-tubs', name: 'Premium Indian Flavour Tubs', category: 'ice-cream', format: 'tub',
    flavours: ['Mango', 'Pista', 'Kesar'], dietary: ['eggless'],
    description: 'Alphonso mango pulp, Iranian pistachio and real saffron. The tubs wedding caterers ask for by name.',
    highlights: ['Real fruit & nut inclusions', 'Saffron from Pampore', 'Pairs with hot gulab jamun'],
    shelfLife: ICE_CREAM_SHELF, storageTemp: ICE_CREAM_STORAGE, leadTime: 'Same / next day',
    sizes: [
      size('1l', '1L tub', '1L', 'carton', '12 × 1L tubs', 12, 5, 260, 2520, [50, 200]),
      size('4l', '4L tub', '4L', 'carton', '4 × 4L tubs', 4, 5, 210, 3200, [50, 200]),
      size('5l', '5L tub', '5L', 'carton', '4 × 5L tubs', 4, 5, 90, 3840, [50, 200]),
    ],
    art: { shape: 'tub', color: '#FFB627', label: 'PREMIUM' }, featured: true, active: true,
  },
  {
    id: 'ice-cream-cups', name: 'Ice Cream Cups', category: 'ice-cream', format: 'cup',
    flavours: ['Vanilla', 'Chocolate', 'Strawberry', 'Butterscotch', 'Mango'], dietary: ['eggless'],
    description: 'Individually sealed cups with wooden spoon. Zero scooping, zero wastage — ideal for weddings, schools and office parties.',
    highlights: ['Wooden spoon in every lid', 'Tamper-evident seal', 'Mixed-flavour cartons available'],
    shelfLife: ICE_CREAM_SHELF, storageTemp: ICE_CREAM_STORAGE, leadTime: 'Same / next day',
    sizes: [
      size('100ml', '100ml cup', '100ml', 'carton', '48 × 100ml cups', 48, 10, 900, 1150),
      size('125ml', '125ml cup', '125ml', 'carton', '36 × 125ml cups', 36, 10, 640, 1050),
    ],
    art: { shape: 'cup', color: '#F4A3B4', label: '100ml' }, featured: true, active: true,
  },
  {
    id: 'kesar-pista-cups', name: 'Kesar & Pista Cups', category: 'ice-cream', format: 'cup',
    flavours: ['Kesar', 'Pista', 'Kesar Pista'], dietary: ['eggless'],
    description: 'Rich, festive cups made with saffron and pistachio — a premium upgrade for weddings and festive gifting.',
    highlights: ['Premium gold-foil lid', 'Real saffron strands', 'Festive favourite'],
    shelfLife: ICE_CREAM_SHELF, storageTemp: ICE_CREAM_STORAGE, leadTime: 'Next day',
    sizes: [size('100ml', '100ml cup', '100ml', 'carton', '48 × 100ml cups', 48, 10, 300, 1450)],
    art: { shape: 'cup', color: '#F2B66D', label: 'KESAR' }, active: true,
  },
  {
    id: 'ice-cream-cones', name: 'Ice Cream Cones', category: 'ice-cream', format: 'cone',
    flavours: ['Chocolate', 'Butterscotch', 'Vanilla', 'Strawberry'], dietary: ['eggless'],
    description: 'Crisp wafer cones with chocolate-lined tips so they stay crunchy. Kids-party and carnival favourite.',
    highlights: ['Choco-lined crisp wafer', 'Individually wrapped', 'Great for kids’ events'],
    shelfLife: '9 months (frozen)', storageTemp: ICE_CREAM_STORAGE, leadTime: 'Same / next day',
    sizes: [size('110ml', '110ml cone', '110ml', 'carton', '24 × 110ml cones', 24, 10, 380, 960)],
    art: { shape: 'cone', color: '#7A4A2A' }, featured: true, active: true,
  },
  {
    id: 'stick-bars', name: 'Stick Bars & Choco Bars', category: 'ice-cream', format: 'stick',
    flavours: ['Chocolate', 'Orange', 'Mango', 'Vanilla'], dietary: ['eggless'],
    description: 'Classic choco bars and fruity ice-candy sticks. Low cost per serving for large crowds and retail freezers.',
    highlights: ['Lowest cost per serving', 'Retail-ready wrappers with MRP', 'Fruit sticks are dairy-light'],
    shelfLife: '9 months (frozen)', storageTemp: ICE_CREAM_STORAGE, leadTime: 'Same / next day',
    sizes: [size('60ml', '60ml stick', '60ml', 'carton', '40 × 60ml sticks', 40, 10, 520, 800)],
    art: { shape: 'stick', color: '#FF9A3C' }, active: true,
  },
  {
    id: 'malai-kulfi-sticks', name: 'Malai Kulfi Sticks', category: 'ice-cream', format: 'kulfi',
    flavours: ['Malai', 'Kesar Pista', 'Mango'], dietary: ['eggless'],
    description: 'Slow-reduced milk kulfi, dense and creamy, the way it is made at the best kulfi wallahs.',
    highlights: ['Slow-reduced full-cream milk', 'No air whipped in', 'Wedding dessert staple'],
    shelfLife: '9 months (frozen)', storageTemp: ICE_CREAM_STORAGE, leadTime: 'Next day',
    sizes: [size('60ml', '60ml kulfi', '60ml', 'carton', '40 × 60ml kulfi', 40, 10, 410, 1100)],
    art: { shape: 'kulfi', color: '#FFF3D1' }, featured: true, active: true,
  },
  {
    id: 'matka-kulfi', name: 'Matka Kulfi', category: 'ice-cream', format: 'kulfi',
    flavours: ['Malai', 'Kesar Pista', 'Rose'], dietary: ['eggless'],
    description: 'Kulfi set in individual clay matkas — a show-stopper on any wedding dessert counter.',
    highlights: ['Hand-thrown clay pots', 'Earthy aroma, slow melt', 'Guests keep the matka'],
    shelfLife: '6 months (frozen)', storageTemp: ICE_CREAM_STORAGE, leadTime: '48 hours',
    sizes: [size('100ml', '100ml matka', '100ml', 'carton', '24 × 100ml matkas', 24, 10, 140, 1320)],
    art: { shape: 'matka', color: '#FFF3D1' }, active: true,
  },
  {
    id: 'sundae-cups', name: 'Sundae Cups', category: 'ice-cream', format: 'sundae',
    flavours: ['Chocolate Fudge', 'Strawberry', 'Butterscotch'], dietary: ['eggless'],
    description: 'Layered sundaes with sauce and nut crunch in a clear dome cup. Restaurant-style dessert without a pastry chef.',
    highlights: ['Sauce + crunch layers', 'Clear dome lid', 'Plated-dessert look'],
    shelfLife: '9 months (frozen)', storageTemp: ICE_CREAM_STORAGE, leadTime: 'Next day',
    sizes: [size('150ml', '150ml sundae', '150ml', 'carton', '24 × 150ml sundaes', 24, 10, 220, 1200)],
    art: { shape: 'sundae', color: '#F4A3B4' }, active: true,
  },
  {
    id: 'family-packs', name: 'Family Packs', category: 'ice-cream', format: 'family-pack',
    flavours: ['Vanilla', 'Chocolate', 'Butterscotch', 'Strawberry', 'Cookies & Cream'], dietary: ['eggless'],
    description: 'Retail-ready bricks and packs with printed MRP and barcodes for supermarkets, kirana stores and cafés.',
    highlights: ['Printed MRP & barcode', 'Retail margin built in', 'Planogram support for stores'],
    shelfLife: ICE_CREAM_SHELF, storageTemp: ICE_CREAM_STORAGE, leadTime: 'Same / next day',
    sizes: [
      size('700ml', '700ml pack', '700ml', 'carton', '12 × 700ml packs', 12, 5, 300, 1560, [50, 200]),
      size('1l', '1L pack', '1L', 'carton', '8 × 1L packs', 8, 5, 240, 1440, [50, 200]),
    ],
    art: { shape: 'familyPack', color: '#A9C77F', label: 'FAMILY PACK' }, active: true,
  },
  {
    id: 'sugar-free-tubs', name: 'Sugar-Free Tubs', category: 'ice-cream', format: 'tub',
    flavours: ['Vanilla', 'Chocolate', 'Butterscotch'], dietary: ['sugar-free', 'eggless'],
    description: 'Sweetened with stevia and erythritol, no added sugar. For hospitals, senior-living, wellness cafés and health-conscious menus.',
    highlights: ['No added sugar', 'Stevia + erythritol', 'Same creamy texture'],
    shelfLife: ICE_CREAM_SHELF, storageTemp: ICE_CREAM_STORAGE, leadTime: 'Next day',
    sizes: [
      size('1l', '1L tub', '1L', 'carton', '12 × 1L tubs', 12, 5, 120, 2520, [50, 200]),
      size('4l', '4L tub', '4L', 'carton', '4 × 4L tubs', 4, 5, 80, 3000, [50, 200]),
    ],
    art: { shape: 'tub', color: '#E3A857', label: 'SUGAR-FREE' }, active: true,
  },
  {
    id: 'vegan-coconut-range', name: 'Vegan Coconut-Milk Range', category: 'ice-cream', format: 'cup',
    flavours: ['Chocolate', 'Mango', 'Tender Coconut'], dietary: ['vegan', 'eggless'],
    description: '100% plant-based, made with coconut milk and cocoa butter. No dairy, no eggs — and you would not know it.',
    highlights: ['Dairy-free & egg-free', 'Made on a dedicated line', 'Jain-friendly options'],
    shelfLife: '9 months (frozen)', storageTemp: ICE_CREAM_STORAGE, leadTime: 'Next day',
    sizes: [
      size('100ml', '100ml cup', '100ml', 'carton', '48 × 100ml cups', 48, 5, 150, 1920, [50, 200]),
      size('1l', '1L tub', '1L', 'carton', '12 × 1L tubs', 12, 5, 70, 3000, [50, 200]),
    ],
    art: { shape: 'cup', color: '#EFEADF', label: 'VEGAN' }, featured: true, active: true,
  },
  {
    id: 'seasonal-specials', name: 'Seasonal Specials', category: 'ice-cream', format: 'tub',
    flavours: ['Sitaphal', 'Alphonso Mango', 'Tender Coconut'], dietary: ['eggless'],
    description: 'Small-batch flavours made only when the fruit is at its best. Sitaphal (Sep–Dec), Alphonso (Apr–Jun), tender coconut (year-round).',
    highlights: ['Limited seasonal batches', 'Fresh fruit, not essence', 'Pre-book for events'],
    shelfLife: '9 months (frozen)', storageTemp: ICE_CREAM_STORAGE, leadTime: '48 hours',
    sizes: [
      size('1l', '1L tub', '1L', 'carton', '12 × 1L tubs', 12, 5, 90, 2760, [50, 200]),
      size('4l', '4L tub', '4L', 'carton', '4 × 4L tubs', 4, 5, 60, 3480, [50, 200]),
    ],
    art: { shape: 'tub', color: '#E9DFC4', label: 'SEASONAL' }, seasonal: true, active: true,
  },

  // ---------- Custom & private-label ----------
  {
    id: 'custom-logo-cups', name: 'Custom Logo Cups', category: 'custom', format: 'branded',
    flavours: ['Vanilla', 'Chocolate', 'Strawberry', 'Butterscotch', 'Mango', 'Pista', 'Kesar'], dietary: ['eggless'],
    description: 'Your logo printed on the cup and lid. Hotels, airlines, cafés and brands use these to serve dessert under their own name.',
    highlights: ['Full-colour offset print on cup + lid', 'Free digital proof in 48 h', 'MOQ ≈ 2,000 cups'],
    shelfLife: ICE_CREAM_SHELF, storageTemp: ICE_CREAM_STORAGE, leadTime: '10–14 working days after artwork approval',
    sizes: [
      size('100ml', '100ml branded cup', '100ml', 'carton', '48 × 100ml cups', 48, 42, 0, 1440, [100, 300]),
      size('125ml', '125ml branded cup', '125ml', 'carton', '36 × 125ml cups', 36, 56, 0, 1330, [100, 300]),
    ],
    art: { shape: 'branded', color: '#F4A3B4', label: 'YOUR' }, featured: true, active: true,
  },
  {
    id: 'private-label-tubs', name: 'Private-Label Tubs', category: 'custom', format: 'branded',
    flavours: ['Vanilla', 'Chocolate', 'Butterscotch', 'Mango', 'Pista', 'Kesar'], dietary: ['eggless'],
    description: 'Launch your own ice cream brand. We manufacture, fill and label tubs under your brand with FSSAI-compliant labelling.',
    highlights: ['Your brand, our FSSAI-licensed plant', 'Label compliance support', 'Recipe customisation from 1,000 L'],
    shelfLife: ICE_CREAM_SHELF, storageTemp: ICE_CREAM_STORAGE, leadTime: '15–20 working days',
    sizes: [
      size('500ml', '500ml tub', '500ml', 'carton', '24 × 500ml tubs', 24, 40, 0, 2400, [100, 300]),
      size('1l', '1L tub', '1L', 'carton', '12 × 1L tubs', 12, 84, 0, 2160, [150, 400]),
    ],
    art: { shape: 'tub', color: '#D9D3CA', label: 'YOUR BRAND' }, active: true,
  },
  {
    id: 'wedding-event-packs', name: 'Wedding & Event Packs', category: 'custom', format: 'branded',
    flavours: ['Vanilla', 'Chocolate', 'Strawberry', 'Butterscotch', 'Mango', 'Pista', 'Kesar'], dietary: ['eggless'],
    description: 'Cups wrapped in printed sleeves with the couple’s names, monogram or event theme. Low MOQ because we print sleeves, not cups.',
    highlights: ['Names / monogram / theme sleeves', 'MOQ only 480 cups', 'Ready in 5–7 days'],
    shelfLife: ICE_CREAM_SHELF, storageTemp: ICE_CREAM_STORAGE, leadTime: '5–7 working days',
    sizes: [size('100ml', '100ml sleeved cup', '100ml', 'carton', '48 × 100ml cups + sleeves', 48, 10, 0, 1680)],
    art: { shape: 'branded', color: '#F7B2C4', label: 'A ♥ R' }, featured: true, active: true,
  },
  {
    id: 'corporate-gift-boxes', name: 'Corporate Gift Boxes', category: 'custom', format: 'gift-box',
    flavours: ['Kesar', 'Pista', 'Chocolate', 'Mango'], dietary: ['eggless'],
    description: 'A branded insulated box with four premium cups and a dry-ice pack. Diwali, client appreciation and onboarding gifts that arrive frozen.',
    highlights: ['4 premium cups per box', 'Insulated + dry ice, 6 h hold', 'Your logo on the sleeve'],
    shelfLife: 'Consume within 6 hours of delivery (or store frozen)', storageTemp: ICE_CREAM_STORAGE, leadTime: '7–10 working days',
    sizes: [size('box', '4-cup gift box', 'Gift box', 'carton', '12 gift boxes', 12, 10, 0, 2880, [50, 150])],
    art: { shape: 'giftBox', color: '#F4A3B4' }, active: true,
  },

  // ---------- Ice ----------
  {
    id: 'ice-blocks', name: 'Ice Blocks', category: 'ice', format: 'block',
    flavours: [], dietary: [],
    description: 'Crystal-clear blocks from RO-purified water for fish counters, catering chillers, transport and events.',
    highlights: ['RO-purified water', 'Slow-melt dense blocks', 'Early-morning delivery from 6 AM'],
    shelfLife: 'Best used within 24 h of delivery', storageTemp: 'Keep shaded / insulated', leadTime: 'Same day (order by 11 AM)',
    sizes: [
      size('5kg', '5 kg block', '5kg', 'block', '1 × 5 kg block', 1, 20, 2000, 60, [50, 200]),
      size('10kg', '10 kg block', '10kg', 'block', '1 × 10 kg block', 1, 10, 1500, 110, [50, 200]),
      size('25kg', '25 kg block', '25kg', 'block', '1 × 25 kg block', 1, 10, 800, 250, [50, 200]),
      size('50kg', '50 kg block', '50kg', 'block', '1 × 50 kg block', 1, 5, 400, 450, [20, 50]),
    ],
    art: { shape: 'block' }, featured: true, active: true,
  },
  {
    id: 'party-ice-cubes', name: 'Party Ice Cubes', category: 'ice', format: 'cube',
    flavours: [], dietary: [],
    description: 'Food-grade bagged cubes for bars, beverages and buffets. Made from RO water in a closed, hands-free line.',
    highlights: ['Food-grade, bar-safe', 'Hands-free bagging', 'Clear, slow-melt cubes'],
    shelfLife: 'Best used within 24 h of delivery', storageTemp: 'Store frozen or in iceboxes', leadTime: 'Same day',
    sizes: [
      size('2kg', '2 kg bag', '2kg', 'bag', '1 × 2 kg bag', 1, 25, 1200, 40, [100, 300]),
      size('5kg', '5 kg bag', '5kg', 'bag', '1 × 5 kg bag', 1, 10, 900, 90, [50, 200]),
      size('10kg', '10 kg bag', '10kg', 'bag', '1 × 10 kg bag', 1, 10, 600, 160, [50, 200]),
    ],
    art: { shape: 'cubes' }, active: true,
  },
  {
    id: 'crushed-ice', name: 'Crushed Ice', category: 'ice', format: 'crushed',
    flavours: [], dietary: [],
    description: 'Finely crushed ice for seafood displays, juice counters, gola and cocktail stations.',
    highlights: ['Uniform fine crush', 'Display-grade for seafood', 'Food-grade bags'],
    shelfLife: 'Use within 12 h of delivery', storageTemp: 'Insulated boxes', leadTime: 'Same day',
    sizes: [
      size('5kg', '5 kg bag', '5kg', 'bag', '1 × 5 kg bag', 1, 10, 500, 100, [50, 200]),
      size('10kg', '10 kg bag', '10kg', 'bag', '1 × 10 kg bag', 1, 10, 400, 180, [50, 200]),
    ],
    art: { shape: 'crushed' }, active: true,
  },
  {
    id: 'dry-ice', name: 'Dry Ice', category: 'ice', format: 'dry-ice',
    flavours: [], dietary: [],
    description: 'Food-grade CO₂ pellets and slabs for keeping ice cream frozen in transit and for fog effects at weddings and stage shows.',
    highlights: ['Food-grade CO₂', 'Pellets or slabs', 'Handling gloves supplied'],
    shelfLife: 'Sublimates ~10% per day in an insulated box', storageTemp: 'Ventilated insulated box — never airtight', leadTime: 'Same / next day',
    sizes: [
      size('5kg', '5 kg box', '5kg', 'box', '5 kg pellets', 1, 2, 120, 650, [10, 40]),
      size('10kg', '10 kg box', '10kg', 'box', '10 kg pellets', 1, 2, 90, 1200, [10, 40]),
      size('25kg', '25 kg box', '25kg', 'box', '25 kg slab or pellets', 1, 1, 40, 2800, [5, 20]),
    ],
    art: { shape: 'dryIce' }, active: true,
  },

  // ---------- Add-ons ----------
  {
    id: 'insulated-delivery', name: 'Insulated Express Delivery', category: 'addons', format: 'service',
    flavours: [], dietary: [],
    description: 'A dedicated −18°C reefer van for your order, with a timed delivery window and live driver tracking.',
    highlights: ['Dedicated reefer van', '1-hour delivery window', 'Temperature log on request'],
    shelfLife: '—', storageTemp: '−18°C in transit', leadTime: 'Book 24 h ahead',
    sizes: [size('drop', 'Per drop', 'Service', 'trip', '1 dedicated drop', 1, 1, 30, 600, [5, 20], [0.85, 0.75])],
    art: { shape: 'van' }, active: true,
  },
  {
    id: 'chest-freezer-rental', name: 'Chest Freezer Rental', category: 'addons', format: 'service',
    flavours: [], dietary: [],
    description: 'Delivered, plugged in and pre-cooled at your venue before the ice cream arrives. Collected after the event.',
    highlights: ['Pre-cooled to −18°C on arrival', 'Delivery & pickup included', 'Generator-compatible'],
    shelfLife: '—', storageTemp: 'Holds −18 to −22°C', leadTime: 'Book 48 h ahead',
    sizes: [
      size('200l', '200 L freezer / day', 'Service', 'day', '200 L chest (≈ 25 cartons of cups)', 1, 1, 20, 900, [3, 10], [0.9, 0.8]),
      size('300l', '300 L freezer / day', 'Service', 'day', '300 L chest (≈ 40 cartons of cups)', 1, 1, 15, 1200, [3, 10], [0.9, 0.8]),
      size('500l', '500 L freezer / day', 'Service', 'day', '500 L chest (≈ 65 cartons of cups)', 1, 1, 8, 1800, [3, 10], [0.9, 0.8]),
    ],
    art: { shape: 'freezer' }, featured: true, active: true,
  },
  {
    id: 'serving-counter', name: 'Ice Cream Serving Counter', category: 'addons', format: 'service',
    flavours: [], dietary: [],
    description: 'A branded scoop counter with canopy, dipping wells and trained, uniformed servers for weddings and corporate events.',
    highlights: ['Uniformed, trained servers', 'Hygiene kit & gloves', 'Up to 5 hours of service'],
    shelfLife: '—', storageTemp: 'Built-in −18°C display well', leadTime: 'Book 72 h ahead',
    sizes: [
      size('1s', 'Counter + 1 server', 'Service', 'event', 'Counter, canopy, 1 server', 1, 1, 10, 3500, [3, 6], [0.92, 0.85]),
      size('2s', 'Counter + 2 servers', 'Service', 'event', 'Counter, canopy, 2 servers', 1, 1, 10, 5500, [3, 6], [0.92, 0.85]),
    ],
    art: { shape: 'counter', color: '#ff385c' }, active: true,
  },
  {
    id: 'scoops-cups-kit', name: 'Scoops, Cups & Spoons Kit', category: 'addons', format: 'service',
    flavours: [], dietary: [],
    description: 'Everything you need to serve from tubs: paper cups, wooden spoons, napkins and two stainless-steel scoops per kit.',
    highlights: ['Covers 100 guests per kit', 'Compostable cups & spoons', 'Steel scoops included'],
    shelfLife: '—', storageTemp: 'Room temperature', leadTime: 'Ships with your order',
    sizes: [size('kit', 'Kit for 100 guests', 'Kit', 'kit', '100 cups, 100 spoons, 2 scoops', 1, 1, 300, 450, [10, 50], [0.9, 0.8])],
    art: { shape: 'scoops', color: '#F4A3B4' }, active: true,
  },
];

module.exports = { products };
