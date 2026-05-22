"use client";

import { useEffect, useState } from "react";

import { type FlagCode } from "@/lib/components/ui/flag";
import { SubjectGlyph } from "@/lib/components/ui/subject-glyph";

import { Section, SectionTitle } from "./section";

interface SubjectDetail {
  name: string;
  icon: string;
  color: string;
  levels: string[];
  schoolLevels: string[];
  desc: string;
  topics: string[];
  flag?: FlagCode;
}

const SUBJECTS_FULL: SubjectDetail[] = [
  {
    name: "Matematyka",
    icon: "∑",
    color: "#3B8FF0",
    levels: ["Podstawówka", "Średnia podst.", "Średnia rozsz."],
    schoolLevels: ["Szkoła podstawowa", "Szkoła średnia"],
    desc: "Od ułamków po rachunek różniczkowy. Przygotowanie do egzaminu ósmoklasisty i matury na obu poziomach.",
    topics: ["Algebra", "Geometria", "Trygonometria", "Analiza", "Statystyka", "Matura"],
  },
  {
    name: "Angielski",
    icon: "🇬🇧",
    flag: "gb",
    color: "#06B6D4",
    levels: ["Podstawówka", "Średnia podst.", "Średnia rozsz."],
    schoolLevels: ["Szkoła podstawowa", "Szkoła średnia"],
    desc: "Gramatyka, konwersacje, słuchanie i pisanie. Egzaminy Cambridge, matura, zajęcia wyrównawcze.",
    topics: ["Gramatyka", "Konwersacje", "Słuchanie", "Pisanie", "Cambridge", "Matura"],
  },
  {
    name: "Fizyka",
    icon: "⚡",
    color: "#F59E0B",
    levels: ["Podstawówka", "Średnia podst.", "Średnia rozsz."],
    schoolLevels: ["Szkoła podstawowa", "Szkoła średnia"],
    desc: "Teoria i zadania obliczeniowe. Mechanika, elektryczność, fale, optyka, fizyka jądrowa.",
    topics: ["Mechanika", "Elektryczność", "Fale", "Optyka", "Termodynamika", "Matura"],
  },
  {
    name: "Chemia",
    icon: "⚗️",
    color: "#22C55E",
    levels: ["Podstawówka", "Średnia podst.", "Średnia rozsz."],
    schoolLevels: ["Szkoła podstawowa", "Szkoła średnia"],
    desc: "Chemia ogólna, organiczna i nieorganiczna. Równania reakcji, stechiometria, budowa materii.",
    topics: ["Chemia ogólna", "Organiczna", "Nieorganiczna", "Stechiometria", "Matura"],
  },
  {
    name: "Polski",
    icon: "📖",
    color: "#E84393",
    levels: ["Podstawówka", "Średnia podst.", "Średnia rozsz."],
    schoolLevels: ["Szkoła podstawowa", "Szkoła średnia"],
    desc: "Gramatyka, ortografia, lektury, rozprawki. Przygotowanie do egzaminu ósmoklasisty i matury.",
    topics: ["Gramatyka", "Lektury", "Rozprawka", "Ortografia", "Retoryka", "Matura"],
  },
  {
    name: "Elektrotechnika",
    icon: "🔌",
    color: "#FF6F4A",
    levels: ["Średnia podst.", "Średnia rozsz."],
    schoolLevels: ["Szkoła średnia"],
    desc: "Obwody elektryczne, pomiary, instalacje, maszyny. Teoria i rozwiązywanie zadań technicznych.",
    topics: ["Obwody", "Pomiary", "Instalacje", "Maszyny elektryczne", "Zadania"],
  },
];

const PLANNED: { name: string; icon: string; flag: FlagCode; color: string; status: string }[] = [
  { name: "Włoski", icon: "🇮🇹", flag: "it", color: "#EF4444", status: "W planie" },
  { name: "Niemiecki", icon: "🇩🇪", flag: "de", color: "#FBBF24", status: "W przygotowaniu" },
];

// "Nasze przedmioty" — rozwijana lista (mockup sekcja 6).
export function OfertaSubjects() {
  const [expanded, setExpanded] = useState<number | null>(null);

  // Deep-link z landingu (/oferta#przedmiot-<nazwa>): rozwiń i przewiń do przedmiotu.
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace("#", ""));
    if (!hash.startsWith("przedmiot-")) return;
    const name = hash.slice("przedmiot-".length);
    const idx = SUBJECTS_FULL.findIndex((s) => s.name.toLowerCase() === name);
    if (idx === -1) return;
    setExpanded(idx);
    const el = document.getElementById(hash);
    if (el) {
      window.requestAnimationFrame(() =>
        el.scrollIntoView({ behavior: "smooth", block: "center" }),
      );
    }
  }, []);

  return (
    <Section alt className="py-14">
      <SectionTitle
        className="mb-8"
        sub="Kliknij przedmiot, żeby zobaczyć szczegóły — zakres materiału, dostępne poziomy i szkoły."
      >
        Nasze <span className="text-link">przedmioty</span>
      </SectionTitle>

      <div className="flex flex-col gap-2.5">
        {SUBJECTS_FULL.map((s, i) => {
          const isOpen = expanded === i;
          return (
            <div
              key={s.name}
              id={`przedmiot-${s.name.toLowerCase()}`}
              className="scroll-mt-20 overflow-hidden rounded-[4px_18px_18px_4px] border border-subtle bg-surface"
              style={{ borderLeft: `4px solid ${s.color}` }}
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 px-5 py-[18px] text-left"
              >
                <SubjectGlyph icon={s.icon} flag={s.flag} size={22} />
                <span className="flex-1 text-[16px] font-extrabold text-primary">
                  {s.name}
                </span>
                <span className="hidden flex-wrap gap-1 sm:flex">
                  {s.levels.map((l) => (
                    <span
                      key={l}
                      className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.3px]"
                      style={{ background: `${s.color}15`, color: s.color }}
                    >
                      {l}
                    </span>
                  ))}
                </span>
                <span
                  className="ml-1 text-[10px] text-dim transition-transform duration-200"
                  style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                >
                  ▼
                </span>
              </button>

              <div
                className="overflow-hidden transition-[max-height,opacity] duration-[350ms] ease-out"
                style={{ maxHeight: isOpen ? 300 : 0, opacity: isOpen ? 1 : 0 }}
              >
                <div className="border-t border-subtle px-5 pb-5">
                  <p className="mb-3.5 mt-4 text-[13px] font-medium leading-[1.7] text-secondary">
                    {s.desc}
                  </p>
                  <div className="mb-2.5 flex flex-wrap gap-1.5">
                    {s.schoolLevels.map((sl) => (
                      <span
                        key={sl}
                        className="rounded-lg bg-accent/[0.15] px-3 py-1 text-[11px] font-bold text-accent"
                      >
                        {sl}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.topics.map((t) => (
                      <span
                        key={t}
                        className="rounded-lg bg-alt px-2.5 py-1 text-[11px] font-semibold text-secondary"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {PLANNED.map((s) => (
          <div
            key={s.name}
            className="flex flex-[1_1_240px] items-center gap-3 rounded-[14px] border border-subtle bg-surface px-[18px] py-3.5 opacity-65"
          >
            <SubjectGlyph icon={s.icon} flag={s.flag} size={20} />
            <span className="flex-1 text-[14px] font-extrabold text-primary">{s.name}</span>
            <span className="rounded-[20px] bg-tertiary/20 px-3 py-1 text-[10px] font-extrabold uppercase text-tertiary">
              {s.status}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}
