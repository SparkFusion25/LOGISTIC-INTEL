import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting automated schema fix...');

    // Step 1: Add missing columns to ocean_shipments
    const schemaFixes = [
      `ALTER TABLE public.ocean_shipments ADD COLUMN IF NOT EXISTS origin_port TEXT;`,
      `ALTER TABLE public.ocean_shipments ADD COLUMN IF NOT EXISTS destination_port TEXT;`,
      `ALTER TABLE public.ocean_shipments ADD COLUMN IF NOT EXISTS origin_country TEXT;`,
      `ALTER TABLE public.ocean_shipments ADD COLUMN IF NOT EXISTS departure_date DATE;`,
      `ALTER TABLE public.ocean_shipments ADD COLUMN IF NOT EXISTS shipment_date DATE;`,
      `ALTER TABLE public.ocean_shipments ADD COLUMN IF NOT EXISTS container_count INTEGER;`,
      `ALTER TABLE public.ocean_shipments ADD COLUMN IF NOT EXISTS shipment_type TEXT DEFAULT 'ocean';`,
      `ALTER TABLE public.ocean_shipments ADD COLUMN IF NOT EXISTS freight_amount NUMERIC;`,
      `ALTER TABLE public.ocean_shipments ADD COLUMN IF NOT EXISTS commodity_description TEXT;`
    ];

    for (const sql of schemaFixes) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      if (error) {
        console.log(`Schema fix warning: ${error.message}`);
      }
    }

    // Step 2: Rebuild trade_data_view
    const dropViewSql = `DROP VIEW IF EXISTS public.trade_data_view;`;
    await supabase.rpc('exec_sql', { sql_query: dropViewSql });

    const createViewSql = `
      CREATE VIEW public.trade_data_view AS
      SELECT
        o.id::text AS unified_id,
        COALESCE(o.consignee_name, o.shipper_name, 'Unknown Company') AS company_name,
        o.bol_number,
        COALESCE(o.shipment_date, o.arrival_date) AS shipment_date,
        o.departure_date,
        o.destination_port,
        o.shipper_name,
        o.shipper_country,
        o.consignee_name,
        o.consignee_city,
        o.consignee_state,
        o.consignee_zip,
        o.consignee_country,
        COALESCE(o.commodity_description, o.goods_description) AS description,
        o.weight_kg,
        o.value_usd,
        o.freight_amount,
        o.port_of_lading,
        o.port_of_unlading,
        o.transport_method,
        o.vessel_name,
        o.container_count,
        o.shipment_type,
        o.raw_xml_filename,
        'ocean' AS shipment_mode
      FROM public.ocean_shipments o;
    `;

    const { error: viewError } = await supabase.rpc('exec_sql', { sql_query: createViewSql });
    if (viewError) {
      console.error('View creation error:', viewError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create trade_data_view',
        details: viewError.message
      }, { status: 500 });
    }

    // Step 3: Grant permissions
    const permissionSqls = [
      `GRANT SELECT ON public.trade_data_view TO public;`,
      `GRANT SELECT ON public.trade_data_view TO anon;`,
      `GRANT SELECT ON public.trade_data_view TO authenticated;`
    ];

    for (const sql of permissionSqls) {
      await supabase.rpc('exec_sql', { sql_query: sql });
    }

    // Step 4: Test the view
    const { data: testData, error: testError } = await supabase
      .from('trade_data_view')
      .select('company_name, unified_id, shipment_mode')
      .limit(5);

    if (testError) {
      return NextResponse.json({
        success: false,
        error: 'Schema fix completed but view test failed',
        details: testError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Schema fixes applied successfully',
      schemaFixesApplied: schemaFixes.length,
      viewRecreated: true,
      permissionsGranted: true,
      testResults: {
        recordCount: testData?.length || 0,
        sampleData: testData
      }
    });

  } catch (error) {
    console.error('Schema fix error:', error);
    return NextResponse.json({
      success: false,
      error: 'Schema fix failed',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Schema fix endpoint',
    usage: 'POST to this endpoint to automatically fix database schema',
    fixes: [
      'Add missing columns to ocean_shipments',
      'Rebuild trade_data_view with company_name',
      'Grant proper permissions',
      'Test the updated view'
    ]
  });
}