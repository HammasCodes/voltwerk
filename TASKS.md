# VOLTWERK: Build Task List

Used e-bike sales + workshop. Astro 7 · Tailwind 4 · React islands.

**Workflow:** each chunk is written to `_chunks/chunk-NN-name.md` with file path, position, what it does and why. You paste from there, then I review. I run the commands. `_chunks/` is gitignored so it stays out of the deliverable.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked/flagged

---

## Phase 0: Tooling

- [x] 0.1 `npx skills add` × 6 → **11 skills active**: astro, ui-ux-pro-max, ui-styling, brand, design-system, banner-design, slides, frontend-design, web-design-guidelines, tailwind-4-docs, seo-audit
- [x] 0.2 `npx impeccable install` → `impeccable` skill + agents + hooks into project `.claude`
- [!] 0.3 `claude plugin add …` → **`unknown command 'add'`**; correct verb is `claude plugin install`. Moot: `frontend-design` already active via 0.1
- [x] 0.4 `astro-docs` MCP added to project config
- [!] 0.5 `@bong/claude-frontend-skills` → **npm E404, package does not exist.** Non-blocking
- [x] 0.6 Skills loaded without a restart

---

## Phase 1: Foundation

### Chunk 1: Scaffold

- [x] 1.1 Astro **7.2.10**, minimal, TypeScript strict
- [x] 1.2 Tailwind **4.3.3** (`@tailwindcss/vite`), React **19.2.8**, sitemap **3.7.4**
- [x] 1.3 Fonts installed: bricolage-grotesque, inter, jetbrains-mono (all 5.3.0)
- [x] 1.4 `astro.config.mjs`: site URL, sitemap admin filter, viewport prefetch
- [x] 1.5 Prettier + `prettier-plugin-astro` + `prettier-plugin-tailwindcss`
- [x] 1.6 `.gitignore` extended, `git init` on `main`

### Chunk 2: Design tokens

- [x] 2.1 `src/styles/global.css`: `@import "tailwindcss"` + `@theme` block
- [x] 2.2 Colour scale: paper, ink, lime, warm neutrals, status colours
- [x] 2.3 Fluid `clamp()` type scale, 3 font families, mono numerals
- [x] 2.4 Radii, warm-tinted shadows, `shell` / `section-y` / `tabular` utilities
- [x] 2.5 Base resets, global focus ring, `prefers-reduced-motion` guard

### Chunk 3: Data layer

- [x] 3.1 `src/types.ts`: `Bike`, `Battery`, `Condition`, `ServicePackage`, `ServiceItem`
- [x] 3.2 `src/data/bikes.ts`: 14 bikes, €995 to €3,450, 12 available / 1 reserved / 1 sold
- [x] 3.3 `src/data/services.ts`: packages + price list + process + FAQ
- [x] 3.4 `src/data/company.ts`: contact, hours, 21 inspection points
- [x] 3.5 `src/pages/api/bikes.json.ts`: mock API endpoint
- [x] 3.6 Source + optimise bike photos → `src/assets/bikes/`

---

## Phase 2: Components

### Chunk 4: Layout shell

- [x] 4.1 `src/layouts/Base.astro`: html shell, fonts, global CSS, View Transitions
- [x] 4.2 `src/components/Seo.astro`: title, description, OG, canonical
- [x] 4.3 `src/components/Header.astro`: desktop nav + live inventory count
- [x] 4.4 `MobileNav.astro`: full-screen menu, vanilla script. Replaced the React version, home page JS went 201,426 → 13,935 bytes
- [x] 4.5 `src/components/Footer.astro`: hours, address, nav, legal

### Chunk 5: UI primitives

- [x] 5.1 `Button.astro`: primary / secondary / ghost, `as` polymorphism
- [x] 5.2 `Badge.astro`: Available / Reserved / Sold
- [x] 5.3 **`BatteryMeter.astro`**: the signature component: %, Wh, cycles
- [x] 5.4 `ConditionGrade.astro`: A/B/C with plain-language definition
- [x] 5.5 `SpecItem.astro` + `Section.astro`: layout rhythm

### Chunk 6: Bike card

- [x] 6.1 `src/components/BikeCard.astro`: the 6 scan-layer fields
- [x] 6.2 Hover/focus states, sold-out treatment
- [x] 6.3 `BikeGrid.astro`: responsive 1 / 2 / 3 col
- [x] 6.4 Review pass: is anything on the card _not_ earning its place?

---

## Phase 3: Pages

### Chunk 7: `/bikes` inventory

- [x] 7.1 `src/components/InventoryBrowser.tsx`: filter/sort state island
- [x] 7.2 Filters: price, brand, frame size, battery health, condition
- [x] 7.3 "Fits me" height → frame-size helper
- [x] 7.4 Desktop filter bar
- [x] 7.5 Mobile sticky "Filters (n)" button → full-height sheet, Apply / Clear
- [x] 7.6 Sort: price, newest, mileage, battery health
- [x] 7.7 Result count + empty state + clear-all
- [x] 7.8 URL sync so filtered views are shareable

### Chunk 8: `/bikes/[slug]` detail

- [x] 8.1 `getStaticPaths` from mock data
- [x] 8.2 `src/components/Gallery.tsx`: desktop thumbs, mobile swipe + dots, keyboard nav
- [x] 8.3 Spec table (desktop) → 2-col grid (mobile)
- [x] 8.4 Condition report: grade + itemised wear notes
- [x] 8.5 What's included / warranty / service history
- [x] 8.6 Sticky mobile bottom bar: price + "Book a test ride"
- [x] 8.7 "Similar bikes" strip

### Chunk 9: `/service`

- [x] 9.1 Hero + what the workshop does
- [x] 9.2 Service packages with prices (3 tiers)
- [x] 9.3 À-la-carte price list ("from €X")
- [x] 9.4 3-step process
- [x] 9.5 Booking form (mock submit + success state)
- [x] 9.6 FAQ accordion
- [x] 9.7 Cross-link to bikes for sale

### Chunk 10: `/` home

- [x] 10.1 Hero + live inventory count
- [x] 10.2 4 featured bikes
- [x] 10.3 21-point inspection (trust device)
- [x] 10.4 Service teaser w/ starting prices
- [x] 10.5 Location, hours, map placeholder
- [x] 10.6 Closing CTA

### Chunk 11: `/about` + `/contact`

- [x] 11.1 About: story, workshop, why used
- [x] 11.2 Contact: address, hours, form, phone/WhatsApp

---

## Phase 4: Admin

### Chunk 12: `/admin` mock CRUD

- [x] 12.1 `src/lib/bikeStore.ts`: localStorage store, seed, reset (the real-API seam)
- [x] 12.2 "Prototype: data lives in your browser" banner
- [x] 12.3 `AdminTable.tsx`: thumb, model, price, status, actions
- [x] 12.4 `BikeForm.tsx`: slide-over, grouped fieldsets, validation
- [x] 12.5 **Live card preview inside the form**: owner sees what the buyer sees
- [x] 12.6 Delete with confirm dialog
- [x] 12.7 Reset demo data
- [x] 12.8 Empty state + mobile layout

---

## Phase 5: Polish & ship

### Chunk 13: Quality pass

- [x] 13.1 Responsive audit @ 390 / 768 / 1440 across all 7 routes
- [x] 13.2 Keyboard-only pass: filters, gallery, admin form, mobile nav
- [x] 13.3 Focus rings, ARIA labels, alt text, heading order
- [x] 13.4 AA contrast check (lime on ink only, never light text)
- [x] 13.5 SEO: meta, OG images, sitemap, robots.txt
- [x] 13.6 JSON-LD: `Product` on bike pages, `LocalBusiness` sitewide
- [x] 13.7 `npm run build` clean + Lighthouse ≥95 ×4
- [x] 13.8 404 page

### Chunk 14: Deliverables

- [x] 14.1 `DESIGN_DECISIONS.md`: page structure, hierarchy, primary vs secondary, mobile approach, trade-offs
- [x] 14.2 `README.md`: run instructions, structure, photo credits
- [~] 14.3 Local repo committed on `main`. Pushing to GitHub needs your `gh auth login`
- [~] 14.4 Vercel deploy needs your `vercel login`. Astro static builds deploy with no config
- [ ] 14.5 Test the live URL on a real phone (after deploy)
- [ ] 14.6 Draft the reply email to the client

---

## Verified results

- 21 pages build clean
- **0 WCAG 2.1 AA violations** (axe-core, 8 templates x desktop + mobile)
- **21/21 interaction tests pass** (mobile nav, filters, sorting, URL sync, empty state, gallery, admin CRUD, live preview)
- No horizontal overflow at 390 / 768 / 1440
- No console errors or failed requests
- Marketing pages ship 13,935 bytes of JS. React loads on `/admin` only

## Open flags

- `@bong/claude-frontend-skills` not on npm: non-blocking
- Skills/MCP may need a session restart before they load
- Photos are Wikimedia Commons (CC licensed), credited in `src/data/photo-credits.json`. Weakest part of the build, see DESIGN_DECISIONS section 10
- JS budget: React loads on `/admin` only. Inventory filtering is vanilla TS
