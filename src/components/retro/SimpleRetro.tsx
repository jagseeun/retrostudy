'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Check, Lock, Loader2, Clock } from 'lucide-react'
import type { DailyCheckItem, DailyRetro } from '@/lib/types/app.types'

interface SimpleRetroProps {
  date: string
  checkItems: DailyCheckItem[]
  initialRetro: DailyRetro | null
}

const TEMPLATES = [
  { label: '자유', value: '' },
  {
    label: 'KPT',
    value: `✅ Keep (유지할 것)\n\n\n🔧 Problem (개선할 것)\n\n\n🚀 Try (시도할 것)\n\n`,
  },
  {
    label: '질문형',
    value: `오늘 뭘 했나요?\n\n\n잘한 점은?\n\n\n아쉬운 점은?\n\n\n내일은 어떻게 할 건가요?\n\n`,
  },
]

export function SimpleRetro({ date, checkItems: initialCheckItems, initialRetro }: SimpleRetroProps) {
  const router = useRouter()

  // 다음날 01:00까지 편집 가능
  const [isEditable, setIsEditable] = useState(false)
  useEffect(() => {
    const check = () => {
      const startOfDay = new Date(date + 'T00:00:00')
      const deadline = new Date(date + 'T01:00:00')
      deadline.setDate(deadline.getDate() + 1)
      setIsEditable(new Date() >= startOfDay && new Date() < deadline)
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [date])

  const [items, setItems] = useState<DailyCheckItem[]>(initialCheckItems)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState(initialRetro?.feedback ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(!!initialRetro?.feedback)
  const [error, setError] = useState<string | null>(null)
  const [userTyped, setUserTyped] = useState(!!initialRetro?.feedback)

  const toggleItem = async (item: DailyCheckItem) => {
    if (!isEditable || togglingId) return
    setTogglingId(item.id)
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, checked: !i.checked } : i)))
    try {
      await fetch(`/api/daily-checks/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked: !item.checked }),
      })
    } catch {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, checked: item.checked } : i)))
    } finally {
      setTogglingId(null)
    }
  }

  const checkedItems = items.filter((i) => i.checked)
  const uncheckedItems = items.filter((i) => !i.checked)
  const total = items.length
  const checked = checkedItems.length
  const rate = total > 0 ? Math.round((checked / total) * 100) : 0

  const applyTemplate = (value: string) => {
    if (userTyped && !confirm('현재 작성 내용이 사라집니다. 계속할까요?')) return
    setFeedback(value)
    setUserTyped(false)
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/daily-retros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, feedback }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? '저장에 실패했어요')
        return
      }
      setSaved(true)
    } catch {
      setError('네트워크 오류가 발생했어요')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 완료율 카드 */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">{checked}</span>
            <span className="text-xl text-neutral-400 font-medium">/ {total}</span>
          </div>
          <div className={cn(
            'text-2xl font-bold tabular-nums',
            rate >= 80 ? 'text-green-500' : rate >= 50 ? 'text-yellow-500' : 'text-neutral-400'
          )}>
            {rate}%
          </div>
        </div>
        {total > 0 && (
          <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
              )}
              style={{ width: `${rate}%` }}
            />
          </div>
        )}
      </div>

      {/* 체크 항목 */}
      {items.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {items.map((item, i) => {
            const isToggling = togglingId === item.id
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item)}
                disabled={!isEditable || !!togglingId}
                initial={{ opacity: 0, x: 20, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22, delay: i * 0.06 }}
                whileTap={isEditable ? { scale: 0.98 } : {}}
                className={cn(
                  'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border shadow-sm text-left transition-all w-full',
                  item.checked
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/60'
                    : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 opacity-70',
                  isEditable && !item.checked && 'hover:opacity-100 hover:border-neutral-200 dark:hover:border-neutral-700',
                  isEditable && item.checked && 'hover:border-green-300 dark:hover:border-green-700',
                  !isEditable && 'cursor-default'
                )}
              >
                <motion.div
                  animate={item.checked ? { scale: [1, 1.3, 1], backgroundColor: '#22c55e' } : { scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    'w-4 h-4 rounded-full flex items-center justify-center shrink-0',
                    item.checked ? 'bg-green-500' : 'border-2 border-neutral-300 dark:border-neutral-600'
                  )}
                >
                  {isToggling ? (
                    <Loader2 size={8} className="animate-spin text-white" />
                  ) : item.checked ? (
                    <Check size={9} className="text-white" />
                  ) : null}
                </motion.div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className={cn(
                    'text-sm font-medium',
                    item.checked ? 'text-green-700 dark:text-green-300' : 'text-neutral-500 dark:text-neutral-500'
                  )}>
                    {item.title}
                  </span>
                  {(item.start_time || item.end_time) && (
                    <span className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-600 mt-0.5">
                      <Clock size={10} />
                      {item.start_time?.slice(0, 5)}{item.end_time ? `–${item.end_time.slice(0, 5)}` : ''}
                    </span>
                  )}
                </div>
                <AnimatePresence>
                  {item.checked && !isToggling && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.15 }}
                      className="text-xs font-semibold text-green-500 shrink-0"
                    >
                      완료
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </div>
      )}

      {total === 0 && (
        <div className="py-6 text-center">
          <p className="text-neutral-400 text-sm">체크 항목이 없어요</p>
        </div>
      )}

      {/* 피드백 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest font-semibold text-neutral-400 dark:text-neutral-500">피드백</p>
          {isEditable && (
            <div className="flex gap-1">
              {TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => applyTemplate(t.value)}
                  className="px-2 py-0.5 rounded-md text-xs border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {isEditable ? (
          <Textarea
            value={feedback}
            onChange={(e) => { setFeedback(e.target.value); setSaved(false); setUserTyped(true) }}
            placeholder="오늘 하루 어떠했나요?"
            className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm resize-none min-h-[180px] leading-relaxed focus-visible:ring-blue-500/50 focus-visible:border-blue-400 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 shadow-sm"
          />
        ) : (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-4 min-h-[100px] shadow-sm select-none cursor-default">
            {feedback ? (
              <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">{feedback}</p>
            ) : (
              <p className="text-sm text-neutral-300 dark:text-neutral-700 italic">작성된 회고가 없어요</p>
            )}
          </div>
        )}

        {!isEditable && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-300 dark:text-neutral-700">
            <Lock size={11} />
            <span>지난 날의 회고는 수정할 수 없어요</span>
          </div>
        )}
      </div>

      {/* 에러 */}
      {error && (
        <p className="text-sm text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* 버튼 */}
      <div className="flex items-center gap-3">
        {isEditable && (
          <Button
            onClick={handleSave}
            disabled={saving || saved}
            className={cn(
              'flex-1 h-11 font-semibold text-sm shadow-sm',
              saved
                ? 'bg-green-500 hover:bg-green-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            )}
          >
            {saving ? '저장 중...' : saved ? '저장됨' : '회고 저장'}
          </Button>
        )}
        <Button
          variant="ghost"
          className={cn(
            'h-11 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800',
            !isEditable && 'flex-1'
          )}
          onClick={() => router.push(`/plan/${date}`)}
        >
          계획으로
        </Button>
      </div>
    </div>
  )
}
