import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

// Logo "Ez" w wersji graffiti (public/logo-ez.png, bez tła).
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/logo-ez.png"
      alt="EDU LUZ"
      width={size}
      height={size}
      priority
      className="select-none"
      style={{ width: size, height: size }}
    />
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
      title="EDU LUZ — strona główna"
      className={cn("flex items-center gap-3", className)}
    >
      <LogoMark size={markSize} />
      <span className={cn("font-black tracking-[-0.3px] text-primary", textClassName)}>
        EDU <span className="text-link">LUZ</span>
      </span>
    </Link>
  );
}
