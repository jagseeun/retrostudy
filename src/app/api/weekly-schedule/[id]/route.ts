import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })

  const body = await request.json()
  const { title, start_time, end_time, sort_order } = body

  const { data, error } = await supabase
    .from('weekly_schedule_items')
    .update({
      ...(title !== undefined && { title }),
      ...(start_time !== undefined && { start_time: start_time || null }),
      ...(end_time !== undefined && { end_time: end_time || null }),
      ...(sort_order !== undefined && { sort_order }),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })

  const today = new Date().toISOString().slice(0, 10)

  // 오늘/미래 날짜의 daily_check_items 먼저 삭제
  // (FK on delete set null이 적용되기 전에 직접 제거해서 고아 항목 방지)
  await supabase
    .from('daily_check_items')
    .delete()
    .eq('user_id', user.id)
    .eq('template_item_id', id)
    .gte('date', today)

  const { error } = await supabase
    .from('weekly_schedule_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
