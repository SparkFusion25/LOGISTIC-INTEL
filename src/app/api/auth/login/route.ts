import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/adminAuthMock'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Use the adminAuth service
    const { data, error } = await adminAuth.signIn(email, password)

    if (error) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (data.user) {
      // Check admin role
      const { isAdmin, error: roleError } = await adminAuth.checkAdminRole(data.user.id)
      
      if (roleError || !isAdmin) {
        await adminAuth.signOut()
        return NextResponse.json(
          { error: 'Access denied. Admin privileges required.' },
          { status: 403 }
        )
      }

      return NextResponse.json({
        user: data.user,
        message: 'Login successful'
      })
    }

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}