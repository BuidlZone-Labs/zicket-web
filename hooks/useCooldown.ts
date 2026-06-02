"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseCooldownOptions {
  duration?: number;
  key?: string;
}

const INTERVAL_MS = 1000;

export function useCooldown({ duration: defaultDuration = 10 }: UseCooldownOptions = {}) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const endRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCooldown = useCallback(
    (duration?: number) => {
      const seconds = duration ?? defaultDuration;
      const end = Date.now() + seconds * 1000;
      endRef.current = end;
      setRemainingSeconds(seconds);

      clearTimer();
      intervalRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
        setRemainingSeconds(remaining);
        if (remaining <= 0) {
          clearTimer();
          endRef.current = null;
        }
      }, INTERVAL_MS);
    },
    [defaultDuration, clearTimer],
  );

  const resetCooldown = useCallback(() => {
    clearTimer();
    endRef.current = null;
    setRemainingSeconds(0);
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const isOnCooldown = remainingSeconds > 0;

  const cooldownMessage = isOnCooldown
    ? `Please wait ${remainingSeconds}s before trying again`
    : "";

  return {
    isOnCooldown,
    remainingSeconds,
    startCooldown,
    resetCooldown,
    cooldownMessage,
  };
}
