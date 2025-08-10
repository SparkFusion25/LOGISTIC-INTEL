import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
export const runtime='nodejs'; export const dynamic='force-dynamic';
export async function GET(){
  const s = supabaseServer();
  const { data:{ user } } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  const { data } = await s.from('user_profiles').select('*').eq('id', user.id).maybeSingle();
  return NextResponse.json({ success:true, profile:data });
}
export async function PATCH(req:Request){
  const s = supabaseServer();
  const { data:{ user } } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  const body = await req.json();
  const patch:any = {};
  ['full_name','company','company_domain','avatar_url','company_logo_url','email_signature_html'].forEach(k=>{ if(body[k]!==undefined) patch[k]=body[k]; });
  const { data, error } = await s.from('user_profiles').update(patch).eq('id', user.id).select('*').maybeSingle();
  if(error) return NextResponse.json({ success:false, error:error.message },{status:400});
  return NextResponse.json({ success:true, profile:data });
}