import type { CSSProperties } from "react";

interface BlobProps {
  color: string;
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  opacity?: number;
}

// Dekoracyjny rozmyty okrąg — odwzorowanie <Blob> z mockupu (sekcja 3.6).
export function Blob({ color, size, top, left, right, bottom, opacity = 0.06 }: BlobProps) {
  const style: CSSProperties = {
    width: size,
    height: size,
    background: color,
    opacity,
    filter: "blur(80px)",
    top,
    left,
    right,
    bottom,
  };
  return (
    <div aria-hidden className="pointer-events-none absolute rounded-full" style={style} />
  );
}
