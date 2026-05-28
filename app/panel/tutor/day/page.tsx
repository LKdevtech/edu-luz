import { getCurrentTutorId } from '@/lib/auth/getCurrentTutorId'
import { LevelBadge, StatusIcon, SubjectDot, getLessonStatusMeta } from '@/lib/components/panel/Badges'
import { getTutorDayView, loadPrevHintsBatch, type PreviousLessonHint, type TutorLessonRow } from '@/lib/queries/tutor'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type SearchParams = { date?: string }

export default async function TutorDayPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const tutorId = await getCurrentTutorId()
  const supabase = createSupabaseServerClient()
  const data = await getTutorDayView(supabase, tutorId, searchParams.date)

  const prevHints = await loadPrevHintsBatch(
    supabase,
    data.lessons.map((l) => ({
      id: l.id,
      classId: l.classId,
      date: l.date,
      startTime: l.startTime,
    })),
  )

  const totalHours = Math.round(data.lessons.reduce((s, l) => s + l.durationMin, 0) / 60)

  return (
    <div className="mx-auto w-full max-w-[900px]">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-black text-primary">
            {data.dayFull} ·{' '}
            <span className="text-[14px] font-bold text-dim">
              {formatLocalDate(data.date)}
            </span>
            {data.isToday && (
              <span className="ml-2 text-[12px] font-extrabold text-link">— dziś</span>
            )}
          </h1>
          <p className="text-[12px] text-dim">
            {data.lessons.length} {data.lessons.length === 1 ? 'lekcja' : 'lekcji'} ·{' '}
            {totalHours}h
          </p>
        </div>
        <div className="flex gap-2">
          <NavLink offset={-1} date={data.date} label="←" />
          <NavLink offset={0} date={null} label="Dziś" />
          <NavLink offset={1} date={data.date} label="→" />
        </div>
      </header>

      {data.lessons.length === 0 ? (
        <div className="rounded-card bg-surface p-10 text-center">
          <div className="mb-2 text-[36px]">🏖️</div>
          <p className="text-[14px] font-extrabold text-primary">Brak lekcji</p>
          <p className="text-[12px] text-dim">Wolne — odpoczywaj!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.lessons.map((lesson) => (
            <DayLessonCard key={lesson.id} lesson={lesson} hint={prevHints.get(lesson.id) ?? null} />
          ))}
        </div>
      )}
    </div>
  )
}

function DayLessonCard({
  lesson,
  hint,
}: {
  lesson: TutorLessonRow
  hint: PreviousLessonHint | null
}) {
  const meta = getLessonStatusMeta(lesson.status)
  const isCancelled = lesson.status === 'cancelled'

  return (
    <article
      className="rounded-card bg-surface p-4 transition-all hover:-translate-y-0.5"
      style={{
        borderLeft: `4px solid ${meta.color}`,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        opacity: isCancelled ? 0.65 : 1,
      }}
    >
      <div className="flex items-start gap-4">
        <div className="w-14 shrink-0 text-center">
          <div className="text-[16px] font-black" style={{ color: meta.color }}>
            {lesson.startTime}
          </div>
          <div className="text-[10px] text-dim">{lesson.endTime}</div>
          <div className="mt-0.5 text-[10px] font-bold text-dim">{lesson.durationMin} min</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusIcon status={lesson.status} />
            <span
              className="text-[14px] font-extrabold"
              style={{ textDecoration: isCancelled ? 'line-through' : 'none', color: '#F0EDE6' }}
            >
              {lesson.studentLabel}
            </span>
            <LevelBadge level={lesson.level} label={lesson.levelLabel} />
          </div>
          <div className="mt-1 flex items-center gap-2 text-[12px] text-secondary">
            <SubjectDot color={lesson.subjectColor} />
            <span>{lesson.subjectName}</span>
            {lesson.roomName && <span>· {lesson.roomName}</span>}
            <span>· {lesson.form === 'group' ? '👥 Grupa' : '👤 Indyw.'}</span>
          </div>
          {lesson.cancelReason && (
            <div className="mt-1 text-[11px]" style={{ color: meta.color }}>
              Powód: {lesson.cancelReason}
            </div>
          )}
        </div>
      </div>

      {(lesson.status === 'planned' || lesson.status === 'in_progress') && (
        <details className="mt-3">
          <summary className="cursor-pointer text-[11px] font-extrabold text-accent">
            ▾ Pokaż dane z poprzednich zajęć
          </summary>
          <div className="mt-2 flex flex-col gap-2">
            {hint ? (
              <>
                <PrevBlock label="Temat" value={hint.topic} />
                <PrevBlock label="Notatka" value={hint.noteForStudent} />
                <PrevBlock label="Praca domowa" value={hint.homework} highlight={Boolean(hint.homework)} />
              </>
            ) : (
              <p className="text-[11px] italic text-dim">Brak poprzednich zajęć z tym uczniem.</p>
            )}
          </div>
        </details>
      )}
    </article>
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
      <div className="mb-0.5 text-[10px] font-extrabold uppercase tracking-wider text-dim">
        {label}
      </div>
      <div
        className="text-[12px] font-semibold"
        style={{ color: value ? '#F0EDE6' : '#8B879D', fontStyle: value ? 'normal' : 'italic' }}
      >
        {value ?? 'Brak danych'}
      </div>
    </div>
  )
}

function NavLink({
  offset,
  date,
  label,
}: {
  offset: number
  date: string | null
  label: string
}) {
  let href = '/panel/tutor/day'
  if (date && offset !== 0) {
    const d = new Date(date)
    d.setDate(d.getDate() + offset)
    href = `/panel/tutor/day?date=${d.toISOString().slice(0, 10)}`
  }
  return (
    <a
      href={href}
      className="rounded-[8px] border border-subtle bg-surface px-3 py-1.5 text-[12px] font-bold text-dim hover:bg-surface-hover hover:text-primary"
    >
      {label}
    </a>
  )
}

function formatLocalDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}
