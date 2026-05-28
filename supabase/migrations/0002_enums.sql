-- 0002_enums.sql
-- EDU LUZ — Enumy biznesowe
-- Wszystkie wartości UI brane z mockupów (cytuję labele PL w komentarzach).

-- Role użytkownika (sekcja 2 SYSTEM_INSTRUCTIONS_v2).
create type user_role as enum (
  'admin',
  'tutor',
  'parent',
  'student'
);

-- Poziomy nauczania (6 wartości — sekcja 3.7 SYSTEM_INSTRUCTIONS_v2).
-- UWAGA: gwiazdka jest częścią labelu UI (ŚR★, EM★), w bazie trzymamy bez znaków specjalnych.
create type student_level as enum (
  'SP',      -- szkoła podstawowa
  'E8',      -- egzamin ósmoklasisty
  'SR',      -- szkoła średnia (UI: ŚR)
  'SR_EXT',  -- średnia rozszerzenie (UI: ŚR★)
  'EM',      -- matura
  'EM_EXT'   -- matura rozszerzenie (UI: EM★)
);

-- 7 statusów lekcji (sekcja 3.6 + parent-classes mockup).
create type lesson_status as enum (
  'planned',             -- ○ niebieski
  'in_progress',         -- ● żółty
  'completed',           -- ✓ zielony — zrealizowana z wpisem
  'completed_no_entry',  -- ✓ żółty — zrealizowana BEZ wpisu
  'cancelled',           -- ✕ czerwony
  'no_show',             -- ⊘ pomarańczowy
  'makeup'               -- ↻ fioletowy
);

-- Status wpisu po lekcji (tutor-lessons mockup).
create type entry_status as enum (
  'missing',     -- "Brak wpisu"
  'draft',       -- "Szkic"
  'published',   -- "Opublikowany"
  'locked',      -- "Zablokowany (48h)" — sekcja 3.11
  'blocked'      -- "No-show" — lekcja nie odbyła się, wpis niemożliwy
);

-- Obecność per uczeń per lekcja.
create type attendance_status as enum (
  'present',
  'absent'
);

-- Forma zajęć.
create type class_form as enum (
  'individual',  -- "indyw."
  'pair',        -- "w parze" (2 os.)
  'group'        -- "grupa" (3+ os.)
);

-- Status płatności miesięcznej rodzica.
-- UWAGA: 'paid_late' to specjalny wariant — opłacone, ale po terminie (parent-payments).
create type payment_status as enum (
  'paid',
  'pending',     -- "Oczekuje" — przed 10. dnia miesiąca
  'overdue',     -- "Zaległość" — po terminie
  'paid_late'    -- "Opłacone (po terminie)"
);

-- Status zgłoszenia odrabiania (ping-pong).
create type makeup_status as enum (
  'waiting_for_parent',  -- propozycja od tutora czeka na rodzica
  'waiting_for_tutor',   -- kontropropozycja rodzica czeka na tutora
  'proposed',            -- aktywna propozycja
  'accepted',            -- ustalony termin
  'rejected',            -- odrzucone przez rodzica
  'expired',             -- "Wygasła (brak odpowiedzi)"
  'completed',           -- odrobione
  'cancelled'            -- np. ponownie odwołane przed odrobieniem
);

-- Kto inicjuje krok ping-ponga.
create type makeup_actor as enum (
  'tutor',
  'parent'
);

-- Akcja w historii negocjacji odrabiania.
create type makeup_action as enum (
  'proposed',         -- "Zaproponował"
  'counter_proposed', -- "Kontropropozycja"
  'accepted',
  'rejected'
);

-- Typ nieobecności korepetytora.
create type tutor_absence_type as enum (
  'sick',
  'vacation',
  'other'
);

-- Kanały komunikatów.
create type message_channel as enum (
  'email',
  'push',
  'both'
);

-- Stosowanie zmiany stawki (admin-group-interactions).
create type rate_effective_mode as enum (
  'immediately',
  'next_month',
  'specific_date'
);

-- Typ wyjątku w harmonogramie (parent-classes scheduleException).
create type schedule_exception_type as enum (
  'cancelled',
  'room_change',
  'time_change'
);

-- Adresaci komunikatów (admin → wyślij komunikat).
create type message_audience as enum (
  'all_parents',
  'parents_with_overdue',
  'all_tutors',
  'individual_parent',
  'individual_tutor'
);
