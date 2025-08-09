import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
export const runtime='nodejs'; export const dynamic='force-dynamic';
export async function POST(req:Request){
  const s = supabaseServer();
  const { data:{ user } } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  const body = await req.json();
  const company_name = body.company_name?.trim();
  if(!company_name) return NextResponse.json({ success:false, error:'company_name is required' },{status:400});
  // resolve company
  const res = await fetch(new URL('/api/crm/resolve-company', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').toString(), { method:'POST', headers:{ 'Content-Type':'application/json', cookie:''+ (global as any) }, body: JSON.stringify({ company_name, country: body.country||null }) }).catch(()=>null);
  let company_id: string | null = null;
  try{ const j = res ? await res.json() : null; company_id = j?.company_id || null; }catch{}
  if(!company_id){
    const { data:ex } = await supabaseAdmin.from('companies').select('id').ilike('company_name', company_name).maybeSingle();
    company_id = ex?.id || null;
  }
  if(!company_id) return NextResponse.json({ success:false, error:'Failed to resolve company' },{status:400});
  const insert = {
    company_id,
    full_name: body.contact_name || body.full_name || null,
    email: body.email || null,
    phone: body.phone || null,
    title: body.title || null,
    added_by_user: user.id
  };
  // unique guard: one email per user per company
  const { data:exists } = await supabaseAdmin.from('crm_contacts').select('id').eq('company_id', company_id).eq('added_by_user', user.id).eq('email', insert.email).maybeSingle();
  if(exists) return NextResponse.json({ success:false, error:'Contact already exists in CRM' },{status:409});
  const { data, error } = await supabaseAdmin.from('crm_contacts').insert(insert).select('id').maybeSingle();
  if(error) return NextResponse.json({ success:false, error:error.message },{status:400});
  return NextResponse.json({ success:true, contact:{ id:data!.id } });
}
