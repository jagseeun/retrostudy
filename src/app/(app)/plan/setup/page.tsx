'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { WeeklySetup } from '@/components/plan/WeeklySetup'
import { QuickWeeklySetup } from '@/components/plan/QuickWeeklySetup'
import type { WeeklyScheduleItem } from '@/lib/types/app.types'

export default function PlanSetupPage() {
  const [items, setItems] = useState<WeeklyScheduleItem[]>([])
  const [mode, setMode] = useState<'quick' | 'detail'>('quick')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/weekly-schedule')
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : []
        setItems(arr)
        // 기존 일정이 있으면 상세 설정을 기본으로
        if (arr.length > 0) setMode('detail')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <Link
          href="/plan"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-3"
        >
          <ChevronLeft size={14} />
          계획으로 돌아가기
        </Link>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">주간 일정 설정</h1>
      </div>

      <p className="text-sm text-neutral-500 mb-4">
        요일별 고정 일정을 설정하세요. 매일 자동으로 체크리스트에 반영돼요.
      </p>

      {/* 모드 토글 */}
      <div className="mb-5">
        <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 w-fit">
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
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
          {mode === 'quick'
            ? '텍스트로 빠르게 입력해요. 예: 09:00-11:00, 알고리즘 공부'
            : '버튼으로 하나씩 추가하고 수정할 수 있어요.'}
        </p>
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
