import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only
  if (!url || !key) return NextResponse.json({ success:false, error:'Missing Supabase env' }, { status:500 });
  const s = createClient(url, key);
  const { data, error } = await s.from('shipments').select('shipment_type');
  if (error) return NextResponse.json({ success:false, error:error.message }, { status:500 });
  const counts = data.reduce((acc:Record<string,number>, r:any)=>{ acc[r.shipment_type] = (acc[r.shipment_type]||0)+1; return acc; }, {});
  return NextResponse.json({ success:true, data:[ { shipment_type:'ocean', count:counts.ocean||0 }, { shipment_type:'air', count:counts.air||0 } ] });
}