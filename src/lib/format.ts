// Dutch locale formatting throughout. The shop is in Amsterdam, so prices read
// as "€ 1.895" with a dot thousands separator rather than the US comma.
const euro = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const plain = new Intl.NumberFormat('nl-NL');

export const formatPrice = (value: number) => euro.format(value);

export const formatKm = (value: number) => `${plain.format(value)} km`;

export const formatNumber = (value: number) => plain.format(value);

// "August 2026" rather than "2026-08-21". Nobody reads ISO dates by choice.
export const formatMonthYear = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// Battery health drives colour in three places (card, detail page, admin), so
// the thresholds live here rather than being re-guessed in each component.
export type HealthBand = 'good' | 'fair' | 'poor';

export function healthBand(pct: number): HealthBand {
  if (pct >= 85) return 'good';
  if (pct >= 70) return 'fair';
  return 'poor';
}

export const healthLabel: Record<HealthBand, string> = {
  good: 'Healthy',
  fair: 'Usable',
  poor: 'Worn',
};

// Plain language for what each condition grade actually means. Written to set
// expectations before someone travels across town to see a bike.
export const gradeMeaning = {
  A: 'Close to new. Little or no cosmetic wear.',
  B: 'Good working order with visible signs of use.',
  C: 'Fully working but cosmetically or mechanically tired. Priced accordingly.',
} as const;
