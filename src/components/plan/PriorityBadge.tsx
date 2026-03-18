import { Badge } from '@/components/ui/badge'
import type { Priority } from '@/lib/types/app.types'
import { cn } from '@/lib/utils'

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  high: { label: '높음', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  medium: { label: '중간', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  low: { label: '낮음', className: 'bg-neutral-200/50 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-600' },
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority]
  return (
    <Badge variant="outline" className={cn('text-xs px-1.5 py-0', config.className)}>
      {config.label}
    </Badge>
  )
}
