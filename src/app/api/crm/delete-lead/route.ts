import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Lead ID is required' 
      }, { status: 400 });
    }

    // In a real app, this would delete from the database
    // For demo purposes, we'll call the main leads endpoint
    const deleteResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/crm/leads`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    const result = await deleteResponse.json();

    return NextResponse.json({ 
      success: result.success, 
      message: result.message
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete lead' 
    }, { status: 400 });
  }
}