import type { PrivacyLevel } from "./events";

/**
 * A ticket the current user has purchased. References a public event by id for
 * its image/title/venue, and carries its own event-time window + seat so the
 * post-purchase experience can show upcoming / live / used / expired states.
 *
 * NOTE: mock data, like the rest of the repo. Event times are baked relative to
 * module-load time (see below) so the demo always has a ticket in each state,
 * regardless of the stale calendar dates stored on the events themselves.
 */
export interface PurchasedTicket {
  id: string;
  eventId: string;
  ticketType: string;
  seat: string | null;
  section: string | null;
  /** ISO timestamp of purchase. */
  purchasedAt: string;
  /** ISO start of the entry window. */
  eventStart: string;
  /** ISO end of the entry window. */
  eventEnd: string;
  /** ISO check-in time, or null if never scanned. */
  checkedInAt: string | null;
  privacyLevel: PrivacyLevel;
}

/** Derived event-time state — never stored, always computed from the window. */
export type TicketState = "upcoming" | "live" | "used" | "expired";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/**
 * Builds the mock ticket fixtures relative to `now`, so the demo always has a
 * ticket in each lifecycle state (upcoming / live / used / expired). Computed
 * per request rather than once at module load — otherwise the "live" fixture
 * would silently expire a few hours after the server started.
 *
 * The returned ISO strings are baked into the server-rendered HTML and reused
 * on the client, so there's no time-based hydration mismatch; only the
 * live-updating countdown re-computes against the real clock.
 */
export function buildDummyTickets(now: number = Date.now()): PurchasedTicket[] {
  const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString();

  return [
    {
      id: "tkt-solana-vip",
      eventId: "solana-summer-hackathon",
      ticketType: "VIP",
      seat: "A-04",
      section: "Floor",
      purchasedAt: iso(-6 * DAY),
      eventStart: iso(5 * DAY),
      eventEnd: iso(5 * DAY + 8 * HOUR),
      checkedInAt: null,
      privacyLevel: "Anonymous",
    },
    {
      id: "tkt-crypto-build-live",
      eventId: "crypto-build-ghana",
      ticketType: "Regular",
      seat: "B-12",
      section: "Sector 7",
      purchasedAt: iso(-3 * DAY),
      eventStart: iso(-1 * HOUR),
      eventEnd: iso(6 * HOUR),
      checkedInAt: null,
      privacyLevel: "Wallet Required",
    },
    {
      id: "tkt-femcode-upcoming",
      eventId: "femcode-fest-2025",
      ticketType: "Free",
      seat: null,
      section: null,
      purchasedAt: iso(-1 * DAY),
      eventStart: iso(2 * DAY + 3 * HOUR),
      eventEnd: iso(2 * DAY + 9 * HOUR),
      checkedInAt: null,
      privacyLevel: "Anonymous",
    },
    {
      id: "tkt-nairobi-used",
      eventId: "web3-bootcamp-nairobi",
      ticketType: "Student",
      seat: "C-21",
      section: "Balcony",
      purchasedAt: iso(-25 * DAY),
      eventStart: iso(-20 * DAY),
      eventEnd: iso(-20 * DAY + 4 * HOUR),
      checkedInAt: iso(-20 * DAY + 25 * MIN),
      privacyLevel: "Verified Access",
    },
    {
      id: "tkt-lagos-expired",
      eventId: "lagos-design-week",
      ticketType: "Regular",
      seat: null,
      section: null,
      purchasedAt: iso(-15 * DAY),
      eventStart: iso(-10 * DAY),
      eventEnd: iso(-10 * DAY + 5 * HOUR),
      checkedInAt: null,
      privacyLevel: "Verified Access",
    },
    {
      id: "tkt-founders-upcoming",
      eventId: "founders-lab-africa",
      ticketType: "VIP",
      seat: "D-08",
      section: "Main Hall",
      purchasedAt: iso(-2 * DAY),
      eventStart: iso(28 * DAY),
      eventEnd: iso(28 * DAY + 6 * HOUR),
      checkedInAt: null,
      privacyLevel: "Anonymous",
    },
  ];
}
