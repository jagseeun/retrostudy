import type { SupabaseClient } from '@supabase/supabase-js'
import { sortByTime } from './date'
import type { DailyCheckItem } from '@/lib/types/app.types'

/**
 * daily_check_items 조회/동기화:
 * - 과거 날짜 → DB에 저장된 스냅샷만 반환 (템플릿 조회/쓰기 없음)
 * - 오늘/미래 → 최신 주간 스케줄과 동기화 후 반환
 */
export async function syncAndGetDailyChecks(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  dayOfWeek: number
): Promise<DailyCheckItem[]> {
  const today = new Date().toISOString().slice(0, 10)

  if (date < today) {
    // 과거: 저장된 스냅샷만 반환, 템플릿 조회 불필요
    const { data: existing } = await supabase
      .from('daily_check_items')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('sort_order', { ascending: true })
    return sortByTime(existing ?? [])
  }

  // 오늘/미래: 최신 템플릿과 동기화
  const { data: existing } = await supabase
    .from('daily_check_items')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('sort_order', { ascending: true })

  const { data: templateItems } = await supabase
    .from('weekly_schedule_items')
    .select('*')
    .eq('user_id', userId)
    .eq('day_of_week', dayOfWeek)
    .order('sort_order', { ascending: true })

  const templates = templateItems ?? []
  const currentTemplateIds = new Set(templates.map((t) => t.id))
  const existingByTemplateId = new Map(
    (existing ?? []).filter((i) => i.template_item_id).map((i) => [i.template_item_id, i])
  )

  // 템플릿에서 제거된 항목 삭제 (template_item_id가 현재 템플릿에 없는 것)
  const toDelete = (existing ?? []).filter(
    (i) => i.template_item_id && !currentTemplateIds.has(i.template_item_id)
  )
  if (toDelete.length > 0) {
    await supabase.from('daily_check_items').delete().in('id', toDelete.map((i) => i.id))
  }

  for (const tmpl of templates) {
    const existing_item = existingByTemplateId.get(tmpl.id)
    if (existing_item) {
      // 기존 항목 업데이트 (checked 상태는 보존)
      if (
        existing_item.title !== tmpl.title ||
        existing_item.start_time !== tmpl.start_time ||
        existing_item.end_time !== tmpl.end_time ||
        existing_item.sort_order !== tmpl.sort_order
      ) {
        await supabase
          .from('daily_check_items')
          .update({ title: tmpl.title, start_time: tmpl.start_time, end_time: tmpl.end_time, sort_order: tmpl.sort_order })
          .eq('id', existing_item.id)
      }
    } else {
      // unique constraint(user_id,date,template_item_id)가 있으므로
      // 레이스 컨디션으로 중복 호출되어도 한 번만 삽입됨
      await supabase.from('daily_check_items').upsert(
        {
          user_id: userId,
          date,
          template_item_id: tmpl.id,
          title: tmpl.title,
          start_time: tmpl.start_time,
          end_time: tmpl.end_time,
          sort_order: tmpl.sort_order,
          checked: false,
        },
        { onConflict: 'user_id,date,template_item_id', ignoreDuplicates: true }
      )
    }
  }

  const { data: synced } = await supabase
    .from('daily_check_items')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('sort_order', { ascending: true })

  return sortByTime(synced ?? [])
}
