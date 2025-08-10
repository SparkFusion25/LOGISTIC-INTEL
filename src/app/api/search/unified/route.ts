import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = (searchParams.get('mode')||'all').toLowerCase();
  const company = searchParams.get('company')||'';
  const commodity = searchParams.get('commodity')||''; // maps to product_description
  const origin_country = searchParams.get('origin_country')||searchParams.get('originCountry')||'';
  const destination_country = searchParams.get('destination_country')||searchParams.get('destinationCountry')||'';
  const hs_code = searchParams.get('hs_code')||searchParams.get('hsCode')||'';
  const date_from = searchParams.get('date_from')||searchParams.get('startDate')||'';
  const date_to = searchParams.get('date_to')||searchParams.get('endDate')||'';
  const limit = Math.min(parseInt(searchParams.get('limit')||'50',10), 100);
  const offset = Math.max(parseInt(searchParams.get('offset')||'0',10), 0);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only
  if (!url || !key) return NextResponse.json({ success:false, error:'Missing Supabase env' }, { status:500 });
  const s = createClient(url, key);

  // Base filter for shipments
  let q = s.from('shipments').select('id, company_id, shipment_id, shipment_type, arrival_date, origin_country, destination_country, hs_code, product_description, weight_kg, port_of_loading, port_of_discharge, vessel_name, gross_weight_kg, value_usd')
    .order('arrival_date', { ascending:false });

  if (mode === 'ocean') q = q.eq('shipment_type', 'ocean');
  if (mode === 'air')   q = q.eq('shipment_type', 'air');

  if (company) q = q.ilike('product_description', `%${company}%`); // fallback when we only have shipments; we will map by company_id later
  if (commodity) q = q.ilike('product_description', `%${commodity}%`);
  if (origin_country) q = q.ilike('origin_country', `%${origin_country}%`);
  if (destination_country) q = q.ilike('destination_country', `%${destination_country}%`);
  if (hs_code) q = q.ilike('hs_code', `%${hs_code}%`);
  if (date_from) q = q.gte('arrival_date', date_from);
  if (date_to) q = q.lte('arrival_date', date_to);

  const { data: shipRows, error } = await q;
  if (error) return NextResponse.json({ success:false, error:error.message }, { status:500 });

  // Get related companies
  const companyIds = Array.from(new Set(shipRows.map(r=>r.company_id))).filter(Boolean);
  let companies: any[] = [];
  if (companyIds.length) {
    const { data: compRows, error: compErr } = await s
      .from('companies')
      .select('id, company_name, country')
      .in('id', companyIds);
    if (compErr) return NextResponse.json({ success:false, error:compErr.message }, { status:500 });
    companies = compRows||[];
  }

  // Filter by company name if requested
  const companyNameLC = (company||'').toLowerCase();
  const compMap = new Map(companies.map(c=>[c.id, c]));
  const shipsByCompany: Record<string, any[]> = {};
  for (const row of shipRows) {
    const comp = compMap.get(row.company_id);
    if (companyNameLC && comp && !comp.company_name.toLowerCase().includes(companyNameLC)) continue;
    if (!shipsByCompany[row.company_id]) shipsByCompany[row.company_id] = [];
    shipsByCompany[row.company_id].push(row);
  }

  // Build grouped response (limit companies + include up to 50 shipments each)
  const groups = Object.keys(shipsByCompany)
    .slice(offset, offset+limit)
    .map(cid => {
      const shipments = shipsByCompany[cid].slice(0, 50);
      const comp = compMap.get(cid);
      const totals = shipments.reduce((acc:any, s:any)=>{
        acc.total_shipments += 1;
        acc.total_value_usd += s.value_usd || 0;
        acc.total_weight_kg += s.gross_weight_kg || s.weight_kg || 0;
        acc.first_arrival = acc.first_arrival ? Math.min(acc.first_arrival, new Date(s.arrival_date).getTime()) : new Date(s.arrival_date).getTime();
        acc.last_arrival = acc.last_arrival ? Math.max(acc.last_arrival, new Date(s.arrival_date).getTime()) : new Date(s.arrival_date).getTime();
        return acc;
      }, { total_shipments:0, total_value_usd:0, total_weight_kg:0, first_arrival:0, last_arrival:0 });

      return {
        id: cid,
        unified_id: cid,
        unified_company_name: comp?.company_name || 'Unknown',
        shipment_mode: 'ocean',
        total_shipments: totals.total_shipments,
        total_weight_kg: totals.total_weight_kg,
        total_value_usd: totals.total_value_usd,
        first_arrival: new Date(totals.first_arrival||Date.now()).toISOString().slice(0,10),
        last_arrival: new Date(totals.last_arrival||Date.now()).toISOString().slice(0,10),
        confidence_score: 75,
        shipments: shipments.map(s=>({
          unified_id: s.id,
          bol_number: s.shipment_id,
          arrival_date: s.arrival_date,
          container_count: null,
          vessel_name: s.vessel_name,
          gross_weight_kg: s.gross_weight_kg || s.weight_kg,
          value_usd: s.value_usd || 0,
          shipper_name: null,
          consignee_name: null,
          port_of_loading: s.port_of_loading,
          port_of_discharge: s.port_of_discharge,
          goods_description: s.product_description,
          hs_code: s.hs_code,
          shipment_type: s.shipment_type,
          origin_country: s.origin_country,
          destination_city: null,
          destination_country: s.destination_country
        }))
      };
    });

  const summary = {
    total_records: shipRows.length,
    total_value_usd: shipRows.reduce((a:any,s:any)=>a+(s.value_usd||0),0),
    total_weight_kg: shipRows.reduce((a:any,s:any)=>a+(s.gross_weight_kg||s.weight_kg||0),0),
    average_shipment_value: shipRows.length? Math.round(shipRows.reduce((a:any,s:any)=>a+(s.value_usd||0),0)/shipRows.length):0,
    unique_companies: Object.keys(shipsByCompany).length,
    unique_carriers: 0,
    unique_commodities: 0,
    mode_breakdown: { air: shipRows.filter(r=>r.shipment_type==='air').length, ocean: shipRows.filter(r=>r.shipment_type==='ocean').length },
    value_per_kg: 0
  };

  return NextResponse.json({ success:true, data: groups, total: groups.length, summary, pagination: { hasMore: false } });
}