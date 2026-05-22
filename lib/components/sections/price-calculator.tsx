"use client";

import { useState } from "react";
import Link from "next/link";

import { SubjectGlyph } from "@/lib/components/ui/subject-glyph";
import { SUBJECTS } from "@/lib/config/subjects";
import {
  CALC_FORMS,
  CALC_LEVELS,
  DURATIONS,
  priceFor,
  type FormOption,
  type LevelOption,
  type PriceTable,
} from "@/lib/config/pricing-public";

const CALC_SUBJECTS = SUBJECTS.filter((s) => !s.planned);
const PRIMARY = "#3B8FF0";

function Chip({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  const c = color || PRIMARY;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-[12px] px-[18px] py-[9px] text-[13px] font-bold transition-all duration-200"
      style={
        active
          ? { border: `1.5px solid ${c}60`, background: `${c}18`, color: c }
          : {
              border: "1.5px solid rgba(59,143,240,0.10)",
              background: "#232840",
              color: "#9B97AF",
            }
      }
    >
      {children}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[12px] font-extrabold uppercase tracking-[0.8px] text-dim">
      {children}
    </p>
  );
}

function formatRange([min, max]: [number, number]): string {
  return min === max ? `${min}` : `${min}–${max}`;
}

export function PriceCalculator({ table }: { table: PriceTable }) {
  const [selSubject, setSelSubject] = useState(CALC_SUBJECTS[0].name);
  const [selLevel, setSelLevel] = useState<LevelOption>(CALC_LEVELS[0]);
  const [selForm, setSelForm] = useState<FormOption>(CALC_FORMS[0]);
  const [selDuration, setSelDuration] = useState<number>(60);
  const [priceMode, setPriceMode] = useState<"month" | "lesson">("month");

  const subjectData = CALC_SUBJECTS.find((s) => s.name === selSubject);
  const subjectColor = subjectData?.color || PRIMARY;

  const cell = table[selSubject]?.[selLevel.key];
  const available = cell?.available ?? false;
  const result = available ? priceFor(cell.base, selDuration, selForm.people) : null;

  return (
    <>
      <div className="rounded-[22px] border border-subtle bg-surface px-6 py-7">
        <Label>Przedmiot</Label>
        <div className="mb-[22px] flex flex-wrap gap-2">
          {CALC_SUBJECTS.map((s) => (
            <Chip
              key={s.name}
              active={selSubject === s.name}
              color={s.color}
              onClick={() => setSelSubject(s.name)}
            >
              <SubjectGlyph icon={s.icon} flag={s.flag} size={15} /> {s.name}
            </Chip>
          ))}
        </div>

        <Label>Poziom</Label>
        <div className="mb-[22px] flex flex-wrap gap-2">
          {CALC_LEVELS.map((l) => (
            <Chip key={l.key} active={selLevel.key === l.key} onClick={() => setSelLevel(l)}>
              {l.short}
            </Chip>
          ))}
        </div>

        <Label>Forma zajęć</Label>
        <div className="mb-[22px] flex flex-wrap gap-2">
          {CALC_FORMS.map((f) => (
            <Chip key={f.key} active={selForm.key === f.key} onClick={() => setSelForm(f)}>
              <span className="text-[15px]">{f.icon}</span> {f.label}
            </Chip>
          ))}
        </div>

        <Label>Czas trwania</Label>
        <div className="mb-7 flex gap-2">
          {DURATIONS.map((d) => (
            <Chip key={d} active={selDuration === d} onClick={() => setSelDuration(d)}>
              {d} min
            </Chip>
          ))}
        </div>

        {/* Wynik */}
        <div
          className="rounded-2xl px-7 py-6"
          style={{
            background: `linear-gradient(135deg, ${subjectColor}12, #7C5CFC08)`,
            border: `1px solid ${subjectColor}20`,
          }}
        >
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[12px] font-bold text-secondary">
              {selSubject} · {selLevel.short} · {selForm.label} · {selDuration} min
            </p>
            <div className="flex overflow-hidden rounded-[10px] border border-subtle">
              <button
                type="button"
                onClick={() => setPriceMode("month")}
                className="px-3.5 py-[5px] text-[11px] font-bold transition-colors"
                style={
                  priceMode === "month"
                    ? { background: "#3B8FF025", color: PRIMARY }
                    : { background: "transparent", color: "#6B6780" }
                }
              >
                / miesiąc
              </button>
              <button
                type="button"
                onClick={() => setPriceMode("lesson")}
                className="border-l border-subtle px-3.5 py-[5px] text-[11px] font-bold transition-colors"
                style={
                  priceMode === "lesson"
                    ? { background: "#3B8FF025", color: PRIMARY }
                    : { background: "transparent", color: "#6B6780" }
                }
              >
                / lekcja
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            {result ? (
              <div>
                <p className="m-0 text-[36px] font-black text-primary">
                  {priceMode === "month"
                    ? formatRange(result.perMonth)
                    : formatRange(result.perLesson)}{" "}
                  <span className="text-[16px] font-semibold text-secondary">
                    zł {priceMode === "month" ? "/ miesiąc" : "/ lekcja"}
                  </span>
                </p>
                <p className="mt-1.5 text-[11px] font-medium italic text-dim">
                  Dokładna cena ustalana indywidualnie
                </p>
              </div>
            ) : (
              <div className="max-w-[420px]">
                <p className="m-0 text-[18px] font-extrabold text-primary">
                  Ten przedmiot na wybranym poziomie nie jest jeszcze dostępny
                </p>
                <p className="mt-1.5 text-[12px] font-medium text-secondary">
                  Napisz do nas — sprawdzimy możliwości i dobierzemy korepetytora.
                </p>
              </div>
            )}
            <Link
              href="/kontakt"
              className="whitespace-nowrap rounded-[14px] bg-primary px-7 py-[13px] text-[14px] font-extrabold text-white shadow-[0_4px_16px_rgba(59,143,240,0.31)] transition-transform duration-200 hover:scale-[1.03]"
            >
              Umów spotkanie →
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] font-medium italic text-dim">
        Podane ceny mają charakter orientacyjny. Ostateczna stawka ustalana jest na
        spotkaniu organizacyjnym.
      </p>
    </>
  );
}
