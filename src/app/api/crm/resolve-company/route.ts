import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
export const runtime='nodejs'; export const dynamic='force-dynamic';

function norm(t?:string|null){ return t? t.toLowerCase().trim().replace(/\s+/g,' ') : null; }

export async function POST(req: Request){
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ success:false, error:'Not authenticated' }, { status: 401 });
  const body = await req.json().catch(()=>({}));
  const company_name = body.company_name as string | undefined;
  if (!company_name || !company_name.trim()) return NextResponse.json({ success:false, error:'company_name required' }, { status: 400 });
  const country = body.country as string | undefined;
  const industry = body.industry as string | undefined;

  const nameN = norm(company_name);
  const countryN = norm(country||'');

  // Try find existing for this user (RLS scoped)
  const { data: existing } = await s.from('companies')
    .select('id, company_name, country')
    .eq('added_by_user', user.id)
    .ilike('company_name', company_name)
    .maybeSingle();

  if (existing?.id) return NextResponse.json({ success:true, company_id: existing.id, company: existing });

  // Insert new
  const insert = {
    company_name: company_name.trim(),
    country: country || null,
    industry: industry || null,
    added_by_user: user.id
  } as any;

  const { data, error } = await s.from('companies').insert(insert).select('id, company_name, country').single();
  if (error) return NextResponse.json({ success:false, error: error.message }, { status: 400 });
  return NextResponse.json({ success:true, company_id: data.id, company: data });
}