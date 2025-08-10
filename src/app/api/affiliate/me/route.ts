import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
export async function GET(){
  const s = supabaseServer();
  const { data:{user} } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  // ensure account exists
  const { data:acc } = await s.from('affiliate_accounts').select('*').eq('user_id', user.id).maybeSingle();
  let account = acc;
  if(!account){
    const { data, error } = await s.from('affiliate_accounts').insert({ user_id:user.id, status:'pending' }).select('*').single();
    if(error) return NextResponse.json({success:false,error:error.message},{status:400});
    account = data;
  }
  const { data:links } = await s.from('affiliate_links').select('*').eq('affiliate_id', account.id).order('created_at',{ascending:false});
  const { data:payouts } = await s.from('affiliate_payouts').select('*').eq('affiliate_id', account.id).order('period_start',{ascending:false});
  return NextResponse.json({ success:true, account, links:links||[], payouts:payouts||[] });
}