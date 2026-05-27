import Link from "next/link";

import { SITE } from "@/lib/config/site";

import { Blob } from "./blob";

// CTA końcowe — gradientowa sekcja (mockup CTA).
export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-accent py-14 md:py-[72px]">
      <Blob color="#fff" size={300} top={-100} right={-80} opacity={0.06} />

      <div className="relative z-[1] mx-auto max-w-[1080px] px-6 text-center">
        <h2 className="mb-3 text-[24px] font-black text-white sm:text-[28px] md:text-[32px]">
          Gotowy na naukę na luzie?
        </h2>
        <p className="mx-auto mb-8 max-w-[480px] text-[16px] font-medium leading-[1.7] text-white/75">
          Umów bezpłatne spotkanie organizacyjne. Sprawdzimy poziom, dobierzemy
          korepetytora i ustalimy grafik.
        </p>

        <div className="flex flex-wrap justify-center gap-3.5">
          <Link
            href="/kontakt"
            className="rounded-[14px] bg-white px-9 py-[15px] text-[16px] font-extrabold text-[#2D7DE8] transition-transform duration-150 hover:scale-[1.03]"
          >
            Umów spotkanie →
          </Link>
          <a
            href={`tel:${SITE.phone.replace(/\s+/g, "")}`}
            className="rounded-[14px] border-[1.5px] border-white/30 bg-white/15 px-9 py-[15px] text-[16px] font-bold text-white transition-colors hover:bg-white/25"
          >
            Zadzwoń do nas
          </a>
        </div>
      </div>
    </section>
  );
}
