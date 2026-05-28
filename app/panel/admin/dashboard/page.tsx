import Link from 'next/link'

import { getCurrentAdminId } from '@/lib/auth/getCurrentAdminId'
import { AdminQuickActions } from '@/lib/components/panel/admin/AdminQuickActions'
import { getLessonStatusMeta, StatusIcon, SubjectDot } from '@/lib/components/panel/Badges'
import { getAdminDashboard, getAdminStudents, getAdminTutors } from '@/lib/queries/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const adminId = await getCurrentAdminId()
  const supabase = createSupabaseServerClient()

  const [data, tutorsData, studentsData, roomsResult] = await Promise.all([
    getAdminDashboard(supabase),
    getAdminTutors(supabase),
    getAdminStudents(supabase),
    supabase.from('rooms').select('id, name').eq('is_active', true).order('name'),
  ])
  if (roomsResult.error) throw roomsResult.error

  const studentsForActions = studentsData.students.map((s) => ({
    id: s.id,
    fullName: s.fullName,
    schoolClass: s.schoolClass,
    level: s.levelLabel,
  }))
  const tutorsForActions = tutorsData.tutors.map((t) => ({ id: t.id, fullName: t.fullName }))

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="📚"
          label="Lekcje dziś"
          value={String(data.todayLessons.total)}
          sub={`${data.todayLessons.inProgress} w trakcie · ${data.todayLessons.completed} zrealizowanych`}
          color="#3B8FF0"
        />
        <StatCard
          icon="🎓"
          label="Aktywni uczniowie"
          value={String(data.studentsActive)}
          sub={`${studentsData.groups.length} aktywnych grup`}
          color="#06B6D4"
        />
        <StatCard
          icon="👨‍🏫"
          label="Korepetytorzy"
          value={String(data.tutorsActive)}
          sub="aktywni"
          color="#22C55E"
        />
        <StatCard
          icon="💰"
          label="Przychód msc"
          value={`${formatAmount(data.monthRevenue)} zł`}
          sub={`${data.monthRealized} lekcji zrealizowanych`}
          color="#FFCA28"
        />
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-3 text-[16px] font-extrabold text-primary">Szybkie akcje</h2>
        <AdminQuickActions
          adminId={adminId}
          rooms={roomsResult.data ?? []}
          subjects={tutorsData.subjects}
          tutors={tutorsForActions}
          students={studentsForActions}
          parents={studentsData.parents}
        />
      </section>

      {/* Alerts */}
      <section>
        <h2 className="mb-3 text-[16px] font-extrabold text-primary">Alerty</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AlertCard
            icon="🤒"
            label="Nieobecności do zatwierdzenia"
            count={data.alerts.pendingAbsences}
            color="#EF4444"
          />
          <AlertCard
            icon="📝"
            label="Wpisy do uzupełnienia"
            count={data.alerts.blockedEntries}
            color="#FF6F4A"
          />
          <AlertCard
            icon="💳"
            label="Zaległości / oczekujące"
            count={data.alerts.overduePayments}
            color="#FFCA28"
          />
          <AlertCard
            icon="🔄"
            label="Aktywne odrabiania"
            count={data.alerts.pendingMakeups}
            color="#06B6D4"
          />
        </div>
      </section>

      {/* Today's schedule */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[16px] font-extrabold text-primary">Dzisiejszy harmonogram</h2>
          <Link href="/panel/admin/schedule" className="text-[12px] font-bold text-link hover:underline">
            Pełny harmonogram →
          </Link>
        </div>
        {data.todaySchedule.length === 0 ? (
          <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">
            Brak lekcji zaplanowanych na dziś.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {data.todaySchedule.map((l) => {
              const meta = getLessonStatusMeta(l.status)
              return (
                <article
                  key={l.lessonId}
                  className="flex items-center gap-3 rounded-card bg-surface p-3"
                  style={{ borderLeft: `3px solid ${l.subjectColor}` }}
                >
                  <div className="w-14 shrink-0 text-center">
                    <div className="text-[13px] font-extrabold" style={{ color: meta.color }}>
                      {l.startTime}
                    </div>
                    <div className="text-[10px] text-dim">{l.endTime}</div>
                  </div>
                  <StatusIcon status={l.status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <SubjectDot color={l.subjectColor} />
                      <span className="text-[13px] font-bold text-primary">{l.subjectName}</span>
                      <span className="text-[12px] text-secondary">— {l.studentLabel}</span>
                    </div>
                    <div className="text-[11px] text-dim">
                      👨‍🏫 {l.tutorName}
                      {l.roomName && ` · 📍 ${l.roomName}`}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Pending payments */}
      {data.pendingPayments.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-extrabold text-primary">Oczekujące płatności</h2>
            <Link
              href="/panel/admin/payments"
              className="text-[12px] font-bold text-link hover:underline"
            >
              Pełna lista →
            </Link>
          </div>
          <div
            className="overflow-hidden rounded-card bg-surface"
            style={{ border: '1px solid rgba(59,143,240,0.10)' }}
          >
            {data.pendingPayments.slice(0, 8).map((p) => (
              <div
                key={p.paymentId}
                className="flex items-center gap-3 border-b border-subtle px-4 py-3 last:border-b-0"
              >
                <div
                  className="rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider"
                  style={
                    p.status === 'overdue'
                      ? { backgroundColor: '#EF444422', color: '#EF4444' }
                      : { backgroundColor: '#FFCA2822', color: '#FFCA28' }
                  }
                >
                  {p.status === 'overdue' ? 'Zaległość' : 'Oczekuje'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold text-primary">{p.parentName}</div>
                  <div className="text-[11px] text-dim">{p.childrenNames}</div>
                </div>
                {p.delayNumber > 0 && (
                  <span
                    className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold"
                    style={{ backgroundColor: '#EF444422', color: '#EF4444' }}
                  >
                    {p.delayNumber}. opóźnienie
                  </span>
                )}
                <span className="text-[14px] font-extrabold text-primary">
                  {formatAmount(p.amount)} zł
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string
  label: string
  value: string
  sub: string
  color: string
}) {
  return (
    <article
      className="rounded-card bg-surface p-5"
      style={{ border: '1px solid rgba(59,143,240,0.10)' }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-dim">{label}</span>
        <span className="text-[16px]" aria-hidden>{icon}</span>
      </div>
      <div className="text-[28px] font-black leading-tight" style={{ color }}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-dim">{sub}</div>
    </article>
  )
}

function AlertCard({
  icon,
  label,
  count,
  color,
}: {
  icon: string
  label: string
  count: number
  color: string
}) {
  return (
    <article
      className="flex items-center gap-3 rounded-card bg-surface p-4"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <span className="text-[24px]" aria-hidden>{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[24px] font-black leading-tight" style={{ color }}>
          {count}
        </div>
        <div className="text-[11px] text-dim">{label}</div>
      </div>
    </article>
  )
}

function formatAmount(n: number): string {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(n)
}
