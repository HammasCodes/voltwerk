/// <reference types="astro/client" />

declare global {
  interface Window {
    /* Set by src/lib/motion.ts. Anything that locks the page, such as the mobile
       menu or the filter sheet, has to pause the smooth scroller as well as the
       body overflow, or the wheel still moves the page behind the overlay. */
    voltwerkLenis?: import('lenis').default;
    /* Timer set by the inline head script that hides reveal targets before first
       paint. The motion module clears it once it has taken over. */
    __motionFailsafe?: number;
  }

  interface DocumentEventMap {
    /* Fired when something changes page height outside of a resize, so scroll
       triggers can be re-measured. The inventory filter is the only source. */
    'voltwerk:layout': CustomEvent;
  }
}

export {};
