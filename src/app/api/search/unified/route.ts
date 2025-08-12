// app/api/search/unified/route.ts
import { NextResponse } from 'next/server'

// If your service-role client is exported elsewhere, update this path:
//  - '@/lib/supabase-admin' (common)
//  - '@/lib/supabase-server' (sometimes)
//  - '@/lib/supabase'       (fallback)
let supabase: any
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  supabase = require('@/lib/supabase-admin')?.supabase || require('@/lib/supabase-admin')
} catch {
  try {
    // fallback to other common locations
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    supabase = require('@/lib/supabase-server')?.supabase || require('@/lib/supabase-server')
  } catch {
    supabase = null
  }
}

export const dynamic = 'force-dynamic'

type SearchMode = 'all' | 'air' | 'ocean'

function normStr(v: any): string | null {
  return v == null ? null : String(v)
}

function normalizeRow(r: any) {
  if (!r || typeof r !== 'object') return r
  return {
    ...r,
    // Normalize all mode-like fields to string | null
    shipment_mode:  normStr((r as any).shipment_mode),
    mode:           normStr((r as any).mode),
    shipment_type:  normStr((r as any).shipment_type),
    transport_mode: normStr((r as any).transport_mode),

    // Common strings rendered by UI
    id:                    normStr((r as any).id),
    unified_id:            normStr((r as any).unified_id),
    unified_company_name:  normStr((r as any).unified_company_name),
    unified_destination:   normStr((r as any).unified_destination),
    unified_date:          normStr((r as any).unified_date),
    unified_carrier:       normStr((r as any).unified_carrier),
    hs_code:               normStr((r as any).hs_code),

    // These can stay numeric if present, else null
    unified_value: (r as any).unified_value ?? null,
    unified_weight: (r as any).unified_weight ?? null,

    // Other optional shipment fields (keep if present)
    bol_number:      normStr((r as any).bol_number),
    vessel_name:     normStr((r as any).vessel_name),
    shipper_name:    normStr((r as any).shipper_name),
    port_of_loading: normStr((r as any).port_of_loading),
    port_of_discharge: normStr((r as any).port_of_discharge),
    gross_weight_kg: (r as any).gross_weight_kg ?? null,
    container_count: (r as any).container_count ?? null,
  }
}

function summarize(rows: any[]) {
  const total_records = rows.length
  let total_value_usd = 0
  let total_weight_kg = 0
  const companies = new Set<string>()
  const carriers  = new Set<string>()
  const commodities = new Set<string>()
  let air = 0
  let ocean = 0

  for (const r of rows) {
    total_value_usd += Number(r.unified_value || 0)
    total_weight_kg += Number(r.unified_weight || 0)
    if (r.unified_company_name) companies.add(r.unified_company_name)
    if (r.unified_carrier) carriers.add(r.unified_carrier)
    if (r.hs_code) commodities.add(r.hs_code)

    const m = (r.mode || r.shipment_type || r.transport_mode || '').toLowerCase()
    if (m === 'air') air++
    else if (m === 'ocean' || m === 'sea') ocean++
  }

  const average_shipment_value =
    total_records > 0 ? total_value_usd / total_records : 0
  const value_per_kg =
    total_weight_kg > 0 ? total_value_usd / total_weight_kg : 0

  return {
    total_records,
    total_value_usd,
    total_weight_kg,
    average_shipment_value,
    unique_companies: companies.size,
    unique_carriers: carriers.size,
    unique_commodities: commodities.size,
    mode_breakdown: { air, ocean },
    // Optional: keep structure used by UI
    air_shipper_breakdown: {
      likely_air_shippers: air, // placeholder metric; adjust if you have a real signal
      high_confidence: 0,
      medium_confidence: 0,
      low_confidence: 0,
    },
    value_per_kg,
  }
}

function parseBool(v: string | null): boolean | undefined {
  if (v == null) return undefined
  const s = String(v).trim().toLowerCase()
  if (s === 'true' || s === '1' || s === 'yes') return true
  if (s === 'false' || s === '0' || s === 'no') return false
  return undefined
}

// Build a Supabase query with safe filters. We keep it tolerant because table/view names vary by project.
async function runUnifiedQuery(params: URLSearchParams) {
  if (!supabase) return { rows: [], total: 0 }

  // Adjust to your actual table or view name:
  // Common examples:
  //  - 'unified_shipments'
  //  - 'unified_trade'
  //  - 'shipments_unified_view'
  const TABLE = 'unified_shipments'

  // Inputs
  const mode = (params.get('mode') as SearchMode) || 'all'
  const company  = params.get('company') || params.get('companyName') || ''
  const commodity= params.get('commodity') || ''
  const origin_country = params.get('origin_country') || params.get('originCountry') || ''
  const destination_country = params.get('destination_country') || params.get('destinationCountry') || ''
  const destination_city = params.get('destination_city') || ''
  const destination_state = params.get('destination_state') || ''
  const destination_zip = params.get('destination_zip') || ''
  const hs_code = params.get('hs_code') || params.get('hsCode') || ''
  const carrier = params.get('carrier') || ''
  const date_from = params.get('date_from') || ''
  const date_to   = params.get('date_to') || ''
  const min_value = params.get('min_value')
  const max_value = params.get('max_value')
  const air_shipper_only = parseBool(params.get('air_shipper_only'))

  const limit = Math.max(1, Math.min(500, Number(params.get('limit') || 50)))
  const offset = Math.max(0, Number(params.get('offset') || 0))

  // Base query
  let query = supabase
    .from(TABLE)
    .select('*', { count: 'estimated' }) // change to 'exact' if you need precise counts
    .order('unified_date', { ascending: false })

  // Mode filters (accepts different source columns)
  if (mode !== 'all') {
    // try each possible field safely
    query = query.or(
      `mode.eq.${mode},shipment_type.eq.${mode},transport_mode.eq.${mode},shipment_mode.eq.${mode}`
    )
  }

  // Text filters (case-insensitive)
  if (company) query = query.ilike('unified_company_name', `%${company}%`)
  if (commodity) {
    // apply to multiple descriptive columns if they exist
    query = query.or(
      [
        `commodity_description.ilike.%${commodity}%`,
        `description.ilike.%${commodity}%`,
        `hs_description.ilike.%${commodity}%`
      ].join(',')
    )
  }
  if (origin_country) query = query.ilike('origin_country', `%${origin_country}%`)
  if (destination_country) query = query.ilike('destination_country', `%${destination_country}%`)
  if (destination_city) query = query.ilike('destination_city', `%${destination_city}%`)
  if (destination_state) query = query.ilike('destination_state', `%${destination_state}%`)
  if (destination_zip) query = query.ilike('destination_zip', `%${destination_zip}%`)
  if (hs_code) query = query.ilike('hs_code', `${hs_code}%`) // prefix match often useful
  if (carrier) query = query.ilike('unified_carrier', `%${carrier}%`)

  // Date range
  if (date_from) query = query.gte('unified_date', date_from)
  if (date_to)   query = query.lte('unified_date', date_to)

  // Value range
  if (min_value) query = query.gte('unified_value', Number(min_value))
  if (max_value) query = query.lte('unified_value', Number(max_value))

  // Optional: likely air shipper heuristic (if you have a boolean or score)
  if (air_shipper_only) {
    // Adjust the column to your schema (examples: 'is_likely_air_shipper' or 'air_match')
    query = query.eq('is_likely_air_shipper', true)
  }

  // Pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    // Surface as empty to UI; we still respond success=false below
    return { rows: [], total: 0, error }
  }
  return { rows: Array.isArray(data) ? data : [], total: typeof count === 'number' ? count : (data?.length || 0) }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const p = url.searchParams

    const { rows, total, error } = await runUnifiedQuery(p)

    if (error) {
      console.error('[api/search/unified] supabase error:', error)
    }

    const normalized = rows.map(normalizeRow)

    // Build pagination.hasMore
    const limit = Math.max(1, Math.min(500, Number(p.get('limit') || 50)))
    const offset = Math.max(0, Number(p.get('offset') || 0))
    const nextOffset = offset + limit
    const hasMore = nextOffset < total

    const summary = summarize(normalized)

    return NextResponse.json(
      {
        success: true,
        data: normalized,
        total,
        summary,
        pagination: { hasMore }
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('[api/search/unified] error:', err)
    return NextResponse.json(
      { success: false, error: String(err?.message || err) },
      { status: 500 }
    )
  }
}
