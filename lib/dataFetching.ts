'use server';

import { dummyEvents } from './dummyEvents/events';
import type { Event } from './dummyEvents/events';

/**
 * Server-side data fetching for public event data
 * These functions run only on the server and are safe for SSR/Static Generation
 */

/**
 * Get all public events for the explore list page
 * Safe to use with static generation and ISR
 */
export async function getAllPublicEvents(): Promise<Event[]> {
  // Simulate a small server-side delay (e.g., from a database)
  // In production, this would fetch from your actual backend
  await new Promise(resolve => setTimeout(resolve, 0));
  
  return dummyEvents;
}

/**
 * Get a single event by ID for the detail page
 * Used with generateStaticParams for static generation
 */
export async function getEventById(eventId: string): Promise<Event | null> {
  // Simulate a small server-side delay
  await new Promise(resolve => setTimeout(resolve, 0));
  
  const eventName = eventId.replaceAll('-', ' ');
  const event = dummyEvents.find(
    (event) => event.title.toLowerCase() === eventName.toLowerCase()
  );
  
  return event || null;
}

/**
 * Get all event IDs for static generation
 * Returns an array of event IDs that should be pre-rendered
 */
export async function getAllEventIds(): Promise<string[]> {
  const events = await getAllPublicEvents();
  return events.map(event => event.title.toLowerCase().replaceAll(' ', '-'));
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