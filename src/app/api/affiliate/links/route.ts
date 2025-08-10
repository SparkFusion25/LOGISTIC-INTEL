import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
export async function POST(req:Request){
  const s = supabaseServer();
  const { data:{user} } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  const body = await req.json();
  const code = (body.code||'').toLowerCase().replace(/[^a-z0-9-]/g,'');
  if(!code) return NextResponse.json({success:false,error:'code required'},{status:400});
  const { data:acc, error:e1 } = await s.from('affiliate_accounts').select('*').eq('user_id', user.id).maybeSingle();
  if(e1||!acc) return NextResponse.json({success:false,error:e1?.message||'affiliate account missing'},{status:400});
  const { data, error } = await s.from('affiliate_links').insert({ affiliate_id:acc.id, code, destination_url: body.destination_url||null }).select('*').single();
  if(error) return NextResponse.json({success:false,error:error.message},{status:400});
  return NextResponse.json({ success:true, link:data });
}