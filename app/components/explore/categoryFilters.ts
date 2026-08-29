import type { Event } from "@/lib/dummyEvents/events";

export const CATEGORY_PILLS = [
  { label: "Hackathons", value: "hackathon" },
  { label: "Workshops", value: "workshop" },
  { label: "Conferences", value: "conference" },
  { label: "Meetups", value: "meetup" },
] as const;

export type CategoryPillValue = (typeof CATEGORY_PILLS)[number]["value"];

const CATEGORY_KEYWORDS: Record<CategoryPillValue, readonly string[]> = {
  hackathon: ["hackathon", "makerthon", "hack night"],
  workshop: ["workshop", "bootcamp", "training", "lab"],
  conference: ["conference", "summit", "festival", " fest", "week", "keynote"],
  meetup: ["meetup", "community", "connect", "networking", "gathering"],
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
    ...event.perks,
  ]
    .join(" ")
    .toLowerCase();

  return CATEGORY_KEYWORDS[category].some((keyword) =>
    searchableText.includes(keyword)
  );
};
