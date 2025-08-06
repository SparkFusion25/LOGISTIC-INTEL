import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client
const supabase = createClient(
  'https://zupuxlrtixhfnbuhxhum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQzOTIxNiwiZXhwIjoyMDcwMDE1MjE2fQ.F-dshtyWdNBMeQjFBdvEOdmgZnz3X8W_ZH1X5qdVGcU'
);

interface CRMLead {
  id: string;
  full_name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  linkedin?: string;
  campaign_id?: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') || '';
    const full_name = searchParams.get('name') || '';

    // Build query
    let query = supabase
      .from('contacts')
      .select('*');

    // Apply filters
    if (company) {
      query = query.ilike('company', `%${company}%`);
    }
    if (full_name) {
      query = query.ilike('full_name', `%${full_name}%`);
    }

    const { data: contacts, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch contacts',
        leads: [],
        total_count: 0 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      leads: contacts || [],
      total_count: contacts?.length || 0 
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      leads: [],
      total_count: 0 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const leadData = await request.json();
    
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        full_name: leadData.name || leadData.full_name || '',
        title: leadData.title || '',
        company: leadData.company || '',
        email: leadData.email || '',
        phone: leadData.phone || '',
        linkedin: leadData.linkedin || '',
        campaign_id: leadData.campaign_id || null
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save contact'
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      lead: data,
      message: 'Contact saved successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save contact' 
    }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete contact' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Contact deleted successfully' 
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete contact' 
    }, { status: 400 });
  }
}