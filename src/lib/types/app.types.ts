import type { Database } from './database.types'
export type { CreateTimeBlockInput, UpdateTimeBlockInput } from '@/lib/validations/time-block'
export type { CreateRetroInput, UpdateRetroInput } from '@/lib/validations/retro'

// Raw DB rows
export type WeeklyScheduleItem = Database['public']['Tables']['weekly_schedule_items']['Row']
export type DailyCheckItem = Database['public']['Tables']['daily_check_items']['Row']
export type DailyRetro = Database['public']['Tables']['daily_retros']['Row']
export type MonthlyGoal = Database['public']['Tables']['monthly_goals']['Row']
export type Plan = Database['public']['Tables']['plans']['Row']
export type TimeBlock = Database['public']['Tables']['time_blocks']['Row']
export type Retrospective = Database['public']['Tables']['retrospectives']['Row']

// Plan summary (for calendar indicators)
export interface PlanSummary {
  date: string
  blockCount: number
}

// Insert types
export type PlanInsert = Database['public']['Tables']['plans']['Insert']
export type TimeBlockInsert = Database['public']['Tables']['time_blocks']['Insert']
export type RetroInsert = Database['public']['Tables']['retrospectives']['Insert']

// Update types
export type PlanUpdate = Database['public']['Tables']['plans']['Update']
export type TimeBlockUpdate = Database['public']['Tables']['time_blocks']['Update']
export type RetroUpdate = Database['public']['Tables']['retrospectives']['Update']

// Priority
export type Priority = 'high' | 'medium' | 'low'

// Plan with blocks
export interface PlanWithBlocks extends Plan {
  time_blocks: TimeBlock[]
}

// Block status for retro
export type BlockStatus = 'completed' | 'skipped' | 'failed' | 'pending'

// Block with status (used in retro editor)
export interface BlockWithStatus extends TimeBlock {
  status: BlockStatus
}

// Dashboard stats
export interface DashboardStats {
  streak: number
  avgAchievement: number
  totalStudyMinutes: number
  weeklyMinutes: WeeklyMinutes[]
  tagBreakdown: TagBreakdown[]
  praiseList: string[]
  failurePatterns: FailurePattern[]
  heatmapData: HeatmapEntry[]
}

export interface WeeklyMinutes {
  weekStart: string
  totalMinutes: number
  avgAchievement: number
  retroCount: number
}

export interface TagBreakdown {
  tag: string
  count: number
  percentage: number
}

export interface FailurePattern {
  cause: string
  count: number
}

export interface HeatmapEntry {
  date: string
  count: number // 0 = no retro, 1 = retro done
  achievementRate?: number
}

// Retro list item (for history page)
export interface RetroListItem {
  id: string
  date: string
  achievement_rate: number
  study_minutes: number
  tags: string[]
  done_well: string
  self_praise: string
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// API error
export interface ApiError {
  error: string
  code: string
}

// Retro form data (for step-based form)
export interface RetroFormData {
  // Step 1: Block status
  completed_block_ids: string[]
  skipped_block_ids: string[]
  failed_block_ids: string[]
  study_minutes: number
  tags: string[]
  // Step 2: Success reflection
  done_well: string
  self_praise: string
  learned: string
  // Step 3: Failure reflection (optional)
  failed_what?: string
  failed_cause?: string
  failed_improve?: string
}
