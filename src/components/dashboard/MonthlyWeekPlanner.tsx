'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'

interface WeekPlan {
  week_number: number
  week_start: string
  content: string
}

interface Week {
  weekNumber: number
  start: Date
  end: Date
  weekStart: string
}

function getWeeksOfMonth(year: number, month: number): Week[] {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const weeks: Week[] = []

  let cursor = new Date(firstDay)
  const dow = cursor.getDay()
  cursor.setDate(cursor.getDate() + (dow === 0 ? -6 : 1 - dow))

  let weekNum = 1
  while (cursor <= lastDay) {
    const end = new Date(cursor)
    end.setDate(end.getDate() + 6)
    weeks.push({
      weekNumber: weekNum,
      start: new Date(cursor),
      end,
      weekStart: cursor.toISOString().split('T')[0],
    })
    cursor.setDate(cursor.getDate() + 7)
    weekNum++
  }
  return weeks
}

function formatMonthRange(d: Date, start: Date, end: Date, month: number): string {
  const clampStart = start.getMonth() + 1 < month ? new Date(d.getFullYear(), month - 1, 1) : start
  const clampEnd = end.getMonth() + 1 > month ? new Date(d.getFullYear(), month, 0) : end
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`
  return `${fmt(clampStart)} - ${fmt(clampEnd)}`
}

export function MonthlyWeekPlanner() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [plans, setPlans] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState<Record<number, 'saving' | 'saved' | null>>({})
  const [loading, setLoading] = useState(true)
  const timerRefs = useRef<Record<number, ReturnType<typeof setTimeout>>>({})

  const weeks = getWeeksOfMonth(year, month)

  const todayStr = today.toISOString().split('T')[0]
  const currentWeekNum = weeks.find(w =>
    todayStr >= w.weekStart && todayStr <= w.end.toISOString().split('T')[0]
  )?.weekNumber ?? null

  useEffect(() => {
    setLoading(true)
    fetch(`/api/monthly-week-plans?year=${year}&month=${month}`)
      .then(r => r.json())
      .then((data: WeekPlan[]) => {
        const map: Record<number, string> = {}
        for (const p of data) map[p.week_number] = p.content
        setPlans(map)
      })
      .finally(() => setLoading(false))
  }, [year, month])

  const save = useCallback(async (weekNumber: number, weekStart: string, content: string) => {
    setSaving(s => ({ ...s, [weekNumber]: 'saving' }))
    await fetch('/api/monthly-week-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, month, week_number: weekNumber, week_start: weekStart, content }),
    })
    setSaving(s => ({ ...s, [weekNumber]: 'saved' }))
    setTimeout(() => setSaving(s => ({ ...s, [weekNumber]: null })), 1500)
  }, [year, month])

  const handleChange = (weekNumber: number, weekStart: string, value: string) => {
    setPlans(p => ({ ...p, [weekNumber]: value }))
    clearTimeout(timerRefs.current[weekNumber])
    timerRefs.current[weekNumber] = setTimeout(() => {
      save(weekNumber, weekStart, value)
    }, 800)
  }

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-widest font-semibold text-neutral-400 dark:text-neutral-500">
          주간 계획
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 min-w-[72px] text-center">
            {year}년 {month}월
          </span>
          <button
            onClick={nextMonth}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* 주차 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-neutral-300 dark:text-neutral-700">
          <Loader2 size={18} className="animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {weeks.map((w) => {
            const isCurrent = w.weekNumber === currentWeekNum
              && year === today.getFullYear()
              && month === today.getMonth() + 1
            const status = saving[w.weekNumber]

            return (
              <div
                key={w.weekNumber}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                  isCurrent
                    ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20'
                    : 'border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                }`}
              >
                {/* 주차 레이블 */}
                <div className="shrink-0 w-24">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold ${isCurrent ? 'text-blue-500' : 'text-neutral-500 dark:text-neutral-400'}`}>
                      {w.weekNumber}주차
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-medium text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-full">
                        이번 주
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-600">
                    {formatMonthRange(new Date(year, month - 1), w.start, w.end, month)}
                  </span>
                </div>

                {/* 입력 */}
                <input
                  type="text"
                  value={plans[w.weekNumber] ?? ''}
                  onChange={e => handleChange(w.weekNumber, w.weekStart, e.target.value)}
                  placeholder="이번 주 목표를 적어보세요"
                  className="flex-1 bg-transparent text-sm text-neutral-700 dark:text-neutral-300 placeholder-neutral-300 dark:placeholder-neutral-700 outline-none"
                />

                {/* 저장 상태 */}
                <div className="shrink-0 w-4 h-4 flex items-center justify-center">
                  {status === 'saving' && <Loader2 size={12} className="animate-spin text-neutral-300" />}
                  {status === 'saved' && <Check size={12} className="text-green-400" />}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
