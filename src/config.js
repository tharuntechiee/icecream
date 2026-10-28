// Site-wide business settings. Everything a new owner needs to change lives here
// (or can be overridden with environment variables in .env).
const env = process.env;

const brand = env.BRAND_NAME || 'ChillCrate';
const city = env.CITY || 'Hyderabad';
const country = env.COUNTRY || 'India';

const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

module.exports = {
  brand,
  legalName: env.LEGAL_NAME || `${brand} Frozen Foods Pvt. Ltd.`,
  tagline: 'Bulk ice cream & ice, delivered frozen',
  city,
  citySlug: slugify(city),
  country,
  siteUrl: (env.SITE_URL || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')).replace(/\/$/, ''),
  currency: { symbol: '₹', code: 'INR', locale: 'en-IN' },
  gstNote: 'Prices are per unit shown, exclusive of 18% GST and delivery.',

  // Contact
  phone: env.PHONE || '+91 98765 43210',
  whatsapp: env.WHATSAPP || '919876543210', // digits only, with country code
  email: env.PUBLIC_EMAIL || 'orders@chillcrate.example',
  ownerEmail: env.OWNER_EMAIL || 'owner@chillcrate.example',
  address: {
    line1: 'Plot 14, Cold Storage Lane, IDA Uppal',
    city,
    region: 'Telangana',
    postcode: '500039',
    country,
  },
  hours: [
    { days: 'Mon – Sat', time: '7:00 AM – 9:00 PM' },
    { days: 'Sunday', time: '8:00 AM – 2:00 PM (event deliveries only)' },
  ],

  // Compliance (replace with real numbers before going live)
  certifications: {
    fssai: env.FSSAI_LICENSE || '1XXXXXXXXXXXXX',
    gstin: env.GSTIN || '36XXXXXXXXXXXZX',
  },

  // Trust stats on the home page
  stats: [
    { value: '12,500+', label: 'Bulk orders delivered' },
    { value: '850+', label: 'Business clients' },
    { value: '6', label: 'Cities served' },
    { value: '-18°C', label: 'Cold chain, door to door' },
  ],

  // Ordering rules
  minOrderValue: 5000,
  advanceNoticeHours: 24,
  eventTypes: ['Wedding', 'Birthday / private party', 'Corporate event', 'Festival / puja', 'Restaurant / café restock', 'Hotel / banquet', 'Retail restock', 'Office pantry', 'Other'],
  businessTypes: ['Restaurant', 'Hotel / resort', 'Caterer', 'Event planner', 'Wedding organiser', 'Retail shop / supermarket', 'Café / bakery', 'Office / corporate', 'Other'],

  // Where we deliver: Hyderabad's city zones plus every region of Telangana and Andhra Pradesh.
  // Shown on /delivery (map, area checker, charges) and offered in the cart and invitation forms.
  // `ring` (km from the city centre) draws a Hyderabad zone on the map; `points` place regional cities.
  coldStore: { name: 'Cold store, IDA Uppal', lat: 17.4005, lng: 78.5596 },
  hyderabadCentre: { lat: 17.385, lng: 78.4867 },
  serviceZones: [
    {
      name: 'Hyderabad Zone A — Core city', state: 'Telangana', ring: 8,
      eta: 'Same day (order by 11 AM)', minOrder: 5000, charge: 350, freeAbove: 5000,
      chargeNote: 'Free above the minimum order, ₹350 below',
      areas: ['Banjara Hills', 'Jubilee Hills', 'Begumpet', 'Ameerpet', 'Somajiguda', 'Abids', 'Himayatnagar', 'Secunderabad', 'Tarnaka', 'Uppal'],
    },
    {
      name: 'Hyderabad Zone B — Greater city', state: 'Telangana', ring: 18,
      eta: 'Next day', minOrder: 5000, charge: 450, freeAbove: 25000,
      chargeNote: '₹450 per drop, free above ₹25,000',
      areas: ['Hitech City', 'Madhapur', 'Gachibowli', 'Kondapur', 'Kukatpally', 'Miyapur', 'LB Nagar', 'Dilsukhnagar', 'Kompally', 'Manikonda'],
    },
    {
      name: 'Hyderabad Zone C — Outskirts & venues', state: 'Telangana', ring: 32,
      eta: 'Next day, 48 h for events', minOrder: 5000, charge: 900, freeAbove: 60000,
      chargeNote: '₹900 per drop, free above ₹60,000',
      areas: ['Shamshabad', 'Shankarpally', 'Medchal', 'Ghatkesar', 'Patancheru', 'Moinabad', 'Chevella', 'Ibrahimpatnam'],
    },
    {
      name: 'Telangana — North', state: 'Telangana',
      eta: 'Next day', minOrder: 20000, charge: 1500, freeAbove: 40000,
      chargeNote: '₹1,500 per drop, free above ₹40,000',
      points: { Karimnagar: [18.4386, 79.1288], Nizamabad: [18.6725, 78.0941], Adilabad: [19.6641, 78.532], Mancherial: [18.8714, 79.4443], Jagtial: [18.7895, 78.912], Ramagundam: [18.755, 79.474], Siddipet: [18.1018, 78.852], Sangareddy: [17.6248, 78.0866] },
    },
    {
      name: 'Telangana — East & South', state: 'Telangana',
      eta: 'Next day', minOrder: 20000, charge: 1500, freeAbove: 40000,
      chargeNote: '₹1,500 per drop, free above ₹40,000',
      points: { Warangal: [17.9689, 79.5941], Hanumakonda: [18.0072, 79.5584], Khammam: [17.2473, 80.1514], Kothagudem: [17.55, 80.619], Nalgonda: [17.0575, 79.2684], Suryapet: [17.1405, 79.6236], Mahbubnagar: [16.7488, 77.9855] },
    },
    {
      name: 'Andhra — Krishna & Guntur', state: 'Andhra Pradesh',
      eta: 'Next day', minOrder: 25000, charge: 2000, freeAbove: 50000,
      chargeNote: '₹2,000 per drop, free above ₹50,000',
      points: { Vijayawada: [16.5062, 80.648], Guntur: [16.3067, 80.4365], Tenali: [16.242, 80.64], Machilipatnam: [16.1875, 81.1389], Narasaraopet: [16.235, 80.0499], Ongole: [15.5057, 80.0499] },
    },
    {
      name: 'Andhra — Godavari', state: 'Andhra Pradesh',
      eta: '1–2 days', minOrder: 25000, charge: 2500, freeAbove: 60000,
      chargeNote: '₹2,500 per drop, free above ₹60,000',
      points: { Rajahmundry: [17.0005, 81.804], Kakinada: [16.9891, 82.2475], Eluru: [16.7107, 81.0952], Bhimavaram: [16.5449, 81.5212], Amalapuram: [16.5787, 82.0061] },
    },
    {
      name: 'Andhra — North Coast', state: 'Andhra Pradesh',
      eta: '2 days', minOrder: 30000, charge: 3000, freeAbove: 75000,
      chargeNote: '₹3,000 per drop, free above ₹75,000',
      points: { Visakhapatnam: [17.6868, 83.2185], Anakapalli: [17.6913, 83.0039], Vizianagaram: [18.1067, 83.3956], Srikakulam: [18.2949, 83.8938] },
    },
    {
      name: 'Andhra — Rayalaseema', state: 'Andhra Pradesh',
      eta: '1–2 days', minOrder: 25000, charge: 2500, freeAbove: 60000,
      chargeNote: '₹2,500 per drop, free above ₹60,000',
      points: { Kurnool: [15.8281, 78.0373], Nandyal: [15.4777, 78.4873], Kadapa: [14.4673, 78.8242], Proddatur: [14.7502, 78.5481], Anantapur: [14.6819, 77.6006], Hindupur: [13.829, 77.491], Puttaparthi: [14.1653, 77.8117], Tirupati: [13.6288, 79.4192], Chittoor: [13.2172, 79.1003], Madanapalle: [13.5503, 78.5029] },
    },
    {
      name: 'Andhra — South Coast', state: 'Andhra Pradesh',
      eta: '1–2 days', minOrder: 25000, charge: 2500, freeAbove: 60000,
      chargeNote: '₹2,500 per drop, free above ₹60,000',
      points: { Nellore: [14.4426, 79.9865], Kavali: [14.913, 79.993], Gudur: [14.1502, 79.8519] },
    },
  ].map((z) => ({ ...z, areas: z.areas || Object.keys(z.points) })),
  coverageNote: 'All of Telangana and Andhra Pradesh',

  slugify,
};
