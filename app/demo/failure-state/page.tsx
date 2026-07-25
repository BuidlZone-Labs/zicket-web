"use client";

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Wallet, 
  Clock, 
  Lock, 
  Cpu, 
  WifiOff, 
  AlertOctagon 
} from 'lucide-react';
import { useFailureState } from '@/hooks/useFailureState';
import { FailureStateModal } from '@/components/FailureStateModal';
import { FailureStateBanner } from '@/components/FailureStateBanner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FailureErrorCode } from '@/types/failureState';

export default function FailureStateDemoPage() {
  const {
    failureState,
    isOpen,
    triggerFailure,
    clearFailure,
    downloadDiagnostics,
  } = useFailureState();

  const [activeBannerError, setActiveBannerError] = useState<FailureErrorCode | null>('PARTIAL_CONFIRMATION');

  const handleSimulateError = (code: FailureErrorCode, sampleTxHash?: string) => {
    let mockTechDetails = null;

    if (code === 'PRIVACY_PROOF_FAILED') {
      mockTechDetails = `Error: ZK-SNARK Circuit constraints unfulfilled.
Circuit: zicket_ticket_verifier_v2.wasm
Constraint #1402 failed (Public input commitment mismatch)
at generateProof (zk/prover.ts:89:12)`;
    } else if (code === 'BLOCKCHAIN_TIMEOUT') {
      mockTechDetails = `RPC Node Timeout (504 Gateway Timeout)
Endpoint: https://api.mainnet-beta.solana.com
Duration: 30000ms
TxId: 4vJ9...8xKq`;
    } else if (code === 'WALLET_USER_REJECTED') {
      mockTechDetails = `WalletError: User rejected the request. Code: 4001`;
    }

    triggerFailure(code, {
      txHash: sampleTxHash || (code.includes('BLOCKCHAIN') ? '5K3M...9ZpW' : null),
      technicalDetails: mockTechDetails,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-12 max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="space-y-2 border-b border-card-border pb-6">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6917AF]/10 text-[#6917AF] dark:text-[#D7B5F5]">
            Design System #91 Implementation
          </span>
          <span className="text-xs text-muted-foreground">Issue #164</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Failure-State UX System Demo
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Unified handling for privacy, zero-knowledge, and blockchain edge cases. Test live failure modals, action triggers, and inline status banners below.
        </p>
      </div>

      {/* Inline Banner Preview */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertOctagon className="size-5 text-[#6917AF]" />
          Inline Failure Banner Component
        </h2>

        {activeBannerError ? (
          <FailureStateBanner
            failureState={{
              code: 'PARTIAL_CONFIRMATION',
              category: 'blockchain',
              severity: 'warning',
              title: 'Partial Relayer Confirmation Pending',
              userMessage: 'On-chain payment detected (TxHash: 4z9P...2kL), but ticket NFT metadata indexing is currently sync delayed.',
              timestamp: new Date().toISOString(),
              suggestedActions: [{ type: 'RETRY', label: 'Check Relayer' }],
              retryable: true,
            }}
            onRetry={() => alert('Checking relayer status...')}
            onDismiss={() => setActiveBannerError(null)}
          />
        ) : (
          <div className="p-4 rounded-xl border border-dashed text-center text-xs text-muted-foreground flex justify-between items-center">
            <span>Inline banner dismissed.</span>
            <Button size="sm" variant="ghost" onClick={() => setActiveBannerError('PARTIAL_CONFIRMATION')}>
              Restore Banner
            </Button>
          </div>
        )}
      </div>

      {/* Interactive Trigger Matrix */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Simulate Blockchain & Privacy Failure Scenarios</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Wallet User Rejection */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="size-4 text-amber-500" />
                Wallet Cancelled
              </CardTitle>
              <CardDescription className="text-xs">
                User rejected signature or transaction prompt in Phantom/MetaMask.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs" 
                onClick={() => handleSimulateError('WALLET_USER_REJECTED')}
              >
                Simulate Rejection
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: ZK Proof Failure */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="size-4 text-purple-500" />
                ZK Proof Failed
              </CardTitle>
              <CardDescription className="text-xs">
                Zero-Knowledge privacy circuit failed constraint verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Button 
                variant="gradient" 
                size="sm" 
                className="w-full text-xs" 
                onClick={() => handleSimulateError('PRIVACY_PROOF_FAILED')}
              >
                Simulate ZK Error
              </Button>
            </CardContent>
          </Card>

          {/* Card 3: Blockchain Timeout */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="size-4 text-red-500" />
                Chain Timeout
              </CardTitle>
              <CardDescription className="text-xs">
                RPC node timed out during transaction confirmation.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs" 
                onClick={() => handleSimulateError('BLOCKCHAIN_TIMEOUT')}
              >
                Simulate Timeout
              </Button>
            </CardContent>
          </Card>

          {/* Card 4: Decryption Key Mismatch */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="size-4 text-rose-500" />
                Key Mismatch
              </CardTitle>
              <CardDescription className="text-xs">
                Wallet key does not match private ticket encryption signature.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs" 
                onClick={() => handleSimulateError('DECRYPTION_KEY_MISMATCH')}
              >
                Simulate Key Error
              </Button>
            </CardContent>
          </Card>

          {/* Card 5: Insufficient Gas */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Cpu className="size-4 text-amber-500" />
                Insufficient Gas
              </CardTitle>
              <CardDescription className="text-xs">
                Account balance too low to cover transaction fees.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs" 
                onClick={() => handleSimulateError('INSUFFICIENT_GAS')}
              >
                Simulate Gas Error
              </Button>
            </CardContent>
          </Card>

          {/* Card 6: Network Offline */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <WifiOff className="size-4 text-blue-500" />
                Network Offline
              </CardTitle>
              <CardDescription className="text-xs">
                Client internet connection dropped during submission.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs" 
                onClick={() => handleSimulateError('NETWORK_OFFLINE')}
              >
                Simulate Offline
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Global Failure Modal instance */}
      <FailureStateModal
        isOpen={isOpen}
        onClose={clearFailure}
        failureState={failureState}
        onRetry={() => {
          alert(`Retrying action for error: ${failureState?.code}`);
          clearFailure();
        }}
        onDownloadDiagnostics={downloadDiagnostics}
        onSwitchNetwork={() => {
          alert('Switching RPC Network...');
          clearFailure();
        }}
      />

    </div>
  );
}
