'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { WeeklyScheduleItem } from '@/lib/types/app.types'

interface ScheduleItemFormProps {
  dayOfWeek: number
  initialItem?: WeeklyScheduleItem | null
  onSubmit: (data: { title: string; start_time: string; end_time: string }) => Promise<void>
  onCancel: () => void
}

export function ScheduleItemForm({ initialItem, onSubmit, onCancel }: ScheduleItemFormProps) {
  const [title, setTitle] = useState(initialItem?.title ?? '')
  const [startTime, setStartTime] = useState(initialItem?.start_time?.slice(0, 5) ?? '')
  const [endTime, setEndTime] = useState(initialItem?.end_time?.slice(0, 5) ?? '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSubmit({ title: title.trim(), start_time: startTime, end_time: endTime })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-1">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 block">시작 시간</Label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm h-8"
          />
        </div>
        <div className="flex-1">
          <Label className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 block">종료 시간</Label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm h-8"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 block">할 일</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 알고리즘 공부"
          className="bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm h-8"
          autoFocus
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          onClick={onCancel}
        >
          취소
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={!title.trim() || saving}
          className="h-8 bg-white text-black hover:bg-neutral-200"
        >
          {initialItem ? '수정' : '추가'}
        </Button>
      </div>
    </form>
  )
}
