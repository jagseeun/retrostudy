'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  subLabel?: string
  icon?: ReactNode
  accent?: string
  iconBg?: string
  index?: number
}

export function StatCard({ label, value, subLabel, icon, accent = 'text-white', iconBg = 'bg-neutral-100 dark:bg-neutral-800', index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07, ease: 'easeOut' }}
      className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-4 flex flex-col gap-3"
    >
      {icon && (
        <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs uppercase tracking-widest font-semibold text-neutral-400 dark:text-neutral-500 mb-1">{label}</p>
        <p className={`text-2xl font-bold tracking-tight ${accent}`}>{value}</p>
        {subLabel && <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-0.5">{subLabel}</p>}
      </div>
    </motion.div>
  )
}
