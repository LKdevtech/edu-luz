import { getCurrentStudentId } from '@/lib/auth/getCurrentStudentId'
import { LevelBadge, SubjectDot } from '@/lib/components/panel/Badges'
import { ContactTeacher } from '@/lib/components/panel/ContactTeacher'
import { NotificationToggle } from '@/lib/components/panel/NotificationToggle'
import { getStudentProfile } from '@/lib/queries/student'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Enums } from '@/lib/types/database.types'
import { formatBirthDate } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

const NOTIFICATION_LABELS: Record<
  Enums<'notification_type'>,
  { label: string; description: string }
> = {
  schedule_change: {
    label: 'Zmiana harmonogramu',
    description: 'Gdy korepetytor lub admin zmieni godziny / salę',
  },
  new_entry: {
    label: 'Nowy wpis z lekcji',
    description: 'Gdy pojawi się temat, notatka albo praca domowa',
  },
  makeup_proposal: {
    label: 'Odrabianie',
    description: 'Gdy pojawi się termin do odrobienia lub aktualizacja',
  },
  message_received: {
    label: 'Wiadomości',
    description: 'Komunikaty od korepetytora lub centrum',
  },
  payment_reminder_10: { label: '', description: '' },
  payment_reminder_20: { label: '', description: '' },
  payment_reminder_last: { label: '', description: '' },
  new_absence_request: { label: '', description: '' },
  entry_blocked_48h: { label: '', description: '' },
  payment_received: { label: '', description: '' },
  payment_overdue: { label: '', description: '' },
  makeup_no_response: { label: '', description: '' },
  contract_ending: { label: '', description: '' },
}

export default async function StudentProfilePage() {
  const studentId = await getCurrentStudentId()
  const supabase = createSupabaseServerClient()
  const data = await getStudentProfile(supabase, studentId)

  return (
    <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
      {/* ───────── LEFT ───────── */}
      <div className="flex flex-col gap-6 min-w-0">
        {/* 1. Student info */}
        <section className="rounded-card bg-surface p-5">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-[14px] text-[20px] font-extrabold"
              style={{
                backgroundColor: `${data.student.avatarColor}29`,
                color: data.student.avatarColor,
              }}
            >
              {data.student.initials}
            </div>
            <div className="min-w-0">
              <div className="text-[20px] font-extrabold text-primary">
                {data.student.fullName}
              </div>
              <div className="mt-1 flex items-center gap-2 text-[13px] text-secondary">
                <span>{data.student.schoolClass}</span>
                {data.student.schoolName && (
                  <span className="text-dim">• {data.student.schoolName}</span>
                )}
                <LevelBadge level={data.student.level} label={data.student.levelLabel} />
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <ProfileInfoRow icon="🎂" label="Data urodzenia" value={formatBirthDate(data.student.birthDate)} />
            <ProfileInfoRow icon="👩" label="Rodzic" value={data.student.parentFullName} />
            {data.student.parentPhone && (
              <ProfileInfoRow icon="📞" label="Kontakt do rodzica" value={data.student.parentPhone} />
            )}
          </div>
        </section>

        {/* 2. Schedule */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[15px]" aria-hidden>
              📋
            </span>
            <h2 className="text-[15px] font-extrabold text-primary">Stały plan zajęć</h2>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
              style={{ backgroundColor: '#3B8FF026', color: '#3B8FF0' }}
            >
              {data.schedule.length}×/tydz
            </span>
          </div>
          {data.schedule.length === 0 ? (
            <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">
              Brak zajęć w planie.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data.schedule.map((slot, i) => (
                <article
                  key={`${slot.dayOfWeek}-${slot.startTime}-${i}`}
                  className="flex items-center gap-3 rounded-card bg-surface p-3"
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
                      <span className="text-[13px] font-extrabold text-primary">
                        {slot.subjectName}
                      </span>
                      <LevelBadge level={slot.level} label={slot.levelLabel} />
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
          )}
        </section>

        {/* 3. Notifications */}
        <section>
          <div className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-secondary">
            🔔 Powiadomienia push
          </div>
          <div className="rounded-card bg-surface p-4">
            {data.notifications.map((n) => {
              const meta = NOTIFICATION_LABELS[n.type]
              if (!meta.label) return null
              return (
                <NotificationToggle
                  key={n.type}
                  studentId={studentId}
                  notifType={n.type}
                  initialPush={n.pushEnabled}
                  initialEmail={n.emailEnabled}
                  label={meta.label}
                  description={meta.description}
                />
              )
            })}
          </div>
        </section>
      </div>

      {/* ───────── RIGHT ───────── */}
      <div className="flex flex-col gap-4">
        {/* Tutors */}
        <aside className="rounded-card bg-alt p-4">
          <div className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-secondary">
            💬 Moi korepetytorzy
          </div>
          <div className="flex flex-col gap-2">
            {data.tutors.length === 0 ? (
              <div className="text-[12px] text-dim">Brak przypisanych korepetytorów.</div>
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

        {/* Stats */}
        <aside className="rounded-card bg-alt p-4">
          <div className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-secondary">
            📊 Statystyki
            {data.stats.contractSince && (
              <span className="ml-2 text-dim normal-case">
                (od {formatBirthDate(data.stats.contractSince)})
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatTile value={data.stats.totalLessons} label="Łącznie" />
            <StatTile value={data.stats.completed} label="Zrealizowane" color="#22C55E" />
            <StatTile value={data.stats.cancelled} label="Odwołane" color="#EF4444" />
            <StatTile value={data.stats.noShow} label="No-show" color="#F59E0B" />
            <StatTile value={data.stats.makeupDone} label="Odrobione" color="#7C5CFC" />
            <StatTile
              value={`${data.stats.attendancePercent}%`}
              label="Frekwencja"
              color="#22C55E"
            />
          </div>
        </aside>

        {/* Center */}
        <aside className="rounded-card bg-alt p-4">
          <div className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-secondary">
            🏢 Centrum {data.center.name}
          </div>
          <div className="flex flex-col gap-2 text-[12px]">
            <div className="flex items-start gap-2">
              <span className="shrink-0 text-secondary">📍</span>
              <span className="text-primary">{data.center.address}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0 text-secondary">📞</span>
              <span className="font-extrabold text-primary">{data.center.phone}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0 text-secondary">✉</span>
              <span className="text-primary">{data.center.email}</span>
            </div>
          </div>
        </aside>

        {/* Account */}
        <aside className="rounded-card bg-alt p-4">
          <div className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-secondary">
            ⚙ Konto
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="rounded-[8px] border border-subtle bg-transparent px-3 py-2 text-left text-[12px] font-semibold text-secondary hover:bg-surface-hover"
            >
              🔒 Zmień hasło
            </button>
            <button
              type="button"
              className="rounded-[8px] border px-3 py-2 text-left text-[12px] font-semibold opacity-80 hover:opacity-100"
              style={{ borderColor: '#EF444433', color: '#EF4444' }}
            >
              🚪 Wyloguj się
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function ProfileInfoRow({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-5 shrink-0 text-[14px]" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-dim">
          {label}
        </div>
        <div className="text-[13px] font-semibold text-primary">{value}</div>
      </div>
    </div>
  )
}

function StatTile({
  value,
  label,
  color,
}: {
  value: number | string
  label: string
  color?: string
}) {
  return (
    <div className="flex flex-col items-center rounded-[8px] bg-surface px-2 py-2">
      <span
        className="text-[18px] font-black"
        style={{ color: color ?? '#F0EDE6' }}
      >
        {value}
      </span>
      <span className="text-[10px] font-semibold text-dim">{label}</span>
    </div>
  )
}
