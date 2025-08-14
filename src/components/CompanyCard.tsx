'use client'
import { useState } from 'react'
import Button from '@/components/Button'
import ConfidenceIndicator from '@/components/ui/ConfidenceIndicator'
import CompanyDetailsDrawer from '@/components/CompanyDetailsDrawer'

type Item = {
  unified_company_name?: string | null
  commodity_description?: string | null
  unified_value?: number | null
  unified_weight?: number | null
  unified_date?: string | null
  mode?: string | null
  confidence?: number | null
}

export default function CompanyCard({ item }: { item: Item }) {
  const name = item.unified_company_name || '—'
  const commodity = item.commodity_description || '—'
  const val = item.unified_value || 0
  const weight = item.unified_weight ?? null
  const last = item.unified_date?.slice(0, 10) || '—'
  const badge = (item.mode || 'ALL').toUpperCase()
  const conf = item.confidence ?? 72

  const [open, setOpen] = useState(false)
  const [contactsUnlocked, setContactsUnlocked] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [trendPoints, setTrendPoints] = useState<number[]>([])

  const fetchDetails = async () => {
    try {
      const id = encodeURIComponent(name)
      const s = await fetch(`/api/companies/${id}/summary`).then(r => r.json())
      setSummary(s?.summary || null)
      setTrendPoints([10,12,14,11,16,18,17,19,21,18,20,22])
      setOpen(true)
    } catch {
      setOpen(true)
    }
  }

  const addToCRM = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await fetch('/api/crm/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_name: name })
    }).then(r => r.json())
    setContactsUnlocked(true)
    if (!open) fetchDetails()
  }

  return (
    <>
      <div className="card p-4 cursor-pointer" onClick={fetchDetails}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold">{name}</h3>
            <p className="text-[12px] text-brand-muted mt-0.5">{commodity}</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-[11px] px-2 py-0.5">
            {badge}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3 text-[12px] text-slate-600">
          <div><div className="text-slate-400">Value</div>${val.toLocaleString()}</div>
          <div><div className="text-slate-400">Weight</div>{weight ?? '—'}</div>
          <div><div className="text-slate-400">Last Ship</div>{last}</div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <ConfidenceIndicator score={conf} sources={[]} apolloVerified={false} showTooltip={false} />
          <Button variant="secondary" className="text-[12px] px-3 py-1.5" onClick={addToCRM}>
            Add to CRM
          </Button>
        </div>
      </div>

      {open && (
        <CompanyDetailsDrawer
          id={encodeURIComponent(name)}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}