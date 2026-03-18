'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, formatDisplayDate, isToday } from '@/lib/utils/date'

interface DateNavigatorProps {
  date: string
  basePath: string // e.g. '/plan' or '/retro'
}

export function DateNavigator({ date, basePath }: DateNavigatorProps) {
  const router = useRouter()

  const prev = addDays(date, -1)
  const next = addDays(date, 1)
  const today = isToday(date)

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push(`${basePath}/${prev}`)}
        className="h-8 w-8 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
      >
        <ChevronLeft size={16} />
      </Button>
      <div className="flex flex-col items-center min-w-[140px] px-1">
        <span className="text-sm font-semibold text-neutral-900 dark:text-white">{formatDisplayDate(date)}</span>
        {today && (
          <span className="text-[10px] font-semibold text-blue-500 mt-0.5">오늘</span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push(`${basePath}/${next}`)}
        className="h-8 w-8 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  )
}
