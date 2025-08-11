export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(){
  try{
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if(!url || !key) return NextResponse.json({ ok:false, error:'Supabase env missing' }, { status:500 });
    const db = createClient(url, key, { auth: { persistSession:false } });
    const { error } = await db.rpc('merge_contacts_from_staging', {});
    if(error) return NextResponse.json({ ok:false, error:error.message }, { status:400 });
    return NextResponse.json({ ok:true });
  }catch(e:any){
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status:500 });
  }
}