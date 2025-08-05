import { NextResponse } from 'next/server'
import { mockData } from '@/lib/supabase'

export async function GET() {
  try {
    const feedback = mockData.getFeedback()
    
    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Feedback fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}