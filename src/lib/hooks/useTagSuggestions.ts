'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTagSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchTags() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get tags from time_blocks and retrospectives
      const [blocksResult, retrosResult] = await Promise.all([
        supabase.from('time_blocks').select('tags').eq('user_id', user.id),
        supabase.from('retrospectives').select('tags').eq('user_id', user.id),
      ])

      const allTags = new Set<string>()
      blocksResult.data?.forEach(row => row.tags.forEach((t: string) => allTags.add(t)))
      retrosResult.data?.forEach(row => row.tags.forEach((t: string) => allTags.add(t)))

      setSuggestions([...allTags].sort())
    }
    fetchTags()
  }, [])

  const filterSuggestions = useCallback(
    (query: string) => {
      if (!query) return suggestions
      return suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    },
    [suggestions]
  )

  return { suggestions, filterSuggestions }
}
