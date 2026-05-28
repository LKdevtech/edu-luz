import { getCurrentTutorId } from '@/lib/auth/getCurrentTutorId'
import { LevelBadge, SubjectDot } from '@/lib/components/panel/Badges'
import { getTutorStudents, type TutorStudentRow } from '@/lib/queries/tutor'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type SearchParams = { q?: string; filter?: 'all' | 'individual' | 'group' }

export default async function TutorStudentsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const tutorId = await getCurrentTutorId()
  const supabase = createSupabaseServerClient()
  const data = await getTutorStudents(supabase, tutorId)

  const q = (searchParams.q ?? '').toLowerCase()
  const filter = searchParams.filter ?? 'all'

  const filtered = data.students.filter((s) => {
    const matchSearch =
      !q || s.name.toLowerCase().includes(q) || s.subjectName.toLowerCase().includes(q)
    const matchFilter =
      filter === 'all' ||
      (filter === 'individual' && !s.isGroup) ||
      (filter === 'group' && s.isGroup)
    return matchSearch && matchFilter
  })

  const indivCount = data.students.filter((s) => !s.isGroup).length
  const groupCount = data.students.filter((s) => s.isGroup).length
  const totalStudents =
    indivCount + data.students.filter((s) => s.isGroup).reduce((sum, g) => sum + g.groupMembers.length, 0)

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-black text-primary">Moi uczniowie</h1>
        <p className="text-[12px] text-dim">
          {totalStudents} uczniów · {indivCount} indyw. · {groupCount} {groupCount === 1 ? 'grupa' : 'grupy'}
        </p>
      </header>

      <form className="mb-5 flex flex-wrap items-center gap-3" method="get">
        <div className="flex flex-1 min-w-[240px] items-center gap-2 rounded-card border border-subtle bg-alt px-4 focus-within:border-link">
          <span aria-hidden className="text-[14px] opacity-50">
            🔍
          </span>
          <input
            type="search"
            name="q"
            defaultValue={searchParams.q ?? ''}
            placeholder="Szukaj ucznia lub przedmiotu…"
            className="w-full bg-transparent py-2.5 text-[13px] text-primary placeholder:text-dim focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <FilterPill href={hrefFor(searchParams, { filter: 'all' })} label="Wszyscy" count={data.students.length} active={filter === 'all'} />
          <FilterPill href={hrefFor(searchParams, { filter: 'individual' })} label="Indywidualni" count={indivCount} active={filter === 'individual'} />
          <FilterPill href={hrefFor(searchParams, { filter: 'group' })} label="Grupy" count={groupCount} active={filter === 'group'} />
        </div>
      </form>

      {filtered.length === 0 ? (
        <div className="rounded-card bg-surface p-10 text-center">
          <div className="mb-2 text-[28px]">🔍</div>
          <p className="text-[14px] font-extrabold text-primary">Brak wyników</p>
          <p className="text-[12px] text-dim">Spróbuj zmienić wyszukiwanie lub filtr.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((s) => (
            <StudentCard key={s.id} s={s} />
          ))}
        </div>
      )}
    </div>
  )
}

function StudentCard({ s }: { s: TutorStudentRow }) {
  const attendRate =
    s.stats.attended !== null && s.stats.totalLessons > 0
      ? Math.round((s.stats.attended / s.stats.totalLessons) * 100)
      : null

  return (
    <details className="rounded-card bg-surface" style={{ border: '1px solid rgba(59,143,240,0.10)' }}>
      <summary className="flex cursor-pointer items-center gap-4 p-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-[15px] font-extrabold"
          style={{
            background: `linear-gradient(135deg, ${s.color}29, ${s.color}10)`,
            border: `1.5px solid ${s.color}33`,
            color: s.color,
          }}
        >
          {s.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-black text-primary">{s.name}</span>
            <LevelBadge level={s.level} label={s.levelLabel} />
            <span className="text-[10px] text-dim">
              {s.subjectName}
              {!s.isGroup && ` · ${s.schoolClass}`}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px]">
            <span
              className="rounded-md px-1.5 py-0.5 font-bold"
              style={{ backgroundColor: '#1C2035', color: '#8B879D' }}
            >
              {s.isGroup ? `👥 ${s.form}` : '👤 Indywidualnie'}
            </span>
            <span className="text-secondary">📅 {s.scheduleLabel}</span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-[11px]">
            {s.stats.cancelled > 0 && (
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: '#EF444422', color: '#EF4444' }}
              >
                {s.stats.cancelled} odwołane
              </span>
            )}
            {attendRate !== null && attendRate >= 95 && (
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: '#22C55E22', color: '#22C55E' }}
              >
                ✓ {attendRate}% obecności
              </span>
            )}
          </div>
        </div>
        <span aria-hidden className="text-[12px] text-dim">
          ▼
        </span>
      </summary>

      <div
        className="border-t p-5"
        style={{ borderColor: `${s.color}22`, background: `${s.color}06` }}
      >
        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatTile value={s.stats.totalLessons} label="Lekcji łącznie" color="#3B8FF0" />
          <StatTile
            value={attendRate !== null ? `${attendRate}%` : '—'}
            label="Obecność"
            color={attendRate !== null && attendRate >= 90 ? '#22C55E' : '#FFCA28'}
          />
          <StatTile
            value={s.stats.cancelled}
            label="Odwołane"
            color={s.stats.cancelled > 2 ? '#EF4444' : '#8B879D'}
          />
          <StatTile value={`~${s.stats.avgPerMonth}/msc`} label="Średnio" color="#7C5CFC" />
        </div>

        {/* Last lesson info */}
        <div className="flex flex-col gap-2">
          <InfoBlock
            label="Ostatni temat"
            value={s.lastTopic}
            subject={{ name: s.subjectName, color: s.subjectColor }}
          />
          <InfoBlock label="Notatka z ostatniej lekcji" value={s.lastNote} />
          <InfoBlock
            label="Ostatnia praca domowa"
            value={s.lastHomework}
            highlight={s.lastHomework !== null}
          />
        </div>

        {/* Internal note */}
        {s.internalNote && (
          <div
            className="mt-3 rounded-[10px] p-3"
            style={{ backgroundColor: '#7C5CFC0A', border: '1px solid #7C5CFC22' }}
          >
            <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-accent">
              🔒 Notatka wewnętrzna
            </div>
            <div className="text-[12px] text-secondary">{s.internalNote}</div>
          </div>
        )}

        {/* Group members */}
        {s.isGroup && s.groupMembers.length > 0 && (
          <div className="mt-3">
            <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-dim">
              Członkowie grupy ({s.groupMembers.length})
            </div>
            <div className="flex flex-col gap-1.5">
              {s.groupMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-[10px] bg-alt px-3 py-2"
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[10px] font-extrabold"
                    style={{ backgroundColor: `${s.color}22`, color: s.color }}
                  >
                    {m.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[12px] font-bold text-primary">{m.fullName}</span>
                    <span className="ml-2 text-[10px] text-dim">{m.schoolClass}</span>
                  </div>
                  {m.parentName && (
                    <span className="text-[10px] text-dim">Rodzic: {m.parentName}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parent (solo only) */}
        {!s.isGroup && s.parentLabel && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-[10px] bg-alt p-3">
            <div className="flex items-center gap-2">
              <span aria-hidden>👨‍👩‍👧</span>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-dim">
                  Rodzic
                </div>
                <div className="text-[13px] font-bold text-primary">{s.parentLabel}</div>
              </div>
            </div>
            <button
              type="button"
              className="rounded-[10px] px-3 py-1.5 text-[11px] font-extrabold transition-colors hover:brightness-110"
              style={{ backgroundColor: '#3B8FF026', color: '#3B8FF0' }}
            >
              Napisz do rodzica
            </button>
          </div>
        )}
      </div>
    </details>
  )
}

function StatTile({
  value,
  label,
  color,
}: {
  value: number | string
  label: string
  color: string
}) {
  return (
    <div className="rounded-[10px] bg-alt p-3 text-center">
      <div className="text-[18px] font-black" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-dim">{label}</div>
    </div>
  )
}

function InfoBlock({
  label,
  value,
  subject,
  highlight = false,
}: {
  label: string
  value: string | null
  subject?: { name: string; color: string }
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
      <div className="mb-1 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-dim">
        {label}
        {subject && <SubjectDot color={subject.color} />}
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

function FilterPill({
  href,
  label,
  count,
  active,
}: {
  href: string
  label: string
  count: number
  active: boolean
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-[10px] border px-3 py-2 text-[12px] font-bold transition-colors"
      style={
        active
          ? { borderColor: 'rgba(59,143,240,0.5)', backgroundColor: 'rgba(59,143,240,0.18)', color: '#3B8FF0' }
          : { borderColor: 'rgba(59,143,240,0.10)', backgroundColor: 'transparent', color: '#8B879D' }
      }
    >
      {label}
      <span
        className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold"
        style={
          active
            ? { backgroundColor: 'rgba(59,143,240,0.22)', color: '#3B8FF0' }
            : { backgroundColor: 'rgba(139,135,157,0.18)', color: '#8B879D' }
        }
      >
        {count}
      </span>
    </a>
  )
}

function hrefFor(
  current: SearchParams,
  patch: Partial<SearchParams>,
): string {
  const merged = { ...current, ...patch }
  const params = new URLSearchParams()
  if (merged.q) params.set('q', merged.q)
  if (merged.filter && merged.filter !== 'all') params.set('filter', merged.filter)
  const q = params.toString()
  return q ? `/panel/tutor/students?${q}` : '/panel/tutor/students'
}
