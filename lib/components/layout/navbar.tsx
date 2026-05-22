"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { NAV_LINKS, isActivePath } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

import { Logo } from "./logo";
import { MobileDrawer } from "./mobile-drawer";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-subtle bg-main/85 backdrop-blur-[16px]">
      <div className="mx-auto flex h-[60px] max-w-[1080px] items-center justify-between px-6">
        <Logo markSize={36} />

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-[14px] font-semibold transition-colors",
                  active ? "text-link" : "text-secondary hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/login"
            className="rounded-[14px] bg-primary px-[22px] py-[10px] text-[13px] font-extrabold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_6px_24px_rgba(59,143,240,0.31)]"
          >
            Zaloguj się
          </Link>
        </div>

        {/* Hamburger (mobile) */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Otwórz menu"
          aria-expanded={open}
          className="rounded-[10px] p-2 text-secondary transition-colors hover:bg-surface hover:text-primary md:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <MobileDrawer open={open} onClose={() => setOpen(false)} pathname={pathname} />
    </header>
  );
}
