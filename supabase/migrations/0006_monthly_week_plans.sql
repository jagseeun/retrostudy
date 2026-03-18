create table if not exists monthly_week_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year integer not null,
  month integer not null check (month between 1 and 12),
  week_number integer not null check (week_number between 1 and 6),
  week_start date not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year, month, week_number)
);

alter table monthly_week_plans enable row level security;

create policy "Users can manage their own monthly week plans"
  on monthly_week_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function update_monthly_week_plans_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger monthly_week_plans_updated_at
  before update on monthly_week_plans
  for each row execute function update_monthly_week_plans_updated_at();
