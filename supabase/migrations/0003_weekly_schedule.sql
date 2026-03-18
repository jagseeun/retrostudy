-- updated_at 트리거 함수 (0001 없이 실행할 경우 대비)
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- uuid-ossp 확장 (없을 경우 대비)
create extension if not exists "uuid-ossp";

-- 요일별 고정 일정 (주간 템플릿)
-- day_of_week: 0=월, 1=화, 2=수, 3=목, 4=금, 5=토, 6=일
create table public.weekly_schedule_items (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  day_of_week  smallint not null check (day_of_week between 0 and 6),
  title        text not null check (char_length(title) between 1 and 200),
  start_time   time,
  end_time     time,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 특정 날의 체크리스트 (템플릿에서 자동 생성 또는 당일 추가)
create table public.daily_check_items (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  date             date not null,
  template_item_id uuid references public.weekly_schedule_items(id) on delete set null,
  title            text not null check (char_length(title) between 1 and 200),
  start_time       time,
  end_time         time,
  sort_order       integer not null default 0,
  checked          boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 일별 간단 회고
create table public.daily_retros (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  feedback   text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_retros_user_date_unique unique (user_id, date)
);

-- 인덱스
create index weekly_schedule_items_user_dow_idx on public.weekly_schedule_items(user_id, day_of_week);
create index daily_check_items_user_date_idx on public.daily_check_items(user_id, date);
create index daily_retros_user_date_idx on public.daily_retros(user_id, date desc);

-- RLS
alter table public.weekly_schedule_items enable row level security;
alter table public.daily_check_items      enable row level security;
alter table public.daily_retros           enable row level security;

create policy "weekly_schedule: own" on public.weekly_schedule_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_checks: own"    on public.daily_check_items      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_retros: own"    on public.daily_retros            for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Triggers
create trigger weekly_schedule_updated_at before update on public.weekly_schedule_items for each row execute function update_updated_at();
create trigger daily_checks_updated_at    before update on public.daily_check_items     for each row execute function update_updated_at();
create trigger daily_retros_updated_at   before update on public.daily_retros           for each row execute function update_updated_at();
