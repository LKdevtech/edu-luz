"use client";

import { useState } from "react";

export interface LessonFormat {
  emoji: string;
  title: string;
  desc: string;
  tags: string[];
  color: string;
  details: string;
  special?: boolean;
}

// Rozwijana karta formy zajęć (mockup <ExpandableFormatCard>).
export function ExpandableFormatCard({ item }: { item: LessonFormat }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-[18px] bg-surface px-[22px] py-6 transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-surface-hover"
      style={{
        border: item.special
          ? `1.5px solid ${item.color}40`
          : "1px solid rgba(59,143,240,0.10)",
      }}
    >
      {item.special && (
        <div
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, ${item.color}, #FF6F4A)` }}
        />
      )}

      <div className="flex items-start gap-4 md:block">
        <div className="flex-shrink-0 text-[36px] leading-none md:mb-3 md:text-[32px]">
          {item.emoji}
        </div>
        <div className="flex-1">
          <p className="mb-2 text-[18px] font-extrabold text-primary">{item.title}</p>
          <p className="mb-3.5 text-[13px] font-medium leading-[1.7] text-secondary">
            {item.desc}
          </p>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg px-3 py-1 text-[11px] font-bold"
                style={{ background: `${item.color}15`, color: item.color }}
              >
                {tag}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[12px] font-bold"
            style={{ color: item.color }}
            aria-expanded={expanded}
          >
            {expanded ? "Zwiń" : "Więcej szczegółów"}
            <span
              className="inline-block transition-transform duration-200"
              style={{ transform: expanded ? "rotate(180deg)" : "none" }}
            >
              ▼
            </span>
          </button>
        </div>
      </div>

      <div
        className="overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-out"
        style={{
          maxHeight: expanded ? 480 : 0,
          opacity: expanded ? 1 : 0,
          marginTop: expanded ? 12 : 0,
        }}
      >
        <div
          className="rounded-xl px-4 py-3.5 text-[13px] font-medium leading-[1.75] text-secondary"
          style={{ background: `${item.color}08`, border: `1px solid ${item.color}15` }}
        >
          {item.details}
        </div>
      </div>
    </div>
  );
}
