-- 0028_payment_reminders.sql
-- EDU LUZ — wsparcie dla przypomnień o płatnościach.
--
--   • payments.reminder_sent_at  — kiedy ostatnio wysłano przypomnienie dla tej
--     płatności (deduplikacja: nie wysyłaj częściej niż raz na 7 dni).
--   • parents.reminders_disabled — rodzic z opt-outem; logika hurtowa go pomija.

alter table payments
  add column if not exists reminder_sent_at timestamptz;

alter table parents
  add column if not exists reminders_disabled boolean not null default false;

comment on column payments.reminder_sent_at is
  'Znacznik ostatniego wysłanego przypomnienia o płatności (dedup okno 7 dni).';
comment on column parents.reminders_disabled is
  'Gdy true — rodzic nie otrzymuje automatycznych/hurtowych przypomnień o płatności.';
