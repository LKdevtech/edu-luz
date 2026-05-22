import Link from "next/link";

import { cn } from "@/lib/utils/cn";

// Subtelny wzór kropek na logo (z mockupu LogoMark).
const DOT_PATTERN =
  "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='8' cy='12' r='1.5' fill='white' opacity='0.3'/><circle cx='22' cy='6' r='1' fill='white' opacity='0.25'/><circle cx='15' cy='28' r='1.2' fill='white' opacity='0.2'/><circle cx='32' cy='18' r='0.8' fill='white' opacity='0.3'/><circle cx='5' cy='35' r='1' fill='white' opacity='0.15'/></svg>\")";

// Znak "Ez" w niebieskim kwadracie (mockup <LogoMark>).
// TODO: podmień na <Image>, gdy pojawi się public/logo-ez.png (sekcja 8).
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-[10px] bg-primary font-black italic text-white"
      style={{ width: size, height: size, fontSize: size * 0.5, letterSpacing: -2 }}
    >
      <span className="relative z-[1]">Ez</span>
      <div
        className="absolute inset-0"
        style={{ background: DOT_PATTERN, backgroundSize: "cover" }}
      />
    </div>
  );
}

interface LogoProps {
  markSize?: number;
  textClassName?: string;
  className?: string;
}

export function Logo({ markSize = 36, textClassName = "text-[17px]", className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="EDU LUZ — strona główna"
      className={cn("flex items-center gap-3", className)}
    >
      <LogoMark size={markSize} />
      <span className={cn("font-black tracking-[-0.3px] text-primary", textClassName)}>
        EDU <span className="text-link">LUZ</span>
      </span>
    </Link>
  );
}
