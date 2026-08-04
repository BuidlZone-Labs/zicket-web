import { NextResponse } from "next/server";
import { Horizon } from "@stellar/stellar-sdk";

type TxRecord = {
  createdAt: number;
};

type TxStatus = { status: "pending" | "confirmed" | "failed"; error?: string };

const txStore = new Map<string, TxRecord>();

const CONFIRMATION_DELAY_MS = 10_000;
const FAILURE_RATE = 0.05;

// Real Stellar transaction hashes are 64 lowercase hex characters. Anything
// else (e.g. an anonymous/free-flow placeholder) falls back to the simulated
// status below, which is what the demo/dev flows have always relied on.
const STELLAR_TX_HASH_PATTERN = /^[0-9a-f]{64}$/i;

const HORIZON_URL =
  process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ??
  (process.env.NEXT_PUBLIC_STELLAR_NETWORK === "public"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org");

let horizonServer: Horizon.Server | null = null;
function getHorizonServer(): Horizon.Server {
  if (!horizonServer) horizonServer = new Horizon.Server(HORIZON_URL);
  return horizonServer;
}

/** Looks up a real, submitted Stellar transaction by hash on Horizon. */
async function getRealTxStatus(hash: string): Promise<TxStatus> {
  try {
    const record = await getHorizonServer().transactions().transaction(hash).call();
    return record.successful
      ? { status: "confirmed" }
      : { status: "failed", error: "Transaction failed on-chain." };
  } catch (err) {
    // Horizon 404s until the transaction lands in a ledger — treat that (and
    // any transient network error) as still pending rather than failed.
    return { status: "pending", error: err instanceof Error ? err.message : undefined };
  }
}

/** Deterministic-ish simulated status, used only for non-Stellar-shaped hashes (demo/dev flows). */
function getSimulatedTxStatus(hash: string): TxStatus {
  let record = txStore.get(hash);

  if (!record) {
    record = { createdAt: Date.now() };
    txStore.set(hash, record);
  }

  const elapsed = Date.now() - record.createdAt;

  if (elapsed >= CONFIRMATION_DELAY_MS) {
    if (Math.random() < FAILURE_RATE) {
      txStore.delete(hash);
      return { status: "failed", error: "Transaction reverted on-chain." };
    }
    return { status: "confirmed" };
  }

  return { status: "pending" };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ txHash: string }> },
) {
  const { txHash } = await params;

  if (!txHash || typeof txHash !== "string") {
    return NextResponse.json(
      { error: "Missing transaction hash." },
      { status: 400 },
    );
  }

  const result = STELLAR_TX_HASH_PATTERN.test(txHash)
    ? await getRealTxStatus(txHash)
    : getSimulatedTxStatus(txHash);

  return NextResponse.json(result);
}
