-- 0004_dictionaries.sql
-- EDU LUZ — słowniki: przedmioty, sale

create table subjects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,         -- "Matematyka", "Angielski", "Fizyka", ...
  color       text not null,                -- hex z mockupu, np. "#3B8FF0"
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table rooms (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,         -- "Sala 1"
  capacity    integer not null check (capacity > 0),
  equipment   text,                         -- "Tablica, projektor"
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
