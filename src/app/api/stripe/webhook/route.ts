import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
export const runtime='nodejs'; export const dynamic='force-dynamic';

const admin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function upsertCustomer(userId:string, stripeCustomerId:string){
  await admin.from('billing_customers').upsert({ user_id:userId, stripe_customer_id:stripeCustomerId });
}
async function upsertSub(userId:string, sub:any){
  const plan = (sub.items?.data?.[0]?.price?.nickname || sub.items?.data?.[0]?.price?.id || '').toString().toLowerCase().includes('pro') ? 'pro' : 'starter';
  const row = {
    user_id:userId,
    stripe_subscription_id: sub.id,
    price_id: sub.items?.data?.[0]?.price?.id || null,
    plan,
    status: sub.status,
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    cancel_at_period_end: !!sub.cancel_at_period_end
  };
  await admin.from('billing_subscriptions').upsert(row, { onConflict:'stripe_subscription_id' });
  await admin.rpc('apply_plan', { p_user: userId, p_plan: (row.status==='active'||row.status==='trialing')? (plan as any): 'starter', p_status: row.status });
}
async function addInvoice(userId:string, invoice:any){
  await admin.from('billing_invoices').upsert({
    user_id:userId,
    stripe_invoice_id: invoice.id,
    stripe_subscription_id: invoice.subscription || null,
    amount_due: (invoice.amount_due||0)/100,
    amount_paid: (invoice.amount_paid||0)/100,
    currency: invoice.currency,
    status: invoice.status
  }, { onConflict:'stripe_invoice_id' });
}
async function attributeAffiliate(meta:any, stripeCustomerId:string, subId?:string, amountUsd?:number){
  const aff = (meta?.aff_code||'').toLowerCase();
  if(!aff) return;
  const { data:link } = await admin.from('affiliate_links').select('id, affiliate_id').eq('code', aff).maybeSingle();
  if(!link) return;
  const { data:acc } = await admin.from('affiliate_accounts').select('default_rate_percent').eq('id', link.affiliate_id).maybeSingle();
  const rate = Number(acc?.default_rate_percent||20);
  const commission = amountUsd ? (amountUsd * rate / 100) : null;
  await admin.from('affiliate_referrals').insert({ link_id: link.id, referred_user: null, plan: null, status: 'converted', amount_usd: amountUsd||null, commission_usd: commission||null, stripe_customer_id: stripeCustomerId, stripe_subscription_id: subId||null, promotion_code: (meta?.promo_code||null) });
}
async function recordPromo(meta:any){
  const code = (meta?.promo_code||'').toLowerCase();
  if(!code) return;
  const { data:pc } = await admin.from('promo_codes').select('id, max_redemptions, redemptions_used, active, valid_from, valid_to').eq('code', code).maybeSingle();
  if(!pc) return;
  const now = new Date();
  const active = pc.active && (!pc.valid_from || now >= new Date(pc.valid_from)) && (!pc.valid_to || now <= new Date(pc.valid_to)) && (!pc.max_redemptions || (pc.redemptions_used||0) < pc.max_redemptions);
  if(!active) return;
  await admin.from('promo_codes').update({ redemptions_used: (pc.redemptions_used||0)+1 }).eq('id', pc.id);
}

export async function POST(req:Request){
  const sig = req.headers.get('stripe-signature');
  if(!sig) return NextResponse.json({error:'missing signature'},{status:400});
  const text = await req.text();
  let event:any;
  try{ event = stripe.webhooks.constructEvent(text, sig, process.env.STRIPE_WEBHOOK_SECRET!); }
  catch(err:any){ return NextResponse.json({error:`Webhook Error: ${err.message}`},{status:400}); }

  try{
    switch(event.type){
      case 'checkout.session.completed': {
        const session:any = event.data.object;
        const customerId = session.customer as string;
        const userId = (session.metadata?.user_id)||null;
        if(userId) await upsertCustomer(userId, customerId);
        if(session.mode==='subscription' && session.subscription){
          const sub = await stripe.subscriptions.retrieve(session.subscription as string, { expand:['items.data.price'] });
          if(userId) await upsertSub(userId, sub);
        }
        await recordPromo(session.metadata||{});
        await attributeAffiliate(session.metadata||{}, customerId, (session.subscription as string)||undefined, session.amount_total ? session.amount_total/100 : undefined);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice:any = event.data.object;
        const customerId = invoice.customer as string;
        // find user by billing_customers
        const { data:bc } = await admin.from('billing_customers').select('user_id').eq('stripe_customer_id', customerId).maybeSingle();
        if(bc?.user_id){ await addInvoice(bc.user_id, invoice); }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub:any = event.data.object;
        const customerId = sub.customer as string;
        const { data:bc } = await admin.from('billing_customers').select('user_id').eq('stripe_customer_id', customerId).maybeSingle();
        if(bc?.user_id) await upsertSub(bc.user_id, sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub:any = event.data.object;
        const customerId = sub.customer as string;
        const { data:bc } = await admin.from('billing_customers').select('user_id').eq('stripe_customer_id', customerId).maybeSingle();
        if(bc?.user_id){
          await upsertSub(bc.user_id, sub);
          await admin.rpc('apply_plan', { p_user: bc.user_id, p_plan: 'starter', p_status: sub.status });
        }
        break;
      }
      default:
        break;
    }
  }catch(e:any){
    return NextResponse.json({ ok:false, error:e.message, handled:event.type }, { status:500 });
  }

  return NextResponse.json({ received:true });
}