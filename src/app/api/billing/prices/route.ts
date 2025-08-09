import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
export const runtime='nodejs'; export const dynamic='force-dynamic';
export async function GET(){
  const prices = await stripe.prices.list({ active:true, expand:['data.product'], limit:100 });
  const out = prices.data.map(p=>({ id:p.id, unit_amount:p.unit_amount, currency:p.currency, interval:(p.recurring?.interval)||null, product:(typeof p.product==='string'?p.product:(p.product as any)?.name||'Unknown') }));
  return NextResponse.json({ success:true, prices: out });
}