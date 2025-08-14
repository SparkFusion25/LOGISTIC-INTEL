import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const db = supabaseServer()
  const company = decodeURIComponent(params.id)

  const start = new Date()
  start.setMonth(start.getMonth() - 11)
  const startISO = start.toISOString().slice(0, 10)

  const { data, error } = await db
    .from('unified_shipments')
    .select('unified_date')
    .ilike('unified_company_name', company)
    .gte('unified_date', startISO)
    .order('unified_date', { ascending: true })

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  const months: string[] = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(start)
    d.setMonth(start.getMonth() + i)
    return d.toISOString().slice(0, 7)
  })

  const countsByMonth: Record<string, number> = {}
  for (const r of data || []) {
    const m = (r as any).unified_date?.slice(0, 7)
    if (m) countsByMonth[m] = (countsByMonth[m] || 0) + 1
  }

  const trend = months.map(m => countsByMonth[m] || 0)
  return NextResponse.json({ success: true, data: trend })
}