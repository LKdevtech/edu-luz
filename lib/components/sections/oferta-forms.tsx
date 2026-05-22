import Link from "next/link";
import type { CSSProperties } from "react";

import type { FormKey } from "@/lib/config/pricing-public";

import { Section, SectionTitle } from "./section";

interface FormCard {
  key: FormKey;
  icon: string;
  title: string;
  color: string;
  perMonth: string;
  popular?: boolean;
  features: string[];
}

const CARDS: FormCard[] = [
  {
    key: "individual",
    icon: "👤",
    title: "Indywidualnie",
    color: "#3B8FF0",
    perMonth: "/ miesiąc",
    features: [
      "Pełna personalizacja tempa",
      "Dopasowany materiał",
      "Notatka po każdej lekcji",
      "45 / 60 / 90 / 120 min",
    ],
  },
  {
    key: "pair",
    icon: "👥",
    title: "W parze",
    color: "#7C5CFC",
    popular: true,
    perMonth: "/ miesiąc / os.",
    features: [
      "2 osoby na podobnym poziomie",
      "Wspólna nauka motywuje",
      "Niższa cena na osobę",
      "60 / 90 / 120 min",
    ],
  },
  {
    key: "group",
    icon: "👨‍👩‍👧‍👦",
    title: "Mała grupa",
    color: "#FF6F4A",
    perMonth: "/ miesiąc / os.",
    features: ["Maks. 4 osoby", "Dynamika grupowa", "Najniższa stawka", "60 / 90 / 120 min"],
  },
];

// "Formy zajęć" — karty cenowe (mockup sekcja 3). Ceny "od" liczone z realnej logiki.
export function OfertaForms({ minima }: { minima: Record<FormKey, number> }) {
  return (
    <Section className="py-14">
      <SectionTitle className="mb-8" sub="Trzy formy zajęć — każda z innym podejściem i stawką.">
        Formy <span className="text-link">zajęć</span>
      </SectionTitle>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {CARDS.map((item) => (
          <div
            key={item.key}
            className="relative overflow-hidden rounded-[20px] bg-surface px-6 py-7 transition-all duration-[250ms] hover:-translate-y-[3px] hover:bg-surface-hover hover:shadow-[0_8px_30px_var(--card-shadow)]"
            style={
              {
                border: item.popular
                  ? `2px solid ${item.color}40`
                  : "1px solid rgba(59,143,240,0.10)",
                "--card-shadow": `${item.color}15`,
              } as CSSProperties
            }
          >
            {item.popular && (
              <div
                className="absolute right-[-28px] top-[14px] rotate-[35deg] px-9 py-1 text-[10px] font-black uppercase tracking-[0.5px] text-white"
                style={{ background: item.color }}
              >
                Popularne
              </div>
            )}

            <span className="mb-3 block text-[36px]">{item.icon}</span>
            <p className="mb-1 text-[20px] font-black text-primary">{item.title}</p>
            <p className="mb-0.5 text-[28px] font-black" style={{ color: item.color }}>
              od {minima[item.key]} zł
              <span className="ml-1 text-[12px] font-semibold text-secondary">
                {item.perMonth}
              </span>
            </p>

            <div className="my-4 h-px bg-subtle" />

            <div className="flex flex-col gap-2.5">
              {item.features.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-[13px] font-medium text-secondary"
                >
                  <span className="text-[14px] font-black" style={{ color: item.color }}>
                    ✓
                  </span>{" "}
                  {f}
                </div>
              ))}
            </div>

            <Link
              href="/kontakt"
              className="mt-[22px] block rounded-[12px] py-3 text-center text-[14px] font-extrabold transition-transform duration-200 hover:scale-[1.03]"
              style={
                item.popular
                  ? { background: item.color, color: "#fff" }
                  : { background: "transparent", color: item.color, border: `1.5px solid ${item.color}40` }
              }
            >
              Umów spotkanie
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] font-medium italic text-dim">
        Podane ceny orientacyjne — dokładna stawka zależy od przedmiotu, poziomu i
        korepetytora.
      </p>
    </Section>
  );
}
