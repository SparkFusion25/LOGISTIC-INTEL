import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
export const runtime='nodejs'; export const dynamic='force-dynamic';
export async function GET(){
  const s = supabaseServer();
  const { data:{ user } } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  const admin = supabaseAdmin;
  if (!admin) return NextResponse.json({ success:false, error:'Server not configured' },{status:500});
  const { data:me } = await admin.from('user_profiles').select('role').eq('id', user.id).maybeSingle();
  if(me?.role!=='admin') return NextResponse.json({success:false,error:'Forbidden'},{status:403});
  const { data:accounts } = await admin.from('affiliate_accounts').select('id,name,email,default_rate_percent,is_active,created_at');
  const { data:links } = await admin.from('affiliate_links').select('id,affiliate_id,code,landing_url,is_active');
  const { data:refs } = await admin.from('affiliate_referrals').select('*').order('created_at',{ascending:false});
  return NextResponse.json({ success:true, accounts:accounts||[], links:links||[], referrals:refs||[] });
}
export async function POST(req:Request){
  const s = supabaseServer();
  const { data:{ user } } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  const admin = supabaseAdmin;
  if (!admin) return NextResponse.json({ success:false, error:'Server not configured' },{status:500});
  const { data:me } = await admin.from('user_profiles').select('role').eq('id', user.id).maybeSingle();
  if(me?.role!=='admin') return NextResponse.json({success:false,error:'Forbidden'},{status:403});
  const body = await req.json();
  if(body.type==='account'){
    const { data, error } = await admin.from('affiliate_accounts').insert({ name:body.name, email:body.email, default_rate_percent: body.default_rate_percent||20 }).select('*').maybeSingle();
    if(error) return NextResponse.json({ success:false, error:error.message },{status:400});
    return NextResponse.json({ success:true, account:data });
  }
  if(body.type==='link'){
    const { data, error } = await admin.from('affiliate_links').insert({ affiliate_id: body.affiliate_id, code: body.code, landing_url: body.landing_url||null }).select('*').maybeSingle();
    if(error) return NextResponse.json({ success:false, error:error.message },{status:400});
    return NextResponse.json({ success:true, link:data });
  }
  return NextResponse.json({ success:false, error:'Unknown type' },{status:400});
}