import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const s = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const lower = (v: unknown) => s(v).toLowerCase();

function normStr(v: any): string | null {
  return v == null ? null : String(v);
}
function normalizeRow(r: any) {
  return {
    id: String(r.id ?? r.unified_id ?? crypto.randomUUID()),
    unified_id: String(r.unified_id ?? r.id ?? ''),
    mode: normStr(r.mode) ?? normStr(r.shipment_mode) ?? normStr(r.shipment_type) ?? normStr(r.transport_mode),
    shipment_type: normStr(r.shipment_type),
    transport_mode: normStr(r.transport_mode),
    unified_company_name: normStr(r.unified_company_name) ?? normStr(r.company_name) ?? 'Unknown',
    unified_destination: normStr(r.unified_destination) ?? normStr(r.destination_city) ?? normStr(r.destination_country),
    unified_value: Number(r.unified_value ?? r.value_usd ?? 0),
    unified_weight: Number(r.unified_weight ?? r.gross_weight_kg ?? 0),
    unified_date: normStr(r.unified_date) ?? normStr(r.arrival_date) ?? null,
    unified_carrier: normStr(r.unified_carrier) ?? normStr(r.vessel_name) ?? normStr(r.carrier) ?? null,
    hs_code: normStr(r.hs_code),
    bol_number: normStr(r.bol_number),
    vessel_name: normStr(r.vessel_name),
    shipper_name: normStr(r.shipper_name),
    origin_country: normStr(r.origin_country),
    destination_country: normStr(r.destination_country),
    destination_city: normStr(r.destination_city),
    port_of_loading: normStr(r.port_of_loading ?? r.port_of_lading),
    port_of_discharge: normStr(r.port_of_discharge),
    container_count: r.container_count ?? null,
    gross_weight_kg: r.gross_weight_kg ?? null,
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const mode = lower(url.searchParams.get('mode') || 'all');
    const company = s(url.searchParams.get('company') || url.searchParams.get('companyName') || '');
    const hs = s(url.searchParams.get('hs_code') || url.searchParams.get('hsCode') || '');
    const destCity = s(url.searchParams.get('destination_city') || '');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0);

    const sb = supabaseAdmin;
    console.log('admin has from?', typeof sb.from === 'function');
    console.log('Received mode:', mode, 'company:', company);

    // Use trade_data_view for now (adjust to your actual schema)
    let q = sb.from('trade_data_view').select('*', { count: 'exact' }).range(offset, offset + limit - 1);

    // Filter by mode if specified
    if (mode === 'air') {
      q = q.eq('shipment_type', 'air');
    } else if (mode === 'ocean') {
      q = q.eq('shipment_type', 'ocean');
    }

    if (company) q = q.ilike('company_name', `%${company}%`);
    if (hs) q = q.ilike('hs_code', `%${hs}%`);
    if (destCity) q = q.ilike('destination_city', `%${destCity}%`);

    const { data, error, count } = await q;

    if (error) {
      console.error('[unified] supabase error', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const rows = Array.isArray(data) ? data.map(normalizeRow) : [];
    return NextResponse.json({
      success: true,
      data: rows,
      total: count ?? rows.length,
      pagination: { hasMore: (offset + rows.length) < (count ?? 0) }
    });
  } catch (e: any) {
    console.error('[unified] fatal', e);
    return NextResponse.json({ success: false, error: e?.message ?? 'Unknown error' }, { status: 500 });
  }
}