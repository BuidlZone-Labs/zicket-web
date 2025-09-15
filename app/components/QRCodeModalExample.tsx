'use client'

import React, { useState } from 'react'
import { QRCodeModal } from './QRCodeModal'
import { Button } from '@/components/ui/button'

/**
 * Example component showing how to use the QRCodeModal
 * This can be used as a reference or removed after integration
 */
export function QRCodeModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [accessCode] = useState('ZKT-7841') // Dummy access code

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <h3 className="text-lg font-semibold mb-2">Ticket Purchased</h3>
        <p className="text-sm text-gray-600 mb-4">
          Your ticket has been confirmed! Click below to view your QR code and access code.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Access Code: <span className="font-mono font-semibold">{accessCode}</span>
        </p>

        <Button
          onClick={handleOpenModal}
          className="w-full bg-[#6917AF] hover:bg-[#5a1496] text-white font-semibold"
        >
          View QR Code
        </Button>
      </div>

      <QRCodeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        accessCode={accessCode}
      />
    </div>
  )
}
