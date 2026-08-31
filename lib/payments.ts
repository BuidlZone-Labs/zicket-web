/**
 * Authoritative Server-Side Payment Verification & Store Module
 *
 * Enforces payment authenticity, idempotency, atomic lock handling for
 * concurrency, user ownership verification, and payment finality checks.
 */

export interface PaymentRecord {
  txHash: string;
  attemptId?: string;
  eventId: string;
  userAddress: string;
  amount: number;
  currency?: string;
  status: "pending" | "confirmed" | "failed";
  createdAt: string;
  confirmedAt?: string;
  error?: string;
  reconciledTicketId?: string;
  reconciledAt?: string;
}

class PaymentStore {
  private payments = new Map<string, PaymentRecord>();
  private attemptToTx = new Map<string, string>();
  private activeLocks = new Set<string>();

  /**
   * Registers a payment record in the authoritative store.
   */
  public registerPayment(record: PaymentRecord): PaymentRecord {
    const existing = this.payments.get(record.txHash);
    const updated: PaymentRecord = existing
      ? { ...existing, ...record }
      : { ...record };

    this.payments.set(record.txHash, updated);

    if (record.attemptId) {
      this.attemptToTx.set(record.attemptId, record.txHash);
    }

    return updated;
  }

  /**
   * Retrieves a payment record by transaction hash or attempt identifier.
   */
  public getPayment(txHashOrAttemptId: string): PaymentRecord | undefined {
    if (this.payments.has(txHashOrAttemptId)) {
      return this.payments.get(txHashOrAttemptId);
    }

    const mappedTxHash = this.attemptToTx.get(txHashOrAttemptId);
    if (mappedTxHash && this.payments.has(mappedTxHash)) {
      return this.payments.get(mappedTxHash);
    }

    return undefined;
  }

  /**
   * Updates payment status.
   */
  public updatePaymentStatus(
    txHash: string,
    status: "pending" | "confirmed" | "failed",
    error?: string,
  ): PaymentRecord | undefined {
    const record = this.payments.get(txHash);
    if (!record) return undefined;

    record.status = status;
    if (error) record.error = error;
    if (status === "confirmed") {
      record.confirmedAt = new Date().toISOString();
    }
    this.payments.set(txHash, record);
    return record;
  }

  /**
   * Marks a payment as reconciled to a specific ticket ID.
   */
  public markReconciled(txHash: string, ticketId: string): PaymentRecord | undefined {
    const record = this.getPayment(txHash);
    if (!record) return undefined;

    record.reconciledTicketId = ticketId;
    record.reconciledAt = new Date().toISOString();
    this.payments.set(record.txHash, record);
    return record;
  }

  /**
   * Acquires an atomic lock for a given reconciliation key (e.g. attemptId or txHash).
   * Returns true if lock was acquired, false if lock is currently held by another request.
   */
  public acquireLock(key: string): boolean {
    if (this.activeLocks.has(key)) {
      return false;
    }
    this.activeLocks.add(key);
    return true;
  }

  /**
   * Releases an atomic lock.
   */
  public releaseLock(key: string): void {
    this.activeLocks.delete(key);
  }

  /**
   * Resets internal store state (intended for testing environments).
   */
  public reset(): void {
    this.payments.clear();
    this.attemptToTx.clear();
    this.activeLocks.clear();
  }
}

export const paymentStore = new PaymentStore();

export interface VerificationResult {
  ok: boolean;
  statusCode?: number;
  error?: string;
  payment?: PaymentRecord;
  reconciledTicketId?: string;
  deduplicated?: boolean;
}

/**
 * Server-side payment verification invariant enforcement.
 */
export function verifyPaymentServerSide(params: {
  txHash?: string;
  attemptId?: string;
  eventId: string;
  userAddress?: string;
  expectedPrice: number;
}): VerificationResult {
  const paymentKey = params.txHash || params.attemptId;

  if (!paymentKey) {
    return {
      ok: false,
      statusCode: 400,
      error: "Payment verification requires a transaction hash or payment identifier.",
    };
  }

  const payment = paymentStore.getPayment(paymentKey);

  if (!payment) {
    return {
      ok: false,
      statusCode: 404,
      error: "No payment transaction record was found for the provided identifier.",
    };
  }

  if (payment.status === "pending") {
    return {
      ok: false,
      statusCode: 409,
      error: "Payment transaction is still pending on-chain confirmation.",
    };
  }

  if (payment.status === "failed") {
    return {
      ok: false,
      statusCode: 402,
      error: payment.error || "Payment transaction failed or reverted on-chain.",
    };
  }

  if (payment.status !== "confirmed") {
    return {
      ok: false,
      statusCode: 409,
      error: "Payment is not yet fully confirmed.",
    };
  }

  // Event ID mismatch check
  if (payment.eventId !== params.eventId) {
    return {
      ok: false,
      statusCode: 409,
      error: "Payment transaction does not correspond to this event.",
    };
  }

  // Price / Amount validation check
  if (payment.amount < params.expectedPrice) {
    return {
      ok: false,
      statusCode: 422,
      error: `Payment amount (${payment.amount}) is less than required price (${params.expectedPrice}).`,
    };
  }

  // User ownership validation check
  if (params.userAddress) {
    const normalizedUser = params.userAddress.trim().toLowerCase();
    const normalizedOwner = payment.userAddress.trim().toLowerCase();
    if (normalizedUser !== normalizedOwner) {
      return {
        ok: false,
        statusCode: 403,
        error: "Authenticated user is not authorized to reconcile this payment.",
      };
    }
  }

  // Replay check
  if (payment.reconciledTicketId) {
    return {
      ok: true,
      payment,
      reconciledTicketId: payment.reconciledTicketId,
      deduplicated: true,
    };
  }

  return {
    ok: true,
    payment,
    deduplicated: false,
  };
}
