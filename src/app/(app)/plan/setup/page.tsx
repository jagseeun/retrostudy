'use client'

import { useEffect, useState } from 'react'
import { WeeklySetup } from '@/components/plan/WeeklySetup'
import { QuickWeeklySetup } from '@/components/plan/QuickWeeklySetup'
import type { WeeklyScheduleItem } from '@/lib/types/app.types'

export default function PlanSetupPage() {
  const [items, setItems] = useState<WeeklyScheduleItem[]>([])
  const [mode, setMode] = useState<'quick' | 'detail'>('detail')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/weekly-schedule')
      .then(r => r.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">주간 일정 설정</h1>
      </div>

      <p className="text-sm text-neutral-500 mb-4">
        요일별 고정 일정을 설정하세요. 매일 자동으로 체크리스트에 반영돼요.
      </p>

      {/* 모드 토글 */}
      <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 w-fit mb-5">
        {(['quick', 'detail'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === m
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            {m === 'quick' ? '빠른 입력' : '상세 설정'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-neutral-400 py-8 text-center">불러오는 중...</div>
      ) : mode === 'quick' ? (
        <QuickWeeklySetup initialItems={items} />
      ) : (
        <WeeklySetup initialItems={items} />
      )}
    </div>
  )
}
