'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/public/images/Logo.png';
import { QRCodeScanner } from '@/app/components/QRCodeScanner';
import { parseQrPayload } from '@/lib/tickets';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import {
  CheckCircle2,
  XCircle,
  QrCode,
  Keyboard,
  RefreshCw,
  WifiOff,
  ShieldAlert,
  ArrowLeft,
  Wallet,
  Tag,
} from 'lucide-react';

interface TicketDetails {
  id: string;
  eventId: string;
  ticketType?: string;
  seat?: string | null;
  section?: string | null;
  checkedInAt?: string | null;
}

interface EventDetails {
  id: string;
  title: string;
  venue?: string;
}

interface CheckInResponse {
  success: boolean;
  message?: string;
  reason?: string;
  error?: string;
  ticket?: TicketDetails;
  event?: EventDetails;
  checkedInAt?: string;
}

interface QueuedCheckIn {
  ticketId: string;
  eventId?: string;
  payload?: string;
  timestamp: string;
}

const OFFLINE_QUEUE_KEY = 'zicket_offline_checkin_queue';

export default function OrganizerCheckInPage() {
  const { publicKey, connect, isConnecting } = useStellarWallet();
  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');
  const [manualTicketId, setManualTicketId] = useState('');
  const [selectedEventId] = useState('crypto-build-ghana');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultState, setResultState] = useState<CheckInResponse | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<QueuedCheckIn[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor network status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load persisted offline queue
    try {
      const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        setOfflineQueue(JSON.parse(stored));
      }
    } catch {}

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync offline queue when coming back online
  const processOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0 || !navigator.onLine || isSyncing) return;

    setIsSyncing(true);
    const remaining: QueuedCheckIn[] = [];

    for (const item of offlineQueue) {
      try {
        const res = await fetch('/api/tickets/verify-attend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticketId: item.ticketId,
            eventId: item.eventId,
            payload: item.payload,
          }),
        });
        if (!res.ok && res.status >= 500) {
          remaining.push(item);
        }
      } catch {
        remaining.push(item);
      }
    }

    setOfflineQueue(remaining);
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    } catch {}
    setIsSyncing(false);
  }, [offlineQueue, isSyncing]);

  useEffect(() => {
    if (!isOffline && offlineQueue.length > 0) {
      processOfflineQueue();
    }
  }, [isOffline, offlineQueue.length, processOfflineQueue]);

  // Execute Check-in API request
  const handleCheckInRequest = async (ticketId: string, payloadRaw?: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setResultState(null);

    const cleanTicketId = ticketId.trim();
    if (!cleanTicketId) {
      setResultState({
        success: false,
        reason: 'INVALID_PAYLOAD',
        error: 'Check-in Failed — Invalid Ticket ID',
      });
      setIsProcessing(false);
      return;
    }

    if (!publicKey) {
      setResultState({
        success: false,
        reason: 'UNAUTHORIZED',
        error: 'Check-in Failed — Organizer authentication required. Connect wallet first.',
      });
      setIsProcessing(false);
      return;
    }

    // Handle offline status
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const queuedItem: QueuedCheckIn = {
        ticketId: cleanTicketId,
        eventId: selectedEventId,
        payload: payloadRaw,
        timestamp: new Date().toISOString(),
      };

      const updated = [...offlineQueue, queuedItem];
      setOfflineQueue(updated);
      try {
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
      } catch {}

      setResultState({
        success: false,
        reason: 'PENDING_OFFLINE',
        error: 'Check-in Pending Verification — Queued Offline',
      });
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch('/api/tickets/verify-attend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Organizer-Address': publicKey,
          'Authorization': `Bearer ${publicKey}`,
        },
        body: JSON.stringify({
          ticketId: cleanTicketId,
          eventId: selectedEventId,
          payload: payloadRaw,
          organizerAddress: publicKey,
        }),
      });

      const data = (await response.json()) as CheckInResponse;
      setResultState(data);
    } catch {
      // Network error during fetch -> queue offline
      const queuedItem: QueuedCheckIn = {
        ticketId: cleanTicketId,
        eventId: selectedEventId,
        payload: payloadRaw,
        timestamp: new Date().toISOString(),
      };
      const updated = [...offlineQueue, queuedItem];
      setOfflineQueue(updated);
      try {
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
      } catch {}

      setResultState({
        success: false,
        reason: 'NETWORK_ERROR',
        error: 'Check-in Failed — Unable to verify ticket. Queued for offline sync.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // QR scan handler
  const handleQrScan = (scannedText: string) => {
    const parsed = parseQrPayload(scannedText);
    if (!parsed) {
      setResultState({
        success: false,
        reason: 'INVALID_PAYLOAD',
        error: 'Check-in Failed — Invalid QR Code',
      });
      return;
    }
    handleCheckInRequest(parsed.ticketId, scannedText);
  };

  // Manual ticket form submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTicketId.trim()) return;
    handleCheckInRequest(manualTicketId.trim());
  };

  const handleResetScan = () => {
    setResultState(null);
    setManualTicketId('');
  };

  // Switch to manual mode if camera is denied
  const handleCameraError = useCallback(() => {
    setActiveTab('manual');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      {/* Top Header */}
      <header className="px-4 py-4 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/zkorg/dashboard" className="p-2 hover:bg-gray-800 rounded-lg text-gray-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Image src={Logo} alt="Zicket" height={26} className="h-6 w-auto" />
            <span className="text-xs font-semibold px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 rounded-full">
              Check-In Portal
            </span>
          </div>
        </div>

        {/* Organizer Auth Status */}
        <div>
          {publicKey ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 rounded-full text-xs font-mono text-emerald-400 border border-emerald-900/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{publicKey.slice(0, 4)}...{publicKey.slice(-4)}</span>
            </div>
          ) : (
            <button
              onClick={() => connect('freighter')}
              disabled={isConnecting}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Organizer'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Connectivity Alert Banner */}
      {isOffline && (
        <div className="bg-amber-900/90 text-amber-200 border-b border-amber-800 px-4 py-2 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Offline mode active. Check-ins will be queued and synced upon reconnection.</span>
          </div>
          {offlineQueue.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-950 rounded-full text-[11px] font-bold text-amber-300">
              {offlineQueue.length} queued
            </span>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col justify-start space-y-6">
        {/* Unauthenticated Organizer Guard */}
        {!publicKey && (
          <div className="p-4 bg-purple-950/40 border border-purple-800/50 rounded-2xl flex items-start gap-3 text-purple-200 text-xs">
            <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-purple-100 block mb-0.5">Organizer Authorization Required</span>
              Connect your organizer wallet to perform on-chain ticket check-ins and state verification for this event.
            </div>
          </div>
        )}

        {/* Mode Selector (Scanner vs Manual) */}
        {!resultState && (
          <div className="grid grid-cols-2 gap-2 bg-gray-800/80 p-1 rounded-xl border border-gray-700/60">
            <button
              onClick={() => setActiveTab('scan')}
              type="button"
              className={`py-2.5 px-4 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-all ${
                activeTab === 'scan'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Camera Scanner</span>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              type="button"
              className={`py-2.5 px-4 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-all ${
                activeTab === 'manual'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Manual Entry</span>
            </button>
          </div>
        )}

        {/* --- RESULT VIEW (GREEN SUCCESS OR RED FAILURE) --- */}
        {resultState ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {resultState.success ? (
              /* SUCCESS STATE — GREEN CARD */
              <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-2xl border-4 border-emerald-400 text-center flex flex-col items-center space-y-4">
                <div className="p-3 bg-white/20 rounded-full animate-bounce">
                  <CheckCircle2 className="w-16 h-16 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white uppercase">
                    Check-in Successful
                  </h2>
                  <p className="text-emerald-100 font-semibold text-base mt-1">
                    Valid Ticket
                  </p>
                </div>

                {/* Ticket Details */}
                <div className="w-full bg-emerald-700/60 rounded-2xl p-4 text-left space-y-2 border border-emerald-500/40 text-xs font-mono">
                  <div className="flex justify-between items-center border-b border-emerald-600 pb-2">
                    <span className="text-emerald-200 font-sans">Ticket ID</span>
                    <span className="font-bold text-white text-sm">{resultState.ticket?.id ?? 'Verified'}</span>
                  </div>
                  {resultState.event && (
                    <div className="flex justify-between items-center border-b border-emerald-600 pb-2">
                      <span className="text-emerald-200 font-sans">Event</span>
                      <span className="font-medium text-white truncate max-w-[180px]">{resultState.event.title}</span>
                    </div>
                  )}
                  {resultState.ticket?.ticketType && (
                    <div className="flex justify-between items-center border-b border-emerald-600 pb-2">
                      <span className="text-emerald-200 font-sans">Type</span>
                      <span className="font-bold text-emerald-200 px-2 py-0.5 bg-emerald-800 rounded">{resultState.ticket.ticketType}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-200 font-sans">Checked In At</span>
                    <span className="text-white">
                      {resultState.checkedInAt
                        ? new Date(resultState.checkedInAt).toLocaleTimeString()
                        : new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleResetScan}
                  type="button"
                  className="w-full py-4 bg-white text-emerald-800 hover:bg-emerald-50 active:scale-98 font-bold text-base rounded-2xl shadow-lg transition-all"
                >
                  Scan Next Ticket
                </button>
              </div>
            ) : resultState.reason === 'PENDING_OFFLINE' ? (
              /* PENDING OFFLINE STATE — AMBER CARD */
              <div className="bg-amber-600 text-white rounded-3xl p-6 shadow-2xl border-4 border-amber-400 text-center flex flex-col items-center space-y-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <WifiOff className="w-16 h-16 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    Check-in Pending Verification
                  </h2>
                  <p className="text-amber-100 font-medium text-xs mt-1">
                    Queued Offline — Will sync upon reconnection
                  </p>
                </div>
                <button
                  onClick={handleResetScan}
                  type="button"
                  className="w-full py-3 bg-white text-amber-900 hover:bg-amber-50 active:scale-98 font-bold text-sm rounded-2xl shadow-lg transition-all"
                >
                  Scan Next Ticket
                </button>
              </div>
            ) : (
              /* FAILURE STATE — RED CARD */
              <div className="bg-red-600 text-white rounded-3xl p-6 shadow-2xl border-4 border-red-400 text-center flex flex-col items-center space-y-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <XCircle className="w-16 h-16 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white uppercase">
                    Check-in Failed
                  </h2>
                  <p className="text-red-100 font-semibold text-sm mt-1">
                    {resultState.error || 'Invalid or consumed ticket'}
                  </p>
                </div>

                {/* Additional context if ticket exists */}
                {resultState.ticket && (
                  <div className="w-full bg-red-700/60 rounded-2xl p-3 text-left text-xs font-mono border border-red-500/40 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-red-200 font-sans">Ticket ID:</span>
                      <span className="font-bold text-white">{resultState.ticket.id}</span>
                    </div>
                    {resultState.ticket.checkedInAt && (
                      <div className="flex justify-between">
                        <span className="text-red-200 font-sans">Used At:</span>
                        <span className="text-white">
                          {new Date(resultState.ticket.checkedInAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="w-full flex gap-3">
                  <button
                    onClick={handleResetScan}
                    type="button"
                    className="flex-1 py-3.5 bg-white text-red-800 hover:bg-red-50 active:scale-98 font-bold text-sm rounded-2xl shadow-lg transition-all"
                  >
                    Scan Next Ticket
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* --- SCANNER / MANUAL INPUT VIEW --- */
          <div className="space-y-6">
            {activeTab === 'scan' ? (
              <div className="bg-gray-800/90 p-4 rounded-3xl border border-gray-700 shadow-xl flex flex-col items-center">
                <QRCodeScanner
                  onScan={handleQrScan}
                  onCameraError={handleCameraError}
                  isProcessing={isProcessing}
                />
              </div>
            ) : (
              /* Manual Ticket ID Entry Form */
              <form onSubmit={handleManualSubmit} className="bg-gray-800/90 p-6 rounded-3xl border border-gray-700 shadow-xl space-y-5">
                <div>
                  <label htmlFor="ticketId" className="block text-xs font-semibold text-gray-300 mb-2">
                    Enter Ticket ID
                  </label>
                  <div className="relative">
                    <Tag className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      id="ticketId"
                      type="text"
                      value={manualTicketId}
                      onChange={(e) => setManualTicketId(e.target.value)}
                      placeholder="e.g. tkt-crypto-build-live"
                      className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !manualTicketId.trim()}
                  className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Check In Ticket</span>
                  )}
                </button>
              </form>
            )}

            {/* Quick Demo Help & Preset Ticket Actions */}
            <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-800 text-xs text-gray-400 space-y-2">
              <span className="font-semibold text-gray-300 block">Demo Quick Test Buttons:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleCheckInRequest('tkt-crypto-build-live')}
                  className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-purple-300 rounded-md font-mono text-[11px] transition-colors"
                >
                  Valid Ticket (tkt-crypto-build-live)
                </button>
                <button
                  type="button"
                  onClick={() => handleCheckInRequest('tkt-nairobi-used')}
                  className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-red-300 rounded-md font-mono text-[11px] transition-colors"
                >
                  Used Ticket (tkt-nairobi-used)
                </button>
                <button
                  type="button"
                  onClick={() => handleCheckInRequest('tkt-invalid-000')}
                  className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-amber-300 rounded-md font-mono text-[11px] transition-colors"
                >
                  Invalid Ticket (tkt-invalid-000)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
