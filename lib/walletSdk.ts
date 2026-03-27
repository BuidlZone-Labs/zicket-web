/**
 * Lazy loader for the Wallet SDK.
 *
 * This module is the single source of truth for all dynamic import logic.
 * Both TicketInfo and ConnectWalletPrompt import from here.
 *
 * NOTE: Replace "wallet-sdk-package" below with the actual Azguard/wallet SDK
 * package name once it is added to package.json (e.g. "@azguard/sdk" or similar).
 */

// The shape of the wallet SDK once loaded
export interface WalletSDK {
  connect: () => Promise<{ address: string }>;
  disconnect: () => Promise<void>;
  isConnected: () => boolean;
}

/**
 * Ephemeral UI state for components that trigger wallet loading.
 * Intended for use as local component state.
 */
export type WalletLoadState = {
  isLoading: boolean;   // true while the dynamic import is in-flight
  error: string | null; // non-null when the import failed
};

// Singleton promise — prevents duplicate in-flight requests (Requirements 2.4, 3.4)
let loadPromise: Promise<WalletSDK> | null = null;

/**
 * Dynamically imports the wallet SDK. Subsequent calls return the cached promise,
 * so the underlying import() factory is invoked exactly once regardless of how
 * many times this function is called concurrently or sequentially.
 *
 * Requirements: 1.2, 1.3, 2.4, 3.4
 */
export async function loadWalletSDK(): Promise<WalletSDK> {
  if (!loadPromise) {
    // TODO: Replace the dynamic import below with the actual package, e.g.:
    //   loadPromise = import("@azguard/sdk").then((mod) => (mod.default ?? mod) as WalletSDK);
    loadPromise = Promise.reject(
      new Error("Wallet SDK package is not yet configured. Replace the placeholder in lib/walletSdk.ts.")
    );
    // Reset on failure so callers can retry once the real package is wired up
    loadPromise.catch(() => {
      loadPromise = null;
    });
  }
  return loadPromise;
}

/**
 * Kicks off the import without awaiting — safe to call on hover/focus.
 * Errors are intentionally swallowed here; they will surface on the next
 * loadWalletSDK() call. On failure the singleton is reset so a retry is possible.
 *
 * Requirements: 2.1, 2.2, 2.3
 */
export function preloadWalletSDK(): void {
  loadWalletSDK().catch(() => {
    // Reset so a retry is possible on the next loadWalletSDK() call
    loadPromise = null;
  });
}
