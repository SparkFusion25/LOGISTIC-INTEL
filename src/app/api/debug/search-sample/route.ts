export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url || !key){
    return NextResponse.json({ ok:false, error:'Supabase env missing' }, { status:500 });
  }
  const db = createClient(url, key, { auth: { persistSession:false } });
  const sp = new URL(req.url).searchParams;
  const company = (sp.get('company')||'').trim();
  const mode = (sp.get('mode')||'all').trim();

  let q = db.from('shipments').select(`
    id, company_id, bol_number, arrival_date,
    origin_country, destination_country, hs_code, product_description,
    gross_weight_kg, transport_mode, vessel_name, airline,
    companies:company_id ( id, company_name )
  `, { count:'exact' }).order('arrival_date', { ascending:false }).limit(1);

  if(company) q = q.ilike('companies.company_name', `%${company}%`);
  if(mode !== 'all') q = q.eq('transport_mode', mode);

  const { data, error, count } = await q;
  const sample = (data||[]).map((r:any)=>{
    const score = (r.hs_code?1:0) + (r.gross_weight_kg?1:0) + (r.arrival_date?1:0);
    return {
      id: r.id,
      company: r.companies?.company_name || 'Unknown',
      transport_mode: r.transport_mode,
      arrival_date: r.arrival_date,
      destination_country: r.destination_country,
      hs_code: r.hs_code,
      gross_weight_kg: r.gross_weight_kg,
      derived_progress: Math.round((score/3)*100)
    };
  });

  return NextResponse.json({ ok: !error, error: error?.message ?? null, total: count ?? 0, sample });
}