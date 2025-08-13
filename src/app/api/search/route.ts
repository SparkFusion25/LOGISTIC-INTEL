import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(req: Request) {
  const db = supabaseServer()
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').trim()
  if (!q) return NextResponse.json({ success: true, data: [] })

  const { data, error } = await db
    .from('unified_shipments')
    .select('unified_company_name')
    .ilike('unified_company_name', `%${q}%`)
    .limit(30)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  const names = Array.from(new Set((data || []).map((r: any) => r.unified_company_name).filter(Boolean)))
  return NextResponse.json({ success: true, data: names })
}