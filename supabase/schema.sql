-- AgentLab cloud progress schema.
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query) once.
-- It stores each user's entire AppState as a single JSONB row, protected by
-- row-level security so users can only read/write their own data.

create table if not exists public.user_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

-- A user can see only their own row.
drop policy if exists "read own state" on public.user_state;
create policy "read own state"
  on public.user_state for select
  using (auth.uid() = user_id);

-- A user can insert only a row keyed to themselves.
drop policy if exists "insert own state" on public.user_state;
create policy "insert own state"
  on public.user_state for insert
  with check (auth.uid() = user_id);

-- A user can update only their own row.
drop policy if exists "update own state" on public.user_state;
create policy "update own state"
  on public.user_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- A user can delete only their own row.
drop policy if exists "delete own state" on public.user_state;
create policy "delete own state"
  on public.user_state for delete
  using (auth.uid() = user_id);
