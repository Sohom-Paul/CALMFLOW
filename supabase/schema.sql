-- Run this in Supabase SQL Editor.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  age integer not null check (age between 5 and 120),
  profession text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meditation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  minutes integer not null check (minutes > 0 and minutes <= 180),
  completed_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.meditation_sessions enable row level security;

create policy "profiles own row" on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "sessions own rows" on public.meditation_sessions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists meditation_sessions_user_date
on public.meditation_sessions(user_id, completed_at desc);
