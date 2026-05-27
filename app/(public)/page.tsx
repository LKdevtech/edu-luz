import { FinalCta } from "@/lib/components/sections/final-cta";
import { Hero } from "@/lib/components/sections/hero";
import { LessonFormats } from "@/lib/components/sections/lesson-formats";
import { SocialProof } from "@/lib/components/sections/social-proof";
import { Subjects } from "@/lib/components/sections/subjects";
import { Usp } from "@/lib/components/sections/usp";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/config/seo";
import { SITE } from "@/lib/config/site";

// Schema.org JSON-LD: pomaga Google rozpoznać firmę jako lokalną instytucję
// edukacyjną w Tomaszowie Mazowieckim.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE_NAME,
  alternateName: "Edukacja Na Luzie",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  email: SITE.email,
  telephone: SITE.phoneTel,
  address: {
    "@type": "PostalAddress",
    streetAddress: "ul. P.O.W. 17, lok. 209C",
    addressLocality: "Tomaszów Mazowiecki",
    postalCode: "97-200",
    addressRegion: "łódzkie",
    addressCountry: "PL",
  },
  areaServed: "Tomaszów Mazowiecki",
};

// Landing page (/) — kolejność sekcji wg zatwierdzonego mockupu.
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Usp />
      <Subjects />
      <LessonFormats />
      <SocialProof />
      <FinalCta />
    </>
  );
}
