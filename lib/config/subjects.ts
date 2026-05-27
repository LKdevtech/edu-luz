/**
 * Przedmioty prezentowane na stronie (landing + oferta).
 * Dane czysto wizualne — kolory/opisy/poziomy. Bez cen i danych korepetytorów.
 * Odwzorowanie zatwierdzonego mockupu (mockup/edu-luz-landing-full.jsx).
 */

import type { FlagCode } from "@/lib/components/ui/flag";

export interface Subject {
  name: string;
  icon: string;
  color: string;
  desc: string;
  levels?: string[];
  /** Kod flagi kraju dla języków obcych (zamiast emoji). */
  flag?: FlagCode;
  /** Etykieta wstążki dla przedmiotów planowanych (np. "W planie"). */
  planned?: string;
}

export const SUBJECTS: Subject[] = [
  {
    name: "Matematyka",
    icon: "∑",
    color: "#3B8FF0",
    desc: "Algebra, geometria, analiza — od podstawówki po maturę",
    levels: ["podstawowy", "rozszerzony"],
  },
  {
    name: "Angielski",
    icon: "🇬🇧",
    flag: "gb",
    color: "#06B6D4",
    desc: "Gramatyka, konwersacje, przygotowanie do egzaminów",
    levels: ["podstawowy", "rozszerzony"],
  },
  {
    name: "Fizyka",
    icon: "⚡",
    color: "#F59E0B",
    desc: "Mechanika, elektryczność, optyka — teoria i zadania",
    levels: ["podstawowy", "rozszerzony"],
  },
  {
    name: "Chemia",
    icon: "⚗️",
    color: "#22C55E",
    desc: "Chemia organiczna i nieorganiczna, reakcje, stechiometria",
    levels: ["podstawowy", "rozszerzony"],
  },
  {
    name: "Polski",
    icon: "📖",
    color: "#E84393",
    desc: "Gramatyka, lektury, wypracowania, przygotowanie do egzaminów",
    levels: ["podstawowy", "rozszerzony"],
  },
  {
    name: "Elektrotechnika",
    icon: "🔌",
    color: "#FF6F4A",
    desc: "Obwody, instalacje, pomiary — teoria i praktyka",
    levels: ["podstawowy", "rozszerzony"],
  },
  {
    name: "Włoski",
    icon: "🇮🇹",
    flag: "it",
    color: "#EF4444",
    desc: "Podstawy języka, konwersacje, gramatyka",
    planned: "W planie",
  },
  {
    name: "Niemiecki",
    icon: "🇩🇪",
    flag: "de",
    color: "#FBBF24",
    desc: "Gramatyka, słownictwo, przygotowanie do egzaminów",
    planned: "W planie",
  },
];
