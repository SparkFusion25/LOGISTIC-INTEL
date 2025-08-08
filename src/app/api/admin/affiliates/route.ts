import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

async function admin(){ 
  const s = supabaseServer(); 
  const { data:{user} } = await s.auth.getUser(); 
  if(!user) return {ok:false, res:NextResponse.json({success:false,error:'Not authenticated'},{status:401})}; 
  const { data } = await s.rpc('is_admin',{p_uid:user.id}); 
  const val = Array.isArray(data)?data[0]:data; 
  if(!val) return {ok:false, res:NextResponse.json({success:false,error:'Forbidden'},{status:403})}; 
  return {ok:true, s};
}

export async function GET(){ 
  const a = await admin(); 
  if(!a.ok) return a.res; 
  const { data, error } = await a.s!.from('affiliate_accounts').select('*, affiliate_links(*), affiliate_payouts(*)').order('created_at',{ascending:false}); 
  if(error) return NextResponse.json({success:false,error:error.message},{status:400}); 
  return NextResponse.json({success:true, affiliates:data}); 
}

export async function POST(req:Request){ 
  const a = await admin(); 
  if(!a.ok) return a.res; 
  const body = await req.json(); 
  const { data, error } = await a.s!.from('affiliate_accounts').insert(body).select('*').single(); 
  if(error) return NextResponse.json({success:false,error:error.message},{status:400}); 
  return NextResponse.json({success:true, affiliate:data}); 
}

export async function PATCH(req:Request){ 
  const a = await admin(); 
  if(!a.ok) return a.res; 
  const body = await req.json(); 
  if(!body.id) return NextResponse.json({success:false,error:'id required'},{status:400}); 
  const { data, error } = await a.s!.from('affiliate_accounts').update(body).eq('id', body.id).select('*').single(); 
  if(error) return NextResponse.json({success:false,error:error.message},{status:400}); 
  return NextResponse.json({success:true, affiliate:data}); 
}