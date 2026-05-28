-- 0018_tutor_penalty_points.sql
-- EDU LUZ — punkty karne korepetytora.
--
-- Punkt karny przyznawany jest automatycznie, gdy korepetytor nie utworzy
-- (lub nie opublikuje) wpisu z lekcji w wyznaczonym czasie
-- (contract_terms.late_entry_hours, domyślnie 48h od zakończenia lekcji).
--
-- Każdy wiersz = jedno zdarzenie. Suma punktów per tutor jest agregowana
-- w UI (panel korepetytora + admin). Reset/anulowanie punktu wymaga akcji
-- administratora — robi to przez DELETE z odpowiednim audytem.

create table tutor_penalty_points (
  id          uuid primary key default gen_random_uuid(),
  tutor_id    uuid not null references tutors(profile_id) on delete cascade,
  -- Lekcja, której dotyczy punkt (zwykle ta bez wpisu).
  lesson_id   uuid references lessons(id) on delete set null,
  -- Powód w wolnym formacie. Najczęściej: "Brak wpisu po 48h".
  reason      text not null,
  -- Kiedy punkt został przyznany (system: automatycznie po przekroczeniu okna).
  awarded_at  timestamptz not null default now(),
  -- Opcjonalny zapis kto przyznał ręcznie (admin może dodać/anulować).
  awarded_by  uuid references profiles(id) on delete set null
);

create index tutor_penalty_points_tutor_idx on tutor_penalty_points (tutor_id, awarded_at desc);
-- Jeden lesson_id może mieć tylko jeden punkt karny (deduplicate).
create unique index tutor_penalty_points_lesson_unique
  on tutor_penalty_points (lesson_id)
  where lesson_id is not null;
