// app/api/crm/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authenticate user
    const { data: { user }, error: userErr } = await supabase.auth.getUser();

    if (!user || userErr) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { company_name, source, metadata } = body;

    if (!company_name) {
      return NextResponse.json({ success: false, error: 'No company_name provided' }, { status: 400 });
    }

    // Get user's subscription plan to check limits
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_plan')
      .eq('id', user.id)
      .single();

    const plan: 'trial' | 'starter' | 'pro' | 'enterprise' = (profile?.subscription_plan as 'trial' | 'starter' | 'pro' | 'enterprise') || 'trial';
    
    // Check subscription limits
    const limits: Record<'trial' | 'starter' | 'pro' | 'enterprise', number> = {
      trial: 10,
      starter: 100,
      pro: 1000,
      enterprise: Infinity
    };

    const { count } = await supabase
      .from('crm_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('added_by_user', user.id);

    if ((count || 0) >= limits[plan]) {
      return NextResponse.json({ 
        success: false, 
        error: `Contact limit reached (${count || 0}/${limits[plan]}). Please upgrade your plan.` 
      }, { status: 403 });
    }

    // Check for existing contact (by company_name and user)
    const { data: existing } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('company_name', company_name)
      .eq('added_by_user', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        alreadyExists: true,
        message: `${company_name} is already in your CRM` 
      });
    }

    // Insert with user linkage and metadata
    const { data, error } = await supabase
      .from('crm_contacts')
      .insert([{
        company_name,
        source: source || 'Trade Search',
        added_by_user: user.id,
        owner_user_id: user.id,
        metadata: metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('CRM insert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data?.[0],
      message: `${company_name} added to CRM successfully!`
    });

  } catch (error) {
    console.error('CRM API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add contact to CRM' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authenticate user
    const { data: { user }, error: userErr } = await supabase.auth.getUser();

    if (!user || userErr) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get all CRM contacts for this user
    const { data: contacts, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('added_by_user', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('CRM fetch error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: contacts || [],
      total: contacts?.length || 0
    });

  } catch (error) {
    console.error('CRM GET API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch CRM contacts' 
    }, { status: 500 });
  }
}
