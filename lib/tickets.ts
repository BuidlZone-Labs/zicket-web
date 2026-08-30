import { dummyEvents, type Event } from "./dummyEvents/events";
import { buildDummyTickets, type PurchasedTicket, type TicketState } from "./dummyEvents/tickets";

// In-memory check-in state storage for dynamic ticket status tracking across scans
const checkedInTickets = new Map<string, string>();

/** All tickets belonging to the current (mock) user, fresh for `now`. */
export function getUserTickets(now: number = Date.now()): PurchasedTicket[] {
  return buildDummyTickets(now).map((t) => {
    const checkedInAt = checkedInTickets.get(t.id) ?? t.checkedInAt;
    return { ...t, checkedInAt };
  });
}

/** Look up a single purchased ticket by its id. */
export function getTicketById(id: string, now: number = Date.now()): PurchasedTicket | undefined {
  const ticket = buildDummyTickets(now).find((t) => t.id === id);
  if (!ticket) return undefined;
  const checkedInAt = checkedInTickets.get(ticket.id) ?? ticket.checkedInAt;
  return { ...ticket, checkedInAt };
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
  const effectiveCheckedInAt = checkedInTickets.get(ticket.id) ?? ticket.checkedInAt;
  if (effectiveCheckedInAt) return "used";
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

export interface ParsedQrPayload {
  ticketId: string;
  eventId?: string;
  signature?: string;
  expMs?: number;
}

/**
 * Parses and validates an attendee QR code payload.
 * Supports:
 * - Base64 encoded JSON (as generated by QRCodeModal / buildTicketQrPayload)
 * - Raw JSON strings ({ ticketId, eventId, signature } or { id, expMs })
 * - Direct ticket ID string
 */
export function parseQrPayload(rawInput: string): ParsedQrPayload | null {
  if (!rawInput || typeof rawInput !== "string") {
    return null;
  }

  const trimmed = rawInput.trim();
  if (!trimmed) {
    return null;
  }

  // Attempt Base64 decode
  let decodedText = trimmed;
  try {
    if (typeof atob === "function") {
      decodedText = atob(trimmed);
    } else {
      decodedText = Buffer.from(trimmed, "base64").toString("utf-8");
    }
  } catch {
    // Not valid base64; fallback to raw text
    decodedText = trimmed;
  }

  // Attempt JSON parse on decoded text
  try {
    const parsed = JSON.parse(decodedText);
    if (parsed && typeof parsed === "object") {
      const ticketId = parsed.ticketId || parsed.id;
      if (typeof ticketId === "string" && ticketId.trim()) {
        return {
          ticketId: ticketId.trim(),
          eventId: typeof parsed.eventId === "string" ? parsed.eventId.trim() : undefined,
          signature: typeof parsed.signature === "string" ? parsed.signature.trim() : undefined,
          expMs: typeof parsed.expMs === "number" ? parsed.expMs : undefined,
        };
      }
    }
  } catch {
    // Not JSON
  }

  // Attempt direct JSON parse on original trimmed string if Base64 decode altered it unexpectedly
  try {
    const parsedDirect = JSON.parse(trimmed);
    if (parsedDirect && typeof parsedDirect === "object") {
      const ticketId = parsedDirect.ticketId || parsedDirect.id;
      if (typeof ticketId === "string" && ticketId.trim()) {
        return {
          ticketId: ticketId.trim(),
          eventId: typeof parsedDirect.eventId === "string" ? parsedDirect.eventId.trim() : undefined,
          signature: typeof parsedDirect.signature === "string" ? parsedDirect.signature.trim() : undefined,
          expMs: typeof parsedDirect.expMs === "number" ? parsedDirect.expMs : undefined,
        };
      }
    }
  } catch {
    // Not raw JSON
  }

  // Fallback: If trimmed looks like a valid ticket ID format (e.g. alphanumeric/hyphen string)
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { ticketId: trimmed };
  }

  return null;
}

export type CheckInReason =
  | "ALREADY_USED"
  | "INVALID_TICKET"
  | "EVENT_MISMATCH"
  | "EXPIRED"
  | "INVALID_PAYLOAD"
  | "UNAUTHORIZED";

export interface CheckInResult {
  success: boolean;
  reason?: CheckInReason;
  error?: string;
  ticket?: PurchasedTicket;
  event?: Event;
  checkedInAt?: string;
}

/** Reset in-memory check-in store (primarily for unit tests). */
export function resetCheckInState(): void {
  checkedInTickets.clear();
}

/**
 * Authoritative ticket verification and check-in execution.
 */
export function checkInTicket(
  ticketId: string,
  eventId?: string,
  now: number = Date.now()
): CheckInResult {
  const ticket = getTicketById(ticketId, now);

  if (!ticket) {
    return {
      success: false,
      reason: "INVALID_TICKET",
      error: "Check-in Failed — Invalid Ticket",
    };
  }

  const event = getTicketEvent(ticket);

  if (eventId && ticket.eventId !== eventId) {
    return {
      success: false,
      reason: "EVENT_MISMATCH",
      error: "Check-in Failed — Ticket belongs to a different event",
      ticket,
      event,
    };
  }

  const state = getTicketState(ticket, now);

  if (state === "used" || ticket.checkedInAt || checkedInTickets.has(ticket.id)) {
    return {
      success: false,
      reason: "ALREADY_USED",
      error: "Check-in Failed — Ticket Already Used",
      ticket,
      event,
    };
  }

  if (state === "expired") {
    return {
      success: false,
      reason: "EXPIRED",
      error: "Check-in Failed — Ticket Expired",
      ticket,
      event,
    };
  }

  const timestamp = new Date(now).toISOString();
  checkedInTickets.set(ticket.id, timestamp);

  const updatedTicket: PurchasedTicket = {
    ...ticket,
    checkedInAt: timestamp,
  };

  return {
    success: true,
    ticket: updatedTicket,
    event,
    checkedInAt: timestamp,
  };
}
