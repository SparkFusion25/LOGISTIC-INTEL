import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/supabase'

export async function POST() {
  try {
    await adminAuth.signOut()
    
    return NextResponse.json({
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}