import { Blob } from "./blob";
import { Section } from "./section";

const DIRECTIONS = [
  { icon: "🚗", text: "Parking przy budynku", color: "#3B8FF0" },
  { icon: "🚌", text: "Przystanek [placeholder] — 2 min pieszo", color: "#7C5CFC" },
  { icon: "🚶", text: "Centrum miasta — 5 min spacerem", color: "#22C55E" },
];

// Mapa — PLACEHOLDER (sekcja 7: Google Maps embed po podaniu adresu).
export function KontaktMap() {
  return (
    <Section className="py-14">
      <Blob color="#06B6D4" size={200} top={-40} left={-30} opacity={0.04} />

      <h2 className="mb-2 text-[24px] font-black text-primary">
        Gdzie <span className="text-link">jesteśmy</span>
      </h2>
      <p className="mb-6 text-[14px] font-medium text-secondary">
        Zajęcia stacjonarne w centrum Tomaszowa Mazowieckiego.
      </p>

      <div className="relative flex h-[340px] w-full flex-col items-center justify-center overflow-hidden rounded-[22px] border border-subtle bg-[linear-gradient(160deg,#1A1E35_0%,#14182A_100%)]">
        {/* Siatka */}
        <div className="absolute inset-0 opacity-[0.03]">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={`h${i}`}
              className="absolute inset-x-0 h-px bg-primary"
              style={{ top: i * 25 }}
            />
          ))}
          {Array.from({ length: 22 }).map((_, i) => (
            <div
              key={`v${i}`}
              className="absolute inset-y-0 w-px bg-primary"
              style={{ left: i * 50 }}
            />
          ))}
        </div>

        {/* "Drogi" */}
        <div className="absolute inset-x-0 top-[45%] h-[3px] bg-dim opacity-[0.12]" />
        <div className="absolute inset-y-0 left-[55%] w-[3px] bg-dim opacity-[0.12]" />

        {/* Pinezka */}
        <div className="relative z-[1] text-center">
          <div className="mx-auto mb-2.5 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3B8FF0,#7C5CFC)] text-[24px] shadow-[0_0_30px_rgba(59,143,240,0.5),0_0_60px_rgba(59,143,240,0.2)]">
            📍
          </div>
          <p className="text-[15px] font-black text-primary">
            EDU <span className="text-link">LUZ</span>
          </p>
          <p className="text-[12px] font-medium text-secondary">Tomaszów Mazowiecki</p>
          <p className="mt-2.5 text-[11px] font-medium italic text-dim">
            Google Maps embed po podaniu adresu
          </p>
        </div>
      </div>

      {/* Dojazd */}
      <div className="mt-4 flex flex-wrap gap-3">
        {DIRECTIONS.map((d) => (
          <div
            key={d.text}
            className="flex flex-[1_1_200px] items-center gap-2.5 rounded-[14px] px-[18px] py-3.5 text-[13px] font-medium text-secondary"
            style={{ background: `${d.color}08`, border: `1px solid ${d.color}15` }}
          >
            <span className="text-[18px]">{d.icon}</span> {d.text}
          </div>
        ))}
      </div>
    </Section>
  );
}
