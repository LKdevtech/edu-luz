-- 0011_payments.sql
-- EDU LUZ — płatności miesięczne rodziców
--
-- Model: payments to rachunek per rodzic per miesiąc (np. "Monika Nowak - Maj 2026" = 1680 zł).
-- payment_lines rozbijają kwotę per dziecko / per class (np. "Kacper - matematyka 1080 zł",
-- "Ola - angielski indyw. 420 zł", "Ola - Grupa A 180 zł").
-- late_count NIE jest per payment — tylko per rodzic (parents.late_count), bo śledzi ile razy z rzędu
-- rodzic spóźnił się z opłatą. Snapshotujemy go w payment.delay_number w momencie tworzenia
-- przypomnienia, żeby historia była stabilna.

create table payments (
  id                 uuid primary key default gen_random_uuid(),
  parent_id          uuid not null references parents(profile_id) on delete restrict,
  -- Miesiąc rozliczeniowy. Trzymamy jako pierwszy dzień miesiąca, żeby było sortowalne i porównywalne.
  billing_month      date not null,                       -- np. '2026-05-01'
  due_date           date not null,                       -- domyślnie 10. dnia miesiąca
  total_amount       numeric(10,2) not null check (total_amount >= 0),
  status             payment_status not null default 'pending',
  -- Snapshot numeru opóźnienia w momencie wystawienia rachunku (parent.late_count + 1 jeśli idzie po terminie).
  delay_number       smallint not null default 0,
  -- Wpłata:
  paid_at            timestamptz,
  paid_amount        numeric(10,2),
  -- on_time: true jeśli paid_at <= due_date, false jeśli po, null jeśli niezapłacone.
  paid_on_time       boolean,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (parent_id, billing_month)
);

create index payments_parent_month_idx on payments (parent_id, billing_month desc);
create index payments_status_idx on payments (status);
create index payments_due_idx on payments (due_date) where status in ('pending', 'overdue');

create trigger payments_updated_at
  before update on payments
  for each row execute function set_updated_at();

-- Rozbicie kwoty na dziecko + class. UI: parent-payments breakdown groups per child.
create table payment_lines (
  id            uuid primary key default gen_random_uuid(),
  payment_id    uuid not null references payments(id) on delete cascade,
  student_id    uuid not null references students(profile_id) on delete restrict,
  class_id      uuid references classes(id) on delete set null,
  -- Opis czytelny dla rodzica: "Matematyka — indyw. (ŚR★)".
  description   text not null,
  lessons_per_week smallint,
  amount        numeric(10,2) not null check (amount >= 0)
);

create index payment_lines_payment_idx on payment_lines (payment_id);

-- Licznik opóźnień rodzica (per rodzic, nie per płatność).
-- Inkrementowany przy każdej zaległości; reset/restart po terminowej wpłacie — logika w app.
alter table parents add column late_count smallint not null default 0;
alter table parents add column last_overdue_at timestamptz;
