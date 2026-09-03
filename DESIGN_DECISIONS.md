# Design decisions

VOLTWERK is a fictional used e-bike shop in Amsterdam that also runs a repair workshop. This document explains the choices behind the build, in the order they were made.

---

## 1. One site, not two

The brief describes two things: a site for the bikes for sale, and a small company site for repairs. I built them as one site with two clearly signposted zones rather than two separate sites.

The reasoning is commercial. Repair customers and used bike buyers are the same people. Someone whose battery has failed is looking at a €390 pack against a €995 replacement bike, and that comparison should happen inside one site rather than across two. Splitting them would also halve the SEO value of every inbound link and double the navigation cost for a visitor who does not yet know which half they need.

The navigation states the split instead of hiding it:

`Bikes for sale` · `Service & repairs` · `About` · `Contact`

Both halves cross link at the bottom of their main pages, and the header carries a live stock count so the shop half is always one click away.

---

## 2. The hierarchy decision

The brief said this was the main thing being assessed: what goes on the card, and what waits until someone opens the bike. I ranked the specifications by what actually kills or closes a used e-bike deal.

**On the card, six things:**

| Field              | Why it earned the space                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Photo              | Non-negotiable for a used item                                                                                                          |
| Price              | The hard filter, and the second largest type on the card                                                                                |
| **Battery health** | A replacement pack costs €390 to €900. This is the single largest hidden risk in buying used, and it is the thing most competitors bury |
| Frame size         | A bike that does not fit is out regardless of price, yet almost nobody surfaces it early                                                |
| Mileage and year   | Paired as one wear signal rather than two separate facts                                                                                |
| Condition grade    | Sets expectations before the click                                                                                                      |

**Deliberately held back for the detail page:** motor brand and torque, gears, brakes, weight, wheel size, range, accessories, warranty length, service history, and the itemised wear notes.

The test I applied to each field was: would removing this cause someone to open a bike they would otherwise have ruled out, or rule out a bike they would otherwise have opened? Motor torque fails that test. Frame size passes it decisively.

### Battery health is the idea the whole design rests on

The brief lists "Battery" as one word among eight. Deciding what that word should actually mean is the most consequential design decision in the project.

A capacity figure alone ("500 Wh") describes the pack when it left the factory and says nothing about what you are buying. So the data model treats a battery as four facts: nominal capacity, measured health percentage, charge cycle count, and an honest range window. The `BatteryMeter` component renders all four identically on the card, the detail page, and inside the admin form.

This gives the inventory grid a property that is hard to copy: two bikes at similar prices become genuinely comparable at a glance. The 2020 Haibike at €1,390 with a battery replaced in June 2026 reads as better value than the 2021 VanMoof at €1,150 on a pack at 68% after 902 cycles, and the grid shows you that without opening either.

Colour follows three bands (85% and up, 70 to 84, below 70) and reuses the same three status colours as availability rather than introducing a second traffic light system.

---

## 3. Publishing the flaws

Every listing carries an itemised condition report: a grade, a one line summary, and a list of specific findings tagged good, normal wear, or worth knowing.

Those notes name real problems. The Batavus says "76% health, fine for a 20km commute, not for day trips". The VanMoof says "budget for a replacement pack". The Urban Arrow admits a crack on the cargo box lip.

This is a design decision, not a copywriting one. Trust is the entire business model for used goods, and a shop that publishes the things a buyer would otherwise discover on arrival is making a claim its competitors cannot cheaply match. It is also why the notes are structured data rather than prose: prose can be skimmed past, a list of tagged findings cannot.

The 21 point inspection list on the home page does the same job from the other direction. The full list is shown rather than a summarised three, because the length is the point. "Fully checked" is worth nothing next to an itemised list someone can hold you to.

---

## 4. Helping people rule bikes out

The inventory page is built around subtraction rather than search. With 13 bikes, nobody needs a search box, they need to eliminate the ones that do not apply.

The first filter is **"Your height"**. Enter 178 and the grid shows only bikes whose rider range covers you. Every bike stores a height range, so this is a real answer to the question a buyer is actually asking, rather than making them translate their height into a frame size in centimetres.

The rest are max price, brand, battery health, condition grade, frame size and type. Sorting covers newest, price both ways, battery health, mileage and model year.

Filter state is written to the URL, so a filtered view can be bookmarked or sent to someone. The footer links use this: "Cargo bikes" is just `/bikes?category=cargo`.

---

## 5. Mobile is a re-think, not a shrink

Three places where the mobile layout is structurally different rather than narrower:

**Filters become a sheet.** A desktop filter bar on a phone is dead weight above the content. On mobile the filters collapse into a fixed bottom button showing the active filter count, which opens a full height sheet with Clear and "Show 13 bikes" in the thumb zone. It is the same form element and the same state in both layouts, positioned differently by CSS, so there is no mobile copy that can drift out of sync.

**The detail page gets a sticky action bar.** Price, battery health and "Book a test ride" stay pinned at the bottom while the specification scrolls. Nobody should have to scroll back up to remember what they are about to commit to.

**Navigation goes full screen, not to a drawer.** With four items a drawer wastes the space it wins. Full screen buys large tap targets and room to pin Call and WhatsApp at the bottom, which for a local shop are the two actions that actually convert.

Everything respects `env(safe-area-inset-bottom)` so nothing sits under an iPhone home indicator. Every page was checked at 390px, 768px and 1440px, with an automated check that no page scrolls horizontally at any of them.

---

## 6. The admin concept

`/admin` is a working prototype backed by `localStorage`, not a real system. It says so in a banner at the top rather than pretending otherwise.

It covers the three things the brief asked for: add, edit, remove. A table lists every bike with a thumbnail, status, price, battery health and mileage. Editing opens a slide over panel with the fields grouped into Identity, Price and status, Fit and wear, Battery, and Condition. Removing asks for confirmation and names the bike. "Reset demo data" restores the original fourteen listings.

**The detail worth pointing at is the live preview.** The customer facing card sits at the top of the edit form and updates as you type. The owner is writing a shop window, not filling in a database, and seeing the battery meter move as they enter a health reading makes that concrete.

Two smaller decisions: the public URL is generated from brand, model and year rather than typed, because a hand typed slug is one more thing to get wrong. And the wear notes are editable, with a reminder in the form that they appear publicly, because the honesty is the product.

`src/lib/bikeStore.ts` is the seam a real backend would slot into. Every function in it has the shape of an API call, and none of the components know where the data comes from.

---

## 7. Visual direction

Warm off-white paper rather than white, near black ink, and one accent used sparingly. Three typefaces with distinct jobs: Bricolage Grotesque for headings, Inter for body, and JetBrains Mono for every number.

The mono is the signature choice. Prices, mileages, watt hours, percentages and frame sizes are all monospaced with tabular figures, so numbers align into columns down a grid of cards and the brand reads as engineered rather than boutique. It is also the thing that makes the three column spec block on each card scannable: the eye compares year to year and price to price straight down the column instead of re-reading each line.

One colour rule is enforced in the token file: **the lime accent is a fill, never text.** On paper it fails contrast badly at any size. As a surface with ink on top it reaches roughly 15:1. On the dark footer it works as text, and that is the only place it appears as one.

---

## 8. Technical choices, and what they cost

Astro 7 with Tailwind 4, static output, React only where it earns its place.

The marketing pages ship **13,935 bytes of JavaScript**, which is the view transition router and nothing else. The inventory filtering, the photo gallery, the mobile navigation and the contact forms are all plain TypeScript against the DOM. React loads on exactly one route, `/admin`, because that is the only screen with state complicated enough to justify 184KB.

That was a correction made mid build. The mobile menu was originally a React island, which pulled the entire React runtime onto the home page: 201KB of JavaScript to operate a hamburger. Rewriting it as 40 lines of vanilla script cut the home page payload by 93%.

The inventory filter works on data attributes written into the HTML rather than a serialised copy of the bike data, so the page ships one copy of the inventory instead of two.

**Measured results:** 21 pages build clean, zero WCAG 2.1 AA violations from axe-core across all 8 unique templates at both desktop and mobile widths, and no horizontal overflow at 390px, 768px or 1440px.

---

## 9. Trade-offs I made, stated plainly

**No real backend.** The brief allows mock data. `localStorage` means admin edits live in one browser and never reach the public pages, which are generated at build time. A real build would replace the four functions in `bikeStore.ts` and add a rebuild hook.

**Client side filtering.** Correct at 5 to 30 bikes, where shipping the whole inventory as HTML is cheaper than a round trip. Past roughly 200 bikes this needs server side filtering and pagination.

**The photography is the weakest part.** These are freely licensed Wikimedia Commons photos, credited in the README. Brand matching worked for some listings and not others, the angles are inconsistent, and a few show a different model than the listing describes. Real inventory photography shot against a consistent background would change several layout decisions, most obviously letting the cards crop much tighter. I would not ship this to a real client without replacing every image.

**No Dutch translation.** The business is in Amsterdam and would need NL and EN. Faking it with a language toggle that does nothing would be worse than leaving it out, so it is the first thing on the post MVP list.

**No saved searches or favourites.** For a 13 bike inventory the filters do the job. This becomes worth building at around 50 bikes, alongside an email alert for "tell me when a size M under €2,000 arrives", which for this business is probably the highest value feature not in the brief.

---

## 10. What I would build next

1. Replace the photography, then tighten the card crops.
2. Dutch and English, with the language in the URL.
3. Email alerts on a saved filter, which is the natural extension of the height filter already being the first thing on the page.
4. A comparison view for two or three bikes side by side, since the battery data finally makes that comparison meaningful.
5. Move the condition report into the workshop's own intake process so the public listing is generated from the inspection rather than retyped.
