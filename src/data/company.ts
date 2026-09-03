export const company = {
  name: 'VOLTWERK',
  tagline: 'Used e-bikes, properly checked.',
  description:
    'We buy, inspect and resell used electric bikes, then keep them running afterwards. Every bike passes a 21-point check before it goes on sale.',

  email: 'hallo@voltwerk.nl',
  phone: '+31 20 123 4567',
  phoneHref: 'tel:+31201234567',
  whatsapp: 'https://wa.me/31201234567',

  address: {
    street: 'Veemkade 142',
    postcode: '1019 HE',
    city: 'Amsterdam',
    country: 'Netherlands',
  },

  // Sunday is intentionally absent rather than listed as "Closed". An empty
  // row is noise, so the UI renders "Closed Sundays" as a single line instead.
  hours: [
    { days: 'Mon – Fri', open: '09:00', close: '18:00' },
    { days: 'Saturday', open: '10:00', close: '17:00' },
  ],

  foundedYear: 2019,
} as const;

// The trust device on the home page. Kept as data so the count in the headline
// ("21-point check") can never drift out of sync with the list beneath it.
export const inspectionPoints = [
  'Battery capacity test on a diagnostic rig',
  'Cell balance and BMS error log',
  'Charge cycle count read from the controller',
  'Motor bearing play and noise under load',
  'Torque sensor calibration',
  'Firmware updated to latest stable',
  'Frame inspection for cracks and dents',
  'Weld and headset integrity',
  'Fork and suspension travel',
  'Wheel true and spoke tension',
  'Tyre tread depth and sidewall condition',
  'Brake pad thickness measured',
  'Brake fluid or cable replacement',
  'Rotor wear and alignment',
  'Chain stretch measured with a gauge',
  'Cassette and chainring tooth wear',
  'Derailleur alignment and indexing',
  'Bottom bracket and headset bearings',
  'All lighting and reflector function',
  'Full wiring loom and connector check',
  'Road test over 5 km, loaded',
] as const;
