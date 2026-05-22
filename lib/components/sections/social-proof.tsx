import { Section, SectionTitle, cardBase } from "./section";

// "Co o nas mówią" — opinie (mockup SOCIAL PROOF). PLACEHOLDER do pilotażu.
const TESTIMONIALS = [
  {
    quote:
      "Wreszcie jedno miejsce na wszystkie zajęcia. Nie muszę wozić syna po całym mieście.",
    author: "Mama ucznia, klasa 8",
    stars: 5,
  },
  {
    quote:
      "Fajne podejście, bez stresu. Notatki po lekcji naprawdę pomagają mi się powtarzać.",
    author: "Uczeń, 2 klasa LO",
    stars: 5,
  },
  {
    quote:
      "Panel z płatnościami to strzał w dziesiątkę — wiem ile, kiedy i za co płacę.",
    author: "Tata dwójki dzieci",
    stars: 5,
  },
];

export function SocialProof() {
  return (
    <Section>
      <SectionTitle sub="Opinie rodziców i uczniów z naszego centrum.">
        Co o nas mówią
      </SectionTitle>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        {TESTIMONIALS.map((t) => (
          <div key={t.author} className={`${cardBase} relative`}>
            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: t.stars }).map((_, j) => (
                <span key={j} className="text-[16px] text-tertiary">
                  ★
                </span>
              ))}
            </div>
            <p className="mb-3.5 text-[14px] font-medium italic leading-[1.75] text-primary">
              „{t.quote}”
            </p>
            <p className="text-[12px] font-bold text-dim">— {t.author}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[12px] font-medium italic text-dim">
        💡 Sekcja opcjonalna w MVP — do uzupełnienia po pilocie prawdziwymi opiniami.
      </p>
    </Section>
  );
}
