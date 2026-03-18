import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calcTagBreakdown, calcFailurePatterns, calcWeeklyMinutes, calcHeatmapData } from '@/lib/utils/stats'

export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })

  // Fetch all retros (for heatmap, we need 1 year)
  const { data: retros, error } = await supabase
    .from('retrospectives')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 })

  if (!retros || retros.length === 0) {
    return NextResponse.json({
      streak: 0,
      avgAchievement: 0,
      totalStudyMinutes: 0,
      weeklyMinutes: [],
      tagBreakdown: [],
      praiseList: [],
      failurePatterns: [],
      heatmapData: {},
    })
  }

  // Streak
  const { data: streakData } = await supabase
    .rpc('get_streak', { p_user_id: user.id })

  // Avg achievement
  const avgAchievement =
    retros.reduce((sum, r) => sum + Number(r.achievement_rate), 0) / retros.length

  // Total study minutes (last 8 weeks)
  const eightWeeksAgo = new Date()
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)
  const recentRetros = retros.filter(r => r.date >= eightWeeksAgo.toISOString().split('T')[0])
  const totalStudyMinutes = recentRetros.reduce((sum, r) => sum + r.study_minutes, 0)

  // Self praise list (recent 20)
  const praiseList = retros
    .slice(0, 20)
    .map(r => r.self_praise)
    .filter(Boolean)

  return NextResponse.json({
    streak: streakData ?? 0,
    avgAchievement: Math.round(avgAchievement * 100) / 100,
    totalStudyMinutes,
    weeklyMinutes: calcWeeklyMinutes(retros),
    tagBreakdown: calcTagBreakdown(retros),
    praiseList,
    failurePatterns: calcFailurePatterns(retros),
    heatmapData: calcHeatmapData(retros),
  })
}
