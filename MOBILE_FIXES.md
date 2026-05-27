# Poprawki wizualne — MOBILE ONLY + pinezka na mapie

> WAŻNE: Wszystkie zmiany dotyczą TYLKO widoku mobilnego (< 768px).
> Wygląd na desktopie NIE MOŻE się zmienić — użyj breakpointów Tailwind (md:, lg:).
> Jedyny wyjątek: pinezka na mapie Google Maps — popraw WSZĘDZIE.

---

## 1. LANDING PAGE — sekcja "Dlaczego EDU LUZ?"

Aktualnie: emotka/ikona NAD tekstem, karty jedna pod drugą.
Zmień na mobile: układ **horizontal** — ikona/emotka po LEWEJ, tekst (tytuł + opis) po PRAWEJ.
Użyj `flex-row` z `items-start`, ikona w stałej szerokości (np. 48px), tekst obok.
Na desktop zostaw jak jest.

---

## 2. LANDING PAGE — sekcja "Czego uczymy"

Aktualnie: karty przedmiotów jedna pod drugą — strona jest przez to bardzo długa.
Zmień na mobile: **karuzela z auto-przewijaniem** (horizontal scroll / swipeable carousel).
- Karty przewijają się automatycznie (np. co 3-4 sekundy)
- Użytkownik może też przewijać ręcznie (swipe)
- Wskaźniki (kropki) pod karuzelą pokazujące który slide jest aktywny
- Snap scrolling (scroll-snap-type: x mandatory)
- Na desktop zostaw obecny układ grid.

---

## 3. LANDING PAGE — sekcja "Jak pracujemy"

Aktualnie: emotka/ikona NAD tekstem, karty jedna pod drugą.
Zmień na mobile: tak samo jak "Dlaczego EDU LUZ" — układ **horizontal**, ikona po LEWEJ, tekst po PRAWEJ.
Na desktop zostaw jak jest.

---

## 4. LANDING PAGE — sekcja opinii "Co o nas mówią"

Aktualnie: opinie jedna pod drugą — zajmują dużo miejsca, a będzie ich więcej.
Zmień na mobile: **karuzela** (taki sam mechanizm jak w "Czego uczymy").
- Jedna opinia na raz, swipe do następnej
- Auto-przewijanie co 5-6 sekund (opinie są długie, więc wolniej)
- Kropki wskaźnikowe
- Na desktop zostaw obecny układ.

---

## 5. NAVBAR — rozwijane menu mobilne (drawer)

Aktualnie: tło jest zbyt przezroczyste, tekst słabo widoczny.
Zmień: **zwiększ opacity tła** menu mobilnego — powinno być prawie nieprzezroczyste (np. `bg-main/95` lub `bg-opacity-95` zamiast obecnego). Tekst musi być czytelny.

---

## 6. OFERTA — sekcja "Dlaczego warto wybrać nas"

Aktualnie: emotka NAD tekstem, karty jedna pod drugą na mobile.
Zmień na mobile: układ **horizontal** — ikona po LEWEJ, tekst po PRAWEJ (identycznie jak punkt 1 i 3).
Na desktop zostaw jak jest.

---

## 7. O NAS — sekcja "Historia EDU LUZ"

Aktualnie: pełny tekst historii wyświetlany od razu — długi na mobile.
Zmień na mobile: **zwinięty tekst** (collapsible/expandable). Pokaż pierwsze 2-3 zdania, przycisk "Czytaj więcej" rozwija resztę.
Na desktop zostaw pełny tekst bez zwijania.

---

## 8. O NAS — sekcja "Ludzie Na Luzie" (zespół)

Aktualnie: karty korepetytorów jedna pod drugą.
Zmień na mobile: **karuzela** (tak samo jak w opiniach i przedmiotach).
- Jedna osoba na raz, swipe
- Kropki wskaźnikowe
- Auto-przewijanie co 4 sekundy
- Na desktop zostaw obecny układ.

---

## 9. KONTAKT — pinezka Google Maps (WSZĘDZIE, nie tylko mobile)

Aktualnie: pinezka wskazuje złe miejsce.
Popraw współrzędne na prawidłowy adres: **TOMAX, ul. P.O.W. 17, Tomaszów Mazowiecki**.
Wyszukaj prawidłowe współrzędne GPS tego adresu i zaktualizuj iframe/embed Google Maps.
Ta zmiana dotyczy WSZYSTKICH widoków (desktop + mobile).

---

## Podsumowanie zmian

| Sekcja | Zmiana mobile | Desktop |
|--------|--------------|---------|
| Dlaczego EDU LUZ | ikona obok tekstu (flex-row) | bez zmian |
| Czego uczymy | karuzela + auto-scroll | bez zmian |
| Jak pracujemy | ikona obok tekstu (flex-row) | bez zmian |
| Opinie | karuzela + auto-scroll | bez zmian |
| Navbar drawer | mniej przezroczyste tło | bez zmian |
| Oferta "dlaczego warto" | ikona obok tekstu (flex-row) | bez zmian |
| O nas historia | zwijany tekst "czytaj więcej" | bez zmian |
| O nas zespół | karuzela | bez zmian |
| Mapa kontakt | poprawne współrzędne | poprawne współrzędne |

*Koniec instrukcji.*
