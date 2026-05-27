import { Section } from "./section";

const STEPS = [
  {
    year: "2023",
    text: "Pomysł. Pierwszy uczeń, pierwsze zajęcia i wnioski.",
    color: "#3B8FF0",
  },
  {
    year: "2024",
    text: "Więcej doświadczeń. Obserwacje jak wyglądają podobne centra, zbieranie kadry.",
    color: "#7C5CFC",
  },
  {
    year: "2025",
    text: "Wielkie otwarcie. Nasze biuro, pierwsze grupy i pomysły co zrobić lepiej.",
    color: "#FF6F4A",
  },
  {
    year: "2026",
    text: "Pierwsza wersja pełnego systemu do monitorowania zajęć, a od września pełna aplikacja EDU LUZ v2.",
    color: "#FFCA28",
  },
];

// "Nasza droga" — timeline projektu (realne lata 2023–2026).
export function ONasTimeline() {
  return (
    <Section alt className="py-14">
      <div className="mb-9 text-center">
        <h2 className="text-[20px] font-black text-primary sm:text-[22px] md:text-[24px]">
          Nasza <span className="text-tertiary">droga</span>
        </h2>
      </div>

      <div className="mx-auto max-w-[600px]">
        {STEPS.map((item, i) => {
          const isLast = i === STEPS.length - 1;
          return (
            <div key={item.year} className="flex gap-5">
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
