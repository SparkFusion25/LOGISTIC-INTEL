'use client'
import { useState } from 'react'
import WidgetCard from '@/components/WidgetCard'
import Button from '@/components/Button'

export default function BenchmarkWidget() {
  const [form, setForm] = useState({ origin_country: '', destination_country: '', hs_code: '', mode: 'all' })
  const [res, setRes] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const update = (k: keyof typeof form) => (e: any) => setForm({ ...form, [k]: e.target.value })

  const run = async () => {
    if (!form.origin_country || !form.destination_country) {
      setRes({ error: 'Please enter origin and destination countries.' })
      return
    }
    setLoading(true)
    try {
      const r = await fetch('/api/widgets/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      setRes(await r.json())
    } finally {
      setLoading(false)
    }
  }

  return (
    <WidgetCard title="Market Benchmark" action={<Button onClick={run} disabled={loading}>{loading ? 'Running…' : 'Analyze'}</Button>}>
      <div className="grid grid-cols-2 gap-3">
        <input className="input" placeholder="Origin Country" value={form.origin_country} onChange={update('origin_country')} />
        <input className="input" placeholder="Destination Country" value={form.destination_country} onChange={update('destination_country')} />
        <input className="input" placeholder="HS Code (optional)" value={form.hs_code} onChange={update('hs_code')} />
        <select className="input" value={form.mode} onChange={update('mode')}>
          <option value="all">All</option>
          <option value="air">Air</option>
          <option value="ocean">Ocean</option>
        </select>
      </div>
      <p className="text-xs text-slate-500 mt-1">Estimates based on recent shipments matching the lane and filters.</p>

      {res?.success && (
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-600">Avg shipment value:</span><span className="font-semibold">${res.summary?.avgValue?.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">Avg shipment weight:</span><span className="font-semibold">{res.summary?.avgWeight}</span></div>
          <div className="text-slate-600">Top carriers:</div>
          <ul className="list-disc ml-6">
            {res.topCarriers?.map((c: any) => <li key={c.carrier}>{c.carrier} — {c.count}</li>)}
          </ul>
        </div>
      )}

      {res?.error && <div className="text-rose-600 text-sm mt-2">{res.error}</div>}
    </WidgetCard>
  )
}
