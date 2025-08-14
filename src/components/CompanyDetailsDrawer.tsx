'use client'
import { useEffect, useState } from 'react'
import PlanGate from '@/components/PlanGate'
import TrendMini from '@/components/TrendMini'

export default function CompanyDetailsDrawer({
  id, onClose
}: { id: string | null; onClose: () => void }) {
  const [summary, setSummary] = useState<any>(null)
  const [trends, setTrends] = useState<number[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const sumRes = await fetch(`/api/companies/${id}/summary`).then(r => r.json()).catch(() => null)
      if (sumRes?.summary) setSummary(sumRes.summary)
      if (!sumRes?.summary && sumRes && typeof sumRes === 'object') setSummary(sumRes)

      // Placeholder trend points for now
      setTrends([10,12,14,11,16,18,17,19,21,18,20,22])

      const cRes = await fetch(`/api/companies/${id}/contacts`).then(r => r.json()).catch(() => null)
      if (cRes) { setContacts(cRes.data || []); setUnlocked(!!cRes.unlocked) }
    })()
  }, [id])

  if (!id) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={onClose}>
      <div className="bg-white w-full max-w-xl h-full p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Company Details</h2>
          <button onClick={onClose} className="text-slate-500">✕</button>
        </div>

        {summary && (
          <div className="grid grid-cols-3 gap-3 mb-6 text-sm">
            <div><div className="text-slate-400">Total Shipments</div>{summary.total_shipments}</div>
            <div><div className="text-slate-400">Avg Value</div>${summary.avg_value?.toLocaleString()}</div>
            <div><div className="text-slate-400">Avg Weight</div>{summary.avg_weight}</div>
          </div>
        )}

        <div className="mb-6">
          <div className="text-slate-400 text-sm mb-1">12‑Month Trend</div>
          <TrendMini data={trends} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Contacts</h3>
          <PlanGate canView={unlocked}>
            <ul className="space-y-2">
              {contacts.map((c, i) => (
                <li key={i} className="p-3 border rounded">
                  <div className="font-medium">{c.full_name} — {c.title}</div>
                  <div className="text-sm text-slate-600">
                    {c.email ? c.email : 'Email hidden'} · {c.phone ? c.phone : 'Phone hidden'} · {c.linkedin || '—'}
                  </div>
                </li>
              ))}
            </ul>
          </PlanGate>
        </div>
      </div>
    </div>
  )
}