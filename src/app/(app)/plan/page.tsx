import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { todayString, getWeekDays, getDayOfWeek, DAY_FULL_LABELS, sortByTime } from '@/lib/utils/date'
import { Settings2, Clock, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WeeklyScheduleItem, DailyCheckItem } from '@/lib/types/app.types'

function formatTimeRange(start: string | null, end: string | null) {
  if (!start && !end) return null
  if (start && end) return `${start.slice(0, 5)}-${end.slice(0, 5)}`
  return start ? start.slice(0, 5) : null
}

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
          const isSat = i === 5
          const isSun = i === 6

          return (
            <Link
              key={date}
              href={`/plan/${date}`}
              className={cn(
                'group block rounded-xl border transition-all shadow-sm',
                isToday
                  ? 'bg-white dark:bg-neutral-900 border-blue-500/40 shadow-blue-100 dark:shadow-none'
                  : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700'
              )}
            >
              {/* 요일 헤더 */}
              <div className={cn(
                'flex items-center justify-between px-4 py-3',
                dayItems.length > 0 && 'border-b border-neutral-100 dark:border-neutral-800'
              )}>
                <div className="flex items-center gap-2.5">
                  {isToday && (
                    <span className="w-1 h-5 bg-blue-500 rounded-full shrink-0" />
                  )}
                  <span className={cn(
                    'text-sm font-bold',
                    isToday ? 'text-blue-500' :
                    isSun ? 'text-red-400' :
                    isSat ? 'text-blue-400' :
                    'text-neutral-700 dark:text-neutral-200'
                  )}>
                    {DAY_FULL_LABELS[i]}
                  </span>
                  <span className="text-xs text-neutral-400">{date.slice(5).replace('-', '/')}</span>
                  {isToday && (
                    <span className="text-[10px] font-semibold bg-blue-500 text-white px-1.5 py-0.5 rounded-full">오늘</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isToday && todayTotal > 0 && (
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 tabular-nums">
                      {todayChecked}/{todayTotal}
                    </span>
                  )}
                  <ChevronRight size={14} className="text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors" />
                </div>
              </div>

              {/* 일정 항목 */}
              {dayItems.length > 0 && (
                <div className="px-4 py-2.5 flex flex-col gap-1.5">
                  {dayItems.map((item) => {
                    const timeRange = formatTimeRange(item.start_time, item.end_time)
                    return (
                      <div key={item.id} className="flex items-center gap-2.5 py-0.5">
                        <div className={cn(
                          'w-1.5 h-1.5 rounded-full shrink-0',
                          isToday ? 'bg-blue-400' : 'bg-neutral-300 dark:bg-neutral-600'
                        )} />
                        {timeRange && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Clock size={10} className="text-neutral-400 dark:text-neutral-600" />
                            <span className="text-xs text-neutral-400 font-mono">{timeRange}</span>
                          </div>
                        )}
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">{item.title}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {dayItems.length === 0 && (
                <div className="px-4 pb-3">
                  <span className="text-xs text-neutral-300 dark:text-neutral-700">일정 없음</span>
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* 처음 사용 안내 */}
      {(scheduleItems ?? []).length === 0 && (
        <div className="mt-6 p-5 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">아직 주간 일정이 없어요</p>
          <Link
            href="/plan/setup"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-400"
          >
            <Settings2 size={13} />
            주간 일정 설정하러 가기
          </Link>
        </div>
      )}
    </div>
  )
}
