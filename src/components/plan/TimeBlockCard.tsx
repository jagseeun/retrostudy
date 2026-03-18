'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PriorityBadge } from './PriorityBadge'
import type { TimeBlock } from '@/lib/types/app.types'
import { GripVertical, Pencil, Trash2, Clock } from 'lucide-react'

interface TimeBlockCardProps {
  block: TimeBlock
  onEdit: (block: TimeBlock) => void
  onDelete: (id: string) => void
}

export function TimeBlockCard({ block, onEdit, onDelete }: TimeBlockCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 group transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 cursor-grab active:cursor-grabbing touch-none"
        aria-label="드래그하여 순서 변경"
      >
        <GripVertical size={14} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-snug">{block.title}</span>
          <PriorityBadge priority={block.priority} />
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {(block.start_time || block.end_time) && (
            <span className="text-xs text-neutral-500 flex items-center gap-1">
              <Clock size={10} />
              {block.start_time ?? ''}{block.start_time && block.end_time ? ' ~ ' : ''}{block.end_time ?? ''}
            </span>
          )}
          {block.estimated_minutes && (
            <span className="text-xs text-neutral-500">{block.estimated_minutes}분</span>
          )}
          {block.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0 text-neutral-500 border-neutral-300 dark:border-neutral-700">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          onClick={() => onEdit(block)}
        >
          <Pencil size={12} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-neutral-500 hover:text-red-400"
          onClick={() => onDelete(block.id)}
        >
          <Trash2 size={12} />
        </Button>
      </div>
    </div>
  )
}
