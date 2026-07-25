"use client";

import React from 'react';
import { AlertTriangle, ShieldAlert, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FailureStateDetails } from '@/types/failureState';
import { Button } from '@/components/ui/button';

export interface FailureStateBannerProps {
  failureState: FailureStateDetails;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function FailureStateBanner({
  failureState,
  onRetry,
  onDismiss,
  className,
}: FailureStateBannerProps) {
  const isPrivacy = failureState.category === 'privacy';

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all duration-300",
        isPrivacy 
          ? "bg-[#F5EEFF] dark:bg-[#1C0F2E] border-[#D4ADFC] dark:border-[#4A1F7A] text-[#6917AF] dark:text-[#D7B5F5]"
          : "bg-[#FEF3F2] dark:bg-[#2D0B09] border-[#FDA29B] dark:border-[#7F1D1D] text-[#B42318] dark:text-[#F87171]",
        className
      )}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {isPrivacy ? (
          <ShieldAlert className="size-5 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="size-5 shrink-0 mt-0.5" />
        )}

        <div className="space-y-0.5 text-xs">
          <p className="font-semibold text-sm leading-tight">
            {failureState.title}
          </p>
          <p className="opacity-90 leading-relaxed">
            {failureState.userMessage}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-current/10">
        {onRetry && failureState.retryable && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="h-8 text-xs font-medium border-current/30 hover:bg-current/10"
          >
            <RefreshCw className="size-3.5 mr-1" />
            Retry
          </Button>
        )}

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-md hover:bg-current/10 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss banner"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
