'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { BookOpen, TrendingUp, Calendar, Target } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handlePageShow = () => setLoading(false)
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  const handleGoogleLogin = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback` },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center px-4">

      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-100/60 dark:bg-blue-950/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-indigo-100/60 dark:bg-indigo-950/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* 로고 & 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-5 shadow-lg shadow-blue-200 dark:shadow-blue-950/50">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight mb-2">
            RetroStudy
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-base">
            스터디 회고를 습관으로, 성장을 기록으로
          </p>
        </div>

        {/* 기능 소개 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Calendar, label: '일일 학습', desc: '매일 계획 & 기록' },
            { icon: TrendingUp, label: '회고 분석', desc: '성장 패턴 파악' },
            { icon: Target, label: '목표 달성', desc: '월간 목표 관리' },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="bg-white/70 dark:bg-neutral-800/60 backdrop-blur-sm border border-white dark:border-neutral-700/50 rounded-2xl p-3.5 text-center"
            >
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 mb-2">
                <Icon size={15} className="text-blue-500 dark:text-blue-400" />
              </div>
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{label}</p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border border-white dark:border-neutral-800 rounded-3xl p-7 shadow-xl shadow-neutral-200/60 dark:shadow-black/30">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 text-center mb-5">
            계정으로 시작하기
          </p>

          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            variant="outline"
            className="w-full h-12 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-750 hover:border-neutral-300 dark:hover:border-neutral-600 gap-3 text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? '로그인 중...' : 'Google로 계속하기'}
          </Button>
        </div>

        <p className="text-center text-xs text-neutral-400 dark:text-neutral-600 mt-5">
          로그인하면 이용약관 및 개인정보처리방침에 동의하게 됩니다
        </p>

      </div>
    </div>
  )
}
