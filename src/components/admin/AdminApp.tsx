import { useEffect, useMemo, useRef, useState } from 'react';
import type { Bike, Availability, Grade, Category, SizeLabel } from '../../types';
import { loadBikes, saveBikes, resetBikes, emptyBike, makeSlug } from '../../lib/bikeStore';

interface Props {
  thumbs: Record<string, string>;
}

const euro = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
const plain = new Intl.NumberFormat('nl-NL');

const CATEGORIES: Category[] = ['city', 'trekking', 'cargo', 'folding', 'mountain', 'speed'];
const SIZES: SizeLabel[] = ['S', 'M', 'L', 'XL'];
const GRADES: Grade[] = ['A', 'B', 'C'];
const STATUSES: Availability[] = ['available', 'reserved', 'sold'];

const statusStyle: Record<Availability, string> = {
  available: 'bg-available/12 text-available',
  reserved: 'bg-reserved/12 text-reserved',
  sold: 'bg-sold/12 text-sold',
};

function healthColour(pct: number) {
  if (pct >= 85) return 'text-available';
  if (pct >= 70) return 'text-reserved';
  return 'text-sold';
}

export default function AdminApp({ thumbs }: Props) {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [editing, setEditing] = useState<Bike | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Bike | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  // Hydrate from storage after mount. Reading localStorage during render would
  // produce different markup on the server than in the browser.
  useEffect(() => setBikes(loadBikes()), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!editing && !confirmDelete) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (confirmDelete) setConfirmDelete(null);
      else setEditing(null);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [editing, confirmDelete]);

  useEffect(() => {
    if (editing) panelRef.current?.focus();
  }, [editing]);

  function commit(next: Bike[], message: string) {
    setBikes(next);
    saveBikes(next);
    setToast(message);
  }

  function handleSave(bike: Bike) {
    const withSlug = { ...bike, slug: bike.slug || makeSlug(bike) };
    const exists = bikes.some((b) => b.id === withSlug.id);
    const next = exists
      ? bikes.map((b) => (b.id === withSlug.id ? withSlug : b))
      : [withSlug, ...bikes];
    commit(next, exists ? 'Changes saved' : 'Bike added');
    setEditing(null);
  }

  const stats = useMemo(() => {
    const available = bikes.filter((b) => b.availability === 'available');
    return {
      total: bikes.length,
      available: available.length,
      reserved: bikes.filter((b) => b.availability === 'reserved').length,
      sold: bikes.filter((b) => b.availability === 'sold').length,
      value: available.reduce((sum, b) => sum + b.price, 0),
    };
  }, [bikes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bikes;
    return bikes.filter((b) => `${b.brand} ${b.model} ${b.year}`.toLowerCase().includes(q));
  }, [bikes, query]);

  return (
    <div>
      {/* Stats -------------------------------------------------------- */}
      <dl className="border-line bg-line grid grid-cols-2 gap-px overflow-hidden rounded-lg border sm:grid-cols-5">
        {[
          { label: 'Listings', value: String(stats.total) },
          { label: 'Available', value: String(stats.available) },
          { label: 'Reserved', value: String(stats.reserved) },
          { label: 'Sold', value: String(stats.sold) },
          { label: 'Stock value', value: euro.format(stats.value) },
        ].map((s) => (
          <div key={s.label} className="bg-card p-4">
            <dt className="text-label text-ink-faint uppercase">{s.label}</dt>
            <dd className="tabular mt-1.5 font-mono text-xl font-semibold">{s.value}</dd>
          </div>
        ))}
      </dl>

      {/* Toolbar ------------------------------------------------------ */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <label htmlFor="admin-search" className="sr-only">
            Search listings
          </label>
          <input
            id="admin-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brand or model"
            className="border-line-strong bg-card h-11 w-full rounded-sm border px-3 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(emptyBike());
            setIsNew(true);
          }}
          className="focus-invert bg-ink text-paper ml-auto inline-flex h-11 items-center gap-2 rounded-sm px-5 text-sm font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 3v10M3 8h10"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Add a bike
        </button>

        <button
          type="button"
          onClick={() => commit(resetBikes(), 'Demo data restored')}
          className="border-line-strong hover:border-ink inline-flex h-11 items-center rounded-sm border px-4 text-sm font-medium"
        >
          Reset demo data
        </button>
      </div>

      {/* Table -------------------------------------------------------- */}
      <div className="border-line mt-6 overflow-x-auto rounded-lg border">
        <table className="bg-card w-full min-w-[46rem] border-collapse text-left">
          <thead>
            <tr className="border-line border-b">
              {['Bike', 'Status', 'Price', 'Battery', 'Mileage', ''].map((h) => (
                <th key={h} scope="col" className="text-label text-ink-faint px-4 py-3 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((bike) => (
              <tr key={bike.id} className="border-line border-b last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-paper-sunk h-11 w-14 shrink-0 overflow-hidden rounded-sm">
                      {thumbs[bike.photos[0]] && (
                        <img
                          src={thumbs[bike.photos[0]]}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-label text-ink-faint uppercase">{bike.brand}</p>
                      <p className="truncate font-medium">{bike.model}</p>
                      <p className="tabular text-ink-faint font-mono text-xs">
                        {bike.year} &middot; {bike.frameSize}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`text-label inline-flex rounded-full px-2.5 py-1 uppercase ${statusStyle[bike.availability]}`}
                  >
                    {bike.availability}
                  </span>
                </td>

                <td className="tabular px-4 py-3 font-mono">{euro.format(bike.price)}</td>

                <td className="px-4 py-3">
                  <span className={`tabular font-mono ${healthColour(bike.battery.healthPct)}`}>
                    {bike.battery.healthPct}%
                  </span>
                  <span className="tabular text-ink-faint block font-mono text-xs">
                    {plain.format(bike.battery.cycles)} cyc
                  </span>
                </td>

                <td className="tabular px-4 py-3 font-mono text-sm">
                  {plain.format(bike.mileageKm)} km
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(bike);
                        setIsNew(false);
                      }}
                      className="hover:bg-paper-sunk rounded-sm px-3 py-1.5 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(bike)}
                      className="text-sold hover:bg-sold/8 rounded-sm px-3 py-1.5 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="bg-card py-16 text-center">
            <p className="font-medium">
              {bikes.length === 0 ? 'No bikes listed' : 'Nothing matches that search'}
            </p>
            <p className="text-ink-muted mt-2 text-sm">
              {bikes.length === 0
                ? 'Add your first bike, or restore the demo data.'
                : 'Try a different brand or model name.'}
            </p>
          </div>
        )}
      </div>

      {editing && (
        <BikeForm
          bike={editing}
          isNew={isNew}
          thumbs={thumbs}
          panelRef={panelRef}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          bike={confirmDelete}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            commit(
              bikes.filter((b) => b.id !== confirmDelete.id),
              `${confirmDelete.brand} ${confirmDelete.model} removed`,
            );
            setConfirmDelete(null);
          }}
        />
      )}

      {toast && (
        <div
          role="status"
          className="bg-ink text-paper shadow-lift fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */

interface FormProps {
  bike: Bike;
  isNew: boolean;
  thumbs: Record<string, string>;
  panelRef: React.RefObject<HTMLDivElement | null>;
  onCancel: () => void;
  onSave: (bike: Bike) => void;
}

function BikeForm({ bike, isNew, thumbs, panelRef, onCancel, onSave }: FormProps) {
  const [draft, setDraft] = useState<Bike>(bike);

  const set = <K extends keyof Bike>(key: K, value: Bike[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setBattery = (patch: Partial<Bike['battery']>) =>
    setDraft((d) => ({ ...d, battery: { ...d.battery, ...patch } }));

  const setCondition = (patch: Partial<Bike['condition']>) =>
    setDraft((d) => ({ ...d, condition: { ...d.condition, ...patch } }));

  const valid = draft.brand.trim() && draft.model.trim() && draft.price > 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="bg-ink/35 absolute inset-0" onClick={onCancel} aria-hidden="true" />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? 'Add a bike' : `Edit ${draft.brand} ${draft.model}`}
        className="bg-paper shadow-lift relative flex h-full w-full max-w-3xl flex-col outline-none"
      >
        <header className="border-line flex shrink-0 items-center justify-between border-b px-5 py-4 sm:px-7">
          <div>
            <p className="text-label text-ink-faint uppercase">
              {isNew ? 'New listing' : 'Editing'}
            </p>
            <h2 className="font-display text-xl font-semibold">
              {draft.brand || draft.model ? `${draft.brand} ${draft.model}`.trim() : 'Add a bike'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-sm"
          >
            <span className="sr-only">Close</span>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path
                d="M5 5l12 12M17 5L5 17"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          {/*
            The live preview sits at the top of the form, not buried at the
            bottom. The owner is writing a shop window, not filling in a
            database, and seeing the customer-facing card update as they type is
            what makes that obvious.
          */}
          <section className="border-line bg-paper-sunk rounded-lg border p-5">
            <p className="text-label text-ink-faint uppercase">How the customer sees it</p>
            <div className="mt-4 max-w-xs">
              <PreviewCard bike={draft} thumbs={thumbs} />
            </div>
          </section>

          <Fieldset legend="Identity">
            <Field label="Brand" required>
              <input
                type="text"
                value={draft.brand}
                onChange={(e) => set('brand', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Model" required>
              <input
                type="text"
                value={draft.model}
                onChange={(e) => set('model', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Year">
              <input
                type="number"
                value={draft.year}
                min={2000}
                max={new Date().getFullYear() + 1}
                onChange={(e) => set('year', Number(e.target.value))}
                className={inputCls}
              />
            </Field>
            <Field label="Category">
              <select
                value={draft.category}
                onChange={(e) => set('category', e.target.value as Category)}
                className={inputCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Public URL" hint="Generated from brand, model and year." full>
              <input
                type="text"
                readOnly
                value={`/bikes/${draft.slug || makeSlug(draft)}`}
                className={`${inputCls} tabular bg-paper-sunk text-ink-muted font-mono`}
              />
            </Field>
          </Fieldset>

          <Fieldset legend="Price and status">
            <Field label="Price (€)" required>
              <input
                type="number"
                value={draft.price}
                min={0}
                step={5}
                onChange={(e) => set('price', Number(e.target.value))}
                className={inputCls}
              />
            </Field>
            <Field label="Was (€)" hint="Leave empty if not reduced.">
              <input
                type="number"
                value={draft.priceWas ?? ''}
                min={0}
                step={5}
                onChange={(e) =>
                  set('priceWas', e.target.value ? Number(e.target.value) : undefined)
                }
                className={inputCls}
              />
            </Field>
            <Field label="Status">
              <select
                value={draft.availability}
                onChange={(e) => set('availability', e.target.value as Availability)}
                className={inputCls}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Warranty (months)">
              <input
                type="number"
                value={draft.warrantyMonths}
                min={0}
                max={36}
                onChange={(e) => set('warrantyMonths', Number(e.target.value))}
                className={inputCls}
              />
            </Field>
            <Field label="Feature on the home page" full>
              <label className="flex items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(draft.featured)}
                  onChange={(e) => set('featured', e.target.checked)}
                  className="accent-ink h-4 w-4"
                />
                Show this bike in the &ldquo;Just in&rdquo; row
              </label>
            </Field>
          </Fieldset>

          <Fieldset legend="Fit and wear">
            <Field label="Frame size">
              <select
                value={draft.frameSize}
                onChange={(e) => set('frameSize', e.target.value as SizeLabel)}
                className={inputCls}
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Frame (cm)">
              <input
                type="number"
                value={draft.frameSizeCm}
                min={38}
                max={68}
                onChange={(e) => set('frameSizeCm', Number(e.target.value))}
                className={inputCls}
              />
            </Field>
            <Field label="Fits riders from (cm)">
              <input
                type="number"
                value={draft.riderHeightCm[0]}
                onChange={(e) =>
                  set('riderHeightCm', [Number(e.target.value), draft.riderHeightCm[1]])
                }
                className={inputCls}
              />
            </Field>
            <Field label="Fits riders to (cm)">
              <input
                type="number"
                value={draft.riderHeightCm[1]}
                onChange={(e) =>
                  set('riderHeightCm', [draft.riderHeightCm[0], Number(e.target.value)])
                }
                className={inputCls}
              />
            </Field>
            <Field label="Mileage (km)" full>
              <input
                type="number"
                value={draft.mileageKm}
                min={0}
                step={50}
                onChange={(e) => set('mileageKm', Number(e.target.value))}
                className={inputCls}
              />
            </Field>
          </Fieldset>

          <Fieldset legend="Battery">
            <Field label="Capacity (Wh)">
              <input
                type="number"
                value={draft.battery.capacityWh}
                onChange={(e) => setBattery({ capacityWh: Number(e.target.value) })}
                className={inputCls}
              />
            </Field>
            <Field label="Measured health (%)" hint="From the diagnostic rig at intake.">
              <input
                type="number"
                value={draft.battery.healthPct}
                min={0}
                max={100}
                onChange={(e) => setBattery({ healthPct: Number(e.target.value) })}
                className={inputCls}
              />
            </Field>
            <Field label="Charge cycles">
              <input
                type="number"
                value={draft.battery.cycles}
                min={0}
                onChange={(e) => setBattery({ cycles: Number(e.target.value) })}
                className={inputCls}
              />
            </Field>
            <Field label="Pack replaced on" hint="Leave empty for the original pack.">
              <input
                type="date"
                value={draft.battery.replacedOn ?? ''}
                onChange={(e) => setBattery({ replacedOn: e.target.value || undefined })}
                className={inputCls}
              />
            </Field>
            <Field label="Real range from (km)">
              <input
                type="number"
                value={draft.battery.rangeKm[0]}
                onChange={(e) =>
                  setBattery({ rangeKm: [Number(e.target.value), draft.battery.rangeKm[1]] })
                }
                className={inputCls}
              />
            </Field>
            <Field label="Real range to (km)">
              <input
                type="number"
                value={draft.battery.rangeKm[1]}
                onChange={(e) =>
                  setBattery({ rangeKm: [draft.battery.rangeKm[0], Number(e.target.value)] })
                }
                className={inputCls}
              />
            </Field>
          </Fieldset>

          <Fieldset legend="Condition">
            <Field label="Grade">
              <select
                value={draft.condition.grade}
                onChange={(e) => setCondition({ grade: e.target.value as Grade })}
                className={inputCls}
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="One line summary" full>
              <input
                type="text"
                value={draft.condition.summary}
                onChange={(e) => setCondition({ summary: e.target.value })}
                placeholder="Well kept commuter with light cosmetic marks."
                className={inputCls}
              />
            </Field>

            <div className="sm:col-span-2">
              <p className="text-label text-ink-faint uppercase">Wear notes</p>
              <p className="text-ink-muted mt-1 text-xs">
                These appear on the public page. Listing the flaws is the point.
              </p>

              <div className="mt-3 space-y-2">
                {draft.condition.notes.map((note, i) => (
                  <div key={i} className="flex flex-wrap gap-2 sm:flex-nowrap">
                    <input
                      type="text"
                      value={note.area}
                      placeholder="Area"
                      onChange={(e) => {
                        const notes = [...draft.condition.notes];
                        notes[i] = { ...note, area: e.target.value };
                        setCondition({ notes });
                      }}
                      className={`${inputCls} sm:w-32`}
                    />
                    <input
                      type="text"
                      value={note.note}
                      placeholder="What we found"
                      onChange={(e) => {
                        const notes = [...draft.condition.notes];
                        notes[i] = { ...note, note: e.target.value };
                        setCondition({ notes });
                      }}
                      className={`${inputCls} min-w-0 flex-1`}
                    />
                    <select
                      value={note.severity}
                      onChange={(e) => {
                        const notes = [...draft.condition.notes];
                        notes[i] = { ...note, severity: e.target.value as typeof note.severity };
                        setCondition({ notes });
                      }}
                      className={`${inputCls} sm:w-36`}
                    >
                      <option value="good">Good</option>
                      <option value="wear">Normal wear</option>
                      <option value="attention">Worth knowing</option>
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        setCondition({ notes: draft.condition.notes.filter((_, j) => j !== i) })
                      }
                      className="text-sold hover:bg-sold/8 h-11 shrink-0 rounded-sm px-3 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setCondition({
                    notes: [...draft.condition.notes, { area: '', note: '', severity: 'wear' }],
                  })
                }
                className="border-line-strong hover:border-ink mt-3 inline-flex h-10 items-center rounded-sm border px-4 text-sm font-medium"
              >
                Add a note
              </button>
            </div>
          </Fieldset>
        </div>

        <footer className="border-line flex shrink-0 items-center gap-3 border-t px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
          <button
            type="button"
            onClick={onCancel}
            className="border-line-strong hover:border-ink h-11 rounded-sm border px-5 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={() => onSave(draft)}
            className="focus-invert bg-ink text-paper ml-auto h-11 rounded-sm px-6 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isNew ? 'Publish listing' : 'Save changes'}
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */

const inputCls = 'h-11 w-full rounded-sm border border-line-strong bg-card px-3 text-sm';

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-line mt-8 border-t pt-6">
      <legend className="sr-only">{legend}</legend>
      <p className="font-display text-lg font-semibold">{legend}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  hint,
  required,
  full,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={full ? 'sm:col-span-2' : undefined}>
      <span className="text-label text-ink-faint block uppercase">
        {label}
        {required && <span className="text-sold"> *</span>}
      </span>
      <span className="mt-2 block">{children}</span>
      {hint && <span className="text-ink-faint mt-1 block text-xs">{hint}</span>}
    </label>
  );
}

function PreviewCard({ bike, thumbs }: { bike: Bike; thumbs: Record<string, string> }) {
  const src = thumbs[bike.photos[0]];
  return (
    <article className="border-line bg-card overflow-hidden rounded-md border">
      <div className="bg-paper-sunk aspect-[4/3]">
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="text-ink-faint flex h-full items-center justify-center text-xs">
            No photo yet
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-label text-ink-faint uppercase">{bike.brand || 'Brand'}</p>
        <p className="font-display mt-1 text-lg font-semibold">{bike.model || 'Model'}</p>
        <p className="tabular mt-2 font-mono text-lg font-semibold">
          {bike.price ? euro.format(bike.price) : '€ 0'}
        </p>
        <div className="border-line mt-3 flex items-baseline justify-between border-t pt-3">
          <span className="text-label text-ink-faint uppercase">Battery</span>
          <span className={`tabular font-mono text-sm ${healthColour(bike.battery.healthPct)}`}>
            {bike.battery.healthPct}%
          </span>
        </div>
        <div className="bg-ink/8 mt-2 h-1.5 overflow-hidden rounded-full">
          <div
            className={`h-full rounded-full ${
              bike.battery.healthPct >= 85
                ? 'bg-available'
                : bike.battery.healthPct >= 70
                  ? 'bg-reserved'
                  : 'bg-sold'
            }`}
            style={{ width: `${Math.max(0, Math.min(100, bike.battery.healthPct))}%` }}
          />
        </div>
      </div>
    </article>
  );
}

function ConfirmDialog({
  bike,
  onCancel,
  onConfirm,
}: {
  bike: Bike;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-5">
      <div className="bg-ink/45 absolute inset-0" onClick={onCancel} aria-hidden="true" />
      <div
        ref={ref}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="bg-paper shadow-lift relative w-full max-w-md rounded-lg p-6 outline-none"
      >
        <h2 id="confirm-title" className="font-display text-xl font-semibold">
          Remove this listing?
        </h2>
        <p className="text-ink-muted mt-3 text-sm">
          <span className="text-ink">
            {bike.brand} {bike.model} ({bike.year})
          </span>{' '}
          will be taken off the site. In this prototype the change is only stored in your browser.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="border-line-strong hover:border-ink h-11 flex-1 rounded-sm border text-sm font-medium"
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-sold text-paper h-11 flex-1 rounded-sm text-sm font-medium"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
