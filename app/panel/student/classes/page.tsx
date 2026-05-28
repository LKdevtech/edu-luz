import Link from 'next/link'

import { getCurrentStudentId } from '@/lib/auth/getCurrentStudentId'
import { LevelBadge, StatusIcon, SubjectDot, getLessonStatusMeta } from '@/lib/components/panel/Badges'
import { CancelLessonOverlay } from '@/lib/components/panel/CancelLessonOverlay'
import { EntryCard } from '@/lib/components/panel/EntryCard'
import {
  getStudentClasses,
  type LessonRow,
  type MakeupRow,
  type ScheduleExceptionRow,
  type WeeklySlot,
} from '@/lib/queries/student'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatPolishDate } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

type SearchParams = { tab?: string }

const TABS = [
  { key: 'schedule', label: '📋 Harmonogram', href: '?tab=schedule' },
  { key: 'history', label: '📖 Historia lekcji', href: '?tab=history' },
  { key: 'makeup', label: '↻ Odrabianie', href: '?tab=makeup' },
] as const

export default async function StudentClassesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const studentId = await getCurrentStudentId()
  const supabase = createSupabaseServerClient()
  const data = await getStudentClasses(supabase, studentId)

  const activeTab: 'schedule' | 'history' | 'makeup' =
    searchParams.tab === 'history' || searchParams.tab === 'makeup'
      ? searchParams.tab
      : 'schedule'

  return (
    <div className="mx-auto w-full max-w-[900px]">
      {/* SubTabs */}
      <nav className="mb-5 flex gap-2 border-b border-subtle">
        {TABS.map((t) => {
          const isActive = activeTab === t.key
          const count =
            t.key === 'makeup' && data.makeupPending.length > 0 ? data.makeupPending.length : null
          return (
            <Link
              key={t.key}
              href={t.href}
              className={`relative flex items-center gap-2 px-5 py-2.5 text-[13px] transition-colors ${
                isActive
                  ? 'font-extrabold text-link'
                  : 'font-semibold text-secondary hover:text-primary'
              }`}
              style={{
                borderBottom: isActive ? '2px solid #3B8FF0' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              <span>{t.label}</span>
              {count !== null && (
                <span className="rounded-full bg-[#F59E0B22] px-2 py-0.5 text-[10px] font-extrabold text-[#F59E0B]">
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {activeTab === 'schedule' && (
        <ScheduleTab schedule={data.schedule} exceptions={data.exceptions} />
      )}
      {activeTab === 'history' && (
        <HistoryTab
          history={data.history}
          studentId={studentId}
          pendingCancelLessonIds={data.pendingCancelLessonIds}
        />
      )}
      {activeTab === 'makeup' && (
        <MakeupTab pending={data.makeupPending} completed={data.makeupCompleted} />
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 1 — Harmonogram
// ════════════════════════════════════════════════════════════════════════════

function ScheduleTab({
  schedule,
  exceptions,
}: {
  schedule: WeeklySlot[]
  exceptions: ScheduleExceptionRow[]
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-dim">
          📋 Regularne zajęcia wg umowy
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
          style={{ backgroundColor: '#3B8FF026', color: '#3B8FF0' }}
        >
          {schedule.length}×/tydz
        </span>
      </div>
      {schedule.length === 0 ? (
        <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">
          Brak zajęć w stałym planie.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {schedule.map((slot, i) => (
            <ScheduleSlotCard key={`${slot.dayOfWeek}-${slot.startTime}-${i}`} slot={slot} />
          ))}
        </div>
      )}

      {exceptions.length > 0 && (
        <details className="mt-2 rounded-card bg-alt p-3">
          <summary className="cursor-pointer text-[12px] font-extrabold text-[#F59E0B]">
            ⚠ Wyjątki i zmiany ({exceptions.length})
          </summary>
          <div className="mt-3 flex flex-col gap-2">
            {exceptions.map((ex) => (
              <ExceptionCard key={ex.id} exception={ex} />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

function ScheduleSlotCard({ slot }: { slot: WeeklySlot }) {
  return (
    <article
      className="flex items-center gap-3 rounded-card bg-surface p-3 transition-all hover:-translate-y-0.5"
      style={{ borderLeft: `3px solid ${slot.subjectColor}` }}
    >
      <div
        className="flex w-10 shrink-0 items-center justify-center rounded-[8px] py-1.5 text-[13px] font-extrabold"
        style={{ backgroundColor: '#3B8FF014', color: '#3B8FF0' }}
      >
        {slot.dayShort}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <SubjectDot color={slot.subjectColor} />
          <span className="text-[13px] font-extrabold text-primary">{slot.subjectName}</span>
          <LevelBadge level={slot.level} label={slot.levelLabel} />
          {slot.form === 'group' && slot.groupName && (
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold"
              style={{ backgroundColor: '#7C5CFC22', color: '#7C5CFC' }}
            >
              GRUPA · {slot.groupName}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-secondary">
          <span>🕐 {slot.startTime}–{slot.endTime}</span>
          <span>👤 {slot.tutorName}</span>
          {slot.roomName && <span>📍 {slot.roomName}</span>}
        </div>
      </div>
    </article>
  )
}

function ExceptionCard({ exception }: { exception: ScheduleExceptionRow }) {
  const colorByType = {
    cancelled: '#EF4444',
    room_change: '#F59E0B',
    time_change: '#F59E0B',
  } as const
  const labelByType = {
    cancelled: 'odwołana',
    room_change: 'zmiana sali',
    time_change: 'zmiana godziny',
  } as const
  const color = colorByType[exception.type]

  return (
    <article className="rounded-[10px] bg-surface p-2.5" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-extrabold text-primary">
          {formatPolishDate(exception.date)}
        </span>
        <span
          className="rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {labelByType[exception.type]}
        </span>
        <span className="text-[11px] text-secondary">{exception.subjectName}</span>
      </div>
      {(exception.reason || exception.details) && (
        <div className="mt-1 text-[11px] text-secondary">
          {exception.reason}
          {exception.reason && exception.details ? ' → ' : ''}
          {exception.details}
        </div>
      )}
    </article>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 2 — Historia lekcji
// ════════════════════════════════════════════════════════════════════════════

function HistoryTab({
  history,
  studentId,
  pendingCancelLessonIds,
}: {
  history: LessonRow[]
  studentId: string
  pendingCancelLessonIds: Set<string>
}) {
  if (history.length === 0) {
    return (
      <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">
        Brak lekcji w historii.
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {history.map((l) => (
        <HistoryLessonCard
          key={l.id}
          lesson={l}
          studentId={studentId}
          pendingCancel={pendingCancelLessonIds.has(l.id)}
        />
      ))}
    </div>
  )
}

function HistoryLessonCard({
  lesson,
  studentId,
  pendingCancel,
}: {
  lesson: LessonRow
  studentId: string
  pendingCancel: boolean
}) {
  const isDimmed = lesson.status === 'cancelled' || lesson.status === 'no_show'
  const meta = getLessonStatusMeta(lesson.status)

  return (
    <article
      className={`relative rounded-card bg-surface p-3 transition-all hover:-translate-y-0.5 ${
        isDimmed ? 'opacity-70' : ''
      }`}
      style={{ borderLeft: `3px solid ${lesson.subjectColor}` }}
    >
      <div className="flex items-center gap-3">
        <StatusIcon status={lesson.status} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-extrabold text-primary">
              {formatPolishDate(lesson.date)}
            </span>
            <span className="text-[11px] text-dim">
              {lesson.startTime}–{lesson.endTime}
            </span>
            <SubjectDot color={lesson.subjectColor} />
            <span className="text-[12px] font-bold text-primary">{lesson.subjectName}</span>
            <LevelBadge level={lesson.level} label={lesson.levelLabel} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-secondary">
            <span>{lesson.tutorName}</span>
            {lesson.roomName && <span>• {lesson.roomName}</span>}
            <span>•</span>
            <span style={{ color: meta.color }}>{meta.label}</span>
          </div>
          {lesson.cancelReason && (
            <div className="mt-1 text-[11px]" style={{ color: meta.color }}>
              Powód: {lesson.cancelReason}
            </div>
          )}
        </div>
        {lesson.status === 'planned' && (
          <CancelLessonOverlay
            lessonId={lesson.id}
            studentId={studentId}
            pending={pendingCancel}
          />
        )}
      </div>
      {lesson.entry && (lesson.entry.topic || lesson.entry.noteForStudent || lesson.entry.homeworkContent) && (
        <div className="mt-3">
          <EntryCard
            entryId={lesson.id}
            subjectName={lesson.subjectName}
            subjectColor={lesson.subjectColor}
            tutorName={lesson.tutorName}
            level={lesson.level}
            levelLabel={lesson.levelLabel}
            topic={lesson.entry.topic}
            noteForStudent={lesson.entry.noteForStudent}
            lessonDate={lesson.date}
            homeworkContent={lesson.entry.homeworkContent}
            homeworkVerified={lesson.entry.homeworkVerified}
          />
        </div>
      )}
    </article>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 3 — Odrabianie
// ════════════════════════════════════════════════════════════════════════════

function MakeupTab({ pending, completed }: { pending: MakeupRow[]; completed: MakeupRow[] }) {
  return (
    <div className="flex flex-col gap-5">
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[12px] font-extrabold uppercase tracking-wider text-[#F59E0B]">
            ⏳ Oczekujące
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
            style={{ backgroundColor: '#F59E0B22', color: '#F59E0B' }}
          >
            {pending.length}
          </span>
        </div>
        {pending.length === 0 ? (
          <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">
            Brak oczekujących odrabiań.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {pending.map((m) => (
              <MakeupPendingCard key={m.requestId} item={m} />
            ))}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[12px] font-extrabold uppercase tracking-wider text-success">
              ✓ Odrobione
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
              style={{ backgroundColor: '#22C55E22', color: '#22C55E' }}
            >
              {completed.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {completed.map((m) => (
              <MakeupCompletedCard key={m.requestId} item={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function MakeupPendingCard({ item }: { item: MakeupRow }) {
  return (
    <article
      className="rounded-card bg-surface p-3.5"
      style={{ borderLeft: '3px solid #7C5CFC' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[14px] font-extrabold"
          style={{ backgroundColor: '#7C5CFC29', color: '#7C5CFC' }}
        >
          ↻
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SubjectDot color={item.subjectColor} />
            <span className="text-[13px] font-extrabold text-primary">{item.subjectName}</span>
            <LevelBadge level={item.level} label={item.levelLabel} />
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold"
              style={{ backgroundColor: '#7C5CFC22', color: '#7C5CFC' }}
            >
              ODR
            </span>
          </div>
          <div className="mt-1 text-[11px] text-secondary">
            {item.tutorName} • Odwołana: {formatPolishDate(item.originalDate)}
            {item.cancelReason ? ` • ${item.cancelReason}` : ''}
          </div>
          {item.deadline && (
            <div className="mt-1 text-[11px]" style={{ color: '#F59E0B' }}>
              Termin: do {formatPolishDate(item.deadline)}
              {item.daysLeftToDeadline !== null && ` (${item.daysLeftToDeadline} dni)`}
            </div>
          )}
        </div>
      </div>

      {item.proposal?.proposedDate && (
        <div
          className="mt-3 rounded-[10px] p-2.5"
          style={{ backgroundColor: '#22C55E0A', borderLeft: '3px solid #22C55E66' }}
        >
          <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-success">
            Propozycja terminu
          </div>
          <div className="text-[13px] font-extrabold text-primary">
            📅 {formatPolishDate(item.proposal.proposedDate)}
            {item.proposal.proposedStart && ` • ${item.proposal.proposedStart}`}
          </div>
          <div className="mt-1 text-[11px] text-dim">Rodzic musi zaakceptować termin.</div>
        </div>
      )}
    </article>
  )
}

function MakeupCompletedCard({ item }: { item: MakeupRow }) {
  return (
    <article className="rounded-card bg-surface p-3 opacity-70">
      <div className="flex items-center gap-3">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[13px] font-extrabold"
          style={{ backgroundColor: '#22C55E22', color: '#22C55E' }}
        >
          ✓
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <SubjectDot color={item.subjectColor} />
            <span className="text-[12px] font-bold text-primary">{item.subjectName}</span>
          </div>
          <div className="mt-0.5 text-[11px] text-secondary">
            Odwołana: {formatPolishDate(item.originalDate)} →{' '}
            {item.completedDate && (
              <span className="text-success">
                Odrobiona: {formatPolishDate(item.completedDate)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
