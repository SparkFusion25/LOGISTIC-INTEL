import { NextResponse } from 'next/server';

const COOKIE = 'crm_companies';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id?.trim();
  if (!id) {
    return NextResponse.json({ ok: false, error: 'missing id' }, { status: 400 });
  }

  const cookieHeader = (req.headers.get('cookie') ?? '').split(';').map(s => s.trim());
  const existing = cookieHeader.find(c => c.startsWith(`${COOKIE}=`))?.split('=')[1] ?? '';
  const set = new Set((existing ? decodeURIComponent(existing) : '').split(',').filter(Boolean));
  set.add(id);
  const value = Array.from(set).join(',');

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
