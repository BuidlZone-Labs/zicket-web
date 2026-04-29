"use client";

import { useState } from "react";
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
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const [isOptimistic, setIsOptimistic] = useState(false);

  const isReallyPurchased = isConfirmed && isPaid;
  const isPurchased = isOptimistic || isReallyPurchased;

  const resetPaymentAttemptState = () => {
    setPaymentStatus("idle");
    setPaymentError(null);
  };

  const createAttemptId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  };

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

  const handleStatusChange = async (status: {
    isConfirmed: boolean;
    isPaid: boolean;
  }): Promise<PaymentAttemptResult> => {
    if (paymentStatus === "processing") {
      return { ok: false, error: "Payment already in progress." };
    }

    if (isReallyPurchased) {
      return { ok: false, error: "Payment already completed." };
    }

    if (event.slotsLeft < 1) {
      setAttemptId(null);
      setIsOptimistic(false);
      setPaymentStatus("failed");
      setPaymentError("Tickets are sold out for this event.");
      return { ok: false, error: "Tickets are sold out for this event." };
    }

    const nextAttemptId = attemptId ?? createAttemptId();
    setAttemptId(nextAttemptId);
    setIsOptimistic(true);
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
      setIsOptimistic(false);
      setAttemptId(null);
      resetPaymentAttemptState();
      return { ok: true };
    } catch (error) {
      setIsOptimistic(false);
      setIsConfirmed(false);
      setIsPaid(false);
      setPaymentStatus("failed");
      const message =
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.";
      setPaymentError(message);
      return { ok: false, error: message };
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
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-[550px] mx-auto py-10">
          <PurchasedStage
            isConfirming={isOptimistic && !isReallyPurchased}
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
          setIsOptimistic(false);
          setAttemptId(null);
          resetPaymentAttemptState();
          setShowCancelModal(false);
        }}
      />
    </>
  );
}
