import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
export const runtime='nodejs'; export const dynamic='force-dynamic';

export async function GET(){
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  const { data } = await s.from('user_profiles').select('*').eq('id', user.id).maybeSingle();
  return NextResponse.json({ success:true, profile: data||null });
}

export async function PUT(req: Request){
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  const body = await req.json().catch(()=>({}));
  const patch: any = {};
  ['full_name','company','sender_name','sender_email','signature_html','signature_plain','avatar_url','company_logo_url'].forEach(k=>{ if(body[k]!==undefined) patch[k]=body[k]; });
  const { data, error } = await s.from('user_profiles').upsert({ id:user.id, email:user.email, ...patch }, { onConflict:'id' }).select('*').single();
  if(error) return NextResponse.json({ success:false, error:error.message }, { status:400 });
  return NextResponse.json({ success:true, profile:data });
}