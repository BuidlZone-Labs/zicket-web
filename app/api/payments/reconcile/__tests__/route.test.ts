import { describe, expect, it, beforeEach } from "vitest";
import { POST } from "../route";
import { paymentStore, resetReconcileState } from "@/lib/payments";

describe("POST /api/payments/reconcile API Security & Integration Tests", () => {
  beforeEach(() => {
    resetReconcileState();
  });

  // --------------------------------------------------------------------------
  // 1. Authentication & Authorization
  // --------------------------------------------------------------------------
  describe("Authentication & Authorization", () => {
    it("rejects request with 401 when invalid token authentication is provided", async () => {
      const req = new Request("http://localhost:3000/api/payments/reconcile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer INVALID_TOKEN",
        },
        body: JSON.stringify({
          attemptId: "attempt-auth-1",
          eventId: "naija-tech-summit",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.ok).toBe(false);
      expect(body.error).toMatch(/invalid or expired/i);
    });

    it("rejects request with 403 when authenticated user attempts to reconcile another user's payment", async () => {
      // Register a payment legitimately owned by USER_A
      paymentStore.registerPayment({
        txHash: "tx-user-a-payment",
        attemptId: "attempt-user-a",
        eventId: "solana-summer-hackathon",
        userAddress: "GUSER_A_ADDRESS_12345",
        amount: 1500,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      });

      // Attacker USER_B attempts to claim USER_A's payment
      const req = new Request("http://localhost:3000/api/payments/reconcile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer GUSER_B_ATTACKER_99999",
        },
        body: JSON.stringify({
          attemptId: "attempt-user-b-claim",
          eventId: "solana-summer-hackathon",
          txHash: "tx-user-a-payment",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.ok).toBe(false);
      expect(body.error).toMatch(/not authorized/i);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Client-Controlled Payment Status & Forgery Prevention
  // --------------------------------------------------------------------------
  describe("Client-Controlled Payload Forgery", () => {
    it("rejects request containing isPaid: true and isConfirmed: true without verified server payment", async () => {
      const req = new Request("http://localhost:3000/api/payments/reconcile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer GBUYER_ADDRESS_123",
        },
        body: JSON.stringify({
          attemptId: "attempt-forged-payload",
          eventId: "solana-summer-hackathon", // Paid event ($1500)
          isPaid: true,
          isConfirmed: true,
        }),
      });

      const res = await POST(req);
      // Must be rejected with 402/404 because no server payment exists
      expect([402, 404]).toContain(res.status);
      const body = await res.json();
      expect(body.ok).toBe(false);
      expect(body.ticketId).toBeUndefined();
    });

    it("toggling isPaid: false to isPaid: true does not bypass server payment verification", async () => {
      const reqPaidFalse = new Request("http://localhost:3000/api/payments/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: "attempt-toggle-1",
          eventId: "solana-summer-hackathon",
          isPaid: false,
          isConfirmed: true,
        }),
      });

      const res1 = await POST(reqPaidFalse);
      expect([402, 404]).toContain(res1.status);

      resetReconcileState();

      const reqPaidTrue = new Request("http://localhost:3000/api/payments/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: "attempt-toggle-1",
          eventId: "solana-summer-hackathon",
          isPaid: true,
          isConfirmed: true,
        }),
      });

      const res2 = await POST(reqPaidTrue);
      expect([402, 404]).toContain(res2.status);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Fake, Unpaid, or Invalid Payment Identifiers
  // --------------------------------------------------------------------------
  describe("Fake / Invalid Payment Verification", () => {
    it("rejects non-existent payment ID or fake transaction hash with 404", async () => {
      const req = new Request("http://localhost:3000/api/payments/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: "attempt-fake-tx",
          eventId: "solana-summer-hackathon",
          txHash: "0xfake_tx_hash_does_not_exist",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.ok).toBe(false);
    });

    it("rejects unconfirmed (pending) payment with 409 Conflict", async () => {
      paymentStore.registerPayment({
        txHash: "tx-pending-123",
        eventId: "solana-summer-hackathon",
        userAddress: "GBUYER_123",
        amount: 1500,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      const req = new Request("http://localhost:3000/api/payments/reconcile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer GBUYER_123",
        },
        body: JSON.stringify({
          attemptId: "attempt-pending",
          eventId: "solana-summer-hackathon",
          txHash: "tx-pending-123",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.ok).toBe(false);
      expect(body.error).toMatch(/pending/i);
    });

    it("rejects failed on-chain payment with 402 Payment Required", async () => {
      paymentStore.registerPayment({
        txHash: "tx-failed-123",
        eventId: "solana-summer-hackathon",
        userAddress: "GBUYER_123",
        amount: 1500,
        status: "failed",
        error: "Transaction reverted on-chain.",
        createdAt: new Date().toISOString(),
      });

      const req = new Request("http://localhost:3000/api/payments/reconcile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer GBUYER_123",
        },
        body: JSON.stringify({
          attemptId: "attempt-failed-tx",
          eventId: "solana-summer-hackathon",
          txHash: "tx-failed-123",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(402);
      const body = await res.json();
      expect(body.ok).toBe(false);
      expect(body.error).toMatch(/reverted|failed/i);
    });

    it("rejects payment belonging to another event with 409", async () => {
      paymentStore.registerPayment({
        txHash: "tx-wrong-event-123",
        eventId: "web3-bootcamp-nairobi", // Nairobi bootcamp event
        userAddress: "GBUYER_123",
        amount: 1500,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      });

      const req = new Request("http://localhost:3000/api/payments/reconcile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer GBUYER_123",
        },
        body: JSON.stringify({
          attemptId: "attempt-wrong-event",
          eventId: "solana-summer-hackathon", // Trying to use it for Solana event
          txHash: "tx-wrong-event-123",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.ok).toBe(false);
      expect(body.error).toMatch(/does not correspond/i);
    });

    it("rejects payment with insufficient amount with 422 Unprocessable Entity", async () => {
      paymentStore.registerPayment({
        txHash: "tx-insufficient-amount",
        eventId: "solana-summer-hackathon",
        userAddress: "GBUYER_123",
        amount: 100, // Price required is 1500
        status: "confirmed",
        createdAt: new Date().toISOString(),
      });

      const req = new Request("http://localhost:3000/api/payments/reconcile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer GBUYER_123",
        },
        body: JSON.stringify({
          attemptId: "attempt-insufficient",
          eventId: "solana-summer-hackathon",
          txHash: "tx-insufficient-amount",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.ok).toBe(false);
      expect(body.error).toMatch(/less than required price/i);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Genuine Payment Verification & Replay Protection
  // --------------------------------------------------------------------------
  describe("Legitimate Payment Reconcile & Idempotency", () => {
    it("successfully issues a valid ticket for a genuinely verified payment", async () => {
      paymentStore.registerPayment({
        txHash: "tx-genuine-paid-100",
        attemptId: "attempt-genuine-100",
        eventId: "solana-summer-hackathon",
        userAddress: "GBUYER_GENUINE_777",
        amount: 1500,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      });

      const req = new Request("http://localhost:3000/api/payments/reconcile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer GBUYER_GENUINE_777",
        },
        body: JSON.stringify({
          attemptId: "attempt-genuine-100",
          eventId: "solana-summer-hackathon",
          txHash: "tx-genuine-paid-100",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.ticketId).toBeDefined();
      expect(body.ticketId).toContain("solana-summer-hackathon");
      expect(body.deduplicated).toBe(false);
    });

    it("reconciling the same payment twice returns the same ticket without issuing a second ticket", async () => {
      paymentStore.registerPayment({
        txHash: "tx-genuine-paid-200",
        attemptId: "attempt-genuine-200",
        eventId: "solana-summer-hackathon",
        userAddress: "GBUYER_GENUINE_777",
        amount: 1500,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      });

      const makeReq = () =>
        new Request("http://localhost:3000/api/payments/reconcile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer GBUYER_GENUINE_777",
          },
          body: JSON.stringify({
            attemptId: "attempt-genuine-200",
            eventId: "solana-summer-hackathon",
            txHash: "tx-genuine-paid-200",
          }),
        });

      // First call
      const res1 = await POST(makeReq());
      expect(res1.status).toBe(200);
      const body1 = await res1.json();
      expect(body1.ok).toBe(true);
      expect(body1.deduplicated).toBe(false);

      // Second call (replay)
      const res2 = await POST(makeReq());
      expect(res2.status).toBe(200);
      const body2 = await res2.json();
      expect(body2.ok).toBe(true);
      expect(body2.deduplicated).toBe(true);
      expect(body2.ticketId).toBe(body1.ticketId);
    });

    it("prevents concurrent reconciliation requests from generating duplicate tickets", async () => {
      paymentStore.registerPayment({
        txHash: "tx-concurrent-500",
        attemptId: "attempt-concurrent-500",
        eventId: "solana-summer-hackathon",
        userAddress: "GBUYER_CONCURRENT_888",
        amount: 1500,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      });

      const makeReq = () =>
        new Request("http://localhost:3000/api/payments/reconcile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer GBUYER_CONCURRENT_888",
          },
          body: JSON.stringify({
            attemptId: "attempt-concurrent-500",
            eventId: "solana-summer-hackathon",
            txHash: "tx-concurrent-500",
          }),
        });

      // Execute concurrent requests simultaneously
      const [res1, res2] = await Promise.all([POST(makeReq()), POST(makeReq())]);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);

      const body1 = await res1.json();
      const body2 = await res2.json();

      expect(body1.ticketId).toBe(body2.ticketId);
      // One request mints, the second receives deduplicated ticket
      const dedupeStates = [body1.deduplicated, body2.deduplicated];
      expect(dedupeStates).toContain(false);
      expect(dedupeStates).toContain(true);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Free Event Registration Regression
  // --------------------------------------------------------------------------
  describe("Free Event Registration", () => {
    it("allows free event registration without requiring payment transaction", async () => {
      const req = new Request("http://localhost:3000/api/payments/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: "attempt-free-1",
          eventId: "naija-tech-summit", // Free event (isPaid: false)
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.ticketId).toBeDefined();
      expect(body.deduplicated).toBe(false);
    });

    it("returns 404 for unknown event ID", async () => {
      const req = new Request("http://localhost:3000/api/payments/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: "attempt-unknown-evt",
          eventId: "non-existent-event-id",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.ok).toBe(false);
      expect(body.error).toMatch(/unknown event/i);
    });

    it("returns 400 when missing attemptId or eventId", async () => {
      const req = new Request("http://localhost:3000/api/payments/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: "naija-tech-summit",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.ok).toBe(false);
    });
  });
});
