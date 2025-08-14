import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const db = supabaseServer();
  const body = await req.json().catch(() => ({}));

  // Combine all relevant fields from both implementations
  const {
    company_id,
    company_name,
    status = 'lead',
    unified_id,
    hs_code,
    notes,
    full_name,
    title,
    email,
    phone,
    linkedin,
    country,
    city
  } = body || {};

  // Authentication (using canonical pattern)
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  // Upsert contact, combining all fields
  const contactPayload = {
    company_id: company_id || null,
    company_name,
    status,
    unified_id: unified_id || null,
    hs_code: hs_code || null,
    notes: notes || null,
    full_name,
    title,
    email,
    phone,
    linkedin,
    country,
    city,
    added_by_user: user.id
  };

  if (!company_name) {
    return NextResponse.json({ success: false, error: 'company_name is required' }, { status: 400 });
  }

  const { data, error } = await db.from('crm_contacts').upsert(
    contactPayload,
    { onConflict: 'company_name, email' }
  ).select('id, company_id, company_name, email');

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, contact: data?.[0] || null });
}
// ...existing code...
// ...existing code...
