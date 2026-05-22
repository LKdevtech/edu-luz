import type { CSSProperties } from "react";

import { cn } from "@/lib/utils/cn";

export type FlagCode = "gb" | "it" | "de";

interface FlagProps {
  code: FlagCode;
  className?: string;
  style?: CSSProperties;
}

// Inline SVG flags — render identically on every platform (Windows nie ma
// emoji flag krajów, więc 🇬🇧/🇮🇹/🇩🇪 nie wyświetlają się jako flagi).
export function Flag({ code, className, style }: FlagProps) {
  const common = {
    className: cn("inline-block overflow-hidden rounded-[2px] align-middle", className),
    style: { width: "auto", ...style },
    "aria-hidden": true,
  } as const;

  if (code === "it") {
    return (
      <svg viewBox="0 0 3 2" {...common}>
        <rect width="1" height="2" x="0" fill="#009246" />
        <rect width="1" height="2" x="1" fill="#F1F2F1" />
        <rect width="1" height="2" x="2" fill="#CE2B37" />
      </svg>
    );
  }

  if (code === "de") {
    return (
      <svg viewBox="0 0 5 3" {...common}>
        <rect width="5" height="1" y="0" fill="#000000" />
        <rect width="5" height="1" y="1" fill="#DD0000" />
        <rect width="5" height="1" y="2" fill="#FFCE00" />
      </svg>
    );
  }

  // gb — uproszczony, ale rozpoznawalny Union Jack.
  return (
    <svg viewBox="0 0 60 30" {...common}>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0 60 30 M60 0 0 30" stroke="#FFFFFF" strokeWidth="6" />
      <path d="M0 0 60 30 M60 0 0 30" stroke="#C8102E" strokeWidth="2.5" />
      <path d="M30 0 V30 M0 15 H60" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M30 0 V30 M0 15 H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}
