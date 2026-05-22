import { SUBJECTS } from "@/lib/config/subjects";

import { Section, SectionTitle } from "./section";

// "Czego uczymy" — 8 kart przedmiotów z lewym kolorowym paskiem i wstążką
// dla przedmiotów planowanych (mockup PRZEDMIOTY).
export function Subjects() {
  return (
    <Section>
      <SectionTitle sub="Dla uczniów szkół podstawowych i średnich. Każdy przedmiot prowadzony przez doświadczonego korepetytora.">
        Czego uczymy
      </SectionTitle>

      <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {SUBJECTS.map((s) => (
          <div
            key={s.name}
            className="relative h-full overflow-hidden rounded-[4px_18px_18px_4px]"
          >
            {s.planned && (
              <div
                className="absolute right-[-32px] top-[14px] z-[2] rotate-[35deg] px-10 py-1 text-[10px] font-black uppercase tracking-[0.5px] text-[#1a1400] shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                style={{ background: "#FFCA28" }}
              >
                {s.planned}
              </div>
            )}

            <div
              className="h-full rounded-[4px_18px_18px_4px] border border-subtle bg-surface px-[22px] py-6 transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-hover"
              style={{ borderLeft: `4px solid ${s.color}`, opacity: s.planned ? 0.75 : 1 }}
            >
              <div className="mb-2.5 flex items-center gap-2.5">
                <span className="text-[22px]">{s.icon}</span>
                <span className="text-[16px] font-extrabold text-primary">{s.name}</span>
              </div>

              <p className="mb-2.5 text-[13px] font-medium leading-[1.7] text-secondary">
                {s.desc}
              </p>

              {s.levels && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {s.levels.map((l) => (
                    <span
                      key={l}
                      className="rounded-md px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.3px]"
                      style={{ background: `${s.color}15`, color: s.color }}
                    >
                      {l}
                    </span>
                  ))}
                </div>
              )}

              {!s.planned && (
                <div className="mt-1">
                  <span
                    className="cursor-pointer text-[12px] font-bold"
                    style={{ color: s.color, borderBottom: `1.5px solid ${s.color}40` }}
                  >
                    Szczegóły →
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
