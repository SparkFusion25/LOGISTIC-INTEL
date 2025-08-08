import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
export const runtime='nodejs'; export const dynamic='force-dynamic';

function norm(t?:string|null){ return t? t.toLowerCase().trim().replace(/\s+/g,' ') : null; }

async function resolveCompany(s: any, user: any, company_name: string, country?: string, industry?: string) {
  // Try find existing for this user (RLS scoped)
  const { data: existing } = await s.from('companies')
    .select('id, company_name, country')
    .eq('added_by_user', user.id)
    .ilike('company_name', company_name)
    .maybeSingle();

  if (existing?.id) return { success: true, company_id: existing.id, company: existing };

  // Insert new
  const insert = {
    company_name: company_name.trim(),
    country: country || null,
    industry: industry || null,
    added_by_user: user.id
  };

  const { data, error } = await s.from('companies').insert(insert).select('id, company_name, country').single();
  if (error) return { success: false, error: error.message };
  return { success: true, company_id: data.id, company: data };
}

export async function POST(req: Request){
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ success:false, error:'Not authenticated' }, { status: 401 });
  const body = await req.json().catch(()=>({}));

  // Required inputs from callers
  const company_name = body.company_name as string | undefined;
  const email = body.email as string | undefined;
  const full_name = body.contact_name || body.full_name || null;
  const phone = body.phone || null;
  const title = body.title || null;
  const hs_code = body.hs_code || null;
  const notes = body.notes || null;

  if (!company_name) return NextResponse.json({ success:false, error:'company_name required' }, { status: 400 });

  // Resolve company_id directly
  const companyResult = await resolveCompany(s, user, company_name, body.country||null, body.industry||null);
  if (!companyResult.success) return NextResponse.json({ success:false, error: companyResult.error||'resolve failed' }, { status: 400 });

  const insert = {
    company_id: companyResult.company_id,
    full_name,
    email: email || null,
    phone,
    title,
    added_by_user: user.id,
    notes,
    hs_code,
    created_at: new Date().toISOString()
  } as any;

  const { data, error } = await s.from('crm_contacts').insert(insert).select('id, company_id, full_name, email');
  if (error) {
    if (error.message.toLowerCase().includes('duplicate key'))
      return NextResponse.json({ success:false, error:'Contact already exists in CRM' }, { status: 409 });
    return NextResponse.json({ success:false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success:true, contact: Array.isArray(data)?data[0]:data });
}

export async function GET(req: Request) {
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ success:false, error:'Not authenticated' }, { status: 401 });

  const { data: contacts, error } = await s.from('crm_contacts').select('*').eq('added_by_user', user.id).order('created_at', { ascending: false });
  if (error) {
    console.error('CRM fetch error:', error);
    return NextResponse.json({ success:false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success:true, data: contacts || [], total: contacts?.length || 0 });
}
