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

    const comprehensiveTradeData = [
      { commodity: '8528720000', commodity_name: 'LCD monitors and display units', value_usd: 8500000, weight_kg: 45000, year: 2024, month: 12, state: 'CA', country: 'South Korea', transport_mode: '40' },
      { commodity: '8528720000', commodity_name: 'LCD monitors and display units', value_usd: 6200000, weight_kg: 38000, year: 2024, month: 11, state: 'TX', country: 'South Korea', transport_mode: '40' }
    ];
    const comprehensiveBTSData = [
      { origin_airport: 'ICN', dest_airport: 'ORD', carrier: 'Korean Air Cargo', freight_kg: 145000, mail_kg: 2800, month: 12, year: 2024 }
    ];

    const results: any[] = [];

    try {
      const { error: censusError } = await supabase.from('census_trade_data').upsert(comprehensiveTradeData, { onConflict: 'commodity,year,month,state,country,transport_mode' });
      if (censusError) results.push({ step: 'Census data', status: 'error', error: censusError.message });
      else results.push({ step: 'Census data', status: 'success', recordsAdded: comprehensiveTradeData.length });
    } catch (error) { results.push({ step: 'Census data', status: 'error', error: (error as Error).message }); }

    try {
      const { error: btsError } = await supabase.from('t100_air_segments').upsert(comprehensiveBTSData, { onConflict: 'origin_airport,dest_airport,carrier,month,year' });
      if (btsError) results.push({ step: 'BTS data', status: 'error', error: btsError.message });
      else results.push({ step: 'BTS data', status: 'success', recordsAdded: comprehensiveBTSData.length });
    } catch (error) { results.push({ step: 'BTS data', status: 'error', error: (error as Error).message }); }

    const successCount = results.filter(r => r.status === 'success').length;
    return NextResponse.json({ success: successCount > 0, message: `Trade data population completed. ${successCount} data sources updated.`, details: results });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Trade data population failed', details: (error as Error).message }, { status: 500 });
  }
}