'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTimeBlockSchema, type CreateTimeBlockInput } from '@/lib/validations/time-block'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TagInput } from './TagInput'
import type { TimeBlock } from '@/lib/types/app.types'

interface TimeBlockFormProps {
  planId: string
  editBlock?: TimeBlock | null
  defaultSortOrder?: number
  onSubmit: (data: CreateTimeBlockInput) => void
  onCancel: () => void
}

export function TimeBlockForm({ planId, editBlock, defaultSortOrder = 0, onSubmit, onCancel }: TimeBlockFormProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createTimeBlockSchema) as any,
    defaultValues: editBlock
      ? {
          plan_id: planId,
          title: editBlock.title,
          start_time: editBlock.start_time ?? undefined,
          end_time: editBlock.end_time ?? undefined,
          priority: editBlock.priority,
          estimated_minutes: editBlock.estimated_minutes ?? undefined,
          tags: editBlock.tags,
          sort_order: editBlock.sort_order,
        }
      : {
          plan_id: planId,
          priority: 'medium',
          tags: [],
          sort_order: defaultSortOrder,
        },
  })

  const tags = (watch('tags') ?? []) as string[]
  const priority = watch('priority') as 'high' | 'medium' | 'low' | undefined

  const priorities = [
    { value: 'high', label: '높음', color: 'text-red-400' },
    { value: 'medium', label: '중간', color: 'text-yellow-400' },
    { value: 'low', label: '낮음', color: 'text-neutral-400' },
  ] as const

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2">
      <input type="hidden" {...register('plan_id')} />

      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-neutral-700 dark:text-neutral-300">제목 *</Label>
        <Input
          id="title"
          {...register('title')}
          autoFocus
          placeholder="예: 알고리즘 문제 풀기"
          className="bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus-visible:ring-neutral-600"
        />
        {errors.title && <p className="text-xs text-red-400">{String(errors.title.message)}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="start_time" className="text-neutral-700 dark:text-neutral-300">시작 시간</Label>
          <Input
            id="start_time"
            type="time"
            {...register('start_time')}
            className="bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus-visible:ring-neutral-600"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end_time" className="text-neutral-700 dark:text-neutral-300">종료 시간</Label>
          <Input
            id="end_time"
            type="time"
            {...register('end_time')}
            className="bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus-visible:ring-neutral-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-neutral-700 dark:text-neutral-300">우선순위</Label>
          <div className="flex gap-2">
            {priorities.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setValue('priority', p.value)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  priority === p.value
                    ? 'border-neutral-500 bg-neutral-200 dark:bg-neutral-800 ' + p.color
                    : 'border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:border-neutral-500 dark:hover:border-neutral-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="estimated_minutes" className="text-neutral-700 dark:text-neutral-300">예상 시간 (분)</Label>
          <Input
            id="estimated_minutes"
            type="number"
            min={1}
            {...register('estimated_minutes', { valueAsNumber: true })}
            placeholder="30"
            className="bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus-visible:ring-neutral-600"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-neutral-700 dark:text-neutral-300">태그</Label>
        <TagInput value={tags} onChange={v => setValue('tags', v)} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          className="flex-1 bg-white text-black hover:bg-neutral-200"
        >
          {editBlock ? '수정하기' : '추가하기'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="text-neutral-600 dark:text-neutral-400">
          취소
        </Button>
      </div>
    </form>
  )
}
