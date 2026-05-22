import { Section } from "./section";

// PLACEHOLDER (sekcja 7) — lata do uzupełnienia.
const STEPS = [
  { year: "[rok]", text: "Pomysł — pierwszy uczeń, pierwsze zajęcia, pierwsze wnioski.", color: "#3B8FF0" },
  { year: "[rok]", text: "Pierwsi korepetytorzy dołączają — tworzymy zespół z podejściem.", color: "#7C5CFC" },
  { year: "[rok]", text: "Stałe centrum — jedno miejsce, stały grafik, pierwsze grupy.", color: "#FF6F4A" },
  { year: "2026", text: "EDU LUZ v2 — panel online, notatki po lekcjach, system odrabiania.", color: "#FFCA28" },
];

// "Nasza droga" — timeline (mockup).
export function ONasTimeline() {
  return (
    <Section alt className="py-14">
      <div className="mb-9 text-center">
        <h2 className="text-[24px] font-black text-primary">
          Nasza <span className="text-tertiary">droga</span>
        </h2>
      </div>

      <div className="mx-auto max-w-[600px]">
        {STEPS.map((item, i) => {
          const isLast = i === STEPS.length - 1;
          return (
            <div key={item.year + item.text} className="flex gap-5">
              <div className="flex w-5 flex-shrink-0 flex-col items-center">
                <span
                  className="h-3.5 w-3.5 flex-shrink-0 rounded-full"
                  style={{ background: item.color, border: `3px solid ${item.color}30` }}
                />
                {!isLast && (
                  <span
                    className="w-0.5 flex-1"
                    style={{
                      minHeight: 40,
                      background: `linear-gradient(${item.color}40, rgba(59,143,240,0.10))`,
                    }}
                  />
                )}
              </div>
              <div className="pb-5">
                <span className="text-[13px] font-black" style={{ color: item.color }}>
                  {item.year}
                </span>
                <p className="mt-1 text-[14px] font-medium leading-[1.65] text-secondary">
                  {item.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
