import Link from "next/link";

import { Blob } from "./blob";

// CTA strony "O nas" (mockup) — gradient primary→accent.
export function ONasCta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-accent py-14">
      <Blob color="#fff" size={280} top={-80} right={-60} opacity={0.06} />

      <div className="relative z-[1] mx-auto max-w-[1080px] px-6 text-center">
        <h2 className="mb-2 text-[22px] font-black text-white sm:text-[26px] md:text-[28px]">
          Chcesz nas poznać osobiście?
        </h2>
        <p className="mx-auto mb-7 max-w-[420px] text-[15px] font-medium text-white/70">
          Umów bezpłatne spotkanie organizacyjne — porozmawiamy o potrzebach i dobierzemy
          korepetytora.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/kontakt"
            className="rounded-[14px] bg-white px-8 py-3.5 text-[15px] font-extrabold text-[#2D7DE8] transition-transform duration-150 hover:scale-[1.03]"
          >
            Umów spotkanie →
          </Link>
          <Link
            href="/kontakt"
            className="rounded-[14px] border-[1.5px] border-white/30 bg-white/15 px-8 py-3.5 text-[15px] font-bold text-white transition-all duration-150 hover:scale-[1.03] hover:bg-white/25"
          >
            Kontakt
          </Link>
        </div>
      </div>
    </section>
  );
}
