import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
export const runtime='nodejs'; export const dynamic='force-dynamic';
export async function GET(){
  const s = supabaseServer();
  const { data:{ user } } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  const { data:profile } = await s.from('user_profiles').select('plan,subscription_status,company,full_name,avatar_url,company_logo_url,email_signature_html').eq('id', user.id).maybeSingle();
  return NextResponse.json({ success:true, user:{ id:user.id, email:user.email }, profile });
}