"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { PurchasedStage } from "./EventCheckout/PurchasedStage";
import { TicketCancellationModal } from "../TicketCancellationModal";
import { EventDetailCard } from "./EventCheckout/eventDetailsCard";
import { WhatYouWillGetCard } from "./EventCheckout/WhatYouWillGetCard";
import { OrganizerCard } from "./EventCheckout/OrganizerCard";
import { TicketInfo } from "./EventCheckout/TicketInfo";
import type { Event } from "@/lib/dummyEvents/events";

interface EventDetailClientProps {
  event: Event;
}

type PaymentAttemptResult = {
  ok: boolean;
  error?: string;
};

type PaymentStatus = "idle" | "processing" | "failed";

type ReconcileResponse = {
  ok: boolean;
  ticketId?: string;
  error?: string;
};

/**
 * Client component for interactive event details
 * Receives pre-fetched server data as props (SSR)
 * Handles client-side state for purchase flow and modals
 */
export default function EventDetailClient({ event }: EventDetailClientProps) {
  const router = useRouter();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  // Synchronous mutex for the reconcile call. `paymentStatus` only updates on
  // the next render, so two calls firing in the same tick (e.g. a button click
  // racing the poll's onConfirmed) would both read "idle" and both POST. A ref
  // flips immediately, so the second caller is rejected before it can submit.
  const inFlightRef = useRef(false);

  // Only switch to the purchased view once the ticket is *actually*
  // reconciled. Switching away from TicketInfo any earlier (e.g. as soon as
  // the on-chain tx confirms) would unmount it mid-reconcile, wiping the
  // chain status/txHash it needs to show a correct "reconcile failed —
  // don't double-pay" message and to retry reconciliation without
  // re-triggering a new wallet payment.
  //
  // Gate on the event's own paid-ness rather than the reconciled `isPaid`
  // flag: free events reconcile with isPaid=false (see the anonymous path in
  // TicketInfo), so requiring isPaid here would strand free-event purchases
  // on the checkout view forever.
  const isPurchased = isConfirmed && (event.isPaid ? isPaid : true);

  /** Clears any in-progress/failed payment attempt back to a clean idle state. */
  const resetPaymentAttemptState = () => {
    setPaymentStatus("idle");
    setPaymentError(null);
    setAttemptId(null);
  };

  /**
   * Generates a stable idempotency key for a purchase attempt. The same key is
   * reused across retries so the reconcile endpoint can dedupe them into one
   * ticket. Falls back to a timestamp+random id where `crypto.randomUUID` is
   * unavailable.
   */
  const createAttemptId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  };

  /**
   * Calls the reconcile endpoint to finalize a confirmed payment into a ticket.
   * Normalizes HTTP errors, rejected payloads, and network failures into a
   * single `{ ok, error }` result so callers don't have to branch on transport
   * details.
   */
  const reconcileWithBackend = async (
    nextAttemptId: string,
    status: { isConfirmed: boolean; isPaid: boolean },
  ): Promise<PaymentAttemptResult> => {
    try {
      const response = await fetch("/api/payments/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: nextAttemptId,
          eventId: event.id,
          isConfirmed: status.isConfirmed,
          isPaid: status.isPaid,
        }),
      });

      if (!response.ok) {
        let message = "Could not reconcile with backend. Please retry.";

        try {
          const payload = (await response.json()) as ReconcileResponse;
          if (payload?.error) {
            message = payload.error;
          }
        } catch {
        }

        return { ok: false, error: message };
      }

      const payload = (await response.json()) as ReconcileResponse;
      if (!payload.ok) {
        return {
          ok: false,
          error: payload.error ?? "Backend rejected this payment confirmation.",
        };
      }

      return { ok: true };
    } catch {
      return {
        ok: false,
        error:
          "Network error while reconciling payment. Your ticket was not finalized.",
      };
    }
  };

  /**
   * Entry point passed to {@link TicketInfo} as `onStatusChange`. Guards against
   * concurrent/duplicate attempts and sold-out events, then drives the
   * reconcile step, updating `paymentStatus`/`paymentError` so the checkout
   * banner reflects the outcome. Safe to call again on retry — it reuses the
   * existing `attemptId`.
   */
  const handleStatusChange = async (status: {
    isConfirmed: boolean;
    isPaid: boolean;
  }): Promise<PaymentAttemptResult> => {
    if (inFlightRef.current) {
      return { ok: false, error: "Payment already in progress." };
    }

    if (isPurchased) {
      return { ok: false, error: "Payment already completed." };
    }

    if (event.slotsLeft < 1) {
      setAttemptId(null);
      setPaymentStatus("failed");
      setPaymentError("Tickets are sold out for this event.");
      return { ok: false, error: "Tickets are sold out for this event." };
    }

    inFlightRef.current = true;
    const nextAttemptId = attemptId ?? createAttemptId();
    setAttemptId(nextAttemptId);
    setPaymentStatus("processing");
    setPaymentError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const reconcileResult = await reconcileWithBackend(nextAttemptId, status);
      if (!reconcileResult.ok) {
        throw new Error(
          reconcileResult.error ?? "Failed to reconcile payment confirmation.",
        );
      }

      setIsConfirmed(status.isConfirmed);
      setIsPaid(status.isPaid);
      resetPaymentAttemptState();
      return { ok: true };
    } catch (error) {
      setIsConfirmed(false);
      setIsPaid(false);
      setPaymentStatus("failed");
      const message =
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.";
      setPaymentError(message);
      return { ok: false, error: message };
    } finally {
      inFlightRef.current = false;
    }
  };

  return (
    <>
      {!isPurchased ? (
        <div className="space-y-16">
          <EventDetailCard
            title={event.title}
            date={event.date}
            time={event.time}
            type={event.location}
            description={event.description}
            tags={event.tags}
            price={event.price}
            privacyType={event.privacyLevel[0]}
          />
          <div className="flex gap-5 sm:flex-row flex-col">
            <div className="space-y-5 basis-[55%]">
              <WhatYouWillGetCard perks={event.perks} />
              <OrganizerCard {...event.organizer} />
            </div>
            <div className="basis-[45%]">
              <TicketInfo
                eventId={event.id}
                ticketTypes={event.ticketTypes}
                privacyLevel={event.privacyLevel}
                isPaid={event.isPaid}
                paymentStatus={paymentStatus}
                paymentError={paymentError}
                onStatusChange={handleStatusChange}
                onResetPayment={resetPaymentAttemptState}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-[550px] mx-auto py-10">
          <PurchasedStage
            onViewAccessCode={() => router.push("/tickets")}
            onCancelRegistration={() => setShowCancelModal(true)}
          />
        </div>
      )}

      <TicketCancellationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        ticketId="dummy"
        userId="dummy"
        isConfirmed={isConfirmed}
        isPaid={isPaid}
        onConfirm={(_, __, updatedState) => {
          setIsConfirmed(updatedState.isConfirmed);
          setIsPaid(updatedState.isPaid);
          resetPaymentAttemptState();
          setShowCancelModal(false);
        }}
      />
    </>
  );
}
