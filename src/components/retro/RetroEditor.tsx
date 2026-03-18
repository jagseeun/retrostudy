'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BlockCheckList } from './BlockCheckList'
import { AchievementRing } from './AchievementRing'
import { StudyTimeInput } from './StudyTimeInput'
import { SuccessSection } from './SuccessSection'
import { FailureSection } from './FailureSection'
import { TagInput } from '@/components/plan/TagInput'
import { Label } from '@/components/ui/label'
import { useRetro } from '@/lib/hooks/useRetro'
import type { Retrospective, TimeBlock, RetroFormData } from '@/lib/types/app.types'
import { calcAchievementFromIds } from '@/lib/utils/achievement'
import { ArrowRight, ArrowLeft, Save } from 'lucide-react'

interface RetroEditorProps {
  initialRetro: Retrospective | null
  date: string
  planBlocks: TimeBlock[]
  defaultStudyMinutes?: number
  defaultTags?: string[]
}

const STEPS = ['블록 체크', '성공 회고', '실패 회고'] as const

export function RetroEditor({ initialRetro, date, planBlocks, defaultStudyMinutes = 0, defaultTags = [] }: RetroEditorProps) {
  const { retro, saving, autoSave, saveNow } = useRetro({ initialRetro, date })

  const [step, setStep] = useState(0)
  const [form, setForm] = useState<RetroFormData>({
    completed_block_ids: retro?.completed_block_ids ?? [],
    skipped_block_ids: retro?.skipped_block_ids ?? [],
    failed_block_ids: retro?.failed_block_ids ?? [],
    study_minutes: retro?.study_minutes ?? defaultStudyMinutes,
    tags: retro?.tags.length ? retro.tags : defaultTags,
    done_well: retro?.done_well ?? '',
    self_praise: retro?.self_praise ?? '',
    learned: retro?.learned ?? '',
    failed_what: retro?.failed_what ?? '',
    failed_cause: retro?.failed_cause ?? '',
    failed_improve: retro?.failed_improve ?? '',
  })

  const rate = calcAchievementFromIds(
    form.completed_block_ids,
    form.skipped_block_ids,
    form.failed_block_ids
  )

  const updateForm = (updates: Partial<RetroFormData>) => {
    const next = { ...form, ...updates }
    setForm(next)
    autoSave(next)
  }

  const canProceed = () => {
    if (step === 1) {
      return form.done_well.trim().length > 0 && form.self_praise.trim().length > 0 && form.learned.trim().length > 0
    }
    return true
  }

  const handleSave = async () => {
    await saveNow(form)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-neutral-500">
          <span>Step {step + 1} / {STEPS.length}</span>
          <span>{STEPS[step]}</span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-1 bg-neutral-200 dark:bg-neutral-800" />
      </div>

      {/* Step 0: Block check + study time */}
      {step === 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <AchievementRing rate={rate} />
          </div>

          {planBlocks.length > 0 ? (
            <BlockCheckList
              blocks={planBlocks}
              completedIds={form.completed_block_ids}
              skippedIds={form.skipped_block_ids}
              failedIds={form.failed_block_ids}
              onChange={(c, s, f) => updateForm({
                completed_block_ids: c,
                skipped_block_ids: s,
                failed_block_ids: f,
              })}
            />
          ) : (
            <p className="text-sm text-neutral-500 text-center py-4" >
              오늘 계획이 없습니다. 학습 시간만 기록해도 좋아요.
            </p>
          )}

          <div className="space-y-2">
            <Label className="text-neutral-700 dark:text-neutral-300">실제 학습 시간</Label>
            <StudyTimeInput
              value={form.study_minutes}
              onChange={minutes => updateForm({ study_minutes: minutes })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-neutral-700 dark:text-neutral-300">태그</Label>
            <TagInput
              value={form.tags}
              onChange={tags => updateForm({ tags })}
            />
          </div>
        </div>
      )}

      {/* Step 1: Success reflection */}
      {step === 1 && (
        <SuccessSection
          doneWell={form.done_well}
          selfPraise={form.self_praise}
          learned={form.learned}
          onChange={(field, value) => updateForm({ [field]: value })}
        />
      )}

      {/* Step 2: Failure reflection */}
      {step === 2 && (
        <FailureSection
          failedWhat={form.failed_what ?? ''}
          failedCause={form.failed_cause ?? ''}
          failedImprove={form.failed_improve ?? ''}
          onChange={(field, value) => updateForm({ [field]: value })}
          hasFailedBlocks={form.failed_block_ids.length > 0}
        />
      )}

      {/* Navigation */}
      <div className="flex gap-2 pt-2">
        {step > 0 && (
          <Button
            variant="ghost"
            onClick={() => setStep(s => s - 1)}
            className="text-neutral-400 gap-1.5"
          >
            <ArrowLeft size={14} />
            이전
          </Button>
        )}
        <div className="flex-1" />
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="bg-white text-black hover:bg-neutral-200 gap-1.5"
          >
            다음
            <ArrowRight size={14} />
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            disabled={saving || !canProceed()}
            className="bg-white text-black hover:bg-neutral-200 gap-1.5"
          >
            <Save size={14} />
            {saving ? '저장 중...' : '저장하기'}
          </Button>
        )}
      </div>

      {saving && (
        <p className="text-xs text-neutral-500 text-center">자동 저장 중...</p>
      )}
    </div>
  )
}
