'use client'

import { useState, useEffect } from 'react'
import type { TimeBlock, BlockStatus } from '@/lib/types/app.types'
import { calcAchievementFromIds } from '@/lib/utils/achievement'
import { CheckCircle2, XCircle, SkipForward, Circle } from 'lucide-react'

interface BlockCheckListProps {
  blocks: TimeBlock[]
  completedIds: string[]
  skippedIds: string[]
  failedIds: string[]
  onChange: (completed: string[], skipped: string[], failed: string[]) => void
}

type StatusIcon = { icon: typeof CheckCircle2; color: string; label: string }
const statusConfig: Record<BlockStatus, StatusIcon> = {
  completed: { icon: CheckCircle2, color: 'text-green-400', label: '완료' },
  skipped: { icon: SkipForward, color: 'text-yellow-400', label: '건너뜀' },
  failed: { icon: XCircle, color: 'text-red-400', label: '실패' },
  pending: { icon: Circle, color: 'text-neutral-400 dark:text-neutral-600', label: '미정' },
}

const cycleStatus: Record<BlockStatus, BlockStatus> = {
  pending: 'completed',
  completed: 'skipped',
  skipped: 'failed',
  failed: 'pending',
}

function getStatus(
  id: string,
  completedIds: string[],
  skippedIds: string[],
  failedIds: string[]
): BlockStatus {
  if (completedIds.includes(id)) return 'completed'
  if (skippedIds.includes(id)) return 'skipped'
  if (failedIds.includes(id)) return 'failed'
  return 'pending'
}

export function BlockCheckList({ blocks, completedIds, skippedIds, failedIds, onChange }: BlockCheckListProps) {
  const [statuses, setStatuses] = useState<Record<string, BlockStatus>>(() => {
    const map: Record<string, BlockStatus> = {}
    for (const b of blocks) {
      map[b.id] = getStatus(b.id, completedIds, skippedIds, failedIds)
    }
    return map
  })

  useEffect(() => {
    const completed = Object.entries(statuses).filter(([, s]) => s === 'completed').map(([id]) => id)
    const skipped = Object.entries(statuses).filter(([, s]) => s === 'skipped').map(([id]) => id)
    const failed = Object.entries(statuses).filter(([, s]) => s === 'failed').map(([id]) => id)
    onChange(completed, skipped, failed)
  }, [statuses])

  const toggle = (id: string) => {
    setStatuses(prev => ({
      ...prev,
      [id]: cycleStatus[prev[id] ?? 'pending'],
    }))
  }

  const rate = calcAchievementFromIds(
    Object.values(statuses).filter(s => s === 'completed').length > 0
      ? Object.entries(statuses).filter(([, s]) => s === 'completed').map(([id]) => id)
      : [],
    Object.entries(statuses).filter(([, s]) => s === 'skipped').map(([id]) => id),
    Object.entries(statuses).filter(([, s]) => s === 'failed').map(([id]) => id)
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
        <span>탭하여 상태 변경</span>
        <span className="font-medium">달성률 {Math.round(rate)}%</span>
      </div>
      {blocks.map(block => {
        const status = statuses[block.id] ?? 'pending'
        const config = statusConfig[status]
        const Icon = config.icon
        return (
          <button
            key={block.id}
            type="button"
            onClick={() => toggle(block.id)}
            className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-left transition-colors min-h-[44px] w-full"
          >
            <Icon size={18} className={config.color} />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-neutral-800 dark:text-neutral-200 leading-snug">{block.title}</span>
              {block.estimated_minutes && (
                <span className="text-xs text-neutral-400 dark:text-neutral-600 ml-2">{block.estimated_minutes}분</span>
              )}
            </div>
            <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
          </button>
        )
      })}
    </div>
  )
}
