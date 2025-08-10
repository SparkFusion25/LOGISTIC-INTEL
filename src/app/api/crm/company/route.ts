import { NextResponse } from 'next/server';

type CookieShape = string; // comma-separated company IDs, e.g. "id1,id2"

const COOKIE = 'crm_companies';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = String(body?.company_id ?? '').trim();
  if (!id) {
    return NextResponse.json({ ok: false, error: 'company_id required' }, { status: 400 });
  }

  // read current cookie
  const url = new URL(req.url);
  const cookieHeader = (req.headers.get('cookie') ?? '').split(';').map(s => s.trim());
  const existing = cookieHeader.find(c => c.startsWith(`${COOKIE}=`))?.split('=')[1] ?? '';
  const set = new Set((existing ? decodeURIComponent(existing) : '').split(',').filter(Boolean));
  set.add(id);
  const value: CookieShape = Array.from(set).join(',');

  const res = NextResponse.json({ ok: true, added: id });
  res.cookies.set(COOKIE, encodeURIComponent(value), {
    maxAge: MAX_AGE,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
  });
  return res;
}
