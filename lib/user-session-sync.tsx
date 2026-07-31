'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export type SessionState = {
  anonymousBrowsing: boolean;
  walletConnected: boolean;
};

type SessionStateUpdate = Partial<SessionState>;
type Listener = () => void;

const STORAGE_KEY = 'zicket:user-session-state';
const CHANNEL_NAME = 'zicket-user-session';

/**
 * Immutable snapshot used while rendering on the server.
 *
 * Every piece of mutable session state lives inside a store instance created by
 * `SessionProvider`, so nothing is shared between concurrent SSR requests. This
 * object is frozen to guarantee a request can never mutate it.
 */
const DEFAULT_SESSION_STATE: SessionState = Object.freeze({
  anonymousBrowsing: false,
  walletConnected: false,
});

type SessionStore = {
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => SessionState;
  getServerSnapshot: () => SessionState;
  update: (update: SessionStateUpdate) => void;
  destroy: () => void;
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

/**
 * Creates a session store scoped to a single provider, and therefore to a
 * single request during SSR. Cross-tab syncing is wired up lazily, the first
 * time a component subscribes, which only ever happens in the browser.
 */
const createSessionStore = (
  initialState: SessionState = DEFAULT_SESSION_STATE,
): SessionStore => {
  let state: SessionState = initialState;
  let initialized = false;
  let channel: BroadcastChannel | null = null;
  const listeners = new Set<Listener>();

  const notify = () => {
    listeners.forEach((listener) => listener());
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

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    const syncedState = parseState(event.newValue);
    if (syncedState) {
      applyState(syncedState);
    }
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

    window.addEventListener('storage', handleStorage);
  };

  return {
    subscribe: (listener: Listener) => {
      ensureInitialized();
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => state,
    getServerSnapshot: () => DEFAULT_SESSION_STATE,
    update: (update: SessionStateUpdate) => {
      ensureInitialized();
      applyState({ ...state, ...update }, { persist: true, broadcast: true });
    },
    destroy: () => {
      if (!initialized) {
        return;
      }

      initialized = false;
      listeners.clear();
      channel?.close();
      channel = null;

      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
    },
  };
};

const SessionStoreContext = createContext<SessionStore | null>(null);

/**
 * Scopes user session state to a component tree. On the server every render
 * gets its own store, so session state can never leak between concurrent
 * requests.
 */
export function SessionProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: SessionState;
}) {
  const [store] = useState(() => createSessionStore(initialState));

  useEffect(() => () => store.destroy(), [store]);

  return (
    <SessionStoreContext.Provider value={store}>
      {children}
    </SessionStoreContext.Provider>
  );
}

export const useUserSessionSync = () => {
  const store = useContext(SessionStoreContext);

  if (!store) {
    throw new Error(
      'useUserSessionSync must be used within a <SessionProvider>',
    );
  }

  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  const actions = useMemo(
    () => ({
      setAnonymousBrowsing: (anonymousBrowsing: boolean) =>
        store.update({ anonymousBrowsing }),
      setWalletConnected: (walletConnected: boolean) =>
        store.update({ walletConnected }),
    }),
    [store],
  );

  return {
    ...snapshot,
    ...actions,
  };
};
