import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const testResults = {
      system_status: 'operational',
      timestamp: new Date().toISOString(),
      tests: [] as any[]
    };

    // Test 1: Basic search
    try {
      const basicSearch = await fetch(`${getBaseUrl(request)}/api/search/unified?mode=all&limit=5`);
      const basicResult = await basicSearch.json();
      
      testResults.tests.push({
        name: 'Basic Unified Search',
        status: basicResult.success ? 'PASS' : 'FAIL',
        result_count: basicResult.data?.length || 0,
        has_summary: !!basicResult.summary
      });
    } catch (error) {
      testResults.tests.push({
        name: 'Basic Unified Search',
        status: 'ERROR',
        error: (error as Error).message
      });
    }

    // Test 2: LG Electronics search
    try {
      const lgSearch = await fetch(`${getBaseUrl(request)}/api/search/unified?mode=all&company=LG%20Electronics&limit=3`);
      const lgResult = await lgSearch.json();
      
      const hasLG = lgResult.data?.some((item: any) => 
        item.unified_company_name.toLowerCase().includes('lg electronics')
      );
      
      testResults.tests.push({
        name: 'LG Electronics Search',
        status: hasLG ? 'PASS' : 'FAIL',
        found_lg: hasLG,
        result_count: lgResult.data?.length || 0
      });
    } catch (error) {
      testResults.tests.push({
        name: 'LG Electronics Search',
        status: 'ERROR',
        error: (error as Error).message
      });
    }

    // Test 3: Air shipper filter
    try {
      const airShipperSearch = await fetch(`${getBaseUrl(request)}/api/search/unified?mode=all&air_shipper_only=true&limit=5`);
      const airShipperResult = await airShipperSearch.json();
      
      const allAirShippers = airShipperResult.data?.every((item: any) => 
        item.bts_intelligence?.is_likely_air_shipper
      );
      
      testResults.tests.push({
        name: 'Air Shipper Filter',
        status: allAirShippers ? 'PASS' : 'FAIL',
        air_shippers_only: allAirShippers,
        result_count: airShipperResult.data?.length || 0,
        air_shipper_breakdown: airShipperResult.summary?.air_shipper_breakdown
      });
    } catch (error) {
      testResults.tests.push({
        name: 'Air Shipper Filter',
        status: 'ERROR',
        error: (error as Error).message
      });
    }

    // Test 4: Air intelligence API
    try {
      const airIntelSearch = await fetch(`${getBaseUrl(request)}/api/search/air-intelligence?company=LG%20Electronics`);
      const airIntelResult = await airIntelSearch.json();
      
      testResults.tests.push({
        name: 'Air Intelligence API',
        status: airIntelResult.success ? 'PASS' : 'FAIL',
        company: airIntelResult.company,
        is_air_shipper: airIntelResult.intelligence?.is_likely_air_shipper,
        confidence_score: airIntelResult.intelligence?.confidence_score,
        route_matches: airIntelResult.intelligence?.route_matches?.length || 0
      });
    } catch (error) {
      testResults.tests.push({
        name: 'Air Intelligence API',
        status: 'ERROR',
        error: (error as Error).message
      });
    }

    // Test 5: Apollo enrichment API
    try {
      const apolloSearch = await fetch(`${getBaseUrl(request)}/api/enrichment/apollo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: 'LG Electronics',
          maxContacts: 2
        })
      });
      const apolloResult = await apolloSearch.json();
      
      testResults.tests.push({
        name: 'Apollo Enrichment API',
        status: apolloResult.success ? 'PASS' : 'FAIL',
        source: apolloResult.source,
        contact_count: apolloResult.contacts?.length || 0,
        has_organization: !!apolloResult.organization
      });
    } catch (error) {
      testResults.tests.push({
        name: 'Apollo Enrichment API',
        status: 'ERROR',
        error: (error as Error).message
      });
    }

    // Test summary
    const passedTests = testResults.tests.filter(t => t.status === 'PASS').length;
    const totalTests = testResults.tests.length;
    
    return NextResponse.json({
      success: true,
      system_status: passedTests === totalTests ? 'ALL_TESTS_PASSED' : 'SOME_TESTS_FAILED',
      test_summary: {
        total_tests: totalTests,
        passed: passedTests,
        failed: testResults.tests.filter(t => t.status === 'FAIL').length,
        errors: testResults.tests.filter(t => t.status === 'ERROR').length
      },
      detailed_results: testResults,
      live_examples: {
        lg_electronics_search: `${getBaseUrl(request)}/api/search/unified?mode=all&company=LG%20Electronics`,
        air_shipper_filter: `${getBaseUrl(request)}/api/search/unified?mode=all&air_shipper_only=true`,
        air_intelligence: `${getBaseUrl(request)}/api/search/air-intelligence?company=LG%20Electronics`,
        apollo_enrichment: `${getBaseUrl(request)}/api/enrichment/apollo (POST with company name)`
      }
    });

  } catch (error) {
    console.error('Test system error:', error);
    return NextResponse.json(
      { success: false, error: 'Test system failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}