import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/daily-checks?date=YYYY-MM-DD
// 해당 날짜의 체크 항목을 반환 (자동 생성 없음 — 템플릿 sync는 서버 페이지 렌더 시 syncAndGetDailyChecks가 담당)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'date required', code: 'VALIDATION_ERROR' }, { status: 400 })

  const { data, error } = await supabase
    .from('daily_check_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/daily-checks — 당일 항목 추가 (오전 10시 전 전용)
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })

  const body = await request.json()
  const { date, title, start_time, end_time, sort_order } = body

  if (!date || !title) {
    return NextResponse.json({ error: 'date and title required', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('daily_check_items')
    .insert({
      user_id: user.id,
      date,
      title,
      start_time: start_time || null,
      end_time: end_time || null,
      sort_order: sort_order ?? 0,
      checked: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
