'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Clock, CheckCircle2 } from 'lucide-react'
import { DAY_FULL_LABELS, sortByTime, todayString, getWeekStart } from '@/lib/utils/date'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { WeeklyScheduleItem } from '@/lib/types/app.types'

function formatTimeRange(start: string | null, end: string | null) {
  if (!start && !end) return null
  if (start && end) return `${start.slice(0, 5)}-${end.slice(0, 5)}`
  return start ? start.slice(0, 5) : null
}

const STORAGE_KEY = 'weekStartPrompt'

export function WeekStartPrompt() {
  const [open, setOpen] = useState(false)
  const [mondayDate, setMondayDate] = useState('')
  const [scheduleItems, setScheduleItems] = useState<WeeklyScheduleItem[]>([])
  const [mode, setMode] = useState<'ask' | 'edit'>('ask')
  const [titles, setTitles] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const check = async () => {
      const monday = getWeekStart(todayString())
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored === monday) return
        const res = await fetch('/api/weekly-schedule')
        if (!res.ok) return
        const items: WeeklyScheduleItem[] = await res.json()
        if (items.length === 0) return
        setScheduleItems(items)
        setTitles(Object.fromEntries(items.map((i) => [i.id, i.title])))
        setMondayDate(monday)
        setOpen(true)
      } catch {}
    }
    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [])

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, mondayDate) } catch {}
    setOpen(false)
    setMode('ask')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all(
        scheduleItems
          .filter((item) => titles[item.id] !== item.title)
          .map((item) =>
            fetch(`/api/weekly-schedule/${item.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: titles[item.id] }),
            })
          )
      )
      dismiss()
    } finally {
      setSaving(false)
    }
  }

  const itemsByDay = (dow: number) =>
    sortByTime(scheduleItems.filter((i) => i.day_of_week === dow))

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) dismiss() }}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          <DialogTitle>새 주가 시작됐어요 👋</DialogTitle>
          <DialogDescription>
            지난주 계획을 이어나가시겠습니까?
          </DialogDescription>
        </DialogHeader>

        {mode === 'ask' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-8 bg-blue-500 hover:bg-blue-600 text-white text-xs"
              onClick={dismiss}
            >
              네, 계속할게요
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs"
              onClick={() => setMode('edit')}
            >
              아니오, 이름만 바꿀게요
            </Button>
          </div>
        )}

        {mode === 'edit' && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">시간대는 유지되고 이름만 바뀌어요</p>

            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
              {Array.from({ length: 7 }, (_, dow) => {
                const dayItems = itemsByDay(dow)
                if (dayItems.length === 0) return null
                return (
                  <div key={dow}>
                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">{DAY_FULL_LABELS[dow]}</p>
                    <div className="flex flex-col gap-1.5">
                      {dayItems.map((item) => {
                        const timeRange = formatTimeRange(item.start_time, item.end_time)
                        return (
                          <div key={item.id} className="flex items-center gap-2">
                            {timeRange && (
                              <div className="flex items-center gap-1 shrink-0 w-24">
                                <Clock size={10} className="text-neutral-400" />
                                <span className="text-xs text-neutral-400 font-mono">{timeRange}</span>
                              </div>
                            )}
                            <Input
                              value={titles[item.id] ?? item.title}
                              onChange={(e) => setTitles((prev) => ({ ...prev, [item.id]: e.target.value }))}
                              className="h-7 text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-8 bg-blue-500 hover:bg-blue-600 text-white text-xs"
                onClick={handleSave}
                disabled={saving}
              >
                <CheckCircle2 size={13} className="mr-1" />
                {saving ? '저장 중...' : '저장하고 시작'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-neutral-500"
                onClick={dismiss}
              >
                그냥 계속할게요
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
