'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { TimeBlockList } from './TimeBlockList'
import { TimeBlockForm } from './TimeBlockForm'
import { EmptyState } from '@/components/shared/EmptyState'
import { usePlan } from '@/lib/hooks/usePlan'
import type { PlanWithBlocks, TimeBlock } from '@/lib/types/app.types'
import type { CreateTimeBlockInput } from '@/lib/validations/time-block'
import { Plus, CalendarDays } from 'lucide-react'

interface PlanEditorProps {
  initialPlan: PlanWithBlocks | null
  date: string
}

export function PlanEditor({ initialPlan, date }: PlanEditorProps) {
  const { plan, loading, ensurePlan, addBlock, updateBlock, deleteBlock, reorderBlocks } = usePlan(initialPlan)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editBlock, setEditBlock] = useState<TimeBlock | null>(null)

  const handleOpenAdd = async () => {
    if (!plan) {
      await ensurePlan(date)
    }
    setEditBlock(null)
    setSheetOpen(true)
  }

  const handleOpenEdit = (block: TimeBlock) => {
    setEditBlock(block)
    setSheetOpen(true)
  }

  const handleSubmit = async (data: CreateTimeBlockInput) => {
    if (editBlock) {
      await updateBlock(editBlock.id, data)
    } else {
      await addBlock(data)
    }
    setSheetOpen(false)
    setEditBlock(null)
  }

  const blocks = plan?.time_blocks ?? []
  const totalEstimated = blocks.reduce((sum, b) => sum + (b.estimated_minutes ?? 0), 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <span>{blocks.length}개 블록</span>
          {totalEstimated > 0 && (
            <span>· 총 {Math.floor(totalEstimated / 60)}시간 {totalEstimated % 60}분</span>
          )}
        </div>
        <Button
          onClick={handleOpenAdd}
          size="sm"
          disabled={loading}
          className="bg-white text-black hover:bg-neutral-200 h-8 gap-1.5"
        >
          <Plus size={14} />
          블록 추가
        </Button>
      </div>

      {blocks.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={40} />}
          title="아직 계획이 없어요"
          description="블록 추가 버튼을 눌러 오늘의 학습 계획을 세워보세요"
          action={
            <Button onClick={handleOpenAdd} variant="outline" className="border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white">
              <Plus size={14} className="mr-1.5" />
              첫 블록 추가하기
            </Button>
          }
        />
      ) : (
        <TimeBlockList
          blocks={blocks}
          planId={plan!.id}
          onEdit={handleOpenEdit}
          onDelete={deleteBlock}
          onReorder={reorderBlocks}
        />
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-neutral-900 dark:text-white">
              {editBlock ? '블록 수정' : '새 블록 추가'}
            </SheetTitle>
          </SheetHeader>
          {plan && (
            <div className="px-6 pb-6">
              <TimeBlockForm
                planId={plan.id}
                editBlock={editBlock}
                defaultSortOrder={blocks.length}
                onSubmit={handleSubmit}
                onCancel={() => setSheetOpen(false)}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
