import type { APIRoute } from 'astro';
import { bikes } from '../../data/bikes';

// Prerendered at build time, so this ships as a plain JSON file on the CDN with
// no server behind it. Swapping in a real API means changing where the site
// fetches from, not restructuring the pages that consume it.
export const prerender = true;

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        count: bikes.length,
        available: bikes.filter((b) => b.availability === 'available').length,
        generatedAt: new Date().toISOString(),
        bikes,
      },
      null,
      2,
    ),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
