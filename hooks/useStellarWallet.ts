"use client";

import { useCallback, useRef, useState } from "react";
import {
  isConnected as freighterIsConnected,
  requestAccess as freighterRequestAccess,
  getNetwork as freighterGetNetwork,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import albedo from "@albedo-link/intent";
import {
  Address,
  BASE_FEE,
  Contract,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  rpc as StellarRpc,
  xdr as StellarXdr,
} from "@stellar/stellar-sdk";

export type StellarWalletId = "freighter" | "albedo";
export type StellarNetwork = "TESTNET" | "PUBLIC" | "FUTURENET";

/** Mirrors the shape components already use for the mocked wallet loader. */
export interface WalletLoadState {
  isLoading: boolean;
  error: string | null;
}

export interface StellarWalletState {
  walletId: StellarWalletId | null;
  publicKey: string | null;
  network: StellarNetwork | null;
  networkPassphrase: string | null;
  isConnecting: boolean;
  error: string | null;
}

/** A single contract-call argument, tagged so it can be converted to an ScVal. */
export type ScValArg =
  | { type: "address"; value: string }
  | { type: "addressList"; value: string[] }
  | { type: "string"; value: string }
  | { type: "symbol"; value: string }
  | { type: "u32"; value: number }
  | { type: "u64" | "i128"; value: string | number | bigint };

export interface WalletSnapshot {
  walletId: StellarWalletId;
  publicKey: string;
  network: StellarNetwork;
  networkPassphrase: string;
}

export interface ContractInvocation {
  contractId: string;
  method: string;
  args: ScValArg[];
  /** Defaults to the network's public Soroban RPC endpoint. */
  rpcUrl?: string;
}

export interface RegisterForEventParams {
  contractId: string;
  eventId: string;
  /** Defaults to the connected wallet's address. */
  attendee?: string;
  rpcUrl?: string;
  /**
   * Pass the snapshot returned by connect() when registering immediately
   * after a first-time connection -- hook state won't have re-rendered yet,
   * so signAndSubmit would otherwise read a stale (pre-connect) walletId/
   * publicKey and throw. Already-connected callers can omit this.
   */
  wallet?: WalletSnapshot;
}

export interface BatchRegisterForEventParams {
  contractId: string;
  eventId: string;
  attendees: string[];
  rpcUrl?: string;
  wallet?: WalletSnapshot;
}

// Soroban RPC endpoints are network infrastructure, not secrets -- safe to
// default and override via env for testnet/mainnet/custom deployments.
const DEFAULT_RPC_URLS: Record<StellarNetwork, string> = {
  TESTNET:
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL_TESTNET ??
    "https://soroban-testnet.stellar.org",
  PUBLIC:
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL_PUBLIC ??
    "https://mainnet.sorobanrpc.com",
  FUTURENET:
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL_FUTURENET ??
    "https://rpc-futurenet.stellar.org",
};

const NETWORK_PASSPHRASES: Record<StellarNetwork, string> = {
  TESTNET: Networks.TESTNET,
  PUBLIC: Networks.PUBLIC,
  FUTURENET: Networks.FUTURENET,
};

const WALLET_LABEL: Record<StellarWalletId, string> = {
  freighter: "Freighter",
  albedo: "Albedo",
};

const INITIAL_STATE: StellarWalletState = {
  walletId: null,
  publicKey: null,
  network: null,
  networkPassphrase: null,
  isConnecting: false,
  error: null,
};

function normalizeNetwork(raw: string | null | undefined): StellarNetwork {
  const upper = (raw ?? "").toUpperCase();
  if (upper.includes("PUBLIC") || upper === "MAINNET") return "PUBLIC";
  if (upper.includes("FUTURENET")) return "FUTURENET";
  return "TESTNET";
}

function toErrorMessage(err: unknown, walletId: StellarWalletId): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return `Something went wrong connecting to ${WALLET_LABEL[walletId]}. Please try again.`;
}

function toScVal(arg: ScValArg): StellarXdr.ScVal {
  switch (arg.type) {
    case "address":
      return nativeToScVal(arg.value, { type: "address" });
    case "addressList":
      // Each entry becomes an Address instance first so the array converts
      // to a Vec<Address> rather than a Vec<String>.
      return nativeToScVal(arg.value.map((address) => new Address(address)));
    case "string":
      return nativeToScVal(arg.value, { type: "string" });
    case "symbol":
      return nativeToScVal(arg.value, { type: "symbol" });
    case "u32":
      return nativeToScVal(arg.value, { type: "u32" });
    case "u64":
      return nativeToScVal(arg.value, { type: "u64" });
    case "i128":
      return nativeToScVal(arg.value, { type: "i128" });
  }
}

/** Routes signing to whichever wallet is connected; throws on rejection. */
async function signWithWallet(
  walletId: StellarWalletId,
  unsignedXdr: string,
  opts: { network: StellarNetwork; networkPassphrase: string; address: string }
): Promise<string> {
  if (walletId === "freighter") {
    const result = await freighterSignTransaction(unsignedXdr, {
      networkPassphrase: opts.networkPassphrase,
      address: opts.address,
    });
    if (result.error || !result.signedTxXdr) {
      throw new Error(result.error?.message ?? "Transaction signing was rejected.");
    }
    return result.signedTxXdr;
  }

  // Albedo's `tx` intent signs an already-built XDR envelope via its hosted
  // popup and hands the signed envelope straight back -- no extension needed.
  const result = await albedo.tx({
    xdr: unsignedXdr,
    network: opts.network.toLowerCase(),
    pubkey: opts.address,
  });
  if (!result?.signed_envelope_xdr) {
    throw new Error("Transaction signing was rejected.");
  }
  return result.signed_envelope_xdr;
}

/**
 * Connects to a Stellar wallet (the Freighter browser extension, or Albedo's
 * hosted signer as an extension-free fallback) and signs + submits Soroban
 * contract calls. Exposes connection state plus `registerForEvent` /
 * `batchRegisterForEvent` helpers for the ticket-purchase Soroban entrypoints.
 *
 * Network + RPC endpoint are read from the connected wallet (Freighter) or
 * default to Testnet (Albedo, which doesn't report a "current network").
 * Rejections, a missing extension, and RPC submit failures all surface
 * through `error` and are thrown from the async calls so callers can show
 * per-attempt failures without losing connection state.
 */
export function useStellarWallet() {
  const [state, setState] = useState<StellarWalletState>(INITIAL_STATE);
  // Guards a double-click / rapid re-trigger from firing two concurrent
  // connect flows against the same wallet.
  const connectingRef = useRef(false);

  const connect = useCallback(async (walletId: StellarWalletId): Promise<WalletSnapshot> => {
    if (connectingRef.current) {
      throw new Error("A wallet connection is already in progress.");
    }
    connectingRef.current = true;
    setState((s) => ({ ...s, isConnecting: true, error: null }));

    try {
      let next: StellarWalletState;

      if (walletId === "freighter") {
        const connected = await freighterIsConnected();
        if (connected.error || !connected.isConnected) {
          throw new Error(
            "Freighter wallet extension not found. Install it from freighter.app to continue."
          );
        }

        const access = await freighterRequestAccess();
        if (access.error || !access.address) {
          throw new Error(access.error?.message ?? "Wallet connection was rejected.");
        }

        const networkRes = await freighterGetNetwork();
        if (networkRes.error) {
          throw new Error(networkRes.error.message ?? "Couldn't read the wallet's network.");
        }

        next = {
          walletId: "freighter",
          publicKey: access.address,
          network: normalizeNetwork(networkRes.network),
          networkPassphrase: networkRes.networkPassphrase,
          isConnecting: false,
          error: null,
        };
      } else {
        const result = await albedo.publicKey({});
        if (!result?.pubkey) {
          throw new Error("Couldn't reach Albedo. Check your connection and try again.");
        }

        next = {
          walletId: "albedo",
          publicKey: result.pubkey,
          network: "TESTNET",
          networkPassphrase: NETWORK_PASSPHRASES.TESTNET,
          isConnecting: false,
          error: null,
        };
      }

      setState(next);
      // Returned directly (not just set on state) because callers that
      // immediately sign after connecting can't rely on this render's
      // `state` closure reflecting the update yet. The `!`s are safe: both
      // branches above always populate all four fields on success.
      return {
        walletId: next.walletId!,
        publicKey: next.publicKey!,
        network: next.network!,
        networkPassphrase: next.networkPassphrase!,
      };
    } catch (err) {
      const message = toErrorMessage(err, walletId);
      setState({ ...INITIAL_STATE, error: message });
      throw new Error(message);
    } finally {
      connectingRef.current = false;
    }
  }, []);

  const disconnect = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  /**
   * Fire-and-forget warm-up for Freighter's injected API -- safe on
   * hover/focus, before the user has committed to connecting. Errors are
   * swallowed here; connect() surfaces them for real.
   */
  const preload = useCallback((walletId: StellarWalletId) => {
    if (walletId !== "freighter") return;
    void freighterIsConnected().catch(() => {});
  }, []);

  const signAndSubmit = useCallback(
    async (invocation: ContractInvocation, wallet?: WalletSnapshot): Promise<string> => {
      const walletId = wallet?.walletId ?? state.walletId;
      const publicKey = wallet?.publicKey ?? state.publicKey;
      const network = wallet?.network ?? state.network ?? "TESTNET";
      const networkPassphrase =
        wallet?.networkPassphrase ?? state.networkPassphrase ?? NETWORK_PASSPHRASES[network];

      if (!publicKey || !walletId) {
        throw new Error("Connect a wallet before signing a transaction.");
      }

      const rpcUrl = invocation.rpcUrl ?? DEFAULT_RPC_URLS[network];
      const server = new StellarRpc.Server(rpcUrl);

      const sourceAccount = await server.getAccount(publicKey);
      const contract = new Contract(invocation.contractId);
      const scArgs = invocation.args.map(toScVal);

      const built = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase,
      })
        .addOperation(contract.call(invocation.method, ...scArgs))
        .setTimeout(60)
        .build();

      // Simulates the invocation and attaches the resulting Soroban resource
      // footprint/fees -- required before a contract call can be submitted.
      const prepared = await server.prepareTransaction(built);
      const unsignedXdr = prepared.toXDR();

      const signedXdr = await signWithWallet(walletId, unsignedXdr, {
        network,
        networkPassphrase,
        address: publicKey,
      });

      const signedTx = TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
      const sendResult = await server.sendTransaction(signedTx);

      if (sendResult.status === "ERROR") {
        throw new Error(
          sendResult.errorResult
            ? sendResult.errorResult.toString()
            : "The network rejected the transaction."
        );
      }

      if (sendResult.status === "TRY_AGAIN_LATER") {
        throw new Error("The network is busy right now. Please try again in a moment.");
      }

      return sendResult.hash;
    },
    [state.publicKey, state.walletId, state.network, state.networkPassphrase]
  );

  const registerForEvent = useCallback(
    ({ contractId, eventId, attendee, rpcUrl, wallet }: RegisterForEventParams) =>
      signAndSubmit(
        {
          contractId,
          rpcUrl,
          method: "register_for_event",
          args: [
            { type: "address", value: attendee ?? wallet?.publicKey ?? state.publicKey ?? "" },
            { type: "string", value: eventId },
          ],
        },
        wallet
      ),
    [signAndSubmit, state.publicKey]
  );

  const batchRegisterForEvent = useCallback(
    ({ contractId, eventId, attendees, rpcUrl, wallet }: BatchRegisterForEventParams) =>
      signAndSubmit(
        {
          contractId,
          rpcUrl,
          method: "batch_register_for_event",
          args: [
            { type: "addressList", value: attendees },
            { type: "string", value: eventId },
          ],
        },
        wallet
      ),
    [signAndSubmit]
  );

  return {
    ...state,
    connect,
    disconnect,
    preload,
    signAndSubmit,
    registerForEvent,
    batchRegisterForEvent,
  };
}