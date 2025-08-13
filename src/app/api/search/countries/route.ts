import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(req: Request) {
  const db = supabaseServer()
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').trim()
  const field = url.searchParams.get('field') === 'destination' ? 'destination_country' : 'origin_country'

  let query = db.from('unified_shipments').select(`${field}`, { head: false, count: 'exact' }).not(field, 'is', null)
  if (q) query = query.ilike(field, `${q}%`)

  const { data, error } = await query.limit(50)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  const set = new Set<string>()
  for (const row of data || []) {
    const val = (row as any)[field]
    if (val) set.add(String(val))
  }
  return NextResponse.json({ success: true, data: Array.from(set).sort() })
}