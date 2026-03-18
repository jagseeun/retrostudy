'use client'

import { useState, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBar({ onSearch, placeholder = '회고 내용 검색...' }: SearchBarProps) {
  const [value, setValue] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback((q: string) => {
    setValue(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onSearch(q), 300)
  }, [onSearch])

  return (
    <div className="relative">
      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
      <Input
        value={value}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9 h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-300 dark:placeholder:text-neutral-600 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 shadow-sm rounded-xl"
      />
      {value && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 w-5 h-5 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}
