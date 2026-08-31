import { NextResponse } from "next/server";
import { paymentStore, type PaymentRecord } from "@/lib/payments";

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
  const existingPayment = paymentStore.getPayment(hash);
  if (existingPayment) {
    return {
      status: existingPayment.status,
      error: existingPayment.error,
    };
  }

  let record = txStore.get(hash);

  if (!record) {
    record = { createdAt: Date.now() };
    txStore.set(hash, record);
    // Register initial record in payment store
    paymentStore.registerPayment({
      txHash: hash,
      eventId: "unknown",
      userAddress: "anonymous",
      amount: 0,
      status: "pending",
      createdAt: new Date(record.createdAt).toISOString(),
    });
  }

  const elapsed = Date.now() - record.createdAt;

  if (elapsed >= CONFIRMATION_DELAY_MS) {
    if (Math.random() < FAILURE_RATE) {
      txStore.delete(hash);
      paymentStore.updatePaymentStatus(hash, "failed", "Transaction reverted on-chain.");
      return { status: "failed", error: "Transaction reverted on-chain." };
    }
    paymentStore.updatePaymentStatus(hash, "confirmed");
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
