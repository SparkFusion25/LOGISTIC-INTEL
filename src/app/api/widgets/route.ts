import { NextResponse } from 'next/server'
import { mockData } from '@/lib/mockData'

export async function GET() {
  try {
    const widgets = mockData.getWidgets()
    
    return NextResponse.json(widgets)
  } catch (error) {
    console.error('Widgets fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch widgets' },
      { status: 500 }
    )
  }
}