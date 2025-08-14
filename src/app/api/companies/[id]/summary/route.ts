import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const db = supabaseServer()
  const { data, error } = await db
    .from('unified_shipments')
    .select('unified_value, unified_weight')
    .eq('id', params.id)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  const total_shipments = (data || []).length
  const avg_value = (data || []).reduce((a: number, b: any) => a + (b.unified_value || 0), 0) / (total_shipments || 1)
  const avg_weight = (data || []).reduce((a: number, b: any) => a + (b.unified_weight || 0), 0) / (total_shipments || 1)

  return NextResponse.json({ success: true, total_shipments, avg_value, avg_weight })
}