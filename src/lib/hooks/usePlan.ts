'use client'

import { useState, useCallback, useOptimistic } from 'react'
import type { PlanWithBlocks, TimeBlock } from '@/lib/types/app.types'
import type { CreateTimeBlockInput, UpdateTimeBlockInput } from '@/lib/validations/time-block'

export function usePlan(initialPlan: PlanWithBlocks | null) {
  const [plan, setPlan] = useState<PlanWithBlocks | null>(initialPlan)
  const [loading, setLoading] = useState(false)

  const [optimisticPlan, updateOptimistic] = useOptimistic(
    plan,
    (state, action: { type: string; payload: unknown }) => {
      if (!state) return state
      switch (action.type) {
        case 'ADD_BLOCK': {
          const block = action.payload as TimeBlock
          return { ...state, time_blocks: [...state.time_blocks, block] }
        }
        case 'UPDATE_BLOCK': {
          const updated = action.payload as TimeBlock
          return {
            ...state,
            time_blocks: state.time_blocks.map(b => b.id === updated.id ? updated : b),
          }
        }
        case 'DELETE_BLOCK': {
          const id = action.payload as string
          return {
            ...state,
            time_blocks: state.time_blocks.filter(b => b.id !== id),
          }
        }
        case 'REORDER': {
          const ids = action.payload as string[]
          const blockMap = Object.fromEntries(state.time_blocks.map(b => [b.id, b]))
          const reordered = ids.map((id, i) => ({ ...blockMap[id], sort_order: i }))
          return { ...state, time_blocks: reordered }
        }
        default:
          return state
      }
    }
  )

  const ensurePlan = useCallback(async (date: string): Promise<PlanWithBlocks | null> => {
    const res = await fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    })
    if (!res.ok) return null
    const data = await res.json()
    setPlan(data)
    return data
  }, [])

  const addBlock = useCallback(async (input: CreateTimeBlockInput) => {
    if (!plan) return
    setLoading(true)
    // Optimistic temp ID
    const tempBlock: TimeBlock = {
      ...input,
      id: `temp-${Date.now()}`,
      user_id: '',
      start_time: input.start_time ?? null,
      end_time: input.end_time ?? null,
      estimated_minutes: input.estimated_minutes ?? null,
      tags: input.tags ?? [],
      sort_order: input.sort_order ?? plan.time_blocks.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    updateOptimistic({ type: 'ADD_BLOCK', payload: tempBlock })
    try {
      const res = await fetch('/api/time-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (res.ok) {
        const block = await res.json()
        setPlan(prev => prev ? { ...prev, time_blocks: [...prev.time_blocks.filter(b => !b.id.startsWith('temp-')), block] } : prev)
      }
    } finally {
      setLoading(false)
    }
  }, [plan, updateOptimistic])

  const updateBlock = useCallback(async (id: string, input: UpdateTimeBlockInput) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/time-blocks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (res.ok) {
        const block = await res.json()
        setPlan(prev => prev ? {
          ...prev,
          time_blocks: prev.time_blocks.map(b => b.id === id ? block : b),
        } : prev)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteBlock = useCallback(async (id: string) => {
    updateOptimistic({ type: 'DELETE_BLOCK', payload: id })
    try {
      await fetch(`/api/time-blocks/${id}`, { method: 'DELETE' })
      setPlan(prev => prev ? {
        ...prev,
        time_blocks: prev.time_blocks.filter(b => b.id !== id),
      } : prev)
    } catch {
      // Revert handled by optimistic state
    }
  }, [updateOptimistic])

  const reorderBlocks = useCallback(async (planId: string, orderedIds: string[]) => {
    updateOptimistic({ type: 'REORDER', payload: orderedIds })
    try {
      await fetch(`/api/plans/${planId}/blocks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      })
      setPlan(prev => {
        if (!prev) return prev
        const blockMap = Object.fromEntries(prev.time_blocks.map(b => [b.id, b]))
        const reordered = orderedIds.map((id, i) => ({ ...blockMap[id], sort_order: i }))
        return { ...prev, time_blocks: reordered }
      })
    } catch {
      // Revert
    }
  }, [updateOptimistic])

  return {
    plan: optimisticPlan,
    loading,
    ensurePlan,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
  }
}
