/**
 * Publiczna część cennika — BEZPIECZNA dla klienta (zero danych korepetytorów).
 * Zawiera stałe i czystą matematykę cenową (mnożniki czasu, formuła grup,
 * przelicznik miesięczny) z sekcji 5 CLAUDE.md. Stawki korepetytorów żyją
 * wyłącznie w pricing.ts (server-only).
 */

export type LevelKey = "podstawowa" | "srednia_p" | "srednia_r";
export type FormKey = "individual" | "pair" | "group";

/** Widełki ceny klienta (za lekcję indywidualną, 60 min) dla pary przedmiot+poziom. */
export interface PriceCell {
  available: boolean;
  base: [number, number];
}

export type PriceTable = Record<string, Record<LevelKey, PriceCell>>;

export interface LevelOption {
  key: LevelKey;
  label: string;
  short: string;
}

export interface FormOption {
  key: FormKey;
  label: string;
  icon: string;
  /** Liczba osób użyta we wzorze grupowym (sekcja 5.4). */
  people: number;
}

export const CALC_LEVELS: LevelOption[] = [
  { key: "podstawowa", label: "Szkoła podstawowa", short: "Podstawówka" },
  { key: "srednia_p", label: "Średnia — podstawa", short: "Średnia podst." },
  { key: "srednia_r", label: "Średnia — rozszerzenie", short: "Średnia rozsz." },
];

export const CALC_FORMS: FormOption[] = [
  { key: "individual", label: "Indywidualnie", icon: "👤", people: 1 },
  { key: "pair", label: "W parze", icon: "👥", people: 2 },
  { key: "group", label: "Mała grupa", icon: "👨‍👩‍👧‍👦", people: 4 },
];

export const DURATIONS = [45, 60, 90, 120] as const;

// Mnożniki czasu trwania — sekcja 5.3.
export const DURATION_MULTIPLIERS: Record<number, number> = {
  45: 0.85,
  60: 1.0,
  90: 1.48,
  120: 1.95,
};

// Dopłata grupowa za każdą kolejną osobę — sekcja 5.4.
export const GROUP_SURCHARGE = 5;

// Przelicznik miesięczny — sekcja 5.5 (35 spotkań ÷ 10 okresów). Niewidoczny na stronie.
export const LESSONS_PER_MONTH = 3.5;

export interface PriceResult {
  perLesson: [number, number];
  perMonth: [number, number];
}

/**
 * Cena za osobę dla widełek bazowych, danego czasu i formy (liczby osób).
 * per_osoba = cena_indywidualna / liczba_osób + (liczba_osób - 1) × 5  (sekcja 5.4)
 * miesięcznie = za_lekcję × 3.5  (sekcja 5.5)
 */
export function priceFor(
  base: [number, number],
  durationMin: number,
  people: number,
): PriceResult {
  const durMult = DURATION_MULTIPLIERS[durationMin] ?? 1;
  const perPerson = (b: number) =>
    Math.round((b * durMult) / people + (people - 1) * GROUP_SURCHARGE);
  const perLesson: [number, number] = [perPerson(base[0]), perPerson(base[1])];
  const month = (p: number) => Math.round((p * LESSONS_PER_MONTH) / 5) * 5;
  const perMonth: [number, number] = [month(perLesson[0]), month(perLesson[1])];
  return { perLesson, perMonth };
}

/**
 * Minimalna cena miesięczna ("od ... zł") dla każdej formy — najniższa możliwa
 * wartość, jaką może pokazać kalkulator (po wszystkich przedmiotach, poziomach
 * i czasach). Dzięki temu karty "Formy zajęć" nigdy nie zawyżają względem kalkulatora.
 */
export function formMonthlyMinima(table: PriceTable): Record<FormKey, number> {
  const result = {} as Record<FormKey, number>;
  for (const form of CALC_FORMS) {
    let min = Infinity;
    for (const levels of Object.values(table)) {
      for (const cell of Object.values(levels)) {
        if (!cell.available) continue;
        for (const d of DURATIONS) {
          const { perMonth } = priceFor(cell.base, d, form.people);
          if (perMonth[0] < min) min = perMonth[0];
        }
      }
    }
    result[form.key] = Number.isFinite(min) ? min : 0;
  }
  return result;
}
