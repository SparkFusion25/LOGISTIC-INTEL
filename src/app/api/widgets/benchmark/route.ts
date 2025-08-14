import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

type CarrierCount = { carrier: string; count: number }

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { product, tradeLane, origin_country, destination_country, hs_code, mode } = body ?? {}

    if (!product && !tradeLane && !origin_country && !destination_country) {
      return NextResponse.json({ success: false, error: 'Missing inputs' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    // Build query
    let q = supabase
      .from('unified_shipments')
      .select('unified_carrier, unified_value, unified_weight, origin_country, destination_country, hs_code, mode')

    if (origin_country) q = q.eq('origin_country', origin_country)
    if (destination_country) q = q.eq('destination_country', destination_country)
    if (hs_code) q = q.ilike('hs_code', `%${hs_code}%`)
    if (product) q = q.ilike('hs_code', `%${product}%`)
    if (mode && mode !== 'all') q = q.eq('mode', mode)

    const { data, error } = await q.limit(5000)

    if (error) {
      // @ts-expect-error supabase error code
      if (error.code === '42P01') {
        return NextResponse.json({ 
          success: true, 
          summary: { avgValue: 0, avgWeight: 0 }, 
          topCarriers: [] 
        })
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const rows = Array.isArray(data) ? data : []

    // Top carriers (typed)
    const topCarriers: CarrierCount[] = Object.entries(
      rows.reduce<Record<string, number>>((m, r) => {
        const key = (r.unified_carrier as string | null) ?? 'Unknown'
        m[key] = (m[key] ?? 0) + 1
        return m
      }, {})
    )
      .map(([carrier, count]) => ({ carrier, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Example aggregates (avg value/weight)
    const values = rows
      .map(r => Number(r.unified_value ?? 0))
      .filter(n => Number.isFinite(n) && n >= 0)
    const weights = rows
      .map(r => Number(r.unified_weight ?? 0))
      .filter(n => Number.isFinite(n) && n >= 0)

    const avgValue = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0
    const avgWeight = weights.length ? Math.round(weights.reduce((a, b) => a + b, 0) / weights.length) : 0

    return NextResponse.json({
      success: true,
      summary: { avgValue, avgWeight },
      topCarriers
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
