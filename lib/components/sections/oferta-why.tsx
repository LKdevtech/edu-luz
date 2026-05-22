import { Section, SectionTitle } from "./section";

const ITEMS = [
  {
    icon: "📝",
    title: "Notatka po każdej lekcji",
    desc: "Rodzic i uczeń widzą co było przerabiane, jaki jest postęp i co powtórzyć. Zero zgadywania.",
  },
  {
    icon: "🔄",
    title: "Odrabianie odwołanych zajęć",
    desc: "Odwołujesz z wyprzedzeniem — lekcja nie przepada. Umawiasz nowy termin przez panel.",
  },
  {
    icon: "📊",
    title: "Przejrzyste rozliczenia",
    desc: "Wiesz ile płacisz, za co i kiedy. Przypomnienia, historia wpłat, brak niespodzianek.",
  },
  {
    icon: "🎯",
    title: "Dopasowane podejście",
    desc: "Każdy uczeń jest inny. Korepetytor dostosowuje tempo, materiał i metody do potrzeb.",
  },
];

// "Dlaczego warto wybrać nas" (mockup sekcja 2).
export function OfertaWhy() {
  return (
    <Section alt className="py-14">
      <SectionTitle className="mb-8" sub="Inwestycja w edukację, która się zwraca.">
        Dlaczego warto <span className="text-link">wybrać nas</span>
      </SectionTitle>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {ITEMS.map((item) => (
          <div
            key={item.title}
            className="rounded-[20px] border border-subtle bg-surface px-[22px] py-6 transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-surface-hover"
          >
            <span className="mb-3 block text-[28px]">{item.icon}</span>
            <p className="mb-1.5 text-[16px] font-extrabold text-primary">{item.title}</p>
            <p className="text-[13px] font-medium leading-[1.7] text-secondary">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
