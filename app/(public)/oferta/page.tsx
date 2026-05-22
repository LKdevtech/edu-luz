import type { Metadata } from "next";

import { getPriceTable } from "@/lib/config/pricing";
import { formMonthlyMinima } from "@/lib/config/pricing-public";
import { OfertaCta } from "@/lib/components/sections/oferta-cta";
import { OfertaForms } from "@/lib/components/sections/oferta-forms";
import { OfertaHero } from "@/lib/components/sections/oferta-hero";
import { OfertaSpecialCourses } from "@/lib/components/sections/oferta-special-courses";
import { OfertaSubjects } from "@/lib/components/sections/oferta-subjects";
import { OfertaWhy } from "@/lib/components/sections/oferta-why";
import { PriceCalculator } from "@/lib/components/sections/price-calculator";
import { Section, SectionTitle } from "@/lib/components/sections/section";

export const metadata: Metadata = {
  title: "Oferta i cennik — EDU LUZ",
  description:
    "Korepetycje w Tomaszowie Mazowieckim: matematyka, angielski, fizyka, chemia, polski, elektrotechnika. Zajęcia indywidualne, w parach i w małych grupach. Sprawdź orientacyjne ceny w kalkulatorze.",
};

// Cennik liczony po stronie serwera — stawki korepetytorów nie trafiają do
// klienta (sekcja 5.1). Do kalkulatora przekazujemy tylko gotowe widełki.
export default function OfertaPage() {
  const priceTable = getPriceTable();
  const minima = formMonthlyMinima(priceTable);

  return (
    <>
      <OfertaHero />
      <OfertaWhy />
      <OfertaForms minima={minima} />
      <OfertaSpecialCourses />

      <Section id="kalkulator" className="py-14">
        <SectionTitle
          className="mb-8"
          sub="Wybierz przedmiot, poziom i formę — zobaczysz orientacyjną cenę."
        >
          Kalkulator <span className="text-link">ceny</span>
        </SectionTitle>
        <PriceCalculator table={priceTable} />
      </Section>

      <OfertaSubjects />
      <OfertaCta />
    </>
  );
}
