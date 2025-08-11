import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
export const runtime='nodejs'; export const dynamic='force-dynamic';
export async function GET(){
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  const admin = getSupabaseAdmin();
  const { data:me } = await admin.from('user_profiles').select('role').eq('id', user.id).maybeSingle();
  if(!me || me.role!=='admin') return NextResponse.json({success:false,error:'Forbidden'},{status:403});
  const { data, error } = await admin.from('promo_codes').select('*').order('created_at',{ascending:false});
  if(error) return NextResponse.json({success:false,error:error.message},{status:400});
  return NextResponse.json({ success:true, codes: data||[] });
}
export async function POST(req:Request){
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  const admin = getSupabaseAdmin();
  const { data:me } = await admin.from('user_profiles').select('role').eq('id', user.id).maybeSingle();
  if(!me || me.role!=='admin') return NextResponse.json({success:false,error:'Forbidden'},{status:403});
  const body = await req.json();
  const { data, error } = await admin.from('promo_codes').insert(body).select('*').maybeSingle();
  if(error) return NextResponse.json({ success:false, error:error.message },{status:400});
  return NextResponse.json({ success:true, code:data });
}