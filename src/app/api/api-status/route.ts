import { NextResponse } from 'next/server'
import { mockData } from '@/lib/supabase'

export async function GET() {
  try {
    const apiEndpoints = mockData.getAPIEndpoints()
    
    return NextResponse.json(apiEndpoints)
  } catch (error) {
    console.error('API status fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API status' },
      { status: 500 }
    )
  }
}