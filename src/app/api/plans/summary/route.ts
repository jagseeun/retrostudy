import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') ?? '')
  const month = parseInt(searchParams.get('month') ?? '')

  if (!year || !month) {
    return NextResponse.json({ error: 'year and month required', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('plans')
    .select('date, time_blocks(id)')
    .eq('user_id', user.id)
    .gte('date', monthStart)
    .lte('date', monthEnd)

  if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })

  const summaries = (data ?? []).map((p) => ({
    date: p.date,
    blockCount: (p.time_blocks as { id: string }[]).length,
  }))

  return NextResponse.json(summaries)
}
