import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { getPlanForRequest, canViewContacts } from '@/lib/plan'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const db = supabaseServer()
  const company = decodeURIComponent(params.id)
  const plan = getPlanForRequest(req)
  const unlocked = canViewContacts(plan)

  const { data, error } = await db
    .from('crm_contacts')
    .select('full_name, title, email, phone, linkedin, country, city, company_name')
    .ilike('company_name', company)
    .limit(25)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  const safe = (data || []).map((c: any) => ({
    full_name: c.full_name,
    title: c.title,
    email: unlocked ? c.email : null,
    phone: unlocked ? c.phone : null,
    linkedin: c.linkedin,
    country: c.country,
    city: c.city,
    company_name: c.company_name,
  }))

  return NextResponse.json({ success: true, unlocked, data: safe })
}