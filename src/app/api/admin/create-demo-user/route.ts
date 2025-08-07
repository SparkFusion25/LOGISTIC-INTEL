import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Create the demo user
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'user@demo.com',
      password: 'demo123',
      email_confirm: true, // Skip email verification
      user_metadata: {
        full_name: 'Demo User',
        first_name: 'Demo',
        last_name: 'User',
        company: 'Demo Company',
        plan: 'free',
        role: 'user'
      }
    })

    if (error) {
      console.error('Error creating demo user:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Demo user created successfully',
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    })

  } catch (error: any) {
    console.error('Demo user creation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create demo user'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to create demo user',
    endpoint: '/api/admin/create-demo-user',
    method: 'POST'
  })
}