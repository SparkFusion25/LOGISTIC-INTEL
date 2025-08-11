import { NextRequest, NextResponse } from 'next/server'
import { mockData } from '@/lib/mockData'

export async function GET() {
  try {
    const users = mockData.getUsers()
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    // Simulate creating a new user
    const newUser = {
      id: `user_${Date.now()}`,
      email: userData.email,
      company: userData.company,
      role: userData.role || 'trial',
      signup_date: new Date().toISOString(),
      last_login: new Date().toISOString(),
      active_widgets: [],
      plan_status: 'active',
      usage_count: 0
    }
    
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}