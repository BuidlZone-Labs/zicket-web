"use client";

import * as React from "react";
import { useState } from "react";
import { Info } from "lucide-react";
import { PrivacyBadge } from "@/components/privacy/PrivacyBadge";
import { PrivacyDisclosureModal } from "@/components/privacy/PrivacyDisclosureModal";
import type { PrivacyLevel } from "@/lib/dummyEvents/events";

export function PrivacyLevelBadge({ privacyLevel }: { privacyLevel: PrivacyLevel }) {
  return (
    <PrivacyBadge
      level={privacyLevel}
      variant="card-overlay"
      displayLabel={privacyLevel}
    />
  );
}

export function PrivacyLevelExplanationModal({ privacyLevels }: { privacyLevels: PrivacyLevel[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const primaryLevel = privacyLevels && privacyLevels.length > 0 ? privacyLevels[0] : "Anonymous";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#6917AF] dark:text-[#D7B5F5] hover:underline cursor-pointer transition-colors"
        aria-label="Open privacy level disclosure details"
      >
        <Info className="size-4" aria-hidden="true" />
        <span>Privacy details</span>
      </button>

      <PrivacyDisclosureModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialLevel={primaryLevel}
        showTabs={true}
      />
    </>
  );
}

