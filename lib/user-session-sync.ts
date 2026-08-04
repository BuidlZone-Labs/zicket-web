'use client';

import { useSyncExternalStore } from 'react';
import type { WalletAccount, WalletChain } from './wallet/types';

type SessionState = {
  anonymousBrowsing: boolean;
  walletConnected: boolean;
  walletAddress: string | null;
  walletName: string | null;
  walletChain: WalletChain | null;
};

type SessionStateUpdate = Partial<SessionState>;
type Listener = () => void;

const STORAGE_KEY = 'zicket:user-session-state';
const CHANNEL_NAME = 'zicket-user-session';

let state: SessionState = {
  anonymousBrowsing: false,
  walletConnected: false,
  walletAddress: null,
  walletName: null,
  walletChain: null,
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
      walletAddress: parsed.walletAddress ?? null,
      walletName: parsed.walletName ?? null,
      walletChain: parsed.walletChain ?? null,
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
    setWalletConnected: (walletConnected: boolean, account?: WalletAccount) =>
      updateUserSessionState({
        walletConnected,
        walletAddress: walletConnected ? (account?.address ?? null) : null,
        walletName: walletConnected ? (account?.walletName ?? null) : null,
        walletChain: walletConnected ? (account?.chain ?? null) : null,
      }),
  };
};
