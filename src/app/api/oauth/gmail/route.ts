import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    
    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Google Client ID not configured' },
        { status: 500 }
      )
    }

    // Gmail OAuth 2.0 authorization URL
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${request.nextUrl.origin}/api/oauth/gmail/callback`,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
      access_type: 'offline',
      prompt: 'consent'
    })

    const authUrl = `${baseUrl}?${params.toString()}`
    
    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Gmail OAuth error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Gmail OAuth' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { access_token, refresh_token } = body

    // Store tokens securely (in production, use encrypted storage)
    // For demo purposes, we'll just return success
    console.log('Gmail tokens received:', { access_token: access_token?.slice(0, 10) + '...', refresh_token: refresh_token?.slice(0, 10) + '...' })

    return NextResponse.json({
      success: true,
      message: 'Gmail connected successfully',
      provider: 'gmail'
    })
  } catch (error) {
    console.error('Gmail token storage error:', error)
    return NextResponse.json(
      { error: 'Failed to store Gmail tokens' },
      { status: 500 }
    )
  }
}