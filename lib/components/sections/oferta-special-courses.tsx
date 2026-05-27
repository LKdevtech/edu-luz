import { Section } from "./section";

const TAGS = ["Maturalne", "Egzamin 8-kl.", "Wakacyjne", "Weekendowe"];

// "Kursy specjalne i okazyjne" — baner (mockup sekcja 4).
export function OfertaSpecialCourses() {
  return (
    <Section alt className="py-14">
      <div className="relative overflow-hidden rounded-[22px] border border-accent/20 bg-[linear-gradient(135deg,rgba(124,92,252,0.08),rgba(255,111,74,0.06))] px-5 py-7 sm:px-7 sm:py-8 md:px-8 md:py-9">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#FFCA28,#FF6F4A)]" />

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex-[1_1_400px]">
            <span className="mb-2 block text-[32px]">🚀</span>
            <h3 className="mb-2 text-[19px] font-black text-primary sm:text-[22px]">
              Kursy specjalne i okazyjne
            </h3>
            <p className="mb-4 text-[14px] font-medium leading-[1.7] text-secondary">
              Intensywne programy sezonowe — powtórki przed maturą, przygotowanie do
              egzaminu ósmoklasisty, warsztaty wakacyjne. Zamknięte grupy z konkretnym
              celem i harmonogramem.
            </p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[10px] bg-tertiary/[0.18] px-3.5 py-[5px] text-[11px] font-bold text-tertiary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-[0_0_auto]">
            <a
              href="/kontakt"
              className="inline-block rounded-[14px] bg-tertiary px-8 py-3.5 text-[15px] font-extrabold text-[#1a1400] transition-transform duration-200 hover:scale-[1.03]"
            >
              Zapytaj o terminy →
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
