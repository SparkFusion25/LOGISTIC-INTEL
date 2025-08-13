'use client'
import { useState } from 'react'
import Button from '@/components/Button'

type Query = {
  company?: string
  origin_country?: string
  destination_country?: string
  hs_code?: string
  mode?: 'all' | 'air' | 'ocean'
}

export default function SearchPanel() {
  const [q, setQ] = useState<Query>({ mode: 'all' })
  const [loading, setLoading] = useState(false)

  const update = (k: keyof Query) => (e: any) => setQ(prev => ({ ...prev, [k]: e.target.value }))

  const submit = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(Object.entries(q).filter(([, v]) => v) as any)
      const res = await fetch(`/api/search/unified?${params.toString()}`)
      const json = await res.json()
      document.getElementById('search-results')
        ?.dispatchEvent(new CustomEvent('search:results', { detail: json }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-3">
      <input className="input" placeholder="Company name" value={q.company || ''} onChange={update('company')} />
      <input className="input" placeholder="Origin Country" value={q.origin_country || ''} onChange={update('origin_country')} />
      <input className="input" placeholder="Destination Country" value={q.destination_country || ''} onChange={update('destination_country')} />
      <input className="input" placeholder="HS Code (e.g., 8471…)" value={q.hs_code || ''} onChange={update('hs_code')} />
      <select className="input" value={q.mode} onChange={update('mode')}>
        <option value="all">All Modes</option>
        <option value="air">Air</option>
        <option value="ocean">Ocean</option>
      </select>
      <Button onClick={submit} className="w-full">{loading ? 'Searching…' : 'Search Companies'}</Button>
    </div>
  )
}
