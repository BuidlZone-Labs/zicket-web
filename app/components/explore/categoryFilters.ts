import type { Event } from "@/lib/dummyEvents/events";

export const CATEGORY_PILLS = [
  { label: "Hackathons", value: "hackathon" },
  { label: "Workshops", value: "workshop" },
  { label: "Conferences", value: "conference" },
  { label: "Meetups", value: "meetup" },
] as const;

export type CategoryPillValue = (typeof CATEGORY_PILLS)[number]["value"];

const CATEGORY_PATTERNS: Record<CategoryPillValue, readonly RegExp[]> = {
  hackathon: [/\bhackathons?\b/i, /\bmakerthons?\b/i],
  workshop: [
    /\bworkshops?\b/i,
    /\bbootcamps?\b/i,
    /\btraining\b/i,
    /\bfounders?\s+lab\b/i,
  ],
  conference: [
    /\bconferences?\b/i,
    /\bsummits?\b/i,
    /\bfest(?:ival)?s?\b/i,
    /\bdesign\s+week\b/i,
    /\bproduct\s+weekend\b/i,
    /\bkeynotes?\b/i,
  ],
  meetup: [
    /\bmeetups?\b/i,
    /\bcommunity\b/i,
    /\bdev\s*connect\b/i,
    /\bnetworking\b/i,
    /\bgatherings?\b/i,
  ],
};

export const isCategoryPillValue = (
  value: string | null
): value is CategoryPillValue =>
  value !== null && CATEGORY_PILLS.some((category) => category.value === value);

export const eventMatchesCategory = (
  event: Event,
  category: CategoryPillValue
) => {
  const searchableText = [
    event.title,
    event.type,
    event.description,
    ...event.tags,
  ].join(" ");

  return CATEGORY_PATTERNS[category].some((pattern) =>
    pattern.test(searchableText)
  );
};
