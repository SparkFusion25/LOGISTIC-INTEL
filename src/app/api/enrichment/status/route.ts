import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const contact_id = searchParams.get('contact_id')
    if (!contact_id) {
      return NextResponse.json({ success: false, error: 'contact_id required' }, { status: 400 })
    }

    // Ensure the contact belongs to the user (RLS on enrichment_queue may not be enabled yet)
    const { data: contact, error: cErr } = await supabase
      .from('crm_contacts')
      .select('id')
      .eq('id', contact_id)
      .maybeSingle()

    if (cErr || !contact) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 })
    }

    const { data: statusRow, error } = await supabase
      .from('enrichment_queue')
      .select('id, enrichment_status, provider, enriched_data, created_at, updated_at')
      .eq('contact_id', contact_id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, status: statusRow || null })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Status failed' }, { status: 500 })
  }
}