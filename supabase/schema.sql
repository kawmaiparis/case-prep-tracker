-- Run this in the Supabase SQL editor to set up the schema.

-- case_types: static lookup, shared across all users
create table if not exists case_types (
  id   serial primary key,
  name text not null unique
);

insert into case_types (name) values
  ('profitability'),
  ('market_entry'),
  ('m&a'),
  ('market_sizing'),
  ('other')
on conflict do nothing;

alter table case_types enable row level security;

create policy "authenticated users can read case types"
  on case_types for select
  to authenticated
  using (true);

-- partners: per-user lookup
create table if not exists partners (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  is_paid_coach boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (user_id, name)
);

alter table partners enable row level security;

create policy "users manage own partners"
  on partners for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- trigger function reused by any table that needs auto-updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- sessions: one row per practice session
create table if not exists sessions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  date                date not null,
  partner_id          uuid references partners(id) on delete set null,
  case_type_id        integer references case_types(id),
  case_name           text,
  case_book           text,
  industry            text,
  notes               text,
  score_structure     integer not null check (score_structure between 1 and 5),
  score_math          integer not null check (score_math between 1 and 5),
  score_creativity    integer not null check (score_creativity between 1 and 5),
  score_communication integer not null check (score_communication between 1 and 5),
  score_data_analysis integer not null check (score_data_analysis between 1 and 5),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger sessions_set_updated_at
  before update on sessions
  for each row execute function set_updated_at();

alter table sessions enable row level security;

create policy "users manage own sessions"
  on sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Seed partners for the initial user.
-- Replace '<your-user-uuid>' with the UUID from auth.users after first login.
-- insert into partners (user_id, name, is_paid_coach) values
--   ('<your-user-uuid>', 'Annika', true),
--   ('<your-user-uuid>', 'Robbie', false),
--   ('<your-user-uuid>', 'Adam', false),
--   ('<your-user-uuid>', 'Mix', false),
--   ('<your-user-uuid>', 'Noon', false),
--   ('<your-user-uuid>', 'Poomer', false);
