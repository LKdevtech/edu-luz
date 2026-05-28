import { getCurrentStudentId } from '@/lib/auth/getCurrentStudentId'
import { CancelLessonOverlay } from '@/lib/components/panel/CancelLessonOverlay'
import { ContactTeacher } from '@/lib/components/panel/ContactTeacher'
import { EntryCard } from '@/lib/components/panel/EntryCard'
import { HomeworkSection } from '@/lib/components/panel/HomeworkSection'
import { LevelBadge, SubjectDot } from '@/lib/components/panel/Badges'
import { getStudentDashboard, type LessonRow, type MakeupRow } from '@/lib/queries/student'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatLessonDate, formatPolishDate } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

export default async function StudentDashboardPage() {
  const studentId = await getCurrentStudentId()
  const supabase = createSupabaseServerClient()
  const data = await getStudentDashboard(supabase, studentId)

  const lessonsByDate = groupLessonsByDate(data.upcomingLessons)
  const pendingHomeworkCount = data.homework.filter((h) => !h.isDone).length

  return (
    <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
      {/* ───────── LEFT COLUMN ───────── */}
      <div className="flex flex-col gap-6 min-w-0">
        {/* 1. Nadchodzące lekcje */}
        <section>
          <SectionHeader
            icon="📅"
            title="Nadchodzące lekcje"
            count={data.upcomingLessons.length}
            link={{ href: '/panel/student/classes', label: 'Zajęcia →' }}
          />
          {lessonsByDate.length === 0 ? (
            <EmptyState text="Brak zaplanowanych lekcji." />
          ) : (
            <div className="flex flex-col gap-3">
              {lessonsByDate.map(([dateLabel, lessons], i) => (
                <div key={dateLabel} className="flex flex-col gap-2">
                  <DateGroupHeader label={dateLabel} highlighted={i === 0} />
                  {lessons.map((l, idx) => (
                    <UpcomingLessonCard
                      key={l.id}
                      lesson={l}
                      isNext={i === 0 && idx === 0}
                      studentId={studentId}
                      pendingCancel={data.pendingCancelLessonIds.has(l.id)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. Praca domowa */}
        <section>
          <SectionHeader
            icon="📝"
            title="Praca domowa"
            count={pendingHomeworkCount}
            countLabel="do zrobienia"
            countColor="#FFCA28"
          />
          <HomeworkSection homework={data.homework} studentId={studentId} />
        </section>

        {/* 3. Notatki z lekcji */}
        <section>
          <SectionHeader
            icon="📖"
            title="Notatki z lekcji"
            count={data.recentEntries.length}
            link={{ href: '/panel/student/classes?tab=history', label: 'Zobacz wszystkie →' }}
          />
          {data.recentEntries.length === 0 ? (
            <EmptyState text="Brak notatek z lekcji." />
          ) : (
            <div className="flex flex-col gap-2">
              {data.recentEntries.map((e) => (
                <EntryCard
                  key={e.entryId}
                  entryId={e.entryId}
                  subjectName={e.subjectName}
                  subjectColor={e.subjectColor}
                  tutorName={e.tutorName}
                  level={e.level}
                  levelLabel={e.levelLabel}
                  topic={e.topic}
                  noteForStudent={e.noteForStudent}
                  lessonDate={e.lessonDate}
                  homeworkContent={e.homeworkContent}
                  homeworkVerified={e.homeworkVerified}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ───────── RIGHT COLUMN ───────── */}
      <div className="flex flex-col gap-4">
        {/* 4. Quick Info */}
        <aside className="rounded-card bg-alt p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[12px] text-[13px] font-extrabold"
              style={{
                backgroundColor: `${data.student.avatarColor}29`,
                color: data.student.avatarColor,
              }}
            >
              {data.student.initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-extrabold text-primary">
                {data.student.fullName}
              </div>
              <div className="text-[11px] text-secondary">
                {data.student.schoolClass} •{' '}
                <LevelBadge level={data.student.level} label={data.student.levelLabel} />
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-1.5 text-[12px]">
            <InfoRow label="Lekcji / tydzień" value={String(data.lessonsPerWeek)} />
            <InfoRow label="Frekwencja" value={`${data.attendancePercent}%`} />
            <InfoRow
              label="Korepetytorów"
              value={String(data.tutors.length)}
            />
          </div>
        </aside>

        {/* 5. Tutor contacts */}
        <aside className="rounded-card bg-alt p-4">
          <div className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-secondary">
            💬 Moi korepetytorzy
          </div>
          <div className="flex flex-col gap-2">
            {data.tutors.length === 0 ? (
              <EmptyState text="Brak przypisanych korepetytorów." compact />
            ) : (
              data.tutors.map((t) => (
                <ContactTeacher
                  key={t.tutorId}
                  tutorId={t.tutorId}
                  studentId={studentId}
                  tutorName={`${t.fullName} • ${t.subjectName}`}
                  tutorInitials={t.initials}
                />
              ))
            )}
          </div>
        </aside>

        {/* 6. Schedule mini */}
        <aside className="rounded-card bg-alt p-4">
          <div className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-secondary">
            📋 Stały plan zajęć
          </div>
          {data.weeklyPlan.length === 0 ? (
            <EmptyState text="Brak zajęć w planie." compact />
          ) : (
            <div className="flex flex-col gap-1.5">
              {data.weeklyPlan.map((slot, i) => (
                <div
                  key={`${slot.dayOfWeek}-${slot.startTime}-${i}`}
                  className="flex items-center gap-3 rounded-[8px] bg-surface px-3 py-2"
                >
                  <span className="w-8 shrink-0 text-[12px] font-extrabold text-link">
                    {slot.dayShort}
                  </span>
                  <span className="flex-1 text-[12px] text-primary">
                    {slot.startTime}–{slot.endTime}
                  </span>
                  {slot.roomName && (
                    <span className="text-[11px] text-dim">{slot.roomName}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* 7. Makeup overview */}
        {data.makeup.length > 0 && (
          <aside className="rounded-card bg-alt p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary">
                ↻ Odrabianie
              </span>
              <span className="rounded-full bg-[#F59E0B22] px-2 py-0.5 text-[10px] font-extrabold text-[#F59E0B]">
                {data.makeup.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {data.makeup.slice(0, 3).map((m) => (
                <MakeupMiniCard key={m.requestId} item={m} />
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Internal components
// ════════════════════════════════════════════════════════════════════════════

function SectionHeader({
  icon,
  title,
  count,
  countLabel,
  countColor,
  link,
}: {
  icon: string
  title: string
  count?: number
  countLabel?: string
  countColor?: string
  link?: { href: string; label: string }
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[15px]" aria-hidden>
          {icon}
        </span>
        <h2 className="text-[15px] font-extrabold text-primary">{title}</h2>
        {typeof count === 'number' && count > 0 && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
            style={
              countColor
                ? { backgroundColor: `${countColor}22`, color: countColor }
                : { backgroundColor: '#232840', color: '#9B97AF' }
            }
          >
            {count} {countLabel ?? ''}
          </span>
        )}
      </div>
      {link && (
        <a href={link.href} className="text-[12px] font-bold text-link hover:underline">
          {link.label}
        </a>
      )}
    </div>
  )
}

function EmptyState({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div
      className={`rounded-card bg-surface text-center text-[12px] text-dim ${
        compact ? 'p-3' : 'p-5'
      }`}
    >
      {text}
    </div>
  )
}

function DateGroupHeader({ label, highlighted }: { label: string; highlighted: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-[11px] font-extrabold uppercase tracking-[0.8px] ${
          highlighted ? 'text-link' : 'text-dim'
        }`}
      >
        {label}
      </span>
      {highlighted && (
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: '#22C55E', animation: 'pulse 2s infinite' }}
        />
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-dim">{label}</span>
      <span className="font-extrabold text-primary">{value}</span>
    </div>
  )
}

function UpcomingLessonCard({
  lesson,
  isNext,
  studentId,
  pendingCancel,
}: {
  lesson: LessonRow
  isNext: boolean
  studentId: string
  pendingCancel: boolean
}) {
  return (
    <article
      className="relative rounded-card bg-surface p-3 transition-all hover:-translate-y-0.5 hover:shadow-card"
      style={{
        borderLeft: `3px solid ${lesson.subjectColor}`,
        backgroundColor: isNext ? 'rgba(59,143,240,0.04)' : undefined,
      }}
    >
      {isNext && (
        <span
          className="absolute right-2 top-2 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase"
          style={{
            backgroundColor: '#22C55E22',
            color: '#22C55E',
            animation: 'pulse 2s infinite',
          }}
        >
          Następna
        </span>
      )}
      <div className="flex items-center gap-2">
        <SubjectDot color={lesson.subjectColor} />
        <span className="text-[13px] font-extrabold text-primary">{lesson.subjectName}</span>
        <LevelBadge level={lesson.level} label={lesson.levelLabel} />
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-secondary">
        <span>🕐 {lesson.startTime}–{lesson.endTime}</span>
        <span>👤 {lesson.tutorName}</span>
        {lesson.roomName && <span>📍 {lesson.roomName}</span>}
      </div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <CancelLessonOverlay
          lessonId={lesson.id}
          studentId={studentId}
          pending={pendingCancel}
        />
      </div>
    </article>
  )
}

function MakeupMiniCard({ item }: { item: MakeupRow }) {
  return (
    <article
      className="rounded-[10px] bg-surface p-3"
      style={{ borderLeft: '3px solid #7C5CFC' }}
    >
      <div className="flex items-center gap-2">
        <SubjectDot color={item.subjectColor} />
        <span className="text-[12px] font-extrabold text-primary">{item.subjectName}</span>
        <span
          className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold"
          style={{ backgroundColor: '#7C5CFC22', color: '#7C5CFC' }}
        >
          ODR
        </span>
      </div>
      <div className="mt-1 text-[11px] text-secondary">
        Odwołana: {formatPolishDate(item.originalDate)}
        {item.cancelReason ? ` • ${item.cancelReason}` : ''}
      </div>
      {item.proposal?.proposedDate && (
        <div
          className="mt-2 rounded-[8px] p-2 text-[11px]"
          style={{ backgroundColor: '#22C55E0A', borderLeft: '3px solid #22C55E66' }}
        >
          <div className="mb-1 text-[9px] font-extrabold uppercase tracking-wider text-success">
            Propozycja terminu
          </div>
          <div className="text-[12px] font-extrabold text-primary">
            📅 {formatPolishDate(item.proposal.proposedDate)}
          </div>
          <div className="mt-1 text-[10px] text-dim">Rodzic musi zaakceptować termin.</div>
        </div>
      )}
    </article>
  )
}

function groupLessonsByDate(lessons: LessonRow[]): Array<[string, LessonRow[]]> {
  const buckets = new Map<string, LessonRow[]>()
  for (const l of lessons) {
    const key = formatLessonDate(l.date)
    const arr = buckets.get(key) ?? []
    arr.push(l)
    buckets.set(key, arr)
  }
  return Array.from(buckets.entries())
}
