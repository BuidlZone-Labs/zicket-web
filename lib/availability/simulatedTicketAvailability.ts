import { dummyEvents } from "@/lib/dummyEvents/events";

const POLL_MS = 8_000;

const slotsByEventId = new Map<string, number>(
  dummyEvents.map((e) => [e.id, e.slotsLeft])
);

const listeners = new Set<() => void>();

let pollTimer: ReturnType<typeof setInterval> | null = null;

function notify() {
  for (const cb of listeners) cb();
}

function tick() {
  if (typeof document !== "undefined" && document.visibilityState !== "visible") {
    return;
  }

  for (const id of slotsByEventId.keys()) {
    const n = slotsByEventId.get(id) ?? 0;
    if (n <= 0) continue;
    if (Math.random() < 0.22) {
      slotsByEventId.set(id, n - 1);
    }
  }
  notify();
}

function ensurePolling() {
  if (typeof window === "undefined" || pollTimer !== null) return;
  pollTimer = setInterval(tick, POLL_MS);
}

export function getTicketAvailability(eventId: string): number {
  return slotsByEventId.get(eventId) ?? 0;
}

/** Does not stop the interval on last unsubscribe — grids often unmount all cards (e.g. loading skeleton) and must keep ticking. */
export function subscribeTicketAvailability(listener: () => void): () => void {
  listeners.add(listener);
  ensurePolling();
  return () => {
    listeners.delete(listener);
  };
}
