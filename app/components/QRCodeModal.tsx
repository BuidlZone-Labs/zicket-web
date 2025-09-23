'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogOverlay
} from '@/components/ui/dialog'
import { X, Tag } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  accessCode: string
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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogOverlay className="fixed inset-0 z-50 bg-white/40 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent
        className="fixed left-[50%] top-[50%] z-50 gap-0 w-full bg-white max-w-[90vw] md:max-w-[480px] md:mx-4 translate-x-[-50%] translate-y-[-50%] rounded-2xl shadow-lg p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200 border-0 sm:mx-0 font-work-sans"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-gray-900">Scan Code</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none cursor-pointer"
          >
            <X className="h-5 w-5" color="#6917AF" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <QRCodeSVG
              value={accessCode}
              size={256}
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
