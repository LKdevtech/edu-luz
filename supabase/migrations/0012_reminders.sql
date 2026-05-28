-- 0012_reminders.sql
-- EDU LUZ — szablony przypomnień + wysłane przypomnienia + preferencje powiadomień

-- Globalne szablony 3 przypomnień (10., 20., ostatni dzień miesiąca). Edytowalne z panelu admina.
-- send_day_of_month: 0 = ostatni dzień, 1-28 = konkretny dzień (10 i 20 z UI).
create table payment_reminder_templates (
  id                 uuid primary key default gen_random_uuid(),
  send_day_of_month  smallint not null check (send_day_of_month between 0 and 28),
  send_time          time not null default '09:00',
  label              text not null,                       -- "Pierwsze przypomnienie", "Drugie przypomnienie", ...
  subject_template   text not null,
  body_template      text not null,                       -- zmienne: {miesiąc}, {kwota}, {rodzic}, {uczeń}, {termin}
  is_enabled         boolean not null default true,
  sort_order         smallint not null default 0,
  updated_at         timestamptz not null default now()
);

create trigger payment_reminder_templates_updated_at
  before update on payment_reminder_templates
  for each row execute function set_updated_at();

-- Konkretne wysłane przypomnienia per (payment, template).
create table payment_reminders_sent (
  id            uuid primary key default gen_random_uuid(),
  payment_id    uuid not null references payments(id) on delete cascade,
  template_id   uuid not null references payment_reminder_templates(id) on delete restrict,
  sent_at       timestamptz not null default now(),
  channel       message_channel not null,
  delivered     boolean,
  error_message text,
  unique (payment_id, template_id)
);

create index payment_reminders_sent_payment_idx on payment_reminders_sent (payment_id);

-- Preferencje powiadomień per profil.
-- 7 typów powiadomień (z parent-profile + student-profile + admin-settings notifSettings).
-- Reguła biznesowa: dla 3 przypomnień płatności (payment_reminder_*) MIN. 1 kanał musi być true
-- — egzekwowane w aplikacji (lub w future RLS/trigger).
create type notification_type as enum (
  'payment_reminder_10',
  'payment_reminder_20',
  'payment_reminder_last',
  'new_entry',
  'schedule_change',
  'makeup_proposal',
  'message_received',
  -- adminowe (tylko dla profili z rolą admin/manager):
  'new_absence_request',
  'entry_blocked_48h',
  'payment_received',
  'payment_overdue',
  'makeup_no_response',
  'contract_ending'
);

create table notification_preferences (
  profile_id    uuid not null references profiles(id) on delete cascade,
  notif_type    notification_type not null,
  email_enabled boolean not null default true,
  push_enabled  boolean not null default true,
  primary key (profile_id, notif_type)
);
