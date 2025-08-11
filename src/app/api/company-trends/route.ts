export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ success:false, error:'Supabase env missing' }, { status:500 });
    }
    const supabase = createClient(url, key, { auth: { persistSession:false } });

    const since = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data: trends, error } = await supabase
      .from('company_monthly_trends')
      .select('*')
      .ilike('company_name', companyName.toLowerCase().trim())
      .gte('shipment_month', `${since}`)
      .order('shipment_month', { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch trend data', details: error.message },
        { status: 500 }
      );
    }

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
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}