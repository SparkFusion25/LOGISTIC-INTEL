import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

type Payload = {
  origin_country?: string;
  destination_country?: string;
  hs_code?: string;
  mode?: 'air' | 'ocean' | 'all';
  time_range?: '12m' | '6m' | '3m';
};

type Row = {
  unified_value: number | null;
  unified_weight: number | null;
  unified_carrier: string | null;
  hs_code?: string | null;
  origin_country?: string | null;
  destination_country?: string | null;
  mode?: string | null;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<Payload>;
  const origin = String(body.origin_country ?? '');
  const destination = String(body.destination_country ?? '');
  const hsCode = body.hs_code ? String(body.hs_code) : undefined;
  const mode = body.mode && body.mode !== 'all' ? String(body.mode) : undefined;

  try {
    const db = supabaseServer();

    // Build query
    let q = db
      .from('unified_shipments')
      .select('unified_value, unified_weight, unified_carrier, hs_code, origin_country, destination_country, mode');

    if (origin) q = q.eq('origin_country', origin);
    if (destination) q = q.eq('destination_country', destination);
    if (hsCode) q = q.ilike('hs_code', `${hsCode}%`);
    if (mode) q = q.eq('mode', mode);

    const { data, error } = await q.limit(5000);

    // If the table/view doesn't exist yet, return an empty/harmless payload
    // (Vercel previously showed 42P01 on some routes)
    if (error) {
      // @ts-expect-error supabase error code
      if (error.code === '42P01') {
        return NextResponse.json({ success: true, avg_value: 0, avg_weight: 0, top_carriers: [] });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const rows = (data ?? []) as Row[];

    const toNums = (arr: Array<number | null | undefined>) =>
      arr.map((v) => (typeof v === 'number' ? v : Number(v ?? 0)) || 0);
    const avg = (arr: number[]) => (arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100 : 0);

    const avg_value = avg(toNums(rows.map((r) => r.unified_value)));
    const avg_weight = avg(toNums(rows.map((r) => r.unified_weight)));

    const carrierCounts = rows.reduce<Record<string, number>>((m, r) => {
      const key = (r.unified_carrier ?? 'Unknown') as string;
      m[key] = (m[key] ?? 0) + 1;
      return m;
    }, {});

    const top_carriers = Object.entries(carrierCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([carrier, count]) => ({ carrier, count }));

    return NextResponse.json({ success: true, avg_value, avg_weight, top_carriers });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
