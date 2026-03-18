'use client'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface FailureSectionProps {
  failedWhat: string
  failedCause: string
  failedImprove: string
  onChange: (field: 'failed_what' | 'failed_cause' | 'failed_improve', value: string) => void
  hasFailedBlocks?: boolean
}

export function FailureSection({ failedWhat, failedCause, failedImprove, onChange, hasFailedBlocks }: FailureSectionProps) {
  const [open, setOpen] = useState(hasFailedBlocks ?? false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left py-2">
        {open ? <ChevronDown size={16} className="text-neutral-400" /> : <ChevronRight size={16} className="text-neutral-400" />}
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          실패 회고 <span className="text-neutral-400 dark:text-neutral-600 font-normal">(선택)</span>
        </span>
        {hasFailedBlocks && (
          <span className="ml-auto text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
            실패 블록 있음
          </span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-4 pt-2">
        <div className="space-y-1.5">
          <Label className="text-neutral-700 dark:text-neutral-300">무엇을 못 했나요?</Label>
          <Textarea
            value={failedWhat}
            onChange={e => onChange('failed_what', e.target.value)}
            placeholder="예: 운영체제 개념 정리를 끝내지 못했다."
            className="bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus-visible:ring-neutral-600 min-h-[60px] resize-none"
            maxLength={1000}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-neutral-700 dark:text-neutral-300">원인이 뭐였나요?</Label>
          <Textarea
            value={failedCause}
            onChange={e => onChange('failed_cause', e.target.value)}
            placeholder="예: 유튜브를 보다가 시간을 너무 많이 쓴 것 같다."
            className="bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus-visible:ring-neutral-600 min-h-[60px] resize-none"
            maxLength={1000}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-neutral-700 dark:text-neutral-300">다음엔 어떻게 개선할까요?</Label>
          <Textarea
            value={failedImprove}
            onChange={e => onChange('failed_improve', e.target.value)}
            placeholder="예: 공부 시작 전 휴대폰은 다른 방에 두겠다."
            className="bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus-visible:ring-neutral-600 min-h-[60px] resize-none"
            maxLength={1000}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
