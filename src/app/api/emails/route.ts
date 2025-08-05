import { NextResponse } from 'next/server'
import { mockData } from '@/lib/supabase'

export async function GET() {
  try {
    const emails = mockData.getEmailActivity()
    
    return NextResponse.json(emails)
  } catch (error) {
    console.error('Emails fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email activity' },
      { status: 500 }
    )
  }
}