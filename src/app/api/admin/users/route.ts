import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
async function assertAdmin(){
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  if(!user) return { ok:false, res: NextResponse.json({success:false,error:'Not authenticated'},{status:401}) };
  const { data } = await s.rpc('is_admin',{ p_uid:user.id });
  const val = Array.isArray(data)?data[0]:data; if(!val) return { ok:false, res: NextResponse.json({success:false,error:'Forbidden'},{status:403}) };
  return { ok:true, s };
}
export async function GET(){
  const g = await assertAdmin(); if(!g.ok) return g.res; const s = g.s!;
  const { data, error } = await s.from('user_profiles').select('*').order('created_at',{ascending:false});
  if(error) return NextResponse.json({success:false,error:error.message},{status:400});
  return NextResponse.json({ success:true, users:data });
}
export async function PATCH(req:Request){
  const g = await assertAdmin(); if(!g.ok) return g.res; const s=g.s!;
  const body = await req.json();
  const { id, role, plan, subscription_status } = body;
  if(!id) return NextResponse.json({success:false,error:'id required'},{status:400});
  const { data, error } = await s.from('user_profiles').update({ role, plan, subscription_status }).eq('id', id).select('*').single();
  if(error) return NextResponse.json({success:false,error:error.message},{status:400});
  return NextResponse.json({ success:true, user:data });
}