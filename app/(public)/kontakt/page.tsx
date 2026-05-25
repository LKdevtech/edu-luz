import type { Metadata } from "next";

import { KontaktContact } from "@/lib/components/sections/kontakt-contact";
import { KontaktHero } from "@/lib/components/sections/kontakt-hero";
import { KontaktMap } from "@/lib/components/sections/kontakt-map";

const description =
  "Skontaktuj się z EDU LUZ w Tomaszowie Mazowieckim. Napisz przez formularz, zadzwoń lub umów bezpłatne spotkanie organizacyjne.";

export const metadata: Metadata = {
  title: "Kontakt",
  description,
  alternates: { canonical: "/kontakt" },
  openGraph: { title: "Kontakt", description, url: "/kontakt" },
  twitter: { title: "Kontakt — EDU LUZ", description },
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
