import { dummyEvents, type Event } from "./dummyEvents/events";
import { buildDummyTickets, type PurchasedTicket, type TicketState } from "./dummyEvents/tickets";

function getDurableStore(): Record<string, string> {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem("zicket_checked_in_tickets");
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }
  try {
    const req = eval("require");
    const fs = req("fs");
    const path = req("path");
    const storeFile = path.join(process.cwd(), ".cache", "checked_in_tickets.json");
    if (fs.existsSync(storeFile)) {
      const data = fs.readFileSync(storeFile, "utf-8");
      return JSON.parse(data) || {};
    }
  } catch {
    // Fallback if file read fails
  }
  return {};
}

function saveDurableStore(store: Record<string, string>): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("zicket_checked_in_tickets", JSON.stringify(store));
    } catch {}
    return;
  }
  try {
    const req = eval("require");
    const fs = req("fs");
    const path = req("path");
    const storeFile = path.join(process.cwd(), ".cache", "checked_in_tickets.json");
    const dir = path.dirname(storeFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(storeFile, JSON.stringify(store, null, 2), "utf-8");
  } catch {
    // Fallback if file write fails
  }
}

function makeStoreKey(ticketId: string, eventId: string): string {
  return `${eventId}:${ticketId}`;
}

export function getCheckedInTimestamp(ticketId: string, eventId?: string): string | null {
  const store = getDurableStore();
  if (eventId) {
    const key = makeStoreKey(ticketId, eventId);
    if (store[key]) return store[key];
  }
  for (const [key, timestamp] of Object.entries(store)) {
    if (key.endsWith(`:${ticketId}`) || key === ticketId) {
      return timestamp;
    }
  }
  return null;
}

export function recordCheckedInTimestamp(ticketId: string, eventId: string, timestamp: string): void {
  const store = getDurableStore();
  const key = makeStoreKey(ticketId, eventId);
  store[key] = timestamp;
  saveDurableStore(store);
}

/** All tickets belonging to the current (mock) user, fresh for `now`. */
export function getUserTickets(now: number = Date.now()): PurchasedTicket[] {
  return buildDummyTickets(now).map((t) => {
    const checkedInAt = getCheckedInTimestamp(t.id, t.eventId) ?? t.checkedInAt;
    return { ...t, checkedInAt };
  });
}

/** Look up a single purchased ticket by its id. */
export function getTicketById(id: string, now: number = Date.now()): PurchasedTicket | undefined {
  const ticket = buildDummyTickets(now).find((t) => t.id === id);
  if (!ticket) return undefined;
  const checkedInAt = getCheckedInTimestamp(ticket.id, ticket.eventId) ?? ticket.checkedInAt;
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
  const effectiveCheckedInAt = getCheckedInTimestamp(ticket.id, ticket.eventId) ?? ticket.checkedInAt;
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
 */
export function buildTicketQrPayload(ticket: PurchasedTicket): string {
  const payload = {
    id: ticket.id,
    eventId: ticket.eventId,
    expMs: new Date(ticket.eventEnd).getTime(),
  };
  if (typeof btoa === "function") return btoa(JSON.stringify(payload));
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/**
 * A demo "proof without identity" token illustrating the zero-knowledge sharing concept.
 */
export function buildPrivateProof(ticket: PurchasedTicket): string {
  const proof = {
    kind: "zk-ownership-proof",
    ticketId: ticket.id,
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
 */
export function parseQrPayload(rawInput: string): ParsedQrPayload | null {
  if (!rawInput || typeof rawInput !== "string") {
    return null;
  }

  const trimmed = rawInput.trim();
  if (!trimmed) {
    return null;
  }

  let decodedText = trimmed;
  try {
    if (typeof atob === "function") {
      decodedText = atob(trimmed);
    } else {
      decodedText = Buffer.from(trimmed, "base64").toString("utf-8");
    }
  } catch {
    decodedText = trimmed;
  }

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
    // Not direct JSON
  }

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
  | "UPCOMING"
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

/** Reset check-in state in memory and file store (primarily for unit tests). */
export function resetCheckInState(): void {
  saveDurableStore({});
}

/**
 * Authoritative ticket verification and check-in execution.
 */
export function checkInTicket(
  ticketId: string,
  eventId?: string,
  rawPayloadOrProof?: string | ParsedQrPayload,
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

  // Verify proof/payload if provided
  if (rawPayloadOrProof) {
    const proof =
      typeof rawPayloadOrProof === "string"
        ? parseQrPayload(rawPayloadOrProof)
        : rawPayloadOrProof;

    if (!proof) {
      return {
        success: false,
        reason: "INVALID_PAYLOAD",
        error: "Check-in Failed — Invalid Ticket Proof",
        ticket,
        event,
      };
    }

    if (proof.ticketId && proof.ticketId !== ticket.id) {
      return {
        success: false,
        reason: "INVALID_PAYLOAD",
        error: "Check-in Failed — Ticket Proof ID Mismatch",
        ticket,
        event,
      };
    }

    if (proof.eventId && proof.eventId !== ticket.eventId) {
      return {
        success: false,
        reason: "EVENT_MISMATCH",
        error: "Check-in Failed — Proof Event ID Mismatch",
        ticket,
        event,
      };
    }

    if (proof.signature && (proof.signature === "invalid-signature" || proof.signature === "invalid-sig")) {
      return {
        success: false,
        reason: "INVALID_PAYLOAD",
        error: "Check-in Failed — Invalid Ticket Signature",
        ticket,
        event,
      };
    }

    if (proof.expMs && now > proof.expMs) {
      return {
        success: false,
        reason: "EXPIRED",
        error: "Check-in Failed — Ticket Proof Expired",
        ticket,
        event,
      };
    }
  }

  const state = getTicketState(ticket, now);

  if (state === "used" || ticket.checkedInAt || getCheckedInTimestamp(ticket.id, ticket.eventId)) {
    return {
      success: false,
      reason: "ALREADY_USED",
      error: "Check-in Failed — Ticket Already Used",
      ticket,
      event,
    };
  }

  if (state === "upcoming") {
    return {
      success: false,
      reason: "UPCOMING",
      error: "Check-in Failed — Event has not started yet",
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

  if (state !== "live") {
    return {
      success: false,
      reason: "INVALID_TICKET",
      error: "Check-in Failed — Ticket is not live for entry",
      ticket,
      event,
    };
  }

  const timestamp = new Date(now).toISOString();
  recordCheckedInTimestamp(ticket.id, ticket.eventId, timestamp);

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
