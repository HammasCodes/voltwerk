/*
  Motion layer: Lenis for scrolling, GSAP for everything that reacts to it.

  Two rules shaped all of this.

  1. Motion is a supporting actor. Someone comparing four battery percentages
     needs the numbers to hold still. So every reveal is short, moves a small
     distance and plays once. Nothing loops, nothing pulses, nothing waits for
     an animation before it becomes readable.
  2. Nothing here may be load bearing. Content starts hidden only while the
     `motion` class is on <html>, that class is only set for visitors who have
     not asked for reduced motion, and an inline failsafe strips it if this
     module never runs. With JavaScript off the page is complete and static.

  Loaded through a dynamic import, so the bundle is fetched on marketing pages
  and never on /admin.
*/

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/* Tuning lives in one place so the whole site can be calmed down or sped up
   from here rather than at thirty call sites. */
const RISE = 18; // px a revealing element travels. Small on purpose.
const DUR = 0.65;
const EASE = 'power2.out';
const STAGGER = 0.06;
const START = 'top 88%'; // fire a little before the element is fully in view

let lenis: Lenis | null = null;
let tick: ((time: number) => void) | null = null;
let refreshTimer = 0;

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ── Smooth scrolling ─────────────────────────────────────────────────── */

function startLenis() {
  lenis = new Lenis({
    autoRaf: false, // GSAP's ticker drives it, so both run off one rAF loop
    duration: 1,
    /* Exponential ease out. Longer durations feel expensive for about a day and
       then feel like lag, because the page keeps gliding after you have stopped
       asking it to. One second is about the limit before a flick of the wheel
       stops feeling connected to the hand that made it. */
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    /* Touch stays native. Phone browsers already have momentum scrolling that is
       better tuned than anything shipped in a bundle, and taking it over breaks
       pull to refresh and the address bar collapse. */
    syncTouch: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  /* Lag smoothing pauses the ticker after a slow frame, which leaves Lenis
     mid-glide with a stale timestamp and produces a visible jump. */
  gsap.ticker.lagSmoothing(0);

  window.voltwerkLenis = lenis;
}

function stopLenis() {
  if (tick) gsap.ticker.remove(tick);
  tick = null;
  lenis?.destroy();
  lenis = null;
  delete window.voltwerkLenis;
}

/* Same page anchors, for example the "Full price list" link that lands on
   /service#prices. Lenis owns the scroll position, so the native jump has to be
   replaced or the two fight over it.

   Capture phase, and it stops propagation once it has taken the click. Astro's
   router also listens for clicks and jumps straight to the element for a same
   page hash, and it binds first, so a bubbling listener here would be handed a
   page that had already jumped. */
function bindAnchors() {
  document.addEventListener('click', onAnchorClick, true);
}

function onAnchorClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;

  const link = (event.target as HTMLElement | null)?.closest?.(
    'a[href]',
  ) as HTMLAnchorElement | null;
  if (!link || !lenis) return;

  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;

  const target = document.querySelector(url.hash);
  if (!target) return;

  event.preventDefault();
  event.stopPropagation();
  // Clear the sticky header, otherwise the heading lands underneath it.
  const header = document.querySelector('header');
  lenis.scrollTo(target as HTMLElement, { offset: -((header?.offsetHeight ?? 0) + 16) });
  history.pushState(null, '', url.hash);
}

/* ── Reveals ──────────────────────────────────────────────────────────── */

/* Markup opts in through data-anim, so a page author decides what moves and the
   module decides how. The four values are the only vocabulary:

   hero     container, direct children stagger in on load
   media    a framed image, fades and settles out of a slight scale on load
   reveal   one block, rises and fades when it scrolls into view
   stagger  container, direct children do the same in sequence
*/

function revealOnLoad() {
  const timeline = gsap.timeline({ defaults: { ease: EASE } });

  const hero = document.querySelector<HTMLElement>('[data-anim="hero"]');
  if (hero) {
    timeline.fromTo(
      Array.from(hero.children),
      { opacity: 0, y: RISE },
      { opacity: 1, y: 0, duration: DUR, stagger: STAGGER, clearProps: 'transform' },
      0,
    );
  }

  document.querySelectorAll<HTMLElement>('[data-anim="media"]').forEach((el) => {
    timeline.fromTo(
      el,
      { opacity: 0, scale: 1.04 },
      { opacity: 1, scale: 1, duration: 0.9, clearProps: 'transform' },
      hero ? 0.1 : 0,
    );
  });
}

function revealOnScroll() {
  document.querySelectorAll<HTMLElement>('[data-anim="reveal"]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: RISE },
      {
        opacity: 1,
        y: 0,
        duration: DUR,
        ease: EASE,
        clearProps: 'transform',
        scrollTrigger: { trigger: el, start: START, once: true },
      },
    );
  });

  document.querySelectorAll<HTMLElement>('[data-anim="stagger"]').forEach((group) => {
    const children = Array.from(group.children) as HTMLElement[];
    if (!children.length) return;

    /* Long lists get a quicker stagger. The 21 point inspection list should read
       as one gesture filling in, not as 21 separate events. */
    const step = children.length > 8 ? 0.03 : STAGGER;

    gsap.fromTo(
      children,
      { opacity: 0, y: RISE },
      {
        opacity: 1,
        y: 0,
        duration: DUR,
        ease: EASE,
        stagger: step,
        clearProps: 'transform',
        scrollTrigger: { trigger: group, start: START, once: true },
      },
    );
  });
}

/* The inventory grid is its own case. Cards are hidden and reordered by the
   filter, so a single timeline over the whole grid would animate the wrong set.
   Batching gives each card its own trigger. The tween deliberately leaves the
   inline opacity behind: the resting state in the stylesheet is opacity 0, so
   clearing it would hide a card the moment it finished appearing. */
function revealBikeGrid() {
  const grid = document.getElementById('bike-grid');
  if (!grid) return;

  const cards = gsap.utils.toArray<HTMLElement>('.bike-item', grid);
  if (!cards.length) return;

  ScrollTrigger.batch(cards, {
    start: START,
    once: true,
    onEnter: (batch) =>
      gsap.fromTo(
        batch,
        { opacity: 0, y: RISE },
        {
          opacity: 1,
          y: 0,
          duration: DUR,
          ease: EASE,
          stagger: 0.05,
          clearProps: 'transform',
        },
      ),
  });
}

/* ── Parallax ─────────────────────────────────────────────────────────── */

/* Applied to the frame, not the image. The frame keeps its aspect ratio and its
   overflow hidden, the image inside is oversized and drifts, so the crop moves
   without the layout moving. Six percent is deliberately near the threshold of
   noticing: enough to feel like depth, not enough to read as a gimmick. */
function bindParallax() {
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((frame) => {
    const image = frame.querySelector('img');
    if (!image) return;

    const shift = Number(frame.dataset.parallax) || 6;

    gsap.set(image, { scale: 1 + (shift * 2) / 100 });
    gsap.fromTo(
      image,
      { yPercent: -shift },
      {
        yPercent: shift,
        ease: 'none',
        scrollTrigger: {
          trigger: frame,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );
  });
}

/* ── Lifecycle ────────────────────────────────────────────────────────── */

function refreshSoon() {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 120);
}

export function initMotion() {
  /* Clear the inline failsafe first. From here the module owns the hidden state
     and is responsible for taking it back off again. */
  if (window.__motionFailsafe) {
    window.clearTimeout(window.__motionFailsafe);
    delete window.__motionFailsafe;
  }

  if (reducedMotion()) {
    document.documentElement.classList.remove('motion');
    return;
  }

  startLenis();
  bindAnchors();
  revealOnLoad();
  revealOnScroll();
  revealBikeGrid();
  bindParallax();

  /* Lazy images and web fonts can change the page height after the triggers are
     measured. Both settle by the load event. */
  window.addEventListener('load', refreshSoon, { once: true });
  /* Dispatched by the inventory filter, which hides and reorders cards and so
     invalidates every trigger position below the grid. */
  document.addEventListener('voltwerk:layout', refreshSoon);
}

export function destroyMotion() {
  document.removeEventListener('click', onAnchorClick, true);
  document.removeEventListener('voltwerk:layout', refreshSoon);
  window.removeEventListener('load', refreshSoon);
  window.clearTimeout(refreshTimer);
  /* Triggers hold references to elements that the view transition is about to
     throw away. Left alive they leak, and they also fire against the new page. */
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  gsap.globalTimeline.clear();
  stopLenis();
}
