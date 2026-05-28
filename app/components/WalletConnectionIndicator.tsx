"use client";

import React from "react";
import { CheckCircle2, Wallet, AlertCircle } from "lucide-react";
import { useUserSessionSync } from "@/lib/user-session-sync";

interface WalletConnectionIndicatorProps {
  variant?: "user" | "organizer";
  className?: string;
  showLabel?: boolean;
}

export default function WalletConnectionIndicator({ 
  variant = "user", 
  className = "",
  showLabel = true 
}: WalletConnectionIndicatorProps) {
  const { walletConnected } = useUserSessionSync();

  const baseClasses = "flex items-center gap-2 transition-all duration-200";
  const variantClasses = variant === "organizer" 
    ? "px-3 py-2 rounded-lg text-sm font-medium"
    : "px-4 py-2 rounded-full text-sm font-medium";

  const statusClasses = walletConnected
    ? "bg-green-50 text-green-700 border border-green-200"
    : "bg-gray-50 text-gray-600 border border-gray-200";

  const iconClasses = walletConnected ? "text-green-500" : "text-gray-400";

  return (
    <div className={`${baseClasses} ${variantClasses} ${statusClasses} ${className}`}>
      {walletConnected ? (
        <CheckCircle2 className={`w-4 h-4 ${iconClasses}`} />
      ) : (
        <Wallet className={`w-4 h-4 ${iconClasses}`} />
      )}
      {showLabel && (
        <span>
          {walletConnected ? "Connected" : "Disconnected"}
        </span>
      )}
    </div>
  );
}
