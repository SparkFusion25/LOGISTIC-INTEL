import { NextResponse } from 'next/server'
import { mockData } from '@/lib/mockData'

export async function GET() {
  try {
    const campaigns = mockData.getCampaigns()
    
    return NextResponse.json(campaigns)
  } catch (error) {
    console.error('Campaigns fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}