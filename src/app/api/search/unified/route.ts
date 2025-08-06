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
  air_shipper_only?: boolean;
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
      air_shipper_only: searchParams.get('air_shipper_only') === 'true',
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
  // Generate sample companies for demonstration
  const sampleCompanies = generateSampleCompanies(filters);
  
  // Filter by air shipper if requested
  let filteredCompanies = sampleCompanies;
  if (filters.air_shipper_only) {
    filteredCompanies = sampleCompanies.filter(company => company.bts_intelligence?.is_likely_air_shipper);
  }

  // Apply company filter
  if (filters.company) {
    filteredCompanies = filteredCompanies.filter(company => 
      company.unified_company_name.toLowerCase().includes(filters.company!.toLowerCase())
    );
  }

  // Apply commodity filter
  if (filters.commodity) {
    filteredCompanies = filteredCompanies.filter(company => 
      (company.description || '').toLowerCase().includes(filters.commodity!.toLowerCase()) ||
      company.hs_code.includes(filters.commodity!)
    );
  }

  // Sort by air shipper confidence and value
  filteredCompanies.sort((a, b) => {
    const aScore = a.bts_intelligence?.confidence_score || 0;
    const bScore = b.bts_intelligence?.confidence_score || 0;
    if (aScore !== bScore) return bScore - aScore;
    return (b.unified_value || 0) - (a.unified_value || 0);
  });

  return { 
    data: filteredCompanies.slice(0, filters.limit), 
    total: filteredCompanies.length,
    matches: filteredCompanies.filter(c => c.bts_intelligence?.is_likely_air_shipper).length
  };
}

function generateSampleCompanies(filters: UnifiedSearchFilters) {
  const companies = [
    {
      id: 'lg-electronics-1',
      mode: 'air' as const,
      mode_icon: '✈️',
      unified_company_name: 'LG Electronics',
      unified_destination: 'Chicago, IL',
      unified_value: 2500000,
      unified_weight: 125000,
      unified_date: '2024-12-15',
      unified_carrier: 'Korean Air Cargo',
      hs_code: '8471600000',
      description: 'Electronic computers and processing units',
      company_profile: {
        id: 'lg-profile',
        company_name: 'LG Electronics',
        primary_industry: 'Electronics Manufacturing',
        air_match: true,
        air_match_score: 9,
        likely_air_shipper: true,
        air_confidence_score: 85,
        bts_route_matches: []
      },
      bts_intelligence: {
        is_likely_air_shipper: true,
        confidence_score: 85,
        route_matches: [
          {
            origin_airport: 'ICN',
            dest_airport: 'ORD',
            carrier: 'Korean Air Cargo',
            dest_city: 'Chicago',
            freight_kg: 125000
          },
          {
            origin_airport: 'ICN',
            dest_airport: 'LAX',
            carrier: 'Korean Air Cargo',
            dest_city: 'Los Angeles',
            freight_kg: 98000
          }
        ],
        last_analysis: new Date().toISOString()
      }
    },
    {
      id: 'samsung-1',
      mode: 'air' as const,
      mode_icon: '✈️',
      unified_company_name: 'Samsung Electronics',
      unified_destination: 'Los Angeles, CA',
      unified_value: 3200000,
      unified_weight: 98000,
      unified_date: '2024-12-14',
      unified_carrier: 'Korean Air Cargo',
      hs_code: '8528720000',
      description: 'LCD monitors and display units',
      company_profile: {
        id: 'samsung-profile',
        company_name: 'Samsung Electronics',
        primary_industry: 'Consumer Electronics',
        air_match: true,
        air_match_score: 10,
        likely_air_shipper: true,
        air_confidence_score: 90,
        bts_route_matches: []
      },
      bts_intelligence: {
        is_likely_air_shipper: true,
        confidence_score: 90,
        route_matches: [
          {
            origin_airport: 'ICN',
            dest_airport: 'LAX',
            carrier: 'Korean Air Cargo',
            dest_city: 'Los Angeles',
            freight_kg: 98000
          },
          {
            origin_airport: 'ICN',
            dest_airport: 'JFK',
            carrier: 'Korean Air Cargo',
            dest_city: 'New York',
            freight_kg: 87000
          }
        ],
        last_analysis: new Date().toISOString()
      }
    },
    {
      id: 'sony-1',
      mode: 'air' as const,
      mode_icon: '✈️',
      unified_company_name: 'Sony Electronics',
      unified_destination: 'Los Angeles, CA',
      unified_value: 1800000,
      unified_weight: 156000,
      unified_date: '2024-12-13',
      unified_carrier: 'All Nippon Airways',
      hs_code: '8518300000',
      description: 'Audio equipment and headphones',
      company_profile: {
        id: 'sony-profile',
        company_name: 'Sony Electronics',
        primary_industry: 'Consumer Electronics',
        air_match: true,
        air_match_score: 8,
        likely_air_shipper: true,
        air_confidence_score: 82,
        bts_route_matches: []
      },
      bts_intelligence: {
        is_likely_air_shipper: true,
        confidence_score: 82,
        route_matches: [
          {
            origin_airport: 'NRT',
            dest_airport: 'LAX',
            carrier: 'All Nippon Airways',
            dest_city: 'Los Angeles',
            freight_kg: 156000
          }
        ],
        last_analysis: new Date().toISOString()
      }
    },
    {
      id: 'techglobal-1',
      mode: 'ocean' as const,
      mode_icon: '🚢',
      unified_company_name: 'TechGlobal Supply',
      unified_destination: 'Long Beach, CA',
      unified_value: 890000,
      unified_weight: 45000,
      unified_date: '2024-12-10',
      unified_carrier: 'COSCO Shipping',
      hs_code: '8471700000',
      description: 'Computer storage units',
      company_profile: {
        id: 'techglobal-profile',
        company_name: 'TechGlobal Supply',
        primary_industry: 'Technology Distribution',
        air_match: false,
        air_match_score: 5,
        likely_air_shipper: true,
        air_confidence_score: 72,
        bts_route_matches: []
      },
      bts_intelligence: {
        is_likely_air_shipper: true,
        confidence_score: 72,
        route_matches: [
          {
            origin_airport: 'PVG',
            dest_airport: 'LAX',
            carrier: 'China Cargo Airlines',
            dest_city: 'Los Angeles',
            freight_kg: 156000
          }
        ],
        last_analysis: new Date().toISOString()
      }
    },
    {
      id: 'medsupply-1',
      mode: 'ocean' as const,
      mode_icon: '🚢',
      unified_company_name: 'MedSupply International',
      unified_destination: 'Miami, FL',
      unified_value: 650000,
      unified_weight: 32000,
      unified_date: '2024-12-08',
      unified_carrier: 'MSC',
      hs_code: '9018390000',
      description: 'Medical instruments and apparatus',
      company_profile: {
        id: 'medsupply-profile',
        company_name: 'MedSupply International',
        primary_industry: 'Medical Equipment',
        air_match: false,
        air_match_score: 3,
        likely_air_shipper: false,
        air_confidence_score: 45,
        bts_route_matches: []
      },
      bts_intelligence: {
        is_likely_air_shipper: false,
        confidence_score: 45,
        route_matches: [],
        last_analysis: new Date().toISOString()
      }
    }
  ];

  return companies;
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

  // Calculate air shipper breakdown
  const airShippers = data.filter(item => item.bts_intelligence?.is_likely_air_shipper);
  const airShipperBreakdown = {
    likely_air_shippers: airShippers.length,
    high_confidence: airShippers.filter(item => (item.bts_intelligence?.confidence_score || 0) >= 80).length,
    medium_confidence: airShippers.filter(item => {
      const score = item.bts_intelligence?.confidence_score || 0;
      return score >= 60 && score < 80;
    }).length,
    low_confidence: airShippers.filter(item => {
      const score = item.bts_intelligence?.confidence_score || 0;
      return score >= 40 && score < 60;
    }).length
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
    air_shipper_breakdown: airShipperBreakdown,
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