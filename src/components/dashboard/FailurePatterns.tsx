import type { FailurePattern } from '@/lib/types/app.types'

interface FailurePatternsProps {
  patterns: FailurePattern[]
}

export function FailurePatterns({ patterns }: FailurePatternsProps) {
  if (patterns.length === 0) {
    return <p className="text-sm text-neutral-400 dark:text-neutral-600 py-4 text-center">패턴 없음 — 계속 잘하고 있어요!</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {patterns.map((p, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-neutral-800 dark:text-neutral-200 line-clamp-2">{p.cause}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{p.count}회 반복</p>
          </div>
        </div>
      ))}
    </div>
  )
}
