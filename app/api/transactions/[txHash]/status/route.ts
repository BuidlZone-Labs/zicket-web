import { NextResponse } from "next/server";

type TxRecord = {
  createdAt: number;
};

const txStore = new Map<string, TxRecord>();

const CONFIRMATION_DELAY_MS = 10_000;
const FAILURE_RATE = 0.05;

function getStatusForTx(hash: string): {
  status: "pending" | "confirmed" | "failed";
  error?: string;
} {
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

  const result = getStatusForTx(txHash);

  return NextResponse.json(result);
}
