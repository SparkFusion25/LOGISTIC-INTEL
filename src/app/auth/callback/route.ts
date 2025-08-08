import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect('/login');

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) return NextResponse.redirect('/email-hub?error=oauth_no_code');

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/gmail/callback'
  );
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  // Get email
  const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });
  const { data } = await oauth2.userinfo.get();
  const email = data.email;

  // Save to Supabase
  await supabase.from('user_tokens').upsert({
    user_id: user.id,
    provider: 'gmail',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    email,
    scopes: tokens.scope?.split(' ') || [],
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id,provider' });

  return NextResponse.redirect('/email-hub?connected=gmail');
}
