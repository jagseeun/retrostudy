import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reorderBlocksSchema } from '@/lib/validations/time-block'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })

  // Verify plan ownership
  const { data: plan } = await supabase
    .from('plans')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!plan) return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 })

  const body = await request.json()
  const parsed = reorderBlocksSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message, code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const { orderedIds } = parsed.data

  // Update sort_order for each block
  const updates = orderedIds.map((blockId, index) =>
    supabase
      .from('time_blocks')
      .update({ sort_order: index })
      .eq('id', blockId)
      .eq('plan_id', id)
      .eq('user_id', user.id)
  )

  await Promise.all(updates)

  return NextResponse.json({ success: true })
}
