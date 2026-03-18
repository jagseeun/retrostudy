import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPlanSchema } from '@/lib/validations/plan'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  let query = supabase
    .from('plans')
    .select('*, time_blocks(*)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (date) {
    query = query.eq('date', date)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })

  return NextResponse.json(date ? (data?.[0] ?? null) : data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })

  const body = await request.json()
  const parsed = createPlanSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message, code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  // Return existing plan if already exists
  const { data: existing } = await supabase
    .from('plans')
    .select('*, time_blocks(*)')
    .eq('user_id', user.id)
    .eq('date', parsed.data.date)
    .single()

  if (existing) return NextResponse.json(existing)

  const { data, error } = await supabase
    .from('plans')
    .insert({ user_id: user.id, date: parsed.data.date })
    .select('*, time_blocks(*)')
    .single()

  if (error) {
    if (error.code === '23505') {
      // Race condition - return existing
      const { data: existing2 } = await supabase
        .from('plans')
        .select('*, time_blocks(*)')
        .eq('user_id', user.id)
        .eq('date', parsed.data.date)
        .single()
      return NextResponse.json(existing2)
    }
    return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
