'use server';

import { revalidateTag, unstable_cache } from 'next/cache';
import { dummyEvents } from './dummyEvents/events';
import type { Event } from './dummyEvents/events';
import InMemoryCache, { DEFAULT_TTL } from './cache';

/**
 * Server-side data fetching for public event data
 * These functions run only on the server and are safe for SSR/Static Generation
 *
 * Caching is two-layered:
 * 1. `unstable_cache` (Next.js data cache) — durable and shared across
 *    instances, so serverless cold starts and multiple lambdas still hit a warm
 *    cache. Swap this layer for Redis/Upstash if the deployment needs it.
 * 2. `InMemoryCache` — a bounded LRU in front of it, avoiding repeat work
 *    within a single process. Entry count is capped, so user-supplied event ids
 *    can't grow the map without limit.
 */

const CACHE_TAG = 'public-events';
const CACHE_TTL = DEFAULT_TTL;
const REVALIDATE_SECONDS = Math.floor(CACHE_TTL / 1000);

const fetchAllPublicEvents = unstable_cache(
  async (): Promise<Event[]> => {
    // Simulate a small server-side delay (e.g., from a database)
    // In production, this would fetch from your actual backend
    await new Promise((resolve) => setTimeout(resolve, 0));

    return dummyEvents;
  },
  ['public_events_all'],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
);

const fetchEventById = unstable_cache(
  async (eventId: string): Promise<Event | null> => {
    // Simulate a small server-side delay
    await new Promise((resolve) => setTimeout(resolve, 0));

    const eventName = eventId.replaceAll('-', ' ');
    const event = dummyEvents.find(
      (event) => event.title.toLowerCase() === eventName.toLowerCase()
    );

    return event || null;
  },
  ['public_event'],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
);

const fetchAllEventIds = unstable_cache(
  async (): Promise<string[]> => {
    const events = await fetchAllPublicEvents();
    return events.map((event) => event.title.toLowerCase().replaceAll(' ', '-'));
  },
  ['public_event_ids_all'],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
);

/**
 * Get all public events for the explore list page
 * Safe to use with static generation and ISR
 * Privacy: Only caches public event data, no user information
 */
export async function getAllPublicEvents(): Promise<Event[]> {
  // Cache key: generic, no user identifiers
  return InMemoryCache.getOrFetch(
    'public_events_all',
    fetchAllPublicEvents,
    CACHE_TTL
  );
}

/**
 * Get a single event by ID for the detail page
 * Used with generateStaticParams for static generation
 * Privacy: Cache key is the public event ID only, no user information
 */
export async function getEventById(eventId: string): Promise<Event | null> {
  // Cache key: based on public event ID, no user identifiers
  return InMemoryCache.getOrFetch(
    `public_event_${eventId}`,
    () => fetchEventById(eventId),
    CACHE_TTL
  );
}

/**
 * Get all event IDs for static generation
 * Returns an array of event IDs that should be pre-rendered
 * Privacy: Cache key is generic, no user identifiers
 */
export async function getAllEventIds(): Promise<string[]> {
  // Cache key: generic, no user identifiers
  return InMemoryCache.getOrFetch(
    'public_event_ids_all',
    fetchAllEventIds,
    CACHE_TTL
  );
}

/**
 * Drop every cached copy of the public event data across both layers.
 * Call this after a write so readers stop serving stale events.
 */
export async function revalidatePublicEvents(): Promise<void> {
  InMemoryCache.clear();
  revalidateTag(CACHE_TAG);
}

/**
 * Generate metadata for an event
 * Creates SEO-optimized metadata without exposing user context
 */
export async function generateEventMetadata(event: Event | null) {
  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The event you are looking for does not exist.',
    };
  }

  return {
    title: `${event.title} | Zicket`,
    description: event.description,
    keywords: event.tags?.join(', '),
    openGraph: {
      title: event.title,
      description: event.description,
      images: [
        {
          url: event.image,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
      type: 'website',
    },
  };
}

/**
 * Server function to check if events data is fresh
 * Used for revalidation strategies
 */
export async function validateEventDataFreshness(): Promise<boolean> {
  // In production, this could check against your backend
  // For now, always return true as dummy data is always "fresh"
  return true;
}
