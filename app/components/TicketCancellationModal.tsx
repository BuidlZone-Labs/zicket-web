'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogOverlay
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Ticket } from 'lucide-react'

interface TicketCancellationModalProps {
  isOpen: boolean
  onClose: () => void
  ticketId: string
  userId: string
  isConfirmed: boolean
  isPaid: boolean
  onConfirm: (ticketId: string, userId: string, updatedState: { isConfirmed: boolean, isPaid: boolean }) => void
}

export function TicketCancellationModal({
  isOpen,
  onClose,
  ticketId,
  userId,
  isConfirmed,
  isPaid,
  onConfirm
}: TicketCancellationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleDiscard = () => {
    onClose()
  }

  const handleConfirm = async () => {
    setIsProcessing(true)

    try {
      // Console log the data as requested
      console.log('Cancelling ticket:', {
        ticketId,
        userId,
        previousState: { isConfirmed, isPaid },
        newState: { isConfirmed: false, isPaid: false }
      })

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Call the parent handler to update state
      onConfirm(ticketId, userId, { isConfirmed: false, isPaid: false })

      // Show success message
      setShowSuccess(true)

      // Auto-close after 2 seconds
      setTimeout(() => {
        setShowSuccess(false)
        setIsProcessing(false)
        onClose()
      }, 2000)

    } catch (error) {
      console.error('Error cancelling ticket:', error)
      setIsProcessing(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !isProcessing) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogOverlay className="fixed inset-0 z-50 bg-white/40 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent
        className="fixed left-[50%] top-[50%] z-50 gap-0 w-full bg-white max-w-[90vw] md:max-w-[375px] md:mx-4 translate-x-[-50%] translate-y-[-50%]  rounded-2xl shadow-lg p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200 border-0 sm:mx-0 font-work-sans"
        showCloseButton={false}
      >
        {!showSuccess ? (
          <>
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 -rotate-45 text-gray-600" />
                <span className="text-lg font-medium text-gray-900 ">Ticket</span>
              </div>
              <button
                onClick={handleDiscard}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none cursor-pointer"
                disabled={isProcessing}
              >
                <X className="h-5 w-5" color="#6917AF" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            {/* Modal content */}
            <div className="mb-4">
              <p className="text-gray-700 text-base font-semibold leading-relaxed">
                Are you sure you want to cancel your registration. We'll let the host know that you can't make it.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleDiscard}
                disabled={isProcessing}
                className="flex-1 bg-primary hover:bg-[#5a1496] text-white font-semibold p-6 rounded-full transition-colors duration-200 cursor-pointer"
              >
                Discard
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isProcessing}
                variant="outline"
                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold p-6 rounded-full transition-colors duration-200 cursor-pointer"
              >
                {isProcessing ? 'Processing...' : 'Yes'}
              </Button>
            </div>
          </>
        ) : (
          /* Success message */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Registration Cancelled</h3>
            <p className="text-gray-600">The host has been notified of your cancellation.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
