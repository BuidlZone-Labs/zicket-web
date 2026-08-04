/**
 * Aztec wallet adapter — targets the Azguard Wallet browser extension (the
 * closest thing to a "Aztec Passport" today), which injects a `window.azguard`
 * provider following the same request({ method, params }) shape most injected
 * wallets use.
 *
 * CAUTION: Aztec's wallet-connection standard is still young and Azguard's
 * exact RPC method names may drift between versions. `connect()` / account
 * discovery below follow the documented `window.azguard.connect()` +
 * `.request()` pattern; verify the method names against the installed
 * `@aztec/aztec.js` / Azguard docs before relying on this in production —
 * the same caveat the previous mock implementation carried for this chain.
 */
import { AztecAddress } from "@aztec/aztec.js";
import type { SignedTransactionResult, WalletAccount, WalletAdapter } from "./types";
import { WalletNotInstalledError } from "./types";

interface AzguardProvider {
  connect: (chainId?: string) => Promise<{ address: string }>;
  disconnect?: () => Promise<void>;
  request: <T = unknown>(args: { method: string; params?: unknown[] }) => Promise<T>;
}

function getAzguardProvider(): AzguardProvider | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { azguard?: AzguardProvider }).azguard ?? null;
}

class AztecWalletAdapter implements WalletAdapter {
  readonly chain = "aztec" as const;
  private account: WalletAccount | null = null;

  isConnected(): boolean {
    return this.account !== null;
  }

  getAccount(): WalletAccount | null {
    return this.account;
  }

  async connect(): Promise<WalletAccount> {
    const provider = getAzguardProvider();
    if (!provider) {
      throw new WalletNotInstalledError("Azguard (Aztec)");
    }

    const { address } = await provider.connect();
    // Validates the address is a well-formed Aztec address before trusting it.
    AztecAddress.fromString(address);

    this.account = { address, chain: "aztec", walletName: "Azguard" };
    return this.account;
  }

  async disconnect(): Promise<void> {
    const provider = getAzguardProvider();
    await provider?.disconnect?.();
    this.account = null;
  }

  async signTransaction(payload?: string): Promise<SignedTransactionResult> {
    const provider = getAzguardProvider();
    if (!provider || !this.account) {
      throw new Error("Connect an Aztec wallet before signing a transaction.");
    }

    // TODO: replace with the real Aztec PXE transaction-execution request once
    // the ticket-purchase contract call is defined (destination contract,
    // function selector, and args). `send_transaction` mirrors Azguard's
    // documented request method name at the time of writing.
    const result = await provider.request<{ txHash: string }>({
      method: "send_transaction",
      params: [payload ?? { memo: "zicket-ticket" }],
    });

    return { txHash: result.txHash, signedPayload: payload ?? "" };
  }
}

export const aztecWalletAdapter: WalletAdapter = new AztecWalletAdapter();
