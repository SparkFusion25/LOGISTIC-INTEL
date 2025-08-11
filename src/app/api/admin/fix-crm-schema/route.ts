export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint fixes CRM schema issues without requiring build-time envs.
// Client is created INSIDE the handler so build won't read env.
export async function POST(_req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ ok: false, error: 'Supabase env missing' }, { status: 500 });
    }
    const db = createClient(url, key, { auth: { persistSession: false } });

    // Example: relax email constraint to allow NULL, ensure indexes exist, etc.
    // You can add/adjust SQL here as needed; it runs at request-time only.
    const sql = `
      do $$ begin
        if exists (
          select 1 from pg_constraint
          where conname = 'crm_contacts_email_len_chk'
            and conrelid = 'public.crm_contacts'::regclass
        ) then
          alter table public.crm_contacts drop constraint crm_contacts_email_len_chk;
        end if;
      end $$;
      alter table public.crm_contacts
        add constraint crm_contacts_email_len_chk
        check (email is null or length(email) between 5 and 255);
      create unique index if not exists ux_crm_contacts_email_lower
        on public.crm_contacts (lower(email)) where email is not null;
    `;

    const { error: rpcErr } = await db.rpc('exec_sql', { sql });
    if (rpcErr) {
      // If exec_sql helper does not exist in DB, fall back to raw query via pg
      return NextResponse.json({ ok: false, error: rpcErr.message, note: 'Create RPC exec_sql or run SQL manually.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check current schema
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .limit(1);

    return NextResponse.json({
      success: true,
      message: 'CRM schema check',
      hasData: !!data?.length,
      error: error?.message || null
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check CRM schema',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}