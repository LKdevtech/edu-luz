import { Section } from "./section";

// PLACEHOLDER (sekcja 7) — do uzupełnienia realnymi danymi.
const STATS = [
  { value: "50+", label: "Uczniów", color: "#3B8FF0", icon: "🎓" },
  { value: "5", label: "Lat doświadczenia", color: "#7C5CFC", icon: "📅" },
  { value: "95%", label: "Zdanych matur", color: "#22C55E", icon: "✅" },
  { value: "6", label: "Przedmiotów", color: "#FF6F4A", icon: "📚" },
];

// "EDU LUZ w liczbach" — statystyki (mockup).
export function ONasStats() {
  return (
    <Section className="py-14">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-[28px] font-black text-primary">
          EDU LUZ <span className="text-link">w liczbach</span>
        </h2>
        <p className="text-[14px] font-medium text-secondary">
          Placeholder — uzupełnij realnymi danymi
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex-[1_1_150px] rounded-[20px] px-6 py-7 text-center"
            style={{
              background: `linear-gradient(160deg, ${s.color}12, ${s.color}06)`,
              border: `1px solid ${s.color}18`,
            }}
          >
            <span className="mb-2 block text-[24px]">{s.icon}</span>
            <p
              className="mb-1 text-[36px] font-black tracking-[-1px]"
              style={{ color: s.color }}
            >
              {s.value}
            </p>
            <p className="m-0 text-[12px] font-semibold uppercase tracking-[0.5px] text-secondary">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
