import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ success: true, connected: false, email: null, provider: null })
    }

    const { data: integration, error } = await supabase
      .from('email_integrations')
      .select('id, provider, email, access_token, refresh_token, expires_at')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (error || !integration) {
      return NextResponse.json({ success: true, connected: false, email: null, provider: null })
    }

    const connected = Boolean(integration.access_token)

    return NextResponse.json({
      success: true,
      connected,
      email: integration.email,
      provider: integration.provider,
      expires_at: integration.expires_at
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to check email status' }, { status: 500 })
  }
}