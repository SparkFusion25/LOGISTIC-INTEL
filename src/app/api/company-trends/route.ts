import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get('company');
    const months = parseInt(searchParams.get('months') || '12');

    if (!companyName) {
      return NextResponse.json(
        { success: false, error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Query the company_monthly_trends view
    const { data: trends, error } = await supabase
      .from('company_monthly_trends')
      .select('*')
      .ilike('company_name', companyName.toLowerCase().trim())
      .gte('shipment_month', `${new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`)
      .order('shipment_month', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch trend data', details: error.message },
        { status: 500 }
      );
    }

    // Group by month and aggregate ocean/air shipments
    const monthlyAggregated = trends?.reduce((acc: any[], curr) => {
      const existingMonth = acc.find(item => item.shipment_month === curr.shipment_month);
      
      if (existingMonth) {
        existingMonth.shipment_count += curr.shipment_count;
        existingMonth.total_value_usd += curr.total_value_usd || 0;
      } else {
        acc.push({
          shipment_month: curr.shipment_month,
          shipment_count: curr.shipment_count,
          total_value_usd: curr.total_value_usd || 0,
          shipment_type: 'combined'
        });
      }
      
      return acc;
    }, []) || [];

    return NextResponse.json({
      success: true,
      trends: monthlyAggregated,
      company: companyName,
      period: `${months} months`,
      recordCount: monthlyAggregated.length
    });

  } catch (error) {
    console.error('Company trends API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}