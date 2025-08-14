import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const sb = supabaseAdmin;
    
    // Test basic connection
    const { data: companies, error } = await sb.from('companies').select('*').limit(5);
    
    if (error) {
      return NextResponse.json({ error: error.message, code: error.code });
    }
    
    return NextResponse.json({ 
      success: true, 
      count: companies?.length || 0,
      companies: companies || [],
      message: 'Database connected successfully'
    });
  } catch (e: any) {
    return NextResponse.json({ 
      error: e.message, 
      stack: e.stack,
      message: 'Database connection failed'
    });
  }
}