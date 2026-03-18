'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WeeklyScheduleItem } from '@/lib/types/app.types'

function formatTimeRange(start: string | null, end: string | null) {
  if (!start && !end) return null
  if (start && end) return `${start.slice(0, 5)}-${end.slice(0, 5)}`
  return start ? start.slice(0, 5) : null
}

interface Props {
  date: string
  index: number
  isToday: boolean
  isSat: boolean
  isSun: boolean
  dayLabel: string
  dayItems: WeeklyScheduleItem[]
  todayChecked?: number
  todayTotal?: number
}

export function AnimatedPlanCard({ date, index, isToday, isSat, isSun, dayLabel, dayItems, todayChecked, todayTotal }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
    >
      <Link
        href={`/plan/${date}`}
        className={cn(
          'group block rounded-xl border transition-all shadow-sm',
          isToday
            ? 'bg-white dark:bg-neutral-900 border-blue-500/40 shadow-blue-100 dark:shadow-none'
            : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700'
        )}
      >
        <div className={cn(
          'flex items-center justify-between px-4 py-3',
          dayItems.length > 0 && 'border-b border-neutral-100 dark:border-neutral-800'
        )}>
          <div className="flex items-center gap-2.5">
            {isToday && <span className="w-1 h-5 bg-blue-500 rounded-full shrink-0" />}
            <span className={cn(
              'text-sm font-bold',
              isToday ? 'text-blue-500' :
              isSun ? 'text-red-400' :
              isSat ? 'text-blue-400' :
              'text-neutral-700 dark:text-neutral-200'
            )}>
              {dayLabel}
            </span>
            <span className="text-xs text-neutral-400">{date.slice(5).replace('-', '/')}</span>
            {isToday && (
              <span className="text-[10px] font-semibold bg-blue-500 text-white px-1.5 py-0.5 rounded-full">오늘</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isToday && todayTotal != null && todayTotal > 0 && (
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 tabular-nums">
                {todayChecked}/{todayTotal}
              </span>
            )}
            <ChevronRight size={14} className="text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors" />
          </div>
        </div>

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
    </motion.div>
  )
}
