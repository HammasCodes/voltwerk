import type { Bike } from '../types';
import { bikes as seedBikes } from '../data/bikes';

const KEY = 'voltwerk.inventory.v1';

/**
 * The seam a real backend would slot into.
 *
 * Every function below is the shape of an API call: load is a GET, save is a
 * PUT, reset is a fixture reload. Swapping localStorage for fetch means
 * rewriting the four function bodies in this file and changing nothing in the
 * components, because none of them know where the data comes from.
 */

export function loadBikes(): Bike[] {
  if (typeof window === 'undefined') return seedBikes;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seedBikes;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedBikes;
    return parsed as Bike[];
  } catch {
    // Corrupt or unreadable storage (private mode, cleared site data, a bad
    // hand edit) falls back to the seed rather than showing an empty shop.
    return seedBikes;
  }
}

export function saveBikes(bikes: Bike[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(bikes));
  } catch {
    // Quota exceeded or storage blocked. The in-memory state is still correct
    // for this session, so there is nothing useful to tell the user here.
  }
}

export function resetBikes(): Bike[] {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* nothing to do */
    }
  }
  return seedBikes;
}

export function emptyBike(): Bike {
  return {
    id: `vw-${Math.random().toString(36).slice(2, 8)}`,
    slug: '',
    brand: '',
    model: '',
    year: new Date().getFullYear() - 2,
    category: 'city',
    price: 0,
    frameType: 'diamond',
    frameSizeCm: 54,
    frameSize: 'M',
    riderHeightCm: [170, 182],
    mileageKm: 0,
    battery: { capacityWh: 500, healthPct: 90, cycles: 100, rangeKm: [50, 80] },
    motor: { brand: 'Bosch', model: 'Active Line Plus', torqueNm: 50, position: 'mid-drive' },
    condition: { grade: 'B', summary: '', notes: [] },
    gears: '',
    brakes: '',
    weightKg: 24,
    wheelSize: '28 inch',
    included: ['Original charger', 'Two keys'],
    warrantyMonths: 12,
    serviceHistory: [],
    photos: [],
    availability: 'available',
    listedOn: new Date().toISOString().slice(0, 10),
  };
}

// Slugs are the public URL of a listing, so they are generated from the bike
// rather than typed. A hand-typed slug is one more thing to get wrong, and a
// duplicate would silently overwrite another bike's page at build time.
export function makeSlug(bike: Pick<Bike, 'brand' | 'model' | 'year'>): string {
  return [bike.brand, bike.model, bike.year]
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
