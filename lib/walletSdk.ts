/**
 * Facade over the chain-specific wallet adapters in `lib/wallet/`.
 *
 * This module is the single source of truth for wallet loading/connect/sign
 * logic used by both `TicketInfo` (attendee checkout) and `ConnectWalletPrompt`
 * (organizer payout setup).
 *
 * **Architecture**: adapter modules are lazy-loaded (dynamic import, cached
 * once per session) so `stellar-wallets-kit` / `@aztec/aztec.js` never end up
 * in the initial bundle. Connecting always goes through the real wallet's
 * in-extension UI — there is no more mock signature generation.
 */
import type { WalletAdapter, WalletChain, WalletAccount, SignedTransactionResult } from "./wallet/types";

export type WalletSDK = WalletAdapter;

/** Ephemeral UI state for components that trigger wallet loading. */
export type WalletLoadState = {
  isLoading: boolean; // true while connecting/loading is in-flight
  error: string | null; // non-null when the connect/load failed
};

const DEFAULT_CHAIN: WalletChain = "stellar";

//──────────────────────────────────────────────────────────────────────────────
// Internal: adapter module loading cache (one promise per chain)
//──────────────────────────────────────────────────────────────────────────────

const adapterLoadPromises = new Map<WalletChain, Promise<WalletAdapter>>();
// Populated once a chain's adapter module has resolved, so already-loaded
// adapters can be read synchronously (see getConnectedAccount below).
const resolvedAdapters = new Map<WalletChain, WalletAdapter>();

async function importAdapter(chain: WalletChain): Promise<WalletAdapter> {
  if (chain === "aztec") {
    const { aztecWalletAdapter } = await import("./wallet/aztecAdapter");
    return aztecWalletAdapter;
  }
  const { stellarWalletAdapter } = await import("./wallet/stellarAdapter");
  return stellarWalletAdapter;
}

/** Dynamically imports (or returns the cached) adapter for a chain. Safe to call concurrently. */
function getOrLoadAdapter(chain: WalletChain): Promise<WalletAdapter> {
  const cached = adapterLoadPromises.get(chain);
  if (cached) return cached;

  const current = importAdapter(chain).then((adapter) => {
    resolvedAdapters.set(chain, adapter);
    return adapter;
  });
  adapterLoadPromises.set(chain, current);

  // Clear on failure only so a failed load can be retried.
  current.catch(() => {
    if (adapterLoadPromises.get(chain) === current) adapterLoadPromises.delete(chain);
  });

  return current;
}

//──────────────────────────────────────────────────────────────────────────────
// Public API
//──────────────────────────────────────────────────────────────────────────────

/**
 * Loads the adapter for `chain` and, if not already connected, opens the
 * wallet connection UI (for Stellar this is the Freighter / Lobstr /
 * WalletConnect / xBull picker). Returns the connected adapter.
 */
export async function loadWalletSDK(chain: WalletChain = DEFAULT_CHAIN): Promise<WalletAdapter> {
  const adapter = await getOrLoadAdapter(chain);
  if (!adapter.isConnected()) {
    await adapter.connect();
  }
  return adapter;
}

/** Returns the currently connected account for `chain`, if its adapter has already been loaded and connected. */
export function getConnectedAccount(chain: WalletChain = DEFAULT_CHAIN): WalletAccount | null {
  return resolvedAdapters.get(chain)?.getAccount() ?? null;
}

/**
 * Connects (if needed) and signs a transaction on `chain`, returning the real
 * on-chain transaction hash. Every call executes a fresh sign — safe for
 * retries, subsequent purchases, and concurrent payments.
 */
export async function signTransaction(chain: WalletChain = DEFAULT_CHAIN): Promise<string> {
  const adapter = await loadWalletSDK(chain);
  const result: SignedTransactionResult = await adapter.signTransaction();
  return result.txHash;
}

/**
 * Kicks off the adapter module import without awaiting — safe to call on
 * hover/focus so the wallet-kit chunk is warm before the user clicks connect.
 * Errors are swallowed here; they resurface on the next loadWalletSDK() /
 * signTransaction() call. On failure the cache entry is reset so a retry works.
 */
export function preloadWalletSDK(chain: WalletChain = DEFAULT_CHAIN): void {
  const current = getOrLoadAdapter(chain);
  current.catch(() => {
    if (adapterLoadPromises.get(chain) === current) adapterLoadPromises.delete(chain);
  });
}
