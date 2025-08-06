import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get real statistics from trade_data_view
    const [
      { data: totalStats, error: totalError },
      { data: oceanStats, error: oceanError },
      { data: airStats, error: airError },
      { data: shipperStats, error: shipperError },
      { data: consigneeStats, error: consigneeError },
      { data: recentShipments, error: recentError },
      { data: totalValue, error: valueError }
    ] = await Promise.all([
      // Total shipments count
      supabase.from('trade_data_view').select('*', { count: 'exact', head: true }),
      
      // Ocean shipments count
      supabase.from('trade_data_view').select('*', { count: 'exact', head: true }).eq('shipment_type', 'ocean'),
      
      // Air shipments count  
      supabase.from('trade_data_view').select('*', { count: 'exact', head: true }).eq('shipment_type', 'air'),
      
      // Distinct shippers count
      supabase.from('trade_data_view').select('shipper_name').not('shipper_name', 'is', null),
      
      // Distinct consignees count
      supabase.from('trade_data_view').select('consignee_name').not('consignee_name', 'is', null),
      
      // Recent shipments for activity feed
      supabase.from('trade_data_view')
        .select('unified_id, company_name, shipment_date, raw_xml_filename, shipment_type')
        .order('shipment_date', { ascending: false })
        .limit(5),
      
      // Total value calculation
      supabase.from('trade_data_view')
        .select('value_usd')
        .not('value_usd', 'is', null)
    ]);

    if (totalError || oceanError || airError || shipperError || consigneeError || recentError || valueError) {
      console.error('Database query errors:', { totalError, oceanError, airError, shipperError, consigneeError, recentError, valueError });
    }

    // Calculate distinct counts
    const distinctShippers = new Set(shipperStats?.map(s => s.shipper_name?.toLowerCase()).filter(Boolean)).size;
    const distinctConsignees = new Set(consigneeStats?.map(c => c.consignee_name?.toLowerCase()).filter(Boolean)).size;
    
    // Calculate total value
    const calculatedTotalValue = totalValue?.reduce((sum, record) => {
      const value = parseFloat(record.value_usd) || 0;
      return sum + value;
    }, 0) || 0;

    // Get latest upload info
    const latestUpload = recentShipments?.[0]?.raw_xml_filename || 'No uploads yet';

    const stats = {
      success: true,
      stats: {
        totalShipments: (totalStats as any)?.count || 0,
        oceanShipments: (oceanStats as any)?.count || 0,
        airShipments: (airStats as any)?.count || 0,
        distinctShippers,
        distinctConsignees,
        totalValue: calculatedTotalValue,
        latestUpload,
        recentShipments: recentShipments || []
      }
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch dashboard stats',
        stats: {
          totalShipments: 0,
          oceanShipments: 0,
          airShipments: 0,
          distinctShippers: 0,
          distinctConsignees: 0,
          totalValue: 0,
          latestUpload: 'Error loading',
          recentShipments: []
        }
      },
      { status: 500 }
    );
  }
}