'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface StudyTimeInputProps {
  value: number // total minutes
  onChange: (minutes: number) => void
}

export function StudyTimeInput({ value, onChange }: StudyTimeInputProps) {
  const [hours, setHours] = useState(Math.floor(value / 60))
  const [minutes, setMinutes] = useState(value % 60)

  useEffect(() => {
    setHours(Math.floor(value / 60))
    setMinutes(value % 60)
  }, [value])

  const handleHoursChange = (h: number) => {
    const clamped = Math.max(0, Math.min(23, h))
    setHours(clamped)
    onChange(clamped * 60 + minutes)
  }

  const handleMinutesChange = (m: number) => {
    const clamped = Math.max(0, Math.min(59, m))
    setMinutes(clamped)
    onChange(hours * 60 + clamped)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min={0}
          max={23}
          value={hours}
          onChange={e => handleHoursChange(parseInt(e.target.value) || 0)}
          className="w-16 text-center bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus-visible:ring-neutral-600"
        />
        <Label className="text-neutral-600 dark:text-neutral-400 text-sm">시간</Label>
      </div>
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min={0}
          max={59}
          value={minutes}
          onChange={e => handleMinutesChange(parseInt(e.target.value) || 0)}
          className="w-16 text-center bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus-visible:ring-neutral-600"
        />
        <Label className="text-neutral-600 dark:text-neutral-400 text-sm">분</Label>
      </div>
    </div>
  )
}
