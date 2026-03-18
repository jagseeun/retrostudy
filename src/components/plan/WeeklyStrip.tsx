'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { todayString } from '@/lib/utils/date'
import type { PlanSummary } from '@/lib/types/app.types'

interface WeeklyStripProps {
  weekDays: PlanSummary[]
  selectedDate?: string
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

export function WeeklyStrip({ weekDays, selectedDate }: WeeklyStripProps) {
  const router = useRouter()
  const today = todayString()

  return (
    <div>
      <h2 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">이번 주</h2>
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, i) => {
          const isToday = day.date === today
          const isSelected = day.date === selectedDate
          const dayNum = parseInt(day.date.split('-')[2])
          const isSat = i === 5
          const isSun = i === 6

          return (
            <button
              key={day.date}
              onClick={() => router.push(`/plan/${day.date}`)}
              className={cn(
                'flex flex-col items-center gap-1 py-3 rounded-xl text-xs transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800',
                isToday && 'bg-blue-600 hover:bg-blue-500',
                isSelected && !isToday && 'bg-neutral-200 dark:bg-neutral-800',
              )}
            >
              <span className={cn(
                'text-[11px]',
                isToday ? 'text-blue-100' : isSun ? 'text-red-400' : isSat ? 'text-blue-400' : 'text-neutral-600 dark:text-neutral-400',
              )}>
                {DAY_LABELS[i]}
              </span>
              <span className={cn(
                'text-sm font-semibold',
                isToday ? 'text-white' : 'text-neutral-800 dark:text-neutral-200',
              )}>
                {dayNum}
              </span>
              {day.blockCount > 0 ? (
                <span className={cn(
                  'text-[10px] font-medium',
                  isToday ? 'text-blue-100' : 'text-neutral-600 dark:text-neutral-400',
                )}>
                  {day.blockCount}개
                </span>
              ) : (
                <span className="text-[10px] text-neutral-300 dark:text-neutral-700">-</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
