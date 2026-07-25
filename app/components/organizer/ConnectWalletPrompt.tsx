"use client";

import Image from "next/image";
import { ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { trackAnalyticsEvent } from "@/lib/privacyAnalytics";
import { loadWalletSDK, preloadWalletSDK, WalletLoadState } from "@/lib/walletSdk";
import { useUserSessionSync } from "@/lib/user-session-sync";
import { useFailureState } from "@/hooks/useFailureState";
import { FailureStateModal } from "@/components/FailureStateModal";
import { FailureStateBanner } from "@/components/FailureStateBanner";

export default function ConnectWalletPrompt() {
  const [walletState, setWalletState] = useState<WalletLoadState>({
    isLoading: false,
    error: null,
  });
  const { walletConnected, setWalletConnected } = useUserSessionSync();

  const {
    failureState,
    isOpen: isFailureModalOpen,
    triggerFailure,
    clearFailure,
    downloadDiagnostics,
  } = useFailureState();

  useEffect(() => {
    if (walletState.error) {
      triggerFailure(walletState.error, {
        technicalDetails: "Wallet connection load failed in organizer prompt.",
      });
    }
  }, [walletState.error, triggerFailure]);

  async function handleConnectWallet() {
    trackAnalyticsEvent("wallet_connect_cta_clicked", { source: "organizer_prompt" });
    setWalletState({ isLoading: true, error: null });
    try {
      await loadWalletSDK();
      setWalletConnected(true);
      // TODO: invoke wallet connection flow with the loaded SDK
      setWalletState({ isLoading: false, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load wallet. Please try again.";
      setWalletState({ isLoading: false, error: message });
    }
  }

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 border border-[#E3E3E3] rounded-2xl py-8 px-6 md:px-16 bg-white dark:bg-[#121212] dark:border-[#232323]">
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
        <h2 className="text-xl md:text-2xl font-bold text-[#1D2939] dark:text-[#E0E0E0]">
          Connect your wallet
        </h2>

        <p className="text-sm md:text-base text-[#475467] dark:text-[#98A2B3] leading-relaxed max-w-70">
          Connect your wallet to receive payments from paid events.
        </p>

        <div className="mt-2 flex flex-col items-center gap-3">
          <button
            onClick={handleConnectWallet}
            onMouseEnter={preloadWalletSDK}
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
                {walletConnected ? "Wallet Connected" : "Connect Wallet"}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition ease-in-out duration-300" />
              </>
            )}
          </button>
          {walletState.error && failureState && (
            <div className="w-full max-w-sm">
              <FailureStateBanner
                failureState={failureState}
                onRetry={handleConnectWallet}
              />
            </div>
          )}
        </div>
      </div>

      <FailureStateModal
        isOpen={isFailureModalOpen}
        onClose={clearFailure}
        failureState={failureState}
        onRetry={handleConnectWallet}
        onDownloadDiagnostics={downloadDiagnostics}
      />
    </div>
  );
}
