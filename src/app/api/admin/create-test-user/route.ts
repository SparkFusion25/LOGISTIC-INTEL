import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Create the admin test user
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'info@getb3acon.com',
      password: '7354',
      email_confirm: true, // Skip email verification
      user_metadata: {
        full_name: 'Admin Test User',
        first_name: 'Admin',
        last_name: 'User',
        company: 'LogisticIntel',
        plan: 'enterprise',
        role: 'admin'
      }
    })

    if (error) {
      console.error('Error creating admin user:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully',
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    })

  } catch (error: any) {
    console.error('Admin user creation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create admin user'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to create admin test user',
    endpoint: '/api/admin/create-test-user',
    method: 'POST'
  })
}