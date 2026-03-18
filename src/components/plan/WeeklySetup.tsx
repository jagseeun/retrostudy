'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScheduleItemForm } from './ScheduleItemForm'
import { Plus, Pencil, Trash2, Clock, CopyPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DAY_FULL_LABELS, DAY_SHORT_LABELS, sortByTime } from '@/lib/utils/date'
import type { WeeklyScheduleItem } from '@/lib/types/app.types'

interface WeeklySetupProps {
  initialItems: WeeklyScheduleItem[]
}

type FormState = { dayOfWeek: number; editItem?: WeeklyScheduleItem } | null

const PRESETS = [
  { label: '평일', days: [0, 1, 2, 3, 4] },
  { label: '주말', days: [5, 6] },
  { label: '매일', days: [0, 1, 2, 3, 4, 5, 6] },
]

function formatTimeRange(start: string | null, end: string | null) {
  if (!start && !end) return null
  if (start && end) return `${start.slice(0, 5)}-${end.slice(0, 5)}`
  return start ? start.slice(0, 5) : null
}

function MultiBulkForm({ onCreated, onCancel }: {
  onCreated: (items: WeeklyScheduleItem[]) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [saving, setSaving] = useState(false)

  const toggleDay = (d: number) =>
    setSelectedDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])

  const applyPreset = (days: number[]) => setSelectedDays(days)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || selectedDays.length === 0) return
    setSaving(true)
    try {
      const results = await Promise.all(
        selectedDays.sort().map((dow) =>
          fetch('/api/weekly-schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              day_of_week: dow,
              title: title.trim(),
              start_time: startTime || null,
              end_time: endTime || null,
              sort_order: 999,
            }),
          }).then((r) => r.json())
        )
      )
      onCreated(results)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-50 dark:bg-neutral-900 border border-blue-500/30 rounded-xl p-4 mb-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <CopyPlus size={14} className="text-blue-400" />
        <span className="text-sm font-semibold text-neutral-900 dark:text-white">여러 요일에 한번에 추가</span>
      </div>

      {/* 요일 선택 */}
      <div>
        <Label className="text-xs text-neutral-600 dark:text-neutral-400 mb-2 block">요일 선택</Label>
        <div className="flex gap-1.5 flex-wrap mb-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p.days)}
              className="px-2.5 py-1 rounded-full text-xs border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-blue-500 hover:text-blue-400 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {DAY_SHORT_LABELS.map((label, dow) => (
            <button
              key={dow}
              type="button"
              onClick={() => toggleDay(dow)}
              className={cn(
                'w-8 h-8 rounded-full text-xs font-medium border transition-colors',
                selectedDays.includes(dow)
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-500'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 시간 */}
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

      {/* 할 일 */}
      <div>
        <Label className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 block">할 일</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 등교"
          className="bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm h-8"
          autoFocus
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" className="h-8 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white" onClick={onCancel}>
          취소
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={!title.trim() || selectedDays.length === 0 || saving}
          className="h-8 bg-white text-black hover:bg-neutral-200"
        >
          {saving ? '추가 중...' : `${selectedDays.length}개 요일에 추가`}
        </Button>
      </div>
    </form>
  )
}

export function WeeklySetup({ initialItems }: WeeklySetupProps) {
  const [items, setItems] = useState<WeeklyScheduleItem[]>(initialItems)
  const [form, setForm] = useState<FormState>(null)
  const [showBulk, setShowBulk] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const itemsByDay = (dow: number) =>
    sortByTime(items.filter((i) => i.day_of_week === dow))

  const handleAdd = async (dow: number, data: { title: string; start_time: string; end_time: string }) => {
    const existing = itemsByDay(dow)
    const res = await fetch('/api/weekly-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day_of_week: dow,
        title: data.title,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        sort_order: existing.length,
      }),
    })
    const created = await res.json()
    setItems((prev) => [...prev, created])
    setForm(null)
  }

  const handleEdit = async (item: WeeklyScheduleItem, data: { title: string; start_time: string; end_time: string }) => {
    const res = await fetch(`/api/weekly-schedule/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
      }),
    })
    const updated = await res.json()
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    setForm(null)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await fetch(`/api/weekly-schedule/${id}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((i) => i.id !== id))
    setDeletingId(null)
  }

  const handleBulkCreated = (created: WeeklyScheduleItem[]) => {
    setItems((prev) => [...prev, ...created])
    setShowBulk(false)
  }

  return (
    <div className="space-y-2">
      {/* 일괄 추가 버튼 */}
      {!showBulk && (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-9 gap-2 border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-500 mb-2"
          onClick={() => { setShowBulk(true); setForm(null) }}
        >
          <CopyPlus size={13} />
          여러 요일에 한번에 추가
        </Button>
      )}

      {showBulk && (
        <MultiBulkForm
          onCreated={handleBulkCreated}
          onCancel={() => setShowBulk(false)}
        />
      )}

      {/* 요일별 섹션 */}
      {Array.from({ length: 7 }, (_, dow) => {
        const dayItems = itemsByDay(dow)
        const isAddingHere = form !== null && !form.editItem && form.dayOfWeek === dow
        const hasForm = form !== null && form.dayOfWeek === dow

        return (
          <div key={dow} className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="text-sm font-semibold text-neutral-900 dark:text-white">{DAY_FULL_LABELS[dow]}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-2"
                onClick={() => { setForm(isAddingHere ? null : { dayOfWeek: dow }); setShowBulk(false) }}
              >
                <Plus size={12} />
                추가
              </Button>
            </div>

            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {dayItems.length === 0 && !hasForm && (
                <p className="px-4 py-3 text-xs text-neutral-400 dark:text-neutral-600">아직 일정이 없어요</p>
              )}

              {dayItems.map((item) => {
                const isEditing = form?.editItem?.id === item.id
                const timeRange = formatTimeRange(item.start_time, item.end_time)

                return (
                  <div key={item.id} className="px-4 py-3">
                    {isEditing ? (
                      <ScheduleItemForm
                        dayOfWeek={dow}
                        initialItem={item}
                        onSubmit={(data) => handleEdit(item, data)}
                        onCancel={() => setForm(null)}
                      />
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {timeRange && (
                            <div className="flex items-center gap-1 shrink-0">
                              <Clock size={11} className="text-neutral-500" />
                              <span className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">{timeRange}</span>
                            </div>
                          )}
                          <span className="text-sm text-neutral-800 dark:text-neutral-200 truncate">{item.title}</span>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-neutral-400 dark:text-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300"
                            onClick={() => setForm({ dayOfWeek: dow, editItem: item })}
                          >
                            <Pencil size={11} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn('h-6 w-6 text-neutral-400 dark:text-neutral-600 hover:text-red-400', deletingId === item.id && 'opacity-50')}
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                          >
                            <Trash2 size={11} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {isAddingHere && (
                <div className="px-4 py-3">
                  <ScheduleItemForm
                    dayOfWeek={dow}
                    onSubmit={(data) => handleAdd(dow, data)}
                    onCancel={() => setForm(null)}
                  />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
