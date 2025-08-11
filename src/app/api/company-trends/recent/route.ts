export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get('company');

    if (!companyName) {
      return NextResponse.json(
        { success: false, error: 'Company name is required' },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ success:false, error:'Supabase env missing' }, { status:500 });
    }
    const supabase = createClient(url, key, { auth: { persistSession:false } });

    const { data: trends, error } = await supabase
      .from('company_monthly_trends')
      .select('shipment_month, shipment_count')
      .ilike('company_name', companyName.toLowerCase().trim())
      .gte('shipment_month', `${new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`)
      .order('shipment_month', { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch trend data', details: error.message },
        { status: 500 }
      );
    }

    if (!trends || trends.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No trend data found for this company',
        company: companyName
      });
    }

    const monthlyAggregated = trends.reduce((acc: any[], curr) => {
      const existingMonth = acc.find(item => item.shipment_month === curr.shipment_month);
      if (existingMonth) {
        existingMonth.shipment_count += curr.shipment_count;
      } else {
        acc.push({ shipment_month: curr.shipment_month, shipment_count: curr.shipment_count });
      }
      return acc;
    }, []);

    const totalShipments = monthlyAggregated.reduce((sum, month) => sum + month.shipment_count, 0);
    const currentMonth = monthlyAggregated[monthlyAggregated.length - 1];
    const currentMonthCount = currentMonth?.shipment_count || 0;
    const peakMonth = monthlyAggregated.reduce((max, month) => month.shipment_count > max.shipment_count ? month : max, { shipment_month: '', shipment_count: 0 });
    const recentMonths = monthlyAggregated.slice(-3);
    const olderMonths = monthlyAggregated.slice(-6, -3);
    const recentAvg = recentMonths.length > 0 ? recentMonths.reduce((sum, m) => sum + m.shipment_count, 0) / recentMonths.length : 0;
    const olderAvg = olderMonths.length > 0 ? olderMonths.reduce((sum, m) => sum + m.shipment_count, 0) / olderMonths.length : 0;
    const trendPercentage = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg * 100) : 0;

    const formatMonth = (monthString: string) => {
      const date = new Date(monthString);
      return date.toLocaleDateString('en-US', { month: 'long' });
    };

    const result = {
      success: true,
      company: companyName,
      total_shipments: totalShipments,
      current_month: currentMonthCount,
      peak_month: formatMonth(peakMonth.shipment_month),
      peak_count: peakMonth.shipment_count,
      trend: trendPercentage > 0 ? `+${trendPercentage.toFixed(0)}%` : `${trendPercentage.toFixed(0)}%`,
      trend_direction: trendPercentage > 5 ? 'up' : trendPercentage < -5 ? 'down' : 'stable',
      months_data: monthlyAggregated.slice(-6)
    };

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}