import { getCurrentTutorId } from '@/lib/auth/getCurrentTutorId'
import { ExtraSlotForm } from '@/lib/components/panel/ExtraSlotForm'
import { ExtraSlotRow } from '@/lib/components/panel/ExtraSlotRow'
import { TutorAbsenceForm } from '@/lib/components/panel/TutorAbsenceForm'
import { getTutorAvailability, type AvailabilityBlock, type TutorAbsenceRow } from '@/lib/queries/tutor'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Enums } from '@/lib/types/database.types'
import { formatPolishDate } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

const ABSENCE_TYPE_LABELS: Record<Enums<'tutor_absence_type'>, { label: string; color: string }> = {
  sick: { label: '🤒 Choroba', color: '#EF4444' },
  vacation: { label: '🌴 Urlop', color: '#FFCA28' },
  other: { label: '📅 Inne', color: '#7C5CFC' },
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

  // Pogrupuj baseline blocks po dniu
  const byDay = new Map<number, AvailabilityBlock[]>()
  for (const b of data.baseline) {
    const arr = byDay.get(b.dayOfWeek) ?? []
    arr.push(b)
    byDay.set(b.dayOfWeek, arr)
  }
  const sortedDays = Array.from(byDay.keys()).sort()

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <header className="mb-5">
        <h1 className="text-[20px] font-black text-primary">Dostępność i plan</h1>
        <p className="text-[12px] text-dim">
          Stały plan zatwierdza admin. Dodatkowe terminy i nieobecności możesz zarządzać sam.
        </p>
      </header>

      {/* Stały plan */}
      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-black text-primary">Stały plan zajęć</h2>
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider"
              style={{ backgroundColor: '#22C55E22', color: '#22C55E' }}
            >
              🔒 Zatwierdzony
            </span>
          </div>
          <span className="text-[11px] font-bold text-dim">
            {data.totalWeeklyHours}h / tydzień
          </span>
        </div>

        {data.baseline.length === 0 ? (
          <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">
            Brak ustalonego planu. Skontaktuj się z administratorem.
          </div>
        ) : (
          <div className="rounded-card bg-surface p-4" style={{ border: '1px solid rgba(59,143,240,0.10)' }}>
            <div className="grid gap-3 md:grid-cols-2">
              {sortedDays.map((day) => (
                <div key={day}>
                  <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-dim">
                    {byDay.get(day)![0]!.dayFull}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {byDay.get(day)!.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center gap-3 rounded-[10px] bg-alt px-3 py-2"
                        style={{ borderLeft: '3px solid #3B8FF0' }}
                      >
                        <span className="text-[13px] font-bold text-primary">
                          {b.startTime}–{b.endTime}
                        </span>
                        <span className="text-[10px] text-dim">
                          ({computeMinutes(b.startTime, b.endTime) / 60}h)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="mt-2 text-[10px] italic text-dim">
          Zmiana stałego planu wymaga kontaktu z administratorem.
        </p>
      </section>

      {/* Dodatkowe terminy */}
      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[18px] font-black text-primary">Dodatkowe wolne terminy</h2>
            <p className="text-[11px] text-dim">
              Dodatkowe godziny poza stałym planem — np. do propozycji odrabiania
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

      {/* Nieobecności */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[18px] font-black text-primary">Zgłoszenia nieobecności</h2>
            <p className="text-[11px] text-dim">
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

function AbsenceRow({ absence }: { absence: TutorAbsenceRow }) {
  const meta = ABSENCE_TYPE_LABELS[absence.type]
  const isApproved = absence.approvedAt !== null

  return (
    <article
      className="flex items-start gap-4 rounded-card bg-surface p-3"
      style={{ borderLeft: `3px solid ${meta.color}` }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[16px]"
        style={{ backgroundColor: `${meta.color}22` }}
      >
        {meta.label.split(' ')[0]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold"
            style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
          >
            {meta.label}
          </span>
          <span className="text-[13px] font-bold text-primary">
            {formatPolishDate(absence.startDate)}
            {absence.startDate !== absence.endDate && ` → ${formatPolishDate(absence.endDate)}`}
          </span>
          {isApproved ? (
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase"
              style={{ backgroundColor: '#22C55E22', color: '#22C55E' }}
            >
              ✓ Zatwierdzona
            </span>
          ) : (
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase"
              style={{ backgroundColor: '#FFCA2822', color: '#FFCA28' }}
            >
              ⏳ Oczekuje na admina
            </span>
          )}
        </div>
        {absence.reason && (
          <div className="mt-1 text-[11px] text-secondary">{absence.reason}</div>
        )}
        {absence.affectedLessonsCount !== null && (
          <div className="mt-0.5 text-[10px] text-dim">
            Dotknięte lekcje: {absence.affectedLessonsCount}
          </div>
        )}
      </div>
    </article>
  )
}

function computeMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return eh! * 60 + em! - (sh! * 60 + sm!)
}
