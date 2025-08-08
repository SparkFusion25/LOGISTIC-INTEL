'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import InteractiveShipmentMap from '@/components/InteractiveShipmentMap'
import PrimaryShipmentCard from '@/components/PrimaryShipmentCard'
import ResponsiveTable from '@/components/ui/ResponsiveTable'

type Mode = 'all'|'ocean'|'air'
interface ShipmentRow {
  id: string
  unified_company_name: string
  unified_destination?: string | null
  unified_value?: number | null
  unified_weight?: number | null
  unified_date?: string | null
  unified_carrier?: string | null
  hs_code?: string | null
  mode: 'ocean'|'air'
  progress: number
  company_id: string
  bol_number?: string | null
  vessel_name?: string | null
  shipper_name?: string | null
  port_of_loading?: string | null
  port_of_discharge?: string | null
  gross_weight_kg?: number | null
}

export default function SearchPanel() {
  const [company, setCompany] = useState('')
  const [mode, setMode] = useState<Mode>('all')
  const [data, setData] = useState<ShipmentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [selected, setSelected] = useState<ShipmentRow | null>(null)
  const pageSize = 100

  const fetchPage = async (reset=false) => {
    if (loading) return
    setLoading(true)
    const offset = reset ? 0 : page * pageSize
    const qs = new URLSearchParams({
      company, mode, limit: String(pageSize), offset: String(offset)
    })
    const res = await fetch(`/api/search/unified?${qs.toString()}`)
    const json = await res.json()
    if (!json.success) {
      setLoading(false)
      setData(reset ? [] : data)
      setHasMore(false)
      return
    }
    setData(reset ? json.data : [...data, ...json.data])
    setHasMore(json.pagination?.hasMore || false)
    setPage(reset ? 1 : page + 1)
    setLoading(false)
  }

  useEffect(() => { fetchPage(true) }, [company, mode])

  const columns = useMemo(() => [
    { header: 'Company', accessorKey: 'unified_company_name' },
    { header: 'Route', accessorFn: (r: ShipmentRow) => `${r.unified_destination || '—'}` },
    { header: 'Mode', accessorKey: 'mode' },
    { header: 'Progress', accessorFn: (r: ShipmentRow) => `${r.progress || 0}%` },
  ], [])

  return (
    <div className="px-8 py-6 max-w-screen-wider mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow px-6 py-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={company}
            onChange={e=>setCompany(e.target.value)}
            placeholder="Search company..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-accent focus:ring-accent/50"
          />
        </div>
        <div className="flex gap-2">
          {(['all','ocean','air'] as Mode[]).map(m=>(
            <button key={m}
              onClick={()=>setMode(m)}
              className={`px-4 py-2 rounded-lg font-medium ${
                mode===m ? 'bg-primary-600 text-white' : 'bg-surface text-onSurface hover:bg-primary-50'
              }`}>
              {m==='all' ? 'All Modes' : m==='ocean' ? 'Ocean' : 'Air'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 space-y-4">
          <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
            <InteractiveShipmentMap
              shipments={data}
              filterType={mode}
              searchQuery={company}
              onSelect={setSelected}
              isLoading={loading}
            />
          </div>
          {selected && <PrimaryShipmentCard shipment={selected} />}
        </div>

        <div className="lg:w-1/3 h-[600px] rounded-lg border border-gray-200 overflow-hidden">
          <ResponsiveTable
            columns={columns}
            data={data}
            fetchMore={hasMore ? () => fetchPage(false) : undefined}
            loading={loading}
            rowHeight={60}
            onRowClick={(row: ShipmentRow) => setSelected(row)}
          />
        </div>
      </div>
    </div>
  )
}
