-- 0023_notifications.sql
-- EDU LUZ — powiadomienia w aplikacji (dzwonek w headerze każdego panelu).
--
-- Jeden wiersz = jedno powiadomienie dla konkretnego użytkownika (profiles.id).
-- Typy: zmiana lekcji, przypomnienie o płatności, nieobecność, nowy wpis,
-- komunikat od admina.

create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        text not null check (
                type in ('lesson_change', 'payment_reminder', 'absence', 'entry_added', 'admin_message')
              ),
  title       text not null,
  message     text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Główne zapytanie: nieprzeczytane danego użytkownika, najnowsze na górze.
create index notifications_user_idx on notifications (user_id, read, created_at desc);
