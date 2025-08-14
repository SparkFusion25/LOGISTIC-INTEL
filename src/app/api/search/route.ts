// ...existing code...
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function normStr(v: any): string | null {
  return v == null ? null : String(v);
}

function normalizeRow(r: any) {
  if (!r || typeof r !== 'object') return r;
  return {
    ...r,
    shipment_mode:  normStr(r.shipment_mode),
    mode:           normStr(r.mode),
    shipment_type:  normStr(r.shipment_type),
    transport_mode: normStr(r.transport_mode),
    id:                    normStr(r.id),
    unified_company_name:  normStr(r.unified_company_name),
    unified_destination:   normStr(r.unified_destination),
    unified_date:          normStr(r.unified_date),
    unified_carrier:       normStr(r.unified_carrier),
    hs_code:               normStr(r.hs_code),
    unified_value:  r.unified_value ?? null,
    unified_weight: r.unified_weight ?? null,
  };
}

async function runBasicQuery(params: URLSearchParams, db: any) {
  const TABLE = 'unified_shipments';
  const company = params.get('company') || params.get('q') || '';
  const mode = (params.get('mode') || 'all').toLowerCase();
  const limit = Math.max(1, Math.min(500, Number(params.get('limit') || 100)));
  const offset = Math.max(0, Number(params.get('offset') || 0));

  let query = db
    .from(TABLE)
    .select('*', { count: 'estimated' })
    .order('unified_date', { ascending: false });

  if (company) query = query.ilike('unified_company_name', `%${company}%`);
  if (mode && mode !== 'all') {
    query = query.or(
      `mode.eq.${mode},shipment_type.eq.${mode},transport_mode.eq.${mode},shipment_mode.eq.${mode}`
    );
  }

  query = query.range(offset, offset + limit - 1);
  const { data, error, count } = await query;
  if (error) return { rows: [], total: 0, error };

  return { rows: Array.isArray(data) ? data : [], total: typeof count === 'number' ? count : (data?.length || 0) };
}

export async function GET(req: Request) {
  try {
    const db = supabaseServer();
    const url = new URL(req.url);
    const p = url.searchParams;

    const { rows, total, error } = await runBasicQuery(p, db);
    if (error) console.error('[api/search] supabase error:', error);

    const items = rows.map(normalizeRow);

    const limit = Math.max(1, Math.min(500, Number(p.get('limit') || 100)));
    const offset = Math.max(0, Number(p.get('offset') || 0));
    const hasMore = offset + limit < total;

    return NextResponse.json(
      {
        success: true,
        data: items,
        total,
        pagination: { hasMore },
        items,
        count: total,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[api/search] error:', err);
    return NextResponse.json(
      { success: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
// ...existing code...
