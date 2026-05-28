'use client'

import { useState } from 'react'

import { LevelBadge, SubjectDot } from '@/lib/components/panel/Badges'
import type { AdminJournalEntry } from '@/lib/queries/admin'
import { formatLessonDate } from '@/lib/utils/date'

const ENTRY_STATUS_META: Record<
  AdminJournalEntry['entryStatus'],
  { label: string; color: string; bg: string }
> = {
  missing: { label: 'Brak wpisu', color: '#FF6F4A', bg: '#FF6F4A29' },
  draft: { label: 'Szkic', color: '#FFCA28', bg: '#FFCA2822' },
  published: { label: 'Opublikowany', color: '#22C55E', bg: '#22C55E22' },
  // 'locked' = wpis spóźniony (po 48h), z naliczonym punktem karnym.
  locked: { label: 'Spóźniony', color: '#FF6F4A', bg: '#FF6F4A22' },
}

export function AdminJournalList({ entries }: { entries: AdminJournalEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">
        Brak wpisów w wybranym zakresie.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((e) => (
        <JournalRow key={e.lessonId} entry={e} />
      ))}
    </div>
  )
}

function JournalRow({ entry }: { entry: AdminJournalEntry }) {
  const [expanded, setExpanded] = useState(false)
  const meta = ENTRY_STATUS_META[entry.entryStatus]
  const hasDetails =
    Boolean(entry.topic) || Boolean(entry.noteForStudent) || Boolean(entry.internalNote)

  return (
    <article
      className="overflow-hidden rounded-card bg-surface transition-colors"
      style={{ border: '1px solid rgba(59,143,240,0.10)' }}
    >
      {/* ── Wiersz ── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        disabled={!hasDetails}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-hover disabled:cursor-default"
      >
        {/* Data + godzina */}
        <div className="w-[88px] shrink-0">
          <div className="text-[10px] font-bold text-dim">{formatLessonDate(entry.date)}</div>
          <div className="text-[12px] font-extrabold text-primary">
            {entry.startTime}–{entry.endTime}
          </div>
        </div>

        {/* Korepetytor — avatar + nazwa */}
        <div className="flex w-[150px] shrink-0 items-center gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-extrabold"
            style={{ backgroundColor: '#3B8FF020', color: '#3B8FF0' }}
          >
            {entry.tutorInitials}
          </span>
          <span className="truncate text-[12px] font-bold text-secondary">{entry.tutorName}</span>
        </div>

        {/* Uczeń / przedmiot */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-extrabold text-primary">{entry.studentLabel}</span>
            {entry.level && entry.levelLabel && (
              <LevelBadge level={entry.level} label={entry.levelLabel} />
            )}
            {entry.form === 'group' && (
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold"
                style={{ backgroundColor: '#7C5CFC22', color: '#7C5CFC' }}
              >
                👥 Grupa
              </span>
            )}
            <SubjectDot color={entry.subjectColor} />
            <span className="text-[11px] text-secondary">{entry.subjectName}</span>
            {entry.editedAt && (
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: '#7C5CFC22', color: '#7C5CFC' }}
                title={`Edytowany ${formatEditedAt(entry.editedAt)}`}
              >
                ✎ Edytowany {formatEditedAt(entry.editedAt)}
              </span>
            )}
          </div>
          {entry.topic && !expanded && (
            <div className="mt-0.5 truncate text-[11px] text-dim">{entry.topic}</div>
          )}
        </div>

        {/* Odznaki statusu */}
        <div className="flex shrink-0 items-center gap-2">
          {entry.hasPenalty && (
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-extrabold"
              style={{ backgroundColor: '#EF444422', color: '#EF4444' }}
            >
              ⚠ punkt karny
            </span>
          )}
          {entry.hasHomework && (
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold"
              style={{ backgroundColor: '#3B8FF022', color: '#3B8FF0' }}
            >
              📝 PD
            </span>
          )}
          <span
            className="rounded-md px-2 py-0.5 text-[10px] font-extrabold"
            style={{ backgroundColor: meta.bg, color: meta.color }}
          >
            {meta.label}
          </span>
          {hasDetails && (
            <span
              aria-hidden
              className="inline-block text-[11px] text-dim transition-transform"
              style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
            >
              ▼
            </span>
          )}
        </div>
      </button>

      {/* ── Rozwinięcie ── */}
      {expanded && hasDetails && (
        <div className="border-t border-subtle px-4 py-3.5">
          {entry.topic && (
            <div className="mb-3">
              <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-dim">
                Temat
              </div>
              <p className="text-[12px] text-primary">{entry.topic}</p>
            </div>
          )}
          {entry.noteForStudent && (
            <div className="mb-3">
              <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-dim">
                Notatka dla ucznia
              </div>
              <p className="whitespace-pre-line text-[12px] text-secondary">
                {entry.noteForStudent}
              </p>
            </div>
          )}
          {entry.internalNote && (
            <div
              className="rounded-[10px] p-3"
              style={{ backgroundColor: '#FFCA2810', border: '1px solid #FFCA2833' }}
            >
              <div
                className="mb-1 text-[10px] font-extrabold uppercase tracking-wider"
                style={{ color: '#FFCA28' }}
              >
                🔒 Notatka wewnętrzna
              </div>
              <p className="whitespace-pre-line text-[12px]" style={{ color: '#F0EDE6' }}>
                {entry.internalNote}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

function formatEditedAt(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${dd}.${mm} o ${hh}:${mi}`
}
