"use client"

import React from 'react'

interface ShipmentPoint {
  origin: { city?: string; country?: string }
  destination: { city?: string; country?: string }
  type?: string
}

interface Props {
  shipments: ShipmentPoint[]
  filterType: 'all'|'ocean'|'air'
  searchQuery: string
  onSelect?: (s: any)=>void
  isLoading?: boolean
}

export default function InteractiveShipmentMap({ shipments, filterType, searchQuery, onSelect, isLoading }: Props) {
  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="p-2 border-b text-xs text-gray-600">{isLoading ? 'Loading…' : `${shipments.length} results`} • Filter: {filterType} • Query: {searchQuery || '—'}</div>
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {shipments.map((s, i) => (
          <button key={i} className="w-full text-left p-2 rounded border hover:bg-gray-50" onClick={()=>onSelect?.(s)}>
            <div className="text-sm font-medium">{s.origin.city || ''}, {s.origin.country || ''} → {s.destination.city || ''}, {s.destination.country || ''}</div>
            <div className="text-xs text-gray-500">{s.type?.toUpperCase() || 'N/A'}</div>
          </button>
        ))}
        {shipments.length === 0 && !isLoading && (
          <div className="text-xs text-gray-500">No data</div>
        )}
      </div>
    </div>
  )
}