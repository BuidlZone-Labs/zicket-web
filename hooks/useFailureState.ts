"use client";

import { useState, useCallback } from 'react';
import { 
  FailureStateDetails, 
  FailureErrorCode, 
  ActionOption 
} from '@/types/failureState';
import { FAILURE_CONFIGS } from '@/lib/failureStateConfigs';

export function parseErrorToFailureCode(error: unknown): FailureErrorCode {
  if (!error) return 'UNKNOWN_SYSTEM_ERROR';

  const errString = typeof error === 'string' 
    ? error 
    : (error as { message?: string; code?: number | string })?.message || JSON.stringify(error);

  const lower = errString.toLowerCase();

  // User rejection
  if (lower.includes('user rejected') || lower.includes('user cancelled') || lower.includes('declined') || lower.includes('4001')) {
    return 'WALLET_USER_REJECTED';
  }

  // ZK / Privacy proof errors
  if (lower.includes('zk') || lower.includes('proof') || lower.includes('snark') || lower.includes('circom')) {
    if (lower.includes('timeout') || lower.includes('time out')) {
      return 'ZK_CIRCUIT_TIMEOUT';
    }
    return 'PRIVACY_PROOF_FAILED';
  }

  // Shielded privacy session
  if (lower.includes('shielded') || lower.includes('session expired') || lower.includes('privacy session')) {
    return 'SHIELDED_SESSION_EXPIRED';
  }

  // Key / Decryption
  if (lower.includes('key mismatch') || lower.includes('decryption') || lower.includes('unauthorized key')) {
    return 'DECRYPTION_KEY_MISMATCH';
  }

  // Relayer / Partial Confirmation
  if (lower.includes('relayer') || lower.includes('indexing') || lower.includes('partial') || lower.includes('sync pending') || lower.includes('unconfirmed metadata')) {
    return 'PARTIAL_CONFIRMATION';
  }

  // Timeout / Gas
  if (lower.includes('insufficient funds') || lower.includes('gas required exceeds') || lower.includes('underpriced')) {
    return 'INSUFFICIENT_GAS';
  }

  if (lower.includes('timeout') || lower.includes('timed out') || lower.includes('took too long')) {
    return 'BLOCKCHAIN_TIMEOUT';
  }

  if (lower.includes('rpc') || lower.includes('503') || lower.includes('429') || lower.includes('rate limit')) {
    return 'RPC_NODE_ERROR';
  }

  if (lower.includes('slippage') || lower.includes('price changed')) {
    return 'SLIPPAGE_EXCEEDED';
  }

  if (lower.includes('offline') || lower.includes('fetch failed') || lower.includes('network error')) {
    return 'NETWORK_OFFLINE';
  }

  return 'UNKNOWN_SYSTEM_ERROR';
}

export function useFailureState() {
  const [failureState, setFailureState] = useState<FailureStateDetails | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const triggerFailure = useCallback((
    codeOrError: FailureErrorCode | unknown,
    options?: {
      customMessage?: string;
      technicalDetails?: string | null;
      txHash?: string | null;
      customActions?: ActionOption[];
    }
  ) => {
    let code: FailureErrorCode;

    if (typeof codeOrError === 'string' && codeOrError in FAILURE_CONFIGS) {
      code = codeOrError as FailureErrorCode;
    } else {
      code = parseErrorToFailureCode(codeOrError);
    }

    const config = FAILURE_CONFIGS[code] || FAILURE_CONFIGS.UNKNOWN_SYSTEM_ERROR;

    const technicalDetails = options?.technicalDetails ?? (
      typeof codeOrError === 'object' && codeOrError !== null
        ? JSON.stringify(codeOrError, Object.getOwnPropertyNames(codeOrError), 2)
        : typeof codeOrError === 'string' && !(codeOrError in FAILURE_CONFIGS)
        ? codeOrError
        : null
    );

    const newDetails: FailureStateDetails = {
      code,
      category: config.category,
      severity: config.severity,
      title: config.title,
      userMessage: options?.customMessage || config.userMessage,
      technicalDetails,
      txHash: options?.txHash || null,
      timestamp: new Date().toISOString(),
      suggestedActions: options?.customActions || config.defaultActions,
      retryable: config.retryable,
    };

    setFailureState(newDetails);
    setIsOpen(true);
  }, []);

  const clearFailure = useCallback(() => {
    setIsOpen(false);
    // Slight delay before clearing object to prevent layout jump during modal close transition
    setTimeout(() => setFailureState(null), 200);
  }, []);

  const downloadDiagnostics = useCallback(() => {
    if (!failureState) return;

    const diagnosticReport = {
      appName: 'Zicket Web Application',
      version: '1.0.0',
      timestamp: failureState.timestamp,
      errorCategory: failureState.category,
      errorCode: failureState.code,
      errorTitle: failureState.title,
      userMessage: failureState.userMessage,
      txHash: failureState.txHash || 'N/A',
      technicalDetails: failureState.technicalDetails || 'No stack trace available',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
    };

    const blob = new Blob([JSON.stringify(diagnosticReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zicket-failure-diagnostic-${failureState.code}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [failureState]);

  return {
    failureState,
    isOpen,
    setIsOpen,
    triggerFailure,
    clearFailure,
    downloadDiagnostics,
  };
}
