export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server'
import { mockData } from '@/lib/mockData'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const apiEndpoints = mockData.getAPIEndpoints()

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    let supabasePing: any = null
    if (url && key) {
      const db = createClient(url, key, { auth: { persistSession: false } })
      const c1 = await db.from('companies').select('id', { head: true, count: 'exact' })
      const c2 = await db.from('shipments').select('id', { head: true, count: 'exact' })
      supabasePing = {
        companies: c1.count ?? null,
        shipments: c2.count ?? null,
        errors: { companies: c1.error?.message ?? null, shipments: c2.error?.message ?? null }
      }
    }

    return NextResponse.json({ endpoints: apiEndpoints, supabase: supabasePing })
  } catch (error) {
    console.error('API status fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API status' },
      { status: 500 }
    )
  }
}