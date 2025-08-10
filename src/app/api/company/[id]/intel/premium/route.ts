import { NextResponse, NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const COOKIE = 'crm_companies';

function hasDemoFlag(req: NextRequest) {
  const url = new URL(req.url);
  return url.searchParams.get('demo') === '1' || req.headers.get('x-demo-premium') === '1';
}

function isInCrm(req: NextRequest, companyId: string) {
  const raw = req.cookies.get(COOKIE)?.value ?? '';
  let decoded = raw;
  try { decoded = decodeURIComponent(raw); } catch {}
  const list = decoded.split(',').filter(Boolean);
  return list.includes(companyId);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!hasDemoFlag(req) && !isInCrm(req, id)) {
    const res = NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  const res = NextResponse.json({
    ok: true,
    data: {
      contacts: [
        { full_name: 'Alex Martinez', title: 'Logistics Manager', email: 'alex@example.com', phone: '+1-555-0100' },
        { full_name: 'Priya Shah', title: 'Supply Chain Director', email: 'priya@example.com', phone: '+1-555-0101' }
      ],
      heatScore: 72,
      reasons: ['Rising import cadence', 'Recent carrier switch', 'HS 0802 tariff watch'],
      trend: [
        { month: '2024-09', shipments: 8 }, { month: '2024-10', shipments: 11 },
        { month: '2024-11', shipments: 9 }, { month: '2024-12', shipments: 13 },
        { month: '2025-01', shipments: 12 }, { month: '2025-02', shipments: 14 }
      ],
      triggers: [
        { type: 'carrier_change', detail: 'Switched to Evergreen on 3 lanes' },
        { type: 'volume_spike', detail: '+28% MoM in Oct' }
      ],
      tariff: {
        exposure: 'medium',
        hs_chapters: ['08', '20'],
        notes: 'Monitor Section 301 updates for nuts & processed foods'
      },
      basic: { id, name: 'Unknown Company' }
    }
  });
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
