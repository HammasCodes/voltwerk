# VOLTWERK

A used e-bike shop and repair workshop, built as a design assignment. VOLTWERK is a fictional business and the inventory is mock data.

**The reasoning behind the design is in [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md).** That is the document to read first.

---

## Running it

Requires Node 22 or newer.

```bash
npm install
npm run dev
```

Then open `http://localhost:4321`.

| Command           | What it does                |
| ----------------- | --------------------------- |
| `npm run dev`     | Dev server with hot reload  |
| `npm run build`   | Static build into `dist/`   |
| `npm run preview` | Serve the built output      |
| `npm run format`  | Prettier across the project |

---

## What is where

```
src/
  data/          Mock inventory, services, company details
    bikes.ts       14 bikes. The single source of truth
    services.ts    Packages, price list, process, FAQ
    company.ts     Address, hours, contact, 21 inspection points
  lib/
    bikeStore.ts   localStorage store for the admin prototype
    format.ts      Currency, distance and date formatting, battery bands
    images.ts      Resolves photo filenames to optimised assets
  components/
    ui/            Button, Badge, BatteryMeter, ConditionBadge, Section
    BikeCard.astro The scan layer: the six fields that matter
    Gallery.astro  Scroll-snap gallery, one track for all viewports
    admin/         The React CRUD prototype
  pages/
    index.astro          Home
    bikes/index.astro    Inventory with filters
    bikes/[slug].astro   Bike detail
    service.astro        Workshop, prices, booking
    about.astro
    contact.astro
    admin.astro          Inventory management prototype
    404.astro
    api/bikes.json.ts    Mock API endpoint
```

### Routes

| Route             | Purpose                                                       |
| ----------------- | ------------------------------------------------------------- |
| `/`               | Home. Live stock figures, featured bikes, the inspection list |
| `/bikes`          | All bikes, with filters and sorting                           |
| `/bikes/[slug]`   | One bike. Gallery, specs, condition report                    |
| `/service`        | Packages, price list, booking form, FAQ                       |
| `/about`          | The business and how it works                                 |
| `/contact`        | Form, address, hours                                          |
| `/admin`          | Add, edit and remove listings. Prototype only                 |
| `/api/bikes.json` | The inventory as JSON                                         |

---

## Stack

- **Astro 7** with static output
- **Tailwind 4** via `@tailwindcss/vite`, with the design tokens in `src/styles/global.css`
- **React 19** on `/admin` only
- **GSAP + Lenis** for the motion layer, in a chunk that loads after first paint
- Self-hosted variable fonts: Bricolage Grotesque, Inter, JetBrains Mono

### JavaScript budget

| Page            | Before first paint      | Fetched afterwards                 |
| --------------- | ----------------------- | ---------------------------------- |
| Marketing pages | 19-23KB raw, 6.8KB gzip | Motion: 134KB raw, 49KB gzip       |
| Bikes index     | 23KB raw, 6.8KB gzip    | Motion: 134KB raw, 49KB gzip       |
| Admin prototype | 19KB raw, 6.8KB gzip    | React island: 221KB raw, 67KB gzip |

The eager column is the view transition router, the link prefetcher, and each page's own scripts. Nothing on the page waits for the motion chunk: it is a dynamic import, the admin route never requests it, and anyone who has asked for reduced motion never runs it.

Everything except the admin screen runs on plain TypeScript against the DOM. The filtering, gallery, mobile navigation and forms need no framework.

The motion layer is the single most expensive thing on a marketing page and it buys feel rather than function. Removing it is one script tag in `src/layouts/Base.astro`, one block in `src/styles/global.css`, and the `data-anim` attributes become inert.

---

## Verified

- 21 pages build clean
- **Zero WCAG 2.1 AA violations** from axe-core, across all 8 unique templates at 1440px and 390px
- No horizontal overflow at 390px, 768px or 1440px
- No console errors or failed requests on any page
- 21/21 interaction tests pass
- **89/89 motion checks pass**: every page scrolled top to bottom at both widths with nothing left invisible, the reduced-motion path, a view transition, an anchor jump, and a filter round trip

The scripts used for these checks are in `_chunks/` (`shoot.mjs` for screenshots and overflow, `a11y.mjs` for axe, `interact.mjs` for behaviour, `motion.mjs` for the animation layer). They are development tools, not part of the site.

---

## The admin prototype

`/admin` stores changes in `localStorage`. Nothing is sent anywhere and nothing affects the public pages, which are generated from `src/data/bikes.ts` at build time. "Reset demo data" restores the original fourteen listings.

`src/lib/bikeStore.ts` is where a real backend would connect. Its four functions have the shape of API calls, and no component knows where the data comes from.

---

## Photography

All 45 photographs come from [Wikimedia Commons](https://commons.wikimedia.org) under open licences. Per-file attribution including author, licence and source URL is in [`src/data/photo-credits.json`](./src/data/photo-credits.json).

Licences in use: CC BY-SA 4.0, CC BY-SA 3.0, CC BY-SA 2.0, CC BY-SA 2.5, CC BY 4.0, CC BY 3.0, CC BY 2.0, CC0, GFDL, public domain.

**These are placeholders and they are the weakest part of the project.** Search matched the right manufacturer for some listings and not others, the angles are inconsistent, and a few show a different model than the listing describes. Real inventory photography would replace all of them, and would allow much tighter crops on the cards. This is covered honestly in the design document rather than glossed over.

Sources were fetched with the scripts in `_chunks/`, normalised to 1600x1200 and compressed, then served through Astro's image pipeline as WebP.

---

## Notes

- The business, its address, phone number and inventory are invented.
- Contact and booking forms validate and show a success state, but send nothing.
- `/admin` is excluded from `robots.txt` and the sitemap.
