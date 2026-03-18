import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
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

  // 시작 날짜 이전으로 접근 시 시작 날짜로 이동
  if (date < startDate) {
    redirect(`/retro/${startDate}`)
  }

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
      <div className="flex flex-col gap-4 mb-8">
        <Link
          href="/retro"
          className="flex items-center gap-1 text-sm font-medium text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors w-fit"
        >
          <ChevronLeft size={14} />
          회고
        </Link>
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
