create extension if not exists "uuid-ossp";

-- plans: 날짜별 계획 (유저당 하루에 1개)
create table public.plans (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plans_user_date_unique unique (user_id, date)
);

-- time_blocks: 시간대별 블록
create table public.time_blocks (
  id                uuid primary key default uuid_generate_v4(),
  plan_id           uuid not null references public.plans(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  title             text not null check (char_length(title) between 1 and 200),
  start_time        time,
  end_time          time,
  priority          text not null default 'medium' check (priority in ('high','medium','low')),
  estimated_minutes integer check (estimated_minutes > 0),
  tags              text[] not null default '{}',
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index time_blocks_plan_id_idx on public.time_blocks(plan_id);
create index time_blocks_tags_idx    on public.time_blocks using gin(tags);

-- retrospectives: 회고
create table public.retrospectives (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  plan_id              uuid references public.plans(id) on delete set null,
  date                 date not null,
  completed_block_ids  uuid[] not null default '{}',
  skipped_block_ids    uuid[] not null default '{}',
  failed_block_ids     uuid[] not null default '{}',
  achievement_rate     numeric(5,2) generated always as (
    case
      when coalesce(array_length(completed_block_ids,1),0)
         + coalesce(array_length(skipped_block_ids,1),0)
         + coalesce(array_length(failed_block_ids,1),0) = 0 then 0
      else round(
        coalesce(array_length(completed_block_ids,1),0)::numeric
        / (coalesce(array_length(completed_block_ids,1),0)
         + coalesce(array_length(skipped_block_ids,1),0)
         + coalesce(array_length(failed_block_ids,1),0))
        * 100, 2)
    end
  ) stored,
  study_minutes        integer not null default 0 check (study_minutes >= 0),
  tags                 text[] not null default '{}',
  -- 성공 회고 (필수)
  done_well            text not null check (char_length(done_well) between 1 and 1000),
  self_praise          text not null check (char_length(self_praise) between 1 and 500),
  learned              text not null check (char_length(learned) between 1 and 1000),
  -- 실패 회고 (선택)
  failed_what          text,
  failed_cause         text,
  failed_improve       text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint retros_user_date_unique unique (user_id, date)
);

create index retros_user_date_idx on public.retrospectives(user_id, date desc);
create index retros_tags_idx      on public.retrospectives using gin(tags);

-- 전문검색용 tsvector
alter table public.retrospectives
  add column search_vector tsvector generated always as (
    to_tsvector('simple',
      coalesce(done_well,'') || ' ' || coalesce(self_praise,'') || ' ' ||
      coalesce(learned,'') || ' ' || coalesce(failed_what,'') || ' ' ||
      coalesce(failed_cause,'') || ' ' || coalesce(failed_improve,'')
    )
  ) stored;

create index retros_search_idx on public.retrospectives using gin(search_vector);

-- updated_at 자동 갱신 트리거
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger plans_updated_at      before update on public.plans           for each row execute function update_updated_at();
create trigger time_blocks_updated_at before update on public.time_blocks    for each row execute function update_updated_at();
create trigger retros_updated_at     before update on public.retrospectives  for each row execute function update_updated_at();

-- RLS
alter table public.plans           enable row level security;
alter table public.time_blocks     enable row level security;
alter table public.retrospectives  enable row level security;

create policy "plans: own" on public.plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "blocks: own" on public.time_blocks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "retros: own" on public.retrospectives for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 스트릭 계산 함수
create or replace function get_streak(p_user_id uuid)
returns integer language sql stable as $$
  with dated as (
    select date,
           date - (row_number() over (order by date))::integer as grp
    from public.retrospectives
    where user_id = p_user_id
    order by date desc
  ),
  groups as (
    select grp, count(*) as cnt, max(date) as last_date
    from dated group by grp
  )
  select coalesce(sum(cnt),0)::integer
  from groups
  where last_date >= current_date - 1
$$;

-- 통계 뷰
create or replace view public.retro_stats as
select
  user_id,
  date_trunc('week', date)::date as week_start,
  sum(study_minutes)              as total_minutes,
  avg(achievement_rate)           as avg_achievement,
  count(*)                        as retro_count
from public.retrospectives
group by user_id, date_trunc('week', date)::date;
