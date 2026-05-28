import Link from 'next/link'

import { getCurrentParentId } from '@/lib/auth/getCurrentParentId'
import { CancelOverlay } from '@/lib/components/panel/CancelOverlay'
import { ChildSwitcher } from '@/lib/components/panel/ChildSwitcher'
import { EntryCard } from '@/lib/components/panel/EntryCard'
import { LevelBadge, StatusIcon, SubjectDot, getLessonStatusMeta } from '@/lib/components/panel/Badges'
import { MakeupCard } from '@/lib/components/panel/MakeupCard'
import {
  getParentClasses,
  type ChildFilter,
  type ParentLessonRow,
  type ParentMakeupRow,
  type ScheduleExceptionForChild,
  type WeeklySlotForChild,
} from '@/lib/queries/parent'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatPolishDate } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

type SearchParams = { child?: string; tab?: string }

export default async function ParentClassesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const parentId = await getCurrentParentId()
  const childFilter: ChildFilter = searchParams.child ?? 'all'
  const supabase = createSupabaseServerClient()
  const data = await getParentClasses(supabase, parentId, childFilter)

  const switcherChildren = data.children.map((c) => ({
    id: c.id,
    initials: c.initials,
    color: c.avatarColor,
    shortName: c.firstName,
  }))
  const activeChildId = childFilter === 'all' ? null : childFilter

  const activeTab: 'schedule' | 'history' | 'makeup' =
    searchParams.tab === 'history' || searchParams.tab === 'makeup' ? searchParams.tab : 'schedule'

  const tabs = [
    { key: 'schedule' as const, label: '📋 Harmonogram' },
    { key: 'history' as const, label: '📖 Historia lekcji' },
    {
      key: 'makeup' as const,
      label: '↻ Odrabianie',
      count: data.makeupPending.length,
    },
  ]
  const childParam = childFilter === 'all' ? '' : `&child=${childFilter}`

  return (
    <div className="mx-auto w-full max-w-[900px]">
      <ChildSwitcher options={switcherChildren} activeChildId={activeChildId} />

      <nav className="mb-5 flex gap-2 border-b border-subtle">
        {tabs.map((t) => {
          const isActive = activeTab === t.key
          return (
            <Link
              key={t.key}
              href={`?tab=${t.key}${childParam}`}
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
              {t.count !== undefined && t.count > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white"
                  style={{ backgroundColor: '#F59E0B' }}
                >
                  {t.count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {activeTab === 'schedule' && (
        <ScheduleTab
          schedule={data.schedule}
          exceptions={data.exceptions}
          showChild={childFilter === 'all'}
        />
      )}
      {activeTab === 'history' && (
        <HistoryTab
          history={data.history}
          parentId={parentId}
          showChild={childFilter === 'all'}
        />
      )}
      {activeTab === 'makeup' && (
        <MakeupTab
          pending={data.makeupPending}
          completed={data.makeupCompleted}
          parentId={parentId}
        />
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 1 — Schedule
// ════════════════════════════════════════════════════════════════════════════

function ScheduleTab({
  schedule,
  exceptions,
  showChild,
}: {
  schedule: WeeklySlotForChild[]
  exceptions: ScheduleExceptionForChild[]
  showChild: boolean
}) {
  // Pogrupuj po dniu
  const byDay = new Map<number, WeeklySlotForChild[]>()
  for (const s of schedule) {
    const arr = byDay.get(s.dayOfWeek) ?? []
    arr.push(s)
    byDay.set(s.dayOfWeek, arr)
  }
  const sortedDays = Array.from(byDay.keys()).sort()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-dim">
          📋 Regularne zajęcia wg umowy
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
          style={{ backgroundColor: '#3B8FF026', color: '#3B8FF0' }}
        >
          {schedule.length} zajęć/tydz
        </span>
      </div>

      {schedule.length === 0 ? (
        <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">
          Brak zajęć w stałym planie.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedDays.map((day) => (
            <div key={day} className="flex flex-col gap-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-dim">
                {byDay.get(day)![0]!.dayFull}
              </div>
              {byDay.get(day)!.map((slot, i) => (
                <article
                  key={`${slot.childId}-${slot.startTime}-${i}`}
                  className="flex items-center gap-3 rounded-card bg-surface p-3 transition-all hover:-translate-y-0.5"
                  style={{ borderLeft: `3px solid ${slot.subjectColor}` }}
                >
                  {showChild && (
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold"
                      style={{
                        backgroundColor: `${slot.childAvatarColor}29`,
                        color: slot.childAvatarColor,
                      }}
                    >
                      {slot.childInitials}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <SubjectDot color={slot.subjectColor} />
                      <span className="text-[13px] font-extrabold text-primary">
                        {slot.subjectName}
                      </span>
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
              ))}
            </div>
          ))}
        </div>
      )}

      {exceptions.length > 0 && (
        <details className="rounded-card bg-alt p-3">
          <summary className="cursor-pointer text-[12px] font-extrabold text-[#F59E0B]">
            ⚠ Wyjątki i zmiany ({exceptions.length})
          </summary>
          <div className="mt-3 flex flex-col gap-2">
            {exceptions.map((ex) => (
              <ExceptionCard key={ex.id} exception={ex} showChild={showChild} />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

function ExceptionCard({
  exception,
  showChild,
}: {
  exception: ScheduleExceptionForChild
  showChild: boolean
}) {
  const colorByType: Record<typeof exception.type, string> = {
    cancelled: '#EF4444',
    room_change: '#F59E0B',
    time_change: '#FFCA28',
  }
  const labelByType: Record<typeof exception.type, string> = {
    cancelled: 'odwołana',
    room_change: 'zmiana sali',
    time_change: 'zmiana godziny',
  }
  const color = colorByType[exception.type]

  return (
    <article
      className="rounded-[10px] bg-surface p-2.5"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="flex flex-wrap items-center gap-2">
        {showChild && (
          <span className="text-[10px] font-extrabold text-secondary">{exception.childName}</span>
        )}
        <span className="text-[12px] font-extrabold text-primary">
          {formatPolishDate(exception.date)}
        </span>
        <span
          className="rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {labelByType[exception.type]}
        </span>
        <SubjectDot color={exception.subjectColor} />
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
// TAB 2 — History
// ════════════════════════════════════════════════════════════════════════════

function HistoryTab({
  history,
  parentId,
  showChild,
}: {
  history: ParentLessonRow[]
  parentId: string
  showChild: boolean
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
          key={`${l.id}:${l.childId}`}
          lesson={l}
          parentId={parentId}
          showChild={showChild}
        />
      ))}
    </div>
  )
}

function HistoryLessonCard({
  lesson,
  parentId,
  showChild,
}: {
  lesson: ParentLessonRow
  parentId: string
  showChild: boolean
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
      <div className="flex items-start gap-3">
        <StatusIcon status={lesson.status} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {showChild && (
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold"
                style={{
                  backgroundColor: `${lesson.childAvatarColor}29`,
                  color: lesson.childAvatarColor,
                }}
              >
                {lesson.childInitials}
              </span>
            )}
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
          <CancelOverlay
            lessonId={lesson.id}
            parentId={parentId}
            isWithin24h={lesson.isWithin24h}
          />
        )}
      </div>
      {lesson.entry && (lesson.entry.topic || lesson.entry.noteForStudent || lesson.entry.noteForParent || lesson.entry.homeworkContent) && (
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
            noteForParent={lesson.entry.noteForParent}
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
// TAB 3 — Makeup
// ════════════════════════════════════════════════════════════════════════════

function MakeupTab({
  pending,
  completed,
  parentId,
}: {
  pending: ParentMakeupRow[]
  completed: ParentMakeupRow[]
  parentId: string
}) {
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
              <MakeupCard key={m.requestId} item={m} parentId={parentId} />
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
              <article key={m.requestId} className="rounded-card bg-surface p-3 opacity-70">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[13px] font-extrabold"
                    style={{ backgroundColor: '#22C55E22', color: '#22C55E' }}
                  >
                    ✓
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <SubjectDot color={m.subjectColor} />
                      <span className="text-[12px] font-bold text-primary">{m.subjectName}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-secondary">
                      Odwołana: {formatPolishDate(m.originalDate)}
                      {m.completedDate && (
                        <>
                          {' '}
                          → <span className="text-success">Odrobiona: {formatPolishDate(m.completedDate)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
