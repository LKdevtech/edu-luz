# EDU LUZ — CLAUDE.md (Kontekst dla Claude Code)

> Centrum korepetycji w Tomaszowie Mazowieckim.
> Ten plik jest jedynym źródłem prawdy dla Claude Code.
> Wersja: 1.0 · Maj 2026 · Faza: STRONA PUBLICZNA

---

## 0. Co to jest

EDU LUZ to centrum korepetycji. Budujemy:
1. **Stronę publiczną** (marketing, cennik, kontakt) ← TERAZ TO ROBIMY
2. **Aplikację webową** (panele: admin, korepetytor, rodzic, uczeń) ← PÓŹNIEJ

Oba żyją w jednym projekcie Next.js, pod jedną domeną `eduluz.pl`.

---

## 1. Stack technologiczny

| Warstwa | Technologia |
|---------|-------------|
| Framework | Next.js 14, App Router, TypeScript strict |
| Styling | Tailwind CSS 3 |
| Font | Nunito (Google Fonts), wagi 400–900 |
| Komponenty UI | shadcn/ui (bazowe) |
| Hosting | Vercel (Hobby → Pro) |
| Backend (później) | Supabase (PostgreSQL 15, RLS, Edge Functions) |
| Email (kontakt) | Resend API |
| Walidacja | Zod |
| Repo | GitHub |

---

## 2. Struktura projektu

```
app/
├── (public)/              ← layout strony publicznej (navbar + footer)
│   ├── page.tsx           ← landing page
│   ├── oferta/page.tsx    ← oferta + kalkulator cenowy
│   ├── o-nas/page.tsx
│   ├── kontakt/page.tsx
│   └── blog/page.tsx      ← placeholder "wkrótce"
├── login/page.tsx         ← strona logowania (na razie tylko UI)
├── panel/                 ← przyszła aplikacja (NA RAZIE PUSTE)
│   ├── admin/
│   ├── tutor/
│   ├── parent/
│   └── student/
└── layout.tsx             ← root layout (font, metadata)

lib/
├── config/
│   └── pricing.ts         ← cennik (jedyne źródło prawdy o cenach)
├── components/
│   ├── ui/                ← Button, Badge, Card, Input (shadcn/ui)
│   ├── layout/            ← Navbar, Footer, MobileDrawer
│   └── sections/          ← sekcje podstron (Hero, USP, Subjects...)
└── utils/

public/
├── logo-ez.png            ← logo (plik dostarczony)
└── images/
```

---

## 3. Design System — "Ciemne z życiem" (Wariant A)

### 3.1 Filozofia

Hasło: "Nowoczesna edukacja, zero stresu"
Strona publiczna = ZAWSZE tryb ciemny.
Panele aplikacji (później) = ciemny domyślny + przełącznik na jasny.

Zasady:
- Mobile-first (Tailwind: sm → md → lg → xl)
- Zaokrąglone narożniki, miękkie kształty
- Każdy klikalny element MA hover/active animation
- Hierarchia przez typografię i kolor, nie dekoracje

### 3.2 Paleta kolorów — tryb ciemny

| Rola | Hex | Tailwind custom |
|------|-----|-----------------|
| BG main | `#151827` | `bg-main` |
| BG alt | `#1C2035` | `bg-alt` |
| Surface | `#232840` | `surface` |
| Surface hover | `#2A3050` | `surface-hover` |
| Border subtle | `rgba(59,143,240,0.10)` | `border-subtle` |
| Text primary | `#F0EDE6` | `text-primary` |
| Text secondary | `#9B97AF` | `text-secondary` |
| Text dim | `#6B6780` | `text-dim` |

### 3.3 Kolory akcentowe (wspólne)

| Rola | Hex | Użycie |
|------|-----|--------|
| Primary | `#3B8FF0` | CTA, linki, akcje główne |
| Primary dark | `#2D7DE8` | Hover na primary |
| Secondary | `#FF6F4A` | Pomarańczowy — wyróżnienia |
| Tertiary | `#FFCA28` | Żółty — oczekujące |
| Accent | `#7C5CFC` | Fioletowy — kontropropozycje |
| Success | `#22C55E` | Zrealizowane, aktywne |
| Cyan | `#06B6D4` | Info |
| Danger | `#EF4444` | Błędy |
| Pink | `#E84393` | Polski (przedmiot) |

### 3.4 Kolory przedmiotów

| Przedmiot | Hex |
|-----------|-----|
| Matematyka | `#3B8FF0` |
| Angielski | `#06B6D4` |
| Fizyka | `#F59E0B` |
| Chemia | `#22C55E` |
| Polski | `#E84393` |
| Elektrotechnika | `#FF6F4A` |

### 3.5 Typografia — Nunito

| Rola | Rozmiar | Waga | Line-height |
|------|---------|------|-------------|
| H1 (hero) | 48–56px | 900 | 1.1 |
| H2 (sekcje) | 32–36px | 800 | 1.2 |
| H3 (podsekcje) | 22–24px | 700 | 1.3 |
| Body | 15–16px | 400/500 | 1.6 |
| Small / caption | 12–13px | 600 | 1.4 |
| Badge / pill | 11–12px | 700 | 1.0 |
| CTA button | 15–16px | 800 | 1.0 |

### 3.6 Animacje (standardowe dla wszystkich interaktywnych elementów)

```css
/* Hover na kartach */
transform: translateY(-2px);
box-shadow: 0 8px 24px rgba(59,143,240,0.12);
transition: all 0.25s ease;

/* Hover na przyciskach primary */
transform: scale(1.03);
box-shadow: 0 0 20px rgba(59,143,240,0.3);

/* Active (klik) */
transform: scale(0.98);

/* Hover na linkach nav */
color: #FFFFFF (z text-secondary);

/* Blur blobs (dekoracyjne) */
position: absolute;
border-radius: 50%;
filter: blur(60–80px);
opacity: 0.03–0.08;
```

### 3.7 Spacing

Base unit: 4px. Używaj wielokrotności: 8, 12, 16, 24, 32, 48, 64, 96.
Sekcje na landing page: padding-y 80–96px.
Karty: padding 24–32px, gap 16–24px.
Border-radius: buttons 12px, cards 16px, pills 9999px, inputs 10px.

---

## 4. Nawigacja strony publicznej

**Navbar:** sticky, backdrop-blur, semi-transparent bg
- Logo PNG (Ez) + tekst "EDU LUZ"
- Linki: Strona główna | Oferta i cennik | O nas | Blog | Kontakt
- CTA: "Zaloguj się" (outline button)
- Mobile: hamburger → drawer z linkami + CTA
- Aktywna podstrona: kolor primary
- Hover: text → biały

**Footer:**
- Logo + adres centrum
- Nawigacja (powtórzone linki)
- Dane kontaktowe (tel, email)
- Linki prawne (regulamin, polityka prywatności — placeholder)
- Copyright

---

## 5. Cennik — logika kalkulatora

### 5.1 Dane korepetytorów (WEWNĘTRZNE — nigdy na frontend!)

| Korepetytor | Przedmiot | Poziomy | Stawka/h |
|-------------|-----------|---------|----------|
| Zuzia | Polski | SP, ŚR, ŚR★ | 45 zł |
| Zuzia | Matematyka | SP, ŚR | 45 zł |
| Julia | Angielski | SP, ŚR, ŚR★ | 45 zł |
| Patrycja | Matematyka | SP | 40 zł |
| Patrycja | Chemia | SP | 40 zł |
| Maciek Kap. | Matematyka | SP, ŚR | 45 zł |
| Maciek Kap. | Fizyka | SP | 45 zł |
| Maciej Kow. | Matematyka | ŚR★ | 70 zł |
| Maciej Kow. | Chemia | ŚR★ | 70 zł |
| Kacper | Matematyka | ŚR★ | 80 zł |
| Kacper | Fizyka | ŚR★ | 80 zł |
| Kacper | Elektrotechnika | ŚR★ | 80 zł |

### 5.2 Formuła cenowa

```
cena_klienta = stawka_korepetytora + MAX(40 zł, stawka × 0.60)
```

Przykład: stawka 45 zł → 45 × 0.60 = 27 zł < 40 zł → narzut = 40 zł → cena = 85 zł
Przykład: stawka 80 zł → 80 × 0.60 = 48 zł > 40 zł → narzut = 48 zł → cena = 128 zł

### 5.3 Mnożniki czasu trwania

| Czas | Mnożnik |
|------|---------|
| 45 min | × 0.85 |
| 60 min | × 1.00 (baza) |
| 90 min | × 1.48 |
| 120 min | × 1.95 |

### 5.4 Grupy

```
cena_per_osoba = cena_indywidualna + (liczba_osób - 1) × 5 zł
```

### 5.5 Przelicznik miesięczny

```
cena_miesięczna = cena_za_lekcję × 3.5
```

(35 spotkań ÷ 10 okresów = 3.5 lekcji/miesiąc)
Przelicznik NIE jest widoczny na stronie.

### 5.6 Co widzi klient na stronie

Kalkulator pokazuje **widełki** (min–max) dla danej kombinacji przedmiot × poziom × forma × czas.
Na stronie domyślnie ceny **MIESIĘCZNE**, z togglem na "za lekcję".

---

## 6. Podstrony — opis sekcji

### 6.1 Landing page (/)

1. **Hero** — nagłówek z gradientem "Korepetycje bez stresu / na serio", podtytuł, CTA "Sprawdź ofertę", dekoracyjne blur blobs
2. **USP** — 3–4 karty z ikonami (indywidualne podejście, wykwalifikowani tutorzy, elastyczny harmonogram, przyjazna atmosfera)
3. **Przedmioty** — 6 pill badges z kolorami przedmiotów (mat, ang, fiz, chem, pol, elektro) + rozwijane formy zajęć
4. **Social proof** — statystyki (uczniów, lat doświadczenia, % zdawalności matur) — PLACEHOLDER
5. **CTA końcowe** — "Umów bezpłatną konsultację" z przyciskiem do kontaktu

### 6.2 Oferta i cennik (/oferta)

1. **Intro** — wartości EDU LUZ (3 karty)
2. **Formy zajęć** — indywidualne, w parze, grupowe (3–4 os.), kursy specjalne
3. **Kalkulator cenowy** — interaktywny: wybierz przedmiot → poziom → formę → czas → wyświetla widełki miesięczne
4. **Tabela cen** — auto-generowana z `pricing.ts`
5. **FAQ** — rozwijane pytania

### 6.3 O nas (/o-nas)

1. **Historia** — jak powstało EDU LUZ
2. **Zespół** — karty korepetytorów (imię, przedmioty, krótkie bio) — PLACEHOLDER
3. **Timeline** — kamienie milowe
4. **Statystyki** — powtórzone z landing page

### 6.4 Kontakt (/kontakt)

1. **Formularz** — imię, email, telefon (opcja), temat (dropdown), wiadomość → wysyłka mailem przez Resend
2. **Dane kontaktowe** — adres, telefon, email, godziny otwarcia
3. **Mapa** — Google Maps embed — PLACEHOLDER (po adresie)

### 6.5 Blog (/blog)

Placeholder: "Wkrótce — tutaj pojawią się artykuły o nauce i edukacji"

### 6.6 Logowanie (/login)

1. **Formularz** — email + hasło, przycisk "Zaloguj się"
2. **Link "Zapomniałem hasła"**
3. **Info chipy** — rozwijane informacje dla rodziców/uczniów o tym co mogą robić po zalogowaniu
4. Na razie: TYLKO UI, bez podpięcia do Supabase Auth

---

## 7. Placeholdery do uzupełnienia przez właściciela

- [ ] Adres centrum (ulica, miasto)
- [ ] Numer telefonu
- [ ] Godziny otwarcia
- [ ] Treść "O nas" (historia, misja)
- [ ] Bio korepetytorów (imiona już znane: Zuzia, Julia, Patrycja, Maciek, Maciej, Kacper)
- [ ] Statystyki (ilu uczniów, lata doświadczenia, % matur)
- [ ] Zdjęcie centrum / zespołu
- [ ] Profile social media
- [ ] Opinie rodziców (po pilocie)
- [ ] Google Maps embed (po adresie)
- [ ] Regulamin i polityka prywatności

---

## 8. Decyzje Fazy 0 (zatwierdzone)

- ✅ Routing: ta sama domena, `eduluz.pl/panel/...`
- ✅ Hosting: Vercel
- ✅ Cennik: widełki min–max, auto z danych korepetytorów
- ✅ Narzut: MAX(40 zł, 60%)
- ✅ Formularz kontaktowy: tylko mail (Resend), bez zapisu do bazy
- ✅ Domena mailowa: Google Workspace (@eduluz.pl)
- ✅ Design: Wariant A "Ciemne z życiem", font Nunito
- ✅ Logo: PNG z napisem "Ez" (graffiti-style)

---

## 9. Zasady dla Claude Code

### 9.1 Autonomia — CO MOŻESZ robić sam

- Tworzenie komponentów UI (Button, Card, Badge, etc.)
- Implementacja podstron z sekcji 6
- Konfiguracja Tailwind, fontu, layoutów
- Pisanie `pricing.ts` i kalkulatora
- ESLint, Prettier, konfiguracja narzędzi
- Instalacja paczek npm
- Git: commit, push, tworzenie branchy
- Naprawianie błędów TypeScript i lintowania

### 9.2 Autonomia — PRZED CZYM SIĘ ZATRZYMAJ i zapytaj

- Zmiana struktury folderów (np. przenoszenie `app/panel/`)
- Cokolwiek związanego z Supabase, bazą danych, RLS (to PÓŹNIEJ)
- Deploy na produkcję (Vercel)
- Zmiana logiki cenowej (formuła narzutu, mnożniki)
- Dodawanie nowych podstron nieprzewidzianych w planie
- Konfiguracja domeny, DNS, SSL
- Middleware Next.js

### 9.3 Styl kodu

- TypeScript strict, żadnego `any`
- Komponenty: funkcyjne, React Server Components gdzie możliwe
- Nazwy plików: kebab-case (`pricing-calculator.tsx`)
- Nazwy komponentów: PascalCase (`PricingCalculator`)
- Eksporty: named exports (nie default), wyjątek: `page.tsx` i `layout.tsx`
- Tailwind: klasy bezpośrednio w JSX, bez `@apply` w CSS
- Zod do walidacji formularzy
- Server Actions do mutacji (formularz kontaktowy)
- Komentarze po polsku w kodzie biznesowym, po angielsku w kodzie technicznym

### 9.4 Konwencje Git

- Branch naming: `feat/landing-page`, `feat/pricing-calculator`, `fix/navbar-mobile`
- Commit messages: po angielsku, conventional commits (`feat:`, `fix:`, `chore:`, `style:`)
- Mały, atomowy commit = 1 logiczna zmiana

---

## 10. Plan implementacji (kolejność)

| Krok | Co | Zależność |
|------|-----|-----------|
| 1 | Init projektu + Tailwind + font + struktura | — |
| 2 | Komponenty bazowe (Button, Card, Badge, Container) | Krok 1 |
| 3 | Layout: Navbar + Footer + MobileDrawer | Krok 2 |
| 4 | Landing page | Krok 3 |
| 5 | `pricing.ts` + kalkulator cenowy | Krok 2 |
| 6 | Oferta (/oferta) | Krok 3 + 5 |
| 7 | O nas (/o-nas) | Krok 3 |
| 8 | Kontakt (/kontakt) + Resend | Krok 3 |
| 9 | Login (/login) — tylko UI | Krok 3 |
| 10 | Blog placeholder | Krok 3 |
| 11 | SEO: metadane, OG images, sitemap, robots.txt | Kroki 4–10 |
| 12 | Responsywność: test mobile/tablet | Kroki 4–10 |
| 13 | Lighthouse audit + poprawki | Krok 11–12 |
| 14 | Deploy na Vercel | Krok 13 |

---

*CLAUDE.md v1.0 · EDU LUZ · Strona publiczna · Maj 2026*
