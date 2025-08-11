import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
export const runtime='nodejs'; export const dynamic='force-dynamic';
export async function GET(){
  const s = supabaseServer();
  const { data:{ user } } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  const admin = getSupabaseAdmin();
  const { data:me } = await admin.from('user_profiles').select('role').eq('id', user.id).maybeSingle();
  if(me?.role!=='admin') return NextResponse.json({success:false,error:'Forbidden'},{status:403});
  const { data:subs } = await admin.from('billing_subscriptions').select('user_id,stripe_subscription_id,plan,status,current_period_end');
  return NextResponse.json({ success:true, subscriptions: subs||[] });
}