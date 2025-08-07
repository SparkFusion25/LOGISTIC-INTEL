import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🌍 Fetching unique countries from trade data');

    // Get unique origin countries from ocean_shipments
    const { data: originData, error: originError } = await supabase
      .from('ocean_shipments')
      .select('shipper_country')
      .not('shipper_country', 'is', null)
      .not('shipper_country', 'eq', '');

    if (originError) {
      console.error('Error fetching origin countries:', originError);
      return getDefaultCountries();
    }

    // Get unique destination countries
    const { data: destData, error: destError } = await supabase
      .from('ocean_shipments')
      .select('destination_country')
      .not('destination_country', 'is', null)
      .not('destination_country', 'eq', '');

    if (destError) {
      console.error('Error fetching destination countries:', destError);
      return getDefaultCountries();
    }

    // Combine and deduplicate countries
    const allCountries = new Set<string>();
    
    originData?.forEach(record => {
      if (record.shipper_country) {
        allCountries.add(record.shipper_country.trim());
      }
    });

    destData?.forEach(record => {
      if (record.destination_country) {
        allCountries.add(record.destination_country.trim());
      }
    });

    // Convert to array and sort
    const uniqueCountries = Array.from(allCountries)
      .filter(country => country.length > 0)
      .sort();

    console.log(`✅ Found ${uniqueCountries.length} unique countries`);

    return NextResponse.json({
      success: true,
      countries: uniqueCountries,
      count: uniqueCountries.length
    });

  } catch (error) {
    console.error('Countries API error:', error);
    return getDefaultCountries();
  }
}

function getDefaultCountries() {
  // Fallback to common trading countries if database fails
  const defaultCountries = [
    'China', 'Germany', 'Japan', 'South Korea', 'Singapore', 
    'Netherlands', 'Switzerland', 'France', 'United States',
    'Italy', 'United Kingdom', 'Canada', 'India', 'Vietnam',
    'Thailand', 'Malaysia', 'Indonesia', 'Taiwan', 'Belgium',
    'Spain', 'Turkey', 'Mexico', 'Brazil', 'Australia'
  ];

  return NextResponse.json({
    success: true,
    countries: defaultCountries,
    count: defaultCountries.length,
    source: 'fallback'
  });
}