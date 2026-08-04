"use client";

import Image from "next/image";
import { ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { trackAnalyticsEvent } from "@/lib/privacyAnalytics";
import { loadWalletSDK, preloadWalletSDK, WalletLoadState } from "@/lib/walletSdk";
import type { WalletChain } from "@/lib/wallet/types";
import { useUserSessionSync } from "@/lib/user-session-sync";
import { TransactionStatusBanner } from "@/components/TransactionStatusBanner";
import { PrivacyTrustModal } from "@/app/components/privacy/PrivacyTrustModal";

const CHAIN_OPTIONS: { id: WalletChain; label: string }[] = [
  { id: "stellar", label: "Stellar" },
  { id: "aztec", label: "Aztec" },
];

/**
 * Organizer-facing prompt to connect a wallet for receiving payments. Surfaces
 * connect errors through the shared {@link TransactionStatusBanner} so wallet
 * failures look consistent with the attendee checkout flow. A Privacy Trust
 * prompt runs first, so the wallet only connects once the user confirms they
 * understand what is (and isn't) shared.
 */
export default function ConnectWalletPrompt() {
  const [walletState, setWalletState] = useState<WalletLoadState>({
    isLoading: false,
    error: null,
  });
  // Privacy Trust prompt: the button opens this first; the wallet only connects
  // once the user confirms in the modal.
  const [trustOpen, setTrustOpen] = useState(false);
  const [chain, setChain] = useState<WalletChain>("stellar");
  const { walletConnected, walletAddress, walletName, setWalletConnected } = useUserSessionSync();

  /** Guard, then open the trust prompt instead of connecting straight away. */
  function handleConnectWallet() {
    if (walletState.isLoading) return;
    trackAnalyticsEvent("wallet_connect_cta_clicked", { source: "organizer_prompt" });
    setTrustOpen(true);
  }

  /** The actual connect — only reached after the user confirms in the modal. */
  async function runConnect() {
    setTrustOpen(false);
    setWalletState({ isLoading: true, error: null });
    try {
      const adapter = await loadWalletSDK(chain);
      const account = adapter.getAccount();
      setWalletConnected(true, account ?? undefined);
      setWalletState({ isLoading: false, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load wallet. Please try again.";
      setWalletState({ isLoading: false, error: message });
    }
  }

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 border border-[#E3E3E3] rounded-2xl py-8 px-6 md:px-16 bg-white">
      <div className="shrink-0">
        <Image
          src="/images/connect-wallet-illustration.png"
          alt="Two people connecting a plug illustration"
          width={350}
          height={260}
          className="w-70 md:w-87.5 h-auto"
        />
      </div>

      <div className="flex flex-col items-center text-center gap-3">
        <h2 className="text-xl md:text-2xl font-bold text-[#1D2939]">
          Connect your wallet
        </h2>

        <p className="text-sm md:text-base text-[#475467] leading-relaxed max-w-70">
          Connect your wallet to receive payments from paid events.
        </p>

        {!walletConnected && (
          <div className="flex gap-2" role="radiogroup" aria-label="Wallet network">
            {CHAIN_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={chain === option.id}
                onClick={() => setChain(option.id)}
                disabled={walletState.isLoading}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition disabled:opacity-60 disabled:cursor-not-allowed ${
                  chain === option.id
                    ? "bg-[#6917AF] text-white border-[#6917AF]"
                    : "bg-white text-[#475467] border-[#E3E3E3] hover:border-[#6917AF]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-2">
          <button
            onClick={handleConnectWallet}
            onMouseEnter={() => preloadWalletSDK(chain)}
            onFocus={() => preloadWalletSDK(chain)}
            disabled={walletState.isLoading}
            className="inline-flex group items-center cursor-pointer gap-2 bg-[#6917AF] hover:bg-[#5A1296] text-white font-medium text-sm md:text-base px-8 py-3 rounded-full transition whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {walletState.isLoading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                <span>Connecting…</span>
              </>
            ) : (
              <>
                {walletConnected
                  ? `Connected${walletName ? ` — ${walletName}` : ""}`
                  : "Connect Wallet"}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition ease-in-out duration-300" />
              </>
            )}
          </button>
          {walletConnected && walletAddress && (
            <p className="mt-2 text-xs text-[#667185] break-all">{walletAddress}</p>
          )}
          {/* Rendered unconditionally (idle collapses to nothing) so the
              banner's live region is already observed when the first error
              appears — mounting it only on error would risk a missed
              screen-reader announcement. */}
          <TransactionStatusBanner
            status={walletState.error ? "wallet_error" : "idle"}
            error={walletState.error}
            hint="Make sure your wallet extension is unlocked, then try again."
            onRetry={handleConnectWallet}
            className="mt-3 text-left"
          />
        </div>
      </div>

      <PrivacyTrustModal
        isOpen={trustOpen}
        context="wallet-connect"
        privacyLevel="Wallet Required"
        onConfirm={runConnect}
        onClose={() => setTrustOpen(false)}
      />
    </div>
  );
}
