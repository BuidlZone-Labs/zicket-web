/**
 * Lazy loader for the Wallet SDK.
 *
 * This module is the single source of truth for all dynamic import logic.
 * Both TicketInfo and ConnectWalletPrompt import from here.
 *
 * **Architecture**: SDK module loading is cached (loaded once per session),
 * but transaction signing is always executed fresh so every payment attempt
 * receives a unique transaction hash. Retries, subsequent purchases, and
 * concurrent wallet connections never reuse a stale signature.
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

//──────────────────────────────────────────────────────────────────────────────
// Internal: SDK module loading cache
//──────────────────────────────────────────────────────────────────────────────

/** Cached SDK instance — loaded once per session, shared across all callers. */
let sdkLoadPromise: Promise<WalletSDK> | null = null;

/**
 * Dynamically imports (or returns the cached) wallet SDK module.
 * Safe to call concurrently — in-flight requests share the same promise.
 */
async function getOrLoadSDK(): Promise<WalletSDK> {
  if (!sdkLoadPromise) {
    const current = new Promise<WalletSDK>((resolve) =>
      setTimeout(
        () =>
          resolve({
            connect: async () => ({
              address: "0x" + Math.random().toString(36).slice(2, 10),
            }),
            disconnect: async () => {},
            isConnected: () => true,
          }),
        1500
      )
    );
    sdkLoadPromise = current;

    // Clear on failure only so a failed load can be retried.
    // On success the SDK stays cached — subsequent signTransaction() calls
    // reuse it without reloading.
    const clearIfCurrent = () => {
      if (sdkLoadPromise === current) sdkLoadPromise = null;
    };
    void current.then(undefined, clearIfCurrent);
  }
  return sdkLoadPromise;
}

//──────────────────────────────────────────────────────────────────────────────
// Public API
//──────────────────────────────────────────────────────────────────────────────

/**
 * Loads and connects the wallet SDK. The SDK module is only loaded once;
 * subsequent calls reuse the cached instance.
 *
 * Returns the connected SDK instance for callers that need the wallet address
 * or need to call other SDK methods.
 */
export async function loadWalletSDK(): Promise<WalletSDK> {
  const sdk = await getOrLoadSDK();
  await sdk.connect();
  return sdk;
}

/**
 * Signs a new transaction and returns a unique transaction hash.
 *
 * Unlike the cached SDK module, this ALWAYS executes fresh — every call
 * generates a new cryptographic signature. Safe for retries, subsequent
 * purchases, and concurrent payments — no hash is ever reused.
 *
 * Returns: txHash string — used by the transaction lifecycle tracker in TicketInfo.
 */
export async function signTransaction(): Promise<string> {
  await loadWalletSDK(); // ensure SDK is loaded AND wallet is connected

  // ── MOCK (development only) ───────────────────────────────────────────────
  // Simulates ~500 ms signing latency and returns a fresh fake Solana-style
  // transaction hash every call. Remove this block when the real SDK is wired.
  return new Promise<string>((resolve) =>
    setTimeout(
      () => resolve("mock_tx_" + Math.random().toString(36).slice(2, 18)),
      500
    )
  );
  // ── END MOCK ──────────────────────────────────────────────────────────────

  // TODO: Replace the mock above with the real implementation once the Azguard
  // SDK package is added to package.json. The wired version should look like:
  //
  //   const sdk = await getOrLoadSDK();
  //   const { txHash } = await sdk.signAndSendTransaction({ ... });
  //   return txHash;
}

/**
 * Kicks off the SDK import without awaiting — safe to call on hover/focus.
 * Errors are intentionally swallowed here; they will surface on the next
 * loadWalletSDK() or signTransaction() call. On failure the singleton is
 * reset so a retry is possible.
 */
export function preloadWalletSDK(): void {
  const current = getOrLoadSDK();
  current.catch(() => {
    // Guard by identity so a concurrent load started after this failure
    // isn't clobbered.
    if (sdkLoadPromise === current) sdkLoadPromise = null;
  });
}