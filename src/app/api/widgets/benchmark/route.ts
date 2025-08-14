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
  unified_value?: number | null;
  unified_weight?: number | null;
  unified_carrier?: string | null;
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
    if (error) {
      // @ts-expect-error supabase error code
      if (error.code === '42P01') {
        return NextResponse.json({ 
          success: true, 
          summary: { avg_value: 0, avg_weight: 0 }, 
          topCarriers: [] 
        });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const safeRows: Row[] = data ?? [];

    const toNums = (arr: Array<number | null | undefined>) =>
      arr.map((v) => (typeof v === 'number' ? v : Number(v ?? 0)) || 0);
    const avg = (arr: number[]) => (arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100 : 0);

    const avg_value = avg(toNums(safeRows.map((r) => r.unified_value)));
    const avg_weight = avg(toNums(safeRows.map((r) => r.unified_weight)));

    // Fixed type-safe reduce and sort
    const carrierCounts = safeRows.reduce<Record<string, number>>((map, r) => {
      const k = (r.unified_carrier ?? '').trim();
      if (!k) return map;
      map[k] = (map[k] ?? 0) + 1;
      return map;
    }, {});

    const topCarriers: Array<{ carrier: string; count: number }> = Object
      .entries(carrierCounts)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5)
      .map(([carrier, count]) => ({ carrier, count: count as number }));

    return NextResponse.json({
      success: true,
      summary: { avg_value, avg_weight },
      topCarriers,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
