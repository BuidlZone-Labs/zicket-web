import type { PrivacyLevel } from "./dummyEvents/events";

/**
 * Privacy Trust microcopy system.
 *
 * A small, non-technical "trust layer" shown at the moment of a sensitive action
 * (paying, connecting a wallet). It tells the user, in plain language, exactly
 * what data IS shared and what is NOT shared, adapting the wording to the
 * context and the event's privacy level. This file holds the copy only — no JSX
 * and no dependencies — so the words live in one place and stay easy to review.
 *
 * The `icon` on each item is a stable key (not a component) so this module stays
 * framework-free; the modal maps each key to a real icon.
 */

/** Where the trust prompt is being shown. */
export type TrustContext = "payment" | "wallet-connect";

/** Stable icon keys, resolved to real icons inside PrivacyTrustModal. */
export type TrustIcon =
  | "public-address"
  | "eligibility"
  | "approval"
  | "transaction"
  | "private-keys"
  | "assets"
  | "identity"
  | "contact";

/** A single "shared" or "not shared" line. */
export interface TrustItem {
  icon: TrustIcon;
  label: string;
  /** Optional one-line explanation shown under the label. */
  detail?: string;
}

/** Everything the modal needs to render one trust disclosure. */
export interface TrustDisclosure {
  /** Modal title, e.g. "Wallet Connection" or "Confirm & Pay". */
  title: string;
  /** Short green guarantee pill, e.g. "NO IDENTITY STORED". */
  guaranteeBadge: string;
  shared: TrustItem[];
  notShared: TrustItem[];
  /** Reassurance line shown in the quote box. */
  reassurance: string;
  /** Label for the primary (Allow) button. */
  confirmLabel: string;
}

// Reused across disclosures so the promise stays consistent everywhere.
const NO_IDENTITY = "NO IDENTITY STORED";
const ON_DEVICE_REASSURANCE =
  "Your data never leaves this device. We use a transparent lens to clarify intent and protect you — without friction.";

// Common "not shared" lines, reused so wording stays identical across contexts.
const NOT_SHARED_KEYS: TrustItem = {
  icon: "private-keys",
  label: "Private keys & seed phrase",
};
const NOT_SHARED_ASSETS: TrustItem = {
  icon: "assets",
  label: "Other wallet assets & balances",
};
const NOT_SHARED_IDENTITY: TrustItem = {
  icon: "identity",
  label: "Your name & email",
};

/** The wallet-connect disclosure (matches the Figma reference exactly). */
const WALLET_CONNECT: TrustDisclosure = {
  title: "Wallet Connection",
  guaranteeBadge: NO_IDENTITY,
  shared: [
    {
      icon: "public-address",
      label: "Public address",
      detail: "Required to see your activity history and balances.",
    },
  ],
  notShared: [NOT_SHARED_KEYS, NOT_SHARED_ASSETS],
  reassurance: ON_DEVICE_REASSURANCE,
  confirmLabel: "Allow Connection",
};

/** Payment disclosures, one per privacy level. */
const PAYMENT_BY_LEVEL: Record<PrivacyLevel, TrustDisclosure> = {
  Anonymous: {
    title: "Anonymous Attendance",
    guaranteeBadge: NO_IDENTITY,
    shared: [
      {
        icon: "eligibility",
        label: "A private ticket proof",
        detail: "Confirms you hold a valid ticket, with no identity attached.",
      },
    ],
    notShared: [
      NOT_SHARED_IDENTITY,
      { icon: "public-address", label: "Your wallet address" },
      { icon: "transaction", label: "Any payment history" },
    ],
    reassurance: ON_DEVICE_REASSURANCE,
    confirmLabel: "Attend Anonymously",
  },
  "Verified Access": {
    title: "Verified Entry",
    guaranteeBadge: "IDENTITY STAYS PRIVATE",
    shared: [
      {
        icon: "approval",
        label: "Your approval status",
        detail: "Only that you meet the organizer's entry criteria.",
      },
    ],
    notShared: [
      { icon: "identity", label: "Personal documents or full identity" },
      NOT_SHARED_KEYS,
      { icon: "contact", label: "Your contact details, published publicly" },
    ],
    reassurance: ON_DEVICE_REASSURANCE,
    confirmLabel: "Confirm & Continue",
  },
  "Wallet Required": {
    title: "Confirm & Pay",
    guaranteeBadge: NO_IDENTITY,
    shared: [
      {
        icon: "public-address",
        label: "Public wallet address",
        detail: "Used to confirm your ticket and complete check-in.",
      },
      {
        icon: "transaction",
        label: "This ticket's transaction",
        detail: "The on-chain payment for this ticket only.",
      },
    ],
    notShared: [NOT_SHARED_KEYS, NOT_SHARED_ASSETS, NOT_SHARED_IDENTITY],
    reassurance: ON_DEVICE_REASSURANCE,
    confirmLabel: "Confirm & Pay",
  },
};

/**
 * The single source of trust copy. Picks the disclosure for the given context and
 * privacy level. Wallet-connect uses one fixed disclosure (it is always the same
 * wallet promise); payment adapts to the event's privacy level.
 */
export function getTrustDisclosure(
  context: TrustContext,
  privacyLevel: PrivacyLevel,
): TrustDisclosure {
  if (context === "wallet-connect") return WALLET_CONNECT;
  return PAYMENT_BY_LEVEL[privacyLevel] ?? PAYMENT_BY_LEVEL.Anonymous;
}
