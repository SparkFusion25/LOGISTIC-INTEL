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

    const { data: summaryData, error } = await supabase
      .from('company_trend_summary')
      .select('*')
      .ilike('company_name', companyName.toLowerCase().trim())
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') {
        return NextResponse.json({ success: false, error: 'No trend data found for this company', company: companyName });
      }
      return NextResponse.json(
        { success: false, error: 'Failed to fetch summary data', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, summary: summaryData, company: companyName });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}