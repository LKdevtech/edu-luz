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
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#151827_0%,#111422_100%)] pb-16 pt-20">
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

          <h1 className="mb-5 text-[44px] font-black leading-[1.12] tracking-[-1px] text-primary">
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
            <Pill color="#6B6780">+2 wkrótce</Pill>
          </div>
        </div>

        {/* Prawa kolumna — placeholder ilustracji */}
        <div className="flex flex-[1_1_360px] justify-center">
          <div className="flex aspect-[4/3] w-full max-w-[380px] flex-col items-center justify-center gap-2 rounded-3xl border border-subtle bg-surface text-[13px] text-dim">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              className="opacity-40"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span className="font-semibold">Ilustracja / zdjęcie centrum</span>
            <span className="text-[11px] text-dim">Placeholder — dodasz później</span>
          </div>
        </div>
      </div>
    </section>
  );
}
