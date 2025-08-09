import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Supabase connection...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;

    // Test with anon key
    const anonClient = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );

    // Test with the service role key
    const serviceClient = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    const results = [] as Array<Record<string, any>>;

    try {
      const { data: anonTables, error: anonError } = await anonClient
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(10);
      results.push({
        test: 'ANON key - List tables',
        success: !anonError,
        error: anonError?.message,
        tables_found: anonTables?.length || 0,
        tables: anonTables?.map(t => t.table_name) || []
      });
    } catch (error) {
      results.push({ test: 'ANON key - List tables', success: false, error: (error as Error).message });
    }

    try {
      const { data: serviceTables, error: serviceError } = await serviceClient
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(10);
      results.push({
        test: 'SERVICE ROLE key - List tables',
        success: !serviceError,
        error: serviceError?.message,
        tables_found: serviceTables?.length || 0,
        tables: serviceTables?.map(t => t.table_name) || []
      });
    } catch (error) {
      results.push({ test: 'SERVICE ROLE key - List tables', success: false, error: (error as Error).message });
    }

    try {
      const { data: censusTables, error: censusError } = await serviceClient
        .from('census_trade_data')
        .select('count')
        .limit(1);
      results.push({ test: 'Query census_trade_data table', success: !censusError, error: censusError?.message, data_found: censusTables?.length || 0 });
    } catch (error) {
      results.push({ test: 'Query census_trade_data table', success: false, error: (error as Error).message });
    }

    let successfulTests = results.filter(r => r.success).length;
    const totalTests = results.length;

    return NextResponse.json({
      success: successfulTests > 0,
      message: `Supabase connection test completed: ${successfulTests}/${totalTests} tests successful`,
      supabase_url: supabaseUrl,
      service_role_key_available: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      test_results: results,
    });

  } catch (error) {
    console.error('💥 Supabase connection test failed:', error);
    return NextResponse.json({ success: false, error: 'Connection test failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}