import Link from "next/link";

import { cn } from "@/lib/utils/cn";

// Monogram "Ez" + wordmark. TODO: gdy właściciel dostarczy
// public/logo-ez.png, podmień monogram na <Image> (sekcja 8 — logo PNG).
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="EDU LUZ — strona główna"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="grid h-9 w-9 place-items-center rounded-btn bg-gradient-to-br from-primary to-accent text-base font-black text-white transition-transform duration-[250ms] ease-out group-hover:scale-105">
        Ez
      </span>
      <span className="text-lg font-black tracking-tight text-primary">EDU LUZ</span>
    </Link>
  );
}
