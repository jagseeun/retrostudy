'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import type { HeatmapEntry } from '@/lib/types/app.types'
import { generateHeatmapDates, formatShortDate } from '@/lib/utils/date'

interface StreakHeatmapProps {
  data: Record<string, HeatmapEntry>
  dates?: string[]
}

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

function getCellColor(entry?: HeatmapEntry, isDark = true): string {
  if (!entry || entry.count === 0) return isDark ? '#1f1f1f' : '#f0f0f0'
  const rate = entry.achievementRate ?? 50
  if (isDark) {
    if (rate >= 80) return '#16a34a'
    if (rate >= 50) return '#15803d'
    if (rate > 0) return '#166534'
    return '#14532d'
  } else {
    if (rate >= 80) return '#22c55e'
    if (rate >= 50) return '#4ade80'
    if (rate > 0) return '#86efac'
    return '#bbf7d0'
  }
}

export function StreakHeatmap({ data, dates: propDates }: StreakHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ date: string; entry?: HeatmapEntry; x: number; y: number } | null>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const dates = propDates ?? generateHeatmapDates()

  // Group dates into 52 weeks (each column = 1 week)
  const weeks: string[][] = []
  let week: string[] = []

  // Pad start so first day aligns to correct weekday
  const firstDate = new Date(dates[0] + 'T00:00:00')
  const firstDay = firstDate.getDay() // 0=Sun, 1=Mon
  const padDays = firstDay === 0 ? 6 : firstDay - 1

  for (let i = 0; i < padDays; i++) week.push('')

  for (const d of dates) {
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
    week.push(d)
  }
  if (week.length > 0) {
    while (week.length < 7) week.push('')
    weeks.push(week)
  }

  const cellSize = 11
  const gap = 2
  const svgWidth = weeks.length * (cellSize + gap)
  const svgHeight = 7 * (cellSize + gap)

  return (
    <div className="relative overflow-x-auto">
      <div className="flex gap-3">
        {/* Day labels */}
        <div className="flex flex-col gap-[2px] pt-0">
          {DAYS.map((d, i) => (
            <div
              key={d}
              style={{ height: cellSize, fontSize: 9 }}
              className="flex items-center text-neutral-400 dark:text-neutral-600 pr-1"
            >
              {i % 2 === 0 ? d : ''}
            </div>
          ))}
        </div>

        <svg
          width={svgWidth}
          height={svgHeight + 2}
          className="overflow-visible"
        >
          {weeks.map((week, wi) =>
            week.map((date, di) => {
              if (!date) return null
              const entry = data[date]
              const x = wi * (cellSize + gap)
              const y = di * (cellSize + gap)
              return (
                <rect
                  key={date}
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  fill={getCellColor(entry, isDark)}
                  className="cursor-pointer hover:opacity-80"
                  onMouseEnter={e => setTooltip({ date, entry, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setTooltip(null)}
                />
              )
            })
          )}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1.5 rounded-md bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white pointer-events-none shadow-lg"
          style={{ left: tooltip.x + 12, top: tooltip.y - 32 }}
        >
          <div className="font-medium">{formatShortDate(tooltip.date)}</div>
          {tooltip.entry ? (
            <div className="text-neutral-600 dark:text-neutral-400">달성률 {tooltip.entry.achievementRate}%</div>
          ) : (
            <div className="text-neutral-500">회고 없음</div>
          )}
        </div>
      )}
    </div>
  )
}
