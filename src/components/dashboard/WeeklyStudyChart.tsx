'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { WeeklyMinutes } from '@/lib/types/app.types'
import { formatShortDate } from '@/lib/utils/date'

interface WeeklyStudyChartProps {
  data: WeeklyMinutes[]
}

export function WeeklyStudyChart({ data }: WeeklyStudyChartProps) {
  const chartData = data.map(d => ({
    week: formatShortDate(d.weekStart),
    hours: Math.round(d.totalMinutes / 60 * 10) / 10,
    achievement: Math.round(d.avgAchievement),
  }))

  return (
    <div className="w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="week"
            tick={{ fill: '#525252', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#525252', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: 6 }}
            labelStyle={{ color: '#a3a3a3', fontSize: 11 }}
            itemStyle={{ color: '#4ade80', fontSize: 11 }}
            formatter={(value) => [`${value}시간`, '학습 시간']}
          />
          <Bar dataKey="hours" fill="#4ade80" radius={[3, 3, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
