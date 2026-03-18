-- monthly_goals: 월간 목표
create table public.monthly_goals (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  year       integer not null,
  month      integer not null check (month between 1 and 12),
  content    text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monthly_goals_user_ym_unique unique (user_id, year, month)
);

alter table public.monthly_goals enable row level security;
create policy "monthly_goals: own" on public.monthly_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger monthly_goals_updated_at before update on public.monthly_goals for each row execute function update_updated_at();
