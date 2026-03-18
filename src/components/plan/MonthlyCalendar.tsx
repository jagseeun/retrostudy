'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { todayString, getMonthCalendarGrid, formatYearMonth } from '@/lib/utils/date'
import type { PlanSummary } from '@/lib/types/app.types'

interface MonthlyCalendarProps {
  initialYear: number
  initialMonth: number
  initialSummaries: PlanSummary[]
  selectedDate?: string
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

export function MonthlyCalendar({
  initialYear,
  initialMonth,
  initialSummaries,
  selectedDate,
}: MonthlyCalendarProps) {
  const router = useRouter()
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [summaries, setSummaries] = useState<PlanSummary[]>(initialSummaries)
  const [loading, setLoading] = useState(false)

  const today = todayString()
  const grid = getMonthCalendarGrid(year, month)
  const summaryMap = new Map(summaries.map((s) => [s.date, s.blockCount]))

  const navigate = async (dir: number) => {
    let newMonth = month + dir
    let newYear = year
    if (newMonth > 12) { newMonth = 1; newYear++ }
    if (newMonth < 1) { newMonth = 12; newYear-- }
    setMonth(newMonth)
    setYear(newYear)
    setLoading(true)
    try {
      const res = await fetch(`/api/plans/summary?year=${newYear}&month=${newMonth}`)
      const data = await res.json()
      setSummaries(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className={cn('text-sm font-semibold text-neutral-900 dark:text-white', loading && 'opacity-50')}>
          {formatYearMonth(year, month)}
        </h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            onClick={() => navigate(1)}
          >
            <ChevronRight size={15} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* 요일 헤더 */}
        {DAY_NAMES.map((d, i) => (
          <div
            key={d}
            className={cn(
              'text-center text-[11px] py-1.5 font-medium',
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-neutral-500',
            )}
          >
            {d}
          </div>
        ))}

        {/* 날짜 셀 */}
        {grid.flat().map((dateStr, i) => {
          if (!dateStr) {
            return <div key={`empty-${i}`} />
          }

          const isToday = dateStr === today
          const isSelected = dateStr === selectedDate
          const blockCount = summaryMap.get(dateStr) ?? 0
          const dayOfWeek = i % 7 // 0=Sun, 6=Sat
          const isSun = dayOfWeek === 0
          const isSat = dayOfWeek === 6
          const dayNum = parseInt(dateStr.split('-')[2])

          return (
            <button
              key={dateStr}
              onClick={() => router.push(`/plan/${dateStr}`)}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-lg py-2 gap-0.5 text-sm transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800',
                isToday && 'bg-blue-600 hover:bg-blue-500',
                isSelected && !isToday && 'bg-neutral-300 dark:bg-neutral-700',
              )}
            >
              <span className={cn(
                'text-sm font-medium leading-none',
                isToday ? 'text-white' :
                isSun ? 'text-red-400' :
                isSat ? 'text-blue-400' :
                'text-neutral-800 dark:text-neutral-200',
              )}>
                {dayNum}
              </span>
              {blockCount > 0 && (
                <span className={cn(
                  'w-1 h-1 rounded-full',
                  isToday ? 'bg-blue-200' : 'bg-blue-400',
                )} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
