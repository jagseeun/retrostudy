'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { TagBreakdown } from '@/lib/types/app.types'

interface TagPieChartProps {
  data: TagBreakdown[]
}

const COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#facc15', '#fb923c', '#a78bfa', '#34d399']

export function TagPieChart({ data }: TagPieChartProps) {
  if (data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-sm text-neutral-400 dark:text-neutral-600">데이터 없음</div>
  }

  const top7 = data.slice(0, 7)

  return (
    <div className="flex items-center gap-4">
      <div className="w-32 h-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={top7}
              dataKey="count"
              nameKey="tag"
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={48}
              strokeWidth={0}
            >
              {top7.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--tooltip-bg, #171717)', border: '1px solid var(--tooltip-border, #404040)', borderRadius: 6 }}
              itemStyle={{ color: 'var(--tooltip-text, #d4d4d4)', fontSize: 11 }}
              formatter={(value) => [value, '회']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        {top7.map((item, i) => (
          <div key={item.tag} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-neutral-700 dark:text-neutral-300 truncate flex-1">{item.tag}</span>
            <span className="text-neutral-500">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
