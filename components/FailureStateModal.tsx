"use client";

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  WifiOff, 
  HelpCircle, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  ArrowRightLeft, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FailureStateDetails, ActionOption } from '@/types/failureState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface FailureStateModalProps {
  isOpen: boolean;
  onClose: () => void;
  failureState: FailureStateDetails | null;
  onRetry?: () => void;
  onSwitchNetwork?: () => void;
  onDownloadDiagnostics?: () => void;
  onContactSupport?: () => void;
  onContinueBackground?: () => void;
}

export function FailureStateModal({
  isOpen,
  onClose,
  failureState,
  onRetry,
  onSwitchNetwork,
  onDownloadDiagnostics,
  onContactSupport,
  onContinueBackground,
}: FailureStateModalProps) {
  const [copied, setCopied] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);

  if (!failureState) return null;

  const handleCopyTechDetails = () => {
    const textToCopy = failureState.technicalDetails || `Error Code: ${failureState.code}\nTxHash: ${failureState.txHash || 'N/A'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryTheme = () => {
    switch (failureState.category) {
      case 'privacy':
        return {
          icon: ShieldAlert,
          badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800',
          iconColor: 'text-[#6917AF] dark:text-[#D7B5F5]',
          borderAccent: 'border-purple-200 dark:border-purple-900',
          badgeText: 'Privacy & ZK Safeguard',
        };
      case 'blockchain':
        return {
          icon: AlertTriangle,
          badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800',
          iconColor: 'text-amber-600 dark:text-amber-400',
          borderAccent: 'border-amber-200 dark:border-amber-900',
          badgeText: 'Blockchain Network State',
        };
      case 'network':
        return {
          icon: WifiOff,
          badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          borderAccent: 'border-blue-200 dark:border-blue-900',
          badgeText: 'Connection State',
        };
      default:
        return {
          icon: HelpCircle,
          badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800',
          iconColor: 'text-rose-600 dark:text-rose-400',
          borderAccent: 'border-rose-200 dark:border-rose-900',
          badgeText: 'System Exception',
        };
    }
  };

  const theme = getCategoryTheme();
  const IconComponent = theme.icon;

  const handleActionClick = (action: ActionOption) => {
    switch (action.type) {
      case 'RETRY':
        if (onRetry) {
          onRetry();
        } else {
          onClose();
        }
        break;
      case 'SWITCH_NETWORK':
        if (onSwitchNetwork) {
          onSwitchNetwork();
        } else {
          onClose();
        }
        break;
      case 'DOWNLOAD_DIAGNOSTICS':
        if (onDownloadDiagnostics) {
          onDownloadDiagnostics();
        } else {
          handleCopyTechDetails();
        }
        break;
      case 'CONTACT_SUPPORT':
        if (onContactSupport) {
          onContactSupport();
        } else {
          window.open('https://discord.gg/buidlzone', '_blank');
        }
        break;
      case 'CONTINUE_BACKGROUND':
        if (onContinueBackground) {
          onContinueBackground();
        } else {
          onClose();
        }
        break;
      case 'DISMISS':
      default:
        onClose();
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-[500px] border-card-border bg-background p-6 rounded-2xl shadow-2xl transition-all dark:bg-[#191124] dark:border-[#38224D]">
        
        {/* Header Section */}
        <DialogHeader className="space-y-3 text-left">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className={cn("px-3 py-1 font-medium text-xs rounded-full border", theme.badgeBg)}>
              {theme.badgeText}
            </Badge>

            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              ID: {failureState.code}
            </span>
          </div>

          <div className="flex items-start gap-3.5 pt-1">
            <div className={cn("p-2.5 rounded-xl bg-accent/40 shrink-0", theme.borderAccent)}>
              <IconComponent className={cn("size-6", theme.iconColor)} />
            </div>

            <div className="space-y-1">
              <DialogTitle className="text-lg font-bold text-foreground leading-snug">
                {failureState.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                {failureState.userMessage}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Transaction Hash & Explorer Link */}
        {failureState.txHash && (
          <div className="mt-4 p-3 rounded-lg bg-accent/30 border border-accent flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="text-muted-foreground font-medium">Transaction Hash</p>
              <p className="font-mono text-foreground truncate max-w-[240px]">
                {failureState.txHash}
              </p>
            </div>
            <a 
              href={`https://solscan.io/tx/${failureState.txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#6917AF] dark:text-[#D7B5F5] hover:underline font-semibold"
            >
              Solscan <ExternalLink className="size-3" />
            </a>
          </div>
        )}

        {/* Technical Details Accordion */}
        {failureState.technicalDetails && (
          <div className="mt-4 border border-card-border dark:border-[#38224D] rounded-xl overflow-hidden text-xs">
            <button
              onClick={() => setShowTechnical(!showTechnical)}
              className="w-full flex items-center justify-between p-3 bg-muted/40 hover:bg-muted/60 transition-colors text-left font-medium text-muted-foreground"
            >
              <span>Developer & RPC Diagnostic Logs</span>
              {showTechnical ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>

            {showTechnical && (
              <div className="p-3 bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto space-y-2 border-t border-card-border dark:border-[#38224D]">
                <div className="flex justify-between items-center pb-1 border-b border-slate-800">
                  <span className="text-slate-400">Stack Trace / Payload:</span>
                  <button 
                    onClick={handleCopyTechDetails} 
                    className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-sans text-xs"
                  >
                    {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap break-all text-slate-300">
                  {failureState.technicalDetails}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons Footer */}
        <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          {failureState.suggestedActions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant || (action.primary ? 'gradient' : 'outline')}
              onClick={() => handleActionClick(action)}
              className={cn("w-full sm:w-auto font-medium text-sm", action.primary && "shadow-md")}
            >
              {action.type === 'RETRY' && <RefreshCw className="size-4 mr-1.5 animate-spin-once" />}
              {action.type === 'SWITCH_NETWORK' && <ArrowRightLeft className="size-4 mr-1.5" />}
              {action.type === 'DOWNLOAD_DIAGNOSTICS' && <Download className="size-4 mr-1.5" />}
              {action.label}
            </Button>
          ))}
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
