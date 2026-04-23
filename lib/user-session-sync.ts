'use client';

import { useSyncExternalStore } from 'react';

type SessionState = {
  anonymousBrowsing: boolean;
  walletConnected: boolean;
};

type SessionStateUpdate = Partial<SessionState>;
type Listener = () => void;

const STORAGE_KEY = 'zicket:user-session-state';
const CHANNEL_NAME = 'zicket-user-session';

let state: SessionState = {
  anonymousBrowsing: false,
  walletConnected: false,
};

let initialized = false;
let channel: BroadcastChannel | null = null;
const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const parseState = (value: string | null): SessionState | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<SessionState>;
    return {
      anonymousBrowsing: Boolean(parsed.anonymousBrowsing),
      walletConnected: Boolean(parsed.walletConnected),
    };
  } catch {
    return null;
  }
};

const persistState = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const applyState = (
  nextState: SessionState,
  options: { persist?: boolean; broadcast?: boolean } = {},
) => {
  state = nextState;

  if (options.persist) {
    persistState();
  }

  if (options.broadcast && channel) {
    channel.postMessage(nextState);
  }

  notify();
};

const ensureInitialized = () => {
  if (initialized || typeof window === 'undefined') {
    return;
  }

  initialized = true;

  const persistedState = parseState(window.localStorage.getItem(STORAGE_KEY));
  if (persistedState) {
    state = persistedState;
  } else {
    persistState();
  }

  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<SessionState>) => {
      applyState(event.data, { persist: true });
    };
  }

  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    const syncedState = parseState(event.newValue);
    if (syncedState) {
      applyState(syncedState);
    }
  });
};

export const updateUserSessionState = (update: SessionStateUpdate) => {
  ensureInitialized();
  applyState({ ...state, ...update }, { persist: true, broadcast: true });
};

export const useUserSessionSync = () => {
  ensureInitialized();

  const snapshot = useSyncExternalStore(
    (listener) => {
      ensureInitialized();
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    () => state,
    () => state,
  );

  return {
    ...snapshot,
    setAnonymousBrowsing: (anonymousBrowsing: boolean) =>
      updateUserSessionState({ anonymousBrowsing }),
    setWalletConnected: (walletConnected: boolean) =>
      updateUserSessionState({ walletConnected }),
  };
};
