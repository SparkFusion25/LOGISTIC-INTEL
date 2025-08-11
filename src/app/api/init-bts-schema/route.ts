export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ success:false, error:'Supabase env missing' }, { status:500 });
    const supabase = createClient(url, key, { auth: { persistSession:false } });

    const results: any[] = [];

    try {
      const { error: tableError } = await supabase.rpc('exec_sql', { sql: `
        CREATE TABLE IF NOT EXISTS t100_air_segments (
          id SERIAL PRIMARY KEY,
          origin_airport TEXT NOT NULL,
          dest_airport TEXT NOT NULL,
          carrier TEXT NOT NULL,
          freight_kg FLOAT DEFAULT 0,
          mail_kg FLOAT DEFAULT 0,
          month INT NOT NULL,
          year INT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_t100_origin_dest ON t100_air_segments(origin_airport, dest_airport);
        CREATE INDEX IF NOT EXISTS idx_t100_carrier ON t100_air_segments(carrier);
        CREATE INDEX IF NOT EXISTS idx_t100_date ON t100_air_segments(year, month);
        CREATE INDEX IF NOT EXISTS idx_t100_freight ON t100_air_segments(freight_kg DESC);
        ALTER TABLE t100_air_segments ADD CONSTRAINT IF NOT EXISTS check_valid_month CHECK (month >= 1 AND month <= 12);
      ` });
      if (tableError) results.push({ step: 't100_air_segments table', status: 'error', error: tableError.message }); else results.push({ step: 't100_air_segments table', status: 'success' });
    } catch (error) { results.push({ step: 't100_air_segments table', status: 'error', error: (error as Error).message }); }

    return NextResponse.json({ success: true, details: results });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to initialize BTS schema', details: (error as Error).message }, { status: 500 });
  }
}