'use client'
import { useEffect, useState } from 'react'
import PlanGate from '@/components/PlanGate'
import TrendMini from '@/components/TrendMini'
import Button from '@/components/Button'

export default function CompanyDetailsDrawer({
  id, onClose
}: { id: string | null; onClose: () => void }) {
  const [summary, setSummary] = useState<any>(null)
  const [trends, setTrends] = useState<number[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [canViewContacts, setCanViewContacts] = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const sumRes = await fetch(`/api/companies/${id}/summary`).then(r => r.json())
      setSummary(sumRes)
      const trendRes = await fetch(`/api/companies/${id}/trends`).then(r => r.json())
      setTrends(trendRes.data || [])
      const contactRes = await fetch(`/api/companies/${id}/contacts`).then(r => r.json())
      setContacts(contactRes.data || [])
    })()
  }, [id])

  if (!id) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-xl h-full p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Company Details</h2>
          <button onClick={onClose} className="text-slate-500">✕</button>
        </div>

        {summary && (
          <div className="grid grid-cols-3 gap-3 mb-6 text-sm">
            <div>
              <div className="text-slate-400">Total Shipments</div>
              {summary.total_shipments}
            </div>
            <div>
              <div className="text-slate-400">Avg Value</div>
              ${summary.avg_value?.toLocaleString()}
            </div>
            <div>
              <div className="text-slate-400">Avg Weight</div>
              {summary.avg_weight}
            </div>
          </div>
        )}

        {trends.length > 0 && (
          <div className="mb-6">
            <div className="text-slate-400 text-sm mb-1">12-Month Trend</div>
            <TrendMini data={trends} />
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-2">Contacts</h3>
          <PlanGate canView={canViewContacts}>
            <ul className="space-y-2">
              {contacts.map((c, i) => (
                <li key={i} className="p-3 border rounded">{c.name} – {c.email}</li>
              ))}
            </ul>
          </PlanGate>
          {!canViewContacts && (
            <Button variant="secondary" className="mt-3" onClick={() => setCanViewContacts(true)}>
              Add to CRM to Unlock
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}