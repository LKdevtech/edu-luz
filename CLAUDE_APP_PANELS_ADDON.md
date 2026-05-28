# EDU LUZ — CLAUDE.md — Sekcja: PANELE APLIKACJI

> Dodatek do istniejącego CLAUDE.md.
> Wklej tę sekcję NA KOŃCU pliku CLAUDE.md (przed ewentualnym appendixem).
> Dotyczy: panele admin, korepetytor, rodzic, uczeń — routing, ekrany, mapowanie mockupów.
> Wersja: 1.0 · Maj 2026

---

## 11. Panele aplikacji — przegląd

Aplikacja żyje pod `/panel/...`. Po zalogowaniu użytkownik jest kierowany do panelu swojej roli.
Middleware sprawdza rolę z Supabase Auth i przekierowuje:
- `admin` → `/panel/admin/dashboard`
- `tutor` → `/panel/tutor/dashboard`
- `parent` → `/panel/parent/dashboard`
- `student` → `/panel/student/dashboard`

Każdy panel ma własny layout z sidebar + topbar. Sidebar jest zwijany (240px → 64px).

---

## 12. Routing paneli

### 12.1 Panel admina (`/panel/admin/`)

| Route | Ekran | Mockup |
|-------|-------|--------|
| `/panel/admin/dashboard` | Dashboard | `edu-luz-admin-dashboard.jsx` |
| `/panel/admin/schedule` | Harmonogram globalny | `edu-luz-admin-schedule.jsx` |
| `/panel/admin/tutors` | Korepetytorzy | `edu-luz-admin-tutors.jsx` |
| `/panel/admin/students` | Uczniowie i grupy | `edu-luz-admin-students.jsx` |
| `/panel/admin/payments` | Płatności | `edu-luz-admin-payments.jsx` |
| `/panel/admin/settings` | Ustawienia | `edu-luz-admin-settings.jsx` |

Interakcje szczegółowe (modale + inline) nie mają osobnych route'ów — żyją jako komponenty w ramach swoich ekranów. Referencja wizualna:
- `edu-luz-admin-detail-interactions.jsx` — 4 modale szybkich akcji + 3 rozwinięcia korepetytora
- `edu-luz-admin-group-interactions.jsx` — 3 rozwinięcia grupy

### 12.2 Panel korepetytora (`/panel/tutor/`)

| Route | Ekran | Mockup |
|-------|-------|--------|
| `/panel/tutor/dashboard` | Dashboard | `edu-luz-tutor-dashboard.jsx` |
| `/panel/tutor/schedule` | Harmonogram tydzień | `edu-luz-tutor-schedule.jsx` |
| `/panel/tutor/day` | Widok dzienny | `edu-luz-tutor-day-view.jsx` |
| `/panel/tutor/students` | Uczniowie | `edu-luz-tutor-students.jsx` |
| `/panel/tutor/lessons` | Dziennik wpisów | `edu-luz-tutor-lessons.jsx` |
| `/panel/tutor/makeup` | Odrabianie | `edu-luz-tutor-makeup.jsx` |
| `/panel/tutor/availability` | Dostępność | `edu-luz-tutor-availability.jsx` |

### 12.3 Panel rodzica (`/panel/parent/`)

| Route | Ekran | Mockup |
|-------|-------|--------|
| `/panel/parent/dashboard` | Dashboard | `edu-luz-parent-dashboard.jsx` |
| `/panel/parent/classes` | Zajęcia | `edu-luz-parent-classes.jsx` |
| `/panel/parent/payments` | Płatności | `edu-luz-parent-payments.jsx` |
| `/panel/parent/profile` | Profil | `edu-luz-parent-profile.jsx` |

**Specyfika rodzica:**
- Przełącznik dzieci (Wszystkie / per dziecko) — globalny filtr widoczny na każdym ekranie
- Sidebar: 4 pozycje (Dashboard, Zajęcia, Płatności, Profil)
- Badge RODZIC (fioletowy) pod logo w sidebarze
- Badge licznikowy przy Płatnościach (gdy jest zaległość)

### 12.4 Panel ucznia (`/panel/student/`)

| Route | Ekran | Mockup |
|-------|-------|--------|
| `/panel/student/dashboard` | Dashboard | `edu-luz-student-dashboard.jsx` |
| `/panel/student/classes` | Zajęcia | `edu-luz-student-classes.jsx` |
| `/panel/student/profile` | Profil | `edu-luz-student-profile.jsx` |

**Specyfika ucznia:**
- Sidebar: 3 pozycje (Dashboard, Zajęcia, Profil)
- Badge UCZEŃ (cyan) pod logo
- Topbar: „Cześć, {imię}" zamiast „Dzień dobry"
- BRAK widoku płatności, uwag dla rodzica, warunków umowy
- Odwołanie lekcji = prośba do rodzica (nie bezpośrednie)
- PD z checkboxami (jedyna rola, która zaznacza wykonanie PD)
- Kontakt z korepetytorem przez textarea + wyślij

---

## 13. Struktura plików paneli (produkcyjna)

```
app/panel/
├── layout.tsx                    ← wspólny layout paneli (sprawdzenie auth)
├── admin/
│   ├── layout.tsx                ← sidebar admina
│   ├── dashboard/page.tsx
│   ├── schedule/page.tsx
│   ├── tutors/page.tsx
│   ├── students/page.tsx
│   ├── payments/page.tsx
│   └── settings/page.tsx
├── tutor/
│   ├── layout.tsx                ← sidebar korepetytora
│   ├── dashboard/page.tsx
│   ├── schedule/page.tsx
│   ├── day/page.tsx
│   ├── students/page.tsx
│   ├── lessons/page.tsx
│   ├── makeup/page.tsx
│   └── availability/page.tsx
├── parent/
│   ├── layout.tsx                ← sidebar rodzica + przełącznik dzieci
│   ├── dashboard/page.tsx
│   ├── classes/page.tsx
│   ├── payments/page.tsx
│   └── profile/page.tsx
└── student/
    ├── layout.tsx                ← sidebar ucznia
    ├── dashboard/page.tsx
    ├── classes/page.tsx
    └── profile/page.tsx
```

---

## 14. Komponenty współdzielone między panelami

```
lib/components/panel/
├── Sidebar.tsx              ← uniwersalny sidebar (items per rola)
├── Topbar.tsx               ← topbar z powitaniem, powiadomieniami
├── ChildSwitcher.tsx        ← przełącznik dzieci (tylko rodzic)
├── LessonCard.tsx           ← karta lekcji (reużywalna: tutor, parent, student)
├── EntryCard.tsx            ← karta wpisu (rozwijana)
├── StatusBadge.tsx          ← badge statusu lekcji (7 wariantów)
├── LevelBadge.tsx           ← badge poziomu (6 wariantów: SP, E8, ŚR, ŚR★, EM, EM★)
├── PaymentCard.tsx          ← karta płatności (admin, parent)
├── MakeupCard.tsx           ← karta odrabiania (ping-pong)
├── CancelOverlay.tsx        ← overlay potwierdzenia odwołania (<24h / >24h)
├── StudentCancelRequest.tsx ← overlay prośby do rodzica (student)
├── HomeworkCheckbox.tsx     ← checkbox PD (tylko student)
├── ContactTeacher.tsx       ← textarea + wyślij (tylko student)
└── NotificationToggles.tsx  ← toggle'e powiadomień (parent, student)
```

---

## 15. Kolejność implementacji paneli

Rekomendowana kolejność (od najprostszego do najcięższego, z narastającymi zależnościami):

| Faza | Panel | Dlaczego teraz |
|------|-------|----------------|
| 1 | Student (3 ekrany) | Najprostszy, zero mutacji (oprócz PD checkbox), testuje read-only z bazy |
| 2 | Parent (4 ekrany) | Buduje na student, dodaje: przełącznik dzieci, płatności read, odwoływanie |
| 3 | Tutor (7 ekranów) | Główne mutacje: wpisy, obecność, odrabianie. Wymaga lesson/entry CRUD |
| 4 | Admin (6+2 ekranów) | Najcięższy: CRUD na wszystkim, modale, wizardy, ustawienia globalne |

Każda faza wymaga wcześniej postawionego Supabase (tabele + RLS dla danej roli).

---

## 16. Mapowanie mockup → komponent (zasada)

Każdy mockup JSX to monolityczny plik z inline styles i hardcoded danymi. Przy implementacji:

1. **Przeczytaj mockup** — to referencja wizualna 1:1
2. **Rozłóż na komponenty** — każda sekcja mockupu = osobny komponent w `lib/components/`
3. **Zamień inline styles na Tailwind** — kolory z mockupu (`#3B8FF0`) → klasy Tailwind (`text-link`, `bg-surface`)
4. **Zamień hardcoded dane na props/fetch** — dane z Supabase przez Server Actions
5. **Zachowaj dokładnie**: układ, spacing, kolory, animacje, hover effecty
6. **Różnica**: mockup = 1 plik JSX, produkcja = rozbite komponenty + prawdziwe dane

Prompt wzorcowy dla Claude Code:
```
Przeczytaj plik docs/mockups/{nazwa}.jsx — to jest zatwierdzony mockup. 
Odwzóruj go 1:1 w produkcyjnym kodzie: te same sekcje, kolejność, układ, spacing, kolory, animacje, hover effecty.
Rozłóż na komponenty zgodnie ze strukturą z CLAUDE.md.
```

---

## 17. Tabele Supabase potrzebne per panel

| Panel | Tabele (read) | Tabele (write) |
|-------|---------------|----------------|
| Student | lessons, entries, homework, students, tutors | homework (checkbox only) |
| Parent | lessons, entries, students, payments, tutors, groups | lessons (cancel), makeup_requests |
| Tutor | lessons, entries, students, groups, availability, makeup_requests | entries, attendance, availability, makeup_requests |
| Admin | WSZYSTKIE | WSZYSTKIE |

---

*Wersja: 1.0 · Maj 2026 · Gotowe do wklejenia do CLAUDE.md*
