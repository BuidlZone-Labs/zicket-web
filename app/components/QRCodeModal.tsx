'use client'

import React, { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog'
import { X, Tag } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  accessCode: string // This should ideally be JUST the ticket ID/Hash now
}

export function QRCodeModal({
  isOpen,
  onClose,
  accessCode
}: QRCodeModalProps) {

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  // --- NEW SECURITY LOGIC ---
  const securePayload = useMemo(() => {
    // 1. Create a validation hint (e.g., expiry set to 24 hours from generation)
    // For production, you might pass a specific expiry date as a prop instead.
    const expiryTimestamp = Date.now() + (24 * 60 * 60 * 1000);

    // 2. Build the lightweight payload object
    const payloadData = {
      id: accessCode, // Assuming accessCode is the safe ticket ID or Hash
      expMs: expiryTimestamp // Expiry in milliseconds since Unix epoch
    };

    // 3. Base64 encode the JSON so it acts as an opaque, offline-readable token
    return btoa(JSON.stringify(payloadData));
  }, [accessCode, isOpen]);
  // --------------------------

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="fixed left-[50%] top-[50%] z-50 gap-0 w-full bg-white max-w-[90vw] md:max-w-[480px] md:mx-4 translate-x-[-50%] translate-y-[-50%] rounded-2xl shadow-lg p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200 border-0 sm:mx-0 font-work-sans"
        showCloseButton={false}
        overlayClassName="bg-white/40 backdrop-blur-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-lg font-medium text-gray-900">Scan Code</DialogTitle>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none cursor-pointer"
            aria-label="Close QR code modal"
          >
            <X className="h-5 w-5" color="#6917AF" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <DialogDescription className="sr-only">
          Scan this QR code or use the access code to verify this ticket.
        </DialogDescription>

        {/* QR Code */}
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <QRCodeSVG
              value={securePayload} // Changed from accessCode to securePayload
              size={256}
              level="M" // Added Medium error correction for better scannability
              className="block"
            />
          </div>

          {/* Access Code */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 w-full justify-center">
            <Tag className="w-4 h-4 text-gray-600" />
            <span className="font-inter text-gray-700">
              Access Code: {accessCode}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
