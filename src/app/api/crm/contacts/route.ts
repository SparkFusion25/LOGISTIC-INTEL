// app/api/crm/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
// import your Supabase client
import { createServerComponentSupabaseClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: NextRequest) {
  const supabase = createServerComponentSupabaseClient({ cookies: () => req.cookies });

  // Authenticate user (required in your policy)
  const {
    data: { user },
    error: userErr
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { company_name, source } = body;

  if (!company_name) {
    return NextResponse.json({ success: false, error: 'No company_name provided' }, { status: 400 });
  }

  // Check for existing contact (by company_name and user)
  const { data: existing, error: fetchErr } = await supabase
    .from('crm_contacts')
    .select('*')
    .eq('company_name', company_name)
    .eq('added_by_user', user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true, alreadyExists: true });
  }

  // Insert with user linkage (plan gating handled by RLS)
  const { data, error } = await supabase
    .from('crm_contacts')
    .insert([{
      company_name,
      source: source || 'Trade Search',
      added_by_user: user.id
    }]);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data }, { status: 200 });
}
