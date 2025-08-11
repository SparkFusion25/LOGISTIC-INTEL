export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';

// Minimal, build-safe handler. No module-scope Supabase. No stray imports.
// If you want to run DB maintenance later, call a DB RPC from inside the handler.
export async function POST(_req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      // Return a clear message at runtime; this never runs at build-time
      return NextResponse.json({ ok:false, error:'Supabase env missing' }, { status: 500 });
    }
    // Intentionally no DB calls here. This endpoint is a stub to keep builds clean.
    // (We can wire an RPC call later when envs are set in the deployed environment.)
    return NextResponse.json({ ok:true, note:'fix-crm-schema stub executed' });
  } catch (e: any) {
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status: 500 });
  }
}