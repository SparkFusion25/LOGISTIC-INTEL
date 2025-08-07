import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * 🚀 UNIFIED TRADE SEARCH - GROUPED BY COMPANY
 * Returns companies with aggregated shipment data and expandable shipment details
 * Fixes duplicate company listings and implements proper UI/UX structure
 */

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ShipmentDetail {
  bol_number: string | null;
  arrival_date: string;
  containers: string | null;
  vessel_name: string | null;
  weight_kg: number;
  value_usd: number;
  shipper_name: string | null;
  port_of_lading: string | null;
  port_of_discharge: string | null;
  goods_description: string | null;
  departure_date: string | null;
  hs_code: string | null;
  unified_id: string;
}

interface GroupedCompanyData {
  company_name: string;
  shipment_mode: 'ocean' | 'air' | 'mixed';
  total_shipments: number;
  total_weight_kg: number;
  total_value_usd: number;
  first_arrival: string;
  last_arrival: string;
  confidence_score: number;
  shipments: ShipmentDetail[];
  // Contact info is NOT included in search results (CRM gating)
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 UNIFIED SEARCH - QUERYING GROUPED COMPANY DATA');
    
    const { searchParams } = new URL(request.url);
    
    // Extract search filters
    const mode = searchParams.get('mode') || 'all'; // air, ocean, all
    const company = searchParams.get('company') || '';
    const originCountry = searchParams.get('originCountry') || '';
    const destinationCountry = searchParams.get('destinationCountry') || '';
    const destinationCity = searchParams.get('destinationCity') || '';
    const commodity = searchParams.get('commodity') || '';
    const hsCode = searchParams.get('hsCode') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    console.log('Search filters:', {
      mode, company, originCountry, destinationCountry, 
      destinationCity, commodity, hsCode, startDate, endDate, limit
    });

    // Build dynamic query for trade_data_view (fixed with correct columns)
    let query = supabase
      .from('trade_data_view')
      .select(`
        unified_id,
        company_name,
        shipment_type,
        arrival_date,
        departure_date,
        vessel_name,
        bol_number,
        container_count,
        container_type,
        gross_weight_kg,
        value_usd,
        shipper_name,
        consignee_name,
        port_of_loading,
        port_of_discharge,
        origin_country,
        destination_city,
        hs_code,
        goods_description
      `);

    // Apply filters
    if (company) {
      query = query.ilike('company_name', `%${company}%`);
    }

    if (mode !== 'all') {
      query = query.eq('shipment_type', mode);
    }

    if (originCountry) {
      query = query.ilike('origin_country', `%${originCountry}%`);
    }

    if (destinationCountry) {
      query = query.ilike('destination_city', `%${destinationCountry}%`);
    }

    if (destinationCity) {
      query = query.ilike('destination_city', `%${destinationCity}%`);
    }

    if (commodity) {
      query = query.ilike('goods_description', `%${commodity}%`);
    }

    if (hsCode) {
      query = query.ilike('hs_code', `%${hsCode}%`);
    }

    if (startDate) {
      query = query.gte('arrival_date', startDate);
    }

    if (endDate) {
      query = query.lte('arrival_date', endDate);
    }

    // Execute query with limit
    const { data: rawData, error } = await query
      .order('arrival_date', { ascending: false })
      .limit(1000); // Get more records for grouping

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log(`✅ Retrieved ${rawData?.length || 0} raw shipment records`);

    if (!rawData || rawData.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No shipments found matching your criteria',
        data: [],
        total_records: 0,
        search_filters: { mode, company, originCountry, destinationCountry, destinationCity, commodity, hsCode }
      });
    }

    // Group shipments by company
    const companyGroups = new Map<string, {
      shipments: any[];
      shipment_modes: Set<string>;
      total_weight: number;
      total_value: number;
      arrival_dates: string[];
    }>();

    rawData.forEach(record => {
      const companyName = record.company_name || 'Unknown Company';
      
      if (!companyGroups.has(companyName)) {
        companyGroups.set(companyName, {
          shipments: [],
          shipment_modes: new Set(),
          total_weight: 0,
          total_value: 0,
          arrival_dates: []
        });
      }

      const group = companyGroups.get(companyName)!;
      group.shipments.push(record);
      group.shipment_modes.add(record.shipment_type);
      group.total_weight += record.gross_weight_kg || 0;
      group.total_value += record.value_usd || 0;
      if (record.arrival_date) {
        group.arrival_dates.push(record.arrival_date);
      }
    });

    // Convert to grouped format
    const groupedData: GroupedCompanyData[] = Array.from(companyGroups.entries())
      .map(([companyName, group]) => {
        // Sort arrival dates
        const sortedDates = group.arrival_dates.sort();
        
        // Determine shipment mode
        let shipment_mode: 'ocean' | 'air' | 'mixed' = 'ocean';
        if (group.shipment_modes.has('air') && group.shipment_modes.has('ocean')) {
          shipment_mode = 'mixed';
        } else if (group.shipment_modes.has('air')) {
          shipment_mode = 'air';
        }

        // Calculate confidence score (basic algorithm)
        const confidenceScore = Math.min(100, Math.max(10, 
          (group.shipments.length * 15) + 
          (group.total_value > 0 ? 20 : 0) +
          (group.total_weight > 0 ? 15 : 0)
        ));

        // Format shipment details
        const shipments: ShipmentDetail[] = group.shipments.map(s => ({
          bol_number: s.bol_number,
          arrival_date: s.arrival_date,
          containers: s.container_count && s.container_type 
            ? `${s.container_count}x${s.container_type}` 
            : s.container_count?.toString() || null,
          vessel_name: s.vessel_name,
          weight_kg: s.gross_weight_kg || 0,
          value_usd: s.value_usd || 0,
          shipper_name: s.shipper_name,
          port_of_lading: s.port_of_loading,
          port_of_discharge: s.port_of_discharge,
          goods_description: s.goods_description,
          departure_date: s.departure_date,
          hs_code: s.hs_code,
          unified_id: s.unified_id
        }));

        return {
          company_name: companyName,
          shipment_mode,
          total_shipments: group.shipments.length,
          total_weight_kg: Math.round(group.total_weight),
          total_value_usd: Math.round(group.total_value),
          first_arrival: sortedDates[0] || '',
          last_arrival: sortedDates[sortedDates.length - 1] || '',
          confidence_score: confidenceScore,
          shipments: shipments.sort((a, b) => 
            new Date(b.arrival_date).getTime() - new Date(a.arrival_date).getTime()
          )
        };
      })
      .sort((a, b) => b.total_shipments - a.total_shipments) // Sort by shipment count
      .slice(0, limit); // Apply final limit

    console.log(`✅ Grouped into ${groupedData.length} companies`);

    return NextResponse.json({
      success: true,
      message: `Found ${groupedData.length} companies with ${rawData.length} total shipments`,
      data: groupedData,
      total_companies: groupedData.length,
      total_shipments: rawData.length,
      search_filters: { mode, company, originCountry, destinationCountry, destinationCity, commodity, hsCode },
      note: "Contact details are gated - add company to CRM to unlock"
    });

  } catch (error: any) {
    console.error('❌ UNIFIED SEARCH ERROR:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to search trade data',
      data: [],
      total_records: 0
    }, { status: 500 });
  }
}