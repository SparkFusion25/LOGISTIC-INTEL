import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Supabase connection...');

    // Test with the user's provided ANON key
    const anonClient = createClient(
      'https://zupuxlrtixhfnbuhxhum.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MzkyMTYsImV4cCI6MjA3MDAxNTIxNn0.cuKMT_qhg8uOjFImnbQreg09K-TnVqV_NE_E5ngsQw0'
    );

    // Test with the service role key we've been using
    const serviceClient = createClient(
      'https://zupuxlrtixhfnbuhxhum.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQzOTIxNiwiZXhwIjoyMDcwMDE1MjE2fQ.F-dshtyWdNBMeQjFBdvEOdmgZnz3X8W_ZH1X5qdVGcU'
    );

    const results = [];

    // Test 1: List existing tables with ANON key
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
      results.push({
        test: 'ANON key - List tables',
        success: false,
        error: (error as Error).message
      });
    }

    // Test 2: List existing tables with SERVICE ROLE key
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
      results.push({
        test: 'SERVICE ROLE key - List tables',
        success: false,
        error: (error as Error).message
      });
    }

    // Test 3: Try to query a specific table if it exists
    try {
      const { data: censusTables, error: censusError } = await serviceClient
        .from('census_trade_data')
        .select('count')
        .limit(1);
      
      results.push({
        test: 'Query census_trade_data table',
        success: !censusError,
        error: censusError?.message,
        data_found: censusTables?.length || 0
      });
    } catch (error) {
      results.push({
        test: 'Query census_trade_data table',
        success: false,
        error: (error as Error).message
      });
    }

    // Test 4: Check if we can create a simple table
    try {
      const { error: createError } = await serviceClient.rpc('exec_sql', {
        sql: 'CREATE TABLE IF NOT EXISTS test_connection (id SERIAL PRIMARY KEY, created_at TIMESTAMP DEFAULT NOW());'
      });
      
      results.push({
        test: 'Create test table (RPC function)',
        success: !createError,
        error: createError?.message
      });
    } catch (error) {
      results.push({
        test: 'Create test table (RPC function)',
        success: false,
        error: (error as Error).message
      });
    }

    const successfulTests = results.filter(r => r.success).length;
    const totalTests = results.length;

    return NextResponse.json({
      success: successfulTests > 0,
      message: `Supabase connection test completed: ${successfulTests}/${totalTests} tests successful`,
      supabase_url: 'https://zupuxlrtixhfnbuhxhum.supabase.co',
      user_provided_anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...cuKMT_qhg8uOjFImnbQreg09K-TnVqV_NE_E5ngsQw0',
      service_role_key_available: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      test_results: results,
      recommendation: successfulTests === 0 
        ? "No successful connections. Please verify your Supabase keys and permissions."
        : successfulTests < totalTests
        ? "Partial connection success. Some operations may require service role permissions."
        : "Full connection success. Database operations should work normally."
    });

  } catch (error) {
    console.error('💥 Supabase connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      supabase_url: 'https://zupuxlrtixhfnbuhxhum.supabase.co'
    }, { status: 500 });
  }
}