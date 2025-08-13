'use client'
import { useEffect, useState } from 'react'
import CompanyCard from '@/components/CompanyCard'
import ResponsiveGrid from '@/components/ResponsiveGrid'

type APIResponse = { success: boolean; data: any[]; total?: number }
export default function SearchResultsMount() {
  const [rows, setRows] = useState<any[]>([])
  const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    const handler = (e: any) => {
      const payload: APIResponse = e.detail
      setRows(payload?.data || [])
      setTotal(payload?.total || 0)
    }
    const mount = document.getElementById('search-results')
    mount?.addEventListener('search:results' as any, handler as any)
    return () => mount?.removeEventListener('search:results' as any, handler as any)
  }, [])

  if (!rows.length) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Search Results ({total || rows.length})</h3>
      </div>
      <ResponsiveGrid>
        {rows.map((r, i) => <CompanyCard key={i} item={r} />)}
      </ResponsiveGrid>
    </div>
  )
}