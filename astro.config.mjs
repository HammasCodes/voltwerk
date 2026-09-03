// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Absolute base for canonical tags, OG image URLs and the generated sitemap.
  // Swap for the real domain once Vercel assigns one.
  site: 'https://voltwerk.vercel.app',

  integrations: [
    react(),
    // The admin screen is an internal prototype, so keep it out of search results.
    sitemap({ filter: (page) => !page.includes('/admin') }),
  ],

  // Prefetch links as they enter the viewport. Inventory browsing is a loop of
  // list -> detail -> back -> next detail, so every click after the first
  // should land instantly.
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },

  vite: {
    plugins: [tailwindcss()],
  },
});
