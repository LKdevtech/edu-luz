-- 0016_cancel_requests.sql
-- EDU LUZ — lesson_cancel_requests
--
-- Uczeń NIE odwołuje lekcji samodzielnie (sekcja 3.2 SYSTEM_INSTRUCTIONS_v2).
-- Wysyła prośbę → rodzic potwierdza / odrzuca. Ta tabela trzyma stan prośby.
--
-- Flow:
-- 1. Student klika „Odwołaj" w panelu → INSERT z status='pending'.
--    UI pokazuje badge „CZEKA NA RODZICA".
-- 2. Rodzic akceptuje → UPDATE status='approved', resolved_at, resolved_by;
--    aplikacja w tym samym kroku oznacza lekcję jako cancelled + ewentualnie
--    tworzy makeup_request (>24h przed lekcją).
-- 3. Rodzic odrzuca → UPDATE status='rejected'. Lekcja zostaje zaplanowana.

create table lesson_cancel_requests (
  id           uuid primary key default gen_random_uuid(),
  lesson_id    uuid not null references lessons(id) on delete cascade,
  student_id   uuid not null references students(profile_id) on delete cascade,
  status       text not null default 'pending'
               check (status in ('pending', 'approved', 'rejected')),
  reason       text,
  requested_at timestamptz not null default now(),
  resolved_at  timestamptz,
  resolved_by  uuid references profiles(id),
  -- Tylko JEDNA aktywna (pending) prośba per (lekcja, uczeń) — w grupie każdy uczeń
  -- może niezależnie poprosić o swoje odwołanie. Po resolved może powstać nowa
  -- prośba (np. po rejected uczeń próbuje ponownie); unique tylko dla pending.
  check (
    (status = 'pending' and resolved_at is null and resolved_by is null) or
    (status in ('approved', 'rejected') and resolved_at is not null)
  )
);

-- Tylko jedna pending prośba per (lekcja, uczeń) jednocześnie.
create unique index lesson_cancel_requests_pending_unique
  on lesson_cancel_requests (lesson_id, student_id)
  where status = 'pending';

create index lesson_cancel_requests_student_idx
  on lesson_cancel_requests (student_id, status);

create index lesson_cancel_requests_lesson_idx
  on lesson_cancel_requests (lesson_id);
