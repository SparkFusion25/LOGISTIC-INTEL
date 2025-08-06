import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Starting comprehensive schema verification...');
    
    const results: any = {
      success: true,
      tests: [],
      summary: {
        passed: 0,
        failed: 0,
        total: 0
      }
    };

    // Test 1: Check ocean_shipments table structure
    console.log('📊 Test 1: Checking ocean_shipments schema...');
    try {
      const { data: oceanColumns, error: oceanError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'ocean_shipments')
        .eq('table_schema', 'public');

      if (oceanError) throw oceanError;

      const requiredColumns = [
        'consignee_name', 'shipper_name', 'hs_code', 'commodity_description',
        'value_usd', 'weight_kg', 'arrival_date', 'origin_country', 'destination_country'
      ];

      const existingColumns = oceanColumns?.map(col => col.column_name) || [];
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

      results.tests.push({
        test: 'ocean_shipments_schema',
        status: missingColumns.length === 0 ? 'PASS' : 'FAIL',
        message: missingColumns.length === 0 
          ? `All ${requiredColumns.length} required columns exist`
          : `Missing columns: ${missingColumns.join(', ')}`,
        details: {
          totalColumns: existingColumns.length,
          requiredColumns: requiredColumns.length,
          missingColumns
        }
      });

      if (missingColumns.length === 0) results.summary.passed++;
      else results.summary.failed++;

    } catch (error) {
      results.tests.push({
        test: 'ocean_shipments_schema',
        status: 'ERROR',
        message: `Schema check failed: ${(error as Error).message}`
      });
      results.summary.failed++;
    }

    // Test 2: Test sample data insertion
    console.log('📊 Test 2: Testing sample data insertion...');
    try {
      const testData = {
        consignee_name: 'Test Company Inc',
        consignee_city: 'Dallas',
        consignee_country: 'United States',
        shipper_name: 'Test Shipper Ltd',
        shipper_country: 'South Korea',
        origin_country: 'South Korea',
        destination_country: 'United States',
        destination_city: 'Dallas',
        hs_code: '8471',
        commodity_description: 'Test electronics',
        value_usd: 50000,
        weight_kg: 1000,
        arrival_date: '2024-01-15',
        vessel_name: 'TEST VESSEL',
        raw_xml_filename: 'schema_test.xml'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('ocean_shipments')
        .insert(testData)
        .select('id');

      if (insertError) throw insertError;

      results.tests.push({
        test: 'sample_data_insertion',
        status: 'PASS',
        message: `Successfully inserted test record with ID: ${insertData?.[0]?.id}`,
        details: { recordId: insertData?.[0]?.id }
      });
      results.summary.passed++;

      // Clean up test data
      if (insertData?.[0]?.id) {
        await supabase
          .from('ocean_shipments')
          .delete()
          .eq('id', insertData[0].id);
      }

    } catch (error) {
      results.tests.push({
        test: 'sample_data_insertion',
        status: 'FAIL',
        message: `Data insertion failed: ${(error as Error).message}`
      });
      results.summary.failed++;
    }

    // Test 3: Check trade_data_view exists and works
    console.log('📊 Test 3: Testing trade_data_view...');
    try {
      const { data: viewData, error: viewError } = await supabase
        .from('trade_data_view')
        .select('*')
        .limit(1);

      if (viewError) throw viewError;

      results.tests.push({
        test: 'trade_data_view',
        status: 'PASS',
        message: 'trade_data_view is accessible and functional',
        details: { 
          viewExists: true,
          sampleRecord: viewData?.[0] || null 
        }
      });
      results.summary.passed++;

    } catch (error) {
      results.tests.push({
        test: 'trade_data_view',
        status: 'FAIL',
        message: `trade_data_view test failed: ${(error as Error).message}`
      });
      results.summary.failed++;
    }

    // Test 4: Check RLS policies
    console.log('📊 Test 4: Checking RLS policies...');
    try {
      const { data: policies, error: policyError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'ocean_shipments');

      if (policyError) throw policyError;

      const hasInsertPolicy = policies?.some(p => p.cmd === 'INSERT') || false;
      const hasSelectPolicy = policies?.some(p => p.cmd === 'SELECT') || false;

      results.tests.push({
        test: 'rls_policies',
        status: (hasInsertPolicy && hasSelectPolicy) ? 'PASS' : 'FAIL',
        message: `RLS policies - Insert: ${hasInsertPolicy}, Select: ${hasSelectPolicy}`,
        details: {
          totalPolicies: policies?.length || 0,
          hasInsertPolicy,
          hasSelectPolicy,
          policies: policies?.map(p => ({ name: p.policyname, cmd: p.cmd })) || []
        }
      });

      if (hasInsertPolicy && hasSelectPolicy) results.summary.passed++;
      else results.summary.failed++;

    } catch (error) {
      results.tests.push({
        test: 'rls_policies',
        status: 'ERROR',
        message: `RLS policy check failed: ${(error as Error).message}`
      });
      results.summary.failed++;
    }

    // Test 5: Test search API compatibility
    console.log('📊 Test 5: Testing search API compatibility...');
    try {
      // Test the actual search filters that the API uses
      const { data: searchData, error: searchError } = await supabase
        .from('trade_data_view')
        .select('unified_id, company_name, hs_code, value_usd, shipment_date')
        .ilike('company_name_lower', '%test%')
        .limit(5);

      if (searchError) throw searchError;

      results.tests.push({
        test: 'search_api_compatibility',
        status: 'PASS',
        message: 'Search filters work correctly with trade_data_view',
        details: {
          searchWorking: true,
          resultCount: searchData?.length || 0
        }
      });
      results.summary.passed++;

    } catch (error) {
      results.tests.push({
        test: 'search_api_compatibility',
        status: 'FAIL',
        message: `Search API test failed: ${(error as Error).message}`
      });
      results.summary.failed++;
    }

    // Test 6: Check storage bucket
    console.log('📊 Test 6: Checking storage bucket...');
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) throw bucketError;

      const hasRawXmlBucket = buckets?.some(b => b.id === 'raw-xml') || false;

      results.tests.push({
        test: 'storage_bucket',
        status: hasRawXmlBucket ? 'PASS' : 'FAIL',
        message: hasRawXmlBucket ? 'raw-xml bucket exists' : 'raw-xml bucket missing',
        details: {
          buckets: buckets?.map(b => b.id) || [],
          hasRawXmlBucket
        }
      });

      if (hasRawXmlBucket) results.summary.passed++;
      else results.summary.failed++;

    } catch (error) {
      results.tests.push({
        test: 'storage_bucket',
        status: 'ERROR',
        message: `Storage bucket check failed: ${(error as Error).message}`
      });
      results.summary.failed++;
    }

    // Calculate final results
    results.summary.total = results.tests.length;
    results.success = results.summary.failed === 0;

    console.log(`✅ Schema verification completed: ${results.summary.passed}/${results.summary.total} tests passed`);

    return NextResponse.json({
      ...results,
      message: results.success 
        ? 'All schema verification tests passed! ✅'
        : `${results.summary.failed} tests failed. Check details for fixes needed.`,
      timestamp: new Date().toISOString(),
      nextSteps: results.success 
        ? [
            'Schema is ready for XML uploads',
            'Test /api/ingest/xml-shipments endpoint',
            'Verify search returns real data'
          ]
        : [
            'Run the schema fix SQL scripts',
            'Execute: ocean_shipments_schema_fix.sql',
            'Execute: airfreight_shipments_schema_fix.sql',
            'Re-run this test'
          ]
    });

  } catch (error) {
    console.error('Schema verification error:', error);
    return NextResponse.json({
      success: false,
      error: 'Schema verification failed',
      details: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'cleanup') {
      // Clean up any test data
      const { error } = await supabase
        .from('ocean_shipments')
        .delete()
        .eq('raw_xml_filename', 'schema_test.xml');

      return NextResponse.json({
        success: true,
        message: 'Test data cleaned up successfully'
      });
    }

    if (action === 'sample_data') {
      // Insert comprehensive sample data for testing
      const sampleData = [
        {
          consignee_name: 'Samsung Electronics America Inc',
          consignee_city: 'Dallas',
          consignee_state: 'TX',
          consignee_country: 'United States',
          shipper_name: 'Samsung Electronics Co Ltd',
          shipper_country: 'South Korea',
          origin_country: 'South Korea',
          destination_country: 'United States',
          destination_city: 'Dallas',
          hs_code: '8471',
          commodity_description: 'Computer monitors and displays',
          value_usd: 125000,
          weight_kg: 2500,
          arrival_date: '2024-01-15',
          vessel_name: 'MSC VESSEL',
          container_count: 2,
          raw_xml_filename: 'sample_samsung.xml'
        },
        {
          consignee_name: 'Apple Inc',
          consignee_city: 'Cupertino',
          consignee_state: 'CA',
          consignee_country: 'United States',
          shipper_name: 'Foxconn Technology Co Ltd',
          shipper_country: 'China',
          origin_country: 'China',
          destination_country: 'United States',
          destination_city: 'San Francisco',
          hs_code: '8518',
          commodity_description: 'Audio equipment and headphones',
          value_usd: 75000,
          weight_kg: 150,
          arrival_date: '2024-01-20',
          vessel_name: 'COSCO SHIPPING',
          container_count: 1,
          raw_xml_filename: 'sample_apple.xml'
        }
      ];

      const { data, error } = await supabase
        .from('ocean_shipments')
        .insert(sampleData)
        .select('id');

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: `Inserted ${data.length} sample records`,
        recordIds: data.map(r => r.id)
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Unknown action'
    }, { status: 400 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}