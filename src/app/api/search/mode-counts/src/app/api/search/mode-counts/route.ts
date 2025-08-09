import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // route runs server-side
  );

  // If you prefer RLS-aware counts per user, use an anon key and set auth on the request
  const { data, error } = await supabase
    .from('shipments')
    .select('shipment_type')
    .returns<{ shipment_type: 'ocean' | 'air' }[]>();

  if (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }

  const counts = data.reduce((acc: Record<string, number>, r) => {
    acc[r.shipment_type] = (acc[r.shipment_type] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    success: true,
    data: [
      { shipment_type: 'ocean', count: counts.ocean || 0 },
      { shipment_type: 'air', count: counts.air || 0 }
    ]
  });
}
