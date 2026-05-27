import type { CSSProperties, ReactNode } from "react";

import { SITE } from "@/lib/config/site";

import { Blob } from "./blob";
import { KontaktForm } from "./kontakt-form";

function ContactItem({
  icon,
  label,
  value,
  href,
  color,
}: {
  icon: string;
  label: string;
  value: ReactNode;
  href?: string;
  color: string;
}) {
  const inner = (
    <div
      className="flex items-start gap-3.5 rounded-[16px] border border-transparent px-4 py-3.5 transition-all duration-200 hover:border-[var(--hbd)] hover:bg-[var(--hb)]"
      style={{ "--hb": `${color}10`, "--hbd": `${color}25` } as CSSProperties}
    >
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] text-[19px]"
        style={{ background: `${color}18`, border: `1px solid ${color}20` }}
      >
        {icon}
      </div>
      <div>
        <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.5px] text-dim">{label}</p>
        <p className="m-0 text-[14px] font-semibold text-primary">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block no-underline">
      {inner}
    </a>
  ) : (
    inner
  );
}

const SOCIALS = [
  { name: "Facebook", icon: "f", color: "#1877F2" },
  { name: "Instagram", icon: "ig", color: "#E4405F" },
  { name: "TikTok", icon: "tt", color: "#ff0050" },
];

// Sekcja formularz + dane kontaktowe (mockup).
export function KontaktContact() {
  return (
    <section className="relative overflow-hidden bg-alt pb-14 pt-10">
      <Blob color="#FFCA28" size={250} bottom={-60} right={-30} opacity={0.03} />

      <div className="relative z-[1] mx-auto flex max-w-[1080px] flex-wrap gap-7 px-6">
        {/* Lewa — formularz */}
        <div className="flex-[1_1_440px]">
          <KontaktForm />
        </div>

        {/* Prawa — dane kontaktowe */}
        <div className="flex flex-[1_1_300px] flex-col gap-4">
          <div className="rounded-[22px] border border-subtle bg-[linear-gradient(160deg,#232840_0%,#1E2540_100%)] px-2 py-5">
            <ContactItem
              icon="📞"
              label="Telefon"
              value={SITE.phone}
              href={`tel:${SITE.phoneTel}`}
              color="#22C55E"
            />
            <ContactItem
              icon="✉️"
              label="Email"
              value={SITE.email}
              href={`mailto:${SITE.email}`}
              color="#3B8FF0"
            />
            <ContactItem
              icon="📍"
              label="Adres"
              value={
                <>
                  {SITE.addressLine1}
                  <br />
                  {SITE.addressLine2}
                </>
              }
              color="#FF6F4A"
            />
            <ContactItem
              icon="🕐"
              label="Godziny zajęć"
              value={
                <>
                  {SITE.hours.weekdays}
                  <br />
                  {SITE.hours.saturday}
                  <br />
                  {SITE.hours.sunday}
                </>
              }
              color="#7C5CFC"
            />
          </div>

          {/* Social media */}
          <div className="rounded-[18px] border border-subtle bg-surface px-[22px] py-5">
            <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.8px] text-dim">
              Social media
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map((s) => (
                <div
                  key={s.name}
                  className="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-[14px] py-3 transition-transform hover:scale-[1.03]"
                  style={{ background: `${s.color}12`, border: `1.5px solid ${s.color}20` }}
                >
                  <span className="text-[16px] font-black" style={{ color: s.color }}>
                    {s.icon}
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: `${s.color}CC` }}>
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA telefoniczny */}
          <div className="relative overflow-hidden rounded-[18px] border border-primary/[0.18] bg-[linear-gradient(135deg,rgba(59,143,240,0.18),rgba(255,111,74,0.12))] px-[22px] py-6">
            <Blob color="#3B8FF0" size={120} top={-30} right={-20} opacity={0.1} />
            <div className="relative z-[1]">
              <p className="mb-1.5 text-[16px] font-black text-primary">Wolisz porozmawiać? 📞</p>
              <p className="mb-3.5 text-[12px] font-medium leading-[1.6] text-secondary">
                Zadzwoń — chętnie odpowiemy na pytania i umówimy bezpłatne spotkanie.
              </p>
              <a
                href={`tel:${SITE.phoneTel}`}
                className="inline-block rounded-[12px] bg-[linear-gradient(135deg,#3B8FF0,#2D7DE8)] px-6 py-2.5 text-[13px] font-extrabold text-white shadow-[0_4px_16px_rgba(59,143,240,0.31)] transition-all duration-150 hover:scale-[1.03] hover:shadow-[0_6px_24px_rgba(59,143,240,0.5)]"
              >
                Zadzwoń teraz →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
