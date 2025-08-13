import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const db = supabaseServer()
  const { data, error } = await db
    .from('unified_shipments')
    .select('unified_date')
    .eq('id', params.id)
    .order('unified_date', { ascending: true })

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  const counts: number[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const count = (data || []).filter((r: any) => new Date(r.unified_date).getMonth() === month.getMonth()).length
    counts.push(count)
  }

  return NextResponse.json({ success: true, data: counts })
}