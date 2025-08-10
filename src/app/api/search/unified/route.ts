// src/app/api/search/unified/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type Row = Record<string, any>;

function mapToUnified(row: Row) {
  return {
    id: row.unified_id ?? row.id ?? crypto.randomUUID(),

    // Names
    unified_company_name:
      row.unified_company_name ??
      row.company_name ??
      row.consignee_name ??
      row.shipper_name ??
      'Unknown Company',

    // Route / places
    unified_destination:
      row.unified_destination ??
      row.destination ??
      row.port_of_discharge ??
      row.final_destination ??
      null,

    // Numbers
    unified_value:
      row.unified_value ??
      row.total_value ??
      row.value ??
      null,

    unified_weight:
      row.unified_weight ??
      row.gross_weight_kg ??
      row.weight_kg ??
      row.weight ??
      null,

    // Dates — coalesce to unified_date
    unified_date:
      row.unified_date ??
      row.shipment_date ??
      row.departure_date ??
      row.arrival_date ??
      null,

    // Carrier & HS
    unified_carrier:
      row.unified_carrier ??
      row.carrier ??
      row.vessel_name ??
      row.airline ??
      null,

    hs_code: row.hs_code ?? row.hscode ?? row.hs ?? null,

    // Mode
    mode: (row.mode ?? row.transport_mode ?? row.ship_mode ?? 'ocean') as 'ocean' | 'air',

    // Optional odds & ends
    progress: typeof row.progress === 'number' ? row.progress : 0,
    company_id: row.company_id ?? row.unified_company_id ?? null,

    bol_number: row.bol_number ?? null,
    vessel_name: row.vessel_name ?? null,
    shipper_name: row.shipper_name ?? null,
    port_of_loading: row.port_of_loading ?? null,
    port_of_discharge: row.port_of_discharge ?? null,
    gross_weight_kg: row.gross_weight_kg ?? null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const company = (url.searchParams.get('company') ?? '').trim();
    const mode = (url.searchParams.get('mode') ?? 'all').trim();
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 100), 500);
    const offset = Math.max(Number(url.searchParams.get('offset') ?? 0), 0);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only key
    );

    // If your unified view/table has a different name, adjust here:
    let q = supabase
      .from('trade_data_view')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (company) {
      q = q.ilike('company_name', `%${company}%`);
    }
    if (mode !== 'all') {
      q = q.eq('mode', mode); // 'ocean' | 'air'
    }

    const { data, error, count } = await q;
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const mapped = (data ?? []).map(mapToUnified);

    return NextResponse.json({
      success: true,
      data: mapped,
      pagination: {
        total: count ?? mapped.length,
        limit,
        offset,
        hasMore: count ? offset + limit < count : mapped.length === limit,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message ?? 'unknown error' },
      { status: 500 }
    );
  }
}