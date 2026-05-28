import { getLessonStatusMeta, SubjectDot } from '@/lib/components/panel/Badges'
import { ScheduleFilters } from '@/lib/components/panel/admin/ScheduleFilters'
import { getAdminSchedule } from '@/lib/queries/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { DAY_NAMES_SHORT } from '@/lib/queries/_helpers'

export const dynamic = 'force-dynamic'

type SearchParams = { week?: string; tutor?: string; room?: string; subject?: string }

const HOUR_FROM = 8
const HOUR_TO = 21
const HOUR_HEIGHT = 50

export default async function AdminSchedulePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createSupabaseServerClient()
  const data = await getAdminSchedule(supabase, searchParams.week)

  // Apply filters
  let lessons = data.lessons
  if (searchParams.tutor) lessons = lessons.filter((l) => l.tutorId === searchParams.tutor)
  if (searchParams.room) lessons = lessons.filter((l) => l.roomId === searchParams.room)
  if (searchParams.subject)
    lessons = lessons.filter(
      (l) => data.subjects.find((s) => s.id === searchParams.subject)?.name === l.subjectName,
    )

  const today = new Date().toISOString().slice(0, 10)
  const startMonday = new Date(data.weekStart)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startMonday)
    d.setDate(d.getDate() + i)
    const iso = d.toISOString().slice(0, 10)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    return {
      iso,
      dayOfWeek: i,
      label: `${DAY_NAMES_SHORT[i]} ${dd}.${mm}`,
      isToday: iso === today,
      lessons: lessons.filter((l) => l.date === iso),
    }
  })

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-black text-primary">Harmonogram globalny</h1>
          <p className="text-[12px] text-dim">
            {formatWeekLabel(data.weekStart, data.weekEnd)} · {lessons.length} lekcji
          </p>
        </div>
        <div className="flex items-center gap-2">
          <WeekNav offset={-7} weekStart={data.weekStart} label="←" search={searchParams} />
          <WeekNav offset={0} weekStart={null} label="Dziś" search={searchParams} />
          <WeekNav offset={7} weekStart={data.weekStart} label="→" search={searchParams} />
        </div>
      </header>

      {/* Filters */}
      <div className="mb-4">
        <ScheduleFilters
          tutors={data.tutors.map((t) => ({ id: t.id, fullName: t.fullName }))}
          rooms={data.rooms}
          subjects={data.subjects}
        />
      </div>

      <div
        className="overflow-hidden rounded-card bg-surface"
        style={{ border: '1px solid rgba(59,143,240,0.10)' }}
      >
        {/* Day headers */}
        <div className="grid border-b border-subtle" style={{ gridTemplateColumns: '50px repeat(7, 1fr)' }}>
          <div className="flex items-center justify-center p-2 text-[10px] font-bold text-dim">
            ⏰
          </div>
          {days.map((d) => (
            <div
              key={d.iso}
              className="border-l border-subtle py-2 text-center"
              style={{ background: d.isToday ? 'rgba(59,143,240,0.06)' : 'transparent' }}
            >
              <div
                className="text-[11px] font-extrabold"
                style={{ color: d.isToday ? '#3B8FF0' : '#9B97AF' }}
              >
                {d.label}
              </div>
              <div className="text-[9px] text-dim">{d.lessons.length} lekcji</div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid" style={{ gridTemplateColumns: '50px repeat(7, 1fr)' }}>
          <div>
            {Array.from({ length: HOUR_TO - HOUR_FROM + 1 }, (_, i) => i + HOUR_FROM).map((h) => (
              <div
                key={h}
                className="flex items-start justify-center pt-0.5 text-[9px] font-bold text-dim"
                style={{ height: HOUR_HEIGHT }}
              >
                {h}:00
              </div>
            ))}
          </div>
          {days.map((d) => (
            <div
              key={d.iso}
              className="relative border-l border-subtle"
              style={{
                minHeight: (HOUR_TO - HOUR_FROM + 1) * HOUR_HEIGHT,
                background: d.isToday ? 'rgba(59,143,240,0.03)' : 'transparent',
              }}
            >
              {Array.from({ length: HOUR_TO - HOUR_FROM + 1 }, (_, i) => i + HOUR_FROM).map((h) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 h-px bg-subtle"
                  style={{ top: (h - HOUR_FROM) * HOUR_HEIGHT }}
                  aria-hidden
                />
              ))}
              {d.lessons.map((l) => {
                const [sh, sm] = l.startTime.split(':').map(Number)
                const [eh, em] = l.endTime.split(':').map(Number)
                const top = (sh! - HOUR_FROM) * HOUR_HEIGHT + (sm! / 60) * HOUR_HEIGHT
                const durMin = eh! * 60 + em! - (sh! * 60 + sm!)
                const height = (durMin / 60) * HOUR_HEIGHT
                const meta = getLessonStatusMeta(l.status)
                const isCancelled = l.status === 'cancelled'
                return (
                  <div
                    key={l.id}
                    className="absolute overflow-hidden rounded-[6px]"
                    style={{
                      top,
                      left: 2,
                      right: 2,
                      height: height - 3,
                      background: `${meta.color}1A`,
                      border: `1px solid ${meta.color}33`,
                      borderLeft: `3px solid ${meta.color}`,
                      padding: '2px 4px',
                      opacity: isCancelled ? 0.5 : 1,
                    }}
                  >
                    <div className="truncate text-[9px] font-extrabold" style={{ color: meta.color }}>
                      {l.studentLabel}
                    </div>
                    <div className="truncate text-[8px] text-secondary">
                      {l.tutorName.split(' ')[0]} · {l.subjectName}
                    </div>
                    {l.roomName && height > 40 && (
                      <div className="text-[7px] text-dim">{l.roomName}</div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px]">
        {data.subjects.map((s) => (
          <span key={s.id} className="inline-flex items-center gap-1 font-bold" style={{ color: s.color }}>
            <SubjectDot color={s.color} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  )
}

function WeekNav({
  offset,
  weekStart,
  label,
  search,
}: {
  offset: number
  weekStart: string | null
  label: string
  search: SearchParams
}) {
  let href = '/panel/admin/schedule'
  const params = new URLSearchParams()
  if (weekStart && offset !== 0) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + offset)
    params.set('week', d.toISOString().slice(0, 10))
  }
  if (search.tutor) params.set('tutor', search.tutor)
  if (search.room) params.set('room', search.room)
  if (search.subject) params.set('subject', search.subject)
  const q = params.toString()
  if (q) href += `?${q}`
  return (
    <a
      href={href}
      className="rounded-[8px] border border-subtle bg-surface px-3 py-1.5 text-[12px] font-bold text-dim hover:bg-surface-hover hover:text-primary"
    >
      {label}
    </a>
  )
}

function formatWeekLabel(startIso: string, endIso: string): string {
  const s = new Date(startIso)
  const e = new Date(endIso)
  const sStr = `${String(s.getDate()).padStart(2, '0')}.${String(s.getMonth() + 1).padStart(2, '0')}`
  const eStr = `${String(e.getDate()).padStart(2, '0')}.${String(e.getMonth() + 1).padStart(2, '0')}.${e.getFullYear()}`
  return `${sStr}–${eStr}`
}
