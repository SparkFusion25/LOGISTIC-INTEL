import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect('/login');

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) return NextResponse.redirect('/email-hub?error=oauth_no_code');

  // Exchange code for token
  const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      redirect_uri: (process.env.NEXT_PUBLIC_BASE_URL || '') + '/api/auth/outlook/callback',
      code,
      grant_type: 'authorization_code'
    }).toString()
  });
  const tokens = await tokenRes.json();

  // Fetch user email
  const profileRes = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  });
  const profile = await profileRes.json();
  const email = profile.mail || profile.userPrincipalName;

  // Save to Supabase
  await supabase.from('user_tokens').upsert({
    user_id: user.id,
    provider: 'outlook',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
    email,
    scopes: tokens.scope?.split(' ') || [],
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id,provider' });

  return NextResponse.redirect('/email-hub?connected=outlook');
}
