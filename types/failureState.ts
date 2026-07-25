export type FailureCategory = 'blockchain' | 'privacy' | 'network' | 'system';

export type FailureSeverity = 'info' | 'warning' | 'error' | 'critical';

export type FailureActionType = 
  | 'RETRY' 
  | 'SWITCH_NETWORK' 
  | 'DOWNLOAD_DIAGNOSTICS' 
  | 'CONTINUE_BACKGROUND' 
  | 'CONTACT_SUPPORT' 
  | 'DISMISS';

export interface ActionOption {
  type: FailureActionType;
  label: string;
  variant?: 'gradient' | 'default' | 'destructive' | 'outline' | 'ghost';
  primary?: boolean;
}

export type FailureErrorCode = 
  // Blockchain / Wallet Edge Cases
  | 'WALLET_USER_REJECTED'
  | 'BLOCKCHAIN_TIMEOUT'
  | 'PARTIAL_CONFIRMATION'
  | 'INSUFFICIENT_GAS'
  | 'SLIPPAGE_EXCEEDED'
  | 'RPC_NODE_ERROR'
  // Privacy / Zero-Knowledge Edge Cases
  | 'PRIVACY_PROOF_FAILED'
  | 'ZK_CIRCUIT_TIMEOUT'
  | 'DECRYPTION_KEY_MISMATCH'
  | 'SHIELDED_SESSION_EXPIRED'
  // Network / General System
  | 'NETWORK_OFFLINE'
  | 'UNKNOWN_SYSTEM_ERROR';

export interface FailureStateDetails {
  code: FailureErrorCode;
  category: FailureCategory;
  severity: FailureSeverity;
  title: string;
  userMessage: string;
  technicalDetails?: string | null;
  txHash?: string | null;
  timestamp: string;
  suggestedActions: ActionOption[];
  retryable: boolean;
}
