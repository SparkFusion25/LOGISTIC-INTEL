import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { id, stage, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Lead ID is required' 
      }, { status: 400 });
    }

    // In a real app, this would update the database
    // For demo purposes, we'll make a call to the main leads endpoint
    const leadsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/crm/leads`);
    const leadsData = await leadsResponse.json();

    // Update the lead data (this is simplified for demo)
    const updatedLead = {
      id,
      stage,
      ...updateData,
      last_contacted: new Date().toISOString().split('T')[0]
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Lead updated successfully',
      lead: updatedLead
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update lead' 
    }, { status: 400 });
  }
}