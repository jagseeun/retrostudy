import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DailyChecklist } from '@/components/plan/DailyChecklist'
import { getDayOfWeek, DAY_FULL_LABELS, addDays, todayString } from '@/lib/utils/date'
import { syncAndGetDailyChecks } from '@/lib/utils/syncDailyChecks'
import { cn } from '@/lib/utils'

interface Props {
  params: Promise<{ date: string }>
}

export default async function PlanDatePage({ params }: Props) {
  const { date } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const dow = getDayOfWeek(date)
  const dayLabel = DAY_FULL_LABELS[dow]
  const today = todayString()
  const isToday = date === today

  const items = await syncAndGetDailyChecks(supabase, user.id, date, dow)

  const prev = addDays(date, -1)
  const next = addDays(date, 1)
  const [, month, day] = date.split('-')

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/plan"
          className="flex items-center gap-1 text-sm font-medium text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
        >
          <ChevronLeft size={14} />
          계획
        </Link>
        {/* 날짜 이동 */}
        <div className="flex items-center gap-1">
          <Link
            href={`/plan/${prev}`}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ChevronLeft size={15} />
          </Link>
          <div className="flex flex-col items-center min-w-[110px] text-center">
            <span className={cn('text-base font-bold tracking-tight', isToday ? 'text-blue-500' : 'text-neutral-900 dark:text-white')}>
              {dayLabel}
            </span>
            <span className="text-xs text-neutral-400">{month}/{day}</span>
            {isToday && <span className="text-[10px] font-semibold text-blue-500 mt-0.5">오늘</span>}
          </div>
          <Link
            href={`/plan/${next}`}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ChevronRight size={15} />
          </Link>
        </div>
      </div>

      <DailyChecklist date={date} initialItems={items} />
    </div>
  )
}
