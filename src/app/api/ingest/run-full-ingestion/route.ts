import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting full trade data ingestion pipeline...');

    const { year, month } = await request.json();
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;

    const results = [];
    let totalRecords = 0;

    // Step 1: Run BTS T-100 data ingestion
    try {
      console.log('📈 Step 1: Ingesting BTS T-100 air cargo data...');
      
      const btsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ingest/bts-t100`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: targetYear, month: targetMonth })
      });

      const btsResult = await btsResponse.json();
      
      if (btsResult.success) {
        results.push({ 
          step: 'BTS T-100 Ingestion', 
          status: 'success', 
          records: btsResult.details.records_inserted || 0,
          details: btsResult.details
        });
        totalRecords += btsResult.details.records_inserted || 0;
      } else {
        results.push({ 
          step: 'BTS T-100 Ingestion', 
          status: 'error', 
          error: btsResult.error,
          details: btsResult.details
        });
      }
    } catch (error) {
      results.push({ 
        step: 'BTS T-100 Ingestion', 
        status: 'error', 
        error: (error as Error).message 
      });
    }

    // Step 2: Run Census trade data ingestion (both air and ocean)
    try {
      console.log('🏛️ Step 2: Ingesting U.S. Census trade data...');
      
      const censusResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ingest/census-trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          year: targetYear, 
          month: targetMonth, 
          transportMode: 'both' 
        })
      });

      const censusResult = await censusResponse.json();
      
      if (censusResult.success) {
        results.push({ 
          step: 'Census Trade Data Ingestion', 
          status: 'success', 
          records: censusResult.details.total_records || 0,
          details: censusResult.details
        });
        totalRecords += censusResult.details.total_records || 0;
      } else {
        results.push({ 
          step: 'Census Trade Data Ingestion', 
          status: 'error', 
          error: censusResult.error,
          details: censusResult.details
        });
      }
    } catch (error) {
      results.push({ 
        step: 'Census Trade Data Ingestion', 
        status: 'error', 
        error: (error as Error).message 
      });
    }

    // Step 3: Validate data integrity
    try {
      console.log('✅ Step 3: Validating data integrity...');
      
      // Check if we have records in both tables
      const validationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/validate-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: targetYear, month: targetMonth })
      });

      if (validationResponse.ok) {
        const validationResult = await validationResponse.json();
        results.push({ 
          step: 'Data Validation', 
          status: 'success', 
          details: validationResult 
        });
      } else {
        results.push({ 
          step: 'Data Validation', 
          status: 'warning', 
          error: 'Validation endpoint not available' 
        });
      }
    } catch (error) {
      results.push({ 
        step: 'Data Validation', 
        status: 'warning', 
        error: 'Validation step failed' 
      });
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`🏁 Full ingestion completed: ${totalRecords} total records, ${successCount} successful steps, ${errorCount} errors`);

    return NextResponse.json({
      success: errorCount === 0,
      message: `Full trade data ingestion completed for ${targetYear}-${targetMonth}`,
      details: {
        year: targetYear,
        month: targetMonth,
        total_records: totalRecords,
        successful_steps: successCount,
        failed_steps: errorCount,
        results: results
      },
      next_steps: errorCount === 0 ? [
        'Trade intelligence search is now powered by real data',
        'Air/Ocean filtering uses actual transport modes from XML',
        'Company names extracted from real consignee data',
        'BTS route matching available for air freight',
        'CRM integration ready for real contact management'
      ] : [
        'Review error details above',
        'Check API keys and network connectivity',
        'Retry individual ingestion steps if needed'
      ]
    });

  } catch (error) {
    console.error('💥 Full ingestion pipeline failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Full trade data ingestion pipeline failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}