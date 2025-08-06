import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * 🚀 UNIFIED TRADE SEARCH - REAL SUPABASE DATA
 * This endpoint searches the trade_data_view with uploaded XML data
 * Replaces all mock data with real shipment records
 */

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UnifiedTradeRecord {
  unified_id: string;
  shipment_type: 'ocean' | 'air';
  unified_company_name: string;
  unified_destination: string;
  unified_value: number;
  unified_weight: number;
  unified_date: string;
  unified_carrier: string;
  hs_code: string;
  description: string;
  origin_country: string;
  destination_country: string;
  destination_city: string;
  confidence_score: number;
  confidence_sources: string[];
  apollo_verified: boolean;
  comtrade_data: boolean;
  bts_intelligence: any;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 UNIFIED SEARCH - QUERYING REAL TRADE DATA');
    
    const { searchParams } = new URL(request.url);
    
    // Extract search filters
    const mode = searchParams.get('mode') || 'all'; // air, ocean, all
    const company = searchParams.get('company') || '';
    const originCountry = searchParams.get('origin_country') || '';
    const destinationCountry = searchParams.get('destination_country') || '';
    const destinationCity = searchParams.get('destination_city') || '';
    const commodity = searchParams.get('commodity') || '';
    const hsCode = searchParams.get('hs_code') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const carrier = searchParams.get('carrier') || '';
    const minValue = parseFloat(searchParams.get('min_value') || '0');
    const maxValue = parseFloat(searchParams.get('max_value') || '999999999');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('🔍 Search filters:', {
      mode, company, originCountry, destinationCountry, destinationCity,
      commodity, hsCode, dateFrom, dateTo, carrier, minValue, maxValue, limit, offset
    });

    // Build Supabase query
    let query = supabase
      .from('trade_data_view')
      .select('*');

    // Apply filters
    if (mode !== 'all') {
      query = query.eq('shipment_type', mode);
    }

    if (company) {
      query = query.ilike('company_name_lower', `%${company.toLowerCase()}%`);
    }

    if (originCountry) {
      query = query.ilike('origin_country', `%${originCountry}%`);
    }

    if (destinationCountry) {
      query = query.ilike('destination_country', `%${destinationCountry}%`);
    }

    if (destinationCity) {
      query = query.ilike('destination_city', `%${destinationCity}%`);
    }

    if (commodity) {
      query = query.ilike('description_lower', `%${commodity.toLowerCase()}%`);
    }

    if (hsCode) {
      query = query.ilike('hs_code', `%${hsCode}%`);
    }

    if (carrier) {
      query = query.ilike('carrier', `%${carrier}%`);
    }

    if (dateFrom) {
      query = query.gte('shipment_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('shipment_date', dateTo);
    }

    if (minValue > 0) {
      query = query.gte('value_usd', minValue);
    }

    if (maxValue < 999999999) {
      query = query.lte('value_usd', maxValue);
    }

    // Apply pagination and ordering
    query = query
      .order('shipment_date', { ascending: false })
      .range(offset, offset + limit - 1);

    console.log('📊 Executing Supabase query...');

    // Execute query
    const { data: rawData, error, count } = await query;

    if (error) {
      console.error('💥 Supabase query error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: error.message,
        filters: { mode, company, originCountry, destinationCountry, commodity, hsCode }
      }, { status: 500 });
    }

    if (!rawData || rawData.length === 0) {
      console.log('⚠️ No trade data found with current filters');
      return NextResponse.json({
        success: true,
        message: 'No shipment records found matching your search criteria',
        data: [],
        pagination: {
          total: 0,
          offset,
          limit,
          hasMore: false
        },
        filters: { mode, company, originCountry, destinationCountry, commodity, hsCode },
        suggestions: [
          'Try broader search terms',
          'Check spelling of company names',
          'Expand date range',
          'Try different HS codes'
        ]
      });
    }

    console.log(`✅ Found ${rawData.length} trade records`);

    // Transform data to expected format
    const transformedData: UnifiedTradeRecord[] = rawData.map((record: any, index: number) => ({
      unified_id: record.unified_id || `${record.shipment_type}_${index}`,
      shipment_type: record.shipment_type,
      unified_company_name: record.company_name || 'Unknown Company',
      unified_destination: record.destination_city || record.destination_country || 'Unknown',
      unified_value: record.value_usd || 0,
      unified_weight: record.weight_kg || 0,
      unified_date: record.shipment_date || record.arrival_date || new Date().toISOString().split('T')[0],
      unified_carrier: record.carrier || 'Unknown Carrier',
      hs_code: record.hs_code || '',
      description: record.description || 'No description available',
      origin_country: record.origin_country || 'Unknown',
      destination_country: record.destination_country || 'Unknown',
      destination_city: record.destination_city || 'Unknown',
      
      // Add confidence scoring based on data completeness
      confidence_score: calculateConfidenceScore(record),
      confidence_sources: getConfidenceSources(record),
      apollo_verified: false, // Will be updated when Apollo enrichment runs
      comtrade_data: false, // This is direct shipment data, not Comtrade
      bts_intelligence: null // Will be populated by BTS matching if available
    }));

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('trade_data_view')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: `Found ${transformedData.length} shipment records`,
      data: transformedData,
      pagination: {
        total: totalCount || 0,
        offset,
        limit,
        hasMore: (offset + limit) < (totalCount || 0)
      },
      filters: {
        mode, company, originCountry, destinationCountry, destinationCity,
        commodity, hsCode, dateFrom, dateTo, carrier
      },
      metadata: {
        source: 'trade_data_view',
        queryTime: new Date().toISOString(),
        dataTypes: Array.from(new Set(transformedData.map(r => r.shipment_type))),
        dateRange: {
          earliest: Math.min(...transformedData.map(r => new Date(r.unified_date).getTime())),
          latest: Math.max(...transformedData.map(r => new Date(r.unified_date).getTime()))
        }
      }
    });

  } catch (error) {
    console.error('💥 Unified search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Search failed',
      details: (error as Error).message,
      message: 'Unable to search trade data. Please try again or contact support.'
    }, { status: 500 });
  }
}

function calculateConfidenceScore(record: any): number {
  let score = 0;
  
  // Company name quality
  if (record.company_name && record.company_name.length > 3) score += 20;
  
  // Geographic data
  if (record.origin_country) score += 15;
  if (record.destination_country) score += 15;
  if (record.destination_city) score += 10;
  
  // Commodity data
  if (record.hs_code && record.hs_code.length >= 4) score += 20;
  if (record.description && record.description.length > 10) score += 10;
  
  // Financial data
  if (record.value_usd && record.value_usd > 0) score += 10;
  
  return Math.min(score, 100);
}

function getConfidenceSources(record: any): string[] {
  const sources = [];
  
  if (record.company_name) sources.push('Company Name');
  if (record.hs_code) sources.push('HS Code');
  if (record.value_usd) sources.push('Trade Value');
  if (record.origin_country && record.destination_country) sources.push('Geographic Data');
  if (record.carrier) sources.push('Carrier Information');
  if (record.shipment_date) sources.push('Date Information');
  
  return sources;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle bulk search or advanced filtering
    const {
      companies = [],
      hsCodes = [],
      countries = [],
      dateRange = {},
      valueRange = {},
      mode = 'all'
    } = body;

    console.log('🔍 Bulk search request:', { companies, hsCodes, countries, mode });

    let query = supabase.from('trade_data_view').select('*');

    if (mode !== 'all') {
      query = query.eq('shipment_type', mode);
    }

    // Bulk company search
    if (companies.length > 0) {
      const companyFilters = companies.map((c: string) => 
        `company_name_lower.ilike.%${c.toLowerCase()}%`
      ).join(',');
      query = query.or(companyFilters);
    }

    // Bulk HS code search
    if (hsCodes.length > 0) {
      query = query.in('hs_code', hsCodes);
    }

    // Bulk country search
    if (countries.length > 0) {
      const countryFilters = countries.map((c: string) => 
        `origin_country.ilike.%${c}%,destination_country.ilike.%${c}%`
      ).join(',');
      query = query.or(countryFilters);
    }

    // Date range
    if (dateRange.from) query = query.gte('shipment_date', dateRange.from);
    if (dateRange.to) query = query.lte('shipment_date', dateRange.to);

    // Value range
    if (valueRange.min) query = query.gte('value_usd', valueRange.min);
    if (valueRange.max) query = query.lte('value_usd', valueRange.max);

    const { data, error } = await query.limit(500);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      searchCriteria: body
    });

  } catch (error) {
    console.error('Bulk search error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}