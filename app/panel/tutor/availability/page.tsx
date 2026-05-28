import { getCurrentTutorId } from '@/lib/auth/getCurrentTutorId'
import { ChangeRequestForm } from '@/lib/components/panel/ChangeRequestForm'
import { ExtraSlotForm } from '@/lib/components/panel/ExtraSlotForm'
import { ExtraSlotRow } from '@/lib/components/panel/ExtraSlotRow'
import { TutorAbsenceForm } from '@/lib/components/panel/TutorAbsenceForm'
import { getTutorAvailability, type TutorAbsenceRow } from '@/lib/queries/tutor'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Enums } from '@/lib/types/database.types'
import { formatPolishDate } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

const ABSENCE_TYPE_LABELS: Record<Enums<'tutor_absence_type'>, { label: string; color: string; icon: string }> = {
  sick: { label: 'Choroba', color: '#EF4444', icon: '🤒' },
  vacation: { label: 'Urlop', color: '#FFCA28', icon: '🏖️' },
  other: { label: 'Inne', color: '#7C5CFC', icon: '📅' },
}

const DAYS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'] as const
const GRID_START_HOUR = 7
const GRID_END_HOUR = 22
const HOURS = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, i) => GRID_START_HOUR + i)
const ROW_HEIGHT = 36

type GridBlock = {
  startHour: number
  endHour: number
  startTime: string
  endTime: string
  label: string
}

function hmToHour(hm: string): number {
  const [h, m] = hm.split(':').map(Number)
  return (h ?? 0) + (m ?? 0) / 60
}

export default async function TutorAvailabilityPage() {
  const tutorId = await getCurrentTutorId()
  const supabase = createSupabaseServerClient()
  const [data, roomsResult] = await Promise.all([
    getTutorAvailability(supabase, tutorId),
    supabase.from('rooms').select('id, name').eq('is_active', true).order('name'),
  ])
  if (roomsResult.error) throw roomsResult.error
  const rooms = roomsResult.data ?? []

  const pendingAbsences = data.absences.filter((a) => a.approvedAt === null).length
  const pendingChanges = data.changeRequests.length
  const pendingCount = pendingAbsences + pendingChanges

  // Stała dostępność (availability_blocks) — niebieskie bloki, per dzień tygodnia.
  const availabilityByDay = new Map<number, GridBlock[]>()
  for (const b of data.baseline) {
    const list = availabilityByDay.get(b.dayOfWeek) ?? []
    list.push({
      startHour: hmToHour(b.startTime),
      endHour: hmToHour(b.endTime),
      startTime: b.startTime,
      endTime: b.endTime,
      label: 'Dostępny',
    })
    availabilityByDay.set(b.dayOfWeek, list)
  }

  // Extra sloty (jednorazowe) — zielone bloki, umieszczone wg dnia tygodnia daty.
  const extraByDay = new Map<number, GridBlock[]>()
  for (const s of data.extraSlots) {
    if (s.status !== 'open' && s.status !== 'booked') continue
    const dow = (new Date(s.date).getDay() + 6) % 7 // 0=Pon … 6=Ndz
    const list = extraByDay.get(dow) ?? []
    list.push({
      startHour: hmToHour(s.startTime),
      endHour: hmToHour(s.endTime),
      startTime: s.startTime,
      endTime: s.endTime,
      label: formatPolishDate(s.date),
    })
    extraByDay.set(dow, list)
  }

  const totalAvailabilityH = data.baseline.reduce(
    (sum, b) => sum + (hmToHour(b.endTime) - hmToHour(b.startTime)),
    0,
  )

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-[20px] font-black text-primary">Dostępność i plan</h1>
        {pendingCount > 0 && (
          <span
            className="rounded-[10px] px-3 py-1 text-[11px] font-extrabold"
            style={{ backgroundColor: '#FFCA2820', color: '#FFCA28' }}
          >
            {pendingCount} {pendingCount === 1 ? 'oczekuje' : 'oczekują'} na admina
          </span>
        )}
      </header>

      {/* ═══════════════ Stały plan zajęć (grid) ═══════════════ */}
      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-[18px] font-black text-primary">Dostępność tygodniowa</h2>
              <span
                className="rounded-md px-2.5 py-0.5 text-[10px] font-extrabold uppercase"
                style={{ backgroundColor: '#22C55E22', color: '#22C55E' }}
              >
                🔒 Zatwierdzona
              </span>
            </div>
            <p className="text-[12px] text-dim">
              {Math.round(totalAvailabilityH * 10) / 10}h stałej dostępności / tydz · Zmiana wymaga zatwierdzenia admina
            </p>
          </div>
          <ChangeRequestForm tutorId={tutorId} adminId={data.adminId} />
        </div>

        {/* Legend */}
        <div className="mb-3 flex flex-wrap items-center gap-4 text-[10px]">
          <Legend color="#3B8FF0" label="Stała dostępność" filled />
          <Legend color="#22C55E" label="Dodatkowe terminy" dashed />
        </div>

        {/* Pending change requests */}
        {data.changeRequests.length > 0 && (
          <div className="mb-3 flex flex-col gap-2">
            {data.changeRequests.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-card bg-surface px-4 py-3"
                style={{ border: '1px solid #7C5CFC22' }}
              >
                <span className="text-[16px]">📋</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-primary whitespace-pre-wrap">{c.description}</p>
                  <p className="mt-0.5 text-[10px] text-dim">
                    Wysłano: {new Date(c.sentAt).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}
                  </p>
                </div>
                <span
                  className="rounded-md px-2 py-0.5 text-[10px] font-extrabold"
                  style={{ backgroundColor: '#FFCA2820', color: '#FFCA28' }}
                >
                  Oczekuje
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        <PlanGrid availabilityByDay={availabilityByDay} extraByDay={extraByDay} />
      </section>

      {/* ═══════════════ Dodatkowe wolne terminy ═══════════════ */}
      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-[18px] font-black text-primary">Dodatkowe wolne terminy</h2>
            <p className="text-[12px] text-dim">
              Dodatkowe godziny poza stałym planem — np. na odrabianie
            </p>
          </div>
          <ExtraSlotForm tutorId={tutorId} rooms={rooms} />
        </div>

        {data.extraSlots.length === 0 ? (
          <p className="text-[12px] italic text-dim">Brak dodatkowych terminów.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.extraSlots.map((s) => (
              <ExtraSlotRow
                key={s.id}
                slotId={s.id}
                date={s.date}
                startTime={s.startTime}
                endTime={s.endTime}
                roomName={s.roomName}
                note={s.note}
                status={s.status}
              />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════ Zgłoszenia nieobecności ═══════════════ */}
      <section>
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-[18px] font-black text-primary">Zgłoszenia nieobecności</h2>
            <p className="text-[12px] text-dim">
              Po zatwierdzeniu przez admina system automatycznie odwoła lekcje w tych terminach
            </p>
          </div>
          <TutorAbsenceForm tutorId={tutorId} />
        </div>

        {data.absences.length === 0 ? (
          <p className="text-[12px] italic text-dim">Brak zgłoszonych nieobecności.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.absences.map((a) => (
              <AbsenceRow key={a.id} absence={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Grid: hours × days × lesson blocks
// ════════════════════════════════════════════════════════════════════════════

function PlanGrid({
  availabilityByDay,
  extraByDay,
}: {
  availabilityByDay: Map<number, GridBlock[]>
  extraByDay: Map<number, GridBlock[]>
}) {
  const gridHeight = HOURS.length * ROW_HEIGHT

  return (
    // Scroll container — przewijanie w pionie (gdy godziny nie mieszczą się na
    // ekranie) i w poziomie (gdy dni nie mieszczą się na wąskim ekranie).
    <div
      className="overflow-auto rounded-card bg-surface"
      style={{ border: '1px solid rgba(59,143,240,0.10)', maxHeight: '65vh' }}
    >
      <div style={{ minWidth: 760 }}>
        {/* Header row */}
        <div
          className="sticky top-0 z-[3] grid border-b border-subtle bg-surface"
          style={{ gridTemplateColumns: `50px repeat(7, 1fr)` }}
        >
          <div className="py-2 text-center text-[10px] font-extrabold text-dim">⏰</div>
          {DAYS.map((d, i) => {
            const avail = availabilityByDay.get(i) ?? []
            const totalH = avail.reduce((s, b) => s + (b.endHour - b.startHour), 0)
            const extraCount = (extraByDay.get(i) ?? []).length
            return (
              <div key={d} className="border-l border-subtle py-2 text-center">
                <div className="text-[11px] font-extrabold text-secondary">{d}</div>
                <div className="flex justify-center gap-1.5">
                  {totalH > 0 && (
                    <span className="text-[9px] font-bold" style={{ color: '#3B8FF0' }}>
                      {Math.round(totalH * 10) / 10}h
                    </span>
                  )}
                  {extraCount > 0 && (
                    <span className="text-[9px] font-extrabold" style={{ color: '#22C55E' }}>
                      +{extraCount}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Body */}
        <div className="grid" style={{ gridTemplateColumns: `50px repeat(7, 1fr)` }}>
          {/* Hour column */}
          <div>
            {HOURS.map((h) => (
              <div
                key={h}
                className="flex items-center justify-center text-[9px] font-bold text-dim"
                style={{ height: ROW_HEIGHT }}
              >
                {h}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {DAYS.map((d, dayIdx) => {
            const avail = availabilityByDay.get(dayIdx) ?? []
            const extra = extraByDay.get(dayIdx) ?? []
            return (
              <div
                key={d}
                className="relative border-l border-subtle"
                style={{ minHeight: gridHeight }}
              >
                {/* Hour gridlines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-subtle"
                    style={{ top: (h - GRID_START_HOUR) * ROW_HEIGHT, height: 1 }}
                  />
                ))}

                {/* Stała dostępność — niebieskie bloki (z lewej połowy kolumny) */}
                {avail.map((b, idx) => {
                  const top = (b.startHour - GRID_START_HOUR) * ROW_HEIGHT
                  const height = (b.endHour - b.startHour) * ROW_HEIGHT - 2
                  if (top < 0 || top >= gridHeight) return null
                  return (
                    <div
                      key={`a-${d}-${idx}`}
                      className="absolute z-[2] overflow-hidden rounded-[6px] px-1.5 py-1"
                      style={{
                        top,
                        left: 2,
                        right: '50%',
                        height,
                        backgroundColor: 'rgba(59,143,240,0.14)',
                        border: '1px solid rgba(59,143,240,0.30)',
                        borderLeft: '3px solid #3B8FF0',
                      }}
                      title={`Dostępność ${b.startTime}–${b.endTime}`}
                    >
                      <p className="truncate text-[8px] font-extrabold leading-tight" style={{ color: '#3B8FF0' }}>
                        {b.startTime}
                      </p>
                    </div>
                  )
                })}

                {/* Extra sloty — zielone bloki (z prawej połowy kolumny), dashed */}
                {extra.map((b, idx) => {
                  const top = (b.startHour - GRID_START_HOUR) * ROW_HEIGHT
                  const height = (b.endHour - b.startHour) * ROW_HEIGHT - 2
                  if (top < 0 || top >= gridHeight) return null
                  return (
                    <div
                      key={`e-${d}-${idx}`}
                      className="absolute z-[2] flex flex-col items-center justify-center overflow-hidden rounded-[6px] px-1 py-1"
                      style={{
                        top,
                        left: '50%',
                        right: 2,
                        height,
                        backgroundColor: 'rgba(34,197,94,0.12)',
                        border: '1.5px dashed rgba(34,197,94,0.55)',
                      }}
                      title={`Dodatkowy termin ${b.label} · ${b.startTime}–${b.endTime}`}
                    >
                      <span className="text-[8px] font-extrabold leading-tight" style={{ color: '#22C55E' }}>
                        ➕ {b.startTime}
                      </span>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Legend({
  color,
  label,
  filled,
  dashed,
  striped,
}: {
  color: string
  label: string
  filled?: boolean
  dashed?: boolean
  striped?: boolean
}) {
  const style: React.CSSProperties = {
    width: 12,
    height: 12,
    borderRadius: 3,
  }
  if (filled) {
    style.backgroundColor = `${color}20`
    style.border = `1px solid ${color}40`
  } else if (dashed) {
    style.backgroundColor = `${color}10`
    style.border = `1.5px dashed ${color}60`
  } else if (striped) {
    style.background = `repeating-linear-gradient(135deg, ${color}10, ${color}10 3px, ${color}25 3px, ${color}25 6px)`
    style.border = `1px solid ${color}25`
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold" style={{ color }}>
      <span aria-hidden style={style} />
      {label}
    </span>
  )
}

function AbsenceRow({ absence }: { absence: TutorAbsenceRow }) {
  const meta = ABSENCE_TYPE_LABELS[absence.type]
  const isApproved = absence.approvedAt !== null

  return (
    <article
      className="flex items-center gap-4 rounded-card bg-surface p-4"
      style={{
        borderLeft: `4px solid ${meta.color}`,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
      }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-[18px]"
        style={{ backgroundColor: `${meta.color}22` }}
      >
        {meta.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-extrabold text-primary">
            {formatPolishDate(absence.startDate)}
            {absence.startDate !== absence.endDate && ` — ${formatPolishDate(absence.endDate)}`}
          </span>
          {absence.startTime && absence.endTime && (
            <span
              className="rounded-md px-2 py-0.5 text-[9px] font-extrabold"
              style={{ backgroundColor: '#3B8FF022', color: '#3B8FF0' }}
            >
              {absence.startTime}–{absence.endTime}
            </span>
          )}
          <span
            className="rounded-md px-2 py-0.5 text-[9px] font-bold"
            style={{ backgroundColor: '#6B678022', color: '#6B6780' }}
          >
            {meta.label}
          </span>
          {absence.isUrgent && (
            <span
              className="rounded-md px-2 py-0.5 text-[9px] font-extrabold"
              style={{ backgroundColor: '#EF444415', color: '#EF4444' }}
            >
              PILNE
            </span>
          )}
        </div>
        {absence.reason && (
          <p className="mt-1 text-[11px] text-secondary">{absence.reason}</p>
        )}
        {absence.affectedLessonsCount !== null && (
          <p className="mt-1 text-[10px] font-bold" style={{ color: '#EF4444' }}>
            Dotyczy {absence.affectedLessonsCount} {absence.affectedLessonsCount === 1 ? 'lekcji' : 'lekcji'}
          </p>
        )}
      </div>
      <span
        className="whitespace-nowrap rounded-md px-3 py-1 text-[10px] font-extrabold"
        style={
          isApproved
            ? { backgroundColor: '#22C55E22', color: '#22C55E' }
            : { backgroundColor: '#FFCA2822', color: '#FFCA28' }
        }
      >
        {isApproved ? '✓ Zatwierdzona' : '⏳ Oczekuje na admina'}
      </span>
    </article>
  )
}
