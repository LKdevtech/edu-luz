'use client'

import { useState } from 'react'

import { LevelBadge, SubjectDot } from './Badges'

type EntryCardProps = {
  entryId: string
  subjectName: string
  subjectColor: string
  tutorName: string
  level: 'SP' | 'E8' | 'SR' | 'SR_EXT' | 'EM' | 'EM_EXT'
  levelLabel: string
  topic: string | null
  noteForStudent: string | null
  /**
   * Uwagi dla rodzica — pokazywane TYLKO w panelu rodzica.
   * Panel ucznia musi przekazać null (sekcja 9 SYSTEM_INSTRUCTIONS_v2).
   */
  noteForParent?: string | null
  lessonDate: string // 'YYYY-MM-DD'
  homeworkContent: string | null
  homeworkVerified: boolean
}

/**
 * Rozwijana karta wpisu (notatki z lekcji).
 * Domyślnie zwinięta — pokazuje temat + ikonkę + meta. Po kliknięciu: pełna notatka + PD.
 *
 * UWAGA: uczeń NIE WIDZI uwag dla rodzica (note_for_parent z entry_parent_notes).
 * Query helper `loadRecentEntries` celowo ich nie zwraca.
 */
export function EntryCard({
  subjectName,
  subjectColor,
  tutorName,
  level,
  levelLabel,
  topic,
  noteForStudent,
  noteForParent,
  lessonDate,
  homeworkContent,
  homeworkVerified,
}: EntryCardProps) {
  const [expanded, setExpanded] = useState(false)

  const dateLabel = new Date(lessonDate).toLocaleDateString('pl-PL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  return (
    <article
      className="rounded-[14px] border bg-surface p-3 transition-colors"
      style={{ borderColor: expanded ? `${subjectColor}4D` : 'rgba(59,143,240,0.10)' }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 text-left"
      >
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-[13px] font-extrabold"
          style={{ backgroundColor: `${subjectColor}29`, color: subjectColor }}
          aria-hidden
        >
          ✓
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12px] font-extrabold text-primary">
            {topic ?? 'Notatka z lekcji'}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-secondary">
            <span>{dateLabel}</span>
            <span aria-hidden>•</span>
            <SubjectDot color={subjectColor} />
            <span>{subjectName}</span>
            <span aria-hidden>•</span>
            <span>{tutorName}</span>
            <LevelBadge level={level} label={levelLabel} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {homeworkContent && (
            <span className="rounded-[6px] bg-[#FFCA2818] px-1.5 py-0.5 text-[10px] font-extrabold text-[#FFCA28]">
              📝 PD
            </span>
          )}
          {homeworkVerified && (
            <span className="rounded-[6px] bg-[#22C55E18] px-1.5 py-0.5 text-[10px] font-extrabold text-success">
              ✓
            </span>
          )}
          <span
            className="text-[10px] text-secondary transition-transform"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
            aria-hidden
          >
            ▼
          </span>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 flex flex-col gap-2.5">
          {noteForStudent && (
            <div
              className="rounded-[10px] bg-alt p-2.5 text-[12px] leading-relaxed text-primary"
              style={{ borderLeft: `3px solid ${subjectColor}66` }}
            >
              <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-secondary">
                Notatka od korepetytora
              </div>
              {noteForStudent}
            </div>
          )}
          {noteForParent && (
            <div
              className="rounded-[10px] p-2.5 text-[12px] leading-relaxed text-primary"
              style={{
                backgroundColor: '#7C5CFC0A',
                borderLeft: '3px solid #7C5CFC66',
              }}
            >
              <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-accent">
                Uwaga dla rodzica
              </div>
              {noteForParent}
            </div>
          )}
          {homeworkContent && (
            <div
              className="rounded-[10px] p-2.5 text-[12px] leading-relaxed text-primary"
              style={{
                backgroundColor: '#FFCA280A',
                borderLeft: '3px solid #FFCA2866',
              }}
            >
              <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-extrabold uppercase tracking-wider text-[#FFCA28]">
                <span>📝 Praca domowa</span>
                {homeworkVerified && (
                  <span className="rounded bg-[#22C55E18] px-1.5 py-0.5 text-success">
                    ✓ Sprawdzona
                  </span>
                )}
              </div>
              {homeworkContent}
            </div>
          )}
          {!noteForStudent && !noteForParent && !homeworkContent && (
            <div className="text-[12px] italic text-dim">Brak dodatkowych szczegółów.</div>
          )}
        </div>
      )}
    </article>
  )
}
