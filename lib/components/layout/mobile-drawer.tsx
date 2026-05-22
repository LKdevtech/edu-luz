"use client";

import { useEffect } from "react";
import Link from "next/link";

import { buttonVariants } from "@/lib/components/ui/button";
import { NAV_LINKS, isActivePath } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  pathname: string;
}

export function MobileDrawer({ open, onClose, pathname }: MobileDrawerProps) {
  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label="Zamknij menu"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={cn(
          "absolute inset-0 h-full w-full bg-black/60 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Panel */}
      <nav
        aria-label="Menu mobilne"
        className={cn(
          "absolute right-0 top-0 flex h-full w-72 max-w-[80%] flex-col gap-1 border-l border-subtle bg-alt p-6 shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Zamknij menu"
          className="mb-4 self-end rounded-btn p-2 text-secondary transition-colors hover:bg-surface hover:text-white"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {NAV_LINKS.map((link) => {
          const active = isActivePath(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-input px-3 py-2.5 text-base font-bold transition-colors",
                active ? "bg-surface text-link" : "text-secondary hover:bg-surface hover:text-white",
              )}
            >
              {link.label}
            </Link>
          );
        })}

        <Link
          href="/login"
          onClick={onClose}
          className={cn(buttonVariants({ variant: "outline", size: "md" }), "mt-4")}
        >
          Zaloguj się
        </Link>
      </nav>
    </div>
  );
}
