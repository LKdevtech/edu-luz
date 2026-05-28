-- 0014_messages.sql
-- EDU LUZ — wiadomości:
-- (a) komunikaty masowe od admina (z dashboardu, modal "Wyślij komunikat")
-- (b) wiadomość ucznia → korepetytor (textarea + wyślij ze studenta)
-- (c) wiadomość rodzic ↔ admin / korepetytor

-- Komunikat admina (jeden "broadcast" → wielu odbiorców).
create table admin_announcements (
  id              uuid primary key default gen_random_uuid(),
  sent_by         uuid not null references profiles(id) on delete restrict,
  audience        message_audience not null,
  -- Jeśli audience = individual_*, doprecyzowanie odbiorcy.
  recipient_id    uuid references profiles(id) on delete set null,
  channel         message_channel not null,
  subject         text not null,
  body            text not null,                -- może zawierać zmienne {rodzic}, {uczeń}, {miesiąc}, {kwota}
  recipients_count integer,                     -- snapshot ile osób odebrało
  sent_at         timestamptz not null default now()
);

-- Bezpośrednia wiadomość 1:1 (uczeń→tutor, rodzic↔admin/tutor itd.).
-- Wątkowanie nie jest wymagane przez mockupy — trzymamy płaską listę z optional thread_id.
create table direct_messages (
  id            uuid primary key default gen_random_uuid(),
  thread_id     uuid,                          -- pierwszy msg w wątku = self-id (set in app)
  sender_id     uuid not null references profiles(id) on delete restrict,
  recipient_id  uuid not null references profiles(id) on delete restrict,
  subject       text,
  body          text not null,
  is_read       boolean not null default false,
  read_at       timestamptz,
  sent_at       timestamptz not null default now()
);

create index direct_messages_recipient_idx on direct_messages (recipient_id, is_read);
create index direct_messages_thread_idx on direct_messages (thread_id);
