'use client'

import { useState } from 'react'

import type { TutorLessonRow } from '@/lib/queries/tutor'
import type { PreviousLessonHint } from '@/lib/queries/tutor'
import { LevelBadge } from './Badges'
import { formatPolishDate } from '@/lib/utils/date'

type Day = {
  dayOfWeek: number
  dateLabel: string
  dayShort: string
  dayFull: string
  isToday: boolean
  lessons: TutorLessonRow[]
}

type TutorWeekScheduleProps = {
  days: Day[]
  prevHints: Record<string, PreviousLessonHint | null>
}

const HOUR_FROM = 8
const HOUR_TO = 21
const HOUR_HEIGHT = 56

const STATUS_COLORS: Record<TutorLessonRow['status'], { color: string; bg: string }> = {
  planned: { color: '#3B8FF0', bg: '#3B8FF015' },
  in_progress: { color: '#FFCA28', bg: '#FFCA2815' },
  completed: { color: '#22C55E', bg: '#22C55E15' },
  completed_no_entry: { color: '#FFCA28', bg: '#FFCA2815' },
  cancelled: { color: '#EF4444', bg: '#EF444410' },
  no_show: { color: '#F59E0B', bg: '#F59E0B12' },
  makeup: { color: '#7C5CFC', bg: '#7C5CFC15' },
}

/**
 * Tygodniowa siatka harmonogramu. Klik na lekcję → pokazuje dane z POPRZEDNIEJ
 * lekcji z tym samym uczniem (sekcja 3.12 SYSTEM_INSTRUCTIONS_v2).
 */
export function TutorWeekSchedule({ days, prevHints }: TutorWeekScheduleProps) {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)

  const selectedLesson =
    selectedLessonId !== null
      ? days.flatMap((d) => d.lessons).find((l) => l.id === selectedLessonId) ?? null
      : null
  const selectedHint = selectedLessonId !== null ? prevHints[selectedLessonId] ?? null : null

  const hours: number[] = []
  for (let h = HOUR_FROM; h <= HOUR_TO; h++) hours.push(h)

  return (
    <>
      <div
        className="overflow-hidden rounded-card"
        style={{ background: '#232840', border: '1px solid rgba(59,143,240,0.10)' }}
      >
        {/* Header row */}
        <div className="grid border-b border-subtle" style={{ gridTemplateColumns: '50px repeat(7, 1fr)' }}>
          <div className="flex items-center justify-center px-1 py-2 text-[10px] font-bold text-dim">
            ⏰
          </div>
          {days.map((d) => (
            <div
              key={d.dayOfWeek}
              className="border-l border-subtle py-2 text-center"
              style={{ background: d.isToday ? 'rgba(59,143,240,0.06)' : 'transparent' }}
            >
              <div
                className="text-[11px] font-extrabold"
                style={{ color: d.isToday ? '#3B8FF0' : '#9B97AF' }}
              >
                {d.dayShort}{' '}
                <span className="text-[9px] font-medium">{d.dateLabel}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Hours grid */}
        <div className="grid" style={{ gridTemplateColumns: '50px repeat(7, 1fr)' }}>
          <div>
            {hours.map((h) => (
              <div
                key={h}
                className="flex items-start justify-center pt-0.5 text-[9px] font-semibold text-dim"
                style={{ height: HOUR_HEIGHT }}
              >
                {h}:00
              </div>
            ))}
          </div>
          {days.map((d) => (
            <div
              key={d.dayOfWeek}
              className="relative border-l border-subtle"
              style={{
                minHeight: hours.length * HOUR_HEIGHT,
                background: d.isToday ? 'rgba(59,143,240,0.03)' : 'transparent',
              }}
            >
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 h-px bg-subtle"
                  style={{ top: (h - HOUR_FROM) * HOUR_HEIGHT }}
                  aria-hidden
                />
              ))}
              {d.lessons.map((lesson) => {
                const [sh, sm] = lesson.startTime.split(':').map(Number)
                const top = (sh! - HOUR_FROM) * HOUR_HEIGHT + (sm! / 60) * HOUR_HEIGHT
                const height = (lesson.durationMin / 60) * HOUR_HEIGHT
                const meta = STATUS_COLORS[lesson.status]
                const isSelected = selectedLessonId === lesson.id
                const isCancelled = lesson.status === 'cancelled'
                const tiny = height < 46

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() =>
                      setSelectedLessonId(isSelected ? null : lesson.id)
                    }
                    className="absolute overflow-hidden rounded-[6px] transition-transform hover:scale-[1.02]"
                    style={{
                      top,
                      left: 2,
                      right: 2,
                      height: height - 3,
                      background: isSelected ? `${meta.color}29` : meta.bg,
                      border: `1px solid ${isSelected ? `${meta.color}66` : `${meta.color}33`}`,
                      borderLeft: `3px solid ${meta.color}`,
                      padding: tiny ? '2px 4px' : '3px 5px',
                      cursor: 'pointer',
                      zIndex: isSelected ? 10 : 1,
                      opacity: isCancelled ? 0.5 : 1,
                      textAlign: 'left',
                    }}
                  >
                    <div
                      className="truncate text-[10px] font-extrabold leading-tight"
                      style={{
                        color: meta.color,
                        textDecoration: isCancelled ? 'line-through' : 'none',
                      }}
                    >
                      {lesson.status === 'makeup' ? '↻ ' : ''}
                      {lesson.studentLabel}
                    </div>
                    {!tiny && lesson.status === 'makeup' && (
                      <div className="truncate text-[8px] font-extrabold uppercase tracking-wide" style={{ color: meta.color }}>
                        Odrabianie
                      </div>
                    )}
                    {!tiny && (
                      <div className="truncate text-[9px] text-secondary">{lesson.subjectName}</div>
                    )}
                    {!tiny && height > 50 && lesson.roomName && (
                      <div className="text-[8px] text-dim">{lesson.roomName}</div>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedLesson && (
        <PrevLessonPanel
          lesson={selectedLesson}
          hint={selectedHint}
          onClose={() => setSelectedLessonId(null)}
        />
      )}
    </>
  )
}

function PrevLessonPanel({
  lesson,
  hint,
  onClose,
}: {
  lesson: TutorLessonRow
  hint: PreviousLessonHint | null
  onClose: () => void
}) {
  const meta = STATUS_COLORS[lesson.status]

  return (
    <div
      className="mt-3 rounded-card bg-surface p-5"
      style={{
        border: `1px solid ${meta.color}40`,
        borderLeft: `4px solid ${meta.color}`,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
      }}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-black text-primary">{lesson.studentLabel}</span>
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: meta.bg, color: meta.color }}
          >
            {LESSON_STATUS_LABELS[lesson.status]}
          </span>
          <LevelBadge level={lesson.level} label={lesson.levelLabel} />
          <span className="text-[11px] text-dim">
            {lesson.subjectName} · {formatPolishDate(lesson.date)} · {lesson.startTime}–{lesson.endTime}
            {lesson.roomName && ` · ${lesson.roomName}`}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zamknij"
          className="text-[16px] text-dim hover:text-primary"
        >
          ✕
        </button>
      </div>

      <div className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-accent">
        Z poprzednich zajęć:
      </div>

      {hint ? (
        <div className="flex flex-col gap-2">
          <PrevBlock label="Temat" value={hint.topic} />
          <PrevBlock label="Notatka" value={hint.noteForStudent} />
          <PrevBlock
            label="Praca domowa do sprawdzenia"
            value={hint.homework}
            highlight={hint.homework !== null}
          />
          <div className="text-[10px] italic text-dim">
            Z lekcji: {formatPolishDate(hint.date)}
          </div>
        </div>
      ) : (
        <div className="rounded-[10px] bg-alt p-4 text-center">
          <p className="text-[12px] font-semibold text-dim">
            Brak poprzednich zajęć z tym uczniem.
          </p>
        </div>
      )}
    </div>
  )
}

function PrevBlock({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string | null
  highlight?: boolean
}) {
  return (
    <div
      className="rounded-[10px] p-3"
      style={
        highlight
          ? { background: '#3B8FF008', border: '1px solid #3B8FF022' }
          : { background: '#1C2035' }
      }
    >
      <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-dim">
        {label}
      </div>
      <div
        className="text-[13px] font-semibold"
        style={{ color: value ? '#F0EDE6' : '#8B879D', fontStyle: value ? 'normal' : 'italic' }}
      >
        {value ?? 'Brak danych'}
      </div>
    </div>
  )
}

const LESSON_STATUS_LABELS: Record<TutorLessonRow['status'], string> = {
  planned: 'Planowana',
  in_progress: 'W trakcie',
  completed: 'Zrealizowana',
  completed_no_entry: 'Zrealizowana (bez wpisu)',
  cancelled: 'Odwołana',
  no_show: 'No-show',
  makeup: 'Odrabianie',
}
