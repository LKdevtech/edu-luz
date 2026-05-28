import Link from 'next/link'

import { getCurrentTutorId } from '@/lib/auth/getCurrentTutorId'
import { LevelBadge, SubjectDot } from '@/lib/components/panel/Badges'
import { TutorMakeupCard } from '@/lib/components/panel/TutorMakeupCard'
import { getTutorDashboard, type TutorLessonRow } from '@/lib/queries/tutor'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatLessonDate } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

export default async function TutorDashboardPage() {
  const tutorId = await getCurrentTutorId()
  const supabase = createSupabaseServerClient()
  const data = await getTutorDashboard(supabase, tutorId)

  const totalToday = data.todayLessons.length
  const totalHours = Math.round(
    data.todayLessons.reduce((sum, l) => sum + l.durationMin, 0) / 60,
  )

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {/* Dzisiejsze lekcje */}
      <section className="mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[20px] font-black text-primary">Dzisiejsze lekcje</h1>
            <p className="mt-0.5 text-[12px] text-dim">
              {totalToday} {pluralize(totalToday, ['lekcja', 'lekcje', 'lekcji'])} ·{' '}
              {totalHours} {totalHours === 1 ? 'godzina' : 'godzin'}
            </p>
          </div>
          <Link
            href="/panel/tutor/schedule"
            className="rounded-[10px] border border-subtle bg-surface px-4 py-2 text-[12px] font-bold text-link hover:bg-[rgba(59,143,240,0.12)]"
          >
            📅 Pełny harmonogram →
          </Link>
        </div>
        {totalToday === 0 ? (
          <EmptyDay />
        ) : (
          <div className="flex flex-col gap-2">
            {data.todayLessons.map((l, idx) => (
              <TodayLessonCard
                key={l.id}
                lesson={l}
                isNext={idx === 0 && l.status === 'planned'}
              />
            ))}
          </div>
        )}
      </section>

      {/* Propozycje odrabiania */}
      {data.incomingMakeup.length > 0 && (
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-[18px] font-black text-primary">Propozycje odrabiania</h2>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-extrabold"
              style={{ backgroundColor: '#FF6F4A29', color: '#FF6F4A' }}
            >
              {data.incomingMakeup.length} oczekujące
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {data.incomingMakeup.map((m) => (
              <TutorMakeupCard key={m.requestId} item={m} tutorId={tutorId} mode="pending" />
            ))}
          </div>
        </section>
      )}

      {/* Brakujące wpisy */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-[18px] font-black text-primary">Brakujące wpisy</h2>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-extrabold"
            style={{ backgroundColor: '#EF444429', color: '#EF4444' }}
          >
            {data.missingEntries.length} do uzupełnienia
          </span>
          <span className="text-[11px] text-dim">
            Uzupełnij przed upływem 48h od końca lekcji
          </span>
        </div>
        {data.missingEntries.length === 0 ? (
          <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">
            🎉 Wszystkie wpisy uzupełnione.
          </div>
        ) : (
          <div className="rounded-card bg-surface" style={{ border: '1px solid rgba(59,143,240,0.10)' }}>
            {data.missingEntries.map((l, i) => (
              <MissingEntryRow
                key={l.id}
                lesson={l}
                isLast={i === data.missingEntries.length - 1}
              />
            ))}
          </div>
        )}
        <p className="mt-2 text-[10px] italic text-dim">
          Wpis blokuje się 48h po lekcji. Lekcje no-show oznaczone jako ZABLOKOWANY.
        </p>
      </section>

      {/* Statystyki miesiąca */}
      <section>
        <h2 className="mb-4 text-[18px] font-black text-primary">
          {new Date().toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            value={`${data.monthStats.hoursDone}h`}
            label="Zrealizowane"
            sub={`z ${data.monthStats.hoursPlanned}h planowanych`}
            color="#3B8FF0"
            icon="📚"
          />
          <StatCard
            value={`${data.monthStats.grossEarningsZl} zł`}
            label="Zarobek"
            sub="brutto, ten miesiąc"
            color="#22C55E"
            icon="💰"
          />
          <StatCard
            value={String(data.monthStats.plannedRemaining)}
            label="Planowane"
            sub="lekcji do końca miesiąca"
            color="#7C5CFC"
            icon="📅"
          />
          <StatCard
            value={String(data.monthStats.cancelled)}
            label="Odwołane"
            sub="w tym miesiącu"
            color="#FF6F4A"
            icon="🚫"
          />
        </div>
      </section>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════

function StatCard({
  value,
  label,
  sub,
  color,
  icon,
}: {
  value: string
  label: string
  sub: string
  color: string
  icon: string
}) {
  return (
    <div
      className="rounded-card bg-surface p-5 transition-all hover:-translate-y-0.5 hover:bg-surface-hover"
      style={{ border: '1px solid rgba(59,143,240,0.10)' }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-dim">
          {label}
        </span>
        <span className="text-[16px]" aria-hidden>
          {icon}
        </span>
      </div>
      <div className="text-[28px] font-black leading-tight" style={{ color }}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-dim">{sub}</div>
    </div>
  )
}

function TodayLessonCard({ lesson, isNext }: { lesson: TutorLessonRow; isNext: boolean }) {
  const color = lesson.subjectColor
  return (
    <article
      className="flex items-stretch gap-4 rounded-card p-4 transition-all hover:-translate-y-0.5"
      style={{
        backgroundColor: isNext ? `${color}14` : '#232840',
        border: `1px solid ${isNext ? `${color}50` : 'rgba(59,143,240,0.10)'}`,
      }}
    >
      <div className="w-14 shrink-0 text-center">
        <div className="text-[16px] font-black leading-tight" style={{ color: isNext ? color : '#F0EDE6' }}>
          {lesson.startTime}
        </div>
        <div className="text-[11px] text-dim">{lesson.endTime}</div>
      </div>
      <div
        aria-hidden
        className="w-[3px] shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-extrabold text-primary">{lesson.subjectName}</span>
          {isNext && (
            <span
              className="rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider"
              style={{ backgroundColor: `${color}40`, color }}
            >
              Następna
            </span>
          )}
          <LevelBadge level={lesson.level} label={lesson.levelLabel} />
        </div>
        <div className="mt-1 text-[13px] font-bold text-secondary">{lesson.studentLabel}</div>
        <div className="mt-1.5 flex flex-wrap gap-2 text-[10px]">
          <Pill>🚪 {lesson.roomName ?? '—'}</Pill>
          <Pill>{lesson.form === 'group' ? '👥 Grupa' : '👤 Indyw.'}</Pill>
        </div>
      </div>
    </article>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded-md px-2 py-0.5 font-bold text-dim"
      style={{ backgroundColor: '#1C2035' }}
    >
      {children}
    </span>
  )
}

function MissingEntryRow({
  lesson,
  isLast,
}: {
  lesson: TutorLessonRow
  isLast: boolean
}) {
  const hours = lesson.hoursLeftForEntry ?? 0
  const urgent = hours < 12 && hours > 0
  const blocked = hours <= 0

  return (
    <Link
      href={`/panel/tutor/lessons?fill=${lesson.id}`}
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover"
      style={{ borderBottom: isLast ? 'none' : '1px solid rgba(59,143,240,0.10)' }}
    >
      <div
        aria-hidden
        className="h-9 w-[3px] shrink-0 rounded-full"
        style={{ backgroundColor: blocked ? '#EF4444' : urgent ? '#EF4444' : lesson.subjectColor }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <SubjectDot color={lesson.subjectColor} />
          <span className="text-[13px] font-bold text-primary">{lesson.subjectName}</span>
          <span className="text-[12px] text-secondary">— {lesson.studentLabel}</span>
        </div>
        <div className="text-[11px] text-dim">
          {formatLessonDate(lesson.date)} · {lesson.startTime}–{lesson.endTime}
        </div>
      </div>
      {blocked ? (
        <span
          className="rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider"
          style={{ backgroundColor: '#EF444429', color: '#EF4444' }}
        >
          Zablokowany
        </span>
      ) : (
        <span
          className="rounded-md px-2 py-1 text-[10px] font-extrabold"
          style={
            urgent
              ? { backgroundColor: '#EF444429', color: '#EF4444' }
              : { backgroundColor: '#FFCA2829', color: '#FFCA28' }
          }
        >
          {urgent ? '⚠ ' : ''}Zostało {hours}h
        </span>
      )}
      <span
        className="rounded-[8px] px-3 py-1.5 text-[11px] font-extrabold"
        style={{ backgroundColor: '#3B8FF026', color: '#3B8FF0' }}
      >
        Uzupełnij →
      </span>
    </Link>
  )
}

function EmptyDay() {
  return (
    <div className="rounded-card bg-surface p-10 text-center">
      <div className="mb-2 text-[36px]">🏖️</div>
      <p className="text-[14px] font-extrabold text-primary">Brak lekcji dziś</p>
      <p className="text-[12px] text-dim">Wolny dzień — odpoczywaj!</p>
    </div>
  )
}

function pluralize(n: number, forms: [string, string, string]): string {
  if (n === 1) return forms[0]
  const lastTwo = n % 100
  if (lastTwo >= 12 && lastTwo <= 14) return forms[2]
  const last = n % 10
  if (last >= 2 && last <= 4) return forms[1]
  return forms[2]
}
