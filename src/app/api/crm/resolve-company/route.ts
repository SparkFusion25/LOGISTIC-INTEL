import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function norm(n: string){ return (n||'').toLowerCase().replace(/\s+/g,' ').trim(); }

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name')||'';
  if (!name) return NextResponse.json({ success:false, error:'name is required' }, { status:400 });

  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data, error } = await s.from('companies').select('id, company_name').ilike('company_name', `%${name}%`).limit(10);
  if (error) return NextResponse.json({ success:false, error:error.message }, { status:500 });
  // Best effort: exact (case-insensitive) first, else top result
  const exact = data.find(d => norm(d.company_name) === norm(name));
  const pick = exact || data[0];
  return NextResponse.json({ success: !!pick, company: pick || null });
}