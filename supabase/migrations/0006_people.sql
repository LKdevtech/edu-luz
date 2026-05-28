-- 0006_people.sql
-- EDU LUZ — parents, students, tutors (każdy 1:1 z profiles przez profile_id)

create table parents (
  profile_id  uuid primary key references profiles(id) on delete cascade,
  address     text,
  created_at  timestamptz not null default now()
);

create table students (
  profile_id  uuid primary key references profiles(id) on delete cascade,
  parent_id   uuid not null references parents(profile_id) on delete restrict,
  -- "2 LO", "kl. 7" — wpisywane swobodnie, brak normalizacji
  school_class text not null,
  school_name  text,                                  -- nazwa szkoły (opcjonalna)
  level        student_level not null,
  birth_date   date not null,
  created_at   timestamptz not null default now()
);

create index students_parent_idx on students (parent_id);
create index students_level_idx on students (level);

create table tutors (
  profile_id    uuid primary key references profiles(id) on delete cascade,
  bio           text,
  hired_date    date,
  created_at    timestamptz not null default now()
);

-- N:N między korepetytorem a przedmiotami które prowadzi.
create table tutor_subjects (
  tutor_id    uuid not null references tutors(profile_id) on delete cascade,
  subject_id  uuid not null references subjects(id) on delete restrict,
  primary key (tutor_id, subject_id)
);

-- Stawki korepetytora — wersjonowane, osobne dla indyw. i grupowych.
-- Aktualna stawka = najnowsza z effective_from <= today.
-- "Obowiązuje od" z admin-group-interactions może być: natychmiast, następny miesiąc, konkretna data.
create table tutor_rates (
  id              uuid primary key default gen_random_uuid(),
  tutor_id        uuid not null references tutors(profile_id) on delete cascade,
  individual_rate numeric(8,2) not null check (individual_rate >= 0),  -- zł/h indyw.
  group_rate      numeric(8,2) not null check (group_rate >= 0),       -- zł/h grupa (per uczeń w grupie? per godzinę pracy? — patrz README)
  effective_from  date not null,
  note            text,
  created_at      timestamptz not null default now(),
  created_by      uuid references profiles(id),
  unique (tutor_id, effective_from)
);

create index tutor_rates_lookup_idx on tutor_rates (tutor_id, effective_from desc);

-- Stały plan dostępności korepetytora — wieloblokowy per dzień.
-- Np. [[9,11], [15,18]] = dwa bloki: 9-11 i 15-18.
-- Każdy blok = osobny wiersz. Brak wierszy dla danego dnia = wolny dzień.
-- Edytuje: admin i korepetytor (jest source of truth, sekcja 3.5).
create table availability_blocks (
  id          uuid primary key default gen_random_uuid(),
  tutor_id    uuid not null references tutors(profile_id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time  time not null,
  end_time    time not null,
  check (end_time > start_time)
);

create index availability_blocks_tutor_idx on availability_blocks (tutor_id, day_of_week);

-- Dodatkowe terminy — korepetytor dodaje sam, używane do propozycji odrabiania.
-- Konkretna data (nie cykl tygodniowy).
create table extra_slots (
  id          uuid primary key default gen_random_uuid(),
  tutor_id    uuid not null references tutors(profile_id) on delete cascade,
  slot_date   date not null,
  start_time  time not null,
  end_time    time not null,
  room_id     uuid references rooms(id) on delete set null,
  -- 'open'   = dostępny do zaproponowania rodzicowi
  -- 'booked' = wykorzystany przez konkretne odrabianie (FK w makeup)
  -- 'expired' = data minęła bez wykorzystania
  status      text not null default 'open'
              check (status in ('open', 'booked', 'expired')),
  note        text,
  created_at  timestamptz not null default now(),
  check (end_time > start_time)
);

create index extra_slots_tutor_date_idx on extra_slots (tutor_id, slot_date);
create index extra_slots_open_idx on extra_slots (tutor_id, slot_date) where status = 'open';
