'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { getAchievementLabel } from '@/lib/utils/achievement'

interface AchievementRingProps {
  rate: number
  size?: number
}

export function AchievementRing({ rate, size = 120 }: AchievementRingProps) {
  const [animated, setAnimated] = useState(0)
  const { resolvedTheme } = useTheme()
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animated / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(rate), 50)
    return () => clearTimeout(timer)
  }, [rate])

  const color =
    rate >= 80 ? '#4ade80' : rate >= 50 ? '#facc15' : '#f87171'

  const trackColor = resolvedTheme === 'dark' ? '#262626' : '#e5e5e5'

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="rotate-90"
          style={{
            transform: `rotate(90deg)`,
            transformOrigin: `${size / 2}px ${size / 2}px`,
            fill: color,
            fontSize: size / 5,
            fontWeight: 700,
          }}
        >
          {Math.round(rate)}%
        </text>
      </svg>
      <span className="text-xs text-neutral-600 dark:text-neutral-400">{getAchievementLabel(rate)}</span>
    </div>
  )
}
