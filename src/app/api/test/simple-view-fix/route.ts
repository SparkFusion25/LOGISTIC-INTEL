export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ success:false, error:'Supabase env missing' }, { status:500 });
    const supabase = createClient(url, key, { auth: { persistSession:false } });

    const { data, error } = await supabase.rpc('exec_sql', { query: `
      DROP VIEW IF EXISTS public.trade_data_view;
      CREATE VIEW public.trade_data_view AS
      SELECT
        o.id::text AS unified_id,
        COALESCE(o.consignee_name, o.shipper_name, 'Unknown Company') AS company_name,
        o.bol_number,
        o.arrival_date AS shipment_date,
        o.shipper_name,
        o.shipper_country,
        o.consignee_name,
        o.consignee_city,
        o.consignee_state,
        o.consignee_zip,
        o.consignee_country,
        o.goods_description AS description,
        o.weight_kg,
        o.value_usd,
        o.port_of_lading,
        o.port_of_unlading,
        o.transport_method,
        o.vessel_name,
        o.raw_xml_filename,
        'ocean' AS shipment_mode,
        'ocean' AS shipment_type
      FROM public.ocean_shipments o;
    ` });

    if (error) {
      const { data: testQuery } = await supabase.from('ocean_shipments').select('id, consignee_name, shipper_name').limit(5);
      return NextResponse.json({ success: false, error: 'Cannot execute SQL directly via RPC', details: error.message, alternative: 'Manual SQL execution required', testQuery, sqlToRun: `DROP VIEW IF EXISTS public.trade_data_view; CREATE VIEW public.trade_data_view AS SELECT o.id::text AS unified_id, COALESCE(o.consignee_name, o.shipper_name, 'Unknown Company') AS company_name, o.bol_number, o.arrival_date AS shipment_date, o.shipper_name, o.shipper_country, o.consignee_name, o.consignee_city, o.consignee_state, o.consignee_zip, o.consignee_country, o.goods_description AS description, o.weight_kg, o.value_usd, o.port_of_lading, o.port_of_unlading, o.transport_method, o.vessel_name, o.raw_xml_filename, 'ocean' AS shipment_mode, 'ocean' AS shipment_type FROM public.ocean_shipments o;` });
    }

    return NextResponse.json({ success: true, message: 'Simple trade_data_view created successfully', data });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'View creation failed', details: (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Simple view fix endpoint', description: 'Creates trade_data_view using only existing columns' });
}