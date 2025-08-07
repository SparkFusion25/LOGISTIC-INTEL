import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  'https://zupuxlrtixhfnbuhxhum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQzOTIxNiwiZXhwIjoyMDcwMDE1MjE2fQ.F-dshtyWdNBMeQjFBdvEOdmgZnz3X8W_ZH1X5qdVGcU'
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('id');
    const companyName = searchParams.get('company');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (contactId) {
      // Get specific contact
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('*')
        .eq('id', contactId)
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, error: 'Contact not found', details: error.message },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        contact: data
      });
    }

    // Get all contacts or filter by company
    let query = supabase
      .from('crm_contacts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (companyName) {
      query = query.ilike('company_name', `%${companyName}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch contacts', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contacts: data || [],
      total: count || 0
    });

  } catch (error) {
    console.error('CRM contacts GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contactData = await request.json();
    
    console.log('🔄 CRM Contact Add Request:', JSON.stringify(contactData, null, 2));

    // Get authenticated user (or use a default for now)
    const currentUserId = 'c90f60b4-d3b2-4c3a-8b1b-123456789012'; // Default user ID for demo
    
    // Validate required fields - only company_name is required for lead capture
    if (!contactData.company_name) {
      console.error('❌ Missing required field: company_name:', { 
        company_name: contactData.company_name 
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Company name is required',
          received: { company_name: contactData.company_name }
        },
        { status: 400 }
      );
    }

    // Add contact to CRM
    const { data, error } = await supabase
      .from('crm_contacts')
      .insert({
        company_name: contactData.company_name,
        contact_name: contactData.contact_name || 'Lead Contact', // Default for company leads
        title: contactData.title || '',
        email: contactData.email || '',
        phone: contactData.phone || '',
        linkedin_url: contactData.linkedin_url || '',
        source: contactData.source || 'Trade Search',
        status: 'lead', // Mark as lead until enriched
        tags: contactData.tags || [],
        notes: contactData.notes || '',
        enriched_at: new Date().toISOString(),
        apollo_id: contactData.apollo_id || null,
        // Shipment data linking
        unified_id: contactData.unified_id || null,
        hs_code: contactData.hs_code || null,
        added_by_user: currentUserId
      })
      .select()
      .single();

    if (error) {
      console.error('💥 Supabase insert error:', error);
      
      if (error.code === '23505') { // Duplicate key
        return NextResponse.json(
          { success: false, error: 'Contact already exists in CRM' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to add contact', 
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    console.log('✅ Contact added successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Contact added to CRM successfully',
      contact: data
    });

  } catch (error) {
    console.error('CRM contacts POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('id');
    const updateData = await request.json();

    if (!contactId) {
      return NextResponse.json(
        { success: false, error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    // Update contact
    const { data, error } = await supabase
      .from('crm_contacts')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', contactId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to update contact', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact updated successfully',
      contact: data
    });

  } catch (error) {
    console.error('CRM contacts PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('id');

    if (!contactId) {
      return NextResponse.json(
        { success: false, error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    // Delete contact
    const { error } = await supabase
      .from('crm_contacts')
      .delete()
      .eq('id', contactId);

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete contact', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact removed from CRM successfully'
    });

  } catch (error) {
    console.error('CRM contacts DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}