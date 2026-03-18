'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { LayoutDashboard, CalendarCheck2, BookOpen, History, Moon, Sun } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/plan', label: '계획', icon: CalendarCheck2 },
  { href: '/retro', label: '회고', icon: BookOpen },
  { href: '/history', label: '히스토리', icon: History },
]

export function AppNav() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-56 min-h-screen bg-white dark:bg-neutral-950 border-r border-neutral-100 dark:border-neutral-800/80 px-3 py-6 gap-0.5">
        {/* 로고 */}
        <div className="px-3 mb-7 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center shrink-0">
              <BookOpen size={13} className="text-white" />
            </div>
            <span className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">RetroStudy</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="테마 전환"
          >
            {mounted ? (
              theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />
            ) : <Moon size={14} />}
          </button>
        </div>

        {/* 섹션 레이블 */}
        <p className="px-3 mb-1 text-[10px] uppercase tracking-widest font-semibold text-neutral-400 dark:text-neutral-600">메뉴</p>

        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href.split('/').slice(0, 2).join('/'))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-white'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r-full" />
              )}
              <Icon size={16} className={active ? 'text-blue-500' : ''} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-t border-neutral-100 dark:border-neutral-800/80 flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const basePath = href.split('/')[1]
          const active = pathname.split('/')[1] === basePath
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium min-h-[56px] justify-center relative',
                active ? 'text-blue-500' : 'text-neutral-400 dark:text-neutral-500'
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-b-full" />
              )}
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className={active ? 'text-blue-500' : ''}>{label}</span>
            </Link>
          )
        })}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-1 py-3 text-xs font-medium min-h-[56px] justify-center px-3 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200"
          aria-label="테마 전환"
        >
          {mounted ? (
            theme === 'dark' ? <Sun size={20} strokeWidth={1.8} /> : <Moon size={20} strokeWidth={1.8} />
          ) : <Moon size={20} strokeWidth={1.8} />}
          <span>테마</span>
        </button>
      </nav>
    </>
  )
}
