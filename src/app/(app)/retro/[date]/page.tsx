import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SimpleRetro } from '@/components/retro/SimpleRetro'
import { RetroDateNav } from '@/components/retro/RetroDateNav'
import { getDayOfWeek, addDays, todayString } from '@/lib/utils/date'
import { syncAndGetDailyChecks } from '@/lib/utils/syncDailyChecks'
import type { DailyCheckItem, DailyRetro } from '@/lib/types/app.types'

interface Props {
  params: Promise<{ date: string }>
}

export default async function RetroDatePage({ params }: Props) {
  const { date } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = todayString()
  const startDate = user.created_at.slice(0, 10)

  // 날짜 형식 검증
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) {
    redirect(`/retro/${today}`)
  }

  // 시작 날짜 이전 또는 미래 날짜 접근 시 리디렉트
  if (date < startDate) redirect(`/retro/${startDate}`)
  if (date > today) redirect(`/retro/${today}`)

  const dow = getDayOfWeek(date)

  // 일요일 회고는 다음 주(월요일 이후)부터 접근 불가
  const isSundayBlocked = dow === 6 && addDays(date, 1) <= today
  if (isSundayBlocked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/retro"
            className="flex items-center gap-1 text-sm font-medium text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <ChevronLeft size={14} />
            회고
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <p className="text-4xl">🔒</p>
          <p className="text-base font-semibold text-neutral-700 dark:text-neutral-200">일요일 회고는 볼 수 없어요</p>
          <p className="text-sm text-neutral-400">어차피 안 했잖아요 ㅎㅎ</p>
        </div>
      </div>
    )
  }

  const [checkItems, { data: retro }] = await Promise.all([
    syncAndGetDailyChecks(supabase, user.id, date, dow),
    supabase.from('daily_retros').select('*').eq('user_id', user.id).eq('date', date).single(),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      {/* 헤더 */}
      <div className="flex flex-col gap-5 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">회고</h1>
          <p className="text-sm text-neutral-400 mt-0.5">오늘 하루를 돌아보세요</p>
        </div>
        <div className="flex justify-center">
          <RetroDateNav date={date} startDate={startDate} today={today} />
        </div>
      </div>

      <SimpleRetro
        date={date}
        checkItems={checkItems as DailyCheckItem[]}
        initialRetro={(retro ?? null) as DailyRetro | null}
      />
    </div>
  )
}
