-- 0015_seed.sql
-- EDU LUZ — seed danymi testowymi (sekcja 11 SYSTEM_INSTRUCTIONS_v2)
--
-- Tworzy:
--   - Centrum + godziny pracy + warunki umowy + przedmioty + sale + szablony przypomnień
--   - 1 admin (admin@eduluz.pl)
--   - 2 korepetytorów: Tomasz Kowalski (matematyka), Maria Zielińska (angielski)
--   - 1 rodzic: Monika Nowak + 2 dzieci: Kacper (ŚR★, mat. indyw.), Ola (SP, ang. indyw. + grupa)
--   - 1 grupa "Grupa A" (angielski, SP)
--   - 3 classes (mat indyw Kacpra, ang indyw Oli, ang grupa Oli)
--   - Tygodniowe sloty zgodne z sekcją 11
--   - Płatność za maj 2026 (1680 zł) + historia za marzec/kwiecień
--
-- UWAGA: seed wstawia profile do auth.users z deterministycznymi UUID. Ten styl działa
-- w lokalnym Supabase. Na środowisku zdalnym lepiej tworzyć użytkowników przez Auth API.

-- ============================================================================
-- Stałe UUID — łatwe do referencjonowania w testach/dev
-- ============================================================================
-- Profiles:
--   99999999-0000-0000-0000-000000000001  admin
--   99999999-0000-0000-0000-000000000010  Tomasz Kowalski (tutor)
--   99999999-0000-0000-0000-000000000011  Maria Zielińska (tutor)
--   99999999-0000-0000-0000-000000000020  Monika Nowak (parent)
--   99999999-0000-0000-0000-000000000030  Kacper Nowak (student)
--   99999999-0000-0000-0000-000000000031  Ola Nowak (student)

-- ============================================================================
-- 1. Auth users (dla Supabase local dev)
-- ============================================================================
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
)
values
  ('99999999-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'admin@eduluz.pl', crypt('admin1234', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('99999999-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'tomasz.kowalski@eduluz.pl', crypt('tutor1234', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('99999999-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'maria.zielinska@eduluz.pl', crypt('tutor1234', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('99999999-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'monika.nowak@gmail.com', crypt('parent1234', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('99999999-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'kacper.nowak@eduluz.pl', crypt('student1234', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('99999999-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'ola.nowak@eduluz.pl', crypt('student1234', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb)
on conflict (id) do nothing;

-- ============================================================================
-- 2. Profiles
-- ============================================================================
insert into profiles (id, role, first_name, last_name, email, phone) values
  ('99999999-0000-0000-0000-000000000001', 'admin',  'Kacper', 'Luchowski',      'admin@eduluz.pl',         '+48 123 456 789'),
  ('99999999-0000-0000-0000-000000000010', 'tutor',  'Tomasz', 'Kowalski',       'tomasz.kowalski@eduluz.pl', '+48 600 000 010'),
  ('99999999-0000-0000-0000-000000000011', 'tutor',  'Maria',  'Zielińska',      'maria.zielinska@eduluz.pl', '+48 600 000 011'),
  ('99999999-0000-0000-0000-000000000020', 'parent', 'Monika', 'Nowak',          'monika.nowak@gmail.com',  '+48 602 345 678'),
  ('99999999-0000-0000-0000-000000000030', 'student','Kacper', 'Nowak',          null,                       null),
  ('99999999-0000-0000-0000-000000000031', 'student','Ola',    'Nowak',          null,                       null);

-- ============================================================================
-- 3. Centrum + godziny + warunki + powiadomienia
-- ============================================================================
insert into center_settings (id, name, full_name, address, phone, email, nip, bank_account, bank_name) values
  (1, 'EDU LUZ', 'EDU LUZ Sp. z o.o.',
   'ul. Szkolna 8, 97-200 Tomaszów Mazowiecki',
   '+48 123 456 789',
   'kontakt@eduluz.pl',
   '7732536321',
   'PL 12 3456 7890 1234 5678 9012 3456',
   'PKO BP');

insert into contract_terms (id) values (1);  -- defaults

-- Godziny zajęć: Pon-Sob 7:30-21:00, Ndz 9:00-14:00.
-- day_of_week: 0=Pon ... 5=Sob ... 6=Ndz
insert into working_hours (kind, day_of_week, open_time, close_time, is_active)
select 'lessons'::working_hours_kind, d, '07:30'::time, '21:00'::time, true from generate_series(0,5) d
union all
select 'lessons'::working_hours_kind, 6, '09:00'::time, '14:00'::time, true;

-- Kontakt telefoniczny: szerszy zakres.
insert into working_hours (kind, day_of_week, open_time, close_time, is_active)
select 'phone'::working_hours_kind, d, '07:00'::time, '22:00'::time, true from generate_series(0,5) d
union all
select 'phone'::working_hours_kind, 6, '09:00'::time, '14:00'::time, true;

-- ============================================================================
-- 4. Przedmioty + sale
-- ============================================================================
insert into subjects (id, name, color, sort_order) values
  ('aaaa0001-0000-0000-0000-000000000001', 'Matematyka',     '#3B8FF0', 1),
  ('aaaa0001-0000-0000-0000-000000000002', 'Angielski',      '#06B6D4', 2),
  ('aaaa0001-0000-0000-0000-000000000003', 'Fizyka',         '#F59E0B', 3),
  ('aaaa0001-0000-0000-0000-000000000004', 'Chemia',         '#22C55E', 4),
  ('aaaa0001-0000-0000-0000-000000000005', 'Polski',         '#E84393', 5),
  ('aaaa0001-0000-0000-0000-000000000006', 'Elektrotechnika','#FF6F4A', 6);

insert into rooms (id, name, capacity, equipment) values
  ('bbbb0001-0000-0000-0000-000000000001', 'Sala 1', 2, 'Tablica suchościeralna, projektor'),
  ('bbbb0001-0000-0000-0000-000000000002', 'Sala 2', 2, 'Tablica suchościeralna'),
  ('bbbb0001-0000-0000-0000-000000000003', 'Sala 3', 6, 'Tablica suchościeralna, projektor, monitor');

-- ============================================================================
-- 5. Korepetytorzy + ich przedmioty + stawki + dostępność
-- ============================================================================
insert into tutors (profile_id, bio, hired_date) values
  ('99999999-0000-0000-0000-000000000010', 'Korepetytor matematyki z 8-letnim doświadczeniem.', '2022-09-01'),
  ('99999999-0000-0000-0000-000000000011', 'Lektor języka angielskiego, certyfikat CAE.',       '2023-09-01');

insert into tutor_subjects (tutor_id, subject_id) values
  ('99999999-0000-0000-0000-000000000010', 'aaaa0001-0000-0000-0000-000000000001'),  -- Tomasz: matematyka
  ('99999999-0000-0000-0000-000000000011', 'aaaa0001-0000-0000-0000-000000000002');  -- Maria: angielski

-- Stawki obowiązujące od września 2024 (jedna wersja, wystarczy do testów).
insert into tutor_rates (tutor_id, individual_rate, group_rate, effective_from) values
  ('99999999-0000-0000-0000-000000000010', 60.00, 45.00, '2024-09-01'),  -- Tomasz
  ('99999999-0000-0000-0000-000000000011', 55.00, 40.00, '2024-09-01');  -- Maria

-- Dostępność: Tomasz Pon-Pt 14:00-20:00, Sob 9:00-13:00. Maria Wt+Czw 15:00-19:00, Śr 15:00-18:00.
insert into availability_blocks (tutor_id, day_of_week, start_time, end_time) values
  ('99999999-0000-0000-0000-000000000010', 0, '14:00', '20:00'),  -- Pon
  ('99999999-0000-0000-0000-000000000010', 1, '14:00', '20:00'),  -- Wt
  ('99999999-0000-0000-0000-000000000010', 2, '14:00', '20:00'),  -- Śr
  ('99999999-0000-0000-0000-000000000010', 3, '14:00', '20:00'),  -- Czw
  ('99999999-0000-0000-0000-000000000010', 4, '14:00', '20:00'),  -- Pt
  ('99999999-0000-0000-0000-000000000010', 5, '09:00', '13:00'),  -- Sob
  ('99999999-0000-0000-0000-000000000011', 1, '15:00', '19:00'),  -- Wt
  ('99999999-0000-0000-0000-000000000011', 2, '15:00', '18:00'),  -- Śr
  ('99999999-0000-0000-0000-000000000011', 3, '15:00', '19:00');  -- Czw

-- ============================================================================
-- 6. Rodzic + dzieci
-- ============================================================================
insert into parents (profile_id, address) values
  ('99999999-0000-0000-0000-000000000020', 'ul. Słoneczna 15/3, 97-200 Tomaszów Mazowiecki');

insert into students (profile_id, parent_id, school_class, school_name, level, birth_date) values
  ('99999999-0000-0000-0000-000000000030', '99999999-0000-0000-0000-000000000020', '2 LO',  'II LO im. Sienkiewicza',   'SR_EXT', '2009-03-12'),
  ('99999999-0000-0000-0000-000000000031', '99999999-0000-0000-0000-000000000020', 'kl. 7', 'SP nr 8',                  'SP',     '2012-09-05');

-- ============================================================================
-- 7. Grupa A (angielski, SP, Maria Zielińska)
-- ============================================================================
insert into groups (id, name, subject_id, level, tutor_id, max_size, monthly_fee_per_student) values
  ('cccc0001-0000-0000-0000-000000000001', 'Grupa A',
   'aaaa0001-0000-0000-0000-000000000002', 'SP',
   '99999999-0000-0000-0000-000000000011', 4, 180.00);

insert into group_members (group_id, student_id) values
  ('cccc0001-0000-0000-0000-000000000001', '99999999-0000-0000-0000-000000000031');  -- Ola

-- ============================================================================
-- 8. Zajęcia (classes) + tygodniowe sloty
-- ============================================================================
-- Class 1: Kacper — matematyka indyw. u Tomasza, 1080 zł/msc, Sala 1, Pon 14:00 + Śr 14:00 + Sob 9:00
insert into classes (id, form, subject_id, tutor_id, level, student_id, monthly_fee, room_id, start_date) values
  ('dddd0001-0000-0000-0000-000000000001', 'individual',
   'aaaa0001-0000-0000-0000-000000000001', '99999999-0000-0000-0000-000000000010',
   'SR_EXT', '99999999-0000-0000-0000-000000000030',
   1080.00, 'bbbb0001-0000-0000-0000-000000000001', '2024-09-01');

insert into weekly_slots (class_id, day_of_week, start_time, end_time, room_id, active_from) values
  ('dddd0001-0000-0000-0000-000000000001', 0, '14:00', '15:00', 'bbbb0001-0000-0000-0000-000000000001', '2024-09-01'),  -- Pon
  ('dddd0001-0000-0000-0000-000000000001', 2, '14:00', '15:00', 'bbbb0001-0000-0000-0000-000000000001', '2024-09-01'),  -- Śr
  ('dddd0001-0000-0000-0000-000000000001', 5, '09:00', '10:00', 'bbbb0001-0000-0000-0000-000000000001', '2024-09-01');  -- Sob

-- Class 2: Ola — angielski indyw. u Marii, 420 zł/msc, Sala 2, Wt 15:15 + Czw 15:15
insert into classes (id, form, subject_id, tutor_id, level, student_id, monthly_fee, room_id, start_date) values
  ('dddd0001-0000-0000-0000-000000000002', 'individual',
   'aaaa0001-0000-0000-0000-000000000002', '99999999-0000-0000-0000-000000000011',
   'SP', '99999999-0000-0000-0000-000000000031',
   420.00, 'bbbb0001-0000-0000-0000-000000000002', '2024-09-01');

insert into weekly_slots (class_id, day_of_week, start_time, end_time, room_id, active_from) values
  ('dddd0001-0000-0000-0000-000000000002', 1, '15:15', '16:00', 'bbbb0001-0000-0000-0000-000000000002', '2024-09-01'),
  ('dddd0001-0000-0000-0000-000000000002', 3, '15:15', '16:00', 'bbbb0001-0000-0000-0000-000000000002', '2024-09-01');

-- Class 3: Grupa A — angielski grupa u Marii, 180 zł/msc/os, Sala 3, Śr 16:30
insert into classes (id, form, subject_id, tutor_id, level, group_id, monthly_fee, room_id, start_date) values
  ('dddd0001-0000-0000-0000-000000000003', 'group',
   'aaaa0001-0000-0000-0000-000000000002', '99999999-0000-0000-0000-000000000011',
   'SP', 'cccc0001-0000-0000-0000-000000000001',
   180.00, 'bbbb0001-0000-0000-0000-000000000003', '2024-09-01');

insert into weekly_slots (class_id, day_of_week, start_time, end_time, room_id, active_from) values
  ('dddd0001-0000-0000-0000-000000000003', 2, '16:30', '17:30', 'bbbb0001-0000-0000-0000-000000000003', '2024-09-01');

-- ============================================================================
-- 9. Płatności (maj 2026 jako bieżący miesiąc — 1680 zł łącznie)
-- ============================================================================
-- Bieżąca (oczekuje, due 10.05.2026)
insert into payments (id, parent_id, billing_month, due_date, total_amount, status) values
  ('eeee0001-0000-0000-0000-000000000005', '99999999-0000-0000-0000-000000000020',
   '2026-05-01', '2026-05-10', 1680.00, 'pending');

insert into payment_lines (payment_id, student_id, class_id, description, lessons_per_week, amount) values
  ('eeee0001-0000-0000-0000-000000000005', '99999999-0000-0000-0000-000000000030',
   'dddd0001-0000-0000-0000-000000000001', 'Matematyka — indyw. (ŚR★)', 3, 1080.00),
  ('eeee0001-0000-0000-0000-000000000005', '99999999-0000-0000-0000-000000000031',
   'dddd0001-0000-0000-0000-000000000002', 'Angielski — indyw. (SP)', 2, 420.00),
  ('eeee0001-0000-0000-0000-000000000005', '99999999-0000-0000-0000-000000000031',
   'dddd0001-0000-0000-0000-000000000003', 'Angielski — Grupa A (SP)', 1, 180.00);

-- Historia: kwiecień (opłacone w terminie 08.04)
insert into payments (id, parent_id, billing_month, due_date, total_amount, status,
                     paid_at, paid_amount, paid_on_time) values
  ('eeee0001-0000-0000-0000-000000000004', '99999999-0000-0000-0000-000000000020',
   '2026-04-01', '2026-04-10', 1680.00, 'paid',
   '2026-04-08 12:00:00+02', 1680.00, true);

insert into payment_lines (payment_id, student_id, class_id, description, lessons_per_week, amount) values
  ('eeee0001-0000-0000-0000-000000000004', '99999999-0000-0000-0000-000000000030',
   'dddd0001-0000-0000-0000-000000000001', 'Matematyka — indyw. (ŚR★)', 3, 1080.00),
  ('eeee0001-0000-0000-0000-000000000004', '99999999-0000-0000-0000-000000000031',
   'dddd0001-0000-0000-0000-000000000002', 'Angielski — indyw. (SP)', 2, 420.00),
  ('eeee0001-0000-0000-0000-000000000004', '99999999-0000-0000-0000-000000000031',
   'dddd0001-0000-0000-0000-000000000003', 'Angielski — Grupa A (SP)', 1, 180.00);

-- Historia: marzec (opłacone po terminie 14.03 — kropka pomarańczowa)
insert into payments (id, parent_id, billing_month, due_date, total_amount, status,
                     paid_at, paid_amount, paid_on_time, delay_number) values
  ('eeee0001-0000-0000-0000-000000000003', '99999999-0000-0000-0000-000000000020',
   '2026-03-01', '2026-03-10', 1680.00, 'paid_late',
   '2026-03-14 09:00:00+01', 1680.00, false, 1);

insert into payment_lines (payment_id, student_id, class_id, description, lessons_per_week, amount) values
  ('eeee0001-0000-0000-0000-000000000003', '99999999-0000-0000-0000-000000000030',
   'dddd0001-0000-0000-0000-000000000001', 'Matematyka — indyw. (ŚR★)', 3, 1080.00),
  ('eeee0001-0000-0000-0000-000000000003', '99999999-0000-0000-0000-000000000031',
   'dddd0001-0000-0000-0000-000000000002', 'Angielski — indyw. (SP)', 2, 420.00),
  ('eeee0001-0000-0000-0000-000000000003', '99999999-0000-0000-0000-000000000031',
   'dddd0001-0000-0000-0000-000000000003', 'Angielski — Grupa A (SP)', 1, 180.00);

-- ============================================================================
-- 10. Szablony przypomnień (3 standardowe)
-- ============================================================================
insert into payment_reminder_templates (send_day_of_month, send_time, label, subject_template, body_template, sort_order) values
  (10, '09:00', 'Termin płatności dziś',
   'EDU LUZ — termin płatności za {miesiąc}',
   E'Dzień dobry {rodzic},\n\nDziś mija termin płatności za zajęcia w miesiącu {miesiąc} — kwota {kwota} zł.\nProsimy o opłacenie najpóźniej dziś.\n\nPozdrawiamy,\nEDU LUZ', 1),
  (20, '09:00', 'Drugie przypomnienie',
   'EDU LUZ — przypomnienie o płatności za {miesiąc}',
   E'Dzień dobry {rodzic},\n\nNie odnotowaliśmy wpłaty za zajęcia {uczeń} w miesiącu {miesiąc} ({kwota} zł).\nProsimy o uregulowanie należności.\n\nPozdrawiamy,\nEDU LUZ', 2),
  (0,  '09:00', 'Ostatnie przypomnienie',
   'EDU LUZ — pilne: zaległość za {miesiąc}',
   E'Dzień dobry {rodzic},\n\nZaległość za zajęcia {uczeń} w miesiącu {miesiąc} ({kwota} zł) nie została uregulowana.\nProsimy o pilny kontakt do {termin}.\n\nPozdrawiamy,\nEDU LUZ', 3);
