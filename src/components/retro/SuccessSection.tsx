'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface SuccessSectionProps {
  doneWell: string
  selfPraise: string
  learned: string
  onChange: (field: 'done_well' | 'self_praise' | 'learned', value: string) => void
}

export function SuccessSection({ doneWell, selfPraise, learned, onChange }: SuccessSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <Label className="text-neutral-700 dark:text-neutral-300">
          잘한 점 <span className="text-red-400">*</span>
        </Label>
        <p className="text-xs text-neutral-500">오늘 잘 해낸 것들을 구체적으로 적어보세요</p>
        <Textarea
          value={doneWell}
          onChange={e => onChange('done_well', e.target.value)}
          placeholder="예: 계획한 알고리즘 문제를 모두 풀었다. 모르는 부분은 끝까지 찾아봤다."
          className="bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus-visible:ring-neutral-600 min-h-[80px] resize-none"
          maxLength={1000}
        />
        <p className="text-xs text-right text-neutral-400 dark:text-neutral-600">{doneWell.length}/1000</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-neutral-700 dark:text-neutral-300">
          나에게 칭찬 한마디 <span className="text-red-400">*</span>
        </Label>
        <p className="text-xs text-neutral-500">오늘의 나를 격려해주세요</p>
        <Textarea
          value={selfPraise}
          onChange={e => onChange('self_praise', e.target.value)}
          placeholder="예: 오늘도 끝까지 포기하지 않은 나, 정말 대단해! 👏"
          className="bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus-visible:ring-neutral-600 min-h-[60px] resize-none"
          maxLength={500}
        />
        <p className="text-xs text-right text-neutral-400 dark:text-neutral-600">{selfPraise.length}/500</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-neutral-700 dark:text-neutral-300">
          배운 점 <span className="text-red-400">*</span>
        </Label>
        <p className="text-xs text-neutral-500">오늘 새롭게 알게 된 것이나 깨달은 점</p>
        <Textarea
          value={learned}
          onChange={e => onChange('learned', e.target.value)}
          placeholder="예: 동적 프로그래밍에서 메모이제이션의 개념을 제대로 이해했다."
          className="bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus-visible:ring-neutral-600 min-h-[80px] resize-none"
          maxLength={1000}
        />
        <p className="text-xs text-right text-neutral-400 dark:text-neutral-600">{learned.length}/1000</p>
      </div>
    </div>
  )
}
