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
  // TODO: add signAndSendTransaction once the real SDK is wired
  // signAndSendTransaction: (params: unknown) => Promise<{ txHash: string }>;
}

/**
 * Ephemeral UI state for components that trigger wallet loading.
 * Intended for use as local component state.
 */
export type WalletLoadState = {
  isLoading: boolean;   // true while the dynamic import is in-flight
  error: string | null; // non-null when the import failed
};

// Singleton promise — prevents duplicate in-flight requests
let loadPromise: Promise<string> | null = null;

/**
 * Dynamically imports the wallet SDK, connects the wallet, and returns the
 * transaction hash after the user signs.
 *
 * Returns: txHash string — used by the transaction lifecycle tracker in TicketInfo.
 *
 * TODO: Replace the mock below with the real implementation once the Azguard SDK
 * package is added to package.json. The wired version should look like:
 *
 *   const sdk = await import("@azguard/sdk")
 *   const { address } = await sdk.connect()
 *   const { txHash } = await sdk.signAndSendTransaction({ ... })
 *   return txHash
 */
export async function loadWalletSDK(): Promise<string> {
  if (!loadPromise) {
    // ── MOCK (development only) ───────────────────────────────────────────────
    // Simulates ~2 s of wallet connection + signing latency before returning
    // a fake Solana-style transaction hash. Remove this block when the real
    // SDK is wired up.
    const current = new Promise<string>((resolve) =>
      setTimeout(
        () => resolve("mock_tx_" + Math.random().toString(36).slice(2, 18)),
        2000
      )
    );
    loadPromise = current;
    // ── END MOCK ──────────────────────────────────────────────────────────────

    // Clear after settle so a later purchase/retry gets a fresh tx hash.
    // Without this, every "Retry Payment" reuses the first mock hash and the
    // status API keeps returning the previous terminal result forever.
    //
    // Use then(onFulfilled, onRejected) rather than finally(): finally() returns
    // a derived promise that rejects when loading fails, and nothing consumes
    // it, so it would surface as an unhandled rejection. Both handlers clear the
    // singleton; the original loadPromise is still returned so callers keep
    // seeing the real error.
    //
    // Guard by identity: only null out the singleton if it's still THIS load,
    // so a settle from an earlier load can't wipe a newer in-flight one (matters
    // once a real SDK adds awaits between creation and settle).
    const clearIfCurrent = () => {
      if (loadPromise === current) loadPromise = null;
    };
    void current.then(
      () => {
        clearIfCurrent();
      },
      () => {
        clearIfCurrent();
      },
    );
  }
  return loadPromise;
}

/**
 * Kicks off the import without awaiting — safe to call on hover/focus.
 * Errors are intentionally swallowed here; they will surface on the next
 * loadWalletSDK() call. On failure the singleton is reset so a retry is possible.
 */
export function preloadWalletSDK(): void {
  loadWalletSDK().catch(() => {
    loadPromise = null;
  });
}