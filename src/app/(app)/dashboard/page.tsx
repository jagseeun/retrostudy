import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/StatCard'
import { StreakHeatmap } from '@/components/dashboard/StreakHeatmap'
import { generateHeatmapDates, generateDateRange, toDateString } from '@/lib/utils/date'
import { Flame, BookOpen, TrendingUp } from 'lucide-react'
import type { HeatmapEntry } from '@/lib/types/app.types'

export const revalidate = 60

function calcStreak(retroDates: string[]): number {
  if (retroDates.length === 0) return 0
  const sorted = [...retroDates].sort((a, b) => b.localeCompare(a))
  const today = toDateString(new Date())
  const yesterday = toDateString(new Date(Date.now() - 86400000))

  if (sorted[0] !== today && sorted[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00')
    const curr = new Date(sorted[i] + 'T00:00:00')
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000)
    if (diff === 1) streak++
    else break
  }
  return streak
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = toDateString(new Date())

  // 회고 목록 (전체, 날짜 제한 없음)
  const { data: retros } = await supabase
    .from('daily_retros')
    .select('date, feedback')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  // 체크 현황 (완료율 계산용, 전체)
  const { data: checks } = await supabase
    .from('daily_check_items')
    .select('date, checked')
    .eq('user_id', user.id)

  // 날짜별 완료율 계산
  const checkMap = new Map<string, { total: number; checked: number }>()
  for (const c of checks ?? []) {
    const prev = checkMap.get(c.date) ?? { total: 0, checked: 0 }
    checkMap.set(c.date, {
      total: prev.total + 1,
      checked: prev.checked + (c.checked ? 1 : 0),
    })
  }

  const retroDates = new Set((retros ?? []).map((r) => r.date))

  // 히트맵 범위: 첫 회고 날짜 ~ 오늘 (없으면 최근 30일)
  const allRetroDatesAsc = [...retroDates].sort()
  const firstRetroDate = allRetroDatesAsc[0] ?? toDateString(new Date(Date.now() - 30 * 86400000))
  const heatmapDates = generateDateRange(firstRetroDate, today)

  // 히트맵 데이터
  const heatmapData: Record<string, HeatmapEntry> = {}
  for (const date of heatmapDates) {
    if (!retroDates.has(date)) continue
    const stat = checkMap.get(date)
    const rate = stat && stat.total > 0 ? Math.round((stat.checked / stat.total) * 100) : 0
    heatmapData[date] = { date, count: 1, achievementRate: rate }
  }

  // 스탯 계산
  const allRetroDates = (retros ?? []).map((r) => r.date)
  const streak = calcStreak(allRetroDates)
  const totalRetros = retros?.length ?? 0

  const ratesWithItems = [...checkMap.entries()]
    .filter(([, s]) => s.total > 0)
    .map(([, s]) => Math.round((s.checked / s.total) * 100))
  const avgRate = ratesWithItems.length > 0
    ? Math.round(ratesWithItems.reduce((a, b) => a + b, 0) / ratesWithItems.length)
    : 0

  // 최근 회고 5개
  const recentRetros = (retros ?? []).slice(0, 5)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">대시보드</h1>
        <p className="text-sm text-neutral-400 mt-1">총 {totalRetros}개의 회고가 쌓였어요</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="스트릭"
          value={`${streak}일`}
          icon={<Flame size={15} />}
          accent="text-orange-400"
          iconBg="bg-orange-50 dark:bg-orange-950/40"
        />
        <StatCard
          label="평균 완료율"
          value={`${avgRate}%`}
          icon={<TrendingUp size={15} />}
          accent="text-green-500"
          iconBg="bg-green-50 dark:bg-green-950/40"
        />
        <StatCard
          label="총 회고"
          value={`${totalRetros}개`}
          icon={<BookOpen size={15} />}
          accent="text-blue-500"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
        />
      </div>

      {/* Heatmap */}
      <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-5">
        <p className="text-xs uppercase tracking-widest font-semibold text-neutral-400 dark:text-neutral-500 mb-4">회고 활동</p>
        <StreakHeatmap data={heatmapData} dates={heatmapDates} />
      </div>

      {/* 최근 회고 */}
      {recentRetros.length > 0 && (
        <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-5">
          <p className="text-xs uppercase tracking-widest font-semibold text-neutral-400 dark:text-neutral-500 mb-4">최근 회고</p>
          <div className="flex flex-col gap-2">
            {recentRetros.map((r) => {
              const stat = checkMap.get(r.date)
              const rate = stat && stat.total > 0 ? Math.round((stat.checked / stat.total) * 100) : null
              const [, month, day] = r.date.split('-')
              return (
                <Link
                  key={r.date}
                  href={`/retro/${r.date}`}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
                >
                  <span className="shrink-0 inline-flex items-center justify-center text-xs font-semibold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 rounded-md px-2 py-0.5 min-w-[40px]">
                    {month}/{day}
                  </span>
                  {rate !== null && (
                    <span className={`shrink-0 text-xs font-bold w-10 ${
                      rate >= 80 ? 'text-green-500' : rate >= 50 ? 'text-yellow-500' : 'text-neutral-400'
                    }`}>
                      {rate}%
                    </span>
                  )}
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-1 flex-1 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                    {r.feedback || <span className="text-neutral-300 dark:text-neutral-600 italic">피드백 없음</span>}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
