import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MainContent from "./MainContent";
import type { Event } from "@/lib/dummyEvents/events";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/explore",
}));

vi.mock("@/lib/hooks/useSimulatedAvailability", () => ({
  useSimulatedAvailability: () => ({ slotsLeft: 10, isSoldOut: false }),
}));

function makeEvent(overrides: Partial<Event>): Event {
  return {
    id: overrides.id ?? "event-id",
    title: overrides.title ?? "Sample Event",
    date: overrides.date ?? "Jun. 04 2025",
    time: "4:00 pm (UTC +01:00)",
    location: overrides.location ?? "Accra, Ghana",
    type: overrides.type ?? "Music",
    image: "/images/explore/1.png",
    description: "A sample event for testing.",
    tags: [],
    perks: [],
    organizer: { name: "Organizer", bio: "Bio", contact: "contact@example.com" },
    slotsLeft: 10,
    quantitySelected: 1,
    isPaid: overrides.price ? overrides.price > 0 : false,
    price: overrides.price ?? 0,
    ticketTypes: [{ name: "General", price: overrides.price ?? 0 }],
    privacyLevel: overrides.privacyLevel ?? ["Anonymous"],
    ...overrides,
  } as Event;
}

const events: Event[] = [
  makeEvent({ id: "free-accra", title: "Free Accra Meetup", price: 0, location: "Accra, Ghana" }),
  makeEvent({ id: "paid-lagos", title: "Paid Lagos Summit", price: 100, location: "Lagos, Nigeria" }),
];

describe("MainContent (event search & filtering)", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    window.history.replaceState(null, "", "/explore");
  });

  it("renders all events when no filters are applied", () => {
    render(<MainContent initialEvents={events} />);

    expect(screen.getByText("Free Accra Meetup")).toBeInTheDocument();
    expect(screen.getByText("Paid Lagos Summit")).toBeInTheDocument();
  });

  it("filters events by price via the Pricing dropdown", async () => {
    const user = userEvent.setup();
    render(<MainContent initialEvents={events} />);

    await user.click(screen.getByRole("button", { name: /pricing/i }));
    await user.click(screen.getByRole("option", { name: /free events only/i }));

    expect(screen.getByText("Free Accra Meetup")).toBeInTheDocument();
    expect(screen.queryByText("Paid Lagos Summit")).not.toBeInTheDocument();
  });

  it("filters events by location via the Location dropdown", async () => {
    const user = userEvent.setup();
    render(<MainContent initialEvents={events} />);

    await user.click(screen.getByRole("button", { name: /location/i }));
    await user.click(screen.getByRole("option", { name: "Lagos, Nigeria" }));

    expect(screen.getByText("Paid Lagos Summit")).toBeInTheDocument();
    expect(screen.queryByText("Free Accra Meetup")).not.toBeInTheDocument();
  });

  it("shows the empty state and no results when filters exclude everything", async () => {
    const user = userEvent.setup();
    render(<MainContent initialEvents={events} />);

    await user.click(screen.getByRole("button", { name: /location/i }));
    await user.click(screen.getByRole("option", { name: "Lagos, Nigeria" }));
    await user.click(screen.getByRole("button", { name: /pricing/i }));
    await user.click(screen.getByRole("option", { name: /free events only/i }));

    expect(screen.getByText("No events found")).toBeInTheDocument();
  });

  it("respects filters supplied via the initial query (e.g. deep link / SSR)", () => {
    render(
      <MainContent
        initialEvents={events}
        initialQuery={{
          privacy: null,
          price: "Paid Events Only",
          location: null,
          date: null,
          eventType: null,
          sort: null,
        }}
      />
    );

    expect(screen.getByText("Paid Lagos Summit")).toBeInTheDocument();
    expect(screen.queryByText("Free Accra Meetup")).not.toBeInTheDocument();
  });
});
