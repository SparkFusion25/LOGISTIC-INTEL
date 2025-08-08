import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const TARGET_TITLES = [
  'Logistics Manager',
  'Supply Chain Director',
  'Procurement Manager',
  'Freight Forwarding Manager',
  'Operations Manager'
]

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { company_name } = await req.json()
    if (!company_name || !String(company_name).trim()) {
      return NextResponse.json({ success: false, error: 'company_name is required' }, { status: 400 })
    }

    // Call internal Apollo enrichment endpoint
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/enrichment/apollo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName: company_name, jobTitles: TARGET_TITLES, maxContacts: 5 })
    })

    const data = await res.json()
    if (!data.success || !Array.isArray(data.contacts) || data.contacts.length === 0) {
      return NextResponse.json({ success: true, enriched: 0, message: 'No contacts found (pending)' })
    }

    // Insert contacts into crm_contacts for this user
    const rows = data.contacts.map((c: any) => ({
      company_name: company_name,
      contact_name: c.name || c.full_name || 'Contact',
      title: c.title || '',
      email: c.email || '',
      phone: c.phone || '',
      linkedin_url: c.linkedin_url || '',
      source: 'Apollo',
      status: 'lead',
      notes: '',
      added_by_user: user.id
    }))

    const { error } = await supabase.from('crm_contacts').insert(rows)
    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to insert enriched contacts', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, enriched: rows.length })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Enrichment failed' }, { status: 500 })
  }
}