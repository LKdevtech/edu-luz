-- 0021_tutor_absence_hours.sql
-- EDU LUZ — nieobecności korepetytora na KONKRETNE godziny + rozróżnienie nagła/planowana.
--
-- Dotychczas tutor_absences obejmował tylko zakres dni (cały dzień). Korepetytor
-- może być niedostępny np. tylko 14:00–16:00 w danym dniu, a resztę dnia pracować
-- normalnie — dlatego dodajemy opcjonalne godziny (null = cały dzień).
-- is_urgent rozróżnia zgłoszenie nagłe (wymaga natychmiastowej reakcji admina)
-- od planowanego.

alter table tutor_absences
  add column start_time time,
  add column end_time   time,
  add column is_urgent  boolean not null default false;

-- Jeśli podano godziny, muszą być spójne.
alter table tutor_absences
  add constraint tutor_absences_time_range_chk
  check (start_time is null or end_time is null or end_time > start_time);
