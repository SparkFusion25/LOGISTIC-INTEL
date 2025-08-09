import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
function norm(t:string){ return t?.trim().toLowerCase().replace(/\s+/g,' ') || ''; }
export const runtime='nodejs'; export const dynamic='force-dynamic';
export async function POST(req:Request){
  const s = supabaseServer();
  const { data:{ user } } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  const { company_name, country } = await req.json();
  if(!company_name) return NextResponse.json({ success:false, error:'company_name required' },{status:400});
  const nname = norm(company_name); const ncountry = norm(country||'');
  const { data:existing } = await supabaseAdmin.from('companies')
    .select('id, company_name, country')
    .ilike('company_name', company_name)
    .limit(1);
  if(existing && existing[0]) return NextResponse.json({ success:true, company_id: existing[0].id, company: existing[0] });
  const insert = { id: crypto.randomUUID(), company_name, country: country||null, added_by_user: user.id };
  const { data:created, error } = await supabaseAdmin.from('companies').insert(insert).select('id, company_name, country').maybeSingle();
  if(error) return NextResponse.json({ success:false, error:error.message },{status:400});
  return NextResponse.json({ success:true, company_id: created!.id, company: created });
}