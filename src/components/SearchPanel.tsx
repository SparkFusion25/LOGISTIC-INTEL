'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Search } from 'lucide-react'

import InteractiveShipmentMap from '@/components/InteractiveShipmentMap'
import PrimaryShipmentCard from '@/components/PrimaryShipmentCard'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { searchTradeData } from '@/lib/api'

type Plan = 'trial' | 'starter' | 'pro' | 'enterprise'

export interface Shipment {
  company?: string
  origin: { city?: string; country?: string }
  destination: { city?: string; country?: string }
  type?: 'ocean' | 'air'
  progress?: number
  contactEmail?: string
}

export default function SearchPanel() {
  const supabase = createClientComponentClient()
  const [userPlan, setUserPlan] = useState<Plan>('trial')
  const [company, setCompany] = useState('')
  const [mode, setMode] = useState<'all'|'ocean'|'air'>('all')
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [selected, setSelected] = useState<Shipment | null>(null)

  useEffect(() => {
    async function loadPlan() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.rpc('get_user_plan', { uid: user.id })
      if (data) setUserPlan((data as string).toLowerCase() as Plan)
    }
    loadPlan()
  }, [])

  const fetchPage = async (reset = false) => {
    if (loading) return
    setLoading(true)
    const next = reset ? 0 : page
    const size = 100
    const params: any = { company, mode, limit: size, offset: next * size }
    const data = await searchTradeData(params)
    setShipments(reset ? data : [...shipments, ...data])
    setHasMore(Array.isArray(data) && data.length === size)
    setPage(next + 1)
    setLoading(false)
  }

  useEffect(() => { setPage(0); fetchPage(true) }, [company, mode])

  const columns = useMemo(() => [
    { header: 'Company', accessorFn: (r: Shipment) => r.company || '' },
    { header: 'Route', accessorFn: (r: Shipment) => `${r.origin.city||''}, ${r.origin.country||''} → ${r.destination.city||''}, ${r.destination.country||''}` },
    { header: 'Mode', accessorFn: (r: Shipment) => r.type || '' },
    { header: 'Transit %', accessorFn: (r: Shipment) => `${r.progress ?? 0}%` },
    { header: 'Contact', cell: ({ row }: { row: Shipment }) => {
        const email = row.contactEmail
        const ok = ['pro','enterprise'].includes(userPlan)
        return ok && email ? (
          <button className="text-accent hover:underline text-sm font-medium" onClick={() => addToCRM(row)}>{email}</button>
        ) : <span className="text-gray-400 italic text-xs">Premium</span>
      }
    },
  ], [userPlan])

  const addToCRM = async (r: Shipment) => {
    await fetch('/api/crm/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_name: r.company, source: 'Trade Search' })
    })
  }

  return (
    <div className="px-8 py-6 max-w-screen-wider mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow px-6 py-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" value={company}
            onChange={e=>setCompany(e.target.value)}
            placeholder="Search company..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-accent focus:ring-accent/50"
          />
        </div>
        <div className="flex space-x-2">
          {(['all','ocean','air'] as const).map(m => (
            <button key={m} onClick={()=>setMode(m)}
              className={`px-4 py-2 rounded-lg font-medium ${mode===m ? 'bg-primary-600 text-white' : 'bg-surface text-onSurface hover:bg-primary-50'}`}
            >
              {m==='all'?'All Modes':m==='ocean'?'Ocean':'Air'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 space-y-4">
          <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
            <InteractiveShipmentMap
              shipments={shipments}
              filterType={mode}
              searchQuery={company}
              onSelect={setSelected}
              isLoading={loading}
            />
          </div>
          {selected && <PrimaryShipmentCard shipment={selected} />}
        </div>
        <div className="lg:w-1/3 h-[600px] rounded-lg border border-gray-200 overflow-hidden bg-white">
          <ResponsiveTable
            columns={columns as any}
            data={shipments}
            fetchMore={hasMore ? ()=>fetchPage(false) : undefined}
            loading={loading}
            rowHeight={60}
          />
        </div>
      </div>
    </div>
  )
}