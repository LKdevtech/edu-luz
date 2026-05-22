import type { Metadata } from "next";

import { KontaktContact } from "@/lib/components/sections/kontakt-contact";
import { KontaktHero } from "@/lib/components/sections/kontakt-hero";
import { KontaktMap } from "@/lib/components/sections/kontakt-map";

export const metadata: Metadata = {
  title: "Kontakt — EDU LUZ",
  description:
    "Skontaktuj się z EDU LUZ w Tomaszowie Mazowieckim. Napisz przez formularz, zadzwoń lub umów bezpłatne spotkanie organizacyjne.",
};

// Strona kontaktu — kolejność sekcji wg zatwierdzonego mockupu.
export default function KontaktPage() {
  return (
    <>
      <KontaktHero />
      <KontaktContact />
      <KontaktMap />
    </>
  );
}
