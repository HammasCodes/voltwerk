export type Availability = 'available' | 'reserved' | 'sold';
export type Grade = 'A' | 'B' | 'C';
export type Category = 'city' | 'trekking' | 'cargo' | 'folding' | 'mountain' | 'speed';
export type FrameType = 'step-through' | 'low-step' | 'diamond';
export type SizeLabel = 'S' | 'M' | 'L' | 'XL';
export interface Battery {
  capacityWh: number; // nominal, as sold new
  healthPct: number; // measured on our diagnostic rig at intake
  cycles: number; // full charge cycles logged by the BMS
  rangeKm: [number, number]; // honest range window, not the brochure number
  replacedOn?: string; // ISO date. A new pack is a headline selling point.
}
export interface Motor {
  brand: string;
  model: string;
  torqueNm: number;
  position: 'mid-drive' | 'rear-hub' | 'front-hub';
}
export interface ConditionNote {
  area: string; // 'Drivetrain', 'Tyres', 'Frame'
  note: string; // plain language, no jargon
  severity: 'good' | 'wear' | 'attention';
}

export interface Condition {
  grade: Grade;
  summary: string;
  notes: ConditionNote[];
}
export interface Bike {
  id: string;
  slug: string;

  // Identity
  brand: string;
  model: string;
  year: number;
  category: Category;

  // Money
  price: number; // EUR
  priceWas?: number; // shown struck through when present

  // Fit. The spec that silently disqualifies a bike faster than any other.
  frameType: FrameType;
  frameSizeCm: number;
  frameSize: SizeLabel;
  riderHeightCm: [number, number];

  // Wear
  mileageKm: number;
  battery: Battery;
  motor: Motor;
  condition: Condition;

  // Reference detail. Detail page only, deliberately kept off the card.
  gears: string;
  brakes: string;
  weightKg: number;
  wheelSize: string;
  included: string[];
  warrantyMonths: number;
  serviceHistory: { date: string; work: string }[];

  // Presentation
  photos: string[]; // filenames, resolved by the image pipeline
  availability: Availability;
  featured?: boolean;
  listedOn: string; // ISO date. Drives "newest" sort and "just in" badges.
}
export interface ServiceItem {
  name: string;
  description: string;
  priceEur: number;
  from?: boolean; // renders as "from €X"
  durationLabel?: string;
}

export interface ServicePackage {
  slug: string;
  name: string;
  tagline: string;
  priceEur: number;
  durationLabel: string;
  includes: string[];
  popular?: boolean;
}
