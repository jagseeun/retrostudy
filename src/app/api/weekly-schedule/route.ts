import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })

  const { data, error } = await supabase
    .from('weekly_schedule_items')
    .select('*')
    .eq('user_id', user.id)
    .order('day_of_week', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })

  const body = await request.json()
  const { day_of_week, title, start_time, end_time, sort_order } = body

  if (day_of_week === undefined || !title) {
    return NextResponse.json({ error: 'day_of_week and title required', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('weekly_schedule_items')
    .insert({ user_id: user.id, day_of_week, title, start_time: start_time || null, end_time: end_time || null, sort_order: sort_order ?? 0 })
    .select()
    .single()

  if (error) {
    console.error('[weekly-schedule POST]', error)
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
