import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/types/database.types'

// Generator lekcji: na podstawie weekly_slots tworzy konkretne wystąpienia
// w tabeli `lessons` na wybrany tydzień (poniedziałek–niedziela).
//
// UWAGA do schematu:
//   • lesson_status NIE ma 'scheduled' — nowe lekcje dostają status 'planned'.
//   • nieobecność = tutor_absences.approved_at IS NOT NULL (brak kolumny is_approved).
//   • day_of_week: 0 = poniedziałek … 6 = niedziela (sekcja 3 migracji 0005/0008),
//     więc weekStart (poniedziałek) + day_of_week = data slotu.

type Supabase = SupabaseClient<Database>
type LessonInsert = Database['public']['Tables']['lessons']['Insert']

export type GenerateLessonsReport = {
  weekStart: string
  weekEnd: string
  created: number
  skippedDuplicate: number
  skippedAbsence: number
  createdLessonIds: string[]
}

type SlotRow = {
  id: string
  class_id: string
  day_of_week: number
  start_time: string
  end_time: string
  room_id: string | null
  active_from: string
  active_to: string | null
  class: {
    tutor_id: string
    subject_id: string
    room_id: string | null
    status: string
  } | null
}

type AbsenceRow = {
  tutor_id: string
  start_date: string
  end_date: string
  start_time: string | null
  end_time: string | null
}

/** Dodaje N dni do daty 'YYYY-MM-DD' (liczone w UTC, bez wpływu strefy). */
function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Czy nieobecność (zatwierdzona) pokrywa slot w danym dniu i przedziale godzin. */
function absenceCoversSlot(
  absence: AbsenceRow,
  date: string,
  slotStart: string,
  slotEnd: string,
): boolean {
  if (date < absence.start_date || date > absence.end_date) return false
  // Nieobecność częściowa (z godzinami) — wymagamy nakładania się przedziałów.
  if (absence.start_time && absence.end_time) {
    return slotStart < absence.end_time && slotEnd > absence.start_time
  }
  // Cały dzień.
  return true
}

export async function generateLessonsForWeek(
  supabase: Supabase,
  weekStartDate: string,
): Promise<GenerateLessonsReport> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStartDate)) {
    throw new Error(`Niepoprawny weekStartDate: "${weekStartDate}" (oczekiwano YYYY-MM-DD).`)
  }
  const weekStart = weekStartDate
  const weekEnd = addDaysISO(weekStart, 6)

  // 1. Aktywne sloty, których zakres aktywności pokrywa tydzień.
  const { data: slotData, error: slotErr } = await supabase
    .from('weekly_slots')
    .select(
      `
        id, class_id, day_of_week, start_time, end_time, room_id, active_from, active_to,
        class:classes!weekly_slots_class_id_fkey ( tutor_id, subject_id, room_id, status )
      `,
    )
    .lte('active_from', weekEnd)
    .or(`active_to.is.null,active_to.gte.${weekStart}`)
  if (slotErr) throw slotErr

  const slots = ((slotData ?? []) as unknown as SlotRow[]).filter(
    (s) => s.class !== null && s.class.status === 'active',
  )

  if (slots.length === 0) {
    return { weekStart, weekEnd, created: 0, skippedDuplicate: 0, skippedAbsence: 0, createdLessonIds: [] }
  }

  const classIds = Array.from(new Set(slots.map((s) => s.class_id)))
  const tutorIds = Array.from(new Set(slots.map((s) => s.class!.tutor_id)))

  // 2. Istniejące lekcje w tygodniu (deduplikacja po class_id|data|start_time).
  const { data: existing, error: existErr } = await supabase
    .from('lessons')
    .select('class_id, lesson_date, start_time')
    .in('class_id', classIds)
    .gte('lesson_date', weekStart)
    .lte('lesson_date', weekEnd)
  if (existErr) throw existErr

  const existingKeys = new Set(
    (existing ?? []).map((e) => `${e.class_id}|${e.lesson_date}|${e.start_time}`),
  )

  // 3. Zatwierdzone nieobecności korepetytorów nakładające się na tydzień.
  const { data: absenceData, error: absErr } = await supabase
    .from('tutor_absences')
    .select('tutor_id, start_date, end_date, start_time, end_time')
    .not('approved_at', 'is', null)
    .in('tutor_id', tutorIds)
    .lte('start_date', weekEnd)
    .gte('end_date', weekStart)
  if (absErr) throw absErr

  const absencesByTutor = new Map<string, AbsenceRow[]>()
  for (const a of (absenceData ?? []) as AbsenceRow[]) {
    const list = absencesByTutor.get(a.tutor_id) ?? []
    list.push(a)
    absencesByTutor.set(a.tutor_id, list)
  }

  // 4. Dla każdego slotu policz datę i zdecyduj: utwórz / duplikat / nieobecność.
  const toInsert: LessonInsert[] = []
  let skippedDuplicate = 0
  let skippedAbsence = 0

  for (const slot of slots) {
    const cls = slot.class!
    const date = addDaysISO(weekStart, slot.day_of_week)
    const key = `${slot.class_id}|${date}|${slot.start_time}`

    if (existingKeys.has(key)) {
      skippedDuplicate += 1
      continue
    }

    const tutorAbsences = absencesByTutor.get(cls.tutor_id) ?? []
    const blocked = tutorAbsences.some((a) =>
      absenceCoversSlot(a, date, slot.start_time, slot.end_time),
    )
    if (blocked) {
      skippedAbsence += 1
      continue
    }

    existingKeys.add(key) // zapobiega duplikatom w obrębie tej samej partii
    toInsert.push({
      class_id: slot.class_id,
      tutor_id: cls.tutor_id,
      subject_id: cls.subject_id,
      room_id: slot.room_id ?? cls.room_id ?? null,
      lesson_date: date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      status: 'planned',
      weekly_slot_id: slot.id,
    })
  }

  let createdLessonIds: string[] = []
  if (toInsert.length > 0) {
    const { data: inserted, error: insErr } = await supabase
      .from('lessons')
      .insert(toInsert)
      .select('id')
    if (insErr) throw insErr
    createdLessonIds = (inserted ?? []).map((r) => r.id)
  }

  return {
    weekStart,
    weekEnd,
    created: createdLessonIds.length,
    skippedDuplicate,
    skippedAbsence,
    createdLessonIds,
  }
}
