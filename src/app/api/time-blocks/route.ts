import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTimeBlockSchema } from '@/lib/validations/time-block'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })

  const body = await request.json()
  const parsed = createTimeBlockSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message, code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  // Verify plan ownership
  const { data: plan } = await supabase
    .from('plans')
    .select('id')
    .eq('id', parsed.data.plan_id)
    .eq('user_id', user.id)
    .single()

  if (!plan) return NextResponse.json({ error: 'Plan not found', code: 'NOT_FOUND' }, { status: 404 })

  const { data, error } = await supabase
    .from('time_blocks')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
