import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

// Współdzielone klasy karty (mockup: bg surface, radius 18, padding 24/22).
export const cardBase =
  "rounded-[18px] border border-subtle bg-surface px-[22px] py-6";
// Hover: translateY(-2px) + zmiana tła (mockup Card hover).
export const cardHover = cn(
  cardBase,
  "transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-hover",
);

// Wewnętrzny kontener treści — maxWidth 1080, padding 0 24px (mockup <Section>).
export const innerContainer = "relative z-[1] mx-auto max-w-[1080px] px-6";

interface SectionProps {
  children: ReactNode;
  alt?: boolean;
  id?: string;
  className?: string;
}

// Sekcja: padding 64px 0, naprzemienne tło, overflow hidden (mockup <Section>).
export function Section({ children, alt = false, id, className }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden py-16",
        alt ? "bg-alt" : "bg-main",
        className,
      )}
    >
      <div className={innerContainer}>{children}</div>
    </section>
  );
}

interface SectionTitleProps {
  children: ReactNode;
  sub?: string;
  className?: string;
}

// Nagłówek sekcji (mockup <SectionTitle>): h2 28/900, sub 15/500 muted.
export function SectionTitle({ children, sub, className }: SectionTitleProps) {
  return (
    <div className={cn("mb-9", className)}>
      <h2 className="mb-2 text-[22px] font-black leading-tight tracking-[-0.3px] text-primary sm:text-[26px] md:text-[28px]">
        {children}
      </h2>
      {sub && (
        <p className="max-w-[500px] text-[15px] font-medium text-secondary">{sub}</p>
      )}
    </div>
  );
}
