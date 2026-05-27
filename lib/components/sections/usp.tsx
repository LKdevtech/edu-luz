import { Section, SectionTitle, cardHover } from "./section";

// "Dlaczego EDU LUZ?" — 4 karty (mockup USP). Kolor ikony nieistotny wizualnie
// (mockup nie koloruje ikon — to emoji), więc trzymamy tylko emoji + tekst.
const USP_ITEMS = [
  {
    icon: "📍",
    title: "Jedno miejsce",
    desc: "Matematyka, angielski, fizyka, chemia — wszystko pod jednym adresem. Zero biegania.",
  },
  {
    icon: "📅",
    title: "Stały grafik",
    desc: "Każdy tydzień ten sam dzień i godzina. Przewidywalność dla całej rodziny.",
  },
  {
    icon: "💸",
    title: "Jasne ceny",
    desc: "Stała stawka miesięczna. Bez niespodzianek, bez drobnego druku.",
  },
  {
    icon: "📱",
    title: "Panel online",
    desc: "Notatki po lekcji, odrabianie, płatności — rodzic i uczeń widzą wszystko.",
  },
];

export function Usp() {
  return (
    <Section alt>
      <SectionTitle sub="Kilka powodów, dla których rodzice i uczniowie zostają z nami.">
        Dlaczego <span className="text-link">EDU LUZ</span>?
      </SectionTitle>

      <div className="grid gap-4 md:[grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {USP_ITEMS.map((item) => (
          <div key={item.title} className={cardHover}>
            <div className="flex items-start gap-4 md:block">
              <div className="flex-shrink-0 text-[32px] leading-none md:mb-3 md:text-[28px]">
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="mb-1.5 text-[16px] font-extrabold text-primary">{item.title}</p>
                <p className="text-[13px] font-medium leading-[1.7] text-secondary">
                  {item.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
