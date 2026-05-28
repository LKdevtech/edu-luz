import Link from 'next/link'

import { getCurrentTutorId } from '@/lib/auth/getCurrentTutorId'
import { LevelBadge, SubjectDot } from '@/lib/components/panel/Badges'
import { LessonEntryForm } from '@/lib/components/panel/LessonEntryForm'
import {
  awardOverdueEntryPenalties,
  getTutorLessons,
  type TutorLessonRow,
} from '@/lib/queries/tutor'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Enums } from '@/lib/types/database.types'
import { formatLessonDate } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

type SearchParams = { fill?: string; filter?: string }

const ENTRY_STATUS_META: Record<
  Exclude<TutorLessonRow['entryStatus'], null>,
  { label: string; color: string; bg: string }
> = {
  missing: { label: 'Brak wpisu', color: '#FF6F4A', bg: '#FF6F4A29' },
  draft: { label: 'Szkic', color: '#FFCA28', bg: '#FFCA2822' },
  published: { label: 'Opublikowany', color: '#22C55E', bg: '#22C55E22' },
  // 'locked' nie blokuje już edycji — zrealizowana lekcja zawsze wymaga wpisu.
  // Oznacza po prostu wpis spóźniony (po 48h) z naliczonym punktem karnym.
  locked: { label: 'Spóźniony', color: '#FF6F4A', bg: '#FF6F4A22' },
  // 'no_entry' / 'blocked' = lekcja się NIE odbyła (no-show) → wpis niemożliwy.
  blocked: { label: 'No-show', color: '#EF4444', bg: '#EF444422' },
  no_entry: { label: 'Brak — lekcja się nie odbyła', color: '#EF4444', bg: '#EF444422' },
}

export default async function TutorLessonsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const tutorId = await getCurrentTutorId()
  const supabase = createSupabaseServerClient()
  // Najpierw przyznaj punkty karne za lekcje > 48h bez wpisu — potem dopiero
  // czytamy stan, żeby wynik (penaltyPoints) zawierał świeżo dodane.
  await awardOverdueEntryPenalties(supabase, tutorId)
  const data = await getTutorLessons(supabase, tutorId)
  const filter = searchParams.filter ?? 'all'

  // Jeśli ?fill=<lessonId> — pokaż formularz dla tej lekcji
  let fillingLesson: TutorLessonRow | null = null
  let fillingInitial:
    | NonNullable<React.ComponentProps<typeof LessonEntryForm>['initial']>
    | undefined = undefined

  if (searchParams.fill) {
    // Najpierw szukamy w missingEntries
    fillingLesson = data.missingEntries.find((l) => l.id === searchParams.fill) ?? null
    // Jeśli nie ma w missing, może to recent draft do edycji
    if (!fillingLesson) {
      const r = data.recentEntries.find((l) => l.id === searchParams.fill)
      if (r) fillingLesson = r as unknown as TutorLessonRow
    }
    if (fillingLesson) {
      // Pre-load istniejących danych entry (jeśli draft)
      const { data: entryRow } = await supabase
        .from('entries')
        .select(
          `
            status, topic, note_for_student, internal_note,
            homework:homework!homework_entry_id_fkey ( content, due_date )
          `,
        )
        .eq('lesson_id', fillingLesson.id)
        .maybeSingle()

      type ERow = {
        status: Enums<'entry_status'>
        topic: string | null
        note_for_student: string | null
        internal_note: string | null
        homework: { content: string; due_date: string | null } | null
      }
      const e = (entryRow as unknown) as ERow | null

      // Per-uczeń obecność + parent_notes
      const { data: attRows } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('lesson_id', fillingLesson.id)
      const attendance: Record<string, 'present' | 'absent'> = {}
      for (const a of attRows ?? []) attendance[a.student_id] = a.status

      let parentNotes: Record<string, string> = {}
      if (e) {
        // Potrzebujemy ID entry, ale upsert robimy po lesson_id; fetch entries po lesson_id raz jeszcze:
        const { data: entryIdRow } = await supabase
          .from('entries')
          .select('id')
          .eq('lesson_id', fillingLesson.id)
          .maybeSingle()
        if (entryIdRow) {
          const { data: pn } = await supabase
            .from('entry_parent_notes')
            .select('student_id, note')
            .eq('entry_id', entryIdRow.id)
          parentNotes = Object.fromEntries((pn ?? []).map((n) => [n.student_id, n.note]))
        }
      }

      fillingInitial = {
        topic: e?.topic ?? null,
        noteForStudent: e?.note_for_student ?? null,
        internalNote: e?.internal_note ?? null,
        homeworkContent: e?.homework?.content ?? null,
        homeworkDueDate: e?.homework?.due_date ?? null,
        parentNotes,
        attendance,
        status:
          (e?.status as 'missing' | 'draft' | 'published' | 'locked' | 'blocked' | undefined) ??
          'missing',
      }
    }
  }

  const filteredRecent =
    filter === 'all'
      ? data.recentEntries
      : data.recentEntries.filter((l) => l.entryStatus === filter)

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-black text-primary">Dziennik wpisów</h1>
          <p className="text-[12px] text-dim">
            Uzupełnij wpisy do 48h od końca lekcji. Po tym czasie pole edycji się blokuje
            i otrzymujesz punkt karny.
          </p>
        </div>
        {data.penaltyPoints > 0 && (
          <div
            className="flex items-center gap-2 rounded-[10px] px-3 py-2"
            style={{ border: '1px solid #EF444433', backgroundColor: '#EF444410' }}
          >
            <span aria-hidden className="text-[16px]">⚠</span>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: '#EF4444' }}>
                Punkty karne
              </div>
              <div className="text-[16px] font-black" style={{ color: '#EF4444' }}>
                {data.penaltyPoints}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Filling form */}
      {fillingLesson && (
        <section className="mb-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[16px] font-black text-primary">
              Wpis — {fillingLesson.studentLabel}
            </h2>
            <Link
              href="/panel/tutor/lessons"
              className="text-[12px] font-bold text-dim hover:text-primary"
            >
              ✕ Zamknij
            </Link>
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-secondary">
            <span className="font-bold text-primary">{formatLessonDate(fillingLesson.date)}</span>
            <span>· {fillingLesson.startTime}–{fillingLesson.endTime}</span>
            <span>· {fillingLesson.durationMin} min</span>
            <span>· {fillingLesson.subjectName}</span>
            {fillingLesson.roomName && <span>· {fillingLesson.roomName}</span>}
            <LevelBadge level={fillingLesson.level} label={fillingLesson.levelLabel} />
          </div>
          <LessonEntryForm
            lessonId={fillingLesson.id}
            tutorId={tutorId}
            isGroup={fillingLesson.form === 'group'}
            students={fillingLesson.students.map((s) => ({
              id: s.id,
              fullName: s.fullName,
              firstName: s.firstName,
            }))}
            initial={fillingInitial}
          />
        </section>
      )}

      {!fillingLesson && (
        <>
          {/* Missing entries */}
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-[18px] font-black text-primary">Do uzupełnienia</h2>
              <span
                className="rounded-full px-2 py-0.5 text-[11px] font-extrabold"
                style={{ backgroundColor: '#FF6F4A29', color: '#FF6F4A' }}
              >
                {data.missingEntries.length}
              </span>
            </div>
            {data.missingEntries.length === 0 ? (
              <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">
                🎉 Wszystkie wpisy uzupełnione.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {data.missingEntries.map((l) => (
                  <MissingEntryCard key={l.id} lesson={l} />
                ))}
              </div>
            )}
          </section>

          {/* Recent entries */}
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[18px] font-black text-primary">Ostatnie wpisy</h2>
              <div className="flex flex-wrap gap-2">
                <FilterPill href="/panel/tutor/lessons" label="Wszystkie" active={filter === 'all'} count={data.recentEntries.length} />
                <FilterPill
                  href="/panel/tutor/lessons?filter=draft"
                  label="Szkice"
                  active={filter === 'draft'}
                  count={data.recentEntries.filter((e) => e.entryStatus === 'draft').length}
                />
                <FilterPill
                  href="/panel/tutor/lessons?filter=published"
                  label="Opublikowane"
                  active={filter === 'published'}
                  count={data.recentEntries.filter((e) => e.entryStatus === 'published').length}
                />
                <FilterPill
                  href="/panel/tutor/lessons?filter=locked"
                  label="Zablokowane"
                  active={filter === 'locked'}
                  count={data.recentEntries.filter((e) => e.entryStatus === 'locked').length}
                />
              </div>
            </div>

            {filteredRecent.length === 0 ? (
              <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">
                Brak wpisów w tej kategorii.
              </div>
            ) : (
              <div className="overflow-hidden rounded-card bg-surface" style={{ border: '1px solid rgba(59,143,240,0.10)' }}>
                <div className="flex gap-3 bg-alt px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-dim">
                  <span className="w-[80px]">Data</span>
                  <span className="flex-1">Uczeń / Temat</span>
                  <span className="text-right">Status</span>
                </div>
                {filteredRecent.map((l) => (
                  <RecentEntryRow key={l.id} lesson={l} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function MissingEntryCard({ lesson }: { lesson: TutorLessonRow }) {
  const hours = lesson.hoursLeftForEntry ?? 0
  const overdue = hours < 0 // po 48h — wpis spóźniony (punkt karny), ale wciąż wymagany
  const urgent = !overdue && hours < 12
  const borderColor = overdue ? '#EF4444' : urgent ? '#EF4444' : '#FF6F4A'

  return (
    <article
      className="flex items-center gap-4 rounded-card bg-surface p-4"
      style={{
        borderLeft: `4px solid ${borderColor}`,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
      }}
    >
      <div className="w-14 shrink-0 text-center">
        <div className="text-[10px] font-bold text-dim">
          {formatLessonDate(lesson.date)}
        </div>
        <div className="text-[15px] font-black text-primary">{lesson.startTime}</div>
        <div className="text-[10px] text-dim">{lesson.durationMin} min</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-extrabold text-primary">
            {lesson.studentLabel}
          </span>
          <LevelBadge level={lesson.level} label={lesson.levelLabel} />
          {lesson.form === 'group' && (
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold"
              style={{ backgroundColor: '#7C5CFC22', color: '#7C5CFC' }}
            >
              👥 Grupa
            </span>
          )}
        </div>
        <div className="text-[12px] text-secondary">
          {lesson.subjectName}
          {lesson.roomName && ` · ${lesson.roomName}`}
        </div>
      </div>
      <span
        className="rounded-md px-3 py-1.5 text-[11px] font-extrabold"
        style={
          overdue
            ? { backgroundColor: '#EF444422', color: '#EF4444' }
            : urgent
              ? { backgroundColor: '#EF444422', color: '#EF4444' }
              : { backgroundColor: '#FFCA2822', color: '#FFCA28' }
        }
      >
        {overdue ? `⚠ Spóźniony o ${Math.abs(hours)}h · punkt karny` : `${urgent ? '⚠ ' : ''}Zostało ${hours}h`}
      </span>
      <Link
        href={`/panel/tutor/lessons?fill=${lesson.id}`}
        className="rounded-[10px] px-4 py-2 text-[12px] font-extrabold transition-colors hover:brightness-110"
        style={{ backgroundColor: '#3B8FF026', color: '#3B8FF0' }}
      >
        📝 Uzupełnij{overdue ? ' (spóźniony)' : ''}
      </Link>
    </article>
  )
}

function RecentEntryRow({
  lesson,
}: {
  lesson: TutorLessonRow & {
    entry: { topic: string | null; hasHomework: boolean; editedAt: string | null }
  }
}) {
  const status = lesson.entryStatus ?? 'missing'
  const meta = ENTRY_STATUS_META[status as keyof typeof ENTRY_STATUS_META] ?? ENTRY_STATUS_META.missing
  const isBlocked = status === 'blocked' || status === 'no_entry'

  return (
    <div
      className="flex items-center gap-3 border-b border-subtle px-4 py-3 last:border-b-0 hover:bg-surface-hover"
      style={{ opacity: isBlocked ? 0.55 : 1 }}
    >
      <div className="w-[80px] shrink-0">
        <div className="text-[10px] font-bold text-dim">{formatLessonDate(lesson.date)}</div>
        <div className="text-[12px] font-extrabold text-primary">{lesson.startTime}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-extrabold text-primary">{lesson.studentLabel}</span>
          <LevelBadge level={lesson.level} label={lesson.levelLabel} />
          <SubjectDot color={lesson.subjectColor} />
          <span className="text-[11px] text-secondary">{lesson.subjectName}</span>
          {lesson.entry.editedAt && (
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: '#7C5CFC22', color: '#7C5CFC' }}
              title={`Edytowany ${formatEditedAt(lesson.entry.editedAt)}`}
            >
              ✎ Edytowany {formatEditedAt(lesson.entry.editedAt)}
            </span>
          )}
        </div>
        {lesson.entry.topic && (
          <div className="mt-0.5 truncate text-[11px] text-dim">{lesson.entry.topic}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {lesson.entry.hasHomework && (
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
        {!isBlocked && (
          <Link
            href={`/panel/tutor/lessons?fill=${lesson.id}`}
            className="rounded-[8px] border border-subtle px-3 py-1 text-[10px] font-bold text-secondary hover:bg-surface-hover"
          >
            {status === 'draft' || status === 'published' || status === 'locked' ? 'Edytuj' : 'Podgląd'}
          </Link>
        )}
      </div>
    </div>
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

function FilterPill({
  href,
  label,
  active,
  count,
}: {
  href: string
  label: string
  active: boolean
  count: number
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-[10px] border px-3 py-1.5 text-[11px] font-bold transition-colors"
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
    </Link>
  )
}
