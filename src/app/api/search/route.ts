// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

type Mode = 'all' | 'air' | 'ocean'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const company = (searchParams.get('company') || '').trim()
    const city = (searchParams.get('city') || '').trim()
    const hs = (searchParams.get('hs') || '').trim()
    const commodity = (searchParams.get('commodity') || '').trim()
    const mode = ((searchParams.get('mode') || 'all').trim() as Mode)
    const limit = Math.min(Number(searchParams.get('limit') || 50), 200)
    const offset = Math.max(Number(searchParams.get('offset') || 0), 0)

    const supabase = createRouteHandlerClient({ cookies })

    // NOTE: No `progress` in select. We’ll derive a value later.
    let q = supabase
      .from('shipments')
      .select(`
        id,
        company_id,
        bol_number,
        arrival_date,
        origin_country,
        destination_country,
        hs_code,
        product_description,
        gross_weight_kg,
        transport_mode,
        companies:company_id (
          id,
          company_name,
          city,
          country
        )
      `, { count: 'exact' })
      .order('arrival_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (mode !== 'all') q = q.eq('transport_mode', mode)
    if (company) q = q.ilike('companies.company_name', `%${company}%`)
    if (city) q = q.ilike('companies.city', `%${city}%`)
    if (hs) q = q.ilike('hs_code', `%${hs}%`)
    if (commodity) q = q.ilike('product_description', `%${commodity}%`)

    const { data, error, count } = await q
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })

    // Derive a progress percentage (no DB column needed)
    const records = (data ?? []).map((r: any) => {
      const score =
        (r.hs_code ? 1 : 0) +
        (r.gross_weight_kg ? 1 : 0) +
        (r.arrival_date ? 1 : 0)
      const progress = Math.round((score / 3) * 100)

      return {
        id: r.id,
        company_id: r.company_id,
        unified_company_name: r.companies?.company_name ?? 'Unknown',
        unified_destination: r.destination_country ?? null,
        unified_value: null,
        unified_weight: r.gross_weight_kg ?? null,
        unified_date: r.arrival_date ?? null,
        unified_carrier: r.vessel_name || r.airline || null, // ok if absent
        hs_code: r.hs_code ?? null,
        mode: r.transport_mode as 'air' | 'ocean',
        progress,
        bol_number: r.bol_number ?? null,
        vessel_name: r.vessel_name ?? null,
        shipper_name: r.shipper_name ?? null,
        port_of_loading: r.port_of_loading ?? null,
        port_of_discharge: r.port_of_discharge ?? null,
        gross_weight_kg: r.gross_weight_kg ?? null
      }
    })

    return NextResponse.json({
      success: true,
      data: records,
      total: count ?? 0,
      pagination: { hasMore: (offset + limit) < (count ?? 0) }
    })
  } catch (err: any) {
    console.error('Search API GET error:', err)
    return NextResponse.json({ success: false, error: 'Failed to get search data' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // Optional: support POST with same query params in body
  const body = await req.json().catch(() => ({}))
  const url = new URL(req.url)
  Object.entries(body || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
  })
  return GET(new NextRequest(url.toString()))
}
