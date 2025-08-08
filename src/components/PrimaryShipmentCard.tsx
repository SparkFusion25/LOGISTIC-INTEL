"use client"

import React from 'react'

interface Shipment {
  company?: string
  origin: { city?: string; country?: string }
  destination: { city?: string; country?: string }
  type?: string
  progress?: number
}

export default function PrimaryShipmentCard({ shipment }: { shipment: Shipment }) {
  if (!shipment) return null
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="text-sm text-gray-500">Primary Shipment</div>
      <div className="text-lg font-semibold text-gray-900">{shipment.company || 'Company'}</div>
      <div className="text-sm text-gray-700 mt-1">
        {shipment.origin.city || ''}, {shipment.origin.country || ''} → {shipment.destination.city || ''}, {shipment.destination.country || ''}
      </div>
      <div className="mt-2 text-xs text-gray-500">Mode: {shipment.type || 'N/A'} • Transit: {shipment.progress ?? 0}%</div>
    </div>
  )
}