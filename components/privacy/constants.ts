import type { PrivacyLevel } from "@/lib/dummyEvents/events";

export type CanonicalPrivacyLevel = "Standard" | "Private" | "Anonymous";

export type PrivacyMode =
  | CanonicalPrivacyLevel
  | "Wallet Required"
  | "Verified Access";

export interface PrivacyLevelConfig {
  mode: CanonicalPrivacyLevel;
  label: string;
  badgeLabel: string;
  guaranteeText: string;
  tagline: string;
  description: string;
  onChain: {
    title: string;
    details: string[];
  };
  offChain: {
    title: string;
    details: string[];
  };
  cryptographicGuarantees: {
    title: string;
    summary: string;
    details: string[];
  };
  organizerVisibility: {
    canSee: string[];
    cannotSee: string[];
  };
  badgeTheme: {
    containerClass: string;
    textClass: string;
    iconColorClass: string;
    pillBgClass: string;
    pillTextClass: string;
    dotClass: string;
  };
}

export const PRIVACY_DISCLOSURES: Record<CanonicalPrivacyLevel, PrivacyLevelConfig> = {
  Standard: {
    mode: "Standard",
    label: "Standard",
    badgeLabel: "Standard",
    guaranteeText:
      "Stellar wallet address public on-chain; organizer receives attendee registration details.",
    tagline: "Public on-chain ledger with transparent registration",
    description:
      "Standard privacy mode records your ticket purchase directly on the public Stellar ledger. The event organizer receives your registration details for check-in and communication.",
    onChain: {
      title: "On-Chain Disclosures",
      details: [
        "Stellar public wallet address is visible on the public ledger.",
        "Ticket purchase transaction hash and timestamp are permanently recorded on-chain.",
        "Public Stellar payment verification.",
      ],
    },
    offChain: {
      title: "Off-Chain Storage",
      details: [
        "Organizer receives attendee registration details (name, email) for check-in management.",
        "Check-in status and attendance records are maintained by the event host.",
      ],
    },
    cryptographicGuarantees: {
      title: "Consensus-Verified Transaction",
      summary:
        "Immutable Stellar network consensus ensures payment validity and public ticket ownership proof.",
      details: [
        "Cryptographically signed Stellar payment envelope.",
        "Ledger-backed non-repudiation.",
      ],
    },
    organizerVisibility: {
      canSee: [
        "Your public Stellar wallet address",
        "Registration contact details (name and email)",
        "Ticket transaction confirmation",
      ],
      cannotSee: [
        "Your private keys or wallet recovery seed phrases",
        "Unrelated balances, personal tokens, or off-platform financial activity",
      ],
    },
    badgeTheme: {
      containerClass:
        "bg-slate-100 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800",
      textClass: "text-slate-800 dark:text-slate-200",
      iconColorClass: "text-slate-600 dark:text-slate-400",
      pillBgClass: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
      pillTextClass: "text-slate-700 dark:text-slate-300",
      dotClass: "bg-slate-500",
    },
  },
  Private: {
    mode: "Private",
    label: "Private",
    badgeLabel: "Private",
    guaranteeText:
      "Stellar payment processed on-chain; attendee personal contact details encrypted off-chain.",
    tagline: "Shielded personal data with encrypted storage",
    description:
      "Private mode processes your Stellar payment on-chain while keeping your personal identification and contact details strongly encrypted off-chain, granting access without broad exposure.",
    onChain: {
      title: "On-Chain Disclosures",
      details: [
        "Stellar payment processed on-chain for ticket issuance.",
        "Zero plaintext personal identification or contact details stored on-chain.",
      ],
    },
    offChain: {
      title: "Off-Chain Storage",
      details: [
        "Attendee personal contact details are encrypted off-chain with restricted access.",
        "Access credentials verified without public exposure of personal data.",
      ],
    },
    cryptographicGuarantees: {
      title: "Off-Chain Encryption & Verified Access",
      summary:
        "End-to-end off-chain encryption shields attendee contact info while verifying event entry eligibility.",
      details: [
        "Encrypted off-chain metadata storage.",
        "Cryptographically authenticated attendee entry tokens.",
      ],
    },
    organizerVisibility: {
      canSee: [
        "Verified access status and ticket validity confirmation",
        "Encrypted attendee credential for check-in verification",
      ],
      cannotSee: [
        "Plaintext personal contact details without explicit attendee consent",
        "Private keys, seed phrases, or private assets",
      ],
    },
    badgeTheme: {
      containerClass:
        "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200 hover:bg-purple-100/80 dark:hover:bg-purple-900/50",
      textClass: "text-purple-900 dark:text-purple-200",
      iconColorClass: "text-[#6917AF] dark:text-[#D7B5F5]",
      pillBgClass: "bg-purple-100 dark:bg-purple-900/60 text-[#6917AF] dark:text-[#D7B5F5]",
      pillTextClass: "text-[#6917AF] dark:text-[#D7B5F5]",
      dotClass: "bg-[#6917AF] dark:bg-[#D7B5F5]",
    },
  },
  Anonymous: {
    mode: "Anonymous",
    label: "Anonymous",
    badgeLabel: "Anonymous",
    guaranteeText:
      "Zero-knowledge proof registration; no wallet address or personal identity stored on-chain or off-chain.",
    tagline: "Zero identity footprint with zero-knowledge cryptographic proof",
    description:
      "Anonymous mode uses zero-knowledge cryptography to prove ticket validity. Neither your Stellar wallet address nor any personal identity is stored on-chain or off-chain.",
    onChain: {
      title: "On-Chain Disclosures",
      details: [
        "Zero-knowledge proof verification token only.",
        "No wallet address or personal identity linked or stored on-chain.",
      ],
    },
    offChain: {
      title: "Off-Chain Storage",
      details: [
        "Zero personal identity, name, or contact details stored off-chain.",
        "Zero tracking cookies, identifiers, or attendee profiles retained.",
      ],
    },
    cryptographicGuarantees: {
      title: "Zero-Knowledge Proof (ZKP) Guarantee",
      summary:
        "Cryptographic zero-knowledge proofs mathematically guarantee ticket authenticity without revealing who you are.",
      details: [
        "Zero-Knowledge Proof (ZKP) cryptographic anonymity guarantee.",
        "No identity linkage between ticket holder and payment origin.",
      ],
    },
    organizerVisibility: {
      canSee: [
        "Mathematical proof confirming that a valid ticket holder has checked in",
      ],
      cannotSee: [
        "Your Stellar wallet address",
        "Your name, email, IP address, or any personal identity attributes",
        "Past attendance or transaction history",
      ],
    },
    badgeTheme: {
      containerClass:
        "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50",
      textClass: "text-emerald-900 dark:text-emerald-200",
      iconColorClass: "text-emerald-600 dark:text-emerald-400",
      pillBgClass: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300",
      pillTextClass: "text-emerald-700 dark:text-emerald-300",
      dotClass: "bg-emerald-500 dark:bg-emerald-400",
    },
  },
};

export const ALL_PRIVACY_MODES: CanonicalPrivacyLevel[] = [
  "Standard",
  "Private",
  "Anonymous",
];

/**
 * Normalizes any privacy string or PrivacyLevel enum value to one of the canonical modes.
 */
export function normalizePrivacyLevel(
  level?: PrivacyMode | PrivacyLevel | string | null,
): CanonicalPrivacyLevel {
  if (!level) return "Anonymous";
  const lower = level.toLowerCase().trim();
  if (lower.includes("anon")) return "Anonymous";
  if (lower.includes("private") || lower.includes("verified")) return "Private";
  if (lower.includes("wallet") || lower.includes("standard") || lower.includes("public"))
    return "Standard";
  return "Standard";
}

/**
 * Retrieves the full configuration for a given privacy level mode.
 */
export function getPrivacyConfig(
  level?: PrivacyMode | PrivacyLevel | string | null,
): PrivacyLevelConfig {
  const canonical = normalizePrivacyLevel(level);
  return PRIVACY_DISCLOSURES[canonical];
}
