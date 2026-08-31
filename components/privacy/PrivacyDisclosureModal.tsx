"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  Lock,
  Key,
  Eye,
  EyeOff,
  Database,
  Globe,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X,
} from "lucide-react";
import {
  type CanonicalPrivacyLevel,
  type PrivacyMode,
  ALL_PRIVACY_MODES,
  normalizePrivacyLevel,
  getPrivacyConfig,
} from "./constants";
import type { PrivacyLevel } from "@/lib/dummyEvents/events";

interface PrivacyDisclosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLevel?: PrivacyMode | PrivacyLevel | string;
  showTabs?: boolean;
}

export function PrivacyDisclosureModal({
  isOpen,
  onClose,
  initialLevel = "Anonymous",
  showTabs = true,
}: PrivacyDisclosureModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<CanonicalPrivacyLevel>(() =>
    normalizePrivacyLevel(initialLevel),
  );

  // Sync when initialLevel changes
  useEffect(() => {
    if (isOpen && initialLevel) {
      setSelectedLevel(normalizePrivacyLevel(initialLevel));
    }
  }, [isOpen, initialLevel]);

  const config = getPrivacyConfig(selectedLevel);

  const getModeIcon = (mode: CanonicalPrivacyLevel, className = "size-4") => {
    switch (mode) {
      case "Anonymous":
        return <ShieldCheck className={className} aria-hidden="true" />;
      case "Private":
        return <Lock className={className} aria-hidden="true" />;
      case "Standard":
        return <Key className={className} aria-hidden="true" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[92vw] sm:max-w-2xl max-h-[88vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-white dark:bg-[#0E0E10] border border-[#E9E9E9] dark:border-[#232323] shadow-2xl text-left"
        aria-labelledby="privacy-modal-title"
        aria-describedby="privacy-modal-description"
      >
        {/* Header Bar */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#EBEBEB] dark:border-[#1F1F24] bg-white dark:bg-[#0E0E10]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6917AF] dark:text-[#D7B5F5]">
              <ShieldCheck className="size-4.5 shrink-0" aria-hidden="true" />
              <span>Privacy Level Disclosure</span>
            </div>
            <DialogClose
              className="rounded-full p-1.5 text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#1E1E24] hover:text-[#111827] dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#6917AF]"
              aria-label="Close privacy disclosure modal"
            >
              <X className="size-4.5" />
            </DialogClose>
          </div>

          <DialogHeader className="mt-2 text-left">
            <DialogTitle
              id="privacy-modal-title"
              className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-white tracking-tight"
            >
              {config.label} Privacy Architecture
            </DialogTitle>
            <DialogDescription
              id="privacy-modal-description"
              className="text-xs sm:text-sm text-[#5C6170] dark:text-[#9CA3AF] mt-1"
            >
              {config.tagline}
            </DialogDescription>
          </DialogHeader>

          {/* Privacy Level Switcher Tabs */}
          {showTabs && (
            <div
              role="tablist"
              aria-label="Select privacy level to inspect"
              className="mt-4 flex rounded-xl bg-[#F3F4F6] dark:bg-[#16161B] p-1 gap-1 border border-[#E5E7EB] dark:border-[#26262D]"
            >
              {ALL_PRIVACY_MODES.map((mode) => {
                const isActive = selectedLevel === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    id={`tab-${mode.toLowerCase()}`}
                    aria-selected={isActive}
                    aria-controls="privacy-modal-tabpanel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setSelectedLevel(mode)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-white dark:bg-[#25252D] text-[#111827] dark:text-white shadow-sm font-bold"
                        : "text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
                    }`}
                  >
                    {getModeIcon(
                      mode,
                      isActive
                        ? "size-4 text-[#6917AF] dark:text-[#D7B5F5]"
                        : "size-4 text-[#9CA3AF]",
                    )}
                    <span>{mode}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div
          id="privacy-modal-tabpanel"
          role={showTabs ? "tabpanel" : "region"}
          aria-labelledby={showTabs ? `tab-${selectedLevel.toLowerCase()}` : "privacy-modal-title"}
          className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm"
        >
          {/* Explicit Guarantee Box (PRD Required Statement) */}
          <div
            data-testid="privacy-guarantee-banner"
            className="rounded-xl border border-[#6917AF]/30 dark:border-[#6917AF]/40 bg-[#FBF7FF] dark:bg-[#160E22] p-4.5 sm:p-5"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6917AF] dark:text-[#D7B5F5] mb-1.5">
              <Sparkles className="size-4" aria-hidden="true" />
              <span>Cryptographic Guarantee Statement</span>
            </div>
            <p
              data-testid="privacy-guarantee-copy"
              className="text-sm sm:text-base font-semibold text-[#1E1B4B] dark:text-[#F3E8FF] leading-snug"
            >
              {config.guaranteeText}
            </p>
            <p className="mt-2 text-xs text-[#5C6170] dark:text-[#BFAAD8] leading-relaxed">
              {config.description}
            </p>
          </div>

          {/* On-Chain vs Off-Chain Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* On-Chain */}
            <div className="rounded-xl border border-[#E5E7EB] dark:border-[#222228] bg-[#F9FAFB] dark:bg-[#121217] p-4.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <Globe className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="font-bold text-sm text-[#111827] dark:text-white">
                    {config.onChain.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {config.onChain.details.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs leading-relaxed text-[#4B5563] dark:text-[#9CA3AF]"
                    >
                      <CheckCircle2
                        className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Off-Chain */}
            <div className="rounded-xl border border-[#E5E7EB] dark:border-[#222228] bg-[#F9FAFB] dark:bg-[#121217] p-4.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                    <Database className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="font-bold text-sm text-[#111827] dark:text-white">
                    {config.offChain.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {config.offChain.details.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs leading-relaxed text-[#4B5563] dark:text-[#9CA3AF]"
                    >
                      <CheckCircle2
                        className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Cryptographic Guarantees Card */}
          <div className="rounded-xl border border-[#E5E7EB] dark:border-[#222228] bg-[#F9FAFB] dark:bg-[#121217] p-4.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-[#6917AF] dark:text-[#D7B5F5]">
                {getModeIcon(selectedLevel, "size-4")}
              </span>
              <h3 className="font-bold text-sm text-[#111827] dark:text-white">
                {config.cryptographicGuarantees.title}
              </h3>
            </div>
            <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mb-3 leading-relaxed">
              {config.cryptographicGuarantees.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              {config.cryptographicGuarantees.details.map((detail, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white dark:bg-[#1E1E24] border border-[#E5E7EB] dark:border-[#2A2A33] text-[#374151] dark:text-[#D1D5DB]"
                >
                  <Sparkles className="size-3 text-[#6917AF] dark:text-[#D7B5F5]" aria-hidden="true" />
                  {detail}
                </span>
              ))}
            </div>
          </div>

          {/* Organizer Visibility Disclosure */}
          <div className="rounded-xl border border-[#E5E7EB] dark:border-[#222228] bg-[#F9FAFB] dark:bg-[#121217] p-4.5 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
              Organizer Visibility Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* What organizer CAN see */}
              <div className="rounded-lg bg-white dark:bg-[#18181E] border border-[#E5E7EB] dark:border-[#26262F] p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <Eye className="size-3.5" aria-hidden="true" />
                  <span>Host can access:</span>
                </div>
                <ul className="space-y-1.5">
                  {config.organizerVisibility.canSee.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-1.5 text-[11px] text-[#4B5563] dark:text-[#9CA3AF]"
                    >
                      <CheckCircle2 className="size-3 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What organizer CANNOT see */}
              <div className="rounded-lg bg-white dark:bg-[#18181E] border border-[#E5E7EB] dark:border-[#26262F] p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
                  <EyeOff className="size-3.5" aria-hidden="true" />
                  <span>Host cannot access:</span>
                </div>
                <ul className="space-y-1.5">
                  {config.organizerVisibility.cannotSee.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-1.5 text-[11px] text-[#4B5563] dark:text-[#9CA3AF]"
                    >
                      <XCircle className="size-3 text-rose-500 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#EBEBEB] dark:border-[#1F1F24] bg-white dark:bg-[#0E0E10] flex items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <HelpCircle className="size-3.5" aria-hidden="true" />
            <span>Cryptographically enforced by Zicket on Stellar</span>
          </div>
          <DialogClose
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#6917AF] hover:bg-[#5A1296] dark:bg-[#751AC6] dark:hover:bg-[#6814B2] text-white text-xs sm:text-sm font-semibold transition cursor-pointer text-center"
          >
            I Understand
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
