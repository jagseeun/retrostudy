import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRetroSchema } from '@/lib/validations/retro'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const pageSize = parseInt(searchParams.get('pageSize') ?? '20')
  const search = searchParams.get('search') ?? ''
  const tags = searchParams.getAll('tag')
  const date = searchParams.get('date')

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('retrospectives')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .range(from, to)

  if (date) {
    query = query.eq('date', date)
  }

  if (search) {
    query = query.textSearch('search_vector', search, { type: 'plain' })
  }

  if (tags.length > 0) {
    // AND filter: must contain all tags
    for (const tag of tags) {
      query = query.contains('tags', [tag])
    }
  }

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })

  const total = count ?? 0
  return NextResponse.json({
    data: data ?? [],
    total,
    page,
    pageSize,
    hasMore: from + pageSize < total,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })

  const body = await request.json()
  const parsed = createRetroSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message, code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('retrospectives')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: '이미 해당 날짜의 회고가 있습니다', code: 'DUPLICATE' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
