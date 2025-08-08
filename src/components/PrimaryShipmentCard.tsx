'use client'
import React from 'react'

export default function PrimaryShipmentCard({ shipment }: { shipment: any }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-sm text-gray-500">Company</div>
      <div className="font-semibold">{shipment.unified_company_name}</div>
      <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
        <div><span className="font-medium">Mode:</span> {shipment.mode}</div>
        <div><span className="font-medium">Progress:</span> {shipment.progress}%</div>
        <div><span className="font-medium">HS:</span> {shipment.hs_code || '—'}</div>
        <div><span className="font-medium">Arrival:</span> {shipment.unified_date || '—'}</div>
      </div>
    </div>
  )
}
