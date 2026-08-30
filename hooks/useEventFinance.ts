"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { EventFinance } from "@/lib/organizer/finance";

/** Sales land continuously, so the settlement view re-reads on a short beat. */
const DEFAULT_POLL_MS = 15_000;

export interface UseEventFinanceOptions {
  pollIntervalMs?: number;
}

export interface UseEventFinanceResult {
  finance: EventFinance | null;
  /** True only for the first load — a background refresh never blanks the UI. */
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  /** Re-reads immediately, e.g. right after a settlement confirms. */
  refresh: () => Promise<void>;
  /** Adopts a snapshot returned by a mutation, skipping a round trip. */
  applyFinance: (finance: EventFinance) => void;
}

/**
 * Streams an event's settlement position from the organizer finance API.
 *
 * Polls on an interval and pauses while the tab is hidden, so a backgrounded
 * dashboard isn't burning requests. In-flight responses carry the generation
 * they were issued for and are dropped if the event id changed or the hook
 * unmounted, so a slow response can't overwrite a newer one.
 */
export function useEventFinance(
  eventId: string,
  { pollIntervalMs = DEFAULT_POLL_MS }: UseEventFinanceOptions = {}
): UseEventFinanceResult {
  const [finance, setFinance] = useState<EventFinance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generationRef = useRef(0);
  const inFlightRef = useRef(false);

  const load = useCallback(async () => {
    if (inFlightRef.current) return;
    const generation = generationRef.current;

    inFlightRef.current = true;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/organizer/events/${encodeURIComponent(eventId)}/finance`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Couldn't load settlement data (HTTP ${res.status}).`);
      const data = (await res.json()) as EventFinance;

      if (generation !== generationRef.current) return;
      setFinance(data);
      setError(null);
    } catch (err) {
      if (generation !== generationRef.current) return;
      setError(
        err instanceof Error ? err.message : "Couldn't load settlement data. Please try again."
      );
    } finally {
      if (generation === generationRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
      inFlightRef.current = false;
    }
  }, [eventId]);

  useEffect(() => {
    // Invalidate anything in flight for a previous event id.
    generationRef.current += 1;
    setIsLoading(true);
    setFinance(null);
    void load();

    const timer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      void load();
    }, pollIntervalMs);

    return () => {
      generationRef.current += 1;
      clearInterval(timer);
    };
  }, [load, pollIntervalMs]);

  const applyFinance = useCallback((next: EventFinance) => {
    setFinance(next);
    setError(null);
    setIsLoading(false);
  }, []);

  return { finance, isLoading, isRefreshing, error, refresh: load, applyFinance };
}
