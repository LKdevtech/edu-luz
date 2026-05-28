import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import { DAY_NAMES_SHORT, LEVEL_LABELS } from '@/lib/queries/_helpers'
import {
  getAdminTutors,
  getTutorMonthlyHours,
  type AdminTutorRow,
} from '@/lib/queries/admin'
import type { Database, Enums } from '@/lib/types/database.types'

type Supabase = SupabaseClient<Database>

// ════════════════════════════════════════════════════════════════════════════
// Typy danych dla karty korepetytora (mapowane z bazy, zgodne z mockupem)
// ════════════════════════════════════════════════════════════════════════════

export type TutorStudentEntry = {
  name: string
  subject: string
  level: Enums<'student_level'>
  levelLabel: string
  type: 'indyw.' | 'grupa'
  hours: string
}

export type TutorAbsenceEntry = {
  type: Enums<'tutor_absence_type'>
  dates: string
  days: number
  lessonsAffected: number
  status: 'resolved' | 'active' | 'approved'
}

export type TutorMonthlySettlement = {
  monthLabel: string // "Czerwiec"
  planned: number
  done: number
  cancelled: number
  noShow: number
  individualHours: number
  groupHours: number
  payout: number
}

export type AdminTutorEnriched = AdminTutorRow & {
  studentsIndiv: number
  groupsCount: number
  groupStudents: number
  hasUpcomingAbsence: TutorAbsenceEntry | null
  isAbsentNow: boolean
  students: TutorStudentEntry[]
  absences: TutorAbsenceEntry[]
  settlement: TutorMonthlySettlement | null
}

export type AdminTutorsEnrichedData = {
  tutors: AdminTutorEnriched[]
  subjects: Array<{ id: string; name: string; color: string }>
}

// ── helpers ──

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

function daysBetween(startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1)
}

type ClassRow = {
  id: string
  form: Enums<'class_form'>
  level: Enums<'student_level'>
  student_id: string | null
  group_id: string | null
  subject: { name: string } | null
  student: { profile: { first_name: string; last_name: string } } | null
  group: { name: string } | null
  slots: Array<{ day_of_week: number; start_time: string; active_to: string | null }>
}

type AbsenceRow = {
  absence_type: Enums<'tutor_absence_type'>
  affected_lessons_count: number | null
  approved_at: string | null
  start_date: string
  end_date: string
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getAdminTutorsEnriched
// Łączy getAdminTutors (źródło prawdy) z dodatkowymi zapytaniami potrzebnymi
// do wizualnego odwzorowania mockupu (lista uczniów, nieobecności, rozliczenie).
// ════════════════════════════════════════════════════════════════════════════

export async function getAdminTutorsEnriched(
  supabase: Supabase,
): Promise<AdminTutorsEnrichedData> {
  const base = await getAdminTutors(supabase)
  const tutorIds = base.tutors.map((t) => t.id)

  if (tutorIds.length === 0) {
    return { tutors: [], subjects: base.subjects }
  }

  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // Aktywne zajęcia wszystkich korepetytorów + sloty (do listy uczniów / godzin)
  const [classesQ, absencesQ, settlements] = await Promise.all([
    supabase
      .from('classes')
      .select(
        `
          id, form, level, student_id, group_id, tutor_id,
          subject:subjects!classes_subject_id_fkey ( name ),
          student:students!classes_student_id_fkey (
            profile:profiles!students_profile_id_fkey ( first_name, last_name )
          ),
          group:groups!classes_group_id_fkey ( name ),
          slots:weekly_slots!weekly_slots_class_id_fkey ( day_of_week, start_time, active_to )
        `,
      )
      .in('tutor_id', tutorIds)
      .eq('status', 'active'),
    supabase
      .from('tutor_absences')
      .select('tutor_id, absence_type, affected_lessons_count, approved_at, start_date, end_date')
      .in('tutor_id', tutorIds)
      .gte('end_date', firstDayOfMonth(now)),
    // Rozliczenie miesięczne per tutor (godziny + statusy) — używa getTutorMonthlyHours
    Promise.all(
      base.tutors.map((t) => getTutorMonthlyHours(supabase, t.id, year, month)),
    ),
  ])

  if (classesQ.error) throw classesQ.error
  if (absencesQ.error) throw absencesQ.error

  // group classes → grupuj po tutor_id
  const classesByTutor = new Map<string, ClassRow[]>()
  for (const row of (classesQ.data ?? []) as unknown as Array<ClassRow & { tutor_id: string }>) {
    const list = classesByTutor.get(row.tutor_id) ?? []
    list.push(row)
    classesByTutor.set(row.tutor_id, list)
  }

  const absencesByTutor = new Map<string, AbsenceRow[]>()
  for (const row of (absencesQ.data ?? []) as Array<AbsenceRow & { tutor_id: string }>) {
    const list = absencesByTutor.get(row.tutor_id) ?? []
    list.push(row)
    absencesByTutor.set(row.tutor_id, list)
  }

  const settlementByTutor = new Map<string, (typeof settlements)[number]>()
  for (const s of settlements) settlementByTutor.set(s.tutorId, s)

  const tutors: AdminTutorEnriched[] = base.tutors.map((t) => {
    const classes = classesByTutor.get(t.id) ?? []

    // Lista uczniów / grup
    const students: TutorStudentEntry[] = classes.map((c) => {
      const name = c.group
        ? c.group.name
        : c.student
          ? `${c.student.profile.first_name} ${c.student.profile.last_name}`
          : '—'
      const activeSlots = c.slots.filter((s) => s.active_to === null)
      const hours = activeSlots
        .map((s) => `${DAY_NAMES_SHORT[s.day_of_week] ?? ''} ${s.start_time.slice(0, 5)}`)
        .join(', ')
      return {
        name,
        subject: c.subject?.name ?? '—',
        level: c.level,
        levelLabel: LEVEL_LABELS[c.level],
        type: c.group ? ('grupa' as const) : ('indyw.' as const),
        hours,
      }
    })
    const groupClasses = classes.filter((c) => c.form === 'group')
    const studentsIndiv = classes.filter((c) => c.form !== 'group').length

    // Nieobecności
    const rawAbs = absencesByTutor.get(t.id) ?? []
    const absences: TutorAbsenceEntry[] = rawAbs.map((a) => {
      let status: TutorAbsenceEntry['status'] = 'approved'
      if (a.end_date < today) status = 'resolved'
      else if (a.start_date <= today && a.end_date >= today) status = 'active'
      else if (a.approved_at) status = 'approved'
      return {
        type: a.absence_type,
        dates: `${formatShortDate(a.start_date)}–${formatShortDate(a.end_date)}`,
        days: daysBetween(a.start_date, a.end_date),
        lessonsAffected: a.affected_lessons_count ?? 0,
        status,
      }
    })
    const upcoming = rawAbs.find((a) => a.start_date > today)
    const hasUpcomingAbsence: TutorAbsenceEntry | null = upcoming
      ? {
          type: upcoming.absence_type,
          dates: `${formatShortDate(upcoming.start_date)}–${formatShortDate(upcoming.end_date)}`,
          days: daysBetween(upcoming.start_date, upcoming.end_date),
          lessonsAffected: upcoming.affected_lessons_count ?? 0,
          status: 'approved',
        }
      : null
    const isAbsentNow = rawAbs.some((a) => a.start_date <= today && a.end_date >= today)

    // Rozliczenie miesięczne z godzin
    const mh = settlementByTutor.get(t.id)
    let settlement: TutorMonthlySettlement | null = null
    if (mh) {
      let planned = 0
      let done = 0
      let cancelled = 0
      let noShow = 0
      let individualHours = 0
      let groupHours = 0
      for (const day of mh.days) {
        for (const det of day.details) {
          if (det.status === 'completed' || det.status === 'completed_no_entry' || det.status === 'makeup') {
            done += 1
          } else if (det.status === 'planned' || det.status === 'in_progress') {
            planned += 1
          } else if (det.status === 'cancelled') {
            cancelled += 1
          } else if (det.status === 'no_show') {
            noShow += 1
          }
        }
      }
      // Godziny indyw./grupowe: rozdzielamy po formie zajęć korepetytora.
      // getTutorMonthlyHours nie zwraca formy per lekcja, więc dla uproszczenia
      // przypisujemy wszystkie naliczone godziny do stawki indywidualnej, chyba
      // że korepetytor prowadzi wyłącznie grupy.
      const onlyGroups = classes.length > 0 && studentsIndiv === 0
      if (onlyGroups) groupHours = round1(mh.totalHours)
      else individualHours = round1(mh.totalHours)

      const rate = t.currentRate
      const payout = rate
        ? Math.round(individualHours * rate.individual + groupHours * rate.group)
        : 0

      settlement = {
        monthLabel: mh.monthLabel.split(' ')[0] ?? mh.monthLabel,
        planned,
        done,
        cancelled,
        noShow,
        individualHours,
        groupHours,
        payout,
      }
    }

    return {
      ...t,
      studentsIndiv,
      groupsCount: groupClasses.length,
      groupStudents: Math.max(0, t.studentCount - studentsIndiv),
      hasUpcomingAbsence,
      isAbsentNow,
      students,
      absences,
      settlement,
    }
  })

  return { tutors, subjects: base.subjects }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

function firstDayOfMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
