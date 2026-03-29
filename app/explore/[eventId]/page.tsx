"use client";

import { useState, use } from "react";
import EventSlider from "@/app/components/EventSlider";
import { PurchasedStage } from "@/app/components/explore/EventCheckout/PurchasedStage";
import { TicketCancellationModal } from "@/app/components/TicketCancellationModal";
import { dummyEvents } from "@/lib/dummyEvents/events";
import { EventDetailCard } from "@/app/components/explore/EventCheckout/eventDetailsCard";
import { WhatYouWillGetCard } from "@/app/components/explore/EventCheckout/WhatYouWillGetCard";
import { OrganizerCard } from "@/app/components/explore/EventCheckout/OrganizerCard";
import { TicketInfo } from "@/app/components/explore/EventCheckout/TicketInfo";

type Props = {
  params: Promise<{ eventId: string }>;
};

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

export default function EventPage({ params }: Props) {
  const { eventId } = use(params);
  const eventName = eventId.replaceAll("-", " ");

  const event = dummyEvents.filter(
    (event) =>
      event.title.toLocaleLowerCase() === eventName.toLocaleLowerCase(),
  );

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
          eventId: event[0].id,
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

    if (event[0].slotsLeft < 1) {
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

  if (!event || event.length === 0)
    return <div className="p-20 text-center">Event not found</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-15 py-20 px-4">
      <div className="flex gap-1 items-center w-[calc(100vw - 20px)] lg:w-[436px]">
        <a
          href="/explore"
          className="text-sm font-medium text-[#2C0A4A] dark:text-[#D7B5F5] capitalize"
        >
          explore
        </a>
        <span className="text-[#667185]">/</span>
        <p className="w-fit text-xs md:text-sm font-medium text-[#2C0A4A] dark:text-[#D7B5F5] line-clamp-1 flex-shrink">
          Web3 & Crypto Meetups
        </p>
        <span className="text-[#667185]">/</span>
        <p className="w-1/3 md:w-fit text-sm font-medium text-[#667185] line-clamp-1 flex-shrink min-w-0">
          {eventName}
        </p>
      </div>

      {!isPurchased ? (
        <div className="space-y-16">
          <EventDetailCard
            title={event[0].title}
            date={event[0].date}
            time={event[0].time}
            type={event[0].location}
            description={event[0].description}
            tags={event[0].tags}
            price={event[0].price}
            privacyType={event[0].privacyLevel[0]}
          />
          <div className="flex gap-5 sm:flex-row flex-col">
            <div className="space-y-5 basis-[55%]">
              <WhatYouWillGetCard perks={event[0].perks} />
              <OrganizerCard {...event[0].organizer} />
            </div>
            <div className="basis-[45%]">
              <TicketInfo
                ticketTypes={event[0].ticketTypes}
                slotsLeft={event[0].slotsLeft}
                privacyLevel={event[0].privacyLevel}
                isPaid={event[0].isPaid}
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

      <div className="pt-5">
        <EventSlider />
      </div>
    </div>
  );
}
