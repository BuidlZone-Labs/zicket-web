import { FailureErrorCode, FailureCategory, FailureSeverity, ActionOption } from '@/types/failureState';

export interface FailureConfig {
  code: FailureErrorCode;
  category: FailureCategory;
  severity: FailureSeverity;
  title: string;
  userMessage: string;
  defaultActions: ActionOption[];
  retryable: boolean;
}

export const FAILURE_CONFIGS: Record<FailureErrorCode, FailureConfig> = {
  // Blockchain / Wallet Errors
  WALLET_USER_REJECTED: {
    code: 'WALLET_USER_REJECTED',
    category: 'blockchain',
    severity: 'warning',
    title: 'Transaction Cancelled in Wallet',
    userMessage: 'You rejected the transaction prompt in your wallet. No funds or tickets were charged.',
    retryable: true,
    defaultActions: [
      { type: 'RETRY', label: 'Try Again', variant: 'gradient', primary: true },
      { type: 'DISMISS', label: 'Close', variant: 'outline' },
    ],
  },
  BLOCKCHAIN_TIMEOUT: {
    code: 'BLOCKCHAIN_TIMEOUT',
    category: 'blockchain',
    severity: 'error',
    title: 'Blockchain Confirmation Timeout',
    userMessage: 'The network is experiencing high congestion. Your transaction was broadcasted but is taking longer than expected to confirm.',
    retryable: true,
    defaultActions: [
      { type: 'CONTINUE_BACKGROUND', label: 'Check Status in Background', variant: 'gradient', primary: true },
      { type: 'DOWNLOAD_DIAGNOSTICS', label: 'Export Error Log', variant: 'outline' },
    ],
  },
  PARTIAL_CONFIRMATION: {
    code: 'PARTIAL_CONFIRMATION',
    category: 'blockchain',
    severity: 'warning',
    title: 'Partial State Confirmation',
    userMessage: 'Your transaction payment succeeded on-chain, but the ticket reservation metadata is still syncing with the relayer.',
    retryable: false,
    defaultActions: [
      { type: 'CONTINUE_BACKGROUND', label: 'Wait for Relayer Sync', variant: 'gradient', primary: true },
      { type: 'CONTACT_SUPPORT', label: 'Get Help', variant: 'outline' },
    ],
  },
  INSUFFICIENT_GAS: {
    code: 'INSUFFICIENT_GAS',
    category: 'blockchain',
    severity: 'error',
    title: 'Insufficient Gas / Funds',
    userMessage: 'Your wallet does not have enough native tokens to cover the transaction gas fee.',
    retryable: true,
    defaultActions: [
      { type: 'RETRY', label: 'Retry with Lower Gas', variant: 'gradient', primary: true },
      { type: 'DISMISS', label: 'Close', variant: 'outline' },
    ],
  },
  SLIPPAGE_EXCEEDED: {
    code: 'SLIPPAGE_EXCEEDED',
    category: 'blockchain',
    severity: 'error',
    title: 'Slippage / Price Movement Error',
    userMessage: 'Ticket price or gas rate changed while your transaction was being submitted.',
    retryable: true,
    defaultActions: [
      { type: 'RETRY', label: 'Retry Purchase', variant: 'gradient', primary: true },
      { type: 'DISMISS', label: 'Cancel', variant: 'outline' },
    ],
  },
  RPC_NODE_ERROR: {
    code: 'RPC_NODE_ERROR',
    category: 'blockchain',
    severity: 'error',
    title: 'RPC Provider Communication Error',
    userMessage: 'Failed to reach the blockchain node provider. Your connection timed out or reached rate limits.',
    retryable: true,
    defaultActions: [
      { type: 'SWITCH_NETWORK', label: 'Switch RPC Provider', variant: 'gradient', primary: true },
      { type: 'RETRY', label: 'Retry Connection', variant: 'outline' },
    ],
  },

  // Privacy / Zero-Knowledge Edge Cases
  PRIVACY_PROOF_FAILED: {
    code: 'PRIVACY_PROOF_FAILED',
    category: 'privacy',
    severity: 'error',
    title: 'Zero-Knowledge Proof Generation Failed',
    userMessage: 'Could not generate the privacy proof required to shield your ticket identity. Your personal data remains private.',
    retryable: true,
    defaultActions: [
      { type: 'RETRY', label: 'Regenerate ZK Proof', variant: 'gradient', primary: true },
      { type: 'DOWNLOAD_DIAGNOSTICS', label: 'Save Diagnostic Log', variant: 'outline' },
    ],
  },
  ZK_CIRCUIT_TIMEOUT: {
    code: 'ZK_CIRCUIT_TIMEOUT',
    category: 'privacy',
    severity: 'warning',
    title: 'Privacy Proof Calculation Delayed',
    userMessage: 'Client-side zero-knowledge proof generation timed out due to high device load or complexity.',
    retryable: true,
    defaultActions: [
      { type: 'RETRY', label: 'Re-run Proof Generator', variant: 'gradient', primary: true },
      { type: 'DISMISS', label: 'Cancel', variant: 'outline' },
    ],
  },
  DECRYPTION_KEY_MISMATCH: {
    code: 'DECRYPTION_KEY_MISMATCH',
    category: 'privacy',
    severity: 'critical',
    title: 'Encrypted Ticket Key Mismatch',
    userMessage: 'The connected wallet signature does not match the encryption key for this private ticket.',
    retryable: true,
    defaultActions: [
      { type: 'RETRY', label: 'Re-authenticate Wallet Signature', variant: 'gradient', primary: true },
      { type: 'CONTACT_SUPPORT', label: 'Support Assistance', variant: 'outline' },
    ],
  },
  SHIELDED_SESSION_EXPIRED: {
    code: 'SHIELDED_SESSION_EXPIRED',
    category: 'privacy',
    severity: 'warning',
    title: 'Shielded Privacy Session Expired',
    userMessage: 'Your confidential ticket verification session timed out for safety reasons.',
    retryable: true,
    defaultActions: [
      { type: 'RETRY', label: 'Renew Private Session', variant: 'gradient', primary: true },
      { type: 'DISMISS', label: 'Dismiss', variant: 'outline' },
    ],
  },

  // Network & System
  NETWORK_OFFLINE: {
    code: 'NETWORK_OFFLINE',
    category: 'network',
    severity: 'warning',
    title: 'Network Connection Interrupted',
    userMessage: 'Your internet connection was lost while communicating with the Zicket relayer.',
    retryable: true,
    defaultActions: [
      { type: 'RETRY', label: 'Check & Reconnect', variant: 'gradient', primary: true },
    ],
  },
  UNKNOWN_SYSTEM_ERROR: {
    code: 'UNKNOWN_SYSTEM_ERROR',
    category: 'system',
    severity: 'error',
    title: 'Unexpected Error Occurred',
    userMessage: 'An unhandled exception occurred during transaction processing.',
    retryable: true,
    defaultActions: [
      { type: 'RETRY', label: 'Retry', variant: 'gradient', primary: true },
      { type: 'DOWNLOAD_DIAGNOSTICS', label: 'Export Diagnostics', variant: 'outline' },
    ],
  },
};
