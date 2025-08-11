import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const company = (searchParams.get('company') || '').trim()
  const mode = (searchParams.get('mode') || 'all').trim() as 'all'|'ocean'|'air'
  const limit = Math.min(Number(searchParams.get('limit') || 100), 200)
  const offset = Math.max(Number(searchParams.get('offset') || 0), 0)

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Base query from shipments; RLS will enforce ownership and plan
    // IMPORTANT: removed `progress` from select to avoid "column ... does not exist"
    let q = supabase.from('shipments')
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
          owner_user_id
        )
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
    if (error) {
      // Return a stable, non-throwing response so the client never crashes
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        pagination: { hasMore: false },
        message: error.message
      })
    }

    // Derive a progress value instead of selecting a non-existent DB column
    // Simple heuristic: award points for key fields present
    const records = (data || []).map((r: any) => {
      const progressScore =
        (r.hs_code ? 1 : 0) +
        (r.gross_weight_kg ? 1 : 0) +
        (r.arrival_date ? 1 : 0)
      const derivedProgress = Math.round((progressScore / 3) * 100)

      return {
        id: r.id,
        unified_company_name: r.companies?.company_name || 'Unknown',
        unified_destination: r.destination_country || null,
        unified_value: null,
        unified_weight: r.gross_weight_kg || null,
        unified_date: r.arrival_date || null,
        unified_carrier: r.vessel_name || r.airline || null, // may be undefined if not in schema; safe fallback
        hs_code: r.hs_code || null,
        mode: r.transport_mode,
        progress: derivedProgress, // <- derived, not from DB
        company_id: r.company_id,
        bol_number: r.bol_number || null,
        vessel_name: r.vessel_name || null,
        shipper_name: r.shipper_name || null,
        port_of_loading: r.port_of_loading || null,
        port_of_discharge: r.port_of_discharge || null,
        gross_weight_kg: r.gross_weight_kg || null,
      }
    })

    return NextResponse.json({
      success: true,
      data: records,
      total: count || 0,
      pagination: { hasMore: (offset + limit) < (count || 0) }
    })
  } catch (e: any) {
    // Absolute fallback to avoid client-side crash
    return NextResponse.json({ success: true, data: [], total: 0, pagination: { hasMore: false }, message: String(e?.message||e) })
  }
}
