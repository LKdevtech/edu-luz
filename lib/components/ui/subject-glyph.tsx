import { Flag, type FlagCode } from "./flag";

interface SubjectGlyphProps {
  icon: string;
  flag?: FlagCode;
  /** Wysokość/rozmiar glifu w px (flaga ~0.8 wysokości, by pasowała do emoji). */
  size: number;
  className?: string;
}

// Renderuje glif przedmiotu: flagę kraju (języki obce) lub emoji (reszta).
export function SubjectGlyph({ icon, flag, size, className }: SubjectGlyphProps) {
  if (flag) {
    return <Flag code={flag} className={className} style={{ height: Math.round(size * 0.82) }} />;
  }
  return (
    <span className={className} style={{ fontSize: size, lineHeight: 1 }} aria-hidden>
      {icon}
    </span>
  );
}
