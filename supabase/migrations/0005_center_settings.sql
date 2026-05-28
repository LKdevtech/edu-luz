-- 0005_center_settings.sql
-- EDU LUZ — ustawienia centrum (singleton), godziny pracy, warunki umowy

-- Singleton: zawsze dokładnie 1 wiersz (id=1, check constraint).
create table center_settings (
  id            integer primary key default 1 check (id = 1),
  name          text not null,                       -- "EDU LUZ"
  full_name     text,                                -- "EDU LUZ Sp. z o.o."
  address       text not null,                       -- "ul. Szkolna 8, 97-200 Tomaszów Mazowiecki"
  phone         text not null,
  email         citext not null,
  nip           text,
  bank_account  text,                                -- "PL 12 3456 7890 1234 5678 9012 3456"
  bank_name     text,                                -- np. "PKO BP"
  payment_title_template text not null
    default 'Korepetycje EDU LUZ {miesiąc} {rok} - {uczeń}',
  updated_at    timestamptz not null default now()
);

-- Dwa harmonogramy (sekcja 3.8): 'lessons' = godziny zajęć, 'phone' = kontakt telefoniczny.
-- Per dzień tygodnia, włączane checkboxem (is_active).
create type working_hours_kind as enum ('lessons', 'phone');

create table working_hours (
  id          uuid primary key default gen_random_uuid(),
  kind        working_hours_kind not null,
  -- 0=poniedziałek ... 6=niedziela (ISO-like, ale 0-indexed dla wygody)
  day_of_week smallint not null check (day_of_week between 0 and 6),
  open_time   time not null,
  close_time  time not null,
  is_active   boolean not null default true,
  check (close_time > open_time),
  unique (kind, day_of_week)
);

-- Warunki umowy (admin-settings → contractDefaults). Singleton.
create table contract_terms (
  id                         integer primary key default 1 check (id = 1),
  payment_deadline_day       smallint not null default 10 check (payment_deadline_day between 1 and 28),
  min_contract_months        smallint not null default 1,
  cancellation_notice_days   smallint not null default 30,
  makeup_deadline_days       smallint not null default 60,
  late_entry_hours           smallint not null default 48,    -- blokada edycji wpisu po N godzinach
  cancellation_hours_cutoff  smallint not null default 24,    -- <24h = przepada, >24h = do odrobienia
  no_show_policy             text not null default
    'Lekcja przepada bez prawa do odrobienia.',
  cancellation_policy        text not null default
    'Odwołanie do 24h przed lekcją uprawnia do odrobienia. Po tym terminie lekcja przepada.',
  updated_at                 timestamptz not null default now()
);
