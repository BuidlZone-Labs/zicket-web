"use client";

import * as React from "react";
import { useState } from "react";
import { Info, Shield, Lock, Key } from "lucide-react";
import { AppTooltip } from "@/components/ui/app-tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import type { PrivacyLevel } from "@/lib/dummyEvents/events";

const privacyLevelInfo: Record<PrivacyLevel, { label: string; summary: string; details: string }> = {
  Anonymous: {
    label: "Anonymous",
    summary: "No personal identity or wallet metadata is required to access this event.",
    details:
      "Anonymous access means the event can be attended without sharing a name, email, or public wallet address. Zicket validates eligibility through private proof, while minimizing what is visible to hosts and third parties.",
  },
  "Verified Access": {
    label: "Verified Access",
    summary: "Entry is granted after organizer approval or group membership verification.",
    details:
      "Verified access requires a permission check but avoids broad identity exposure. Hosts confirm that attendees meet event criteria without requiring full personal data to be published.",
  },
  "Wallet Required": {
    label: "Wallet Required",
    summary: "A wallet is used to confirm your ticket and complete the check-in flow.",
    details:
      "Wallet required events validate attendance through a wallet-based credential. Zicket still aims to keep transaction data limited and avoid unnecessary personal information sharing.",
  },
};

const privacyIcons: Record<PrivacyLevel, React.ReactNode> = {
  Anonymous: <Shield className="size-4" aria-hidden="true" />,
  "Verified Access": <Lock className="size-4" aria-hidden="true" />,
  "Wallet Required": <Key className="size-4" aria-hidden="true" />,
};

export function PrivacyLevelBadge({ privacyLevel }: { privacyLevel: PrivacyLevel }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-[10px] border border-[#E9E9E9] bg-[#FFFFFFE6] px-3 py-1 text-[11px] font-semibold text-[#1E1E1E]">
      <span className="flex items-center gap-2">{privacyIcons[privacyLevel]}{privacyLevel}</span>
      <AppTooltip label={privacyLevelInfo[privacyLevel].summary} side="top">
        <button
          type="button"
          className="rounded-full bg-[#F3F4F6] p-1 text-[#5C6170] transition hover:bg-[#EDE9FE] focus:outline-none focus:ring-2 focus:ring-[#6917AF]/30"
          aria-label={`More information about ${privacyLevel} privacy level`}
        >
          <Info className="size-4" />
        </button>
      </AppTooltip>
    </div>
  );
}

export function PrivacyLevelExplanationModal({ privacyLevels }: { privacyLevels: PrivacyLevel[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#5C6170] hover:text-[#1E1E1E]"
      >
        <Info className="size-4" aria-hidden="true" />
        Privacy details
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Privacy level explained</DialogTitle>
            <DialogDescription>
              Each privacy level describes how access is granted and which information is shared during event entry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {privacyLevels.map((privacyLevel) => (
              <div key={privacyLevel} className="rounded-3xl border border-[#E9E9E9] p-4 bg-[#FBFBFB]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4EEFF] text-[#6917AF]">
                    {privacyIcons[privacyLevel]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#1E1E1E]">{privacyLevelInfo[privacyLevel].label}</p>
                    <p className="text-xs text-[#667085]">{privacyLevelInfo[privacyLevel].summary}</p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-[#334155]">{privacyLevelInfo[privacyLevel].details}</p>
              </div>
            ))}
          </div>

          <DialogFooter className="pt-4">
            <DialogClose className="rounded-full bg-[#6917AF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5912d1]">
              Close
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
