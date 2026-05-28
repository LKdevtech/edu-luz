import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database, Enums } from '@/lib/types/database.types'

import {
  DAY_NAMES_FULL,
  DAY_NAMES_SHORT,
  LEVEL_LABELS,
  getAvatarColor,
  getInitials,
} from './_helpers'

type Supabase = SupabaseClient<Database>

// ════════════════════════════════════════════════════════════════════════════
// PDF/rejestr-godzin — kluczowa logika rozliczania tutorów
// ════════════════════════════════════════════════════════════════════════════

/**
 * Polityka rozliczania godzin (sekcja "Eksport Rejestr godzin"):
 *   - completed / completed_no_entry  → 100% czasu
 *   - makeup (completed)               → 100% czasu (odrobienie zaliczone)
 *   - cancelled, cancelled_more_than_24h=false  → 50% (krótki termin)
 *   - cancelled, cancelled_more_than_24h=true   → 0%  (anulowane z wyprzedzeniem)
 *   - no_show                          → 50% (uczeń nie przyszedł)
 *   - planned / in_progress            → 0%  (nie liczy się jeszcze)
 *
 * Mnożniki czasu trwania trzymamy zgodne z mockupem: 45 min = 0.75h, 60 = 1h, 90 = 1.5h, 120 = 2h.
 */
export type RegistryDayEntry = {
  day: number // 1..31
  hours: number // np. 0.75, 1, 1.5
  details: Array<{
    lessonId: string
    studentLabel: string
    subjectName: string
    durationMin: number
    multiplier: 0 | 0.5 | 1
    chargedHours: number
    status: Enums<'lesson_status'>
  }>
}

export type TutorMonthlyHours = {
  tutorId: string
  tutorFullName: string
  year: number
  month: number // 1..12
  monthLabel: string
  daysInMonth: number
  totalHours: number
  days: RegistryDayEntry[]
}

function calcMultiplier(
  status: Enums<'lesson_status'>,
  cancelledMoreThan24h: boolean | null,
): 0 | 0.5 | 1 {
  if (status === 'completed' || status === 'completed_no_entry' || status === 'makeup') return 1
  if (status === 'no_show') return 0.5
  if (status === 'cancelled') return cancelledMoreThan24h ? 0 : 0.5
  return 0
}

export async function getTutorMonthlyHours(
  supabase: Supabase,
  tutorId: string,
  year: number,
  month: number,
): Promise<TutorMonthlyHours> {
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const [tutorRow, lessonsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', tutorId)
      .single(),
    supabase
      .from('lessons')
      .select(
        `
          id,
          lesson_date,
          start_time,
          end_time,
          status,
          cancelled_more_than_24h,
          class:classes!lessons_class_id_fkey (
            form,
            student:students!classes_student_id_fkey (
              profile:profiles!students_profile_id_fkey ( first_name, last_name )
            ),
            group:groups!classes_group_id_fkey ( name )
          ),
          subject:subjects!lessons_subject_id_fkey ( name )
        `,
      )
      .eq('tutor_id', tutorId)
      .gte('lesson_date', monthStart)
      .lte('lesson_date', monthEnd)
      .order('lesson_date')
      .order('start_time'),
  ])
  if (tutorRow.error) throw tutorRow.error
  if (lessonsResult.error) throw lessonsResult.error

  type LRow = {
    id: string
    lesson_date: string
    start_time: string
    end_time: string
    status: Enums<'lesson_status'>
    cancelled_more_than_24h: boolean | null
    class: {
      form: Enums<'class_form'>
      student: { profile: { first_name: string; last_name: string } } | null
      group: { name: string } | null
    }
    subject: { name: string }
  }
  const rows = (lessonsResult.data ?? []) as unknown as LRow[]

  const byDay = new Map<number, RegistryDayEntry>()
  for (let d = 1; d <= lastDay; d++) {
    byDay.set(d, { day: d, hours: 0, details: [] })
  }

  for (const r of rows) {
    const day = new Date(r.lesson_date).getDate()
    const [sh, sm] = r.start_time.split(':').map(Number)
    const [eh, em] = r.end_time.split(':').map(Number)
    const durationMin = eh! * 60 + em! - (sh! * 60 + sm!)
    const mult = calcMultiplier(r.status, r.cancelled_more_than_24h)
    const charged = (durationMin / 60) * mult
    const studentLabel = r.class.group
      ? r.class.group.name
      : r.class.student
        ? `${r.class.student.profile.first_name} ${r.class.student.profile.last_name}`
        : '—'

    const entry = byDay.get(day)!
    entry.hours += charged
    entry.details.push({
      lessonId: r.id,
      studentLabel,
      subjectName: r.subject.name,
      durationMin,
      multiplier: mult,
      chargedHours: charged,
      status: r.status,
    })
  }

  const days = Array.from(byDay.values())
  const totalHours = days.reduce((sum, d) => sum + d.hours, 0)
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('pl-PL', {
    month: 'long',
    year: 'numeric',
  })

  return {
    tutorId,
    tutorFullName: `${tutorRow.data!.first_name} ${tutorRow.data!.last_name}`,
    year,
    month,
    monthLabel,
    daysInMonth: lastDay,
    totalHours,
    days,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Shared shapes
// ════════════════════════════════════════════════════════════════════════════

export type AdminTutorRow = {
  id: string
  fullName: string
  initials: string
  avatarColor: string
  phone: string | null
  email: string | null
  subjects: string[]
  studentCount: number
  lessonsPerWeek: number
  currentRate: {
    individual: number
    group: number
    effectiveFrom: string
  } | null
  isActive: boolean
  bio: string | null
}

export type AdminStudentRow = {
  id: string
  fullName: string
  initials: string
  avatarColor: string
  schoolClass: string
  level: Enums<'student_level'>
  levelLabel: string
  birthDate: string
  parentId: string
  parentName: string
  parentPhone: string | null
  parentEmail: string | null
  classes: Array<{
    classId: string
    form: Enums<'class_form'>
    subjectName: string
    subjectColor: string
    tutorName: string
    monthlyFee: number
    groupName: string | null
  }>
  totalMonthly: number
  /** Status płatności bieżącego miesiąca (najnowsza płatność rodzica). */
  payStatus: Enums<'payment_status'> | null
  /** Liczba opóźnień rodzica (max delay_number z płatności). */
  lateCount: number
  /** Najwcześniejsza data startu zajęć ucznia (początek umowy). */
  contractStart: string | null
}

export type AdminGroupRow = {
  id: string
  name: string
  subjectName: string
  subjectColor: string
  level: Enums<'student_level'>
  levelLabel: string
  tutorId: string
  tutorName: string
  maxSize: number
  monthlyFeePerStudent: number
  status: string
  classId: string | null
  weeklySlots: Array<{ dayShort: string; startTime: string; endTime: string; roomName: string | null }>
  members: Array<{
    id: string
    fullName: string
    initials: string
    schoolClass: string
    parentName: string | null
  }>
}

// ════════════════════════════════════════════════════════════════════════════
// Common loaders
// ════════════════════════════════════════════════════════════════════════════

async function loadCurrentRate(
  supabase: Supabase,
  tutorId: string,
): Promise<AdminTutorRow['currentRate']> {
  const today = new Date().toISOString().slice(0, 10)
  const { data } = await supabase
    .from('tutor_rates')
    .select('individual_rate, group_rate, effective_from')
    .eq('tutor_id', tutorId)
    .lte('effective_from', today)
    .order('effective_from', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data) return null
  return {
    individual: Number(data.individual_rate),
    group: Number(data.group_rate),
    effectiveFrom: data.effective_from,
  }
}

async function loadAllTutors(supabase: Supabase): Promise<AdminTutorRow[]> {
  const { data, error } = await supabase
    .from('tutors')
    .select(
      `
        profile_id,
        bio,
        profile:profiles!tutors_profile_id_fkey ( first_name, last_name, is_active, phone, email ),
        subjects:tutor_subjects!tutor_subjects_tutor_id_fkey (
          subject:subjects!tutor_subjects_subject_id_fkey ( name )
        )
      `,
    )
  if (error) throw error

  type TRow = {
    profile_id: string
    bio: string | null
    profile: { first_name: string; last_name: string; is_active: boolean; phone: string | null; email: string | null }
    subjects: Array<{ subject: { name: string } }>
  }
  const rows = (data ?? []) as unknown as TRow[]

  const result: AdminTutorRow[] = []
  for (const t of rows) {
    const fullName = `${t.profile.first_name} ${t.profile.last_name}`

    // Statystyki: liczba uczniów (distinct students z active classes) i lekcji/tydzień
    const [classesQ, slotsQ, rate] = await Promise.all([
      supabase
        .from('classes')
        .select('id, student_id, group_id')
        .eq('tutor_id', t.profile_id)
        .eq('status', 'active'),
      supabase
        .from('weekly_slots')
        .select('class_id, classes!inner(tutor_id, status)', { count: 'exact', head: true })
        .eq('classes.tutor_id', t.profile_id)
        .eq('classes.status', 'active')
        .is('active_to', null),
      loadCurrentRate(supabase, t.profile_id),
    ])

    if (classesQ.error) throw classesQ.error

    const studentSet = new Set<string>()
    const groupIds: string[] = []
    for (const c of classesQ.data ?? []) {
      if (c.student_id) studentSet.add(c.student_id)
      if (c.group_id) groupIds.push(c.group_id)
    }
    if (groupIds.length > 0) {
      const { data: members } = await supabase
        .from('group_members')
        .select('student_id')
        .in('group_id', groupIds)
        .is('left_at', null)
      for (const m of members ?? []) studentSet.add(m.student_id)
    }

    result.push({
      id: t.profile_id,
      fullName,
      initials: getInitials(t.profile.first_name, t.profile.last_name),
      avatarColor: getAvatarColor(fullName),
      phone: t.profile.phone,
      email: t.profile.email,
      subjects: t.subjects.map((s) => s.subject.name),
      studentCount: studentSet.size,
      lessonsPerWeek: slotsQ.count ?? 0,
      currentRate: rate,
      isActive: t.profile.is_active,
      bio: t.bio,
    })
  }

  return result
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getAdminDashboard
// ════════════════════════════════════════════════════════════════════════════

export type AdminAlert = {
  type: 'absence' | 'plan' | 'entry' | 'makeup'
  icon: string
  color: string
  title: string
  desc: string
  time: string
  lessons?: Array<{ time: string; student: string; subject: string; room: string }>
  note?: string | null
  message?: string | null
  affected?: string | null
  entries?: Array<{ tutor: string; date: string; student: string; overdue: string }>
  items?: Array<{ student: string; tutor: string; proposed: string; waiting: string }>
  /** Absence alert: id rekordu tutor_absences do zatwierdzenia. */
  absenceId?: string
  /** Makeup alert: profile_id korepetytorów do których wysłać przypomnienie. */
  reminderTutorIds?: string[]
}

export type AdminTodayTutor = {
  name: string
  initials: string
  subjects: string[]
  lessons: number
  done: number
  current: string | null
  room: string | null
}

export type AdminRoomNow = {
  name: string
  status: 'free' | 'occupied'
  tutor: string | null
  until: string | null
  next: string | null
}

export type AdminDashboardData = {
  todayLessons: {
    total: number
    inProgress: number
    completed: number
    cancelled: number
  }
  studentsActive: number
  studentsIndividual: number
  studentsInGroups: number
  groupsActive: number
  tutorsPresent: number
  tutorsTotal: number
  absentTutors: Array<{ absenceId: string; name: string; initials: string; reason: string; affectedLessons: number }>
  monthLabel: string
  monthRevenue: number
  monthRealized: number
  monthPlanned: number
  monthCancelled: number
  monthNoShow: number
  monthTotal: number
  finance: {
    revenueCollected: number
    revenueExpected: number
    tutorCostsPlanned: number
    tutorCostsActual: number
  }
  alerts: {
    pendingAbsences: number
    blockedEntries: number
    overduePayments: number
    pendingMakeups: number
  }
  alertsDetailed: AdminAlert[]
  todayByTutor: AdminTodayTutor[]
  roomsNow: AdminRoomNow[]
  todaySchedule: Array<{
    lessonId: string
    startTime: string
    endTime: string
    tutorName: string
    studentLabel: string
    subjectName: string
    subjectColor: string
    roomName: string | null
    status: Enums<'lesson_status'>
  }>
  pendingPayments: Array<{
    paymentId: string
    parentId: string
    parentName: string
    childrenNames: string
    subjects: string
    amount: number
    delayNumber: number
    status: Enums<'payment_status'>
  }>
}

export async function getAdminDashboard(supabase: Supabase): Promise<AdminDashboardData> {
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = today.slice(0, 8) + '01'
  const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10)

  const monthLabel = new Date(today).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })

  const [
    todayLessonsQ,
    monthLessonsQ,
    monthPaymentsQ,
    studentsQ,
    tutorsQ,
    absencesQ,
    overdueEntriesQ,
    pendingMakeupQ,
    todayScheduleQ,
    pendingPaymentsQ,
    groupsActiveQ,
    groupMembersQ,
    absencesTodayQ,
    tutorRatesQ,
    blockedEntriesListQ,
    stalledMakeupQ,
    planChangeQ,
    roomsAllQ,
  ] = await Promise.all([
    supabase
      .from('lessons')
      .select('id, status')
      .eq('lesson_date', today),
    supabase
      .from('lessons')
      .select('id, status, duration_minutes, tutor_id, class:classes!lessons_class_id_fkey ( form )')
      .gte('lesson_date', monthStart)
      .lte('lesson_date', monthEnd),
    supabase
      .from('payments')
      .select('total_amount, paid_amount, status')
      .eq('billing_month', monthStart),
    supabase.from('students').select('profile_id', { count: 'exact', head: true }),
    supabase
      .from('tutors')
      .select('profile_id, profile:profiles!tutors_profile_id_fkey ( is_active )'),
    supabase
      .from('tutor_absences')
      .select('id', { count: 'exact', head: true })
      .is('approved_at', null),
    supabase
      .from('lessons')
      .select('id', { count: 'exact', head: true })
      .in('status', ['completed', 'completed_no_entry'])
      .lt('lesson_date', today)
      .gte('lesson_date', new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10)),
    supabase
      .from('makeup_requests')
      .select('id', { count: 'exact', head: true })
      .in('status', ['waiting_for_parent', 'waiting_for_tutor']),
    supabase
      .from('lessons')
      .select(
        `
          id, start_time, end_time, status, tutor_id,
          tutor:tutors!lessons_tutor_id_fkey (
            profile:profiles!tutors_profile_id_fkey ( first_name, last_name )
          ),
          subject:subjects!lessons_subject_id_fkey ( name, color ),
          room:rooms!lessons_room_id_fkey ( name ),
          class:classes!lessons_class_id_fkey (
            student:students!classes_student_id_fkey (
              profile:profiles!students_profile_id_fkey ( first_name, last_name )
            ),
            group:groups!classes_group_id_fkey ( name )
          )
        `,
      )
      .eq('lesson_date', today)
      .order('start_time'),
    supabase
      .from('payments')
      .select(
        `
          id, total_amount, status, delay_number,
          parent:parents!payments_parent_id_fkey (
            profile_id,
            profile:profiles!parents_profile_id_fkey ( first_name, last_name )
          ),
          lines:payment_lines!payment_lines_payment_id_fkey (
            description,
            student:students!payment_lines_student_id_fkey (
              profile:profiles!students_profile_id_fkey ( first_name, last_name )
            )
          )
        `,
      )
      .in('status', ['pending', 'overdue'])
      .order('billing_month', { ascending: false })
      .limit(20),
    // groupsActiveQ
    supabase.from('groups').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    // groupMembersQ — aktywni członkowie grup (distinct student count liczony w JS)
    supabase.from('group_members').select('student_id').is('left_at', null),
    // absencesTodayQ — zatwierdzone nieobecności obejmujące dziś, z nazwą tutora + affected
    supabase
      .from('tutor_absences')
      .select(
        `
          id, affected_lessons_count, reason, absence_type, start_date, end_date,
          tutor:tutors!tutor_absences_tutor_id_fkey (
            profile:profiles!tutors_profile_id_fkey ( first_name, last_name )
          )
        `,
      )
      .lte('start_date', today)
      .gte('end_date', today),
    // tutorRatesQ — najnowsze stawki per tutor
    supabase
      .from('tutor_rates')
      .select('tutor_id, individual_rate, group_rate, effective_from')
      .order('effective_from', { ascending: false }),
    // blockedEntriesListQ — completed_no_entry > 48h (lista do alertu)
    supabase
      .from('lessons')
      .select(
        `
          lesson_date, end_time,
          tutor:tutors!lessons_tutor_id_fkey ( profile:profiles!tutors_profile_id_fkey ( first_name, last_name ) ),
          subject:subjects!lessons_subject_id_fkey ( name ),
          class:classes!lessons_class_id_fkey (
            student:students!classes_student_id_fkey ( profile:profiles!students_profile_id_fkey ( first_name, last_name ) ),
            group:groups!classes_group_id_fkey ( name )
          )
        `,
      )
      .eq('status', 'completed_no_entry')
      .lt('lesson_date', today)
      .order('lesson_date', { ascending: false }),
    // stalledMakeupQ — propozycje rodziców czekające na tutora (waiting_for_tutor)
    supabase
      .from('makeup_requests')
      .select(
        `
          updated_at,
          original_lesson:lessons!makeup_requests_original_lesson_id_fkey (
            tutor:tutors!lessons_tutor_id_fkey ( profile_id, profile:profiles!tutors_profile_id_fkey ( first_name, last_name ) ),
            class:classes!lessons_class_id_fkey (
              student:students!classes_student_id_fkey ( profile:profiles!students_profile_id_fkey ( first_name, last_name ) ),
              group:groups!classes_group_id_fkey ( name )
            )
          ),
          proposals:makeup_proposals!makeup_proposals_request_id_fkey ( proposed_date, proposed_start, created_at, proposed_by )
        `,
      )
      .eq('status', 'waiting_for_tutor'),
    // planChangeQ — prośby o zmianę planu (direct_messages od tutorów do admina)
    supabase
      .from('direct_messages')
      .select(
        `
          body, sent_at,
          sender:profiles!direct_messages_sender_id_fkey ( first_name, last_name )
        `,
      )
      .eq('subject', 'Prośba o zmianę planu')
      .order('sent_at', { ascending: false })
      .limit(5),
    // roomsAllQ
    supabase.from('rooms').select('id, name').eq('is_active', true).order('name'),
  ])

  if (todayLessonsQ.error) throw todayLessonsQ.error
  if (todayScheduleQ.error) throw todayScheduleQ.error
  if (pendingPaymentsQ.error) throw pendingPaymentsQ.error

  // Today's lesson stats
  const todayLessons = {
    total: todayLessonsQ.data?.length ?? 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  }
  for (const l of todayLessonsQ.data ?? []) {
    if (l.status === 'in_progress') todayLessons.inProgress += 1
    else if (l.status === 'completed' || l.status === 'completed_no_entry')
      todayLessons.completed += 1
    else if (l.status === 'cancelled') todayLessons.cancelled += 1
  }

  // Tutor rates map (najnowsza stawka per tutor)
  type RateRow = { tutor_id: string; individual_rate: number; group_rate: number; effective_from: string }
  const rateByTutor = new Map<string, { individual: number; group: number }>()
  for (const r of (tutorRatesQ.data ?? []) as RateRow[]) {
    if (!rateByTutor.has(r.tutor_id)) {
      rateByTutor.set(r.tutor_id, {
        individual: Number(r.individual_rate),
        group: Number(r.group_rate),
      })
    }
  }

  // Month aggregates + koszty korepetytorów
  type MonthLessonRow = {
    status: Enums<'lesson_status'>
    duration_minutes: number
    tutor_id: string
    class: { form: Enums<'class_form'> } | null
  }
  let monthRealized = 0
  let monthPlanned = 0
  let monthCancelled = 0
  let monthNoShow = 0
  let tutorCostsPlanned = 0
  let tutorCostsActual = 0
  for (const l of (monthLessonsQ.data ?? []) as unknown as MonthLessonRow[]) {
    const rate = rateByTutor.get(l.tutor_id)
    const hourly = rate ? (l.class?.form === 'group' ? rate.group : rate.individual) : 0
    const cost = (hourly * l.duration_minutes) / 60
    const isRealized = l.status === 'completed' || l.status === 'completed_no_entry'
    const isPlannedish = l.status === 'planned' || l.status === 'in_progress'
    if (isRealized) {
      monthRealized += 1
      tutorCostsActual += cost
      tutorCostsPlanned += cost
    } else if (isPlannedish) {
      monthPlanned += 1
      tutorCostsPlanned += cost
    } else if (l.status === 'cancelled') {
      monthCancelled += 1
    } else if (l.status === 'no_show') {
      monthNoShow += 1
      tutorCostsPlanned += cost
    }
  }
  const monthTotal = monthRealized + monthPlanned + monthCancelled + monthNoShow

  const monthRevenue = (monthPaymentsQ.data ?? [])
    .filter((p) => p.status === 'paid' || p.status === 'paid_late')
    .reduce((sum, p) => sum + Number(p.paid_amount ?? p.total_amount), 0)
  const revenueExpected = (monthPaymentsQ.data ?? []).reduce(
    (sum, p) => sum + Number(p.total_amount),
    0,
  )

  const tutorsTotal = (tutorsQ.data ?? []).filter((t) => {
    const profile = (t.profile as unknown) as { is_active: boolean }
    return profile.is_active
  }).length

  // Studenci: split indyw / w grupach
  const groupMemberSet = new Set<string>()
  for (const m of groupMembersQ.data ?? []) groupMemberSet.add(m.student_id)
  const studentsActive = studentsQ.count ?? 0
  const studentsInGroups = groupMemberSet.size
  const studentsIndividual = Math.max(0, studentsActive - studentsInGroups)

  // Nieobecni dziś
  type AbsenceTodayRow = {
    id: string
    affected_lessons_count: number | null
    reason: string | null
    absence_type: Enums<'tutor_absence_type'>
    start_date: string
    end_date: string
    tutor: { profile: { first_name: string; last_name: string } }
  }
  const ABSENCE_REASON_LABEL: Record<Enums<'tutor_absence_type'>, string> = {
    sick: 'Choroba',
    vacation: 'Urlop',
    other: 'Nieobecność',
  }
  const absentTutors = ((absencesTodayQ.data ?? []) as unknown as AbsenceTodayRow[]).map((a) => {
    const name = `${a.tutor.profile.first_name} ${a.tutor.profile.last_name}`
    return {
      absenceId: a.id,
      name,
      initials: getInitials(a.tutor.profile.first_name, a.tutor.profile.last_name),
      reason: `${ABSENCE_REASON_LABEL[a.absence_type]} (${formatShortDate(a.start_date)}–${formatShortDate(a.end_date)})`,
      affectedLessons: a.affected_lessons_count ?? 0,
    }
  })
  const tutorsPresent = Math.max(0, tutorsTotal - absentTutors.length)

  // ── Today schedule rows + todayByTutor ──
  type ScheduleRow = {
    id: string
    start_time: string
    end_time: string
    status: Enums<'lesson_status'>
    tutor_id: string
    tutor: { profile: { first_name: string; last_name: string } }
    subject: { name: string; color: string }
    room: { name: string } | null
    class: {
      student: { profile: { first_name: string; last_name: string } } | null
      group: { name: string } | null
    }
  }
  const scheduleRows = (todayScheduleQ.data ?? []) as unknown as ScheduleRow[]
  const todaySchedule = scheduleRows.map((l) => ({
    lessonId: l.id,
    startTime: l.start_time.slice(0, 5),
    endTime: l.end_time.slice(0, 5),
    tutorName: `${l.tutor.profile.first_name} ${l.tutor.profile.last_name}`,
    studentLabel: l.class.group
      ? l.class.group.name
      : l.class.student
        ? `${l.class.student.profile.first_name} ${l.class.student.profile.last_name}`
        : '—',
    subjectName: l.subject.name,
    subjectColor: l.subject.color,
    roomName: l.room?.name ?? null,
    status: l.status,
  }))

  // Bieżąca godzina (HH:MM) do "current" i roomsNow
  const nowHM = new Date().toTimeString().slice(0, 5)

  const byTutor = new Map<string, AdminTodayTutor & { _subjects: Set<string> }>()
  for (const l of scheduleRows) {
    const name = `${l.tutor.profile.first_name} ${l.tutor.profile.last_name}`
    let entry = byTutor.get(l.tutor_id)
    if (!entry) {
      entry = {
        name,
        initials: getInitials(l.tutor.profile.first_name, l.tutor.profile.last_name),
        subjects: [],
        lessons: 0,
        done: 0,
        current: null,
        room: null,
        _subjects: new Set<string>(),
      }
      byTutor.set(l.tutor_id, entry)
    }
    if (l.status === 'cancelled') continue
    entry.lessons += 1
    entry._subjects.add(l.subject.name)
    if (l.status === 'completed' || l.status === 'completed_no_entry') entry.done += 1
    const start = l.start_time.slice(0, 5)
    const end = l.end_time.slice(0, 5)
    if ((l.status === 'in_progress' || (start <= nowHM && nowHM < end)) && !entry.current) {
      const who = l.class.group
        ? l.class.group.name
        : l.class.student
          ? `${l.class.student.profile.first_name} ${l.class.student.profile.last_name.charAt(0)}.`
          : '—'
      entry.current = `${start}–${end} · ${who}`
      entry.room = l.room?.name ?? null
    }
  }
  const todayByTutor: AdminTodayTutor[] = Array.from(byTutor.values())
    .map((t) => ({
      name: t.name,
      initials: t.initials,
      subjects: Array.from(t._subjects),
      lessons: t.lessons,
      done: t.done,
      current: t.current,
      room: t.room,
    }))
    .filter((t) => t.lessons > 0)

  // ── Rooms now ──
  type RoomRow = { id: string; name: string }
  const roomsNow: AdminRoomNow[] = ((roomsAllQ.data ?? []) as RoomRow[]).map((room) => {
    const roomLessons = scheduleRows
      .filter((l) => l.room?.name === room.name && l.status !== 'cancelled')
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
    const ongoing = roomLessons.find(
      (l) => l.start_time.slice(0, 5) <= nowHM && nowHM < l.end_time.slice(0, 5),
    )
    const next = roomLessons.find((l) => l.start_time.slice(0, 5) > nowHM)
    const nextLabel = next
      ? `${next.tutor.profile.first_name} ${next.tutor.profile.last_name.charAt(0)}. ${next.start_time.slice(0, 5)}`
      : null
    if (ongoing) {
      return {
        name: room.name,
        status: 'occupied' as const,
        tutor: `${ongoing.tutor.profile.first_name} ${ongoing.tutor.profile.last_name.charAt(0)}.`,
        until: ongoing.end_time.slice(0, 5),
        next: nextLabel,
      }
    }
    return { name: room.name, status: 'free' as const, tutor: null, until: null, next: nextLabel }
  })

  // ── Pending payments (z przedmiotami) ──
  type PaymentRow = {
    id: string
    total_amount: number
    status: Enums<'payment_status'>
    delay_number: number
    parent: {
      profile_id: string
      profile: { first_name: string; last_name: string }
    }
    lines: Array<{
      description: string
      student: { profile: { first_name: string; last_name: string } }
    }>
  }
  const pendingPayments = ((pendingPaymentsQ.data ?? []) as unknown as PaymentRow[]).map((p) => {
    const childSet = new Set<string>()
    const subjectSet = new Set<string>()
    for (const line of p.lines) {
      childSet.add(`${line.student.profile.first_name} ${line.student.profile.last_name}`)
      if (line.description) subjectSet.add(line.description)
    }
    return {
      paymentId: p.id,
      parentId: p.parent.profile_id,
      parentName: `${p.parent.profile.first_name} ${p.parent.profile.last_name}`,
      childrenNames: Array.from(childSet).join(', '),
      subjects: Array.from(subjectSet).join(' + '),
      amount: Number(p.total_amount),
      delayNumber: p.delay_number,
      status: p.status,
    }
  })

  // ── Alerts (szczegółowe) ──
  const alertsDetailed: AdminAlert[] = []

  // Absence alerts (jeden per nieobecność obejmującą dziś)
  for (const a of (absentTutors)) {
    alertsDetailed.push({
      type: 'absence',
      icon: '⚠️',
      color: '#EF4444',
      title: `Nieobecność — ${a.name}`,
      desc: `${a.reason} · ${a.affectedLessons} lekcji do odwołania`,
      time: 'dziś',
      note: 'Rodzice zostaną powiadomieni automatycznie po zatwierdzeniu.',
      absenceId: a.absenceId,
    })
  }

  // Plan change requests
  type PlanRow = { body: string; sent_at: string; sender: { first_name: string; last_name: string } }
  for (const m of (planChangeQ.data ?? []) as unknown as PlanRow[]) {
    alertsDetailed.push({
      type: 'plan',
      icon: '📅',
      color: '#FFCA28',
      title: `Prośba o zmianę planu — ${m.sender.first_name} ${m.sender.last_name}`,
      desc: m.body.length > 80 ? m.body.slice(0, 80) + '…' : m.body,
      time: formatRelativeTime(m.sent_at),
      message: m.body,
    })
  }

  // Blocked entries (completed_no_entry > 48h)
  type BlockedRow = {
    lesson_date: string
    end_time: string
    tutor: { profile: { first_name: string; last_name: string } }
    subject: { name: string }
    class: {
      student: { profile: { first_name: string; last_name: string } } | null
      group: { name: string } | null
    }
  }
  const nowMs = Date.now()
  const blockedRows = ((blockedEntriesListQ.data ?? []) as unknown as BlockedRow[]).filter((e) => {
    const end = new Date(`${e.lesson_date}T${e.end_time}`).getTime()
    return nowMs - end > 48 * 3600 * 1000
  })
  if (blockedRows.length > 0) {
    alertsDetailed.push({
      type: 'entry',
      icon: '📝',
      color: '#FF6F4A',
      title: `${blockedRows.length} ${blockedRows.length === 1 ? 'zablokowany wpis' : 'zablokowane wpisy'}`,
      desc: 'Minął termin 48h na uzupełnienie wpisu',
      time: 'dziś',
      entries: blockedRows.slice(0, 6).map((e) => {
        const hoursOverdue = Math.floor((nowMs - new Date(`${e.lesson_date}T${e.end_time}`).getTime()) / 3600_000)
        return {
          tutor: `${e.tutor.profile.first_name} ${e.tutor.profile.last_name.charAt(0)}.`,
          date: formatShortDate(e.lesson_date),
          student: e.class.group
            ? e.class.group.name
            : e.class.student
              ? `${e.class.student.profile.first_name} ${e.class.student.profile.last_name}`
              : '—',
          overdue: `${hoursOverdue}h`,
        }
      }),
    })
  }

  // Stalled makeups (waiting_for_tutor)
  type StalledRow = {
    updated_at: string
    original_lesson: {
      tutor: { profile_id: string; profile: { first_name: string; last_name: string } }
      class: {
        student: { profile: { first_name: string; last_name: string } } | null
        group: { name: string } | null
      }
    }
    proposals: Array<{ proposed_date: string | null; proposed_start: string | null; created_at: string; proposed_by: Enums<'makeup_actor'> }>
  }
  const stalledRows = (stalledMakeupQ.data ?? []) as unknown as StalledRow[]
  if (stalledRows.length > 0) {
    const reminderTutorIds = Array.from(
      new Set(stalledRows.map((m) => m.original_lesson.tutor.profile_id)),
    )
    alertsDetailed.push({
      type: 'makeup',
      icon: '🔄',
      color: '#06B6D4',
      title: `${stalledRows.length} ${stalledRows.length === 1 ? 'odrabianie czeka' : 'odrabiania czekają'} na korepetytora`,
      desc: 'Propozycje rodziców bez reakcji korepetytora',
      time: 'kilka dni',
      reminderTutorIds,
      items: stalledRows.slice(0, 6).map((m) => {
        const latest = [...m.proposals].sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
        const waitingDays = latest
          ? Math.max(0, Math.floor((nowMs - new Date(latest.created_at).getTime()) / 86_400_000))
          : 0
        return {
          student: m.original_lesson.class.group
            ? m.original_lesson.class.group.name
            : m.original_lesson.class.student
              ? `${m.original_lesson.class.student.profile.first_name} ${m.original_lesson.class.student.profile.last_name}`
              : '—',
          tutor: `${m.original_lesson.tutor.profile.first_name} ${m.original_lesson.tutor.profile.last_name.charAt(0)}.`,
          proposed: latest?.proposed_date
            ? `${formatShortDate(latest.proposed_date)}${latest.proposed_start ? `, ${latest.proposed_start.slice(0, 5)}` : ''}`
            : '—',
          waiting: `${waitingDays} dni`,
        }
      }),
    })
  }

  return {
    todayLessons,
    studentsActive,
    studentsIndividual,
    studentsInGroups,
    groupsActive: groupsActiveQ.count ?? 0,
    tutorsPresent,
    tutorsTotal,
    absentTutors,
    monthLabel,
    monthRevenue,
    monthRealized,
    monthPlanned,
    monthCancelled,
    monthNoShow,
    monthTotal,
    finance: {
      revenueCollected: monthRevenue,
      revenueExpected,
      tutorCostsPlanned: Math.round(tutorCostsPlanned),
      tutorCostsActual: Math.round(tutorCostsActual),
    },
    alerts: {
      pendingAbsences: absencesQ.count ?? 0,
      blockedEntries: overdueEntriesQ.count ?? 0,
      overduePayments: pendingPayments.length,
      pendingMakeups: pendingMakeupQ.count ?? 0,
    },
    alertsDetailed,
    todayByTutor,
    roomsNow,
    todaySchedule,
    pendingPayments,
  }
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 60) return `${mins} min temu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h temu`
  return `${Math.floor(hours / 24)} dni temu`
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getAdminSchedule (week view, all tutors)
// ════════════════════════════════════════════════════════════════════════════

export type AdminScheduleData = {
  weekStart: string
  weekEnd: string
  tutors: Array<{ id: string; fullName: string; initials: string; color: string }>
  rooms: Array<{ id: string; name: string }>
  subjects: Array<{ id: string; name: string; color: string }>
  lessons: Array<{
    id: string
    date: string
    startTime: string
    endTime: string
    status: Enums<'lesson_status'>
    tutorId: string
    tutorName: string
    subjectName: string
    subjectColor: string
    roomId: string | null
    roomName: string | null
    studentLabel: string
    level: Enums<'student_level'> | null
    levelLabel: string | null
    form: Enums<'class_form'> | null
  }>
}

export async function getAdminSchedule(
  supabase: Supabase,
  weekStartIso?: string,
): Promise<AdminScheduleData> {
  const monday = weekStartIso ? new Date(weekStartIso) : getStartOfWeek(new Date())
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  const from = monday.toISOString().slice(0, 10)
  const to = sunday.toISOString().slice(0, 10)

  const [lessonsQ, tutorsQ, roomsQ, subjectsQ] = await Promise.all([
    supabase
      .from('lessons')
      .select(
        `
          id, lesson_date, start_time, end_time, status, tutor_id, room_id,
          tutor:tutors!lessons_tutor_id_fkey (
            profile:profiles!tutors_profile_id_fkey ( first_name, last_name )
          ),
          subject:subjects!lessons_subject_id_fkey ( name, color ),
          room:rooms!lessons_room_id_fkey ( name ),
          class:classes!lessons_class_id_fkey (
            level, form,
            student:students!classes_student_id_fkey (
              profile:profiles!students_profile_id_fkey ( first_name, last_name )
            ),
            group:groups!classes_group_id_fkey ( name )
          )
        `,
      )
      .gte('lesson_date', from)
      .lte('lesson_date', to)
      .order('lesson_date')
      .order('start_time'),
    supabase
      .from('tutors')
      .select(
        `
          profile_id,
          profile:profiles!tutors_profile_id_fkey ( first_name, last_name )
        `,
      ),
    supabase.from('rooms').select('id, name').eq('is_active', true).order('name'),
    supabase.from('subjects').select('id, name, color').eq('is_active', true).order('sort_order'),
  ])
  if (lessonsQ.error) throw lessonsQ.error
  if (tutorsQ.error) throw tutorsQ.error
  if (roomsQ.error) throw roomsQ.error
  if (subjectsQ.error) throw subjectsQ.error

  type LRow = {
    id: string
    lesson_date: string
    start_time: string
    end_time: string
    status: Enums<'lesson_status'>
    tutor_id: string
    room_id: string | null
    tutor: { profile: { first_name: string; last_name: string } }
    subject: { name: string; color: string }
    room: { name: string } | null
    class: {
      level: Enums<'student_level'> | null
      form: Enums<'class_form'> | null
      student: { profile: { first_name: string; last_name: string } } | null
      group: { name: string } | null
    }
  }
  type TRow = {
    profile_id: string
    profile: { first_name: string; last_name: string }
  }

  const tutors = ((tutorsQ.data ?? []) as unknown as TRow[]).map((t) => ({
    id: t.profile_id,
    fullName: `${t.profile.first_name} ${t.profile.last_name}`,
    initials: getInitials(t.profile.first_name, t.profile.last_name),
    color: getAvatarColor(`${t.profile.first_name} ${t.profile.last_name}`),
  }))

  const lessons = ((lessonsQ.data ?? []) as unknown as LRow[]).map((l) => ({
    id: l.id,
    date: l.lesson_date,
    startTime: l.start_time.slice(0, 5),
    endTime: l.end_time.slice(0, 5),
    status: l.status,
    tutorId: l.tutor_id,
    tutorName: `${l.tutor.profile.first_name} ${l.tutor.profile.last_name}`,
    subjectName: l.subject.name,
    subjectColor: l.subject.color,
    roomId: l.room_id,
    roomName: l.room?.name ?? null,
    studentLabel: l.class.group
      ? l.class.group.name
      : l.class.student
        ? `${l.class.student.profile.first_name} ${l.class.student.profile.last_name}`
        : '—',
    level: l.class.level,
    levelLabel: l.class.level ? LEVEL_LABELS[l.class.level] : null,
    form: l.class.form,
  }))

  return {
    weekStart: from,
    weekEnd: to,
    tutors,
    rooms: roomsQ.data ?? [],
    subjects: subjectsQ.data ?? [],
    lessons,
  }
}

function getStartOfWeek(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  const day = out.getDay()
  const diff = day === 0 ? -6 : 1 - day
  out.setDate(out.getDate() + diff)
  return out
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getAdminTutors
// ════════════════════════════════════════════════════════════════════════════

export type AdminTutorsData = {
  tutors: AdminTutorRow[]
  subjects: Array<{ id: string; name: string; color: string }>
}

export async function getAdminTutors(supabase: Supabase): Promise<AdminTutorsData> {
  const [tutors, subjects] = await Promise.all([
    loadAllTutors(supabase),
    supabase.from('subjects').select('id, name, color').eq('is_active', true),
  ])
  if (subjects.error) throw subjects.error
  return { tutors, subjects: subjects.data ?? [] }
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getAdminStudents
// ════════════════════════════════════════════════════════════════════════════

export type AdminStudentsData = {
  students: AdminStudentRow[]
  groups: AdminGroupRow[]
  parents: Array<{ id: string; fullName: string; phone: string | null }>
}

export async function getAdminStudents(supabase: Supabase): Promise<AdminStudentsData> {
  const [studentsQ, groupsQ, parentsQ] = await Promise.all([
    supabase
      .from('students')
      .select(
        `
          profile_id, school_class, level, birth_date, parent_id,
          profile:profiles!students_profile_id_fkey ( first_name, last_name ),
          parent:parents!students_parent_id_fkey (
            profile:profiles!parents_profile_id_fkey ( first_name, last_name, phone, email )
          )
        `,
      ),
    supabase
      .from('groups')
      .select(
        `
          id, name, level, tutor_id, max_size, monthly_fee_per_student, status,
          subject:subjects!groups_subject_id_fkey ( name, color ),
          tutor:tutors!groups_tutor_id_fkey (
            profile:profiles!tutors_profile_id_fkey ( first_name, last_name )
          ),
          members:group_members!group_members_group_id_fkey (
            left_at, student_id,
            student:students!group_members_student_id_fkey (
              profile_id, school_class,
              profile:profiles!students_profile_id_fkey ( first_name, last_name ),
              parent:parents!students_parent_id_fkey (
                profile:profiles!parents_profile_id_fkey ( first_name, last_name )
              )
            )
          ),
          classes:classes!classes_group_id_fkey (
            id,
            slots:weekly_slots!weekly_slots_class_id_fkey (
              day_of_week, start_time, end_time,
              room:rooms!weekly_slots_room_id_fkey ( name )
            )
          )
        `,
      )
      .eq('status', 'active'),
    supabase
      .from('parents')
      .select(
        `
          profile_id,
          profile:profiles!parents_profile_id_fkey ( first_name, last_name, phone )
        `,
      ),
  ])
  if (studentsQ.error) throw studentsQ.error
  if (groupsQ.error) throw groupsQ.error
  if (parentsQ.error) throw parentsQ.error

  type SRow = {
    profile_id: string
    school_class: string
    level: Enums<'student_level'>
    birth_date: string
    parent_id: string
    profile: { first_name: string; last_name: string }
    parent: {
      profile: { first_name: string; last_name: string; phone: string | null; email: string | null }
    }
  }

  // Per student → classes (z subject, tutor, group)
  const studentRows = (studentsQ.data ?? []) as unknown as SRow[]
  const studentIds = studentRows.map((s) => s.profile_id)

  let allClasses: Array<{
    id: string
    form: Enums<'class_form'>
    student_id: string | null
    group_id: string | null
    monthly_fee: number
    start_date: string
    subject: { name: string; color: string }
    tutor: { profile: { first_name: string; last_name: string } }
    group: { name: string } | null
  }> = []
  if (studentIds.length > 0) {
    const memberQ = await supabase
      .from('group_members')
      .select('student_id, group_id')
      .in('student_id', studentIds)
      .is('left_at', null)
    const groupIds = Array.from(new Set((memberQ.data ?? []).map((m) => m.group_id)))
    const orClause = [
      `student_id.in.(${studentIds.join(',')})`,
      groupIds.length > 0 ? `group_id.in.(${groupIds.join(',')})` : null,
    ]
      .filter(Boolean)
      .join(',')

    const { data: cls } = await supabase
      .from('classes')
      .select(
        `
          id, form, student_id, group_id, monthly_fee, start_date,
          subject:subjects!classes_subject_id_fkey ( name, color ),
          tutor:tutors!classes_tutor_id_fkey (
            profile:profiles!tutors_profile_id_fkey ( first_name, last_name )
          ),
          group:groups!classes_group_id_fkey ( name )
        `,
      )
      .eq('status', 'active')
      .or(orClause)
    allClasses = (cls ?? []) as unknown as typeof allClasses

    // Also need to identify which group classes apply to which member
  }

  // Build group-membership map
  const { data: allMembers } = await supabase
    .from('group_members')
    .select('group_id, student_id')
    .is('left_at', null)
  const studentGroupIds = new Map<string, Set<string>>()
  for (const m of allMembers ?? []) {
    const set = studentGroupIds.get(m.student_id) ?? new Set()
    set.add(m.group_id)
    studentGroupIds.set(m.student_id, set)
  }

  // Płatności per rodzic — status bieżącego miesiąca + liczba opóźnień (max delay_number).
  const parentIds = Array.from(new Set(studentRows.map((s) => s.parent_id)))
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
  const payStatusByParent = new Map<string, Enums<'payment_status'>>()
  const lateCountByParent = new Map<string, number>()
  if (parentIds.length > 0) {
    const { data: pays } = await supabase
      .from('payments')
      .select('parent_id, billing_month, status, delay_number')
      .in('parent_id', parentIds)
      .order('billing_month', { ascending: false })
    for (const p of pays ?? []) {
      // status bieżącego miesiąca (pierwszy najnowszy wiersz per rodzic dla currentMonth, fallback najnowszy)
      if (p.billing_month === currentMonth && !payStatusByParent.has(p.parent_id)) {
        payStatusByParent.set(p.parent_id, p.status)
      }
      const prev = lateCountByParent.get(p.parent_id) ?? 0
      if (p.delay_number > prev) lateCountByParent.set(p.parent_id, p.delay_number)
    }
  }

  const students: AdminStudentRow[] = studentRows.map((s) => {
    const fullName = `${s.profile.first_name} ${s.profile.last_name}`
    const myClasses: AdminStudentRow['classes'] = []
    let total = 0
    let contractStart: string | null = null

    for (const c of allClasses) {
      const isDirect = c.student_id === s.profile_id
      const memberOfGroup = c.group_id && studentGroupIds.get(s.profile_id)?.has(c.group_id)
      if (!isDirect && !memberOfGroup) continue
      total += Number(c.monthly_fee)
      if (!contractStart || c.start_date < contractStart) contractStart = c.start_date
      myClasses.push({
        classId: c.id,
        form: c.form,
        subjectName: c.subject.name,
        subjectColor: c.subject.color,
        tutorName: `${c.tutor.profile.first_name} ${c.tutor.profile.last_name}`,
        monthlyFee: Number(c.monthly_fee),
        groupName: c.group?.name ?? null,
      })
    }

    return {
      id: s.profile_id,
      fullName,
      initials: getInitials(s.profile.first_name, s.profile.last_name),
      avatarColor: getAvatarColor(fullName),
      schoolClass: s.school_class,
      level: s.level,
      levelLabel: LEVEL_LABELS[s.level],
      birthDate: s.birth_date,
      parentId: s.parent_id,
      parentName: `${s.parent.profile.first_name} ${s.parent.profile.last_name}`,
      parentPhone: s.parent.profile.phone,
      parentEmail: s.parent.profile.email,
      classes: myClasses,
      totalMonthly: total,
      payStatus: payStatusByParent.get(s.parent_id) ?? null,
      lateCount: lateCountByParent.get(s.parent_id) ?? 0,
      contractStart,
    }
  })

  // Groups
  type GRow = {
    id: string
    name: string
    level: Enums<'student_level'>
    tutor_id: string
    max_size: number
    monthly_fee_per_student: number
    status: string
    subject: { name: string; color: string }
    tutor: { profile: { first_name: string; last_name: string } }
    members: Array<{
      left_at: string | null
      student_id: string
      student: {
        profile_id: string
        school_class: string
        profile: { first_name: string; last_name: string }
        parent: { profile: { first_name: string; last_name: string } } | null
      }
    }>
    classes: Array<{
      id: string
      slots: Array<{
        day_of_week: number
        start_time: string
        end_time: string
        room: { name: string } | null
      }>
    }>
  }
  const groupRows = (groupsQ.data ?? []) as unknown as GRow[]
  const groups: AdminGroupRow[] = groupRows.map((g) => {
    const fullTutorName = `${g.tutor.profile.first_name} ${g.tutor.profile.last_name}`
    const activeMembers = g.members.filter((m) => !m.left_at)
    const groupClass = g.classes[0] ?? null
    return {
      id: g.id,
      name: g.name,
      subjectName: g.subject.name,
      subjectColor: g.subject.color,
      level: g.level,
      levelLabel: LEVEL_LABELS[g.level],
      tutorId: g.tutor_id,
      tutorName: fullTutorName,
      maxSize: g.max_size,
      monthlyFeePerStudent: Number(g.monthly_fee_per_student),
      status: g.status,
      classId: groupClass?.id ?? null,
      weeklySlots: (groupClass?.slots ?? []).map((s) => ({
        dayShort: DAY_NAMES_SHORT[s.day_of_week]!,
        startTime: s.start_time.slice(0, 5),
        endTime: s.end_time.slice(0, 5),
        roomName: s.room?.name ?? null,
      })),
      members: activeMembers.map((m) => ({
        id: m.student.profile_id,
        fullName: `${m.student.profile.first_name} ${m.student.profile.last_name}`,
        initials: getInitials(m.student.profile.first_name, m.student.profile.last_name),
        schoolClass: m.student.school_class,
        parentName: m.student.parent
          ? `${m.student.parent.profile.first_name} ${m.student.parent.profile.last_name}`
          : null,
      })),
    }
  })

  type PRow = {
    profile_id: string
    profile: { first_name: string; last_name: string; phone: string | null }
  }
  const parents = ((parentsQ.data ?? []) as unknown as PRow[]).map((p) => ({
    id: p.profile_id,
    fullName: `${p.profile.first_name} ${p.profile.last_name}`,
    phone: p.profile.phone,
  }))

  return { students, groups, parents }
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getAdminPayments
// ════════════════════════════════════════════════════════════════════════════

export type AdminPaymentRow = {
  paymentId: string
  parentId: string
  parentName: string
  parentInitials: string
  parentColor: string
  childrenNames: string
  billingMonth: string
  monthLabel: string
  totalAmount: number
  status: Enums<'payment_status'>
  delayNumber: number
  paidAt: string | null
  dueDate: string
  /** Składowe opłaty — per uczeń (z kwotą). */
  lines: Array<{ childName: string; description: string; amount: number }>
  /** Historia wpłat rodzica w bieżącym roku (od najnowszego). */
  history: Array<{
    billingMonth: string
    monthShort: string
    status: Enums<'payment_status'>
    paidAt: string | null
    amount: number
    onTime: boolean | null
  }>
}

export type AdminPaymentsData = {
  month: string // YYYY-MM-01
  monthLabel: string
  payments: AdminPaymentRow[]
  stats: {
    totalDue: number
    totalPaid: number
    overdueCount: number
    pendingCount: number
    paidCount: number
  }
}

export async function getAdminPayments(
  supabase: Supabase,
  monthIso?: string,
): Promise<AdminPaymentsData> {
  const now = new Date()
  const targetMonth = monthIso ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('payments')
    .select(
      `
        id, billing_month, total_amount, status, delay_number, paid_at, due_date,
        parent:parents!payments_parent_id_fkey (
          profile_id,
          profile:profiles!parents_profile_id_fkey ( first_name, last_name )
        ),
        lines:payment_lines!payment_lines_payment_id_fkey (
          description, amount,
          student:students!payment_lines_student_id_fkey (
            profile:profiles!students_profile_id_fkey ( first_name, last_name )
          )
        )
      `,
    )
    .eq('billing_month', targetMonth)
    .order('status')
  if (error) throw error

  type PRow = {
    id: string
    billing_month: string
    total_amount: number
    status: Enums<'payment_status'>
    delay_number: number
    paid_at: string | null
    due_date: string
    parent: {
      profile_id: string
      profile: { first_name: string; last_name: string }
    }
    lines: Array<{
      description: string
      amount: number
      student: { profile: { first_name: string; last_name: string } }
    }>
  }
  const rows = (data ?? []) as unknown as PRow[]

  const monthLabel = new Date(targetMonth).toLocaleDateString('pl-PL', {
    month: 'long',
    year: 'numeric',
  })

  // Historia wpłat rodziców (bieżący rok) — do panelu "Historia wpłat".
  const yearStart = targetMonth.slice(0, 4) + '-01-01'
  const parentIds = Array.from(new Set(rows.map((p) => p.parent.profile_id)))
  const historyByParent = new Map<string, AdminPaymentRow['history']>()
  if (parentIds.length > 0) {
    const { data: hist } = await supabase
      .from('payments')
      .select('parent_id, billing_month, status, paid_at, total_amount, paid_on_time')
      .in('parent_id', parentIds)
      .gte('billing_month', yearStart)
      .order('billing_month', { ascending: false })
    for (const h of hist ?? []) {
      const list = historyByParent.get(h.parent_id) ?? []
      list.push({
        billingMonth: h.billing_month,
        monthShort: new Date(h.billing_month).toLocaleDateString('pl-PL', { month: 'short' }),
        status: h.status,
        paidAt: h.paid_at,
        amount: Number(h.total_amount),
        onTime: h.paid_on_time,
      })
      historyByParent.set(h.parent_id, list)
    }
  }

  const payments: AdminPaymentRow[] = rows.map((p) => {
    const parentName = `${p.parent.profile.first_name} ${p.parent.profile.last_name}`
    const children = new Set<string>()
    const lines = p.lines.map((line) => {
      const childName = `${line.student.profile.first_name} ${line.student.profile.last_name}`
      children.add(childName)
      return { childName, description: line.description, amount: Number(line.amount) }
    })
    return {
      paymentId: p.id,
      parentId: p.parent.profile_id,
      parentName,
      parentInitials: getInitials(p.parent.profile.first_name, p.parent.profile.last_name),
      parentColor: getAvatarColor(parentName),
      childrenNames: Array.from(children).join(', '),
      billingMonth: p.billing_month,
      monthLabel,
      totalAmount: Number(p.total_amount),
      status: p.status,
      delayNumber: p.delay_number,
      paidAt: p.paid_at,
      dueDate: p.due_date,
      lines,
      history: historyByParent.get(p.parent.profile_id) ?? [],
    }
  })

  const stats = {
    totalDue: payments.reduce((sum, p) => sum + p.totalAmount, 0),
    totalPaid: payments
      .filter((p) => p.status === 'paid' || p.status === 'paid_late')
      .reduce((sum, p) => sum + p.totalAmount, 0),
    overdueCount: payments.filter((p) => p.status === 'overdue').length,
    pendingCount: payments.filter((p) => p.status === 'pending').length,
    paidCount: payments.filter((p) => p.status === 'paid' || p.status === 'paid_late').length,
  }

  return { month: targetMonth, monthLabel, payments, stats }
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getAdminJournal (dziennik wpisów — WSZYSCY korepetytorzy)
// ════════════════════════════════════════════════════════════════════════════

export type AdminJournalEntry = {
  lessonId: string
  date: string
  startTime: string
  endTime: string
  tutorId: string
  tutorName: string
  tutorInitials: string
  studentLabel: string
  subjectName: string
  subjectColor: string
  level: Enums<'student_level'> | null
  levelLabel: string | null
  form: Enums<'class_form'> | null
  status: Enums<'lesson_status'>
  entryStatus: 'missing' | 'draft' | 'published' | 'locked'
  topic: string | null
  noteForStudent: string | null
  /** Notatka wewnętrzna — widoczna tylko dla admina i korepetytora. */
  internalNote: string | null
  hasHomework: boolean
  editedAt: string | null
  /** Czy ta lekcja ma przyznany punkt karny (brak wpisu po 48h). */
  hasPenalty: boolean
}

export type AdminJournalData = {
  entries: AdminJournalEntry[]
  /** Lista korepetytorów do filtra + liczba ich punktów karnych. */
  tutors: Array<{ id: string; name: string; penaltyCount: number }>
}

export async function getAdminJournal(
  supabase: Supabase,
  tutorId?: string,
): Promise<AdminJournalData> {
  const today = new Date().toISOString().slice(0, 10)
  const from = new Date(Date.now() - 60 * 86_400_000).toISOString().slice(0, 10)

  let lessonsQ = supabase
    .from('lessons')
    .select(
      `
        id, lesson_date, start_time, end_time, status, tutor_id,
        tutor:tutors!lessons_tutor_id_fkey ( profile:profiles!tutors_profile_id_fkey ( first_name, last_name ) ),
        subject:subjects!lessons_subject_id_fkey ( name, color ),
        class:classes!lessons_class_id_fkey (
          level, form,
          student:students!classes_student_id_fkey ( profile:profiles!students_profile_id_fkey ( first_name, last_name ) ),
          group:groups!classes_group_id_fkey ( name )
        ),
        entry:entries!entries_lesson_id_fkey (
          status, topic, note_for_student, internal_note, published_at, updated_at,
          homework:homework!homework_entry_id_fkey ( id )
        )
      `,
    )
    .in('status', ['completed', 'completed_no_entry'])
    .gte('lesson_date', from)
    .lte('lesson_date', today)
    .order('lesson_date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(200)
  if (tutorId) lessonsQ = lessonsQ.eq('tutor_id', tutorId)

  const [lessonsRes, penaltiesRes, tutorsRes] = await Promise.all([
    lessonsQ,
    supabase.from('tutor_penalty_points').select('tutor_id, lesson_id'),
    supabase
      .from('tutors')
      .select('profile_id, profile:profiles!tutors_profile_id_fkey ( first_name, last_name, is_active )'),
  ])
  if (lessonsRes.error) throw lessonsRes.error
  if (penaltiesRes.error) throw penaltiesRes.error
  if (tutorsRes.error) throw tutorsRes.error

  const penaltyLessonIds = new Set<string>()
  const penaltyByTutor = new Map<string, number>()
  for (const p of penaltiesRes.data ?? []) {
    if (p.lesson_id) penaltyLessonIds.add(p.lesson_id)
    penaltyByTutor.set(p.tutor_id, (penaltyByTutor.get(p.tutor_id) ?? 0) + 1)
  }

  type LRow = {
    id: string
    lesson_date: string
    start_time: string
    end_time: string
    status: Enums<'lesson_status'>
    tutor_id: string
    tutor: { profile: { first_name: string; last_name: string } }
    subject: { name: string; color: string }
    class: {
      level: Enums<'student_level'> | null
      form: Enums<'class_form'> | null
      student: { profile: { first_name: string; last_name: string } } | null
      group: { name: string } | null
    }
    entry: {
      status: Enums<'entry_status'>
      topic: string | null
      note_for_student: string | null
      internal_note: string | null
      published_at: string | null
      updated_at: string | null
      homework: { id: string } | null
    } | null
  }
  const rows = (lessonsRes.data ?? []) as unknown as LRow[]

  const entries: AdminJournalEntry[] = rows.map((l) => {
    const e = l.entry
    let entryStatus: AdminJournalEntry['entryStatus'] = 'missing'
    if (e) {
      entryStatus = e.status === 'draft' || e.status === 'published' || e.status === 'locked' ? e.status : 'missing'
    }
    let editedAt: string | null = null
    if (e?.published_at && e?.updated_at) {
      const diff = new Date(e.updated_at).getTime() - new Date(e.published_at).getTime()
      if (diff >= 60_000) editedAt = e.updated_at
    }
    return {
      lessonId: l.id,
      date: l.lesson_date,
      startTime: l.start_time.slice(0, 5),
      endTime: l.end_time.slice(0, 5),
      tutorId: l.tutor_id,
      tutorName: `${l.tutor.profile.first_name} ${l.tutor.profile.last_name}`,
      tutorInitials: getInitials(l.tutor.profile.first_name, l.tutor.profile.last_name),
      studentLabel: l.class.group
        ? l.class.group.name
        : l.class.student
          ? `${l.class.student.profile.first_name} ${l.class.student.profile.last_name}`
          : '—',
      subjectName: l.subject.name,
      subjectColor: l.subject.color,
      level: l.class.level,
      levelLabel: l.class.level ? LEVEL_LABELS[l.class.level] : null,
      form: l.class.form,
      status: l.status,
      entryStatus,
      topic: e?.topic ?? null,
      noteForStudent: e?.note_for_student ?? null,
      internalNote: e?.internal_note ?? null,
      hasHomework: Boolean(e?.homework),
      editedAt,
      hasPenalty: penaltyLessonIds.has(l.id),
    }
  })

  type TRow = {
    profile_id: string
    profile: { first_name: string; last_name: string; is_active: boolean }
  }
  const tutors = ((tutorsRes.data ?? []) as unknown as TRow[])
    .filter((t) => t.profile.is_active)
    .map((t) => ({
      id: t.profile_id,
      name: `${t.profile.first_name} ${t.profile.last_name}`,
      penaltyCount: penaltyByTutor.get(t.profile_id) ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return { entries, tutors }
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getAdminSettings
// ════════════════════════════════════════════════════════════════════════════

export type AdminSettingsData = {
  center: {
    name: string
    fullName: string | null
    address: string
    phone: string
    email: string
    nip: string | null
    bankAccount: string | null
    bankName: string | null
    paymentTitleTemplate: string
  }
  subjects: Array<{ id: string; name: string; color: string; sortOrder: number; isActive: boolean }>
  rooms: Array<{ id: string; name: string; capacity: number; equipment: string | null; isActive: boolean }>
  workingHours: {
    lessons: Array<{ dayOfWeek: number; dayFull: string; openTime: string; closeTime: string; isActive: boolean }>
    phone: Array<{ dayOfWeek: number; dayFull: string; openTime: string; closeTime: string; isActive: boolean }>
  }
  reminderTemplates: Array<{
    id: string
    sendDayOfMonth: number
    sendTime: string
    label: string
    subjectTemplate: string
    bodyTemplate: string
    isEnabled: boolean
  }>
  contractTerms: {
    paymentDeadlineDay: number
    minContractMonths: number
    cancellationNoticeDays: number
    makeupDeadlineDays: number
    lateEntryHours: number
    cancellationHoursCutoff: number
    noShowPolicy: string
    cancellationPolicy: string
  }
  accounts: Array<{
    id: string
    fullName: string
    email: string | null
    role: Enums<'user_role'>
    lastLoginAt: string | null
    isActive: boolean
  }>
  /** Konta rodziców i uczniów (sekcja „Konta" — podgląd read-only). */
  userAccounts: Array<{
    id: string
    fullName: string
    email: string | null
    role: Enums<'user_role'>
    createdAt: string
  }>
}

export async function getAdminSettings(supabase: Supabase): Promise<AdminSettingsData> {
  const [center, subjects, rooms, workingHours, templates, terms, accounts] = await Promise.all([
    supabase.from('center_settings').select('*').eq('id', 1).single(),
    supabase.from('subjects').select('*').order('sort_order'),
    supabase.from('rooms').select('*').order('name'),
    supabase.from('working_hours').select('*').order('day_of_week'),
    supabase.from('payment_reminder_templates').select('*').order('sort_order'),
    supabase.from('contract_terms').select('*').eq('id', 1).single(),
    supabase
      .from('profiles')
      .select('id, first_name, last_name, email, role, last_login_at, is_active')
      .in('role', ['admin', 'tutor'])
      .order('role')
      .order('last_name'),
  ])

  if (center.error) throw center.error
  if (subjects.error) throw subjects.error
  if (rooms.error) throw rooms.error
  if (workingHours.error) throw workingHours.error
  if (templates.error) throw templates.error
  if (terms.error) throw terms.error
  if (accounts.error) throw accounts.error

  // Konta rodziców i uczniów (sekcja „Konta" — podgląd read-only z wyszukiwarką).
  const userAccountsQ = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, role, created_at')
    .in('role', ['parent', 'student'])
    .order('role')
    .order('last_name')
  if (userAccountsQ.error) throw userAccountsQ.error

  return {
    center: {
      name: center.data.name,
      fullName: center.data.full_name,
      address: center.data.address,
      phone: center.data.phone,
      email: center.data.email,
      nip: center.data.nip,
      bankAccount: center.data.bank_account,
      bankName: center.data.bank_name,
      paymentTitleTemplate: center.data.payment_title_template,
    },
    subjects: (subjects.data ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      color: s.color,
      sortOrder: s.sort_order,
      isActive: s.is_active,
    })),
    rooms: (rooms.data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      capacity: r.capacity,
      equipment: r.equipment,
      isActive: r.is_active,
    })),
    workingHours: {
      lessons: (workingHours.data ?? [])
        .filter((w) => w.kind === 'lessons')
        .map((w) => ({
          dayOfWeek: w.day_of_week,
          dayFull: DAY_NAMES_FULL[w.day_of_week]!,
          openTime: w.open_time.slice(0, 5),
          closeTime: w.close_time.slice(0, 5),
          isActive: w.is_active,
        })),
      phone: (workingHours.data ?? [])
        .filter((w) => w.kind === 'phone')
        .map((w) => ({
          dayOfWeek: w.day_of_week,
          dayFull: DAY_NAMES_FULL[w.day_of_week]!,
          openTime: w.open_time.slice(0, 5),
          closeTime: w.close_time.slice(0, 5),
          isActive: w.is_active,
        })),
    },
    reminderTemplates: (templates.data ?? []).map((t) => ({
      id: t.id,
      sendDayOfMonth: t.send_day_of_month,
      sendTime: t.send_time.slice(0, 5),
      label: t.label,
      subjectTemplate: t.subject_template,
      bodyTemplate: t.body_template,
      isEnabled: t.is_enabled,
    })),
    contractTerms: {
      paymentDeadlineDay: terms.data.payment_deadline_day,
      minContractMonths: terms.data.min_contract_months,
      cancellationNoticeDays: terms.data.cancellation_notice_days,
      makeupDeadlineDays: terms.data.makeup_deadline_days,
      lateEntryHours: terms.data.late_entry_hours,
      cancellationHoursCutoff: terms.data.cancellation_hours_cutoff,
      noShowPolicy: terms.data.no_show_policy,
      cancellationPolicy: terms.data.cancellation_policy,
    },
    accounts: (accounts.data ?? []).map((a) => ({
      id: a.id,
      fullName: `${a.first_name} ${a.last_name}`,
      email: a.email,
      role: a.role,
      lastLoginAt: a.last_login_at,
      isActive: a.is_active,
    })),
    userAccounts: (userAccountsQ.data ?? []).map((a) => ({
      id: a.id,
      fullName: `${a.first_name} ${a.last_name}`,
      email: a.email,
      role: a.role,
      createdAt: a.created_at,
    })),
  }
}
