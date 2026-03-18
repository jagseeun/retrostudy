import { z } from 'zod'

const timeRegex = /^([0-1]?\d|2[0-3]):[0-5]\d$/

export const createTimeBlockSchema = z.object({
  plan_id: z.string().uuid(),
  title: z.string().min(1, '제목을 입력해주세요').max(200, '200자 이내로 입력해주세요'),
  start_time: z.string().regex(timeRegex, 'HH:MM 형식으로 입력해주세요').nullable().optional(),
  end_time: z.string().regex(timeRegex, 'HH:MM 형식으로 입력해주세요').nullable().optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  estimated_minutes: z.number().int().positive().nullable().optional(),
  tags: z.array(z.string()).default([]),
  sort_order: z.number().int().default(0),
})

export const updateTimeBlockSchema = createTimeBlockSchema
  .omit({ plan_id: true })
  .partial()

export const reorderBlocksSchema = z.object({
  orderedIds: z.array(z.string().uuid()),
})

export type CreateTimeBlockInput = z.infer<typeof createTimeBlockSchema>
export type UpdateTimeBlockInput = z.infer<typeof updateTimeBlockSchema>
export type ReorderBlocksInput = z.infer<typeof reorderBlocksSchema>
