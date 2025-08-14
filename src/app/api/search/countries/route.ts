export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  // Try unified_shipments first
  try {
    const db = supabaseServer();
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim();
    const field = url.searchParams.get('field') === 'destination' ? 'destination_country' : 'origin_country';

    let query = db.from('unified_shipments').select(`${field}`, { head: false, count: 'exact' }).not(field, 'is', null);
    if (q) query = query.ilike(field, `${q}%`);

    const { data, error } = await query.limit(50);
    if (!error && data && data.length > 0) {
      const set = new Set<string>();
      for (const row of data) {
        const val = (row as any)[field];
        if (val) set.add(String(val).trim());
      }
      return NextResponse.json({ success: true, countries: Array.from(set).sort(), count: set.size, source: 'unified_shipments' });
    }
  } catch (error) {
    // fallback below
  }

  // Fallback to ocean_shipments
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
    return NextResponse.json({ success: true, countries: uniqueCountries, count: uniqueCountries.length, source: 'ocean_shipments' });
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
// ...existing code...