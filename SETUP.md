# RetroStudy 설정 가이드

## 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/0001_init.sql` 내용 실행
3. Authentication > Providers에서 Google OAuth 활성화

## 2. 환경변수 설정

`.env.local` 파일에 실제 값 입력:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. 로컬 개발

```bash
npm run dev
```

## 4. Vercel 배포

```bash
npm i -g vercel
vercel --prod
```

Vercel 대시보드에서 환경변수 등록:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 5. Supabase Auth 리다이렉트 URL 설정

Supabase > Authentication > URL Configuration:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth/callback`

## 6. 타입 자동 생성 (선택)

```bash
npx supabase login
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/types/database.types.ts
```
