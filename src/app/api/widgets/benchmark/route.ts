import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const db = supabaseServer()
  const { origin_country, destination_country, hs_code, mode = 'all' } = await req.json().catch(() => ({}))

  if (!origin_country || !destination_country) {
    return NextResponse.json({ success: false, error: 'origin_country and destination_country are required' }, { status: 400 })
  }

  let q = db.from('unified_shipments')
    .select('unified_value, unified_weight, unified_carrier, mode, origin_country, destination_country')
    .ilike('origin_country', origin_country)
    .ilike('destination_country', destination_country)

  if (hs_code) q = q.ilike('hs_code', `${hs_code}%`)
  if (mode !== 'all') q = q.eq('mode', mode)

  const { data, error } = await q.limit(1000)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  const mean = (a: number[]) => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0
  const values = (data || []).map((d: any) => Number(d.unified_value) || 0).filter(Boolean)
  const weights = (data || []).map((d: any) => Number(d.unified_weight) || 0).filter(Boolean)

  const carriers = Object.entries((data || []).reduce((m: any, d: any) => {
    const key = d.unified_carrier || 'Unknown'
    m[key] = (m[key] || 0) + 1
    return m
  }, {} as Record<string, number>))
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([carrier, count]) => ({ carrier, count }))

  return NextResponse.json({
    success: true,
    estimate: {
      avg_value: mean(values),
      avg_weight: mean(weights),
      top_carriers: carriers
    }
  })
}