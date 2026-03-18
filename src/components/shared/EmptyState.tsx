import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="mb-4 w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1">{title}</h3>
      {description && <p className="text-sm text-neutral-400 mb-4 max-w-sm leading-relaxed">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
