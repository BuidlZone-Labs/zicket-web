"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldCheck, EyeOff, Copy, Check, Fingerprint } from "lucide-react";
import { buildPrivateProof } from "@/lib/tickets";
import type { PurchasedTicket } from "@/lib/dummyEvents/tickets";

/**
 * "Proof Without Identity" — explains zero-knowledge ticket sharing and lets the
 * user generate a shareable proof that reveals ownership but no personal data.
 * The generated token (see buildPrivateProof) contains only the event, a
 * validity window, and an opaque proof id — no name or email — so sharing it
 * preserves privacy.
 */
export function PrivateShareModal({
  ticket,
  isOpen,
  onClose,
}: {
  ticket: PurchasedTicket;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [proof, setProof] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // A fresh proof id per open, generated only when the user asks for it.
  const generate = useMemo(
    () => () => {
      setProof(buildPrivateProof(ticket));
      setCopied(false);
    },
    [ticket],
  );

  const handleCopy = async () => {
    if (!proof) return;
    try {
      await navigator.clipboard.writeText(proof);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable (e.g. insecure context) — no-op.
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setProof(null);
      setCopied(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[92vw] sm:max-w-[460px] max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#0A0A0A] border border-[#E9E9E9] dark:border-[#232323] p-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3E8FF] dark:bg-[#6917AF]/20 px-3 py-1 text-xs font-semibold text-[#6917AF] dark:text-[#D7B5F5]">
            <ShieldCheck aria-hidden="true" className="size-3.5" />
            Private Sharing
          </span>
        </div>

        <DialogTitle className="mt-3 text-2xl font-bold text-[#1F1F1F] dark:text-white">
          Proof Without Identity
        </DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-[#5C6170] dark:text-[#98A2B3]">
          Share a zero-knowledge proof that you own this ticket — without
          revealing your name, wallet, or any personal data to whoever you share
          it with.
        </DialogDescription>

        {/* ZKP proof summary */}
        <div className="mt-5 rounded-xl border border-[#E9E9E9] dark:border-[#232323] bg-[#F9FAFB] dark:bg-[#121212] p-4">
          <div className="flex items-center gap-2">
            <Fingerprint aria-hidden="true" className="size-4 text-[#6917AF] dark:text-[#D7B5F5]" />
            <p className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E0E0E0]">
              ZKP Proof
            </p>
          </div>
          <p className="mt-1 text-xs text-[#5C6170] dark:text-[#98A2B3]">
            Mathematical proof that you own the ticket.
          </p>
        </div>

        {/* How it works */}
        <div className="mt-3 rounded-xl border border-[#D4ADFC] dark:border-[#4A1F7A] bg-[#F5EEFF] dark:bg-[#1C0F2E] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6917AF] dark:text-[#D7B5F5]">
            How it works
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-[#6917AF]/90 dark:text-[#D7B5F5]/90">
            Imagine proving you are over 21 without showing your birthdate. We
            generate a digital signature that says{" "}
            <span className="font-semibold text-[#027A48] dark:text-[#4ADE80]">
              &quot;TRUE&quot;
            </span>{" "}
            to ownership, while all other data stays{" "}
            <span className="font-semibold text-[#B42318] dark:text-[#F87171]">
              &quot;HIDDEN&quot;
            </span>
            .
          </p>
        </div>

        {/* Invisible profile */}
        <div className="mt-3 flex items-start gap-3 rounded-xl border border-[#E9E9E9] dark:border-[#232323] p-4">
          <EyeOff aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6917AF] dark:text-[#D7B5F5]" />
          <div>
            <p className="text-sm font-semibold text-[#1F1F1F] dark:text-[#E0E0E0]">
              Invisible Profile
            </p>
            <p className="mt-0.5 text-xs text-[#5C6170] dark:text-[#98A2B3]">
              The shared proof carries no name, email, or wallet address — only
              that a valid ticket exists for this event.
            </p>
          </div>
        </div>

        {/* Generate / share */}
        {proof ? (
          <div className="mt-5">
            <label className="text-xs font-medium text-[#667185]">
              Your private proof
            </label>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#E9E9E9] dark:border-[#232323] bg-[#F9FAFB] dark:bg-[#121212] p-3">
              <code className="flex-1 truncate font-mono text-xs text-[#5C6170] dark:text-[#98A2B3]">
                {proof}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#6917AF] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#5A1296]"
              >
                {copied ? (
                  <>
                    <Check aria-hidden="true" className="size-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy aria-hidden="true" className="size-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-[#667185]">
              Demo token — it illustrates the &ldquo;no personal data&rdquo;
              concept but is not yet a cryptographically verifiable proof.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={generate}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#6917AF] py-3.5 font-bold text-white transition hover:bg-[#5A1296] dark:bg-[#751AC6]"
          >
            <ShieldCheck aria-hidden="true" className="size-5" />
            Generate private proof
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
