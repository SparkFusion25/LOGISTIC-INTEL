import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const db = supabaseServer()
  const body = await req.json().catch(() => ({}))

  const { company_name, full_name, title, email, phone, linkedin, country, city } = body || {}

  if (!company_name) {
    return NextResponse.json({ success: false, error: 'company_name is required' }, { status: 400 })
  }

  const { error } = await db.from('crm_contacts').upsert(
    { company_name, full_name, title, email, phone, linkedin, country, city },
    { onConflict: 'company_name, email' }
  )

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}