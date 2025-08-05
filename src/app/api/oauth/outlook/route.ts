import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const OUTLOOK_CLIENT_ID = process.env.OUTLOOK_CLIENT_ID || process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID
    
    if (!OUTLOOK_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Outlook Client ID not configured' },
        { status: 500 }
      )
    }

    // Microsoft OAuth 2.0 authorization URL
    const baseUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
    const params = new URLSearchParams({
      client_id: OUTLOOK_CLIENT_ID,
      redirect_uri: `${request.nextUrl.origin}/api/oauth/outlook/callback`,
      response_type: 'code',
      scope: 'https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Mail.Read offline_access',
      response_mode: 'query'
    })

    const authUrl = `${baseUrl}?${params.toString()}`
    
    // Redirect to Microsoft OAuth
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Outlook OAuth error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Outlook OAuth' },
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
    console.log('Outlook tokens received:', { access_token: access_token?.slice(0, 10) + '...', refresh_token: refresh_token?.slice(0, 10) + '...' })

    return NextResponse.json({
      success: true,
      message: 'Outlook connected successfully',
      provider: 'outlook'
    })
  } catch (error) {
    console.error('Outlook token storage error:', error)
    return NextResponse.json(
      { error: 'Failed to store Outlook tokens' },
      { status: 500 }
    )
  }
}