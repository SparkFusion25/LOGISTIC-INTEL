import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to validate UN Comtrade API connectivity
 * This will help debug any API issues
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing UN Comtrade API connectivity...');

    // Test URL with known working parameters
    const testUrl = 'https://comtradeapi.un.org/data/v1/get/C/A/HS?reporterCode=840&period=2024&partnerCode=410,156&motCode=5&flowCode=1&includeDesc=true&max=10';
    
    console.log('📡 Test URL:', testUrl);

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'LogisticIntel/1.0 API Test'
      }
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `UN Comtrade API returned ${response.status}: ${response.statusText}`,
        test_url: testUrl,
        response_status: response.status
      });
    }

    const data = await response.json();
    
    console.log('📈 Raw API Response Structure:', {
      hasData: !!data.data,
      dataLength: data.data?.length || 0,
      keys: Object.keys(data || {}),
      firstRecord: data.data?.[0] || null
    });

    return NextResponse.json({
      success: true,
      message: 'UN Comtrade API is accessible',
      test_url: testUrl,
      response_structure: {
        total_records: data.data?.length || 0,
        has_data_array: Array.isArray(data.data),
        sample_record: data.data?.[0] || null,
        api_response_keys: Object.keys(data || {})
      },
      raw_sample: data.data?.slice(0, 3) || []
    });

  } catch (error) {
    console.error('💥 UN Comtrade API Test Failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'UN Comtrade API test failed',
      details: (error as Error).message,
      possible_causes: [
        'Network connectivity issue',
        'UN Comtrade API temporarily unavailable',
        'Rate limiting or authentication required',
        'Invalid API endpoint or parameters'
      ]
    }, { status: 500 });
  }
}