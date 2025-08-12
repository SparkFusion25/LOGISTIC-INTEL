// app/api/search/route.ts
import { NextResponse } from 'next/server'

// If your client lives elsewhere, update this import block (same approach as unified route).
let supabase: any
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  supabase = require('@/lib/supabase-admin')?.supabase || require('@/lib/supabase-admin')
} catch {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    supabase = require('@/lib/supabase-server')?.supabase || require('@/lib/supabase-server')
  } catch {
    supabase = null
  }
}

export const dynamic = 'force-dynamic'

function normStr(v: any): string | null {
  return v == null ? null : String(v)
}

function normalizeRow(r: any) {
  if (!r || typeof r !== 'object') return r
  return {
    ...r,
    // Normalize mode-like fields to string | null
    shipment_mode:  normStr((r as any).shipment_mode),
    mode:           normStr((r as any).mode),
    shipment_type:  normStr((r as any).shipment_type),
    transport_mode: normStr((r as any).transport_mode),

    // Frequently-rendered strings
    id:                    normStr((r as any).id),
    unified_company_name:  normStr((r as any).unified_company_name),
    unified_destination:   normStr((r as any).unified_destination),
    unified_date:          normStr((r as any).unified_date),
    unified_carrier:       normStr((r as any).unified_carrier),
    hs_code:               normStr((r as any).hs_code),

    // Numerics preserved
    unified_value:  (r as any).unified_value ?? null,
    unified_weight: (r as any).unified_weight ?? null,
  }
}

// Simple/legacy search by company (and optional mode). Returns shape used by the lightweight SearchPanel.
async function runBasicQuery(params: URLSearchParams) {
  if (!supabase) return { rows: [], total: 0 }

  const TABLE = 'unified_shipments' // adjust if your legacy endpoint queries a different table/view

  const company = params.get('company') || params.get('q') || ''
  const mode = (params.get('mode') || 'all').toLowerCase()
  const limit = Math.max(1, Math.min(500, Number(params.get('limit') || 100)))
  const offset = Math.max(0, Number(params.get('offset') || 0))

  let query = supabase
    .from(TABLE)
    .select('*', { count: 'estimated' })
    .order('unified_date', { ascending: false })

  if (company) query = query.ilike('unified_company_name', `%${company}%`)
  if (mode && mode !== 'all') {
    query = query.or(
      `mode.eq.${mode},shipment_type.eq.${mode},transport_mode.eq.${mode},shipment_mode.eq.${mode}`
    )
  }

  query = query.range(offset, offset + limit - 1)
  const { data, error, count } = await query
  if (error) return { rows: [], total: 0, error }

  return { rows: Array.isArray(data) ? data : [], total: typeof count === 'number' ? count : (data?.length || 0) }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const p = url.searchParams

    const { rows, total, error } = await runBasicQuery(p)
    if (error) console.error('[api/search] supabase error:', error)

    const items = rows.map(normalizeRow)

    // Some callers expect { success, data, total, pagination }, others expect { items, count }.
    // We’ll return the richer shape and include a lightweight alias for backward compatibility.
    const limit = Math.max(1, Math.min(500, Number(p.get('limit') || 100)))
    const offset = Math.max(0, Number(p.get('offset') || 0))
    const hasMore = offset + limit < total

    return NextResponse.json(
      {
        success: true,
        data: items,
        total,
        pagination: { hasMore },

        // legacy alias for older consumers:
        items,
        count: total,
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('[api/search] error:', err)
    return NextResponse.json(
      { success: false, error: String(err?.message || err) },
      { status: 500 }
    )
  }
}
