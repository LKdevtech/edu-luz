-- 0003_profiles.sql
-- EDU LUZ — profiles (rozszerza auth.users z Supabase Auth)
-- Każdy uczeń/rodzic/tutor/admin ma rekord w profiles z dokładnie jedną rolą.

create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          user_role not null,
  first_name    text not null,
  last_name     text not null,
  email         citext unique,
  phone         text,
  avatar_url    text,
  initials      text generated always as (
    upper(left(first_name, 1) || left(last_name, 1))
  ) stored,
  is_active     boolean not null default true,
  last_login_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index profiles_role_idx on profiles (role) where is_active;
create index profiles_last_name_idx on profiles (last_name);

-- Trigger: aktualizacja updated_at na każdym update.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();
