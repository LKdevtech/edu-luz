-- 0009_lessons.sql
-- EDU LUZ — lessons (konkretne wystąpienia z datą) + attendance

create table lessons (
  id                uuid primary key default gen_random_uuid(),
  class_id          uuid not null references classes(id) on delete restrict,
  -- Denormalizacja dla wydajności i historii (gdyby class się zmienił):
  tutor_id          uuid not null references tutors(profile_id) on delete restrict,
  subject_id        uuid not null references subjects(id) on delete restrict,
  room_id           uuid references rooms(id) on delete set null,
  -- Czas konkretnej lekcji.
  lesson_date       date not null,
  start_time        time not null,
  end_time          time not null,
  duration_minutes  smallint generated always as (
    extract(epoch from (end_time - start_time))::int / 60
  ) stored,
  status            lesson_status not null default 'planned',

  -- Powiązanie z wystąpieniem cyklu (do generowania kalendarza).
  weekly_slot_id    uuid references weekly_slots(id) on delete set null,

  -- Odwołanie: kto + kiedy + powód + czy >24h przed (decyduje o prawie do odrobienia).
  cancelled_at      timestamptz,
  cancelled_by      uuid references profiles(id),
  cancel_reason     text,
  cancelled_more_than_24h boolean,

  -- Odrabianie: jeśli ta lekcja jest odrabianiem innej.
  makeup_for_lesson_id uuid references lessons(id) on delete set null,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  check (end_time > start_time)
);

create index lessons_date_idx on lessons (lesson_date);
create index lessons_tutor_date_idx on lessons (tutor_id, lesson_date);
create index lessons_class_idx on lessons (class_id);
create index lessons_status_idx on lessons (status);
-- Zapytania typu "kolejne nadchodzące lekcje rodzica/ucznia" idą przez class → student/group.

create trigger lessons_updated_at
  before update on lessons
  for each row execute function set_updated_at();

-- Obecność: wiersz per (lesson, student). Dla indyw. będzie 1 wiersz, dla grupy N.
create table attendance (
  id               uuid primary key default gen_random_uuid(),
  lesson_id        uuid not null references lessons(id) on delete cascade,
  student_id       uuid not null references students(profile_id) on delete restrict,
  status           attendance_status not null,
  -- Czy nieobecność została zgłoszona >24h wcześniej (system weryfikuje automatycznie,
  -- ale wynik trzymamy żeby UI nie liczył tego co request).
  notified_more_than_24h boolean,
  noted_at         timestamptz not null default now(),
  noted_by         uuid references profiles(id),
  unique (lesson_id, student_id)
);

create index attendance_student_idx on attendance (student_id);

-- Wyjątki w harmonogramie inne niż lekcje (np. zmiana sali, zmiana godziny dla całej klasy
-- na konkretną datę). Wyświetlane w sekcji "Wyjątki i zmiany" parent-classes.
-- Lekcje odwołane już są w lessons.status='cancelled' — tu trzymamy zmiany sali/godziny.
create table schedule_exceptions (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references classes(id) on delete cascade,
  exception_date date not null,
  exception_type schedule_exception_type not null,
  reason        text,
  details       text,         -- np. "Sala 3 zamiast Sali 1" lub "15:00 zamiast 14:00"
  created_at    timestamptz not null default now(),
  created_by    uuid references profiles(id)
);

create index schedule_exceptions_class_idx on schedule_exceptions (class_id, exception_date);
