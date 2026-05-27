import { Section } from "./section";

const STATS = [
  { value: "180+", label: "Uczniów łącznie", color: "#3B8FF0", icon: "🎓" },
  { value: "90+", label: "Aktywnych uczniów", color: "#06B6D4", icon: "👥" },
  { value: "100%", label: "Zdanych matur", color: "#22C55E", icon: "✅" },
  { value: "2 lata", label: "Jako centrum", color: "#7C5CFC", icon: "🏠" },
  { value: "4 lata", label: "W branży edukacyjnej", color: "#FF6F4A", icon: "📅" },
];

// "EDU LUZ w liczbach" — realne dane od właściciela.
export function ONasStats() {
  return (
    <Section className="py-14">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-[22px] font-black text-primary sm:text-[26px] md:text-[28px]">
          EDU LUZ <span className="text-link">w liczbach</span>
        </h2>
        <p className="text-[14px] font-medium text-secondary">
          Liczby, które mówią więcej niż obietnice.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex-[1_1_160px] rounded-[20px] px-6 py-7 text-center"
            style={{
              background: `linear-gradient(160deg, ${s.color}12, ${s.color}06)`,
              border: `1px solid ${s.color}18`,
            }}
          >
            <span className="mb-2 block text-[24px]">{s.icon}</span>
            <p
              className="mb-1 text-[32px] font-black tracking-[-1px] sm:text-[36px]"
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
