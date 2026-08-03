import { dummyEvents, type Event } from "./dummyEvents/events";
import { buildDummyTickets, type PurchasedTicket, type TicketState } from "./dummyEvents/tickets";

/** All tickets belonging to the current (mock) user, fresh for `now`. */
export function getUserTickets(now: number = Date.now()): PurchasedTicket[] {
  return buildDummyTickets(now);
}

/** Look up a single purchased ticket by its id. */
export function getTicketById(id: string, now: number = Date.now()): PurchasedTicket | undefined {
  return buildDummyTickets(now).find((t) => t.id === id);
}

/** The public event a ticket was purchased for (image, title, venue, …). */
export function getTicketEvent(ticket: PurchasedTicket): Event | undefined {
  return dummyEvents.find((e) => e.id === ticket.eventId);
}

/**
 * Derives the event-time state of a ticket from its entry window and check-in.
 * A scanned ticket is "used"; after the window it's "expired"; inside the
 * window it's "live"; before it, "upcoming".
 */
export function getTicketState(
  ticket: PurchasedTicket,
  now: number = Date.now(),
): TicketState {
  if (ticket.checkedInAt) return "used";
  const start = new Date(ticket.eventStart).getTime();
  const end = new Date(ticket.eventEnd).getTime();
  if (now > end) return "expired";
  if (now >= start) return "live";
  return "upcoming";
}

/** A ticket is scannable at entry only while it is live and unused. */
export function isTicketUsable(ticket: PurchasedTicket, now: number = Date.now()): boolean {
  return getTicketState(ticket, now) === "live";
}

// A fixed display zone keeps server-rendered and client-hydrated dates/times
// identical (no hydration mismatch) and deterministic across viewers. UTC is
// used here for the mock; a real app would store an IANA zone per event.
const EVENT_TIME_ZONE = "UTC";
const DATE_FMT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: EVENT_TIME_ZONE,
};
const TIME_FMT: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
  timeZone: EVENT_TIME_ZONE,
  timeZoneName: "short",
};

export function formatEventDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("en-US", DATE_FMT);
}

export function formatEventTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString("en-US", TIME_FMT);
}

/**
 * Human "2d 4h" / "3h 12m" / "5m" countdown between now and a target time.
 * Returns "" once the target has passed.
 */
export function formatCountdown(targetIso: string, now: number = Date.now()): string {
  const diff = new Date(targetIso).getTime() - now;
  if (diff <= 0) return "";

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${Math.max(minutes, 1)}m`;
}

/**
 * Builds the QR payload for a ticket: a base64 JSON of just the ticket id and
 * an expiry hint — no name, email, or other identity. Mirrors the payload shape
 * already used by QRCodeModal.
 *
 * DEMO ONLY: this is base64, not encryption or a signed credential, and it is
 * forgeable. A production gate would need a server-issued, time-bounded, signed
 * entry credential that the scanner verifies.
 */
export function buildTicketQrPayload(ticket: PurchasedTicket): string {
  const payload = {
    id: ticket.id,
    expMs: new Date(ticket.eventEnd).getTime(),
  };
  // btoa exists in the browser; Buffer covers the server render.
  if (typeof btoa === "function") return btoa(JSON.stringify(payload));
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/**
 * A demo "proof without identity" token illustrating the zero-knowledge sharing
 * concept. Deliberately contains no PII — only the event, a validity window,
 * and an opaque proof id — so sharing it reveals nothing about who holds the
 * ticket.
 *
 * DEMO ONLY: this is an unsigned base64 token, not a real zero-knowledge proof.
 * It demonstrates the "no personal data" idea but is not cryptographically
 * verifiable and must not be treated as proof of ownership. A production version
 * needs a server-verified signed proof or an actual ZKP protocol.
 */
export function buildPrivateProof(ticket: PurchasedTicket): string {
  const proof = {
    kind: "zk-ownership-proof",
    eventId: ticket.eventId,
    validUntilMs: new Date(ticket.eventEnd).getTime(),
    proofId: `zkp_${ticket.id}_${Math.random().toString(36).slice(2, 10)}`,
  };
  if (typeof btoa === "function") return btoa(JSON.stringify(proof));
  return Buffer.from(JSON.stringify(proof)).toString("base64");
}
