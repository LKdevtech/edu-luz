import Link from "next/link";

import { SITE } from "@/lib/config/site";

// CTA strony oferty (mockup) — gradient primary→accent.
export function OfertaCta() {
  return (
    <section className="bg-gradient-to-br from-primary to-accent py-14">
      <div className="mx-auto max-w-[1080px] px-6 text-center">
        <h2 className="mb-2 text-[22px] font-black text-white sm:text-[26px] md:text-[28px]">Nie wiesz co wybrać?</h2>
        <p className="mx-auto mb-7 max-w-[420px] text-[15px] font-medium text-white/70">
          Umów bezpłatne spotkanie — pomożemy dobrać przedmiot, formę i korepetytora.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/kontakt"
            className="rounded-[14px] bg-white px-8 py-3.5 text-[15px] font-extrabold text-[#2D7DE8] transition-transform duration-150 hover:scale-[1.03]"
          >
            Umów spotkanie →
          </Link>
          <a
            href={`tel:${SITE.phone.replace(/\s+/g, "")}`}
            className="rounded-[14px] border-[1.5px] border-white/30 bg-white/15 px-8 py-3.5 text-[15px] font-bold text-white transition-all duration-150 hover:scale-[1.03] hover:bg-white/25"
          >
            Zadzwoń
          </a>
        </div>
      </div>
    </section>
  );
}
