import Image from "next/image";
import Link from "next/link";

import { SubjectGlyph } from "@/lib/components/ui/subject-glyph";
import { SUBJECTS } from "@/lib/config/subjects";

import { Blob } from "./blob";

// Pigułka przedmiotu w hero (mockup <Pill>) — kolor dynamiczny, inline style.
function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-bold"
      style={{ background: `${color}18`, color, border: `1.5px solid ${color}30` }}
    >
      {children}
    </span>
  );
}

// Hero — odwzorowanie mockupu (2 kolumny, gradientowy nagłówek, blur blobs).
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#151827_0%,#111422_100%)] pb-12 pt-12 sm:pb-14 sm:pt-16 md:pb-16 md:pt-20">
      {/* Zdjęcie sali jako subtelne tło — niska opacity + dark overlay,
          żeby nie konkurowało z tekstem i CTA. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/images/sala.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.08]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,24,39,0.7)_0%,rgba(21,24,39,0.35)_50%,rgba(17,20,34,0.92)_100%)]" />
      </div>

      <Blob color="#3B8FF0" size={340} top={-80} right={-60} />
      <Blob color="#FF6F4A" size={240} bottom={-40} left={-40} opacity={0.04} />
      <Blob color="#7C5CFC" size={180} top={120} right={200} opacity={0.03} />

      <div className="relative z-[1] mx-auto flex max-w-[1080px] flex-wrap items-center gap-12 px-6">
        {/* Lewa kolumna */}
        <div className="flex-[1_1_480px]">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/20 px-4 py-1.5 text-[13px] font-extrabold text-[#FF6F4A]">
              🎓 Tomaszów Mazowiecki
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary/20 px-4 py-1.5 text-[13px] font-extrabold text-tertiary">
              📍 Zajęcia stacjonarne
            </span>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary/20 px-[14px] py-1 text-[12px] font-bold text-link">
              Szkoła podstawowa
            </span>
            <span className="rounded-full bg-accent/20 px-[14px] py-1 text-[12px] font-bold text-accent">
              Szkoła średnia
            </span>
          </div>

          <h1 className="mb-5 text-[32px] font-black leading-[1.12] tracking-[-1px] text-primary sm:text-[38px] md:text-[44px]">
            Korepetycje
            <br />
            <span className="text-link">bez stresu</span>,<br />
            efekty{" "}
            <span className="bg-gradient-to-br from-secondary to-tertiary bg-clip-text text-transparent">
              na serio
            </span>
          </h1>

          <p className="mb-8 max-w-[460px] text-[17px] font-medium leading-[1.75] text-secondary">
            Zajęcia z różnych przedmiotów w jednym miejscu — dla uczniów szkół
            podstawowych i średnich. Stały grafik, stałe ceny i notatka po każdej
            lekcji.
          </p>

          <div className="mb-9 flex flex-wrap gap-3.5">
            <Link
              href="/oferta"
              className="rounded-[14px] bg-primary px-8 py-[14px] text-[15px] font-extrabold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_6px_24px_rgba(59,143,240,0.31)]"
            >
              Sprawdź ofertę →
            </Link>
            <Link
              href="/kontakt"
              className="rounded-[14px] border-2 border-subtle px-8 py-[14px] text-[15px] font-extrabold text-secondary transition-all duration-200 hover:scale-[1.03]"
            >
              Kontakt
            </Link>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {SUBJECTS.filter((s) => !s.planned).map((s) => (
              <Pill key={s.name} color={s.color}>
                <SubjectGlyph icon={s.icon} flag={s.flag} size={15} /> {s.name}
              </Pill>
            ))}
            <Pill color="#6B6780">+2 w planie</Pill>
          </div>
        </div>

      </div>
    </section>
  );
}
