'use client'

import { useState } from 'react'

import { LevelBadge } from '@/lib/components/panel/Badges'
import type { AdminGroupRow, AdminStudentRow } from '@/lib/queries/admin'
import type { Enums } from '@/lib/types/database.types'
import { formatPolishDate } from '@/lib/utils/date'

import { StudentDetailActions } from './AdminStudentActions'

// Kolory przedmiotów — sekcja 3.4 (fallback gdy brak w danych)
const SUBJECT_COLOR: Record<string, string> = {
  Matematyka: '#3B8FF0',
  Angielski: '#06B6D4',
  Fizyka: '#F59E0B',
  Chemia: '#22C55E',
  Polski: '#E84393',
  Elektrotechnika: '#FF6F4A',
}

const ACCENT = '#7C5CFC'
const TERTIARY = '#FFCA28'
const SUCCESS = '#22C55E'
const DANGER = '#EF4444'
const TEXT = '#F0EDE6'
const TEXT_DIM = '#8B879D'

// Status płatności bieżącego miesiąca → kolor + etykieta (sekcja 3.3)
const PAY_STATUS_COLOR: Record<Enums<'payment_status'>, string> = {
  paid: SUCCESS,
  pending: TERTIARY,
  overdue: DANGER,
  paid_late: TERTIARY,
}
const PAY_STATUS_LABEL: Record<Enums<'payment_status'>, string> = {
  paid: 'Opłacone',
  pending: 'Oczekuje',
  overdue: 'Zaległość',
  paid_late: 'Opłacone po terminie',
}

function fmt(n: number): string {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(n)
}

type StudentCardProps = {
  student: AdminStudentRow
  /** Grupy, do których należy uczeń (z pełnymi danymi grupy). */
  studentGroups: AdminGroupRow[]
  adminId: string
}

export function AdminStudentCard({ student, studentGroups, adminId }: StudentCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [hov, setHov] = useState(false)

  // Indywidualne zajęcia (nie-grupowe) — do harmonogramu i rozbicia opłat
  const individualClasses = student.classes.filter((c) => c.form !== 'group')
  const uniqueSubjects = Array.from(new Set(student.classes.map((c) => c.subjectName)))

  const groupFee = studentGroups.reduce((sum, g) => sum + g.monthlyFeePerStudent, 0)
  const indivFee = Math.max(0, student.totalMonthly - groupFee)

  // Status płatności (badge w nagłówku + sekcja Płatności)
  const payColor = student.payStatus ? PAY_STATUS_COLOR[student.payStatus] : null
  const payLabel = student.payStatus ? PAY_STATUS_LABEL[student.payStatus] : null
  const lateColor = student.lateCount >= 3 ? DANGER : TERTIARY

  return (
    <div
      className="overflow-hidden rounded-[14px] transition-all"
      style={{
        background: hov && !expanded ? '#2A3050' : '#232840',
        border: '1px solid rgba(59,143,240,0.10)',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* ── Wiersz zwinięty ── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-[13px] font-extrabold"
          style={{ backgroundColor: `${student.avatarColor}20`, color: student.avatarColor }}
        >
          {student.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-extrabold" style={{ color: TEXT }}>
              {student.fullName}
            </span>
            <LevelBadge level={student.level} label={student.levelLabel} />
            {payColor && payLabel && (
              <span
                className="rounded-full px-1.5 py-px text-[8px] font-bold"
                style={{ color: payColor, background: `${payColor}15` }}
              >
                {payLabel}
              </span>
            )}
            {student.lateCount > 0 && (
              <span className="text-[8px] font-bold" style={{ color: lateColor }}>
                {student.lateCount}. opóźnienie
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {uniqueSubjects.map((subj) => {
              const color = SUBJECT_COLOR[subj] ?? '#8B879D'
              return (
                <span
                  key={subj}
                  className="rounded-full px-1.5 py-px text-[8px] font-bold"
                  style={{ color, backgroundColor: `${color}15` }}
                >
                  {subj}
                </span>
              )
            })}
            <span className="ml-1 text-[9px]" style={{ color: TEXT_DIM }}>
              Rodzic: {student.parentName}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 gap-3.5">
          <div className="text-center">
            <div className="text-[15px] font-black" style={{ color: '#3B8FF0' }}>
              {student.classes.length}
            </div>
            <div className="text-[7px]" style={{ color: TEXT_DIM }}>
              zajęć
            </div>
          </div>
          <div className="text-center">
            <div className="text-[15px] font-black" style={{ color: ACCENT }}>
              {studentGroups.length}
            </div>
            <div className="text-[7px]" style={{ color: TEXT_DIM }}>
              grup
            </div>
          </div>
          <div className="text-center">
            <div className="text-[15px] font-black" style={{ color: TERTIARY }}>
              {fmt(student.totalMonthly)} zł
            </div>
            <div className="text-[7px]" style={{ color: TEXT_DIM }}>
              msc
            </div>
          </div>
        </div>
        <span
          aria-hidden
          className="inline-block shrink-0 text-[11px] transition-transform"
          style={{ color: TEXT_DIM, transform: expanded ? 'rotate(180deg)' : 'none' }}
        >
          ▼
        </span>
      </button>

      {/* ── Rozwinięcie (3 kolumny) ── */}
      {expanded && (
        <div className="grid grid-cols-1 border-t border-subtle md:grid-cols-[1fr_auto_1fr]">
          {/* Kolumna 1 — Dane + umowa + statystyki */}
          <div className="border-subtle p-4 md:border-r">
            <div className="mb-2 text-[11px] font-extrabold" style={{ color: TEXT }}>
              Dane kontaktowe
            </div>
            {[
              { l: 'Rodzic', v: student.parentName },
              { l: 'Telefon', v: student.parentPhone ?? '—' },
              { l: 'Email', v: student.parentEmail ?? '—' },
              { l: 'Klasa / rocznik', v: student.schoolClass || '—' },
            ].map((d) => (
              <div key={d.l} className="mb-1.5">
                <div
                  className="text-[7px] font-semibold uppercase tracking-wide"
                  style={{ color: TEXT_DIM }}
                >
                  {d.l}
                </div>
                <div className="text-[11px] font-semibold" style={{ color: TEXT }}>
                  {d.v}
                </div>
              </div>
            ))}

            <div className="mt-2 border-t border-subtle pt-2">
              <div className="mb-1.5 text-[11px] font-extrabold" style={{ color: TEXT }}>
                Umowa
              </div>
              <div className="flex gap-3">
                <div>
                  <div className="text-[7px]" style={{ color: TEXT_DIM }}>
                    Od
                  </div>
                  <div className="text-[11px] font-bold" style={{ color: TEXT }}>
                    {student.contractStart ? formatPolishDate(student.contractStart) : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[7px]" style={{ color: TEXT_DIM }}>
                    Data urodzenia
                  </div>
                  <div className="text-[11px] font-bold" style={{ color: TEXT }}>
                    {student.birthDate || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[7px]" style={{ color: TEXT_DIM }}>
                    Opłata msc
                  </div>
                  <div className="text-[14px] font-black" style={{ color: TERTIARY }}>
                    {fmt(student.totalMonthly)} zł
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2 border-t border-subtle pt-2">
              <div className="mb-1.5 text-[11px] font-extrabold" style={{ color: TEXT }}>
                Zestawienie zajęć
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { l: 'Zajęć łącznie', v: student.classes.length, c: '#3B8FF0' },
                  { l: 'Indywidualne', v: individualClasses.length, c: '#22C55E' },
                  { l: 'Grupowe', v: studentGroups.length, c: ACCENT },
                  { l: 'Przedmioty', v: uniqueSubjects.length, c: TERTIARY },
                ].map((x) => (
                  <div
                    key={x.l}
                    className="rounded-[6px] px-2 py-1.5 text-center"
                    style={{ background: '#151827' }}
                  >
                    <div className="text-[14px] font-black" style={{ color: x.c }}>
                      {x.v}
                    </div>
                    <div className="text-[7px]" style={{ color: TEXT_DIM }}>
                      {x.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kolumna 2 — Stały harmonogram */}
          <div className="min-w-[200px] border-subtle p-4 md:border-r">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[11px] font-extrabold" style={{ color: TEXT }}>
                Stały harmonogram zajęć
              </div>
              <span className="text-[8px]" style={{ color: TEXT_DIM }}>
                Regularne wg umowy
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {individualClasses.map((c) => {
                const color = c.subjectColor || SUBJECT_COLOR[c.subjectName] || '#8B879D'
                return (
                  <div
                    key={c.classId}
                    className="rounded-[8px] px-2.5 py-2"
                    style={{ background: '#151827', borderLeft: `3px solid ${color}` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold" style={{ color }}>
                        {c.subjectName}
                      </span>
                      <span className="text-[7px] font-bold" style={{ color: TEXT_DIM }}>
                        {c.form === 'pair' ? 'para' : 'indyw.'}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] font-semibold" style={{ color: TEXT }}>
                      {c.tutorName}
                    </div>
                    <div className="mt-0.5 text-[9px]" style={{ color: TEXT_DIM }}>
                      {fmt(c.monthlyFee)} zł/msc
                    </div>
                  </div>
                )
              })}
              {individualClasses.length === 0 && (
                <p className="text-[10px] italic" style={{ color: TEXT_DIM }}>
                  Brak zajęć indywidualnych.
                </p>
              )}

              {studentGroups.length > 0 && (
                <div className="mt-2.5">
                  <div className="mb-1.5 text-[10px] font-extrabold" style={{ color: TEXT }}>
                    Grupy ({studentGroups.length})
                  </div>
                  {studentGroups.map((g) => {
                    const slot = g.weeklySlots[0]
                    const color = g.subjectColor || SUBJECT_COLOR[g.subjectName] || '#8B879D'
                    return (
                      <div
                        key={g.id}
                        className="mb-1 rounded-[8px] px-2.5 py-2"
                        style={{ background: `${ACCENT}08`, borderLeft: `3px solid ${ACCENT}` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px]" aria-hidden>
                              👥
                            </span>
                            <span className="text-[11px] font-bold" style={{ color: ACCENT }}>
                              {g.name}
                            </span>
                            <span className="text-[9px] font-bold" style={{ color }}>
                              {g.subjectName}
                            </span>
                            <LevelBadge level={g.level} label={g.levelLabel} />
                          </div>
                          <span className="text-[9px] font-extrabold" style={{ color: TERTIARY }}>
                            {g.monthlyFeePerStudent} zł/msc
                          </span>
                        </div>
                        <div className="mt-0.5 text-[9px]" style={{ color: TEXT_DIM }}>
                          {g.tutorName}
                          {slot ? ` · ${slot.dayShort} ${slot.startTime}` : ''}
                          {slot?.roomName ? ` · ${slot.roomName}` : ''} · {g.members.length} os.
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Kolumna 3 — Płatności + akcje */}
          <div className="p-4">
            <div className="mb-2 text-[11px] font-extrabold" style={{ color: TEXT }}>
              Płatności
            </div>
            <div
              className="mb-2.5 rounded-[8px] px-3 py-2.5"
              style={{
                background: `${payColor ?? TERTIARY}08`,
                border: `1px solid ${payColor ?? TERTIARY}20`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold" style={{ color: payColor ?? TERTIARY }}>
                  {payLabel ?? 'Opłata miesięczna'}
                </span>
                <span className="text-[16px] font-black" style={{ color: payColor ?? TERTIARY }}>
                  {fmt(student.totalMonthly)} zł
                </span>
              </div>
              <div className="mt-1.5 flex justify-between text-[9px]" style={{ color: TEXT_DIM }}>
                <span>Indywidualnie: {fmt(indivFee)} zł</span>
                {groupFee > 0 && <span>Grupy: {fmt(groupFee)} zł</span>}
              </div>
              {studentGroups.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {studentGroups.map((g) => (
                    <span
                      key={g.id}
                      className="rounded-[4px] px-1.5 py-px text-[8px]"
                      style={{ color: ACCENT, background: `${ACCENT}12` }}
                    >
                      {g.name} {g.subjectName.slice(0, 3)}: {g.monthlyFeePerStudent} zł
                    </span>
                  ))}
                </div>
              )}
              {student.lateCount > 0 && (
                <div className="mt-1.5 text-[9px] font-bold" style={{ color: DANGER }}>
                  {student.lateCount}. opóźnienie z kolei
                </div>
              )}
              <div className="mt-1 text-[8px]" style={{ color: TEXT_DIM }}>
                Termin: do 10. dnia miesiąca
              </div>
            </div>

            <div className="border-t border-subtle pt-2.5">
              <div className="mb-2 text-[11px] font-extrabold" style={{ color: TEXT }}>
                Akcje
              </div>
              <StudentDetailActions student={student} adminId={adminId} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
