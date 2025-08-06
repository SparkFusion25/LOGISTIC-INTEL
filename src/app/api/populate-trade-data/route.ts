import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zupuxlrtixhfnbuhxhum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQzOTIxNiwiZXhwIjoyMDcwMDE1MjE2fQ.F-dshtyWdNBMeQjFBdvEOdmgZnz3X8W_ZH1X5qdVGcU'
);

export async function POST(request: NextRequest) {
  try {
    console.log('📦 Populating comprehensive trade data...');

    // Enhanced Census trade data with more companies and routes
    const comprehensiveTradeData = [
      // Samsung Electronics - Various products
      { commodity: '8528720000', commodity_name: 'LCD monitors and display units', value_usd: 8500000, weight_kg: 45000, year: 2024, month: 12, state: 'CA', country: 'South Korea', transport_mode: '40' },
      { commodity: '8528720000', commodity_name: 'LCD monitors and display units', value_usd: 6200000, weight_kg: 38000, year: 2024, month: 11, state: 'TX', country: 'South Korea', transport_mode: '40' },
      { commodity: '8471600000', commodity_name: 'Computer processing units and controllers', value_usd: 12000000, weight_kg: 25000, year: 2024, month: 12, state: 'NY', country: 'South Korea', transport_mode: '40' },
      { commodity: '8471700000', commodity_name: 'Computer storage units and drives', value_usd: 4500000, weight_kg: 15000, year: 2024, month: 12, state: 'WA', country: 'South Korea', transport_mode: '40' },
      
      // LG Electronics  
      { commodity: '8528720000', commodity_name: 'LCD monitors and display units', value_usd: 7200000, weight_kg: 42000, year: 2024, month: 12, state: 'IL', country: 'South Korea', transport_mode: '40' },
      { commodity: '8471600000', commodity_name: 'Computer processing units and controllers', value_usd: 5800000, weight_kg: 22000, year: 2024, month: 11, state: 'FL', country: 'South Korea', transport_mode: '40' },
      
      // Sony Electronics
      { commodity: '8518300000', commodity_name: 'Audio equipment and headphones', value_usd: 3200000, weight_kg: 18000, year: 2024, month: 12, state: 'CA', country: 'Japan', transport_mode: '40' },
      { commodity: '8528720000', commodity_name: 'LCD monitors and display units', value_usd: 4800000, weight_kg: 28000, year: 2024, month: 11, state: 'NY', country: 'Japan', transport_mode: '40' },
      { commodity: '9018390000', commodity_name: 'Medical and surgical instruments', value_usd: 2100000, weight_kg: 8500, year: 2024, month: 12, state: 'MA', country: 'Japan', transport_mode: '40' },
      
      // Lenovo (China)
      { commodity: '8471600000', commodity_name: 'Computer processing units and controllers', value_usd: 6500000, weight_kg: 35000, year: 2024, month: 12, state: 'NC', country: 'China', transport_mode: '40' },
      { commodity: '8471700000', commodity_name: 'Computer storage units and drives', value_usd: 3800000, weight_kg: 28000, year: 2024, month: 11, state: 'TX', country: 'China', transport_mode: '40' },
      
      // Ocean freight (larger volumes, lower values per kg)
      { commodity: '8528720000', commodity_name: 'LCD monitors and display units', value_usd: 2800000, weight_kg: 85000, year: 2024, month: 12, state: 'CA', country: 'South Korea', transport_mode: '20' },
      { commodity: '8471600000', commodity_name: 'Computer processing units and controllers', value_usd: 3200000, weight_kg: 95000, year: 2024, month: 11, state: 'NY', country: 'China', transport_mode: '20' },
      { commodity: '8471700000', commodity_name: 'Computer storage units and drives', value_usd: 1800000, weight_kg: 125000, year: 2024, month: 12, state: 'WA', country: 'Thailand', transport_mode: '20' },
      { commodity: '8518300000', commodity_name: 'Audio equipment and headphones', value_usd: 1200000, weight_kg: 65000, year: 2024, month: 12, state: 'FL', country: 'China', transport_mode: '20' },
      
      // German medical equipment
      { commodity: '9018390000', commodity_name: 'Medical and surgical instruments', value_usd: 4200000, weight_kg: 12000, year: 2024, month: 12, state: 'IL', country: 'Germany', transport_mode: '40' },
      { commodity: '9018390000', commodity_name: 'Medical and surgical instruments', value_usd: 3800000, weight_kg: 11500, year: 2024, month: 11, state: 'CA', country: 'Germany', transport_mode: '40' },
      
      // Additional manufacturers
      { commodity: '8528720000', commodity_name: 'LCD monitors and display units', value_usd: 2200000, weight_kg: 15000, year: 2024, month: 12, state: 'TX', country: 'Taiwan', transport_mode: '40' },
      { commodity: '8518300000', commodity_name: 'Audio equipment and headphones', value_usd: 1800000, weight_kg: 8500, year: 2024, month: 11, state: 'CA', country: 'Germany', transport_mode: '40' },
      { commodity: '8471600000', commodity_name: 'Computer processing units and controllers', value_usd: 3500000, weight_kg: 18000, year: 2024, month: 12, state: 'WA', country: 'Taiwan', transport_mode: '40' }
    ];

    // Enhanced BTS air cargo data
    const comprehensiveBTSData = [
      // Korean routes (Samsung, LG)
      { origin_airport: 'ICN', dest_airport: 'ORD', carrier: 'Korean Air Cargo', freight_kg: 145000, mail_kg: 2800, month: 12, year: 2024 },
      { origin_airport: 'ICN', dest_airport: 'LAX', carrier: 'Korean Air Cargo', freight_kg: 128000, mail_kg: 2200, month: 12, year: 2024 },
      { origin_airport: 'ICN', dest_airport: 'JFK', carrier: 'Korean Air Cargo', freight_kg: 112000, mail_kg: 1900, month: 12, year: 2024 },
      { origin_airport: 'ICN', dest_airport: 'DFW', carrier: 'Korean Air Cargo', freight_kg: 95000, mail_kg: 1500, month: 11, year: 2024 },
      { origin_airport: 'ICN', dest_airport: 'SEA', carrier: 'Korean Air Cargo', freight_kg: 88000, mail_kg: 1400, month: 11, year: 2024 },
      
      // Japanese routes (Sony)
      { origin_airport: 'NRT', dest_airport: 'LAX', carrier: 'All Nippon Airways', freight_kg: 178000, mail_kg: 2400, month: 12, year: 2024 },
      { origin_airport: 'NRT', dest_airport: 'ORD', carrier: 'Japan Airlines', freight_kg: 156000, mail_kg: 2100, month: 12, year: 2024 },
      { origin_airport: 'NRT', dest_airport: 'JFK', carrier: 'All Nippon Airways', freight_kg: 134000, mail_kg: 1800, month: 11, year: 2024 },
      { origin_airport: 'KIX', dest_airport: 'LAX', carrier: 'Japan Airlines', freight_kg: 92000, mail_kg: 1300, month: 11, year: 2024 },
      
      // Chinese routes (Lenovo, Huawei)
      { origin_airport: 'PVG', dest_airport: 'LAX', carrier: 'China Cargo Airlines', freight_kg: 235000, mail_kg: 3500, month: 12, year: 2024 },
      { origin_airport: 'PVG', dest_airport: 'JFK', carrier: 'China Cargo Airlines', freight_kg: 198000, mail_kg: 3100, month: 12, year: 2024 },
      { origin_airport: 'PEK', dest_airport: 'ORD', carrier: 'Air China Cargo', freight_kg: 167000, mail_kg: 2600, month: 11, year: 2024 },
      { origin_airport: 'CAN', dest_airport: 'LAX', carrier: 'China Southern Cargo', freight_kg: 145000, mail_kg: 2200, month: 11, year: 2024 },
      
      // European routes (Siemens, medical equipment)
      { origin_airport: 'FRA', dest_airport: 'JFK', carrier: 'Lufthansa Cargo', freight_kg: 212000, mail_kg: 3200, month: 12, year: 2024 },
      { origin_airport: 'FRA', dest_airport: 'ORD', carrier: 'Lufthansa Cargo', freight_kg: 189000, mail_kg: 2800, month: 11, year: 2024 },
      { origin_airport: 'AMS', dest_airport: 'LAX', carrier: 'KLM Cargo', freight_kg: 156000, mail_kg: 2100, month: 12, year: 2024 },
      
      // Taiwan routes (ASUS, Acer)
      { origin_airport: 'TPE', dest_airport: 'LAX', carrier: 'EVA Air Cargo', freight_kg: 98000, mail_kg: 1600, month: 12, year: 2024 },
      { origin_airport: 'TPE', dest_airport: 'SEA', carrier: 'China Airlines Cargo', freight_kg: 87000, mail_kg: 1400, month: 11, year: 2024 }
    ];

    const results = [];

    // Insert Census trade data
    try {
      const { error: censusError } = await supabase
        .from('census_trade_data')
        .upsert(comprehensiveTradeData, { onConflict: 'commodity,year,month,state,country,transport_mode' });

      if (censusError) {
        results.push({ step: 'Census data', status: 'error', error: censusError.message });
      } else {
        results.push({ step: 'Census data', status: 'success', recordsAdded: comprehensiveTradeData.length });
      }
    } catch (error) {
      results.push({ step: 'Census data', status: 'error', error: (error as Error).message });
    }

    // Insert BTS data
    try {
      const { error: btsError } = await supabase
        .from('t100_air_segments')
        .upsert(comprehensiveBTSData, { onConflict: 'origin_airport,dest_airport,carrier,month,year' });

      if (btsError) {
        results.push({ step: 'BTS data', status: 'error', error: btsError.message });
      } else {
        results.push({ step: 'BTS data', status: 'success', recordsAdded: comprehensiveBTSData.length });
      }
    } catch (error) {
      results.push({ step: 'BTS data', status: 'error', error: (error as Error).message });
    }

    const successCount = results.filter(r => r.status === 'success').length;

    return NextResponse.json({
      success: successCount > 0,
      message: `Trade data population completed. ${successCount} data sources updated.`,
      details: results,
      summary: {
        census_records: comprehensiveTradeData.length,
        bts_records: comprehensiveBTSData.length,
        total_records: comprehensiveTradeData.length + comprehensiveBTSData.length
      }
    });

  } catch (error) {
    console.error('💥 Trade data population failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Trade data population failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}