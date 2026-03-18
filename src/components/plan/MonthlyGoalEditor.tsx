'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Pencil, Check, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MonthlyGoalEditorProps {
  year: number
  month: number
  initialContent: string
}

export function MonthlyGoalEditor({ year, month, initialContent }: MonthlyGoalEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initialContent)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await fetch('/api/monthly-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, content: draft }),
      })
      setContent(draft)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => {
    setDraft(content)
    setEditing(false)
  }

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={15} className="text-blue-400" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">이번 달 목표</h2>
        </div>
        {!editing && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            onClick={() => { setDraft(content); setEditing(true) }}
          >
            <Pencil size={13} />
          </Button>
        )}
        {editing && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              onClick={cancel}
            >
              취소
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-400 hover:text-green-300"
              onClick={save}
              disabled={saving}
            >
              <Check size={13} />
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="이번 달 목표를 적어보세요..."
          className="bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm resize-none min-h-[80px] focus-visible:ring-blue-500"
          autoFocus
        />
      ) : (
        <p
          className={cn(
            'text-sm leading-relaxed whitespace-pre-wrap',
            content ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-400 dark:text-neutral-600 italic'
          )}
        >
          {content || '이번 달 목표를 설정해보세요 →'}
        </p>
      )}
    </div>
  )
}
