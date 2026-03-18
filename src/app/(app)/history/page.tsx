import { createClient } from '@/lib/supabase/server'
import { HistoryContent } from '@/components/history/HistoryContent'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const startDate = user.created_at.slice(0, 10)

  return <HistoryContent startDate={startDate} />
}
