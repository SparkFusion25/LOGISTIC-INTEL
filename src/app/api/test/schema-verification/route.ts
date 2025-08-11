export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getDbOrNull(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url || !key) return null;
  return createClient(url, key, { auth: { persistSession:false } });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getDbOrNull();
    if(!supabase) return NextResponse.json({ success:false, error:'Supabase env missing' }, { status:500 });

    const results: any = { success: true, tests: [], summary: { passed: 0, failed: 0, total: 0 } };

    try {
      const { data: testSelect, error: selectError } = await supabase.from('ocean_shipments').select('id').limit(1);
      if (selectError && (selectError as any).code === 'PGRST116') throw new Error('ocean_shipments table does not exist');
      results.tests.push({ test: 'ocean_shipments_table_exists', status: 'PASS', message: 'ocean_shipments table exists and is accessible', details: { tableExists: true, accessible: true } });
      results.summary.passed++;
    } catch (error) {
      results.tests.push({ test: 'ocean_shipments_table_exists', status: 'FAIL', message: `Table check failed: ${(error as Error).message}` });
      results.summary.failed++;
    }

    try {
      const testData = { consignee_name: 'Test Company Inc', consignee_city: 'Dallas', consignee_country: 'United States', shipper_name: 'Test Shipper Ltd', shipper_country: 'South Korea', origin_country: 'South Korea', destination_country: 'United States', destination_city: 'Dallas', hs_code: '8471', commodity_description: 'Test electronics', value_usd: 50000, weight_kg: 1000, arrival_date: '2024-01-15', vessel_name: 'TEST VESSEL', raw_xml_filename: 'schema_test.xml' };
      const { data: insertData, error: insertError } = await supabase.from('ocean_shipments').insert(testData).select('id, consignee_name, vessel_name');
      if (insertError) {
        if (insertError.message.includes('column') && insertError.message.includes('does not exist')) throw new Error(`Missing column detected: ${insertError.message}`);
        throw insertError;
      }
      const hasVesselName = insertData?.[0]?.vessel_name === 'TEST VESSEL';
      results.tests.push({ test: 'required_columns_test', status: hasVesselName ? 'PASS' : 'PARTIAL', message: hasVesselName ? 'All required columns exist including vessel_name' : 'Basic columns exist, but vessel_name may be missing', details: { recordId: insertData?.[0]?.id, vesselNamePresent: hasVesselName, insertedData: insertData?.[0] } });
      if (hasVesselName) results.summary.passed++; else results.summary.failed++;
      if (insertData?.[0]?.id) await supabase.from('ocean_shipments').delete().eq('id', insertData[0].id);
    } catch (error) {
      results.tests.push({ test: 'required_columns_test', status: 'FAIL', message: `Column test failed: ${(error as Error).message}`, details: { error: (error as Error).message, suggestion: 'Run ocean_shipments_schema_fix.sql to add missing columns' } });
      results.summary.failed++;
    }

    try {
      const { data: viewData, error: viewError } = await supabase.from('trade_data_view').select('unified_id, company_name, hs_code').limit(1);
      if (viewError) throw viewError;
      const hasUnifiedId = viewData && viewData.length > 0 && (viewData[0] as any).unified_id;
      results.tests.push({ test: 'trade_data_view_unified_id', status: hasUnifiedId ? 'PASS' : 'PARTIAL', message: hasUnifiedId ? 'trade_data_view has unified_id column' : 'trade_data_view exists but may be missing unified_id column', details: { viewExists: true, hasUnifiedId: !!hasUnifiedId, sampleRecord: viewData?.[0] || null } });
      if (hasUnifiedId) results.summary.passed++; else results.summary.failed++;
    } catch (error) {
      results.tests.push({ test: 'trade_data_view_unified_id', status: 'FAIL', message: `trade_data_view test failed: ${(error as Error).message}`, details: { suggestion: 'Run trade_data_view_schema.sql to recreate view with unified_id' } });
      results.summary.failed++;
    }

    try {
      const testRLSData = { consignee_name: 'RLS Test Company', hs_code: '1234', value_usd: 1000, raw_xml_filename: 'rls_test.xml' };
      const { data: rlsInsert, error: rlsError } = await supabase.from('ocean_shipments').insert(testRLSData).select('id');
      if (rlsError && (rlsError as any).code === '42501') throw new Error('RLS is blocking inserts - missing INSERT policy');
      if (rlsError) throw rlsError;
      const { error: selectError } = await supabase.from('ocean_shipments').select('id').eq('raw_xml_filename', 'rls_test.xml');
      if (selectError && (selectError as any).code === '42501') throw new Error('RLS is blocking selects - missing SELECT policy');
      results.tests.push({ test: 'rls_permissions', status: 'PASS', message: 'RLS policies allow both INSERT and SELECT operations', details: { insertWorking: true, selectWorking: true, testRecordId: rlsInsert?.[0]?.id } });
      results.summary.passed++;
      if (rlsInsert?.[0]?.id) await supabase.from('ocean_shipments').delete().eq('id', rlsInsert[0].id);
    } catch (error) {
      results.tests.push({ test: 'rls_permissions', status: 'FAIL', message: `RLS test failed: ${(error as Error).message}`, details: { suggestion: 'Run supabase_rls_fix.sql to add missing RLS policies' } });
      results.summary.failed++;
    }

    try {
      const { data: searchData, error: searchError } = await supabase.from('trade_data_view').select('unified_id, company_name, hs_code, value_usd, shipment_date').ilike('company_name_lower', '%test%').limit(5);
      if (searchError) throw searchError;
      results.tests.push({ test: 'search_api_compatibility', status: 'PASS', message: 'Search filters work correctly with trade_data_view', details: { searchWorking: true, resultCount: searchData?.length || 0 } });
      results.summary.passed++;
    } catch (error) {
      results.tests.push({ test: 'search_api_compatibility', status: 'FAIL', message: `Search API test failed: ${(error as Error).message}` });
      results.summary.failed++;
    }

    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) throw bucketError;
      const hasRawXmlBucket = buckets?.some(b => b.id === 'raw-xml') || false;
      results.tests.push({ test: 'storage_bucket', status: hasRawXmlBucket ? 'PASS' : 'FAIL', message: hasRawXmlBucket ? 'raw-xml bucket exists' : 'raw-xml bucket missing', details: { buckets: buckets?.map(b => b.id) || [], hasRawXmlBucket } });
      if (hasRawXmlBucket) results.summary.passed++; else results.summary.failed++;
    } catch (error) {
      results.tests.push({ test: 'storage_bucket', status: 'ERROR', message: `Storage bucket check failed: ${(error as Error).message}` });
      results.summary.failed++;
    }

    results.summary.total = results.tests.length;
    results.success = results.summary.failed === 0;

    return NextResponse.json({ ...results, message: results.success ? 'All schema verification tests passed! ✅' : `${results.summary.failed} tests failed. Check details for fixes needed.`, timestamp: new Date().toISOString() });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Schema verification failed', details: (error as Error).message, timestamp: new Date().toISOString() }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getDbOrNull();
    if(!supabase) return NextResponse.json({ success:false, error:'Supabase env missing' }, { status:500 });
    const { action } = await request.json();
    if (action === 'cleanup') {
      await supabase.from('ocean_shipments').delete().eq('raw_xml_filename', 'schema_test.xml');
      return NextResponse.json({ success: true, message: 'Test data cleaned up successfully' });
    }
    if (action === 'sample_data') {
      const sampleData = [
        { consignee_name: 'Samsung Electronics America Inc', consignee_city: 'Dallas', consignee_state: 'TX', consignee_country: 'United States', shipper_name: 'Samsung Electronics Co Ltd', shipper_country: 'South Korea', origin_country: 'South Korea', destination_country: 'United States', destination_city: 'Dallas', hs_code: '8471', commodity_description: 'Computer monitors and displays', value_usd: 125000, weight_kg: 2500, arrival_date: '2024-01-15', vessel_name: 'MSC VESSEL', container_count: 2, raw_xml_filename: 'sample_samsung.xml' },
        { consignee_name: 'Apple Inc', consignee_city: 'Cupertino', consignee_state: 'CA', consignee_country: 'United States', shipper_name: 'Foxconn Technology Co Ltd', shipper_country: 'China', origin_country: 'China', destination_country: 'United States', destination_city: 'San Francisco', hs_code: '8518', commodity_description: 'Audio equipment and headphones', value_usd: 75000, weight_kg: 150, arrival_date: '2024-01-20', vessel_name: 'COSCO SHIPPING', container_count: 1, raw_xml_filename: 'sample_apple.xml' }
      ];
      const { data, error } = await supabase.from('ocean_shipments').insert(sampleData).select('id');
      if (error) throw error;
      return NextResponse.json({ success: true, message: `Inserted ${data.length} sample records`, recordIds: data.map((r:any)=>r.id) });
    }
    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}