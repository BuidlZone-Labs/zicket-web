'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';

interface QRCodeScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
  onCameraError?: (error: string) => void;
  isProcessing?: boolean;
}

export function QRCodeScanner({
  onScan,
  onError,
  onCameraError,
  isProcessing = false,
}: QRCodeScannerProps) {
  const scannerContainerId = 'qr-reader-region';
  const html5QrcodeRef = useRef<unknown>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraErrorState, setCameraErrorState] = useState<string | null>(null);

  const lastScannedTextRef = useRef<string | null>(null);
  const lastScanTimestampRef = useRef<number>(0);

  const startScanner = useCallback(async () => {
    try {
      setCameraErrorState(null);

      // Check if navigator.mediaDevices exists (browser environment check)
      if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        const msg = 'Camera access is not supported by your browser.';
        setCameraErrorState(msg);
        onCameraError?.(msg);
        return;
      }

      // Dynamically import Html5Qrcode to ensure SSR compatibility
      const { Html5Qrcode } = await import('html5-qrcode');

      if (html5QrcodeRef.current) {
        try {
          const activeScanner = html5QrcodeRef.current as InstanceType<typeof Html5Qrcode>;
          if (activeScanner.isScanning) {
            await activeScanner.stop();
          }
        } catch {
          // Ignore clean-up errors on restart
        }
      }

      const html5Qrcode = new Html5Qrcode(scannerContainerId);
      html5QrcodeRef.current = html5Qrcode;

      const qrCodeSuccessCallback = (decodedText: string) => {
        const now = Date.now();
        // Prevent duplicate triggers for identical text within 2.5 seconds or while processing
        if (
          isProcessing ||
          (lastScannedTextRef.current === decodedText && now - lastScanTimestampRef.current < 2500)
        ) {
          return;
        }

        lastScannedTextRef.current = decodedText;
        lastScanTimestampRef.current = now;
        onScan(decodedText);
      };

      const qrCodeErrorCallback = (errorMessage: string) => {
        onError?.(errorMessage);
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      // Try facingMode: environment first (back camera on mobile)
      try {
        await html5Qrcode.start(
          { facingMode: 'environment' },
          config,
          qrCodeSuccessCallback,
          qrCodeErrorCallback
        );
        setIsScanning(true);
      } catch (err) {
        // Fallback to user facing camera or any available camera
        try {
          await html5Qrcode.start(
            { facingMode: 'user' },
            config,
            qrCodeSuccessCallback,
            qrCodeErrorCallback
          );
          setIsScanning(true);
        } catch (innerErr) {
          const errorMsg =
            err instanceof Error ? err.message : innerErr instanceof Error ? innerErr.message : 'Camera access denied or unavailable.';
          setCameraErrorState(errorMsg);
          setIsScanning(false);
          onCameraError?.(errorMsg);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to initialize QR scanner.';
      setCameraErrorState(msg);
      setIsScanning(false);
      onCameraError?.(msg);
    }
  }, [isProcessing, onScan, onError, onCameraError]);

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      startScanner();
    }

    return () => {
      isMounted = false;
      if (html5QrcodeRef.current) {
        const scanner = html5QrcodeRef.current as { isScanning?: boolean; stop: () => Promise<void>; clear: () => void };
        if (scanner.isScanning) {
          scanner
            .stop()
            .then(() => scanner.clear())
            .catch(() => {});
        } else {
          try {
            scanner.clear();
          } catch {}
        }
        html5QrcodeRef.current = null;
      }
    };
  }, [startScanner]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="relative w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden bg-gray-900 border-2 border-purple-500/30 shadow-inner flex flex-col items-center justify-center">
        {/* HTML5 QR Scanner DOM container */}
        <div id={scannerContainerId} className="w-full h-full object-cover" />

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center z-20 space-y-3 p-4 text-center">
            <RefreshCw className="w-10 h-10 text-purple-400 animate-spin" />
            <p className="text-white font-medium text-base">Verifying ticket...</p>
          </div>
        )}

        {/* Camera Permission / Error Overlay */}
        {cameraErrorState && !isProcessing && (
          <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center z-20 p-6 text-center text-white space-y-4">
            <div className="p-3 bg-red-500/20 rounded-full text-red-400">
              <CameraOff className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-red-200">Camera Unavailable</h3>
              <p className="text-xs text-gray-300 mt-1 max-w-[240px]">
                {cameraErrorState}
              </p>
            </div>
            <button
              onClick={() => startScanner()}
              type="button"
              className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Camera Access
            </button>
          </div>
        )}

        {/* Viewfinder Target Graphic overlay when active */}
        {isScanning && !isProcessing && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-56 h-56 border-2 border-purple-400/80 rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-purple-500 rounded-tl" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-purple-500 rounded-tr" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-purple-500 rounded-bl" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-purple-500 rounded-br" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Camera className="w-4 h-4 text-purple-600" />
        <span>Align attendee QR code inside the frame</span>
      </div>
    </div>
  );
}
