import { Section } from "./section";

const VALUES = [
  {
    icon: "🧘",
    title: "Bez stresu",
    desc: "Uczeń uczy się lepiej kiedy się nie boi. Zero oceniania, zero presji — tempo dostosowane do człowieka, nie do programu.",
    color: "#06B6D4",
  },
  {
    icon: "🎯",
    title: "Cel, nie program",
    desc: "Pracujemy pod konkretny cel: zdanie matury, nadrobienie zaległości, zrozumienie tematu. Nie przerabiamy podręcznika od deski do deski.",
    color: "#FF6F4A",
  },
  {
    icon: "📝",
    title: "Transparentność",
    desc: "Rodzic wie co było na lekcji, co uczeń powinien powtórzyć i ile płaci. Notatka po każdych zajęciach, przejrzysty cennik.",
    color: "#3B8FF0",
  },
  {
    icon: "🤝",
    title: "Relacja",
    desc: "Korepetytor to nie automat do zadawania zadań. To człowiek, który zna ucznia, jego mocne strony i słabości. I lubi to co robi.",
    color: "#7C5CFC",
  },
  {
    icon: "🔄",
    title: "Elastyczność",
    desc: "Odwołujesz z wyprzedzeniem — lekcja nie przepada. Nowy termin umawiasz przez panel, nie przez telefon.",
    color: "#22C55E",
  },
  {
    icon: "📊",
    title: "Mierzalne efekty",
    desc: "Nie obiecujemy cudów. Ale śledzimy postępy, reagujemy na problemy i dostosowujemy podejście na bieżąco.",
    color: "#FFCA28",
  },
];

// "Nasze podejście" — wartości (mockup).
export function ONasValues() {
  return (
    <Section alt className="py-14">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-[22px] font-black text-primary sm:text-[26px] md:text-[28px]">
          Nasze <span className="text-link">podejście</span>
        </h2>
        <p className="mx-auto max-w-[480px] text-[14px] font-medium text-secondary">
          To nie tylko korepetycje. To filozofia nauki bez stresu — z efektami.
        </p>
      </div>

      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
        {VALUES.map((v) => (
          <div
            key={v.title}
            className="flex items-start gap-4 rounded-[18px] rounded-l-[4px] border border-subtle bg-surface px-[22px] py-5"
            style={{ borderLeft: `4px solid ${v.color}` }}
          >
            <div
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] text-[20px]"
              style={{ background: `${v.color}15`, border: `1px solid ${v.color}20` }}
            >
              {v.icon}
            </div>
            <div>
              <p className="mb-1 text-[15px] font-extrabold text-primary">{v.title}</p>
              <p className="m-0 text-[13px] font-medium leading-[1.7] text-secondary">
                {v.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
