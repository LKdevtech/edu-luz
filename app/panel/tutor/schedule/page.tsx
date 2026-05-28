import { getCurrentTutorId } from '@/lib/auth/getCurrentTutorId'
import { LevelBadge, StatusIcon, SubjectDot, getLessonStatusMeta } from '@/lib/components/panel/Badges'
import { TutorWeekSchedule } from '@/lib/components/panel/TutorWeekSchedule'
import {
  getTutorDayView,
  getTutorSchedule,
  loadPrevHintsBatch,
  type PreviousLessonHint,
  type TutorLessonRow,
} from '@/lib/queries/tutor'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type ViewMode = 'week' | 'day'
type SearchParams = { view?: string; week?: string; date?: string }

export default async function TutorSchedulePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const view: ViewMode = searchParams.view === 'day' ? 'day' : 'week'
  const tutorId = await getCurrentTutorId()
  const supabase = createSupabaseServerClient()

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <ViewToggle view={view} week={searchParams.week} date={searchParams.date} />
      {view === 'week' ? (
        <WeekView tutorId={tutorId} supabase={supabase} week={searchParams.week} />
      ) : (
        <DayView tutorId={tutorId} supabase={supabase} date={searchParams.date} />
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Toggle „Tydzień | Dzień"
// ════════════════════════════════════════════════════════════════════════════

function ViewToggle({
  view,
  week,
  date,
}: {
  view: ViewMode
  week?: string
  date?: string
}) {
  // Zachowaj kontekst nawigacyjny: jeśli przełączamy z dnia na tydzień (lub
  // odwrotnie), przenosimy bieżący kontekst tylko gdy ma sens — domyślnie cofamy
  // do „dziś" i pozwalamy strzałkom nawigacyjnym przejąć resztę.
  const weekHref = '/panel/tutor/schedule' + (week ? `?week=${week}` : '')
  const dayHref = '/panel/tutor/schedule?view=day' + (date ? `&date=${date}` : '')

  return (
    <div className="mb-5 inline-flex items-center gap-1 rounded-[10px] border border-subtle bg-alt p-1">
      <ToggleButton href={weekHref} active={view === 'week'} label="📅 Tydzień" />
      <ToggleButton href={dayHref} active={view === 'day'} label="🗓️ Dzień" />
    </div>
  )
}

function ToggleButton({
  href,
  active,
  label,
}: {
  href: string
  active: boolean
  label: string
}) {
  return (
    <a
      href={href}
      className="rounded-[8px] px-3 py-1.5 text-[12px] font-extrabold transition-colors"
      style={
        active
          ? { backgroundColor: 'rgba(59,143,240,0.18)', color: '#3B8FF0' }
          : { backgroundColor: 'transparent', color: '#8B879D' }
      }
    >
      {label}
    </a>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Widok tygodnia
// ════════════════════════════════════════════════════════════════════════════

async function WeekView({
  tutorId,
  supabase,
  week,
}: {
  tutorId: string
  supabase: ReturnType<typeof createSupabaseServerClient>
  week?: string
}) {
  const data = await getTutorSchedule(supabase, tutorId, week)

  const allLessons = data.days.flatMap((d) =>
    d.lessons.map((l) => ({
      id: l.id,
      classId: l.classId,
      date: l.date,
      startTime: l.startTime,
    })),
  )
  const hintsMap = await loadPrevHintsBatch(supabase, allLessons)
  const prevHints: Record<string, PreviousLessonHint | null> = {}
  for (const l of allLessons) {
    prevHints[l.id] = hintsMap.get(l.id) ?? null
  }

  const weekLabel = formatWeekRange(data.weekStart, data.weekEnd)

  return (
    <>
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-black text-primary">Harmonogram tygodnia</h1>
          <p className="text-[12px] text-dim">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <WeekNav offset={-7} weekStart={data.weekStart} label="←" />
          <WeekNav offset={0} weekStart={null} label="Dziś" />
          <WeekNav offset={7} weekStart={data.weekStart} label="→" />
        </div>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px]">
        <span className="font-extrabold text-dim">Status:</span>
        <Legend color="#3B8FF0" label="Planowana" />
        <Legend color="#22C55E" label="Zrealizowana" />
        <Legend color="#EF4444" label="Odwołana" />
        <Legend color="#7C5CFC" label="Odrabianie" />
      </div>

      <TutorWeekSchedule days={data.days} prevHints={prevHints} />
    </>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 font-bold" style={{ color }}>
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-sm"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  )
}

function WeekNav({
  offset,
  weekStart,
  label,
}: {
  offset: number
  weekStart: string | null
  label: string
}) {
  let href = '/panel/tutor/schedule'
  if (weekStart && offset !== 0) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + offset)
    href = `/panel/tutor/schedule?week=${d.toISOString().slice(0, 10)}`
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

function formatWeekRange(startIso: string, endIso: string): string {
  const start = new Date(startIso)
  const end = new Date(endIso)
  const startStr = `${String(start.getDate()).padStart(2, '0')}.${String(start.getMonth() + 1).padStart(2, '0')}`
  const endStr = `${String(end.getDate()).padStart(2, '0')}.${String(end.getMonth() + 1).padStart(2, '0')}.${end.getFullYear()}`
  return `${startStr}–${endStr}`
}

// ════════════════════════════════════════════════════════════════════════════
// Widok dnia
// ════════════════════════════════════════════════════════════════════════════

async function DayView({
  tutorId,
  supabase,
  date,
}: {
  tutorId: string
  supabase: ReturnType<typeof createSupabaseServerClient>
  date?: string
}) {
  const data = await getTutorDayView(supabase, tutorId, date)

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
            <span className="text-[14px] font-bold text-dim">{formatLocalDate(data.date)}</span>
            {data.isToday && (
              <span className="ml-2 text-[12px] font-extrabold text-link">— dziś</span>
            )}
          </h1>
          <p className="text-[12px] text-dim">
            {data.lessons.length} {data.lessons.length === 1 ? 'lekcja' : 'lekcji'} · {totalHours}h
          </p>
        </div>
        <div className="flex gap-2">
          <DayNav offset={-1} date={data.date} label="←" />
          <DayNav offset={0} date={null} label="Dziś" />
          <DayNav offset={1} date={data.date} label="→" />
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
                <PrevBlock
                  label="Praca domowa"
                  value={hint.homework}
                  highlight={Boolean(hint.homework)}
                />
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

function DayNav({
  offset,
  date,
  label,
}: {
  offset: number
  date: string | null
  label: string
}) {
  let href = '/panel/tutor/schedule?view=day'
  if (date && offset !== 0) {
    const d = new Date(date)
    d.setDate(d.getDate() + offset)
    href = `/panel/tutor/schedule?view=day&date=${d.toISOString().slice(0, 10)}`
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
