import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  'https://zupuxlrtixhfnbuhxhum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQzOTIxNiwiZXhwIjoyMDcwMDE1MjE2fQ.F-dshtyWdNBMeQjFBdvEOdmgZnz3X8W_ZH1X5qdVGcU'
);

interface UnifiedSearchFilters {
  mode: 'air' | 'ocean' | 'all';
  company?: string;
  commodity?: string;
  origin_country?: string;
  destination_country?: string;
  destination_city?: string;
  destination_state?: string;
  destination_zip?: string;
  hs_code?: string;
  carrier?: string;
  date_from?: string;
  date_to?: string;
  min_value?: number;
  max_value?: number;
  limit?: number;
  offset?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: UnifiedSearchFilters = {
      mode: (searchParams.get('mode') as 'air' | 'ocean' | 'all') || 'all',
      company: searchParams.get('company') || undefined,
      commodity: searchParams.get('commodity') || undefined,
      origin_country: searchParams.get('origin_country') || undefined,
      destination_country: searchParams.get('destination_country') || undefined,
      destination_city: searchParams.get('destination_city') || undefined,
      destination_state: searchParams.get('destination_state') || undefined,
      destination_zip: searchParams.get('destination_zip') || undefined,
      hs_code: searchParams.get('hs_code') || undefined,
      carrier: searchParams.get('carrier') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      min_value: searchParams.get('min_value') ? parseFloat(searchParams.get('min_value')!) : undefined,
      max_value: searchParams.get('max_value') ? parseFloat(searchParams.get('max_value')!) : undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    let searchResults;
    let summary;

    switch (filters.mode) {
      case 'air':
        searchResults = await searchAirfreightData(filters);
        break;
      case 'ocean':
        searchResults = await searchOceanData(filters);
        break;
      case 'all':
      default:
        searchResults = await searchCombinedData(filters);
        break;
    }

    // Calculate summary stats
    summary = await calculateSearchSummary(searchResults.data, filters.mode);

    return NextResponse.json({
      success: true,
      mode: filters.mode,
      data: searchResults.data,
      total: searchResults.total,
      limit: filters.limit,
      offset: filters.offset,
      summary,
      filters_applied: getAppliedFilters(filters)
    });

  } catch (error) {
    console.error('Unified search API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function searchAirfreightData(filters: UnifiedSearchFilters) {
  let query = supabase
    .from('airfreight_shipments')
    .select(`
      *,
      company_profile:company_profiles(
        id,
        company_name,
        normalized_name,
        primary_industry,
        headquarters_city,
        headquarters_country,
        air_match,
        air_match_score
      )
    `, { count: 'exact' });

  // Apply airfreight-specific filters
  if (filters.company) {
    query = query.or(`shipper_name.ilike.%${filters.company}%,consignee_name.ilike.%${filters.company}%`);
  }

  if (filters.commodity) {
    query = query.or(`description.ilike.%${filters.commodity}%,commodity_description.ilike.%${filters.commodity}%`);
  }

  if (filters.origin_country) {
    query = query.eq('country', filters.origin_country);
  }

  if (filters.destination_city) {
    query = query.ilike('arrival_city', `%${filters.destination_city}%`);
  }

  if (filters.destination_state) {
    query = query.eq('arrival_state', filters.destination_state);
  }

  if (filters.destination_zip) {
    query = query.eq('destination_zip', filters.destination_zip);
  }

  if (filters.hs_code) {
    query = query.eq('hs_code', filters.hs_code);
  }

  if (filters.carrier) {
    query = query.ilike('carrier_name', `%${filters.carrier}%`);
  }

  if (filters.date_from) {
    query = query.gte('trade_date', filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte('trade_date', filters.date_to);
  }

  if (filters.min_value) {
    query = query.gte('value_usd', filters.min_value);
  }

  if (filters.max_value) {
    query = query.lte('value_usd', filters.max_value);
  }

  // Apply sorting and pagination
  query = query
    .order('value_usd', { ascending: false })
    .range(filters.offset!, filters.offset! + filters.limit! - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Airfreight search error: ${error.message}`);
  }

  // Transform data to unified format
  const transformedData = (data || []).map(item => ({
    ...item,
    mode: 'air' as const,
    mode_icon: '✈️',
    unified_company_name: item.shipper_name || item.consignee_name || 'Unknown',
    unified_destination: `${item.arrival_city || ''}, ${item.arrival_state || ''}`.trim(),
    unified_value: item.value_usd,
    unified_weight: item.weight_kg,
    unified_date: item.trade_date,
    unified_carrier: item.carrier_name
  }));

  return { data: transformedData, total: count || 0 };
}

async function searchOceanData(filters: UnifiedSearchFilters) {
  let query = supabase
    .from('ocean_shipments')
    .select(`
      *,
      company_profile:company_profiles(
        id,
        company_name,
        normalized_name,
        primary_industry,
        headquarters_city,
        headquarters_country,
        ocean_match,
        ocean_match_score
      )
    `, { count: 'exact' });

  // Apply ocean-specific filters
  if (filters.company) {
    query = query.or(`company_name.ilike.%${filters.company}%,shipper_name.ilike.%${filters.company}%,consignee_name.ilike.%${filters.company}%`);
  }

  if (filters.commodity) {
    query = query.or(`hs_description.ilike.%${filters.commodity}%,commodity_description.ilike.%${filters.commodity}%`);
  }

  if (filters.origin_country) {
    query = query.eq('origin_country', filters.origin_country);
  }

  if (filters.destination_country) {
    query = query.eq('destination_country', filters.destination_country);
  }

  if (filters.destination_city) {
    query = query.ilike('destination_city', `%${filters.destination_city}%`);
  }

  if (filters.destination_state) {
    query = query.eq('destination_state', filters.destination_state);
  }

  if (filters.destination_zip) {
    query = query.eq('destination_zip', filters.destination_zip);
  }

  if (filters.hs_code) {
    query = query.eq('hs_code', filters.hs_code);
  }

  if (filters.carrier) {
    query = query.ilike('carrier_name', `%${filters.carrier}%`);
  }

  if (filters.date_from) {
    query = query.gte('departure_date', filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte('arrival_date', filters.date_to);
  }

  if (filters.min_value) {
    query = query.gte('value_usd', filters.min_value);
  }

  if (filters.max_value) {
    query = query.lte('value_usd', filters.max_value);
  }

  // Apply sorting and pagination
  query = query
    .order('value_usd', { ascending: false })
    .range(filters.offset!, filters.offset! + filters.limit! - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Ocean search error: ${error.message}`);
  }

  // Transform data to unified format
  const transformedData = (data || []).map(item => ({
    ...item,
    mode: 'ocean' as const,
    mode_icon: '🚢',
    unified_company_name: item.company_name || item.shipper_name || item.consignee_name || 'Unknown',
    unified_destination: `${item.destination_city || ''}, ${item.destination_state || ''}`.trim(),
    unified_value: item.value_usd,
    unified_weight: item.weight_kg,
    unified_date: item.arrival_date || item.departure_date,
    unified_carrier: item.carrier_name
  }));

  return { data: transformedData, total: count || 0 };
}

async function searchCombinedData(filters: UnifiedSearchFilters) {
  // Get both air and ocean data
  const [airResults, oceanResults] = await Promise.all([
    searchAirfreightData({ ...filters, mode: 'air', limit: Math.floor(filters.limit! / 2) }),
    searchOceanData({ ...filters, mode: 'ocean', limit: Math.floor(filters.limit! / 2) })
  ]);

  // Also get matched companies view
  let matchQuery = supabase
    .from('company_air_ocean_matches')
    .select('*', { count: 'exact' });

  if (filters.company) {
    matchQuery = matchQuery.ilike('company_name', `%${filters.company}%`);
  }

  if (filters.hs_code) {
    matchQuery = matchQuery.eq('hs_code', filters.hs_code);
  }

  if (filters.destination_city) {
    matchQuery = matchQuery.or(`destination_city.ilike.%${filters.destination_city}%,arrival_city.ilike.%${filters.destination_city}%`);
  }

  const { data: matchedData } = await matchQuery
    .order('match_score', { ascending: false })
    .limit(10);

  // Combine and deduplicate results
  const combinedData = [
    ...airResults.data,
    ...oceanResults.data
  ];

  // Add match information for combined view
  const enhancedData = combinedData.map(item => ({
    ...item,
    match_info: matchedData?.find(match => 
      (item.mode === 'air' && match.air_company_id === item.company_id) ||
      (item.mode === 'ocean' && match.ocean_company_id === item.company_id)
    )
  }));

  // Sort by value descending
  enhancedData.sort((a, b) => (b.unified_value || 0) - (a.unified_value || 0));

  return { 
    data: enhancedData.slice(0, filters.limit), 
    total: airResults.total + oceanResults.total,
    matches: matchedData?.length || 0
  };
}

async function calculateSearchSummary(data: any[], mode: string) {
  const totalValue = data.reduce((sum, item) => sum + (item.unified_value || 0), 0);
  const totalWeight = data.reduce((sum, item) => sum + (item.unified_weight || 0), 0);
  const uniqueCompanies = new Set(data.map(item => item.unified_company_name)).size;
  const uniqueCarriers = new Set(data.map(item => item.unified_carrier)).size;
  const uniqueCommodities = new Set(data.map(item => item.hs_code)).size;

  const modeBreakdown = {
    air: data.filter(item => item.mode === 'air').length,
    ocean: data.filter(item => item.mode === 'ocean').length
  };

  return {
    total_records: data.length,
    total_value_usd: totalValue,
    total_weight_kg: totalWeight,
    average_shipment_value: data.length > 0 ? totalValue / data.length : 0,
    unique_companies: uniqueCompanies,
    unique_carriers: uniqueCarriers,
    unique_commodities: uniqueCommodities,
    mode_breakdown: modeBreakdown,
    value_per_kg: totalWeight > 0 ? totalValue / totalWeight : 0
  };
}

function getAppliedFilters(filters: UnifiedSearchFilters) {
  const applied: any = { mode: filters.mode };
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && key !== 'mode' && key !== 'limit' && key !== 'offset') {
      applied[key] = value;
    }
  });

  return applied;
}