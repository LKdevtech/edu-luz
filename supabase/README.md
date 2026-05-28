# EDU LUZ — Supabase schema

Migracje DDL dla aplikacji webowej (panele admin/tutor/parent/student).
Wersja v1 — schema tylko (RLS będzie w kolejnej fazie, kiedy będą realne queries
i wzorce dostępu z endpointów).

## Struktura migracji

| Plik | Zawartość |
|------|-----------|
| `0001_extensions.sql` | `pgcrypto`, `citext`, `btree_gist` |
| `0002_enums.sql` | Wszystkie enumy biznesowe (role, statusy, formy, kanały) |
| `0003_profiles.sql` | `profiles` (rozszerza `auth.users`) + trigger `updated_at` |
| `0004_dictionaries.sql` | `subjects`, `rooms` |
| `0005_center_settings.sql` | `center_settings` (singleton), `working_hours`, `contract_terms` |
| `0006_people.sql` | `parents`, `students`, `tutors`, `tutor_subjects`, `tutor_rates`, `availability_blocks`, `extra_slots` |
| `0007_groups.sql` | `groups`, `group_members` |
| `0008_classes.sql` | `classes`, `weekly_slots` |
| `0009_lessons.sql` | `lessons`, `attendance`, `schedule_exceptions` |
| `0010_entries_homework.sql` | `entries`, `entry_parent_notes`, `homework`, `homework_completions` |
| `0011_payments.sql` | `payments`, `payment_lines` + dodaje `parents.late_count` |
| `0012_reminders.sql` | `payment_reminder_templates`, `payment_reminders_sent`, `notification_preferences` |
| `0013_makeup.sql` | `makeup_requests`, `makeup_proposals`, `tutor_absences` |
| `0014_messages.sql` | `admin_announcements`, `direct_messages` |
| `0015_seed.sql` | Dane testowe: rodzina Nowak + Tomasz Kowalski + Maria Zielińska |
| `0016_cancel_requests.sql` | `lesson_cancel_requests` — prośby ucznia o odwołanie, status pending/approved/rejected |
| `0017_seed_current_week.sql` | Rich seed: lekcje/wpisy/PD/odrabianie dla maja-czerwca 2026 |

## Model — co warto wiedzieć

### Tożsamość i role
- `auth.users` (Supabase) ← `profiles.id` z `role` (user_role enum).
- Per rola jedna z tabel specjalizujących: `parents` / `students` / `tutors`. Admin nie ma osobnej tabeli — wystarczy `profiles.role='admin'`.

### Zajęcia ≠ lekcje
- `classes` = **umowa zajęciowa** (kto uczy kogo z czego, za ile/msc, w której sali). Tygodniowy plan: N wierszy w `weekly_slots`.
- `lessons` = **konkretne wystąpienie** (data + godziny + status). Generowane z `classes` + `weekly_slots` (job po stronie aplikacji).
- Klasa może mieć `student_id` (indyw./para) LUB `group_id` (grupa) — wymusza to CHECK na klasie.

### Grupy
- Tworzenie grupy = utworzenie 1 `classes` (form='group', group_id=…). Dodawanie członka = `group_members`.
- Reguła z mockupa „dodanie członka automatycznie doda zajęcia i opłatę do rachunku rodzica" = aplikacja generuje `payment_lines` w kolejnej fakturze (nie trigger DB, żeby zachować kontrolę nad logiką cennika).

### Stawki korepetytorów
- `tutor_rates` jest **wersjonowany** (`effective_from`). Aktualna stawka = MAX po `effective_from <= today`. UI „Obowiązuje od" pozwala wstawić wiersz na przyszłość.

### Wpisy po lekcjach
- `entries` (1:1 z `lessons`): wspólne pola dla całej grupy (temat, notatka_ucznia, PD, notatka_wewnętrzna).
- `entry_parent_notes`: **per-uczeń** uwagi dla rodzica. Brak wiersza = brak uwag. Rodzic widzi tylko wiersze dla swoich dzieci → izolacja "rodzic A nie widzi uwag o uczniu B" załatwiona przez UI/RLS, nie przez separowanie wpisów.
- `homework` 1:1 z `entries` (PD wspólna dla grupy), `homework_completions` per uczeń (jedyna mutacja roli `student`).

### Płatności
- `payments` per (parent, billing_month). Sumaryczna kwota + status.
- `payment_lines` rozbija per uczeń + class (np. „Ola — Grupa A — 180 zł").
- `parents.late_count` to **licznik per rodzic** (a nie per płatność) — śledzony do labeli typu „nr opóźnienia 2/3+".

### Odrabianie (ping-pong)
- `makeup_requests` 1:1 z odwołaną lekcją (`original_lesson_id`).
- `makeup_proposals` to historia rund — kolejne propozycje/kontrpropozycje od `tutor` i `parent`. Aplikacja decyduje który widok pokazać (Pending/Sent/Accepted/History).
- Po akceptacji powstaje nowa lekcja w `lessons` z `makeup_for_lesson_id` ustawionym; `makeup_requests.resulting_lesson_id` ułatwia join.

### Dostępność i odrabianie z dodatkowych slotów
- `availability_blocks` = stały plan tygodnia (multi-block per dzień).
- `extra_slots` = konkretne dodatkowe terminy (data, sala) wpisywane przez korepetytora — to one są widoczne dla rodzica jako pula slotów do odrabiania (`status='open'`).

### Niewdrożone w v1 (świadomie)
- **RLS** — schema gotowa, polisy w kolejnej migracji jak będą endpointy.
- **Pełna paginacja zdarzeń** — komunikaty 1:1 są tu „płaską listą". Wątkowanie zostawione na potem.
- **Generator lekcji z weekly_slots → lessons** — to logika aplikacji (cron/migration job), nie DB trigger.

## Lokalne uruchomienie

Wymaga Supabase CLI (lokalnego). Z katalogu `edu-luz-system/`:

```bash
supabase start           # uruchamia lokalny Postgres + Studio
supabase db reset        # czyści i odtwarza wszystkie migracje + seed
```

Po `db reset` Studio na `http://localhost:54323` pokaże wszystkie tabele + seed.

## Konta seed (lokalne)

| Email | Hasło | Rola |
|-------|-------|------|
| `admin@eduluz.pl` | `admin1234` | admin |
| `tomasz.kowalski@eduluz.pl` | `tutor1234` | tutor |
| `maria.zielinska@eduluz.pl` | `tutor1234` | tutor |
| `monika.nowak@gmail.com` | `parent1234` | parent |
| `kacper.nowak@eduluz.pl` | `student1234` | student |
| `ola.nowak@eduluz.pl` | `student1234` | student |

> Hasła tylko do lokalnego dev. **NIGDY** nie uruchamiaj `0015_seed.sql` na produkcji.
