import { NextResponse } from 'next/server'
import { mockData } from '@/lib/supabase'

export async function GET() {
  try {
    const stats = mockData.getDashboardStats()
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}