import { NextResponse } from 'next/server';

const COOKIE = 'crm_companies';

function getCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.get('cookie') ?? '';
  const parts = cookieHeader.split(';').map(s => s.trim());
  const hit = parts.find(p => p.startsWith(`${name}=`));
  if (!hit) return null;
  const raw = hit.split('=')[1] ?? '';
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  const hasDemo = url.searchParams.get('demo') === '1' || req.headers.get('x-demo-premium') === '1';

  // Unlock if cookie shows this company is “in CRM”
  const list = (getCookie(req, COOKIE) ?? '').split(',').filter(Boolean);
  const isInCRM = list.includes(params.id);

  if (!hasDemo && !isInCRM) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const { id } = params;

  return NextResponse.json({
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
}
