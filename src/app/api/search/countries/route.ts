export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return getDefaultCountries();
    const supabase = createClient(url, key, { auth: { persistSession:false } });

    const { data: originData } = await supabase
      .from('ocean_shipments')
      .select('shipper_country')
      .not('shipper_country', 'is', null)
      .not('shipper_country', 'eq', '');

    const { data: destData } = await supabase
      .from('ocean_shipments')
      .select('destination_country')
      .not('destination_country', 'is', null)
      .not('destination_country', 'eq', '');

    const allCountries = new Set<string>();
    originData?.forEach(record => { if (record.shipper_country) allCountries.add(record.shipper_country.trim()); });
    destData?.forEach(record => { if (record.destination_country) allCountries.add(record.destination_country.trim()); });

    const uniqueCountries = Array.from(allCountries).filter(country => country.length > 0).sort();
    return NextResponse.json({ success: true, countries: uniqueCountries, count: uniqueCountries.length });

  } catch (error) {
    return getDefaultCountries();
  }
}

function getDefaultCountries() {
  const defaultCountries = [
    'China', 'Germany', 'Japan', 'South Korea', 'Singapore', 
    'Netherlands', 'Switzerland', 'France', 'United States',
    'Italy', 'United Kingdom', 'Canada', 'India', 'Vietnam',
    'Thailand', 'Malaysia', 'Indonesia', 'Taiwan', 'Belgium',
    'Spain', 'Turkey', 'Mexico', 'Brazil', 'Australia'
  ];

  return NextResponse.json({ success: true, countries: defaultCountries, count: defaultCountries.length, source: 'fallback' });
}