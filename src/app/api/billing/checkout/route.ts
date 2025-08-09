import { NextResponse } from 'next/server';
import { stripe, SITE_URL } from '@/lib/stripe';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabaseServer } from '@/lib/supabase-server';
export const runtime='nodejs'; export const dynamic='force-dynamic';

async function ensureCustomer(userId:string, email:string){
  const admin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data:bc } = await admin.from('billing_customers').select('*').eq('user_id', userId).maybeSingle();
  if(bc?.stripe_customer_id) return bc.stripe_customer_id;
  const cust = await stripe.customers.create({ email });
  await admin.from('billing_customers').upsert({ user_id:userId, stripe_customer_id:cust.id });
  return cust.id;
}

async function ensurePromotionCode(code:string){
  try{
    const promo = await stripe.promotionCodes.list({ code, active:true, limit:1 });
    if(promo.data[0]) return { promotion_code: promo.data[0].id };
  }catch{}
  return {} as any;
}

export async function POST(req:Request){
  const s = supabaseServer();
  const { data:{ user } } = await s.auth.getUser();
  if(!user) return NextResponse.json({success:false,error:'Not authenticated'},{status:401});
  const body = await req.json().catch(()=>({}));
  const { priceId, mode='subscription', aff_code, promo_code, successUrl, cancelUrl } = body;
  if(!priceId) return NextResponse.json({success:false,error:'priceId required'},{status:400});
  const customer = await ensureCustomer(user.id, user.email!);
  const discounts = promo_code ? [await ensurePromotionCode(promo_code)].filter(Boolean) : undefined;
  const session = await stripe.checkout.sessions.create({
    mode,
    customer,
    line_items:[{ price: priceId, quantity:1 }],
    allow_promotion_codes:true,
    discounts,
    client_reference_id: user.id,
    success_url: successUrl || `${SITE_URL}/dashboard?status=success`,
    cancel_url: cancelUrl || `${SITE_URL}/pricing`,
    metadata: { user_id:user.id, aff_code: aff_code||'', promo_code: promo_code||'' }
  });
  return NextResponse.json({ success:true, url: session.url });
}