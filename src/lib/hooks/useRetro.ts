'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Retrospective, RetroFormData } from '@/lib/types/app.types'
import { toast } from 'sonner'

interface UseRetroOptions {
  initialRetro: Retrospective | null
  date: string
}

export function useRetro({ initialRetro, date }: UseRetroOptions) {
  const [retro, setRetro] = useState<Retrospective | null>(initialRetro)
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(async (data: Partial<RetroFormData>) => {
    setSaving(true)
    try {
      if (retro) {
        // Update
        const res = await fetch(`/api/retros/${retro.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (res.ok) {
          const updated = await res.json()
          setRetro(updated)
          toast.success('저장됨', { duration: 1500 })
        }
      } else {
        // Create
        const res = await fetch('/api/retros', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, date }),
        })
        if (res.ok) {
          const created = await res.json()
          setRetro(created)
          toast.success('저장됨', { duration: 1500 })
        } else if (res.status === 409) {
          toast.error('이미 해당 날짜의 회고가 있습니다')
        }
      }
    } catch {
      toast.error('저장에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }, [retro, date])

  const autoSave = useCallback((data: Partial<RetroFormData>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(data), 2000)
  }, [save])

  const saveNow = useCallback((data: Partial<RetroFormData>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    return save(data)
  }, [save])

  const deleteRetro = useCallback(async () => {
    if (!retro) return
    const res = await fetch(`/api/retros/${retro.id}`, { method: 'DELETE' })
    if (res.ok) {
      setRetro(null)
      toast.success('회고가 삭제되었습니다')
    }
  }, [retro])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return { retro, saving, autoSave, saveNow, deleteRetro }
}
