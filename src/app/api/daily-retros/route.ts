import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  // 단일 날짜 조회
  if (date) {
    const { data } = await supabase
      .from('daily_retros')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .single()
    return NextResponse.json(data ?? null)
  }

  // 목록 조회 (히스토리용)
  const page = parseInt(searchParams.get('page') ?? '1')
  const pageSize = parseInt(searchParams.get('pageSize') ?? '20')
  const offset = (page - 1) * pageSize

  const { data: retros, count } = await supabase
    .from('daily_retros')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (!retros) return NextResponse.json({ data: [], total: 0, hasMore: false })

  // 해당 날짜들의 체크 현황 가져오기
  const dates = retros.map((r) => r.date)
  const { data: checks } = await supabase
    .from('daily_check_items')
    .select('date, checked')
    .eq('user_id', user.id)
    .in('date', dates)

  // 날짜별 완료율 계산
  const checkMap = new Map<string, { total: number; checked: number }>()
  for (const c of checks ?? []) {
    const prev = checkMap.get(c.date) ?? { total: 0, checked: 0 }
    checkMap.set(c.date, {
      total: prev.total + 1,
      checked: prev.checked + (c.checked ? 1 : 0),
    })
  }

  const data = retros.map((r) => {
    const stat = checkMap.get(r.date)
    const rate = stat && stat.total > 0 ? Math.round((stat.checked / stat.total) * 100) : null
    return {
      id: r.id,
      date: r.date,
      feedback: r.feedback,
      checked: stat?.checked ?? 0,
      total: stat?.total ?? 0,
      rate,
    }
  })

  const total = count ?? 0
  return NextResponse.json({ data, total, hasMore: offset + pageSize < total })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })

  const body = await request.json()
  const { date, feedback } = body

  if (!date) return NextResponse.json({ error: 'date required', code: 'VALIDATION_ERROR' }, { status: 400 })

  const { data, error } = await supabase
    .from('daily_retros')
    .upsert({ user_id: user.id, date, feedback: feedback ?? '' }, { onConflict: 'user_id,date' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })
  return NextResponse.json(data)
}
