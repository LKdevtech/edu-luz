import { FinalCta } from "@/lib/components/sections/final-cta";
import { Hero } from "@/lib/components/sections/hero";
import { SocialProof } from "@/lib/components/sections/social-proof";
import { Subjects } from "@/lib/components/sections/subjects";
import { Usp } from "@/lib/components/sections/usp";

// Landing page (/) — sekcja 6.1.
export default function HomePage() {
  return (
    <>
      <Hero />
      <Usp />
      <Subjects />
      <SocialProof />
      <FinalCta />
    </>
  );
}
