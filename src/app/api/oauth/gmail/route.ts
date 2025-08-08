import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL + '/api/oauth/gmail/callback';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Generate OAuth URL manually without googleapis dependency
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/gmail.send openid email',
      access_type: 'offline',
      prompt: 'consent',
      state: user.id // Include user ID in state for security
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    return NextResponse.redirect(authUrl);

  } catch (error) {
    console.error('Gmail OAuth initiation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate Gmail OAuth' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { code, state } = await request.json();

    // Verify state matches user ID for security
    if (state !== user.id) {
      return NextResponse.json({ success: false, error: 'Invalid state parameter' }, { status: 400 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Store tokens in user_tokens table
    const { error: dbError } = await supabase
      .from('user_tokens')
      .upsert({
        user_id: user.id,
        provider: 'gmail',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Database error storing tokens:', dbError);
      throw new Error('Failed to store tokens');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Gmail connected successfully' 
    });

  } catch (error) {
    console.error('Gmail OAuth token exchange error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete Gmail OAuth' },
      { status: 500 }
    );
  }
}
