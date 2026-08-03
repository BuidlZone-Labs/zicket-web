"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  Loader2,
  Eye,
  Wallet,
  KeyRound,
  Coins,
  UserRound,
  Mail,
  BadgeCheck,
  ReceiptText,
  Lock,
  Check,
  X,
} from "lucide-react";
import { trackAnalyticsEvent } from "@/lib/privacyAnalytics";
import { getTrustDisclosure, type TrustContext, type TrustIcon } from "@/lib/privacyTrust";
import type { PrivacyLevel } from "@/lib/dummyEvents/events";
import type { LucideIcon } from "lucide-react";

// Maps the stable icon keys from lib/privacyTrust.ts to real icons here, so the
// copy module stays free of any UI dependency.
const ICONS: Record<TrustIcon, LucideIcon> = {
  "public-address": Eye,
  eligibility: BadgeCheck,
  approval: BadgeCheck,
  transaction: ReceiptText,
  "private-keys": KeyRound,
  assets: Coins,
  identity: UserRound,
  contact: Mail,
};

/**
 * Privacy Trust confirmation modal. Shown at the moment of a sensitive action
 * (payment, wallet connect): it spells out what data is and isn't shared, in
 * plain language chosen for the context + privacy level, then only runs the real
 * action when the user clicks the confirm (Allow) button. Cancelling does
 * nothing to the user's account.
 */
export function PrivacyTrustModal({
  isOpen,
  onClose,
  onConfirm,
  context,
  privacyLevel,
  isProcessing = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  context: TrustContext;
  privacyLevel: PrivacyLevel;
  isProcessing?: boolean;
}) {
  const disclosure = getTrustDisclosure(context, privacyLevel);

  // Record that the disclosure was shown (no PII — just context + level).
  useEffect(() => {
    if (isOpen) {
      trackAnalyticsEvent("privacy_trust_shown", { context, privacyLevel });
    }
  }, [isOpen, context, privacyLevel]);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isProcessing) {
      trackAnalyticsEvent("privacy_trust_cancelled", { context, privacyLevel });
      onClose();
    }
  };

  const handleConfirm = () => {
    trackAnalyticsEvent("privacy_trust_allowed", { context, privacyLevel });
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[92vw] sm:max-w-[420px] max-h-[88vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#0A0A0A] border border-[#E9E9E9] dark:border-[#232323] p-6"
      >
        {/* Header */}
        <div className="flex items-center gap-2 text-[#5C6170] dark:text-[#98A2B3]">
          <ShieldCheck aria-hidden="true" className="size-4 text-[#6917AF] dark:text-[#D7B5F5]" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            Privacy Trust
          </span>
        </div>

        {/* Title + guarantee badge */}
        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <DialogTitle className="text-2xl font-bold text-[#1F1F1F] dark:text-white">
              {disclosure.title}
            </DialogTitle>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF3] dark:bg-[#052E16] px-3 py-1 text-[11px] font-semibold text-[#027A48] dark:text-[#4ADE80]">
              <Lock aria-hidden="true" className="size-3" />
              {disclosure.guaranteeBadge}
            </span>
          </div>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#6917AF] text-white">
            <Wallet aria-hidden="true" className="size-5" />
          </span>
        </div>

        <DialogDescription className="sr-only">
          A summary of what data is shared and what is not shared for this action.
        </DialogDescription>

        {/* What is shared */}
        <TrustSection
          heading="What is shared?"
          items={disclosure.shared}
          tone="shared"
        />

        {/* What is NOT shared */}
        <TrustSection
          heading="What is NOT shared?"
          items={disclosure.notShared}
          tone="not-shared"
        />

        {/* Reassurance */}
        <p className="mt-5 rounded-xl bg-[#F9FAFB] dark:bg-[#121212] border border-[#E9E9E9] dark:border-[#232323] px-4 py-3 text-xs leading-relaxed text-[#5C6170] dark:text-[#98A2B3]">
          {disclosure.reassurance}
        </p>

        {/* Actions */}
        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#6917AF] py-3.5 font-bold text-white transition hover:bg-[#5A1296] dark:bg-[#751AC6] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 aria-hidden="true" className="size-5 animate-spin" />
                Working…
              </>
            ) : (
              <>
                <ShieldCheck aria-hidden="true" className="size-5" />
                {disclosure.confirmLabel}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={isProcessing}
            className="w-full rounded-full py-3 font-semibold text-[#5C6170] dark:text-[#98A2B3] transition hover:text-[#1F1F1F] dark:hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TrustSection({
  heading,
  items,
  tone,
}: {
  heading: string;
  items: { icon: TrustIcon; label: string; detail?: string }[];
  tone: "shared" | "not-shared";
}) {
  const isShared = tone === "shared";
  const StatusIcon = isShared ? Check : X;
  const iconTone = isShared
    ? "text-[#027A48] dark:text-[#4ADE80]"
    : "text-[#B42318] dark:text-[#F87171]";
  const headingTone = isShared
    ? "text-[#027A48] dark:text-[#4ADE80]"
    : "text-[#B42318] dark:text-[#F87171]";

  return (
    <div className="mt-5">
      <p className={`text-[11px] font-semibold uppercase tracking-wide ${headingTone}`}>
        {heading}
      </p>
      <ul className="mt-2 space-y-2.5">
        {items.map((item) => {
          const ItemIcon = ICONS[item.icon];
          return (
            <li key={item.label} className="flex items-start gap-3">
              <span className={`mt-0.5 shrink-0 ${iconTone}`}>
                <ItemIcon aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <StatusIcon aria-hidden="true" className={`size-3.5 shrink-0 ${iconTone}`} />
                  <p className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E0E0E0]">
                    {item.label}
                  </p>
                </div>
                {item.detail && (
                  <p className="mt-0.5 pl-5 text-xs text-[#5C6170] dark:text-[#98A2B3]">
                    {item.detail}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
