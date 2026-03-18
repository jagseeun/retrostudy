import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppNav } from '@/components/shared/AppNav'
import { WeekStartPrompt } from '@/components/plan/WeekStartPrompt'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <AppNav />
      <main className="flex-1 min-w-0 pb-20 md:pb-0 md:pl-0">
        {children}
      </main>
      <WeekStartPrompt />
    </div>
  )
}
