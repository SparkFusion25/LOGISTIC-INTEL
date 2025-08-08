import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Use authenticated route client so RLS applies and we can read auth.uid()

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
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
    const supabase = createRouteHandlerClient({ cookies });
    // Get authenticated user from session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const contactData = await request.json();
    
    console.log('🔄 CRM Contact Add Request:', JSON.stringify(contactData, null, 2));
    
    // Validate required fields - only company_name is required for lead capture
    if (!contactData.company_name || !String(contactData.company_name).trim()) {
      // Try to infer a reasonable non-empty label from other fields
      const inferredLabel = contactData.unified_id ? `Company ${contactData.unified_id}` : (contactData.shipper_name || contactData.consignee_name || '').toString().trim()
      if (inferredLabel) {
        contactData.company_name = inferredLabel
      } else {
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
    }

    // Add contact to CRM
    const insertData = {
      company_name: String(contactData.company_name || '').trim(),
      contact_name: contactData.contact_name || 'Lead Contact',
      title: contactData.title || '',
      email: contactData.email || '',
      phone: contactData.phone || '',
      linkedin_url: contactData.linkedin_url || '',
      source: contactData.source || 'Trade Search',
      status: 'lead',
      notes: contactData.notes || '',
      added_by_user: user.id
    };

    const { data, error } = await supabase
      .from('crm_contacts')
      .insert(insertData)
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

    // Fire-and-forget enrichment if only company was provided (no email)
    try {
      if (!insertData.email && insertData.company_name) {
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/crm/enrich`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_name: insertData.company_name })
        }).catch(() => {});
      }
    } catch {}

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
    const supabase = createRouteHandlerClient({ cookies });
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
    const supabase = createRouteHandlerClient({ cookies });
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