import { getCurrentAdminId } from '@/lib/auth/getCurrentAdminId'
import { AdminAlerts } from '@/lib/components/panel/admin/AdminAlerts'
import { AdminPendingPayments } from '@/lib/components/panel/admin/AdminPendingPayments'
import { AdminQuickActions } from '@/lib/components/panel/admin/AdminQuickActions'
import { GenerateLessonsButton } from '@/lib/components/panel/admin/GenerateLessonsButton'
import {
  getAdminDashboard,
  getAdminStudents,
  getAdminTutors,
  type AdminRoomNow,
  type AdminTodayTutor,
} from '@/lib/queries/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const SUBJECT_COLORS: Record<string, string> = {
  Matematyka: '#3B8FF0',
  Angielski: '#06B6D4',
  Fizyka: '#F59E0B',
  Chemia: '#22C55E',
  Polski: '#E84393',
  Elektrotechnika: '#FF6F4A',
}

function fmt(n: number): string {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(n)
}

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
  const todayDoneTotal = data.todayByTutor.reduce((s, t) => s + t.done, 0)
  const todayLessonsTotal = data.todayByTutor.reduce((s, t) => s + t.lessons, 0)

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {/* ═══ KAFELKI STATYSTYK ═══ */}
      <div className="mb-7 flex flex-wrap gap-4">
        <StatCard
          icon="📚"
          value={String(data.todayLessons.total)}
          label="Lekcje dziś"
          sub={`${data.todayLessons.inProgress} w trakcie · ${data.todayLessons.completed} zrealizowanych`}
          color="#3B8FF0"
        />
        <StatCard
          icon="🎓"
          value={String(data.studentsActive)}
          label="Aktywni uczniowie"
          sub={`${data.studentsIndividual} indyw. · ${data.studentsInGroups} w grupach`}
          color="#06B6D4"
          extra={`${data.groupsActive} aktywnych grup`}
          extraColor="#06B6D4"
        />
        <StatCard
          icon="👨‍🏫"
          value={`${data.tutorsPresent}/${data.tutorsTotal}`}
          label="Korepetytorzy dziś"
          sub={
            data.absentTutors.length > 0
              ? `${data.absentTutors.length} nieobecność (${data.absentTutors.map((a) => a.name.split(' ')[0]).join(', ')})`
              : 'wszyscy obecni'
          }
          color="#22C55E"
        />
        <MonthLessonsCard
          month={data.monthLabel}
          total={data.monthTotal}
          realized={data.monthRealized}
          planned={data.monthPlanned}
          cancelled={data.monthCancelled}
          noShow={data.monthNoShow}
        />
      </div>

      {/* ═══ LAYOUT 2 KOLUMNY ═══ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEWA */}
        <div>
          <AdminAlerts alerts={data.alertsDetailed} adminId={adminId} />
          <FinanceSection finance={data.finance} realized={data.monthRealized} month={data.monthLabel} />
          <AdminPendingPayments payments={data.pendingPayments} />
        </div>

        {/* PRAWA */}
        <div>
          <Section
            icon="👨‍🏫"
            title="Korepetytorzy dziś"
            right={
              <span className="text-[11px] font-bold text-dim">
                {todayDoneTotal}/{todayLessonsTotal} lekcji zrealizowanych
              </span>
            }
          >
            <div className="flex flex-col gap-2">
              {data.todayByTutor.map((t, i) => (
                <TutorRow key={i} tutor={t} />
              ))}
              {data.absentTutors.map((a, i) => (
                <AbsentRow key={i} name={a.name} initials={a.initials} reason={a.reason} lessons={a.affectedLessons} />
              ))}
              {data.todayByTutor.length === 0 && data.absentTutors.length === 0 && (
                <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">
                  Brak lekcji dziś.
                </div>
              )}
            </div>
          </Section>

          <Section icon="🏠" title="Sale — teraz">
            <div className="flex flex-wrap gap-2.5">
              {data.roomsNow.map((r, i) => (
                <RoomCard key={i} room={r} />
              ))}
            </div>
          </Section>

          <Section icon="⚡" title="Szybkie akcje">
            <AdminQuickActions
              adminId={adminId}
              rooms={roomsResult.data ?? []}
              subjects={tutorsData.subjects}
              tutors={tutorsForActions}
              students={studentsForActions}
              parents={studentsData.parents}
            />
          </Section>

          <Section icon="⚙️" title="Operacje">
            <GenerateLessonsButton />
          </Section>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Komponenty (server, hover via Tailwind)
// ════════════════════════════════════════════════════════════════════════════

function StatCard({
  icon,
  value,
  label,
  sub,
  color,
  extra,
  extraColor,
}: {
  icon: string
  value: string
  label: string
  sub: string
  color: string
  extra?: string
  extraColor?: string
}) {
  return (
    <div
      className="flex flex-1 basis-[200px] flex-col gap-2 rounded-[16px] bg-surface p-5 transition-all hover:-translate-y-0.5 hover:bg-surface-hover"
      style={{ border: '1px solid rgba(59,143,240,0.10)' }}
    >
      <div className="flex items-start justify-between">
        <span className="text-[22px]" aria-hidden>{icon}</span>
      </div>
      <div className="text-[28px] font-black leading-none text-primary">{value}</div>
      <div className="text-[12px] font-bold text-secondary">{label}</div>
      <div className="text-[11px] text-dim">{sub}</div>
      {extra && (
        <div className="-mt-0.5 text-[11px] font-bold" style={{ color: extraColor ?? color }}>
          {extra}
        </div>
      )}
    </div>
  )
}

function MonthLessonsCard({
  month,
  total,
  realized,
  planned,
  cancelled,
  noShow,
}: {
  month: string
  total: number
  realized: number
  planned: number
  cancelled: number
  noShow: number
}) {
  const segments = [
    { label: 'Zrealizowane', value: realized, color: '#22C55E' },
    { label: 'Zaplanowane', value: planned, color: '#3B8FF0' },
    { label: 'Odwołane', value: cancelled, color: '#EF4444' },
    { label: 'No-show', value: noShow, color: '#FF6F4A' },
  ]
  return (
    <div
      className="flex flex-1 basis-[200px] flex-col gap-2.5 rounded-[16px] bg-surface p-5"
      style={{ border: '1px solid rgba(59,143,240,0.10)' }}
    >
      <div className="flex items-start justify-between">
        <span className="text-[22px]" aria-hidden>📊</span>
        <span className="text-[10px] font-bold text-secondary">{month}</span>
      </div>
      <div className="text-[28px] font-black leading-none text-primary">{total}</div>
      <div className="text-[12px] font-bold text-secondary">Lekcje w miesiącu</div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
        {segments.map((s, i) =>
          s.value > 0 ? (
            <div key={i} style={{ flex: s.value, backgroundColor: s.color, minWidth: 4 }} />
          ) : null,
        )}
      </div>
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[10px] text-dim">{s.label}:</span>
            <span className="text-[11px] font-extrabold" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Section({
  icon,
  title,
  right,
  children,
}: {
  icon: string
  title: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mb-7">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[16px]" aria-hidden>{icon}</span>
          <span className="text-[16px] font-black text-primary">{title}</span>
        </div>
        {right}
      </div>
      {children}
    </div>
  )
}

function FinanceSection({
  finance,
  realized,
  month,
}: {
  finance: { revenueCollected: number; revenueExpected: number; tutorCostsPlanned: number; tutorCostsActual: number }
  realized: number
  month: string
}) {
  const revPct = finance.revenueExpected > 0 ? Math.round((finance.revenueCollected / finance.revenueExpected) * 100) : 0
  const costPct = finance.tutorCostsPlanned > 0 ? Math.round((finance.tutorCostsActual / finance.tutorCostsPlanned) * 100) : 0
  const margin = finance.revenueCollected - finance.tutorCostsActual
  const marginPlan = finance.revenueExpected - finance.tutorCostsPlanned
  const revColor = revPct >= 90 ? '#22C55E' : revPct >= 70 ? '#FFCA28' : '#FF6F4A'
  const perLesson = realized > 0 ? realized : 1

  return (
    <div className="mb-7">
      <div className="mb-3.5 flex items-center gap-2">
        <span className="text-[16px]" aria-hidden>💰</span>
        <span className="text-[16px] font-black text-primary">Finanse — {month}</span>
      </div>

      {/* Pasek przychodu */}
      <div
        className="mb-2.5 flex items-center gap-4 rounded-[14px] bg-surface px-5 py-4"
        style={{ border: '1px solid rgba(59,143,240,0.10)' }}
      >
        <div className="flex-1">
          <div className="mb-1.5 flex justify-between">
            <span className="text-[12px] font-bold text-secondary">Przychód</span>
            <span className="text-[12px] font-extrabold text-primary">
              {fmt(finance.revenueCollected)} <span className="font-medium text-dim">/ {fmt(finance.revenueExpected)} zł</span>
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: '#3B8FF015' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${revPct}%`, background: 'linear-gradient(90deg, #3B8FF0, #22C55E)' }}
            />
          </div>
        </div>
        <div className="min-w-[55px] text-right text-[22px] font-black" style={{ color: revColor }}>
          {revPct}%
        </div>
      </div>

      {/* Koszty + marża */}
      <div
        className="grid grid-cols-2 gap-5 rounded-[14px] bg-surface px-5 py-4.5"
        style={{ border: '1px solid rgba(59,143,240,0.10)', paddingTop: 18, paddingBottom: 18 }}
      >
        <div>
          <div className="mb-2.5 text-[11px] font-semibold text-dim">Koszty korepetytorów</div>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-[12px] text-secondary">Planowane</span>
            <span className="text-[15px] font-extrabold text-secondary">{fmt(finance.tutorCostsPlanned)} zł</span>
          </div>
          <div className="mb-2.5 flex items-baseline justify-between">
            <span className="text-[12px] text-secondary">Obecne</span>
            <span className="text-[15px] font-extrabold" style={{ color: '#7C5CFC' }}>{fmt(finance.tutorCostsActual)} zł</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ backgroundColor: '#7C5CFC15' }}>
            <div className="h-full rounded-full" style={{ width: `${costPct}%`, backgroundColor: '#7C5CFC' }} />
          </div>
          <div className="mt-1 text-right text-[10px] text-dim">{costPct}% planu</div>
        </div>
        <div className="flex flex-col items-center justify-center border-l border-subtle pl-5">
          <div className="mb-1.5 text-[10px] font-semibold text-dim">Marża (obecna)</div>
          <div className="text-[28px] font-black" style={{ color: margin >= 0 ? '#22C55E' : '#EF4444' }}>
            {fmt(margin)} zł
          </div>
          <div className="mt-1.5 text-[10px] text-dim">Plan: {fmt(marginPlan)} zł</div>
        </div>
      </div>

      {/* Wskaźniki */}
      <div className="mt-2.5 flex gap-2.5">
        {[
          { label: 'Śr. przychód / lekcja', value: `${Math.round(finance.revenueCollected / perLesson)} zł`, color: '#3B8FF0' },
          { label: 'Śr. koszt / lekcja', value: `${Math.round(finance.tutorCostsActual / perLesson)} zł`, color: '#7C5CFC' },
          { label: 'Śr. marża / lekcja', value: `${Math.round(margin / perLesson)} zł`, color: '#22C55E' },
        ].map((w, i) => (
          <div
            key={i}
            className="flex-1 rounded-[12px] bg-surface px-4 py-3.5 text-center"
            style={{ border: '1px solid rgba(59,143,240,0.10)' }}
          >
            <div className="text-[20px] font-black" style={{ color: w.color }}>{w.value}</div>
            <div className="mt-1 text-[10px] text-dim">{w.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TutorRow({ tutor }: { tutor: AdminTodayTutor }) {
  const pct = tutor.lessons > 0 ? (tutor.done / tutor.lessons) * 100 : 0
  return (
    <div
      className="flex items-center gap-3.5 rounded-[14px] bg-surface px-4.5 py-3.5 transition-colors hover:bg-surface-hover"
      style={{ border: '1px solid rgba(59,143,240,0.10)', paddingLeft: 18, paddingRight: 18 }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-[14px] font-extrabold"
        style={{ backgroundColor: '#3B8FF020', color: '#3B8FF0' }}
      >
        {tutor.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-extrabold text-primary">{tutor.name}</span>
          {tutor.subjects.map((s, i) => (
            <span
              key={i}
              className="rounded-full px-1.5 py-px text-[9px] font-bold"
              style={{ color: SUBJECT_COLORS[s] ?? '#6B6780', backgroundColor: `${SUBJECT_COLORS[s] ?? '#6B6780'}15` }}
            >
              {s}
            </span>
          ))}
        </div>
        {tutor.current ? (
          <div className="mt-1 text-[11px] font-semibold" style={{ color: '#22C55E' }}>
            ▶ {tutor.current}{tutor.room ? ` · ${tutor.room}` : ''}
          </div>
        ) : (
          <div className="mt-1 text-[11px] text-dim">Następna lekcja wkrótce</div>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-[12px] font-extrabold text-primary">{tutor.done}/{tutor.lessons}</span>
        <div className="h-1.5 w-20 rounded-full" style={{ backgroundColor: '#3B8FF020' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#22C55E' : '#3B8FF0' }}
          />
        </div>
      </div>
    </div>
  )
}

function AbsentRow({ name, initials, reason, lessons }: { name: string; initials: string; reason: string; lessons: number }) {
  return (
    <div
      className="flex items-center gap-3.5 rounded-[14px] px-4.5 py-3.5 opacity-70"
      style={{ backgroundColor: '#EF444408', border: '1px solid #EF444420', paddingLeft: 18, paddingRight: 18 }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-[14px] font-extrabold"
        style={{ backgroundColor: '#EF444415', color: '#EF4444' }}
      >
        {initials}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-extrabold text-primary line-through opacity-60">{name}</span>
          <span className="rounded-full px-1.5 py-px text-[9px] font-bold" style={{ backgroundColor: '#EF444415', color: '#EF4444' }}>
            NIEOBECNY
          </span>
        </div>
        <div className="mt-0.5 text-[11px] text-dim">{reason} · {lessons} lekcji odwołane</div>
      </div>
    </div>
  )
}

function RoomCard({ room }: { room: AdminRoomNow }) {
  const isFree = room.status === 'free'
  return (
    <div
      className="flex flex-1 basis-[120px] flex-col gap-1.5 rounded-[14px] bg-surface px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:bg-surface-hover"
      style={{ border: `1px solid ${isFree ? '#22C55E30' : 'rgba(59,143,240,0.10)'}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-extrabold text-primary">{room.name}</span>
        <span
          className="rounded-full px-2 py-0.5 text-[9px] font-bold"
          style={isFree ? { color: '#22C55E', backgroundColor: '#22C55E15' } : { color: '#3B8FF0', backgroundColor: '#3B8FF015' }}
        >
          {isFree ? 'WOLNA' : 'ZAJĘTA'}
        </span>
      </div>
      {!isFree && <div className="text-[11px] text-secondary">{room.tutor} — do {room.until}</div>}
      {room.next && <div className="text-[10px] text-dim">Następna: {room.next}</div>}
    </div>
  )
}
