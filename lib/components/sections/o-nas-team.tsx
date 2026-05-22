import { Blob } from "./blob";
import { Section } from "./section";

interface TutorSubject {
  name: string;
  color: string;
}
interface Tutor {
  name: string;
  initials: string;
  color: string;
  subjects: TutorSubject[];
  bio: string;
  highlight: string;
}

// PLACEHOLDER (sekcja 7) — imiona i bio do uzupełnienia przez właściciela.
const TUTORS: Tutor[] = [
  {
    name: "[Imię Nazwisko]",
    initials: "KN",
    color: "#3B8FF0",
    subjects: [
      { name: "Matematyka", color: "#3B8FF0" },
      { name: "Fizyka", color: "#F59E0B" },
    ],
    bio: "Placeholder — krótki opis doświadczenia, podejścia do nauczania i co wyróżnia tego korepetytora.",
    highlight: "X lat doświadczenia",
  },
  {
    name: "[Imię Nazwisko]",
    initials: "AW",
    color: "#06B6D4",
    subjects: [{ name: "Angielski", color: "#06B6D4" }],
    bio: "Placeholder — krótki opis doświadczenia, certyfikatów, specjalizacji w nauczaniu języka.",
    highlight: "Certyfikat Cambridge",
  },
  {
    name: "[Imię Nazwisko]",
    initials: "MK",
    color: "#FF6F4A",
    subjects: [
      { name: "Chemia", color: "#22C55E" },
      { name: "Elektrotechnika", color: "#FF6F4A" },
    ],
    bio: "Placeholder — krótki opis doświadczenia, podejścia, co sprawia że uczniowie lubią jego zajęcia.",
    highlight: "Praktyk z branży",
  },
  {
    name: "[Imię Nazwisko]",
    initials: "JZ",
    color: "#E84393",
    subjects: [{ name: "Polski", color: "#E84393" }],
    bio: "Placeholder — krótki opis podejścia do lektur, wypracowań, przygotowania do matury z polskiego.",
    highlight: "Pasjonat literatury",
  },
];

// "Nasz zespół" — karty korepetytorów (mockup).
export function ONasTeam() {
  return (
    <Section className="py-14">
      <div className="relative">
        <Blob color="#7C5CFC" size={200} top={-40} right={-20} opacity={0.05} />
        <Blob color="#3B8FF0" size={160} bottom={-30} left={-20} opacity={0.04} />

        <div className="relative z-[1]">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-[28px] font-black text-primary">
              Nasz <span className="text-link">zespół</span>
            </h2>
            <p className="mx-auto max-w-[420px] text-[14px] font-medium text-secondary">
              Ludzie, dzięki którym „na luzie” działa. Każdy z pasją, każdy z podejściem.
            </p>
          </div>

          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
            {TUTORS.map((t) => (
              <div
                key={t.initials}
                className="rounded-[20px] border border-subtle bg-surface px-6 py-7 transition-all duration-[250ms] hover:-translate-y-[3px] hover:bg-surface-hover"
                style={{ borderTop: `3px solid ${t.color}` }}
              >
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] text-[20px] font-black tracking-[-1px]"
                  style={{
                    background: `linear-gradient(135deg, ${t.color}30, ${t.color}10)`,
                    border: `1.5px solid ${t.color}25`,
                    color: t.color,
                  }}
                >
                  {t.initials}
                </div>
                <p className="mb-0.5 text-[18px] font-black text-primary">{t.name}</p>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {t.subjects.map((s) => (
                    <span
                      key={s.name}
                      className="rounded-lg px-2.5 py-[3px] text-[10px] font-bold tracking-[0.3px]"
                      style={{ background: `${s.color}15`, color: s.color }}
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
                <p className="mb-3 text-[13px] font-medium leading-[1.7] text-secondary">
                  {t.bio}
                </p>
                <div
                  className="inline-flex items-center gap-1 rounded-[10px] px-3.5 py-1.5 text-[11px] font-bold"
                  style={{ background: `${t.color}12`, color: t.color }}
                >
                  ⭐ {t.highlight}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
