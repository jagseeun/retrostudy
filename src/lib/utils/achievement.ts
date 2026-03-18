import type { BlockStatus, BlockWithStatus } from '@/lib/types/app.types'

export function calcAchievementRate(
  completed: number,
  skipped: number,
  failed: number
): number {
  const total = completed + skipped + failed
  if (total === 0) return 0
  return Math.round((completed / total) * 100 * 100) / 100
}

export function calcAchievementFromIds(
  completedIds: string[],
  skippedIds: string[],
  failedIds: string[]
): number {
  return calcAchievementRate(
    completedIds.length,
    skippedIds.length,
    failedIds.length
  )
}

export function getAchievementColor(rate: number): string {
  if (rate >= 80) return 'text-green-400'
  if (rate >= 50) return 'text-yellow-400'
  return 'text-red-400'
}

export function getAchievementLabel(rate: number): string {
  if (rate >= 90) return '완벽해요!'
  if (rate >= 70) return '잘했어요!'
  if (rate >= 50) return '절반 이상!'
  if (rate > 0) return '시작이 반!'
  return '아직 기록 없음'
}

export function groupBlocksByStatus(blocks: BlockWithStatus[]): {
  completed: BlockWithStatus[]
  skipped: BlockWithStatus[]
  failed: BlockWithStatus[]
  pending: BlockWithStatus[]
} {
  return {
    completed: blocks.filter(b => b.status === 'completed'),
    skipped: blocks.filter(b => b.status === 'skipped'),
    failed: blocks.filter(b => b.status === 'failed'),
    pending: blocks.filter(b => b.status === 'pending'),
  }
}

export function blockStatusFromIds(
  blockId: string,
  completedIds: string[],
  skippedIds: string[],
  failedIds: string[]
): BlockStatus {
  if (completedIds.includes(blockId)) return 'completed'
  if (skippedIds.includes(blockId)) return 'skipped'
  if (failedIds.includes(blockId)) return 'failed'
  return 'pending'
}
