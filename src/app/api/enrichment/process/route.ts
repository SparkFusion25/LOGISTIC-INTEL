export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const TARGET_TITLES = [
  'Logistics Manager',
  'Supply Chain Director',
  'Procurement Manager',
  'Freight Manager',
  'Operations Manager'
]

export async function POST(req: NextRequest) {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string
    const CRON_SECRET = process.env.CRON_SECRET as string

    const auth = req.headers.get('x-cron-secret')
    if (!CRON_SECRET || auth !== CRON_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return NextResponse.json({ success:false, error:'Supabase env missing' }, { status:500 })
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

    // Fetch pending items only
    const { data: queue, error: qErr } = await admin
      .from('enrichment_queue')
      .select('id, contact_id, enrichment_status, provider')
      .eq('enrichment_status', 'pending')
      .limit(10)

    if (qErr) {
      return NextResponse.json({ success: false, error: qErr.message }, { status: 500 })
    }

    if (!queue || queue.length === 0) {
      return NextResponse.json({ success: true, processed: 0 })
    }

    let processed = 0
    for (const item of queue) {
      const queueId = item.id

      // Fetch related contact
      const { data: contact, error: cErr } = await admin
        .from('crm_contacts')
        .select('id, company_name, email, added_by_user')
        .eq('id', item.contact_id)
        .maybeSingle()

      if (cErr || !contact) {
        await admin.from('enrichment_queue').update({ enrichment_status: 'failed', enriched_data: { error: 'contact_not_found' } }).eq('id', queueId)
        continue
      }

      // Mark processing
      await admin.from('enrichment_queue').update({ enrichment_status: 'processing' }).eq('id', queueId)

      // Optional plan gate: skip for free users
      const { data: profile } = await admin
        .from('user_profiles')
        .select('role, plan, created_at')
        .eq('id', contact.added_by_user)
        .maybeSingle()

      const role = profile?.role || 'user'
      const plan = (profile?.plan || 'free').toLowerCase()
      const isAdmin = role === 'admin'
      const isEligible = isAdmin || plan === 'trial' || plan === 'pro' || plan === 'enterprise'

      if (!isEligible) {
        await admin
          .from('enrichment_queue')
          .update({ enrichment_status: 'failed', enriched_data: { reason: 'upgrade_required' } })
          .eq('id', queueId)
        continue
      }

      try {
        // Call internal Apollo enrichment endpoint
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/enrichment/apollo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName: contact.company_name, jobTitles: TARGET_TITLES, maxContacts: 5 })
        })

        const data = await res.json()
        if (!data.success) {
          await admin
            .from('enrichment_queue')
            .update({ enrichment_status: 'failed', enriched_data: { error: data.error || 'no_success' } })
            .eq('id', queueId)
          continue
        }

        const contacts = Array.isArray(data.contacts) ? data.contacts : []

        if (contacts.length > 0) {
          // Insert new contacts not already present (basic dedupe by email)
          const newRows = contacts
            .filter((c: any) => c.email)
            .map((c: any) => ({
              company_name: contact.company_name,
              contact_name: c.name || c.full_name || 'Contact',
              email: c.email || '',
              phone: c.phone || '',
              status: 'lead',
              notes: '',
              added_by_user: contact.added_by_user
            }))

          if (newRows.length > 0) {
            await admin.from('crm_contacts').insert(newRows)
          }
        }

        await admin
          .from('enrichment_queue')
          .update({ enrichment_status: 'completed', enriched_data: { count: contacts.length } })
          .eq('id', queueId)

        processed += 1
      } catch (e: any) {
        await admin
          .from('enrichment_queue')
          .update({ enrichment_status: 'failed', enriched_data: { error: e.message || 'fetch_failed' } })
          .eq('id', queueId)
      }
    }

    return NextResponse.json({ success: true, processed })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Process failed' }, { status: 500 })
  }
}