import { Blob } from "./blob";

// Hero strony oferty (mockup sekcja 1).
export function OfertaHero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#151827_0%,#1C2035_100%)] pb-10 pt-12">
      <Blob color="#3B8FF0" size={280} top={-60} right={-40} opacity={0.06} />
      <Blob color="#FF6F4A" size={180} bottom={-30} left={-20} opacity={0.04} />

      <div className="relative z-[1] mx-auto max-w-[1080px] px-6">
        <div className="mb-4 inline-flex flex-wrap gap-2">
          <span className="rounded-full bg-primary/20 px-[14px] py-[5px] text-[12px] font-extrabold text-link">
            Szkoła podstawowa
          </span>
          <span className="rounded-full bg-accent/20 px-[14px] py-[5px] text-[12px] font-extrabold text-accent">
            Szkoła średnia
          </span>
          <span className="rounded-full bg-tertiary/20 px-[14px] py-[5px] text-[12px] font-extrabold text-tertiary">
            Stacjonarnie
          </span>
        </div>

        <h1 className="mb-3 text-[36px] font-black leading-[1.15] tracking-[-0.5px] text-primary">
          Oferta i <span className="text-link">cennik</span>
        </h1>

        <p className="mb-4 max-w-[520px] text-[16px] font-medium leading-[1.7] text-secondary">
          Trzy poziomy: szkoła podstawowa, średnia podstawa i średnia rozszerzenie.
          Zajęcia indywidualne, w parach lub małych grupach.
        </p>

        <a
          href="#kalkulator"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-link"
        >
          Oblicz orientacyjną cenę w kalkulatorze ↓
        </a>
      </div>
    </section>
  );
}
