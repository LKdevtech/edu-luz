-- 0010_entries_homework.sql
-- EDU LUZ — wpisy po lekcjach + praca domowa
--
-- Klucz: jedna lekcja = jeden wpis (entries). Treść wspólna dla całej grupy
-- (temat, notatka_dla_ucznia, praca_domowa, notatka_wewnętrzna).
-- Uwagi dla rodzica są INDYWIDUALNE per uczeń (entry_parent_notes) — rodzic A
-- nie może zobaczyć uwag o uczniu B w tej samej lekcji grupowej.

create table entries (
  id                 uuid primary key default gen_random_uuid(),
  lesson_id          uuid not null unique references lessons(id) on delete cascade,
  status             entry_status not null default 'missing',
  topic              text,
  note_for_student   text,        -- wspólna dla całej grupy
  internal_note      text,        -- widoczna tylko admin + tutor (sekcja 9 tabela widoczności)
  published_at       timestamptz,
  -- Blokada edycji po N godzinach od lesson_date (contract_terms.late_entry_hours).
  locked_at          timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  created_by         uuid references profiles(id)
);

create index entries_status_idx on entries (status);

create trigger entries_updated_at
  before update on entries
  for each row execute function set_updated_at();

-- Per-student uwagi dla rodzica (tylko jeśli tutor uznał za potrzebne).
-- Brak wiersza = brak uwag dla tego rodzica w tej lekcji.
create table entry_parent_notes (
  entry_id    uuid not null references entries(id) on delete cascade,
  student_id  uuid not null references students(profile_id) on delete cascade,
  note        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (entry_id, student_id)
);

create trigger entry_parent_notes_updated_at
  before update on entry_parent_notes
  for each row execute function set_updated_at();

-- Praca domowa — wspólna dla grupy (jak temat). Per-lesson, więc trzymana w entry
-- jako pole tekstowe + termin. Indywidualne checkboxy uczniów → homework_completions.
create table homework (
  id           uuid primary key default gen_random_uuid(),
  entry_id     uuid not null unique references entries(id) on delete cascade,
  content      text not null,
  due_date     date,
  created_at   timestamptz not null default now()
);

-- Status PD per uczeń. UWAGA: jedyna mutacja dostępna dla roli 'student' (sekcja 9).
-- Tutor może oznaczyć 'verified' przy weryfikacji.
create table homework_completions (
  homework_id   uuid not null references homework(id) on delete cascade,
  student_id    uuid not null references students(profile_id) on delete cascade,
  is_done       boolean not null default false,
  done_at       timestamptz,
  is_verified   boolean not null default false,    -- "Sprawdzona ✓" vs "Niesprawdzona"
  verified_at   timestamptz,
  verified_by   uuid references tutors(profile_id),
  primary key (homework_id, student_id)
);

create index homework_completions_student_idx on homework_completions (student_id, is_done);
