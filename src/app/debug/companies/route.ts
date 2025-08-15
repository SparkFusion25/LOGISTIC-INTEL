import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, message: 'Supabase not configured in this env' });
    }
    const sb = supabaseAdmin;
    
    const { data: companies, error } = await sb.from('companies').select('*').limit(5);
    
    if (error) {
      return NextResponse.json({ error: error.message, code: (error as any).code });
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