import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const s = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const lower = (v: unknown) => s(v).toLowerCase();

function normStr(v: any): string | null {
  return v == null ? null : String(v);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const company = s(url.searchParams.get('company') || '');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0);

    console.log('🔍 Searching for company:', company);

    // Query companies with their shipments - using only columns that exist
    const { data: companies, error, count } = await supabaseAdmin
      .from('companies')
      .select(`
        id,
        company_name,
        country,
        website,
        shipments (
          id,
          bol_number,
          hs_code,
          product_description,
          origin_country,
          destination_country,
          arrival_date,
          gross_weight_kg,
          transport_mode,
          vessel_name,
          shipper_name,
          port_of_loading,
          port_of_discharge
        )
      `, { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    console.log('✅ Found companies:', companies?.length);

    // Filter by company name if specified
    let filteredCompanies = companies || [];
    if (company) {
      filteredCompanies = filteredCompanies.filter(c => 
        c.company_name?.toLowerCase().includes(company.toLowerCase())
      );
    }

    // Transform to expected format
    const rows = filteredCompanies.flatMap((comp: any) => {
      // If company has shipments, create one row per shipment
      if (comp.shipments && comp.shipments.length > 0) {
        return comp.shipments.map((shipment: any) => ({
          id: String(shipment.id),
          unified_id: String(comp.id),
          mode: normStr(shipment.transport_mode) || 'mixed',
          shipment_type: normStr(shipment.transport_mode) || 'mixed',
          transport_mode: normStr(shipment.transport_mode) || 'mixed',
          unified_company_name: comp.company_name || 'Unknown',
          unified_destination: normStr(shipment.destination_country) || comp.country || '',
          unified_value: 1000000, // Mock value for now
          unified_weight: Number(shipment.gross_weight_kg) || 15000,
          unified_date: normStr(shipment.arrival_date) || '2024-12-01',
          unified_carrier: normStr(shipment.vessel_name) || 'Unknown Carrier',
          hs_code: normStr(shipment.hs_code),
          bol_number: normStr(shipment.bol_number),
          vessel_name: normStr(shipment.vessel_name),
          shipper_name: normStr(shipment.shipper_name),
          origin_country: normStr(shipment.origin_country),
          destination_country: normStr(shipment.destination_country),
          destination_city: normStr(shipment.destination_country), // Using country as city for now
          port_of_loading: normStr(shipment.port_of_loading),
          port_of_discharge: normStr(shipment.port_of_discharge),
          container_count: null,
          gross_weight_kg: shipment.gross_weight_kg || null,
          company_name: comp.company_name,
          country: comp.country,
          website: comp.website,
          product_description: normStr(shipment.product_description)
        }));
      } else {
        // If no shipments, return company with mock shipment data
        return [{
          id: String(comp.id),
          unified_id: String(comp.id),
          mode: 'mixed',
          shipment_type: 'mixed',
          transport_mode: 'mixed',
          unified_company_name: comp.company_name || 'Unknown',
          unified_destination: comp.country || '',
          unified_value: 1000000,
          unified_weight: 15000,
          unified_date: '2024-12-01',
          unified_carrier: 'Unknown Carrier',
          company_name: comp.company_name,
          country: comp.country,
          website: comp.website
        }];
      }
    });

    console.log('🎯 Returning', rows.length, 'results');

    return NextResponse.json({
      success: true,
      data: rows,
      total: rows.length,
      pagination: { hasMore: false }
    });

  } catch (e: any) {
    console.error('💥 Fatal error:', e);
    return NextResponse.json({
      success: false,
      error: e.message,
      stack: e.stack
    });
  }
}