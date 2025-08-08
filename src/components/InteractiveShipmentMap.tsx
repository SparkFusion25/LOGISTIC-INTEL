'use client'
import React, { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

type Mode = 'ocean'|'air'
interface ShipmentRow {
  id: string
  unified_company_name: string
  mode: Mode
  progress: number
}

interface Props {
  shipments: ShipmentRow[]
  filterType: 'all'|'ocean'|'air'
  searchQuery: string
  onSelect?: (row: ShipmentRow)=>void
  isLoading?: boolean
}

export default function InteractiveShipmentMap({ shipments, filterType }: Props) {
  const mapRef = useRef<mapboxgl.Map|null>(null)
  const mountRef = useRef<HTMLDivElement|null>(null)

  useEffect(() => {
    if (mapRef.current || !mountRef.current) return
    mapRef.current = new mapboxgl.Map({
      container: mountRef.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [0, 20],
      zoom: 1.4,
    })
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    // Basic refresh hook (no pins for now; route drawing can be added once we have coords)
  }, [shipments, filterType])

  return <div ref={mountRef} className="w-full h-full" />
}
