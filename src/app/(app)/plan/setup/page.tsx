import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { WeeklySetup } from '@/components/plan/WeeklySetup'

export default async function PlanSetupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: items } = await supabase
    .from('weekly_schedule_items')
    .select('*')
    .eq('user_id', user.id)
    .order('day_of_week', { ascending: true })
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/plan"
          className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft size={14} />
          계획
        </Link>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">주간 일정 설정</h1>
      </div>
      <p className="text-sm text-neutral-500 mb-6">
        요일별 고정 일정을 설정하세요. 매일 자동으로 체크리스트에 반영돼요.
      </p>
      <WeeklySetup initialItems={items ?? []} />
    </div>
  )
}
