import { getCurrentTutorId } from '@/lib/auth/getCurrentTutorId'
import { TutorWeekSchedule } from '@/lib/components/panel/TutorWeekSchedule'
import { getTutorSchedule, loadPrevHintsBatch, type PreviousLessonHint } from '@/lib/queries/tutor'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type SearchParams = { week?: string }

export default async function TutorSchedulePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const tutorId = await getCurrentTutorId()
  const supabase = createSupabaseServerClient()
  const data = await getTutorSchedule(supabase, tutorId, searchParams.week)

  // Pre-fetch prev hints dla wszystkich lekcji tygodnia
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
    <div className="mx-auto w-full max-w-[1280px]">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-black text-primary">Harmonogram tygodnia</h1>
          <p className="text-[12px] text-dim">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <NavLink offset={-7} weekStart={data.weekStart} label="←" />
          <NavLink offset={0} weekStart={null} label="Dziś" />
          <NavLink offset={7} weekStart={data.weekStart} label="→" />
        </div>
      </header>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px]">
        <span className="font-extrabold text-dim">Status:</span>
        <Legend color="#3B8FF0" label="Planowana" />
        <Legend color="#22C55E" label="Zrealizowana" />
        <Legend color="#EF4444" label="Odwołana" />
        <Legend color="#7C5CFC" label="Odrabianie" />
        <span className="font-extrabold text-dim">·</span>
        <span className="text-dim">Kliknij lekcję → dane z poprzednich zajęć z tym uczniem</span>
      </div>

      <TutorWeekSchedule days={data.days} prevHints={prevHints} />
    </div>
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

function NavLink({
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
