'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { DAY_FULL_LABELS, sortByTime } from '@/lib/utils/date'
import type { WeeklyScheduleItem } from '@/lib/types/app.types'

interface Props {
  initialItems: WeeklyScheduleItem[]
}

function padTime(t: string): string {
  const [h, m] = t.split(':')
  return h.padStart(2, '0') + ':' + (m ?? '00').padStart(2, '0') + ':00'
}

function parseLine(line: string): { start_time: string | null; end_time: string | null; title: string } | null {
  const trimmed = line.trim()
  if (!trimmed) return null

  // 시간 범위 패턴: HH:MM[-~]HH:MM (앞뒤 공백, 콤마 무관, 순서 무관)
  const rangeMatch = trimmed.match(/(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})/)
  if (rangeMatch) {
    const title = trimmed.replace(rangeMatch[0], '').replace(/^[,\s]+|[,\s]+$/g, '').trim()
    return {
      start_time: padTime(rangeMatch[1]),
      end_time: padTime(rangeMatch[2]),
      title: title || trimmed,
    }
  }

  // 시간만: HH:MM
  const timeMatch = trimmed.match(/(\d{1,2}:\d{2})/)
  if (timeMatch) {
    const title = trimmed.replace(timeMatch[0], '').replace(/^[,\s]+|[,\s]+$/g, '').trim()
    return {
      start_time: padTime(timeMatch[1]),
      end_time: null,
      title: title || trimmed,
    }
  }

  // 제목만
  return { start_time: null, end_time: null, title: trimmed }
}

function formatItem(item: WeeklyScheduleItem): string {
  if (item.start_time && item.end_time) {
    return `${item.start_time.slice(0, 5)}-${item.end_time.slice(0, 5)}, ${item.title}`
  }
  if (item.start_time) {
    return `${item.start_time.slice(0, 5)}, ${item.title}`
  }
  return item.title
}

function initTexts(items: WeeklyScheduleItem[]): Record<number, string> {
  const result: Record<number, string> = {}
  for (let dow = 0; dow < 7; dow++) {
    const dayItems = sortByTime(items.filter(i => i.day_of_week === dow))
    result[dow] = dayItems.map(formatItem).join('\n')
  }
  return result
}

export function QuickWeeklySetup({ initialItems }: Props) {
  const router = useRouter()
  const [texts, setTexts] = useState<Record<number, string>>(() => initTexts(initialItems))
  const [saving, setSaving] = useState(false)
  const [items, setItems] = useState<WeeklyScheduleItem[]>(initialItems)

  const handleSave = async () => {
    setSaving(true)
    try {
      // 기존 항목 전부 삭제
      await Promise.all(items.map(item =>
        fetch(`/api/weekly-schedule/${item.id}`, { method: 'DELETE' })
      ))

      // 새 항목 생성 (전체 병렬)
      const requests: Promise<WeeklyScheduleItem>[] = []
      for (let dow = 0; dow < 7; dow++) {
        const lines = (texts[dow] ?? '').split('\n').filter(l => l.trim())
        lines.forEach((line, i) => {
          const parsed = parseLine(line)
          if (!parsed) return
          requests.push(
            fetch('/api/weekly-schedule', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                day_of_week: dow,
                title: parsed.title,
                start_time: parsed.start_time,
                end_time: parsed.end_time,
                sort_order: i,
              }),
            }).then(r => r.json())
          )
        })
      }
      const newItems = await Promise.all(requests)
      setItems(newItems)
      router.push('/retro')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          형식: <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-neutral-600 dark:text-neutral-400">09:00-11:00, 알고리즘 공부</code>
          &nbsp;— 빈 줄은 무시돼요
        </p>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-500 text-white"
        >
          {saving ? (
            <><Loader2 size={13} className="animate-spin" />저장 중</>
          ) : '전체 저장'}
        </Button>
      </div>

      {Array.from({ length: 7 }, (_, dow) => {
        const lineCount = (texts[dow] ?? '').split('\n').filter(l => l.trim()).length
        return (
          <div
            key={dow}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-sm font-semibold text-neutral-900 dark:text-white">{DAY_FULL_LABELS[dow]}</span>
              {lineCount > 0 ? (
                <span className="text-xs text-blue-500 font-medium">{lineCount}개</span>
              ) : (
                <span className="text-xs text-neutral-300 dark:text-neutral-700">없음</span>
              )}
            </div>
            <textarea
              value={texts[dow] ?? ''}
              onChange={e => setTexts(prev => ({ ...prev, [dow]: e.target.value }))}
              placeholder={'09:00-11:00, 알고리즘 공부\n14:00-16:00, 프로젝트\n23:00-24:00, 복습'}
              rows={3}
              className="w-full px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 bg-transparent placeholder-neutral-300 dark:placeholder-neutral-700 outline-none resize-none font-mono leading-relaxed"
            />
          </div>
        )
      })}

    </div>
  )
}
