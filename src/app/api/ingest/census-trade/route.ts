export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ success:false, error:'Supabase env missing' }, { status:500 });
    const supabase = createClient(url, key, { auth: { persistSession:false } });

    const { year, month, transportMode } = await request.json();
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;
    const mode = transportMode || 'both';

    const airDataUrl = `https://api.census.gov/data/${targetYear}/timeseries/intltrade/exports/hs?get=ALL_VAL_MO,ALL_WGT_MO,COMMODITY,COMMODITY_NAME,CTYNAME,DISTRICT,GEN_CIF_MO&for=all:*&MONTH=${targetMonth.toString().padStart(2, '0')}&MODE_OF_TRANSPORT=40`;
    const oceanDataUrl = `https://api.census.gov/data/${targetYear}/timeseries/intltrade/exports/hs?get=ALL_VAL_MO,ALL_WGT_MO,COMMODITY,COMMODITY_NAME,CTYNAME,DISTRICT,GEN_CIF_MO&for=all:*&MONTH=${targetMonth.toString().padStart(2, '0')}&MODE_OF_TRANSPORT=20`;

    const results: any[] = [];
    let totalRecords = 0;

    if (mode === 'air' || mode === 'both') {
      const airResult = await downloadAndParseCensusData(supabase, airDataUrl, '40', targetYear, targetMonth);
      if (airResult.success) { totalRecords += airResult.records; results.push({ mode: 'air', records: airResult.records, status: 'success' }); }
      else results.push({ mode: 'air', status: 'error', error: airResult.error });
    }

    if (mode === 'ocean' || mode === 'both') {
      const oceanResult = await downloadAndParseCensusData(supabase, oceanDataUrl, '20', targetYear, targetMonth);
      if (oceanResult.success) { totalRecords += oceanResult.records; results.push({ mode: 'ocean', records: oceanResult.records, status: 'success' }); }
      else results.push({ mode: 'ocean', status: 'error', error: oceanResult.error });
    }

    return NextResponse.json({ success: totalRecords > 0, message: `Census trade data ingestion completed for ${targetYear}-${targetMonth}`, details: { year: targetYear, month: targetMonth, mode: mode, total_records: totalRecords, results: results } });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Census trade data ingestion failed', details: (error as Error).message }, { status: 500 });
  }
}

async function downloadAndParseCensusData(
  supabase: SupabaseClient,
  url: string,
  transportMode: string,
  year: number,
  month: number
): Promise<{success: boolean; records: number; error?: string}> {
  try {
    const response = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'LogisticIntel/1.0 Trade Intelligence Platform', 'Accept': 'application/json' } });
    if (!response.ok) return { success: false, records: 0, error: `HTTP ${response.status}: ${response.statusText}` };
    const rawData = await response.json();
    if (!Array.isArray(rawData) || rawData.length < 2) return { success: false, records: 0, error: 'Invalid Census API response format' };

    const headers = rawData[0];
    const rows = rawData.slice(1);

    const fieldMapping = { 'ALL_VAL_MO': 'value_usd', 'ALL_WGT_MO': 'weight_kg', 'COMMODITY': 'commodity', 'COMMODITY_NAME': 'commodity_name', 'CTYNAME': 'country', 'DISTRICT': 'customs_district' } as const;
    const parsedRecords: any[] = [];

    for (const row of rows) {
      const record: any = { year, month, transport_mode: transportMode };
      headers.forEach((header: string, index: number) => {
        const mappedField = (fieldMapping as any)[header];
        if (mappedField && row[index] !== null && row[index] !== '') {
          let value = row[index];
          if (mappedField === 'value_usd' || mappedField === 'weight_kg') {
            value = parseFloat(value) || 0;
            if (mappedField === 'weight_kg' && value < 1000 && value > 0) value = value * 1000;
          }
          record[mappedField] = value;
        }
      });
      record.state = extractStateFromDistrict(record.customs_district) || 'Unknown';
      if (record.commodity && record.value_usd > 0 && record.country) parsedRecords.push(record);
    }

    await supabase.from('census_trade_data').delete().eq('year', year).eq('month', month).eq('transport_mode', transportMode);

    const batchSize = 100;
    let insertedCount = 0;
    for (let i = 0; i < parsedRecords.length; i += batchSize) {
      const batch = parsedRecords.slice(i, i + batchSize);
      const { error: insertError } = await supabase.from('census_trade_data').insert(batch);
      if (!insertError) insertedCount += batch.length;
    }

    return { success: true, records: insertedCount };
  } catch (error) {
    return { success: false, records: 0, error: (error as Error).message };
  }
}

function extractStateFromDistrict(district?: string): string {
  if (!district) return 'Unknown';
  const districtStateMap: Record<string, string> = { 'New York': 'NY', 'Los Angeles': 'CA', 'Chicago': 'IL', 'Houston': 'TX', 'Miami': 'FL', 'Seattle': 'WA', 'San Francisco': 'CA', 'Boston': 'MA', 'Detroit': 'MI', 'Norfolk': 'VA', 'Charleston': 'SC', 'Savannah': 'GA', 'Baltimore': 'MD', 'Philadelphia': 'PA', 'Portland': 'OR', 'Long Beach': 'CA', 'Oakland': 'CA' };
  for (const [districtName, state] of Object.entries(districtStateMap)) { if (district.toLowerCase().includes(districtName.toLowerCase())) return state; }
  return 'Unknown';
}

async function extractCompanyFromCommodityAndOrigin(hsCode: string, commodityName?: string, country?: string): Promise<string> {
  const realCompanyMapping: Record<string, Record<string, string[]>> = { '8471600000': { 'South Korea': ['Samsung Electronics Co Ltd', 'LG Electronics Inc'], 'China': ['Lenovo Group Limited', 'Huawei Technologies Co Ltd'], 'Taiwan': ['ASUS Computer Inc', 'Acer Inc'], 'Japan': ['Sony Corporation', 'Toshiba Corporation'], 'default': ['Technology Manufacturer'] }, '8528720000': { 'South Korea': ['Samsung Display Co Ltd', 'LG Display Co Ltd'], 'China': ['TCL Technology Group', 'BOE Technology Group'], 'Taiwan': ['AU Optronics Corp', 'Innolux Corporation'], 'Japan': ['Sony Electronics Inc', 'Sharp Corporation'], 'default': ['Display Manufacturer'] }, '8518300000': { 'Japan': ['Sony Corporation', 'Audio-Technica Corporation'], 'China': ['Shenzhen Audio Equipment Co', 'Guangzhou Electronics'], 'Germany': ['Sennheiser Electronic', 'Beyerdynamic GmbH'], 'Denmark': ['Bang & Olufsen A/S'], 'default': ['Audio Equipment Manufacturer'] }, '9018390000': { 'Germany': ['Siemens Healthineers AG', 'B. Braun Melsungen AG'], 'Japan': ['Olympus Corporation', 'Terumo Corporation'], 'Switzerland': ['Roche Diagnostics Ltd'], 'default': ['Medical Equipment Manufacturer'] } };
  const countryMapping = realCompanyMapping[hsCode];
  if (countryMapping && country) {
    const companies = countryMapping[country] || countryMapping['default'];
    if (companies && companies.length > 0) { const index = parseInt(hsCode.slice(-2)) % companies.length; return companies[index]; }
  }
  if (commodityName?.toLowerCase().includes('electronic')) return `${country} Electronics Co Ltd`;
  if (commodityName?.toLowerCase().includes('medical')) return `${country} Medical Equipment Inc`;
  if (commodityName?.toLowerCase().includes('computer')) return `${country} Technology Corp`;
  return `${country} Trading Company`;
}