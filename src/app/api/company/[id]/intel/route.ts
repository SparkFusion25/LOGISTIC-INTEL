import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // Minimal, build-safe payload so the drawer can render.
  // We will replace this with Supabase data after schema is finalized.
  const { id } = params;

  return NextResponse.json({
    ok: true,
    basic: {
      id,
      name: 'Unknown Company',
      country: null,
      website: null,
    },
    stats: {
      lastShipment: null,
      topLanes: [],
      hsChapters: [],
      modeMix: { ocean: 0, air: 0 },
    },
    recentShipments: [],
  });
}
