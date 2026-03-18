'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Loader2, History, Check, ChevronRight, CalendarDays } from 'lucide-react'
import { getDayOfWeek, DAY_FULL_LABELS, todayString } from '@/lib/utils/date'
import { cn } from '@/lib/utils'

interface RetroItem {
  id: string
  date: string
  feedback: string
  checked: number
  total: number
  rate: number | null
}

interface HistoryContentProps {
  startDate: string
}

const PAGE_SIZE = 20

export function HistoryContent({ startDate }: HistoryContentProps) {
  const router = useRouter()
  const today = todayString()
  const dateInputRef = useRef<HTMLInputElement>(null)

  const [retros, setRetros] = useState<RetroItem[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchRetros = useCallback(async (p: number, append = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    try {
      const res = await fetch(`/api/daily-retros?page=${p}&pageSize=${PAGE_SIZE}`)
      if (!res.ok) return
      const json = await res.json()
      if (append) setRetros((prev) => [...prev, ...json.data])
      else setRetros(json.data)
      setHasMore(json.hasMore)
    } finally {
      if (append) setLoadingMore(false)
      else setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRetros(1) }, [fetchRetros])

  const handleLoadMore = () => {
    const next = page + 1
    setPage(next)
    fetchRetros(next, true)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">히스토리</h1>
          <p className="text-sm text-neutral-400 mt-0.5">지난 회고를 돌아보세요</p>
        </div>

        {/* 날짜 선택 */}
        <div>
          <button
            onClick={() => dateInputRef.current?.showPicker()}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <CalendarDays size={13} />
            날짜 선택
          </button>
          <input
            ref={dateInputRef}
            type="date"
            min={startDate}
            max={today}
            onChange={(e) => { if (e.target.value) router.push(`/retro/${e.target.value}`) }}
            className="w-0 h-0 opacity-0 absolute"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={20} className="animate-spin text-neutral-400" />
        </div>
      ) : retros.length === 0 ? (
        <EmptyState
          icon={<History size={36} />}
          title="회고가 없어요"
          description="오늘의 회고를 작성해보세요!"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {retros.map((retro) => {
            const dow = getDayOfWeek(retro.date)
            const [, month, day] = retro.date.split('-')
            const rate = retro.rate

            return (
              <Link
                key={retro.id}
                href={`/retro/${retro.date}`}
                className="group flex items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 rounded-xl px-4 py-3.5 shadow-sm transition-all"
              >
                {/* 날짜 뱃지 */}
                <div className="flex flex-col items-center bg-neutral-50 dark:bg-neutral-800 rounded-lg w-11 py-1.5 shrink-0">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase">{DAY_FULL_LABELS[dow].slice(0, 1)}</span>
                  <span className="text-base font-bold text-neutral-900 dark:text-white leading-tight">{day}</span>
                  <span className="text-[10px] text-neutral-400">{month}월</span>
                </div>

                {/* 완료율 뱃지 */}
                {retro.total > 0 && (
                  <div className={cn(
                    'shrink-0 flex flex-col items-center justify-center w-12 h-10 rounded-lg font-bold text-sm',
                    rate !== null && rate >= 80
                      ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400'
                      : rate !== null && rate >= 50
                      ? 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                  )}>
                    <span>{rate ?? 0}%</span>
                    <div className="flex items-center gap-0.5 text-[10px] font-medium opacity-70">
                      <Check size={8} />
                      <span>{retro.checked}/{retro.total}</span>
                    </div>
                  </div>
                )}

                {/* 피드백 미리보기 */}
                <div className="flex-1 min-w-0">
                  {retro.feedback ? (
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">{retro.feedback}</p>
                  ) : (
                    <p className="text-sm text-neutral-300 dark:text-neutral-700 italic">피드백 없음</p>
                  )}
                </div>

                <ChevronRight size={14} className="text-neutral-300 dark:text-neutral-700 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 shrink-0 transition-colors" />
              </Link>
            )
          })}

          {hasMore && (
            <Button
              variant="ghost"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 w-full mt-2 h-10"
            >
              {loadingMore ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              더 보기
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
