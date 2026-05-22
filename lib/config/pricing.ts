import "server-only";

import {
  CALC_LEVELS,
  type LevelKey,
  type PriceCell,
  type PriceTable,
} from "./pricing-public";

/**
 * Cennik EDU LUZ — WEWNĘTRZNE źródło prawdy (sekcja 5 CLAUDE.md).
 *
 * `import "server-only"` gwarantuje, że ten moduł (z danymi i stawkami
 * korepetytorów) NIGDY nie trafi do bundla klienta. Na frontend eksportujemy
 * wyłącznie wyliczone widełki ceny klienta (getPriceTable), bez stawek.
 */

// Poziomy zgodne z sekcją 5.1: SP = podstawówka, SR = średnia podstawa,
// SRR = średnia rozszerzenie (ŚR★).
type TutorLevel = "SP" | "SR" | "SRR";

interface Tutor {
  name: string;
  subject: string;
  levels: TutorLevel[];
  rate: number; // stawka korepetytora za godzinę (zł) — WEWNĘTRZNE
}

// Dane korepetytorów — sekcja 5.1. NIGDY nie wystawiać na frontend.
const TUTORS: Tutor[] = [
  { name: "Zuzia", subject: "Polski", levels: ["SP", "SR", "SRR"], rate: 45 },
  { name: "Zuzia", subject: "Matematyka", levels: ["SP", "SR"], rate: 45 },
  { name: "Julia", subject: "Angielski", levels: ["SP", "SR", "SRR"], rate: 45 },
  { name: "Patrycja", subject: "Matematyka", levels: ["SP"], rate: 40 },
  { name: "Patrycja", subject: "Chemia", levels: ["SP"], rate: 40 },
  { name: "Maciek Kap.", subject: "Matematyka", levels: ["SP", "SR"], rate: 45 },
  { name: "Maciek Kap.", subject: "Fizyka", levels: ["SP"], rate: 45 },
  { name: "Maciej Kow.", subject: "Matematyka", levels: ["SRR"], rate: 70 },
  { name: "Maciej Kow.", subject: "Chemia", levels: ["SRR"], rate: 70 },
  { name: "Kacper", subject: "Matematyka", levels: ["SRR"], rate: 80 },
  { name: "Kacper", subject: "Fizyka", levels: ["SRR"], rate: 80 },
  { name: "Kacper", subject: "Elektrotechnika", levels: ["SRR"], rate: 80 },
];

// Przedmioty wystawiane w kalkulatorze (kolejność jak w mockupie).
const CALC_SUBJECTS = [
  "Matematyka",
  "Angielski",
  "Fizyka",
  "Chemia",
  "Polski",
  "Elektrotechnika",
];

const LEVEL_MAP: Record<LevelKey, TutorLevel> = {
  podstawowa: "SP",
  srednia_p: "SR",
  srednia_r: "SRR",
};

// Hierarchia poziomów: SP < SR < SRR.
const LEVEL_ORDER: Record<TutorLevel, number> = { SP: 0, SR: 1, SRR: 2 };

// Najniższy sensowny poziom danego przedmiotu. Elektrotechnika jest przedmiotem
// szkoły średniej — nie ma jej w podstawówce, więc nie schodzimy poniżej SR.
const SUBJECT_MIN_LEVEL: Record<string, TutorLevel> = {
  Elektrotechnika: "SR",
};

// Maksymalny poziom, jaki prowadzi korepetytor (z zadeklarowanych).
function maxTutorLevel(t: Tutor): number {
  return Math.max(...t.levels.map((l) => LEVEL_ORDER[l]));
}

// Narzut — sekcja 5.2: cena_klienta = stawka + MAX(40 zł, stawka × 0.60).
function clientBasePrice(rate: number): number {
  return rate + Math.max(40, rate * 0.6);
}

/**
 * Buduje publiczną tabelę widełek (przedmiot × poziom) — cena klienta za lekcję
 * indywidualną 60 min, jako [min, max] po dostępnych korepetytorach. Wynik jest
 * bezpieczny do wysłania na frontend (brak stawek/nazwisk).
 */
export function getPriceTable(): PriceTable {
  const table: PriceTable = {};

  for (const subject of CALC_SUBJECTS) {
    const perLevel = {} as Record<LevelKey, PriceCell>;

    const minLevelVal = LEVEL_ORDER[SUBJECT_MIN_LEVEL[subject] ?? "SP"];

    for (const level of CALC_LEVELS) {
      const targetVal = LEVEL_ORDER[LEVEL_MAP[level.key]];

      // Poziom poniżej minimum przedmiotu (np. elektrotechnika w podstawówce)
      // jest niedostępny. W przeciwnym razie korepetytor uczący wyżej może też
      // poprowadzić niższy poziom (maxTutorLevel >= targetVal).
      const prices =
        targetVal < minLevelVal
          ? []
          : TUTORS.filter(
              (t) => t.subject === subject && maxTutorLevel(t) >= targetVal,
            ).map((t) => Math.round(clientBasePrice(t.rate)));

      perLevel[level.key] = prices.length
        ? { available: true, base: [Math.min(...prices), Math.max(...prices)] }
        : { available: false, base: [0, 0] };
    }

    table[subject] = perLevel;
  }

  return table;
}
