import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: Request){
  const body = await req.json();
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success:false, error:'Not authenticated' }, { status:401 });

  const payload:any = {
    company_id: body.company_id || null,
    company_name: body.company_name,
    status: 'lead',
    unified_id: body.unified_id || null,
    hs_code: body.hs_code || null,
    notes: body.notes || null,
    added_by_user: user.id
  };

  const { data, error } = await supabase.from('crm_contacts').insert(payload).select('id, company_id, company_name');
  if (error) return NextResponse.json({ success:false, error:error.message }, { status:400 });
  return NextResponse.json({ success:true, contact: data?.[0] || null });
}
