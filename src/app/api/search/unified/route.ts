import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { s, trim } from '@/lib/strings'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const qp = Object.fromEntries(url.searchParams)
  const mode = (qp.mode as string) || 'all'
  const limit = Math.min(parseInt((qp.limit as string) || '20', 10), 100)
  const offset = parseInt((qp.offset as string) || '0', 10)

  const supabase = createServerClient()

  let query = supabase
    .from('unified_shipments')
    .select('*', { count: 'exact' })

  if (mode !== 'all') query = query.eq('mode', mode)
  if (trim(qp.company as string)) query = query.ilike('unified_company_name', `%${qp.company}%`)
  if (trim(qp.origin_country as string)) query = query.ilike('origin_country', `%${qp.origin_country}%`)
  if (trim(qp.destination_country as string)) query = query.ilike('destination_country', `%${qp.destination_country}%`)
  if (trim(qp.hs_code as string)) query = query.ilike('hs_code', `${qp.hs_code}%`)
  if (qp.air_shipper_only === 'true') query = query.eq('is_likely_air_shipper', true)
  if (qp.date_from) query = query.gte('unified_date', qp.date_from as string)
  if (qp.date_to) query = query.lte('unified_date', qp.date_to as string)

  const { data, count, error } = await query
    .order('unified_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  const norm = (v: unknown) => (typeof v === 'string' ? v : v == null ? null : String(v))
  const rows = (data ?? []).map(r => ({
    ...r,
    mode: norm(r.mode),
    shipment_mode: norm(r.shipment_mode),
    transport_mode: norm(r.transport_mode),
    shipment_type: norm(r.shipment_type),
  }))

  return NextResponse.json({
    success: true,
    data: rows,
    total: count ?? 0,
    pagination: { hasMore: (offset + rows.length) < (count ?? 0) }
  })
}
