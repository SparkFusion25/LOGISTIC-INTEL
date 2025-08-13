import React from 'react'
import Button from '@/components/Button'
import ConfidenceIndicator from '@/components/ui/ConfidenceIndicator'

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
  const weight = item.unified_weight || null
  const last = item.unified_date?.slice(0, 10) || '—'
  const badge = (item.mode || 'ALL').toUpperCase()
  const conf = item.confidence ?? 72

  return (
    <div className="card p-4">
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
        <Button variant="secondary" className="text-[12px] px-3 py-1.5">Add to CRM</Button>
      </div>
    </div>
  )
}