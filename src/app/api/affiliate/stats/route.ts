import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
export async function GET(){
  const s = supabaseServer();
  const { data:{user} } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  const { data:acc } = await s.from('affiliate_accounts').select('id').eq('user_id', user.id).maybeSingle();
  if(!acc) return NextResponse.json({success:false,error:'affiliate account not found'},{status:404});
  const { data:links } = await s.from('affiliate_links').select('id').eq('affiliate_id', acc.id);
  const linkIds = (links||[]).map(l=>l.id);
  if(linkIds.length===0) return NextResponse.json({success:true, clicks:0, referrals:0, revenue:0});
  const { data:clicks } = await s.from('affiliate_clicks').select('id', { count:'exact', head:true }).in('link_id', linkIds);
  const { data:refs } = await s.from('affiliate_referrals').select('commission_usd').in('link_id', linkIds);
  const revenue = (refs||[]).reduce((s,v)=> s + (Number(v.commission_usd)||0), 0);
  return NextResponse.json({ success:true, clicks:(clicks as any)?.length||0, referrals:(refs||[]).length, revenue });
}