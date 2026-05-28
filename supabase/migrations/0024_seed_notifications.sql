-- 0024_seed_notifications.sql
-- EDU LUZ — testowe powiadomienia dla każdej roli (demo dzwonka).
-- Używamy now() - interval, żeby czas relatywny ("X min temu") był zawsze świeży.
-- Profile: admin=…01, tutor Tomasz=…10, parent Monika=…20, student Kacper=…30.

insert into notifications (user_id, type, title, message, read, created_at) values
  -- ── ADMIN (…01) ──
  ('99999999-0000-0000-0000-000000000001', 'absence',
   'Nowa nieobecność korepetytora',
   'Anna Nowak zgłosiła nieobecność (urlop 27–29.05) — 3 lekcje do odwołania.',
   false, now() - interval '15 minutes'),
  ('99999999-0000-0000-0000-000000000001', 'payment_reminder',
   'Zaległość płatnicza',
   'Joanna Wiśniewska — zaległość za maj (1240 zł), 3. opóźnienie.',
   false, now() - interval '3 hours'),
  ('99999999-0000-0000-0000-000000000001', 'admin_message',
   'Zaległe wpisy',
   '3 wpisy przekroczyły termin 48h — naliczono punkty karne.',
   true, now() - interval '1 day'),

  -- ── KOREPETYTOR Tomasz (…10) ──
  ('99999999-0000-0000-0000-000000000010', 'lesson_change',
   'Odwołana lekcja',
   'Rodzic Adama Wiśniewskiego odwołał lekcję z 21.05 — utworzono odrabianie.',
   false, now() - interval '40 minutes'),
  ('99999999-0000-0000-0000-000000000010', 'admin_message',
   'Punkt karny',
   'Brak wpisu po 48h od lekcji (Zofia, 25.05) — naliczono punkt karny.',
   false, now() - interval '5 hours'),
  ('99999999-0000-0000-0000-000000000010', 'admin_message',
   'Komunikat od centrum',
   'Zebranie korepetytorów w piątek o 17:00 w sali 3.',
   true, now() - interval '2 days'),

  -- ── RODZIC Monika (…20) ──
  ('99999999-0000-0000-0000-000000000020', 'payment_reminder',
   'Przypomnienie o płatności',
   'Termin płatności za maj mija 10.06 — kwota 1680 zł.',
   false, now() - interval '30 minutes'),
  ('99999999-0000-0000-0000-000000000020', 'entry_added',
   'Nowy wpis z lekcji',
   'Kacper — Matematyka: Trygonometria. Dodano pracę domową (termin 01.06).',
   false, now() - interval '6 hours'),
  ('99999999-0000-0000-0000-000000000020', 'lesson_change',
   'Zmiana w harmonogramie',
   'Środowa lekcja Kacpra (27.05) odwołana — choroba korepetytora.',
   true, now() - interval '1 day'),

  -- ── UCZEŃ Kacper (…30) ──
  ('99999999-0000-0000-0000-000000000030', 'entry_added',
   'Nowy wpis z lekcji',
   'Matematyka — Trygonometria. Sprawdź pracę domową w zakładce Zajęcia.',
   false, now() - interval '20 minutes'),
  ('99999999-0000-0000-0000-000000000030', 'lesson_change',
   'Lekcja odwołana',
   'Środowa lekcja (27.05) odwołana — odrobicie ją w innym terminie.',
   false, now() - interval '4 hours'),
  ('99999999-0000-0000-0000-000000000030', 'admin_message',
   'Witaj w EDU LUZ',
   'Twoje konto zostało aktywowane. Miłej nauki!',
   true, now() - interval '3 days');
