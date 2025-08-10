import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const company = (searchParams.get('company') || '').trim()
  const mode = (searchParams.get('mode') || 'all').trim() as 'all'|'ocean'|'air'
  const limit = Math.min(Number(searchParams.get('limit') || 100), 200)
  const offset = Math.max(Number(searchParams.get('offset') || 0), 0)

  const supabase = createRouteHandlerClient({ cookies })

  // Base query from shipments; RLS will enforce ownership and plan
  let q = supabase.from('shipments')
    .select(`
      id, company_id, bol_number, arrival_date,
      origin_country, destination_country, hs_code, product_description,
      gross_weight_kg, transport_mode, progress,
      companies:company_id ( id, company_name, owner_user_id )
    `, { count: 'exact' })
    .order('arrival_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (company) {
    // join filter via related companies.company_name (ilike)
    q = q.ilike('companies.company_name', `%${company}%`)
  }

  if (mode && mode !== 'all') {
    q = q.eq('transport_mode', mode)
  }

  const { data, error, count } = await q
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })

  // Map to UI shape (some fields are optional on FE)
  const records = (data || []).map((r: any) => ({
    id: r.id,
    unified_company_name: r.companies?.company_name || 'Unknown',
    unified_destination: r.destination_country || null,
    unified_value: null,
    unified_weight: r.gross_weight_kg || null,
    unified_date: r.arrival_date || null, // FIXED: removed departure_date reference
    unified_carrier: r.vessel_name || r.airline || null,
    hs_code: r.hs_code || null,
    mode: r.transport_mode,
    progress: r.progress || 0,
    company_id: r.company_id,
    bol_number: r.bol_number || null,
    vessel_name: r.vessel_name || null,
    shipper_name: r.shipper_name || null,
    port_of_loading: r.port_of_loading || null,
    port_of_discharge: r.port_of_discharge || null,
    gross_weight_kg: r.gross_weight_kg || null,
  }))

  return NextResponse.json({
    success: true,
    data: records,
    total: count || 0,
    pagination: { hasMore: (offset + limit) < (count || 0) }
  })
}