import type { Metadata } from "next";

import { ONasCta } from "@/lib/components/sections/o-nas-cta";
import { ONasHero } from "@/lib/components/sections/o-nas-hero";
import { ONasHistory } from "@/lib/components/sections/o-nas-history";
import { ONasStats } from "@/lib/components/sections/o-nas-stats";
import { ONasTeam } from "@/lib/components/sections/o-nas-team";
import { ONasTimeline } from "@/lib/components/sections/o-nas-timeline";
import { ONasValues } from "@/lib/components/sections/o-nas-values";

const description =
  "Poznaj EDU LUZ — centrum korepetycji w Tomaszowie Mazowieckim. Nasza historia, podejście do nauki bez stresu, zespół korepetytorów i wartości.";

export const metadata: Metadata = {
  title: "O nas",
  description,
  alternates: { canonical: "/o-nas" },
  openGraph: { title: "O nas", description, url: "/o-nas" },
  twitter: { title: "O nas — EDU LUZ", description },
};

// Strona "O nas" — kolejność sekcji wg zatwierdzonego mockupu.
export default function ONasPage() {
  return (
    <>
      <ONasHero />
      <ONasHistory />
      <ONasStats />
      <ONasValues />
      <ONasTeam />
      <ONasTimeline />
      <ONasCta />
    </>
  );
}
