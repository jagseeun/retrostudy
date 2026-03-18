import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { RetroListItem } from '@/lib/types/app.types'
import { formatDisplayDate } from '@/lib/utils/date'
import { getAchievementColor } from '@/lib/utils/achievement'

interface RetroListItemProps {
  retro: RetroListItem
}

export function RetroListItem({ retro }: RetroListItemProps) {
  const rate = Math.round(retro.achievement_rate)
  const color = getAchievementColor(rate)
  const hours = Math.floor(retro.study_minutes / 60)
  const minutes = retro.study_minutes % 60

  return (
    <Link
      href={`/retro/${retro.date}`}
      className="flex items-start gap-4 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-200 dark:hover:border-neutral-700 shadow-sm transition-all group"
    >
      <div className={`flex flex-col items-center justify-center min-w-[52px] h-12 rounded-lg font-bold text-sm ${color} ${
        rate >= 80
          ? 'bg-green-50 dark:bg-green-950/40'
          : rate >= 50
          ? 'bg-yellow-50 dark:bg-yellow-950/40'
          : 'bg-neutral-100 dark:bg-neutral-800'
      }`}>
        <span className="text-base font-bold leading-none">{rate}%</span>
        <span className="text-[10px] font-medium opacity-60 mt-0.5">달성</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-700 dark:text-neutral-300 font-semibold">{formatDisplayDate(retro.date)}</p>
        <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">{retro.done_well}</p>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {hours > 0 || minutes > 0 ? (
            <span className="text-xs text-neutral-400 dark:text-neutral-600 bg-neutral-50 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
              {hours > 0 ? `${hours}시간 ` : ''}{minutes > 0 ? `${minutes}분` : ''}
            </span>
          ) : null}
          {retro.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs px-2 py-0 h-5 text-neutral-400 border-neutral-200 dark:border-neutral-700 rounded-full">
              {tag}
            </Badge>
          ))}
          {retro.tags.length > 3 && (
            <span className="text-xs text-neutral-400 dark:text-neutral-600">+{retro.tags.length - 3}</span>
          )}
        </div>
      </div>
      <div className="text-neutral-300 dark:text-neutral-700 group-hover:text-neutral-500 transition-colors text-lg leading-none mt-1">›</div>
    </Link>
  )
}
