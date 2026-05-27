import { Blob } from "./blob";
import { Section } from "./section";

const DIRECTIONS = [
  { icon: "🚗", text: "Parking przy budynku i sporo miejsc w okolicy", color: "#3B8FF0" },
  {
    icon: "🚌",
    text: "Przystanek przy Urzędzie Miasta — 2 minuty pieszo",
    color: "#7C5CFC",
  },
  { icon: "🚶", text: "Centrum miasta — kilka minut spacerem", color: "#22C55E" },
];

// Zapytanie do Google Maps — uwzględnia nazwę budynku TOMAX żeby
// pinezka trafiła dokładnie w wejście, a nie gdzieś na ulicy.
const MAP_QUERY = "TOMAX, ul. P.O.W. 17, 97-200 Tomaszów Mazowiecki, Polska";
const MAP_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=17&output=embed`;
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`;

export function KontaktMap() {
  return (
    <Section className="py-14">
      <Blob color="#06B6D4" size={200} top={-40} left={-30} opacity={0.04} />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="mb-2 text-[20px] font-black text-primary sm:text-[22px] md:text-[24px]">
            Gdzie <span className="text-link">jesteśmy</span>
          </h2>
          <p className="text-[14px] font-medium text-secondary">
            Zajęcia stacjonarne w centrum Tomaszowa Mazowieckiego.
          </p>
        </div>
        <a
          href={MAP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[12px] border border-subtle bg-surface px-4 py-2 text-[12px] font-bold text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
        >
          Otwórz w Google Maps →
        </a>
      </div>

      <div className="relative h-[340px] w-full overflow-hidden rounded-[22px] border border-subtle bg-alt sm:h-[400px]">
        <iframe
          src={MAP_SRC}
          title="Mapa: EDU LUZ, ul. P.O.W. 17, Tomaszów Mazowiecki"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="h-full w-full border-0"
        />
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
