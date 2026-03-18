import { z } from 'zod'

export const createRetroSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  plan_id: z.string().uuid().nullable().optional(),
  completed_block_ids: z.array(z.string().uuid()).default([]),
  skipped_block_ids: z.array(z.string().uuid()).default([]),
  failed_block_ids: z.array(z.string().uuid()).default([]),
  study_minutes: z.number().int().min(0).default(0),
  tags: z.array(z.string()).default([]),
  done_well: z.string().min(1, '잘한 점을 입력해주세요').max(1000),
  self_praise: z.string().min(1, '나에게 칭찬 한마디를 입력해주세요').max(500),
  learned: z.string().min(1, '배운 점을 입력해주세요').max(1000),
  failed_what: z.string().max(1000).nullable().optional(),
  failed_cause: z.string().max(1000).nullable().optional(),
  failed_improve: z.string().max(1000).nullable().optional(),
})

export const updateRetroSchema = createRetroSchema
  .omit({ date: true })
  .partial()

export type CreateRetroInput = z.infer<typeof createRetroSchema>
export type UpdateRetroInput = z.infer<typeof updateRetroSchema>
