'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DAY_FULL_LABELS, getDayOfWeek, addDays } from '@/lib/utils/date'

interface RetroDateNavProps {
  date: string
  startDate: string
  today: string
}

export function RetroDateNav({ date, startDate, today }: RetroDateNavProps) {
  const router = useRouter()

  const dow = getDayOfWeek(date)
  const dayLabel = DAY_FULL_LABELS[dow]
  const isToday = date === today
  const [, month, day] = date.split('-')

  const prev = addDays(date, -1)
  const next = addDays(date, 1)
  const canGoPrev = prev >= startDate
  const canGoNext = next <= today

  return (
    <div className="flex items-center gap-2 md:gap-4">
      {canGoPrev ? (
        <Link
          href={`/retro/${prev}`}
          className="p-2 md:p-3 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ChevronLeft size={20} className="md:hidden" />
          <ChevronLeft size={26} className="hidden md:block" />
        </Link>
      ) : (
        <span className="p-2 md:p-3 text-neutral-200 dark:text-neutral-800 cursor-not-allowed">
          <ChevronLeft size={20} className="md:hidden" />
          <ChevronLeft size={26} className="hidden md:block" />
        </span>
      )}

      {/* 날짜 클릭 → date picker */}
      <div className="relative flex flex-col items-center min-w-[140px] md:min-w-[180px] text-center cursor-pointer">
        <span className={cn(
          'font-bold tracking-tight pointer-events-none',
          'text-2xl md:text-4xl',
          isToday ? 'text-blue-500' : 'text-neutral-900 dark:text-white'
        )}>
          {dayLabel}
        </span>
        <span className="text-sm md:text-base text-neutral-400 pointer-events-none mt-0.5">{month}/{day}</span>
        {isToday && <span className="text-xs md:text-sm font-semibold text-blue-500 mt-1 pointer-events-none">오늘</span>}
        <input
          type="date"
          value={date}
          min={startDate}
          max={today}
          onChange={(e) => { if (e.target.value) router.push(`/retro/${e.target.value}`) }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {canGoNext ? (
        <Link
          href={`/retro/${next}`}
          className="p-2 md:p-3 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ChevronRight size={20} className="md:hidden" />
          <ChevronRight size={26} className="hidden md:block" />
        </Link>
      ) : (
        <span className="p-2 md:p-3 text-neutral-200 dark:text-neutral-800 cursor-not-allowed">
          <ChevronRight size={20} className="md:hidden" />
          <ChevronRight size={26} className="hidden md:block" />
        </span>
      )}
    </div>
  )
}
