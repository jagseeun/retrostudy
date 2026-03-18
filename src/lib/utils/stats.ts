import type { Retrospective } from '@/lib/types/app.types'
import type { TagBreakdown, FailurePattern, WeeklyMinutes, HeatmapEntry } from '@/lib/types/app.types'
import { getWeekStart } from './date'

export function calcTagBreakdown(retros: Retrospective[]): TagBreakdown[] {
  const counts: Record<string, number> = {}
  for (const retro of retros) {
    for (const tag of retro.tags) {
      counts[tag] = (counts[tag] || 0) + 1
    }
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  return Object.entries(counts)
    .map(([tag, count]) => ({
      tag,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

export function calcFailurePatterns(retros: Retrospective[]): FailurePattern[] {
  const counts: Record<string, number> = {}
  for (const retro of retros) {
    if (retro.failed_cause) {
      const cause = retro.failed_cause.slice(0, 50)
      counts[cause] = (counts[cause] || 0) + 1
    }
  }
  return Object.entries(counts)
    .map(([cause, count]) => ({ cause, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
}

export function calcWeeklyMinutes(retros: Retrospective[]): WeeklyMinutes[] {
  const weeks: Record<string, { total: number; achievements: number[]; count: number }> = {}
  for (const retro of retros) {
    const week = getWeekStart(retro.date)
    if (!weeks[week]) weeks[week] = { total: 0, achievements: [], count: 0 }
    weeks[week].total += retro.study_minutes
    weeks[week].achievements.push(Number(retro.achievement_rate))
    weeks[week].count++
  }
  return Object.entries(weeks)
    .map(([weekStart, data]) => ({
      weekStart,
      totalMinutes: data.total,
      avgAchievement:
        data.achievements.length > 0
          ? data.achievements.reduce((a, b) => a + b, 0) / data.achievements.length
          : 0,
      retroCount: data.count,
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    .slice(-8)
}

export function calcHeatmapData(retros: Retrospective[]): Record<string, HeatmapEntry> {
  const map: Record<string, HeatmapEntry> = {}
  for (const retro of retros) {
    map[retro.date] = {
      date: retro.date,
      count: 1,
      achievementRate: Number(retro.achievement_rate),
    }
  }
  return map
}
