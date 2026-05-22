import { FinalCta } from "@/lib/components/sections/final-cta";
import { Hero } from "@/lib/components/sections/hero";
import { LessonFormats } from "@/lib/components/sections/lesson-formats";
import { SocialProof } from "@/lib/components/sections/social-proof";
import { Subjects } from "@/lib/components/sections/subjects";
import { Usp } from "@/lib/components/sections/usp";

// Landing page (/) — kolejność sekcji wg zatwierdzonego mockupu.
export default function HomePage() {
  return (
    <>
      <Hero />
      <Usp />
      <Subjects />
      <LessonFormats />
      <SocialProof />
      <FinalCta />
    </>
  );
}
