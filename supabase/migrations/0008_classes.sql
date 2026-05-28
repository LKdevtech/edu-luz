-- 0008_classes.sql
-- EDU LUZ — classes (zajęcia: przypisanie student LUB grupa × przedmiot × tutor × forma × opłata)
-- + weekly_slots (siatka tygodnia per zajęcia)
--
-- Każda klasa to "umowa zajęciowa": jeden uczeń indyw./para LUB grupa,
-- u konkretnego korepetytora, z konkretną stałą opłatą miesięczną i tygodniowym planem.
-- Realne lekcje (z datą) generowane są z classes + weekly_slots → tabela lessons.

create table classes (
  id              uuid primary key default gen_random_uuid(),
  form            class_form not null,
  subject_id      uuid not null references subjects(id) on delete restrict,
  tutor_id        uuid not null references tutors(profile_id) on delete restrict,
  level           student_level not null,

  -- DOKŁADNIE JEDNA z poniższych jest wypełniona (CHECK xor):
  -- indyw./para → student_id (dla pary modelowane jako 2 osobne classes na razie? --
  --   patrz README: 'pair' = 2 uczniów dzielący stawkę, do uzgodnienia)
  -- group     → group_id
  student_id      uuid references students(profile_id) on delete restrict,
  group_id        uuid references groups(id) on delete cascade,

  monthly_fee     numeric(8,2) not null check (monthly_fee >= 0),
  room_id         uuid references rooms(id) on delete set null,
  notes           text,

  status          text not null default 'active'
                  check (status in ('active', 'paused', 'ended')),
  start_date      date not null,
  end_date        date,

  created_at      timestamptz not null default now(),
  created_by      uuid references profiles(id),

  check (
    (form = 'group' and group_id is not null and student_id is null) or
    (form in ('individual', 'pair') and student_id is not null and group_id is null)
  )
);

create index classes_student_idx on classes (student_id) where student_id is not null;
create index classes_group_idx on classes (group_id) where group_id is not null;
create index classes_tutor_idx on classes (tutor_id);
create index classes_active_idx on classes (status) where status = 'active';

-- Tygodniowy plan dla klasy. Jedna klasa może mieć N slotów (np. Pon 14:00 + Śr 14:00 + Sob 9:00).
-- Sala może być nadpisana per slot (zwykle taka sama jak w classes.room_id, ale dopuszczamy override).
create table weekly_slots (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time  time not null,
  end_time    time not null,
  room_id     uuid references rooms(id) on delete set null,
  active_from date not null,
  active_to   date,
  check (end_time > start_time)
);

create index weekly_slots_class_idx on weekly_slots (class_id);
create index weekly_slots_day_idx on weekly_slots (day_of_week, start_time);
