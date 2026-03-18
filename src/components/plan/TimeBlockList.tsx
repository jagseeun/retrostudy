'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { TimeBlockCard } from './TimeBlockCard'
import type { TimeBlock } from '@/lib/types/app.types'

interface TimeBlockListProps {
  blocks: TimeBlock[]
  planId: string
  onEdit: (block: TimeBlock) => void
  onDelete: (id: string) => void
  onReorder: (planId: string, orderedIds: string[]) => void
}

export function TimeBlockList({ blocks, planId, onEdit, onDelete, onReorder }: TimeBlockListProps) {
  const sorted = [...blocks].sort((a, b) => a.sort_order - b.sort_order)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sorted.findIndex(b => b.id === active.id)
    const newIndex = sorted.findIndex(b => b.id === over.id)
    const reordered = arrayMove(sorted, oldIndex, newIndex)
    onReorder(planId, reordered.map(b => b.id))
  }

  if (sorted.length === 0) return null

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sorted.map(b => b.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {sorted.map(block => (
            <TimeBlockCard
              key={block.id}
              block={block}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
