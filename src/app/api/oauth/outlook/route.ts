import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const OUTLOOK_CLIENT_ID = process.env.OUTLOOK_CLIENT_ID || process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID;
  if (!OUTLOOK_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Outlook Client ID not configured' },
      { status: 500 }
    );
  }
  const REDIRECT_URI = `${request.nextUrl.origin}/api/auth/outlook/callback`;
  const baseUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
  const params = new URLSearchParams({
    client_id: OUTLOOK_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read offline_access',
    response_mode: 'query'
  });
  const authUrl = `${baseUrl}?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}
