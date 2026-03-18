import { redirect } from 'next/navigation'
import { todayString } from '@/lib/utils/date'

export default function RetroPage() {
  redirect(`/retro/${todayString()}`)
}
