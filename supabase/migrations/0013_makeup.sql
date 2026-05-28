-- 0013_makeup.sql
-- EDU LUZ — odrabianie lekcji (ping-pong propozycji)
--
-- Model:
-- 1. Lekcja odwołana >24h → makeup_requests utworzony automatycznie (jeden wiersz per odwołana lekcja).
-- 2. Korepetytor lub rodzic składa propozycję terminu (makeup_proposals) — ping-pong.
-- 3. Po akceptacji: status='accepted' + utworzona zostaje lessons z makeup_for_lesson_id ustawionym
--    + status oryginalnej lekcji nadal 'cancelled' (historia), nowa lekcja status='makeup'.
-- 4. Po odrobieniu nowej lekcji: status='completed'.

create table makeup_requests (
  id                 uuid primary key default gen_random_uuid(),
  -- Lekcja oryginalna, do odrobienia.
  original_lesson_id uuid not null unique references lessons(id) on delete restrict,
  status             makeup_status not null default 'waiting_for_parent',
  -- Aktualny krok ping-ponga (numer rundy z mockupu).
  current_round      smallint not null default 1,
  -- Termin na zakończenie negocjacji (contract_terms.makeup_deadline_days od cancelled_at).
  deadline           date,
  -- Jeśli przyjęta — nowa lekcja powstaje w lessons z makeup_for_lesson_id = original.id;
  -- ten wskaźnik trzymamy dla wygody.
  resulting_lesson_id uuid references lessons(id) on delete set null,
  -- Powód odwołania (kopia z lessons.cancel_reason dla wygody UI).
  cancel_reason      text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  completed_at       timestamptz,
  -- Wynik końcowy dla UI historii ('Odrobiona' / 'Wygasła (brak odpowiedzi)' / 'Odrzucona przez rodzica').
  outcome_label      text
);

create index makeup_requests_status_idx on makeup_requests (status);

create trigger makeup_requests_updated_at
  before update on makeup_requests
  for each row execute function set_updated_at();

-- Każda propozycja (lub kontropropozycja) = jeden wiersz. Daje pełną historię ping-ponga.
create table makeup_proposals (
  id              uuid primary key default gen_random_uuid(),
  request_id      uuid not null references makeup_requests(id) on delete cascade,
  round_number    smallint not null,
  proposed_by     makeup_actor not null,
  proposed_by_id  uuid not null references profiles(id) on delete restrict,
  action          makeup_action not null,
  -- Konkretny proponowany termin.
  proposed_date   date,
  proposed_start  time,
  proposed_end    time,
  -- Jeśli propozycja korzysta z konkretnego dodatkowego slotu korepetytora.
  extra_slot_id   uuid references extra_slots(id) on delete set null,
  -- Notatka/uzasadnienie (np. "ten termin nam nie pasuje, proponujemy ...").
  note            text,
  created_at      timestamptz not null default now(),
  -- responded_at: kiedy ten krok został zaadresowany przez drugą stronę (kolejny wiersz).
  responded_at    timestamptz,
  unique (request_id, round_number, proposed_by)
);

create index makeup_proposals_request_idx on makeup_proposals (request_id, round_number);

-- Nieobecność korepetytora (sekcja 3.2). Admin zatwierdza → system odwołuje dotknięte lekcje.
create table tutor_absences (
  id              uuid primary key default gen_random_uuid(),
  tutor_id        uuid not null references tutors(profile_id) on delete cascade,
  absence_type    tutor_absence_type not null,
  start_date      date not null,
  end_date        date not null,
  reason          text,
  approved_at     timestamptz,
  approved_by     uuid references profiles(id),
  -- Ile lekcji zostało automatycznie odwołanych (snapshot na moment zatwierdzenia).
  affected_lessons_count integer,
  created_at      timestamptz not null default now(),
  check (end_date >= start_date)
);

create index tutor_absences_tutor_idx on tutor_absences (tutor_id, start_date);
