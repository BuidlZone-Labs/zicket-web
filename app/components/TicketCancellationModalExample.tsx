'use client'

import React, { useState } from 'react'
import { TicketCancellationModal } from './TicketCancellationModal'
import { Button } from '@/components/ui/button'

/**
 * Example component showing how to use the TicketCancellationModal
 * This can be used as a reference or removed after integration
 */
export function TicketCancellationModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [ticketState, setTicketState] = useState({
    isConfirmed: true,
    isPaid: true
  })

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleConfirmCancellation = (
    ticketId: string,
    userId: string,
    updatedState: { isConfirmed: boolean, isPaid: boolean }
  ) => {
    // Update the local state to reflect the cancellation
    setTicketState(updatedState)
    console.log('Updated ticket state:', updatedState)
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <h3 className="text-lg font-semibold mb-2">Ticket Status</h3>
        <p className="text-sm text-gray-600 mb-1">
          Confirmed: <span className={ticketState.isConfirmed ? 'text-green-600' : 'text-red-600'}>
            {ticketState.isConfirmed ? 'Yes' : 'No'}
          </span>
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Paid: <span className={ticketState.isPaid ? 'text-green-600' : 'text-red-600'}>
            {ticketState.isPaid ? 'Yes' : 'No'}
          </span>
        </p>

        <Button
          onClick={handleOpenModal}
          variant="destructive"
          className="w-full"
          disabled={!ticketState.isConfirmed && !ticketState.isPaid}
        >
          Cancel Registration
        </Button>
      </div>

      <TicketCancellationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        ticketId="ticket-123"
        userId="user-456"
        isConfirmed={ticketState.isConfirmed}
        isPaid={ticketState.isPaid}
        onConfirm={handleConfirmCancellation}
      />
    </div>
  )
}
