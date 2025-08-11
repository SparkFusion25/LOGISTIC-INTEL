export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasEnv = Boolean(url && key);
  let ping: any = {};
  try{
    if(hasEnv){
      const db = createClient(url!, key!, { auth: { persistSession:false } });
      const c1 = await db.from('companies').select('id', { head:true, count:'exact' });
      const c2 = await db.from('shipments').select('id', { head:true, count:'exact' });
      ping = { companies: c1.count ?? null, shipments: c2.count ?? null, errors: { companies: c1.error?.message ?? null, shipments: c2.error?.message ?? null } };
    }
  }catch(e:any){ ping = { error: String(e?.message||e) } }
  return NextResponse.json({ ok:true, env: { hasUrl: !!url, hasServiceKey: !!key }, ping });
}