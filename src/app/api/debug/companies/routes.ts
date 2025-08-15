import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    
    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, environment: { SUPABASE_URL: 'MISSING', SERVICE_KEY: 'MISSING' }, database: { total_companies: 0, companies_sample: [], connection_status: 'SKIPPED' } });
    }

    const { data: companies, error, count } = await supabaseAdmin
      .from('companies')
      .select('*', { count: 'exact' })
      .limit(10);
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        success: false,
        error: error.message, 
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint
      });
    }
    
    console.log('Companies found:', companies?.length);
    
    // Test 2: Environment variables
    const envCheck = {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'
    };
    
    return NextResponse.json({ 
      success: true,
      environment: envCheck,
      database: {
        total_companies: count || 0,
        companies_sample: companies || [],
        connection_status: 'SUCCESS'
      },
      message: `Found ${companies?.length || 0} companies in database`
    });
    
  } catch (e: any) {
    console.error('Debug endpoint error:', e);
    return NextResponse.json({ 
      success: false,
      error: e.message, 
      stack: e.stack,
      type: 'FATAL_ERROR'
    });
  }
}
