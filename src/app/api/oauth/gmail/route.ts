import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { google } from 'googleapis';

const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/gmail/callback';

export async function GET(request: NextRequest) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
    'openid'
  ];
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
  return NextResponse.redirect(url);
}

// Callback endpoint (separate route: /api/auth/gmail/callback/route.ts)
// Here’s the callback handler for the above OAuth:
