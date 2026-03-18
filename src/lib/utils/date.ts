export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayString(): string {
  return toDateString(new Date())
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseDate(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

export function formatShortDate(dateStr: string): string {
  const date = parseDate(dateStr)
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr)
  date.setDate(date.getDate() + days)
  return toDateString(date)
}

export function isToday(dateStr: string): boolean {
  return dateStr === todayString()
}

export function isFuture(dateStr: string): boolean {
  return dateStr > todayString()
}

export function getWeekStart(dateStr: string): string {
  const date = parseDate(dateStr)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  return toDateString(date)
}

// 0=월, 1=화, ..., 6=일 (JS getDay() 0=Sun 보정)
export function getDayOfWeek(dateStr: string): number {
  return (parseDate(dateStr).getDay() + 6) % 7
}

// start_time 기준 정렬 (없으면 sort_order 기준)
export function sortByTime<T extends { start_time: string | null; sort_order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.start_time && b.start_time) return a.start_time.localeCompare(b.start_time)
    if (a.start_time) return -1
    if (b.start_time) return 1
    return a.sort_order - b.sort_order
  })
}

export const DAY_SHORT_LABELS = ['월', '화', '수', '목', '금', '토', '일']
export const DAY_FULL_LABELS = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']

// Get Mon-Sun week days containing the given date
export function getWeekDays(dateStr: string): string[] {
  const weekStart = getWeekStart(dateStr) // Monday
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

// Get monthly calendar grid (Sun-Sat columns, rows = weeks)
// Returns null for padding cells outside the month
export function getMonthCalendarGrid(year: number, month: number): (string | null)[][] {
  const firstDay = new Date(year, month - 1, 1)
  const totalDays = new Date(year, month, 0).getDate()

  // 0=Sun, 1=Mon, ..., 6=Sat → start offset for Sun-first grid
  const startOffset = firstDay.getDay()

  const cells: (string | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) {
    cells.push(toDateString(new Date(year, month - 1, d)))
  }
  while (cells.length % 7 !== 0) cells.push(null)

  const rows: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }
  return rows
}

export function formatYearMonth(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  })
}

export function getYearMonth(dateStr: string): { year: number; month: number } {
  const parts = dateStr.split('-')
  return { year: parseInt(parts[0]), month: parseInt(parts[1]) }
}

// from ~ to 사이 모든 날짜 생성
export function generateDateRange(from: string, to: string): string[] {
  const days: string[] = []
  const end = parseDate(to)
  let cur = parseDate(from)
  while (cur <= end) {
    days.push(toDateString(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

// Generate last N days as date strings
export function getLastNDays(n: number): string[] {
  const days: string[] = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(toDateString(d))
  }
  return days
}

// Generate 52-week heatmap grid (364 days)
export function generateHeatmapDates(): string[] {
  return getLastNDays(364)
}
