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

    if (!companyName) {
      return NextResponse.json(
        { success: false, error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Query the company_trend_summary view
    const { data: summaryData, error } = await supabase
      .from('company_trend_summary')
      .select('*')
      .ilike('company_name', companyName.toLowerCase().trim())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return NextResponse.json({
          success: false,
          error: 'No trend data found for this company',
          company: companyName
        });
      }
      
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch summary data', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      summary: summaryData,
      company: companyName
    });

  } catch (error) {
    console.error('Company trend summary API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}