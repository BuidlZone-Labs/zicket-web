/**
 * Shared contract every chain-specific wallet adapter implements. Keeping this
 * chain-agnostic lets `lib/walletSdk.ts` route connect/sign calls to whichever
 * network (Stellar today, Aztec next) without the UI layer knowing the
 * difference.
 */

export type WalletChain = "stellar" | "aztec";

export interface WalletAccount {
  address: string;
  chain: WalletChain;
  /** Human-readable wallet name, e.g. "Freighter", "Lobstr", "Azguard". */
  walletName: string;
}

export interface SignedTransactionResult {
  /** Network transaction hash — usable for on-chain lookups/explorers. */
  txHash: string;
  /** Raw signed payload (signed XDR for Stellar, tx object for Aztec). */
  signedPayload: string;
}

export interface WalletAdapter {
  readonly chain: WalletChain;
  /** Opens the wallet's connection UI (or the multi-wallet picker) and returns the connected account. */
  connect(): Promise<WalletAccount>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getAccount(): WalletAccount | null;
  /**
   * Signs (and submits, where the chain requires it) a transaction and
   * returns the resulting on-chain hash. `payload` is chain-specific
   * (e.g. an unsigned XDR for Stellar); omit it to sign the adapter's
   * built-in demo transaction.
   */
  signTransaction(payload?: string): Promise<SignedTransactionResult>;
}

export class WalletNotInstalledError extends Error {
  constructor(walletName: string) {
    super(`${walletName} is not installed or not detected in this browser.`);
    this.name = "WalletNotInstalledError";
  }
}
