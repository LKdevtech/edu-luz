"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { buttonVariants } from "@/lib/components/ui/button";
import { Container } from "@/lib/components/ui/container";
import { NAV_LINKS, isActivePath } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

import { Logo } from "./logo";
import { MobileDrawer } from "./mobile-drawer";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-subtle bg-main/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Główna nawigacja">
          {NAV_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-sm font-bold transition-colors",
                  active ? "text-link" : "text-secondary hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden md:inline-flex")}
          >
            Zaloguj się
          </Link>

          {/* Hamburger (mobile) */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Otwórz menu"
            aria-expanded={open}
            className="rounded-btn p-2 text-secondary transition-colors hover:bg-surface hover:text-white md:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </Container>

      <MobileDrawer open={open} onClose={() => setOpen(false)} pathname={pathname} />
    </header>
  );
}
