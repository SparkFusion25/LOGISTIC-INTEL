import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const s = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const lower = (v: unknown) => s(v).toLowerCase();

function normStr(v: any): string | null {
  return v == null ? null : String(v);
}

function normalizeRow(r: any) {
  const shipment = Array.isArray(r.shipments) ? r.shipments[0] : r.shipments || {};
  return {
    id: String(r.id ?? crypto.randomUUID()),
    unified_id: String(r.id ?? ''),
    mode: normStr(shipment.transport_mode),
    shipment_type: normStr(shipment.transport_mode),
    transport_mode: normStr(shipment.transport_mode),
    unified_company_name: normStr(r.company_name) ?? 'Unknown',
    unified_destination: normStr(shipment.destination_country),
    unified_value: 0, // We don't have value in our shipments yet
    unified_weight: Number(shipment.gross_weight_kg ?? 0),
    unified_date: normStr(shipment.arrival_date),
    unified_carrier: normStr(shipment.vessel_name ?? shipment.airline),
    hs_code: normStr(shipment.hs_code),
    bol_number: normStr(shipment.bol_number),
    vessel_name: normStr(shipment.vessel_name),
    shipper_name: normStr(shipment.shipper_name),
    origin_country: normStr(shipment.origin_country),
    destination_country: normStr(shipment.destination_country),
    destination_city: normStr(shipment.destination_country), // We don't have city, using country
    port_of_loading: normStr(shipment.port_of_loading),
    port_of_discharge: normStr(shipment.port_of_discharge),
    container_count: null,
    gross_weight_kg: shipment.gross_weight_kg ?? null,
    // Add company info
    company_name: normStr(r.company_name),
    country: normStr(r.country),
    website: normStr(r.website),
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

    // Query the actual seeded tables with JOIN
    let q = sb.from('companies')
      .select(`
        id,
        company_name,
        country,
        website,
        shipments!inner(
          id,
          bol_number,
          hs_code,
          product_description,
          origin_country,
          destination_country,
          arrival_date,
          gross_weight_kg,
          transport_mode,
          vessel_name,
          airline,
          shipper_name,
          port_of_loading,
          port_of_discharge
        )
      `, { count: 'exact' })
      .range(offset, offset + limit - 1);

    // Filter by mode if specified
    if (mode === 'air') {
      q = q.eq('shipments.transport_mode', 'air');
    } else if (mode === 'ocean') {
      q = q.eq('shipments.transport_mode', 'ocean');
    }

    if (company) q = q.ilike('company_name', `%${company}%`);
    if (hs) q = q.eq('shipments.hs_code', hs);
    if (destCity) q = q.ilike('shipments.destination_country', `%${destCity}%`);

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
