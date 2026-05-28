# EDU LUZ — SYSTEM_INSTRUCTIONS v2

> Centrum korepetycji w Tomaszowie Mazowieckim.
> Kompletna specyfikacja aplikacji webowej (panele: admin, korepetytor, rodzic, uczeń).
> Wersja: 2.0 · Maj 2026 · Aktualizacja po zakończeniu fazy mockupów (27 ekranów)

---

## 1. Cel platformy

Aplikacja webowa do zarządzania centrum korepetycji EDU LUZ. Obsługuje 4 role: admin, korepetytor, rodzic, uczeń. Wszystko pod jedną domeną `eduluz.pl/panel/...`.

---

## 2. Role użytkowników

| Rola | Opis | Routing |
|------|------|---------|
| Admin | Zarządza centrum: korepetytorzy, uczniowie, grupy, płatności, ustawienia | `/panel/admin/...` |
| Korepetytor | Prowadzi lekcje, pisze wpisy, zarządza dostępnością | `/panel/tutor/...` |
| Rodzic | Widzi lekcje dzieci, płaci, odwołuje, proponuje odrabianie | `/panel/parent/...` |
| Uczeń | Widzi swoje lekcje, PD, notatki, kontaktuje korepetytora | `/panel/student/...` |

---

## 3. Zasady biznesowe

### 3.1 Model finansowy
- Umowy regularne ze stałą ceną, płatność do 10. dnia miesiąca
- Po 10.: status oczekujące → zaległość (automatycznie)
- Opłata rodzica = suma indywidualnych + grupowych (wszystkie dzieci)
- Wypłata korepetytora = godziny × stawka (oddzielnie indyw./grupa)
- Stawki per korepetytor, nie per poziom
- Nr opóźnienia śledzony per rodzic (1., 2., 3.+)
- Tworzenie grupy automatycznie dodaje zajęcia i opłatę wszystkim członkom

### 3.2 Odwoływanie lekcji
- **Admin:** odwołuje bezpośrednio, bez ograniczeń
- **Rodzic:** odwołuje w każdej chwili. >24h przed lekcją → do odrobienia. <24h → przepada
- **Uczeń:** NIE odwołuje samodzielnie. Wysyła prośbę → rodzic potwierdza (lub odrzuca). Badge „CZEKA NA RODZICA" widoczny w panelu ucznia
- **No-show:** lekcja przepada, brak odrabiania. Różne od odwołanej (osobny status)
- **Nieobecność korepetytora:** admin zatwierdza → system auto-odwołuje dotknięte lekcje → email do rodziców/uczniów z powodem → tworzą się uprawnienia do odrobienia

### 3.3 Odrabianie lekcji (ping-pong)
- Korepetytor proponuje termin → rodzic akceptuje / składa kontropropozycję / odrzuca
- Rodzic proponując termin widzi TYLKO: dodatkowe terminy korepetytora + okienka po odwołanych lekcjach
- NIGDY nie widzi slotów zajętych przez inne lekcje
- Slot znika po zarezerwowaniu
- W panelu ucznia: informacja „Rodzic musi zaakceptować" (uczeń nie negocjuje sam)

### 3.4 Przypomnienia o płatnościach
- 3 automatyczne: 10., 20., ostatni dzień miesiąca
- Szablony edytowalne z zmiennymi: {miesiąc}, {kwota}, {rodzic}, {uczeń}, {termin}
- Rodzic NIE MOŻE wyłączyć przypomnień całkowicie — min. 1 kanał (email lub push) musi być aktywny
- Rodzic może wybrać kanały (email, push) — ale 3 pozycje przypomnień płatności są zawsze aktywne
- Godzina wysyłki konfigurowalna per szablon (z panelu admina)

### 3.5 Dostępność korepetytorów
- Wieloblokowa: [[9,11], [15,18]] = dostępny 9–11 i 15–18 (przerwa 11–15)
- null = wolny dzień
- Stały plan to source of truth — admin zatwierdza
- Dodatkowe terminy (na odrabianie) korepetytor dodaje sam
- Edycja dostępności: admin + korepetytor

### 3.6 Statusy lekcji (7 statusów)
- ✓ zielony = zrealizowana z wpisem
- ✓ żółty = zrealizowana BEZ wpisu
- ● żółty = w trakcie
- ○ niebieski = zaplanowana
- ✕ czerwony = odwołana
- ⊘ pomarańczowy = no-show
- ↻ fioletowy = odrabianie

### 3.7 Poziomy nauczania (6 poziomów)
- SP = szkoła podstawowa (cyan)
- E8 = egzamin ósmoklasisty (żółty)
- ŚR = szkoła średnia (niebieski)
- ŚR★ = średnia rozszerzenie (fioletowy)
- EM = matura (czerwony)
- EM★ = matura rozszerzenie (różowy)

### 3.8 Godziny pracy centrum
- Zajęcia: Pon–Sob (godziny per dzień z ustawień admina)
- Kontakt telefoniczny: szerszy zakres niż zajęcia
- Niedziela: 9:00–14:00 (normalny dzień roboczy)
- Dwa osobne harmonogramy w ustawieniach

### 3.9 Grupy
- System dynamiczny, brak limitu grup
- Tworzenie grupy = automatyczne przypisanie zajęć + opłaty wszystkim członkom
- Dodanie członka = automatyczne przypisanie zajęć + opłaty do rachunku rodzica
- Rozwiązanie grupy = usunięcie zajęć + opłat + odwołanie zaplanowanych lekcji (nieodwracalne)
- Wyszukiwarka członków (nie lista checkboxów) z dropdown wynikami + tagi z ✕
- Edycja grupy ostrzega o wpływie na harmonogramy członków

### 3.10 Dodawanie ucznia
- 3-krokowy wizard w panelu admina:
  1. Dane ucznia: imię, nazwisko, klasa, poziom (6 opcji), data urodzenia
  2. Rodzic: dropdown istniejących LUB formularz nowego (imię, telefon, email, adres)
  3. Zajęcia: **KROK OPCJONALNY** — uczeń może istnieć bez zajęć indywidualnych (np. dołącza tylko do grupy). Dwa przyciski: „Pomiń — dodaj bez zajęć" / „✓ Dodaj ucznia z zajęciami"

### 3.11 Wpisy po lekcjach
- Obecność: ZAWSZE (solo i grupy), Obecny/Nieobecny
- System sam weryfikuje czy nieobecność była zgłoszona >24h
- Dla grup: uwagi dla rodziców INDYWIDUALNIE per uczeń (rodzic A nie widzi uwag o uczniu B)
- Temat + notatka dla ucznia: wspólne dla grupy
- Praca domowa: wspólna dla grupy
- Notatka wewnętrzna: tylko admin + korepetytor
- Blokada edycji wpisu po 48h

### 3.12 Dane z poprzednich zajęć
- Kliknięcie planowanej lekcji w harmonogramie korepetytora → dane Z POPRZEDNIEJ lekcji z tym uczniem
- Cel: korepetytor wie co było, jaki temat, jaką PD sprawdzić
- Jeśli brak historii → „Brak poprzednich zajęć z tym uczniem"

### 3.13 Cennik na stronie
- Cena MIESIĘCZNA jako domyślna (atrakcyjniejsza wizualnie)
- ~3.5 lekcji/miesiąc (35 spotkań / 10 okresów rozliczeniowych)
- BEZ ujawniania przeliczników klientowi
- Toggle miesiąc/lekcja dostępny w kalkulatorze
- Ceny zależą od: przedmiot × poziom × forma × korepetytor
- Strona pokazuje widełki „od–do", dokładna cena ustalana indywidualnie
- Dane cenowe z pliku konfiguracyjnego `lib/config/pricing.ts`

---

## 4. Panel korepetytora (7 ekranów)

### Sidebar: Dashboard, Harmonogram, Widok dzienny, Uczniowie, Dziennik wpisów, Odrabianie, Dostępność

### 4.1 Dashboard (`edu-luz-tutor-dashboard.jsx`)
- 4 priorytety: lekcje dziś, wpisy do uzupełnienia, prośby o odrabianie, nadchodzące zmiany
- Statystyki tygodnia: lekcji, uczniów, frekwencja
- Szybki podgląd harmonogramu dnia

### 4.2 Harmonogram tygodniowy (`edu-luz-tutor-schedule.jsx`)
- Siatka Pon–Ndz, bloki = lekcje, kolory = statusy
- Skróty poziomów w rogach (SP, ŚR★ itp.)
- Klik na planowaną → dane z POPRZEDNIEJ lekcji z tym uczniem
- Nawigacja po tygodniach ← →

### 4.3 Widok dzienny (`edu-luz-tutor-day-view.jsx`)
- Lista lekcji dnia z detalami: uczeń, przedmiot, sala, godzina, poziom
- Status każdej lekcji z kolorami
- Quick-action: zacznij wpis

### 4.4 Uczniowie (`edu-luz-tutor-students.jsx`)
- Lista uczniów korepetytora z rozwijalnymi kartami
- Filtr po przedmiocie, poziomie, statusie
- Dane kontaktowe rodzica, historia lekcji, statystyki per uczeń

### 4.5 Dziennik wpisów (`edu-luz-tutor-lessons.jsx`)
- Obecność solo + grupa
- Temat, notatka dla ucznia, PD, uwaga dla rodzica (per uczeń w grupie), notatka wewnętrzna
- Filtry: data, uczeń, status wpisu

### 4.6 Odrabianie (`edu-luz-tutor-makeup.jsx`)
- Oczekujące propozycje (ping-pong z rodzicami)
- Proponowanie nowego terminu
- Historia odrabianych

### 4.7 Dostępność (`edu-luz-tutor-availability.jsx`)
- Stały plan: read-only (admin decyduje)
- Dodatkowe terminy: korepetytor dodaje sam
- Wieloblokowy widok tygodnia

---

## 5. Panel admina (6 ekranów + 2 ekrany interakcji)

### Sidebar: Dashboard, Harmonogram, Korepetytorzy, Uczniowie i grupy, Płatności, Ustawienia. Badge ADMIN (fioletowy)

### 5.1 Dashboard (`edu-luz-admin-dashboard.jsx`)
- 4 statystyki: lekcje dziś, aktywni uczniowie, korepetytorzy, przychód miesiąca
- Alerty: zaległości płatnicze, wpisy do uzupełnienia, prośby o odrabianie
- Szybkie akcje (modale): Dodaj ucznia, Dodaj zajęcia, Nowa grupa, Wyślij komunikat
- Dzisiejsze lekcje z listą

### 5.2 Harmonogram globalny (`edu-luz-admin-schedule.jsx`)
- Siatka tygodniowa z WSZYSTKIMI korepetytorami
- Filtr po korepetytorze, sali, przedmiocie
- Kolory = statusy lekcji
- Nawigacja tygodniowa ← →

### 5.3 Korepetytorzy (`edu-luz-admin-tutors.jsx`)
- Lista korepetytorów z rozwijalnymi kartami
- Statystyki: lekcji/tydz, uczniów, stawka
- Inline akcje: Zgłoś nieobecność, Zmień stawki, Wyślij wiadomość

### 5.4 Uczniowie i grupy (`edu-luz-admin-students.jsx`)
- Dwie zakładki: Uczniowie / Grupy
- Uczniowie: rozwijane karty z zajęciami, rodzicem, historią
- Grupy: lista z członkami, edycja inline, dodawanie/usuwanie członków, rozwiązywanie grupy
- Wyszukiwarka w obu zakładkach

### 5.5 Płatności (`edu-luz-admin-payments.jsx`)
- Nawigacja po miesiącach ← →
- Lista rodzin z kwotami, statusami (opłacone/oczekujące/zaległość)
- Potwierdzanie wpłat, filtr statusów
- Statystyki miesiąca: łączna kwota, opłacone, zaległości

### 5.6 Ustawienia (`edu-luz-admin-settings.jsx`)
- 9 sekcji: Centrum, Sale, Przedmioty, Stawki, Godziny pracy, Przypomnienia, Umowy, Konta, Powiadomienia
- Godziny pracy: 2 harmonogramy (zajęcia + kontakt telefoniczny), per dzień z checkboxami
- Szablony przypomnień z zmiennymi {miesiąc}, {kwota}, {rodzic}, {uczeń}, {termin}
- Warunki umowy: okres, wypowiedzenie, termin odrobienia, czas na wpis, polityka no-show, polityka odwołań

### 5.7 Interakcje szczegółowe — Szybkie akcje z dashboardu (`edu-luz-admin-detail-interactions.jsx`)

**🎓 Dodaj ucznia** — 3-krokowy wizard:
1. Dane ucznia: imię, nazwisko, klasa, poziom (6 opcji), data urodzenia
2. Rodzic: dropdown istniejących LUB formularz nowego (imię, telefon, email, adres)
3. Zajęcia (OPCJONALNE): przedmiot, korepetytor, typ, opłata, lekcji/tydz, harmonogram. „+ Dodaj kolejne". Przyciski: „Pomiń — dodaj bez zajęć" / „✓ Dodaj ucznia z zajęciami"

**📚 Dodaj zajęcia** — dropdown ucznia, przedmiot, korepetytor, typ, sala, opłata, harmonogram tygodniowy z checkboxami dni

**👥 Nowa grupa** — nazwa, max osób, przedmiot, poziom, korepetytor, opłata/os/msc, harmonogram (dzień + godziny + sala). Członkowie: wyszukiwarka z dropdown wynikami + tagi z ✕. Nota: „Utworzenie grupy automatycznie doda zajęcia grupowe i opłatę do rachunków."

**📢 Wyślij komunikat** — checkboxy grup (wszyscy rodzice / z zaległościami / korepetytorzy) LUB dropdown indywidualny. Kanał (Email/Push/oba), temat, treść z zmiennymi ({rodzic}, {uczeń}, {miesiąc}, {kwota})

### 5.8 Interakcje szczegółowe — Korepetytorzy i grupy (`edu-luz-admin-group-interactions.jsx`)

**Karta korepetytora — rozwinięcia inline:**
- 🤒 Zgłoś nieobecność — typ (choroba/urlop/inne), czas, daty od-do, podgląd „Lekcje do odwołania (N)" z listą dotkniętych, komentarz → „Zatwierdź i odwołaj lekcje"
- 💰 Zmień stawki — obecne stawki + pola na nowe (indyw/grupa), dropdown „Obowiązuje od" (natychmiast/następny miesiąc/data). Ostrzeżenie o wpływie na rozliczenia
- 💬 Wyślij wiadomość — kanał, temat, treść → Wyślij

**Karta grupy — rozwinięcia inline:**
- Lista członków — awatar, imię, klasa, rodzic, opłata. ✕ z inline potwierdzeniem (Usuń/Nie)
- ✏️ Edytuj grupę — formularz z wypełnionymi danymi, ostrzeżenie „Zmiana wpłynie na plan zajęć wszystkich N członków"
- ➕ Dodaj członka — wyszukiwarka z dropdownem, nota „Dodanie automatycznie doda zajęcia i opłatę do rachunku rodzica"
- 🗑 Rozwiąż grupę — czerwone ostrzeżenie „nieodwracalna", lista konsekwencji (usunięcie zajęć, opłat, odwołanie lekcji), lista dotkniętych uczniów, powód, potwierdzenie

---

## 6. Panel rodzica (4 ekrany)

### Sidebar: Dashboard, Zajęcia, Płatności, Profil. Badge RODZIC (fioletowy). Badge licznikowy przy Płatnościach

### 6.1 Dashboard (`edu-luz-parent-dashboard.jsx`)
- **Przełącznik dzieci** na górze: Wszystkie / Kacper / Ola — filtruje globalnie wszystkie sekcje
- **Nadchodzące lekcje** — pogrupowane po dniach, awatar dziecka, przedmiot, badge poziomu, typ (GRUPA), korepetytor, godzina, sala. Badge „NASTĘPNA" z pulsacją. Przycisk „Odwołaj" na każdej lekcji: <24h = pomarańczowy + „przepadnie", >24h = czerwony + „do odrobienia"
- **Ostatnie wpisy** — rozwijane karty: temat, notatka ucznia, uwaga rodzica, PD ze statusem sprawdzenia
- **Twoje dzieci** — karty z imieniem, klasą, poziomem, lekcjami/tydz, frekwencją
- **Płatności** — kwota filtrowana per dziecko, status, rozbicie, kropki historii
- **Odrabianie** — propozycja od korepetytora (Akceptuj/Kontropropozycja/Odrzuć) + czekające na rodzica (picker slotów)
- **Kontakt z centrum** — telefon, email, „Wyślij wiadomość"

### 6.2 Zajęcia (`edu-luz-parent-classes.jsx`) — 3 pod-zakładki
- **Harmonogram** — karty pogrupowane po dniach tygodnia, badge „N zajęć/tydz". Sekcja „Wyjątki i zmiany" (zwijana)
- **Historia lekcji** — filtry statusów (Wszystkie/Zrealizowane/Zaplanowane/Odwołane/No-show). Rozwijane wpisy z detalami. Odwołanie z logiką <24h/>24h. Przyciemnione karty odwołanych/no-show
- **Odrabianie** — oczekujące (propozycja korepetytora / picker slotów) + historia odrabianych

### 6.3 Płatności (`edu-luz-parent-payments.jsx`)
- **Bieżący miesiąc** — duża kwota, status, nr opóźnienia, składowe opłaty per dziecko
- **Dane do przelewu** — odbiorca, nr konta, tytuł, kwota (kopiowalne)
- **Przypomnienia** — 3 badge'y (10., 20., ost. dzień) ze statusem
- **Historia wpłat** — rozwijane karty z kolorową kropką (terminowo = zielony / po terminie = pomarańczowy), rozbicie per dziecko
- **Oczekiwana wpłata** (prawa kolumna) — kwota, termin, następne przypomnienie
- **Timeline roku** — wizualne kropki Paź–Maj (kolory = status)
- **Informacje o umowie** — data, opłata, termin, dzieci

### 6.4 Profil (`edu-luz-parent-profile.jsx`)
- **Dane rodzica** — avatar, imię, telefon, email, adres. Tryb edycji z inputami
- **Dzieci** — rozwijane karty: klasa z nazwą szkoły, data urodzenia, karty zajęć (przedmiot, typ, stawka, korepetytor, harmonogram, sala), opłata per dziecko
- **Regulamin i warunki centrum** — zwijana sekcja, globalne z admina (read-only). Napis: „Warunki obowiązujące wszystkich uczniów centrum EDU LUZ"
- **Powiadomienia** — 2 karty:
  - Przypomnienia płatności: ZAWSZE aktywne, min. 1 kanał, 3 pozycje (10., 20., ost. dzień)
  - Pozostałe: 4 pozycje (nowy wpis, zmiana harmonogramu, odrabianie, komunikaty), dowolnie email/push
- **Centrum** — adres, telefon, email, wyślij wiadomość
- **Konto** — zmień hasło, wyloguj (bez opcji „zmień język")

---

## 7. Panel ucznia (3 ekrany)

### Sidebar: Dashboard, Zajęcia, Profil. Badge UCZEŃ (cyan). Topbar: „Cześć, {imię}" zamiast „Dzień dobry"

### 7.1 Dashboard (`edu-luz-student-dashboard.jsx`)
- **Nadchodzące lekcje** — bez awatara dziecka (jest tylko jeden uczeń). Odwołanie: overlay „Poprosić o odwołanie? ⚠ Prośba trafi do rodzica" → badge „CZEKA NA RODZICA" po wysłaniu
- **Praca domowa** — wyróżniona sekcja z checkboxami:
  - Do zrobienia: żółte karty, pusty checkbox, treść PD, termin
  - Zrobione: przyciemnione, przekreślone, badge „Sprawdzona ✓" / „Niesprawdzona"
  - Empty state: „🎉 Wszystko zrobione!"
- **Notatki z lekcji** — rozwijane karty, BEZ uwag dla rodzica (uczeń ich nie widzi)
- **Quick Info** — avatar, imię, klasa, poziom, korepetytor, lekcji/tydz, frekwencja
- **Moi korepetytorzy** — karta z przyciskiem „💬 Napisz" → textarea + wysyłka + potwierdzenie (auto-zamknięcie po 2s)
- **Stały plan zajęć** — mini tabelka Pon/Śr/Sob
- **Odrabianie** — propozycja + info „Rodzic musi zaakceptować"

### 7.2 Zajęcia (`edu-luz-student-classes.jsx`) — 3 pod-zakładki, bez przełącznika dzieci
- **Harmonogram** — karty z badge'em dnia, wyjątki (zwijane)
- **Historia** — filtry, rozwijane wpisy (tylko notatka dla ucznia — BEZ uwag dla rodzica), odwołanie → prośba do rodzica (overlay z ostrzeżeniem)
- **Odrabianie** — oczekujące + odrobione

### 7.3 Profil (`edu-luz-student-profile.jsx`)
- **Dane ucznia** — avatar, imię, klasa, poziom, data urodzenia, rodzic + kontakt
- **Stały plan zajęć** — karty z badge'em dnia
- **Powiadomienia push** — 5 toggle'ów (nadchodząca lekcja, nowa PD, nowy wpis, odrabianie, komunikaty)
- **Moi korepetytorzy** — kontakt z textarea (jak na dashboardzie)
- **Statystyki** — 6 kafelków: łącznie, zrealizowane, odwołane, no-show, odrobione, frekwencja
- **Centrum** — adres, telefon, email, wyślij wiadomość
- **Konto** — zmień hasło, wyloguj (bez opcji „zmień język")

---

## 8. Widoczność danych per rola

| Cecha | Admin | Korepetytor | Rodzic | Uczeń |
|-------|-------|-------------|--------|-------|
| Płatności | ✓ zarządza | ✗ | ✓ swoje | ✗ |
| Harmonogram globalny | ✓ | ✗ (tylko swój) | ✗ | ✗ |
| Wszyscy uczniowie | ✓ | ✓ swoich | ✓ swoje dzieci | ✗ (tylko siebie) |
| Dostępność korepetytorów | ✓ | ✓ swoją | ✗ | ✗ |
| Odwołuje lekcje | ✓ bezpośrednio | ✗ | ✓ bezpośrednio | ✓ prośba→rodzic |
| Pisze wpisy po lekcji | ✗ | ✓ | ✗ | ✗ |
| Widzi wpisy | ✓ | ✓ swoje | ✓ dziecka | ✓ swoje |
| Uwagi dla rodzica | ✓ | ✓ pisze | ✓ czyta | ✗ nie widzi |
| PD checkboxy | ✗ | ✗ | ✗ | ✓ |
| Przełącznik dzieci | ✗ | ✗ | ✓ | ✗ |
| Kontakt → korepetytor | ✗ | ✗ | ✗ | ✓ (textarea + wyślij) |
| Ustawienia globalne | ✓ | ✗ | ✗ | ✗ |
| Warunki umowy | ✓ edytuje | ✗ | ✓ read-only | ✗ |
| Zmiana stawek | ✓ | ✗ | ✗ | ✗ |
| Zarządzanie grupami | ✓ | ✗ | ✗ | ✗ |
| Notatka wewnętrzna | ✓ | ✓ | ✗ | ✗ |

---

## 9. Wzorce interakcji (wspólne dla paneli)

- **Rozwijane karty** — klik na wiersz rozwija szczegóły (nie otwiera nowy widok)
- **Inline edycja** — „Edytuj" rozwija formularz pod elementem, nie kieruje nigdzie
- **Inline dodawanie** — „+ Dodaj" otwiera formularz z przerywaną ramką
- **Modale** — szybkie akcje z dashboardu admina (4 modale)
- **Wizard krokowy** — dodawanie ucznia: 3 kroki z paskiem postępu
- **Wyszukiwarka z dropdownem** — członkowie grupy, filtrowanie uczniów
- **Kontekstowe akcje** — przyciski zależne od statusu obiektu (np. „Odwołaj" zmienia wygląd <24h vs >24h)
- **Filtry w pasku** — przełączniki statusu + wyszukiwarka + filtr po atrybucie
- **Nawigacja po miesiącach** — ← → w płatnościach/rozliczeniach
- **Zwijane listy** — domyślnie 5 elementów, „Pokaż wszystkich (N)" z scrollem
- **Toggle z blokadą** — min. 1 kanał dla przypomnień płatności
- **Overlay potwierdzenia** — na karcie, semi-transparent (np. odwołanie lekcji, usunięcie członka)
- **Prośba o akcję** — uczeń → rodzic przy odwołaniu (overlay z ostrzeżeniem „⚠ Prośba trafi do rodzica")

---

## 10. Mapa plików mockupów (27 plików JSX)

### Strona publiczna (5)
`edu-luz-landing-full.jsx`, `edu-luz-oferta.jsx`, `edu-luz-o-nas.jsx`, `edu-luz-kontakt.jsx`, `edu-luz-login.jsx`

### Panel korepetytora (7)
`edu-luz-tutor-dashboard.jsx`, `edu-luz-tutor-schedule.jsx`, `edu-luz-tutor-day-view.jsx`, `edu-luz-tutor-students.jsx`, `edu-luz-tutor-lessons.jsx`, `edu-luz-tutor-makeup.jsx`, `edu-luz-tutor-availability.jsx`

### Panel admina (6 + 2 interakcje)
`edu-luz-admin-dashboard.jsx`, `edu-luz-admin-schedule.jsx`, `edu-luz-admin-tutors.jsx`, `edu-luz-admin-students.jsx`, `edu-luz-admin-payments.jsx`, `edu-luz-admin-settings.jsx`, `edu-luz-admin-detail-interactions.jsx`, `edu-luz-admin-group-interactions.jsx`

### Panel rodzica (4)
`edu-luz-parent-dashboard.jsx`, `edu-luz-parent-classes.jsx`, `edu-luz-parent-payments.jsx`, `edu-luz-parent-profile.jsx`

### Panel ucznia (3)
`edu-luz-student-dashboard.jsx`, `edu-luz-student-classes.jsx`, `edu-luz-student-profile.jsx`

---

## 11. Dane testowe (mockupy)

### Rodzina testowa
- **Rodzic:** Monika Nowak (MN), tel. +48 602 345 678, monika.nowak@gmail.com
- **Dziecko 1:** Kacper Nowak (KN), 2 LO, ŚR★, ur. 12.03.2009
  - Matematyka indyw., Tomasz Kowalski, Pon 14:00 + Śr 14:00 + Sob 9:00, Sala 1, 1080 zł/msc
- **Dziecko 2:** Ola Nowak (ON), kl. 7, SP, ur. 05.09.2012
  - Angielski indyw., Maria Zielińska, Wt 15:15 + Czw 15:15, Sala 2, 420 zł/msc
  - Angielski grupa „Grupa A", Maria Zielińska, Śr 16:30, Sala 3, 180 zł/msc
- **Łączna opłata:** 1680 zł/msc

### Korepetytorzy
- Tomasz Kowalski (TK) — Matematyka, stawka 60 zł/h indyw., 45 zł/h grupa
- Maria Zielińska (MZ) — Angielski

### Centrum
- EDU LUZ, ul. Szkolna 8, Tomaszów Mazowiecki
- Tel. +48 123 456 789
- Pon–Sob 7:30–21:00, Ndz 9:00–14:00
- Nr konta: PL 12 3456 7890 1234 5678 9012 3456

---

*Wersja: 2.0 FINAL · Maj 2026 · 27 ekranów w 5 panelach · Gotowe do implementacji*
