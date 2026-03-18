import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { todayString, getWeekDays, getDayOfWeek, DAY_FULL_LABELS, sortByTime } from '@/lib/utils/date'
import { Settings2 } from 'lucide-react'
import { AnimatedPlanCard } from '@/components/plan/AnimatedPlanCard'
import type { WeeklyScheduleItem, DailyCheckItem } from '@/lib/types/app.types'

export default async function PlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = todayString()
  const weekDates = getWeekDays(today) // [월, 화, ..., 일]

  // 주간 템플릿 항목
  const { data: scheduleItems } = await supabase
    .from('weekly_schedule_items')
    .select('*')
    .eq('user_id', user.id)
    .order('day_of_week', { ascending: true })
    .order('sort_order', { ascending: true })

  const templateByDow = new Map<number, WeeklyScheduleItem[]>()
  for (const item of scheduleItems ?? []) {
    const list = templateByDow.get(item.day_of_week) ?? []
    templateByDow.set(item.day_of_week, [...list, item])
  }
  // 시간 기준 정렬
  for (const [dow, list] of templateByDow) {
    templateByDow.set(dow, sortByTime(list))
  }

  // 오늘 체크 현황
  const { data: todayChecks } = await supabase
    .from('daily_check_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)

  const todayChecked = (todayChecks ?? []).filter((i: DailyCheckItem) => i.checked).length
  const todayTotal = (todayChecks ?? []).length

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">주간 계획</h1>
          <p className="text-sm text-neutral-400 mt-0.5">이번 주 일정을 확인하세요</p>
        </div>
        <Link
          href="/plan/setup"
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Settings2 size={13} />
          일정 설정
        </Link>
      </div>

      {/* 요일별 리스트 */}
      <div className="flex flex-col gap-2.5">
        {weekDates.map((date, i) => {
          const dow = getDayOfWeek(date)
          const dayItems = templateByDow.get(dow) ?? []
          const isToday = date === today

          return (
            <AnimatedPlanCard
              key={date}
              date={date}
              index={i}
              isToday={isToday}
              isSat={i === 5}
              isSun={i === 6}
              dayLabel={DAY_FULL_LABELS[i]}
              dayItems={dayItems}
              todayChecked={todayChecked}
              todayTotal={todayTotal}
            />
          )
        })}
      </div>

      {/* 처음 사용 안내 */}
      {(scheduleItems ?? []).length === 0 && (
        <div className="mt-4 p-6 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/10 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 mb-3">
            <Settings2 size={18} className="text-blue-500" />
          </div>
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-1">주간 일정이 없어요</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">요일별 공부 계획을 등록하면 매일 자동으로 체크리스트가 만들어져요.</p>
          <Link
            href="/plan/setup"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-lg transition-colors"
          >
            <Settings2 size={13} />
            지금 설정하기
          </Link>
        </div>
      )}
    </div>
  )
}
