import { MobileCarousel } from "@/lib/components/ui/mobile-carousel";

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

const MAT = "#3B8FF0";
const ANG = "#06B6D4";
const FIZ = "#F59E0B";
const CHEM = "#22C55E";
const POL = "#E84393";
const ELEKTRO = "#FF6F4A";

const TUTORS: Tutor[] = [
  {
    name: "Kacper Kłuchowski",
    initials: "KK",
    color: MAT,
    subjects: [
      { name: "Matematyka", color: MAT },
      { name: "Fizyka", color: FIZ },
      { name: "Elektrotechnika", color: ELEKTRO },
    ],
    bio: "Zadania specjalne to jego działka. Szczególnie lubi zakres rozszerzony — pokazuje innym wszystkie powiązania tematów z pozoru niezwiązanych. Bardziej ceni chyba tylko duże wyzwania jako korepetytor i pokonywanie drogi od zera do setki. Genialny wybór pod matury.",
    highlight: "Założyciel · 6 lat doświadczenia",
  },
  {
    name: "Zuzanna Raszdorf",
    initials: "ZR",
    color: POL,
    subjects: [{ name: "Język polski", color: POL }],
    bio: "W EDU LUZ od ponad roku. Trudno o lepszą osobę od polskiego — podobno jeszcze nie wymyślono zagadnienia, do którego Zuzia nie ma gotowej notatki. Świetnie rozumie młodzież i bardzo szybko tworzy środowisko idealne do nauki.",
    highlight: "4 lata jako korepetytorka",
  },
  {
    name: "Julia Mastalerz",
    initials: "JM",
    color: ANG,
    subjects: [{ name: "Język angielski", color: ANG }],
    bio: "Klasa sama w sobie. Za niedługo magistra i pełnoprawna pani nauczyciel — młoda, ambitna i pełna energii, a do tego z pokładami anielskiej cierpliwości nawet do tych opornych uczniów.",
    highlight: "Kilkuletnie doświadczenie",
  },
  {
    name: "Maciej Kapuściński",
    initials: "MK",
    color: FIZ,
    subjects: [
      { name: "Matematyka", color: MAT },
      { name: "Fizyka", color: FIZ },
    ],
    bio: "Wyznacznik naszego podejścia „na luzie” — nikt tak szybko nie buduje porozumienia z uczniami jak on. Kiedy trzeba — wymagający, ale w wolnej chwili zdarza mu się nawet pograć ze swoimi uczniami.",
    highlight: "3 lata doświadczenia",
  },
  {
    name: "Patrycja Tomczyk",
    initials: "PT",
    color: CHEM,
    subjects: [
      { name: "Matematyka", color: MAT },
      { name: "Chemia", color: CHEM },
    ],
    bio: "Wyobraź sobie starszą siostrę, która zawsze pomoże w trudnościach w szkole, ale też doradzi w trudnych chwilach i od razu pozna kiedy masz gorszy dzień. To nasza ekspertka, od której wszyscy uczymy się jak budować zaufanie.",
    highlight: "2 lata jako korepetytorka",
  },
  {
    name: "Maciej Kowalski",
    initials: "MK",
    color: "#7C5CFC",
    subjects: [
      { name: "Matematyka", color: MAT },
      { name: "Chemia", color: CHEM },
    ],
    bio: "Patrycja świetnie wprowadzi w ten świat, ale jeśli mowa o rozszerzeniu — to przed wami nasz ekspert. Jeśli na pytanie „ile zadań zrobiłeś i zrozumiałeś?” chcesz mówić „wszystkie”, to dobrze trafiłeś.",
    highlight: "Rok doświadczenia w EDU LUZ",
  },
];

function TutorCard({ t }: { t: Tutor }) {
  return (
    <div
      className="flex h-full flex-col rounded-[20px] border border-subtle bg-surface px-6 py-7 transition-all duration-[250ms] hover:-translate-y-[3px] hover:bg-surface-hover"
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
      <p className="mb-1 text-[18px] font-black text-primary">{t.name}</p>
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
      <p className="mb-4 flex-1 text-[13px] font-medium leading-[1.7] text-secondary">
        {t.bio}
      </p>
      <div
        className="inline-flex w-fit items-center gap-1 rounded-[10px] px-3.5 py-1.5 text-[11px] font-bold"
        style={{ background: `${t.color}12`, color: t.color }}
      >
        ⭐ {t.highlight}
      </div>
    </div>
  );
}

// "Nasz zespół" — karty korepetytorów z realnymi bio.
export function ONasTeam() {
  return (
    <Section className="py-14">
      <div className="relative">
        <Blob color="#7C5CFC" size={200} top={-40} right={-20} opacity={0.05} />
        <Blob color="#3B8FF0" size={160} bottom={-30} left={-20} opacity={0.04} />

        <div className="relative z-[1]">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-[22px] font-black text-primary sm:text-[26px] md:text-[28px]">
              Ludzie <span className="italic text-link">„Na Luzie”</span>
            </h2>
            <p className="mx-auto max-w-[420px] text-[14px] font-medium text-secondary">
              Każdy z pasją, każdy z podejściem.
            </p>
          </div>

          {/* Mobile: karuzela (auto-scroll 4s) */}
          <div className="md:hidden">
            <MobileCarousel ariaLabel="Zespół korepetytorów" intervalMs={4000}>
              {TUTORS.map((t) => (
                <TutorCard key={t.name} t={t} />
              ))}
            </MobileCarousel>
          </div>

          {/* Desktop: grid */}
          <div className="hidden gap-4 md:grid md:[grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {TUTORS.map((t) => (
              <TutorCard key={t.name} t={t} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
