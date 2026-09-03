import type { ServicePackage, ServiceItem } from '../types';

export const servicePackages: ServicePackage[] = [
  {
    slug: 'safety-check',
    name: 'Safety Check',
    tagline: 'A fast look over the parts that stop you and hold you up.',
    priceEur: 39,
    durationLabel: '45 minutes, while you wait',
    includes: [
      'Brake pad thickness and rotor wear',
      'Tyre condition and pressure',
      'Wheel true and spoke tension',
      'Frame and fork inspection',
      'All lights and reflectors tested',
      'Written report of anything found',
    ],
  },
  {
    slug: 'full-service',
    name: 'Full Service',
    tagline: 'The annual service most bikes actually need.',
    priceEur: 119,
    durationLabel: 'Same day, dropped off before 10:00',
    includes: [
      'Everything in the Safety Check',
      'Battery capacity test and cycle count',
      'Motor diagnostic and error log read',
      'Drivetrain clean, chain stretch measured',
      'Gear indexing and cable adjustment',
      'Brake bleed or cable replacement',
      'Bearing check on headset and bottom bracket',
      'Firmware updated to latest stable',
      'Road test over 5 km',
    ],
    popular: true,
  },
  {
    slug: 'winter-overhaul',
    name: 'Winter Overhaul',
    tagline: 'Strip, clean and rebuild after a season of salt and rain.',
    priceEur: 189,
    durationLabel: '2 working days',
    includes: [
      'Everything in the Full Service',
      'Drivetrain removed and degreased',
      'Bearings repacked or replaced',
      'Corrosion treatment on contacts and bolts',
      'Battery contacts cleaned and sealed',
      'Full cable and housing replacement',
      'Frame polish and protective wax',
    ],
  },
];
// Battery work sits at the top of this list on purpose. It is the most common
// reason someone brings a used e-bike in, and the most expensive thing to get
// wrong, so it should be the first price a worried owner sees.
export const serviceItems: ServiceItem[] = [
  {
    name: 'Battery health report',
    description: 'Capacity test on our rig, cycle count and a written estimate of remaining life.',
    priceEur: 25,
    durationLabel: '30 minutes',
  },
  {
    name: 'Battery replacement',
    description: 'New pack supplied and fitted. Price depends on the brand and capacity.',
    priceEur: 390,
    from: true,
  },
  {
    name: 'Motor diagnostic',
    description: 'Error log read, bearing play checked and torque sensor calibrated.',
    priceEur: 45,
    durationLabel: '1 hour',
  },
  {
    name: 'Brake pads replaced',
    description: 'Pads fitted, rotors checked and system bled if needed.',
    priceEur: 45,
    from: true,
  },
  {
    name: 'New chain fitted',
    description: 'Chain replaced and stretch measured. Cassette checked at the same time.',
    priceEur: 55,
    from: true,
  },
  {
    name: 'Gear indexing',
    description: 'Derailleur aligned and cables adjusted so shifts land first time.',
    priceEur: 25,
    durationLabel: '30 minutes',
  },
  {
    name: 'Wheel true',
    description: 'Spoke tension evened out and the wheel trued on the stand.',
    priceEur: 30,
    from: true,
  },
  {
    name: 'Tyre replaced',
    description: 'New tyre and tube fitted. Puncture protection available.',
    priceEur: 40,
    from: true,
  },
  {
    name: 'Puncture repair',
    description: 'Tube patched or replaced, tyre checked for the cause.',
    priceEur: 19,
    durationLabel: '20 minutes',
  },
  {
    name: 'Firmware update',
    description: 'Motor and display updated to the latest stable release.',
    priceEur: 20,
    durationLabel: '20 minutes',
  },
];
export const serviceSteps = [
  {
    title: 'Tell us what it is doing',
    body: 'Call, message us on WhatsApp or use the form. A rough description is enough. We will tell you if it sounds like a five minute fix.',
  },
  {
    title: 'Drop it off',
    body: 'Bring the bike, the battery and the key. Most work is booked within two working days, and safety checks are usually while you wait.',
  },
  {
    title: 'We quote before we work',
    body: 'If we find something beyond the agreed job, we call you with a price first. Nothing gets fitted without a yes.',
  },
];
export const serviceFaqs: { q: string; a: string }[] = [
  {
    q: 'Do you service bikes you did not sell?',
    a: 'Yes. Most of the bikes on our stands were bought somewhere else. There is no difference in price or priority.',
  },
  {
    q: 'Which brands can you work on?',
    a: 'Anything running Bosch, Shimano, Yamaha, Brose or Bafang, which covers most of the market. Closed systems such as VanMoof and some Stromer models we can diagnose and do mechanical work on, but certain electronic parts are only available to their own service network. We will say so before you leave the bike.',
  },
  {
    q: 'My battery range has dropped. Is it dead?',
    a: 'Usually not. Range falls in cold weather and after a few hundred cycles, which is normal. A battery health report costs €25 and tells you the actual remaining capacity, so you can decide whether a €390 pack is worth it on your bike.',
  },
  {
    q: 'How long does a repair take?',
    a: 'Safety checks are typically while you wait. A full service is same day if the bike arrives before 10:00. If a part has to be ordered, expect three to five working days and we will tell you at drop off.',
  },
  {
    q: 'Do you buy used e-bikes?',
    a: 'We do. Bring it in or send photos and we will make an offer. We can also take your old bike against one of the bikes we have for sale.',
  },
];
