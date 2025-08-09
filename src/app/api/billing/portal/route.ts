import { NextResponse } from 'next/server';
import { stripe, SITE_URL } from '@/lib/stripe';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabaseServer } from '@/lib/supabase-server';
export const runtime='nodejs'; export const dynamic='force-dynamic';
export async function POST(){
  const s = supabaseServer();
  const { data:{ user } } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  const admin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await admin.from('billing_customers').select('*').eq('user_id', user.id).maybeSingle();
  if(!data?.stripe_customer_id) return NextResponse.json({success:false,error:'No Stripe customer'},{status:400});
  const portal = await stripe.billingPortal.sessions.create({ customer: data.stripe_customer_id, return_url: `${SITE_URL}/dashboard/settings` });
  return NextResponse.json({ success:true, url: portal.url });
}