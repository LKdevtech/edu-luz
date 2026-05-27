"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface MobileCarouselProps {
  children: ReactNode[];
  /** Interwał auto-przewijania w ms. */
  intervalMs?: number;
  /** Label dla czytników ekranowych — opisuje zawartość karuzeli. */
  ariaLabel: string;
  /** Ile kolumn na slajd — domyślnie 1 (full width). */
  className?: string;
}

// Karuzela mobile-only: auto-scroll, snap, swipe, kropki wskaźnikowe.
// Pauza auto-scrolla przy ręcznej interakcji użytkownika (5 s pauzy).
// Zawsze ukryta na md+ (`md:hidden` na wrapperze przy użyciu).
export function MobileCarousel({
  children,
  intervalMs = 4000,
  ariaLabel,
}: MobileCarouselProps) {
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pauseUntilRef = useRef(0);
  const slides = children;

  // Snap na konkretny slajd przez `scrollTo` (nie scrollIntoView — żeby nie
  // przewinęło całej strony, gdy karuzela jest poza viewportem).
  function goTo(index: number, smooth = true) {
    const el = scrollRef.current;
    if (!el) return;
    const slide = el.children[index] as HTMLElement | undefined;
    if (!slide) return;
    el.scrollTo({ left: slide.offsetLeft, behavior: smooth ? "smooth" : "auto" });
  }

  function pauseAuto(ms = 5000) {
    pauseUntilRef.current = Date.now() + ms;
  }

  // Auto-scroll co intervalMs (pomija jeśli użytkownik niedawno przesunął).
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;
      setActive((a) => {
        const next = (a + 1) % slides.length;
        goTo(next);
        return next;
      });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [slides.length, intervalMs]);

  // Synchronizacja `active` ze scrollLeft (gdy użytkownik przesuwa palcem).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const slideWidth = el.scrollWidth / slides.length;
      if (slideWidth === 0) return;
      const idx = Math.round(el.scrollLeft / slideWidth);
      setActive(Math.min(idx, slides.length - 1));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [slides.length]);

  return (
    <div role="region" aria-roledescription="karuzela" aria-label={ariaLabel}>
      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-6 flex snap-x snap-mandatory overflow-x-auto px-6"
        style={{ scrollPaddingLeft: "1.5rem", scrollPaddingRight: "1.5rem" }}
        onPointerDown={() => pauseAuto()}
        onTouchStart={() => pauseAuto()}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="w-full flex-shrink-0 snap-start pr-3 last:pr-0"
            aria-roledescription="slajd"
            aria-label={`${i + 1} z ${slides.length}`}
          >
            {slide}
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              pauseAuto();
              setActive(i);
              goTo(i);
            }}
            aria-label={`Przejdź do slajdu ${i + 1}`}
            aria-current={active === i ? "true" : undefined}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              active === i ? "w-6 bg-link" : "w-1.5 bg-dim/60 hover:bg-dim",
            )}
          />
        ))}
      </div>
    </div>
  );
}
