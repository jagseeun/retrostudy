'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface TagFilterBarProps {
  allTags: string[]
  selectedTags: string[]
  onToggle: (tag: string) => void
  onClear: () => void
}

export function TagFilterBar({ allTags, selectedTags, onToggle, onClear }: TagFilterBarProps) {
  if (allTags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {allTags.map(tag => {
        const active = selectedTags.includes(tag)
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
              active
                ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            )}
          >
            {tag}
          </button>
        )
      })}
      {selectedTags.length > 0 && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <X size={12} />
          초기화
        </button>
      )}
    </div>
  )
}
