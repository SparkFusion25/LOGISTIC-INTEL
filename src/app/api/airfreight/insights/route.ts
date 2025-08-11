export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
function getDb(): SupabaseClient {
  if (!cachedClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase environment not configured');
    }
    cachedClient = createClient(url, key, { auth: { persistSession: false } });
  }
  return cachedClient;
}

interface AirfreightQuery {
  hs_code?: string;
  country_origin?: string;
  country_destination?: string;
  carrier_name?: string;
  departure_port?: string;
  arrival_city?: string;
  destination_state?: string;
  trade_month_start?: string;
  trade_month_end?: string;
  min_value?: number;
  max_value?: number;
  min_weight?: number;
  max_weight?: number;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  aggregation?: 'summary' | 'monthly' | 'carriers' | 'trade_lanes' | 'commodities';
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(request.url);
    
    const query: AirfreightQuery = {
      hs_code: searchParams.get('hs_code') || undefined,
      country_origin: searchParams.get('country_origin') || undefined,
      country_destination: searchParams.get('country_destination') || undefined,
      carrier_name: searchParams.get('carrier_name') || undefined,
      departure_port: searchParams.get('departure_port') || undefined,
      arrival_city: searchParams.get('arrival_city') || undefined,
      destination_state: searchParams.get('destination_state') || undefined,
      trade_month_start: searchParams.get('trade_month_start') || undefined,
      trade_month_end: searchParams.get('trade_month_end') || undefined,
      min_value: searchParams.get('min_value') ? parseInt(searchParams.get('min_value')!) : undefined,
      max_value: searchParams.get('max_value') ? parseInt(searchParams.get('max_value')!) : undefined,
      min_weight: searchParams.get('min_weight') ? parseFloat(searchParams.get('min_weight')!) : undefined,
      max_weight: searchParams.get('max_weight') ? parseFloat(searchParams.get('max_weight')!) : undefined,
      limit: parseInt(searchParams.get('limit') || '100'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sort_by: searchParams.get('sort_by') || 'value_usd',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
      aggregation: (searchParams.get('aggregation') as any) || undefined
    };

    // Handle different types of queries
    if (query.aggregation) {
      return await handleAggregatedQuery(query);
    } else {
      return await handleDetailedQuery(query);
    }

  } catch (error) {
    console.error('Airfreight insights API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleDetailedQuery(query: AirfreightQuery) {
  try {
    const supabase = getDb();
    // Build base query
    let supabaseQuery = supabase
      .from('airfreight_insights')
      .select('*', { count: 'exact' });

    // Apply filters
    if (query.hs_code) {
      supabaseQuery = supabaseQuery.eq('hs_code', query.hs_code);
    }

    if (query.country_origin) {
      supabaseQuery = supabaseQuery.eq('country_origin', query.country_origin);
    }

    if (query.country_destination) {
      supabaseQuery = supabaseQuery.eq('country_destination', query.country_destination);
    }

    if (query.carrier_name) {
      supabaseQuery = supabaseQuery.ilike('carrier_name', `%${query.carrier_name}%`);
    }

    if (query.departure_port) {
      supabaseQuery = supabaseQuery.ilike('departure_port', `%${query.departure_port}%`);
    }

    if (query.arrival_city) {
      supabaseQuery = supabaseQuery.ilike('arrival_city', `%${query.arrival_city}%`);
    }

    if (query.destination_state) {
      supabaseQuery = supabaseQuery.eq('destination_state', query.destination_state);
    }

    if (query.trade_month_start) {
      supabaseQuery = supabaseQuery.gte('trade_month', query.trade_month_start);
    }

    if (query.trade_month_end) {
      supabaseQuery = supabaseQuery.lte('trade_month', query.trade_month_end);
    }

    if (query.min_value) {
      supabaseQuery = supabaseQuery.gte('value_usd', query.min_value);
    }

    if (query.max_value) {
      supabaseQuery = supabaseQuery.lte('value_usd', query.max_value);
    }

    if (query.min_weight) {
      supabaseQuery = supabaseQuery.gte('weight_kg', query.min_weight);
    }

    if (query.max_weight) {
      supabaseQuery = supabaseQuery.lte('weight_kg', query.max_weight);
    }

    // Apply sorting
    supabaseQuery = supabaseQuery.order(query.sort_by!, { ascending: query.sort_order === 'asc' });

    // Apply pagination
    supabaseQuery = supabaseQuery.range(query.offset!, query.offset! + query.limit! - 1);

    const { data: insights, error, count } = await supabaseQuery;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { success: false, error: 'Database query failed' },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const summary = await calculateSummaryStats(query);

    return NextResponse.json({
      success: true,
      data: insights || [],
      total: count || 0,
      limit: query.limit,
      offset: query.offset,
      summary,
      filters_applied: getAppliedFilters(query)
    });

  } catch (error) {
    console.error('Detailed query error:', error);
    return NextResponse.json(
      { success: false, error: 'Query processing failed' },
      { status: 500 }
    );
  }
}

async function handleAggregatedQuery(query: AirfreightQuery) {
  try {
    const supabase = getDb();
    let result;

    switch (query.aggregation) {
      case 'summary':
        result = await getOverallSummary(query);
        break;
      case 'monthly':
        result = await getMonthlySummary(query);
        break;
      case 'carriers':
        result = await getCarrierPerformance(query);
        break;
      case 'trade_lanes':
        result = await getTradeLanes(query);
        break;
      case 'commodities':
        result = await getCommoditySummary(query);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid aggregation type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      aggregation_type: query.aggregation,
      data: result,
      filters_applied: getAppliedFilters(query)
    });

  } catch (error) {
    console.error('Aggregated query error:', error);
    return NextResponse.json(
      { success: false, error: 'Aggregation processing failed' },
      { status: 500 }
    );
  }
}

async function calculateSummaryStats(query: AirfreightQuery) {
  // Build a summary query with the same filters
  const supabase = getDb();
  let summaryQuery = supabase
    .from('airfreight_insights')
    .select('value_usd, weight_kg, quantity');

  // Apply the same filters as the main query
  summaryQuery = applyFiltersToQuery(summaryQuery, query);

  const { data: summaryData } = await summaryQuery;

  if (!summaryData || summaryData.length === 0) {
    return {
      total_records: 0,
      total_value_usd: 0,
      total_weight_kg: 0,
      total_quantity: 0,
      average_value: 0,
      average_weight: 0
    };
  }

  const totalValue = summaryData.reduce((sum, row) => sum + (row.value_usd || 0), 0);
  const totalWeight = summaryData.reduce((sum, row) => sum + (row.weight_kg || 0), 0);
  const totalQuantity = summaryData.reduce((sum, row) => sum + (row.quantity || 0), 0);

  return {
    total_records: summaryData.length,
    total_value_usd: totalValue,
    total_weight_kg: totalWeight,
    total_quantity: totalQuantity,
    average_value: totalValue / summaryData.length,
    average_weight: totalWeight / summaryData.length
  };
}

async function getOverallSummary(query: AirfreightQuery) {
  const supabase = getDb();
  const { data } = await supabase
    .from('airfreight_insights')
    .select(`
      value_usd,
      weight_kg,
      quantity,
      hs_code,
      carrier_name,
      country_origin,
      trade_month
    `);

  if (!data) return {};

  const totalValue = data.reduce((sum, row) => sum + (row.value_usd || 0), 0);
  const totalWeight = data.reduce((sum, row) => sum + (row.weight_kg || 0), 0);
  const uniqueHsCodes = new Set(data.map(row => row.hs_code)).size;
  const uniqueCarriers = new Set(data.map(row => row.carrier_name)).size;
  const uniqueOrigins = new Set(data.map(row => row.country_origin)).size;

  // Get latest trade month
  const tradeMonths = data.map(row => row.trade_month).sort();
  const latestMonth = tradeMonths[tradeMonths.length - 1];
  const earliestMonth = tradeMonths[0];

  return {
    total_shipments: data.length,
    total_value_usd: totalValue,
    total_weight_kg: totalWeight,
    average_shipment_value: totalValue / data.length,
    unique_hs_codes: uniqueHsCodes,
    unique_carriers: uniqueCarriers,
    unique_origin_countries: uniqueOrigins,
    date_range: {
      start: earliestMonth,
      end: latestMonth
    },
    value_per_kg: totalValue / totalWeight
  };
}

async function getMonthlySummary(query: AirfreightQuery) {
  const supabase = getDb();
  const { data } = await supabase
    .from('airfreight_monthly_summary')
    .select('*')
    .order('trade_month', { ascending: true });

  return data || [];
}

async function getCarrierPerformance(query: AirfreightQuery) {
  const supabase = getDb();
  const { data } = await supabase
    .from('airfreight_carrier_performance')
    .select('*')
    .order('total_value_usd', { ascending: false })
    .limit(20);

  return data || [];
}

async function getTradeLanes(query: AirfreightQuery) {
  const supabase = getDb();
  const { data } = await supabase
    .from('airfreight_trade_lanes')
    .select('*')
    .order('total_value_usd', { ascending: false })
    .limit(50);

  return data || [];
}

async function getCommoditySummary(query: AirfreightQuery) {
  const supabase = getDb();
  const { data } = await supabase
    .from('airfreight_insights')
    .select(`
      hs_code,
      hs_description,
      value_usd,
      weight_kg,
      quantity
    `);

  if (!data) return [];

  // Group by HS code
  const commodityMap = new Map();

  data.forEach(row => {
    const hsCode = row.hs_code;
    if (!commodityMap.has(hsCode)) {
      commodityMap.set(hsCode, {
        hs_code: hsCode,
        hs_description: row.hs_description,
        total_shipments: 0,
        total_value_usd: 0,
        total_weight_kg: 0,
        total_quantity: 0
      });
    }

    const commodity = commodityMap.get(hsCode);
    commodity.total_shipments += 1;
    commodity.total_value_usd += row.value_usd || 0;
    commodity.total_weight_kg += row.weight_kg || 0;
    commodity.total_quantity += row.quantity || 0;
  });

  return Array.from(commodityMap.values())
    .sort((a, b) => b.total_value_usd - a.total_value_usd)
    .slice(0, 30);
}

function applyFiltersToQuery(query: any, filters: AirfreightQuery) {
  if (filters.hs_code) query = query.eq('hs_code', filters.hs_code);
  if (filters.country_origin) query = query.eq('country_origin', filters.country_origin);
  if (filters.country_destination) query = query.eq('country_destination', filters.country_destination);
  if (filters.carrier_name) query = query.ilike('carrier_name', `%${filters.carrier_name}%`);
  if (filters.departure_port) query = query.ilike('departure_port', `%${filters.departure_port}%`);
  if (filters.arrival_city) query = query.ilike('arrival_city', `%${filters.arrival_city}%`);
  if (filters.destination_state) query = query.eq('destination_state', filters.destination_state);
  if (filters.trade_month_start) query = query.gte('trade_month', filters.trade_month_start);
  if (filters.trade_month_end) query = query.lte('trade_month', filters.trade_month_end);
  if (filters.min_value) query = query.gte('value_usd', filters.min_value);
  if (filters.max_value) query = query.lte('value_usd', filters.max_value);
  if (filters.min_weight) query = query.gte('weight_kg', filters.min_weight);
  if (filters.max_weight) query = query.lte('weight_kg', filters.max_weight);

  return query;
}

function getAppliedFilters(query: AirfreightQuery) {
  const filters: any = {};

  if (query.hs_code) filters.hs_code = query.hs_code;
  if (query.country_origin) filters.country_origin = query.country_origin;
  if (query.country_destination) filters.country_destination = query.country_destination;
  if (query.carrier_name) filters.carrier_name = query.carrier_name;
  if (query.departure_port) filters.departure_port = query.departure_port;
  if (query.arrival_city) filters.arrival_city = query.arrival_city;
  if (query.destination_state) filters.destination_state = query.destination_state;
  if (query.trade_month_start) filters.trade_month_start = query.trade_month_start;
  if (query.trade_month_end) filters.trade_month_end = query.trade_month_end;
  if (query.min_value) filters.min_value = query.min_value;
  if (query.max_value) filters.max_value = query.max_value;
  if (query.min_weight) filters.min_weight = query.min_weight;
  if (query.max_weight) filters.max_weight = query.max_weight;

  return filters;
}