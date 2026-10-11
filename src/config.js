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
  siteUrl: (env.SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
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
  timeSlots: ['6 AM – 9 AM', '9 AM – 12 PM', '12 PM – 3 PM', '3 PM – 6 PM', '6 PM – 9 PM'],
  eventTypes: ['Wedding', 'Birthday / private party', 'Corporate event', 'Festival / puja', 'Restaurant / café restock', 'Hotel / banquet', 'Retail restock', 'Office pantry', 'Other'],
  businessTypes: ['Restaurant', 'Hotel / resort', 'Caterer', 'Event planner', 'Wedding organiser', 'Retail shop / supermarket', 'Café / bakery', 'Office / corporate', 'Other'],

  // Delivery zones (shown on /delivery, used for the area checker)
  serviceZones: [
    {
      name: 'Zone A — Core city',
      eta: 'Same day (order by 11 AM)',
      charge: 0,
      chargeNote: 'Free above minimum order, ₹350 below',
      areas: ['Banjara Hills', 'Jubilee Hills', 'Begumpet', 'Ameerpet', 'Somajiguda', 'Abids', 'Himayatnagar', 'Secunderabad', 'Tarnaka', 'Uppal'],
    },
    {
      name: 'Zone B — Greater city',
      eta: 'Next day',
      charge: 450,
      chargeNote: '₹450 per drop, free above ₹25,000',
      areas: ['Hitech City', 'Madhapur', 'Gachibowli', 'Kondapur', 'Kukatpally', 'Miyapur', 'LB Nagar', 'Dilsukhnagar', 'Kompally', 'Manikonda'],
    },
    {
      name: 'Zone C — Outskirts & venues',
      eta: 'Next day, 48 h for events',
      charge: 900,
      chargeNote: '₹900 per drop, free above ₹60,000',
      areas: ['Shamshabad', 'Shankarpally', 'Medchal', 'Ghatkesar', 'Patancheru', 'Moinabad', 'Chevella', 'Ibrahimpatnam'],
    },
  ],
  otherCities: ['Warangal', 'Karimnagar', 'Nizamabad', 'Vijayawada', 'Kurnool'],

  slugify,
};
