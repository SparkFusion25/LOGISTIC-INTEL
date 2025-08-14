import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
export const runtime='nodejs'; export const dynamic='force-dynamic';
export async function GET(){
  const s = supabaseServer();
  const { data:{ user } } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  const admin = supabaseAdmin;
  const { data:me } = await admin.from('user_profiles').select('role').eq('id', user.id).maybeSingle();
  if(me?.role!=='admin') return NextResponse.json({success:false,error:'Forbidden'},{status:403});
  const { data } = await admin.from('user_profiles').select('id,email,full_name,company,plan,subscription_status,created_at');
  return NextResponse.json({ success:true, users:data||[] });
}