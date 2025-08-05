import { NextRequest, NextResponse } from 'next/server'

interface CRMLead {
  name: string
  email: string
  phone: string
  notes: string
}

// In-memory storage for demo purposes
// In production, this would be a database
let leads: (CRMLead & { id: string; createdAt: string })[] = []

export async function POST(request: NextRequest) {
  try {
    const body: CRMLead = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Create new lead
    const newLead = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }

    // Save to storage (in production, this would be a database operation)
    leads.push(newLead)

    console.log('New lead saved:', newLead)

    return NextResponse.json({
      success: true,
      message: 'Lead saved successfully',
      leadId: newLead.id
    })
  } catch (error) {
    console.error('Error saving lead:', error)
    return NextResponse.json(
      { error: 'Failed to save lead' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return all leads
    return NextResponse.json({
      success: true,
      leads: leads,
      count: leads.length
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('id')

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    // Remove lead from storage
    const initialLength = leads.length
    leads = leads.filter(lead => lead.id !== leadId)

    if (leads.length === initialLength) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    )
  }
}