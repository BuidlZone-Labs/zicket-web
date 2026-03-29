"use client";

import { useEffect, useState } from "react";
import {
  getTicketAvailability,
  subscribeTicketAvailability,
} from "@/lib/availability/simulatedTicketAvailability";

export function useSimulatedAvailability(eventId: string | undefined) {
  const [slotsLeft, setSlotsLeft] = useState(() =>
    eventId ? getTicketAvailability(eventId) : 0
  );

  useEffect(() => {
    if (!eventId) {
      setSlotsLeft(0);
      return;
    }

    setSlotsLeft(getTicketAvailability(eventId));
    return subscribeTicketAvailability(() => {
      setSlotsLeft(getTicketAvailability(eventId));
    });
  }, [eventId]);

  return {
    slotsLeft,
    isSoldOut: slotsLeft <= 0,
  };
}
