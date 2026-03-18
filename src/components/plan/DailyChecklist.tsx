'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { todayString } from '@/lib/utils/date'
import { Clock, Lock, BookOpen, Loader2, Trash2 } from 'lucide-react'
import type { DailyCheckItem } from '@/lib/types/app.types'

interface DailyChecklistProps {
  date: string
  initialItems: DailyCheckItem[]
}

function formatTimeRange(start: string | null, end: string | null) {
  if (!start && !end) return null
  if (start && end) return `${start.slice(0, 5)}-${end.slice(0, 5)}`
  if (start) return `${start.slice(0, 5)}`
  return null
}

export function DailyChecklist({ date, initialItems }: DailyChecklistProps) {
  const router = useRouter()
  const [items, setItems] = useState<DailyCheckItem[]>(initialItems)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const isToday = date === todayString()

  // 해당 날짜의 00:00 ~ 다음날 01:00 사이에만 체크 가능
  const [canCheck, setCanCheck] = useState(false)
  useEffect(() => {
    const check = () => {
      const now = new Date()
      const startOfDay = new Date(date + 'T00:00:00')
      const deadline = new Date(date + 'T01:00:00')
      deadline.setDate(deadline.getDate() + 1)
      setCanCheck(now >= startOfDay && now < deadline)
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [date])

  const checkedCount = items.filter((i) => i.checked).length
  const totalCount = items.length

  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    await fetch(`/api/daily-checks/${id}`, { method: 'DELETE' })
  }

  const toggleItem = async (item: DailyCheckItem) => {
    if (!canCheck) return
    setTogglingId(item.id)
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, checked: !i.checked } : i)))
    try {
      await fetch(`/api/daily-checks/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked: !item.checked }),
      })
    } catch {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, checked: item.checked } : i)))
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 완료 카운터 */}
      <div className="flex items-center justify-between rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm px-5 py-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">{checkedCount}</span>
          <span className="text-lg text-neutral-400">/ {totalCount}</span>
          {totalCount > 0 && (
            <span className="text-sm text-neutral-400 ml-1">
              {totalCount === checkedCount ? '모두 완료!' : `${totalCount - checkedCount}개 남음`}
            </span>
          )}
        </div>
        {!canCheck && (
          <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-600 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
            <Lock size={11} />
            <span>잠금</span>
          </div>
        )}
      </div>

      {/* 체크리스트 */}
      {items.length === 0 ? (
        <div className="py-12 flex flex-col items-center gap-3 text-center">
          <p className="text-neutral-400 text-sm">오늘 일정이 없어요</p>
          {isToday && (
            <p className="text-xs text-neutral-300 dark:text-neutral-700">주간 일정을 설정하면 자동으로 채워져요</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const timeRange = formatTimeRange(item.start_time, item.end_time)
            const isToggling = togglingId === item.id

            return (
              <div
                key={item.id}
                className={cn(
                  'group flex items-center gap-2 rounded-xl border shadow-sm transition-all',
                  item.checked
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/60'
                    : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700',
                  isToggling && 'opacity-60',
                )}
              >
                {/* 체크 영역 */}
                <button
                  onClick={() => !isToggling && toggleItem(item)}
                  disabled={!canCheck}
                  className={cn(
                    'flex flex-1 items-center gap-3 px-4 py-3.5 text-left min-w-0',
                    !canCheck && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className={cn(
                    'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    item.checked
                      ? 'bg-green-500 border-green-500'
                      : 'border-neutral-300 dark:border-neutral-600'
                  )}>
                    {isToggling ? (
                      <Loader2 size={10} className="animate-spin text-white" />
                    ) : item.checked ? (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    {timeRange && (
                      <div className="flex items-center gap-1 mb-0.5">
                        <Clock size={10} className={item.checked ? 'text-green-500 shrink-0' : 'text-neutral-400 shrink-0'} />
                        <span className={cn('text-xs font-mono', item.checked ? 'text-green-600 dark:text-green-400' : 'text-neutral-400')}>{timeRange}</span>
                      </div>
                    )}
                    <span className={cn(
                      'text-sm font-medium',
                      item.checked ? 'text-green-700 dark:text-green-300' : 'text-neutral-800 dark:text-neutral-100'
                    )}>
                      {item.title}
                    </span>
                  </div>
                  {item.checked && !isToggling && (
                    <span className="text-xs font-semibold text-green-500 shrink-0">완료</span>
                  )}
                </button>

                {/* 삭제 버튼: 편집 가능한 시간대에만 표시 */}
                {canCheck && (
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 mr-2 rounded-lg text-neutral-300 hover:text-red-400 dark:text-neutral-600 dark:hover:text-red-400 transition-all shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 회고 작성 버튼 */}
      {totalCount > 0 && (
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            variant="ghost"
            className="w-full h-10 gap-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
            onClick={() => router.push(`/retro/${date}`)}
          >
            <BookOpen size={15} />
            회고 작성하기
          </Button>
        </div>
      )}
    </div>
  )
}
