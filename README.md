# RetroStudy

학습 계획을 세우고, 매일 체크하고, 회고 데이터를 시각화하는 스터디 루틴 관리 앱입니다.

주간 반복 일정을 등록하면 날짜별 체크리스트로 이어지고, 사용자는 하루 학습을 마친 뒤 완료율과 피드백을 남길 수 있습니다. 대시보드는 스트릭, 평균 완료율, 회고 히트맵, 최근 회고를 보여줘 공부 습관이 쌓이는 과정을 한눈에 확인하게 합니다.

## 주요 기능

- Google OAuth 로그인
- 주간 학습 일정 템플릿 등록
- 날짜별 학습 계획과 체크리스트 관리
- 월간 목표와 주차별 계획 작성
- 일일 회고 작성과 수정
- 회고 히스토리 검색/필터
- 스트릭, 평균 완료율, 총 회고 수 통계
- 회고 활동 히트맵
- 태그/실패 패턴/학습 시간 분석용 대시보드 유틸
- Supabase RLS 기반 사용자별 데이터 보호
- 다크 모드와 페이지 전환 애니메이션

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui style components |
| Auth/DB | Supabase Auth, Supabase Postgres, `@supabase/ssr` |
| UI/UX | Framer Motion, Lucide React, Sonner |
| Forms/Validation | React Hook Form, Zod |
| Charts | Recharts |
| State/Interaction | Zustand, dnd-kit |

## 실행 방법

### 1. 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local.example`을 복사해 `.env.local`을 만듭니다.

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NEXT_PUBLIC_SITE_URL`은 Google OAuth callback 주소를 만들 때 사용합니다. 값이 없으면 브라우저의 현재 origin을 사용합니다.

### 3. Supabase 설정

Supabase SQL Editor 또는 Supabase CLI로 마이그레이션을 순서대로 적용합니다.

```text
supabase/migrations/0001_init.sql
supabase/migrations/0002_monthly_goals.sql
supabase/migrations/0003_weekly_schedule.sql
supabase/migrations/0004_daily_check_unique.sql
supabase/migrations/0005_cleanup_orphan_checks.sql
supabase/migrations/0006_monthly_week_plans.sql
```

Authentication > Providers에서 Google OAuth를 켜고, Redirect URL에 아래 주소를 등록합니다.

```text
http://localhost:3000/auth/callback
```

배포 환경에서는 실제 도메인의 `/auth/callback`도 추가합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 주요 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 결과 실행 |

## 서비스 흐름

1. `/login`에서 Google 계정으로 로그인합니다.
2. `/plan/setup`에서 요일별 반복 학습 일정을 등록합니다.
3. `/plan`에서 이번 주 계획을 확인합니다.
4. `/retro/[date]`에서 해당 날짜의 체크리스트를 완료하고 회고를 남깁니다.
5. `/history`에서 지난 회고를 검색하고 다시 확인합니다.
6. `/dashboard`에서 스트릭, 완료율, 회고 활동을 확인합니다.

## 주요 화면

| 경로 | 설명 |
| --- | --- |
| `/dashboard` | 스트릭, 평균 완료율, 총 회고 수, 회고 히트맵 |
| `/plan` | 이번 주 학습 일정 |
| `/plan/setup` | 요일별 반복 일정 설정 |
| `/plan/[date]` | 특정 날짜 학습 계획 |
| `/retro` | 오늘 회고로 이동 |
| `/retro/[date]` | 날짜별 체크/회고 작성 |
| `/history` | 회고 목록, 검색, 태그 필터 |
| `/login` | Google OAuth 로그인 |

## 데이터 구조

주요 테이블:

- `plans`: 날짜별 계획
- `time_blocks`: 계획 안의 시간대별 학습 블록
- `retrospectives`: 상세 회고와 성취율
- `monthly_goals`: 월간 목표
- `weekly_schedule_items`: 요일별 반복 일정
- `daily_check_items`: 날짜별 체크리스트
- `daily_retros`: 간단 일일 회고
- `monthly_week_plans`: 월별 주차 계획

모든 주요 테이블은 Supabase RLS로 `auth.uid() = user_id` 조건을 적용해 사용자별 데이터를 분리합니다.

## 프로젝트 구조

```text
retrostudy/
├─ src/app/
│  ├─ (auth)/login/           # 로그인
│  ├─ (app)/dashboard/        # 통계 대시보드
│  ├─ (app)/plan/             # 주간/일별 계획
│  ├─ (app)/retro/            # 날짜별 회고
│  ├─ (app)/history/          # 회고 히스토리
│  └─ api/                    # plans, retros, checks, stats API
├─ src/components/
│  ├─ dashboard/              # 차트, 히트맵, 통계 카드
│  ├─ plan/                   # 계획 편집, 체크리스트, 월간 캘린더
│  ├─ retro/                  # 회고 작성 UI
│  ├─ history/                # 검색/필터/목록
│  └─ shared/                 # 앱 네비게이션, 테마, 전환
├─ src/lib/
│  ├─ hooks/                  # usePlan, useRetro, useDashboardStats
│  ├─ supabase/               # client/server/middleware
│  ├─ utils/                  # 날짜, 통계, 동기화 유틸
│  ├─ validations/            # Zod validation
│  └─ types/                  # 앱/DB 타입
├─ supabase/migrations/       # DB schema, RLS, trigger
├─ SETUP.md
└─ README.md
```

## 포트폴리오 포인트

- 단순 CRUD가 아니라 주간 템플릿, 일별 체크, 회고, 히스토리, 대시보드가 이어지는 사용자 플로우를 구성했습니다.
- Supabase Auth와 RLS로 사용자별 데이터를 분리했습니다.
- 날짜/주차/월간 계획처럼 시간 축이 있는 데이터를 다루며, 체크 완료율과 스트릭을 계산합니다.
- 회고 데이터가 쌓이는 경험을 히트맵과 통계 카드로 시각화했습니다.

## 배포 메모

- Vercel 배포를 권장합니다.
- Vercel 환경 변수에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`을 설정합니다.
- Supabase Auth Redirect URL에 배포 도메인의 `/auth/callback`을 등록해야 Google 로그인이 동작합니다.
