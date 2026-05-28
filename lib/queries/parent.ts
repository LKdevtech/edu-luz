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

/** Filtr w UI rodzica: 'all' = wszystkie dzieci, lub konkretny student_id. */
export type ChildFilter = string | 'all'

// ════════════════════════════════════════════════════════════════════════════
// Common shapes (mirror UI sections of mockups)
// ════════════════════════════════════════════════════════════════════════════

export type ParentSummary = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  initials: string
  email: string | null
  phone: string | null
  address: string | null
  lateCount: number
}

export type ChildSummary = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  initials: string
  avatarColor: string
  schoolClass: string
  schoolName: string | null
  level: Enums<'student_level'>
  levelLabel: string
  birthDate: string
  lessonsPerWeek: number
  attendancePercent: number
}

export type ParentLessonRow = {
  id: string
  childId: string
  childName: string
  childInitials: string
  childAvatarColor: string
  date: string
  startTime: string
  endTime: string
  subjectName: string
  subjectColor: string
  tutorName: string
  tutorId: string
  roomName: string | null
  status: Enums<'lesson_status'>
  level: Enums<'student_level'>
  levelLabel: string
  form: Enums<'class_form'>
  groupName: string | null
  cancelReason: string | null
  cancelledMoreThan24h: boolean | null
  /** Czy lekcja jest mniej niż 24h od teraz (decyduje o wyglądzie przycisku odwołania). */
  isWithin24h: boolean
  entry: {
    topic: string | null
    noteForStudent: string | null
    noteForParent: string | null
    homeworkContent: string | null
    homeworkDone: boolean
    homeworkVerified: boolean
  } | null
}

export type ParentMakeupRow = {
  requestId: string
  originalLessonId: string
  childId: string
  childName: string
  childInitials: string
  childAvatarColor: string
  originalDate: string
  subjectName: string
  subjectColor: string
  tutorName: string
  tutorId: string
  level: Enums<'student_level'>
  levelLabel: string
  cancelReason: string | null
  status: Enums<'makeup_status'>
  deadline: string | null
  daysLeftToDeadline: number | null
  completedDate: string | null
  /** Najnowsza propozycja (od korepetytora lub rodzica). */
  proposal: {
    proposedBy: Enums<'makeup_actor'>
    proposedDate: string | null
    proposedStart: string | null
    proposedEnd: string | null
    note: string | null
  } | null
  /** Sloty dostępne do zaproponowania przez rodzica (extra_slots korepetytora w stanie open). */
  availableSlots: Array<{
    id: string
    date: string
    startTime: string
    endTime: string
  }>
}

export type WeeklySlotForChild = {
  childId: string
  childName: string
  childInitials: string
  childAvatarColor: string
  dayOfWeek: number
  dayFull: string
  dayShort: string
  startTime: string
  endTime: string
  subjectName: string
  subjectColor: string
  tutorName: string
  roomName: string | null
  form: Enums<'class_form'>
  groupName: string | null
  level: Enums<'student_level'>
  levelLabel: string
}

export type ScheduleExceptionForChild = {
  id: string
  childId: string
  childName: string
  date: string
  type: Enums<'schedule_exception_type'>
  subjectName: string
  subjectColor: string
  reason: string | null
  details: string | null
}

export type PaymentSummary = {
  id: string
  billingMonth: string // YYYY-MM-01
  monthLabel: string
  dueDate: string
  status: Enums<'payment_status'>
  totalAmount: number
  delayNumber: number
  paidAt: string | null
  paidAmount: number | null
  paidOnTime: boolean | null
  breakdown: Array<{
    childId: string
    childName: string
    childInitials: string
    childAvatarColor: string
    childSubtotal: number
    items: Array<{
      classId: string | null
      description: string
      subjectName: string | null
      subjectColor: string | null
      lessonsPerWeek: number | null
      amount: number
    }>
  }>
  reminders: Array<{
    day: number
    label: string
    sent: boolean
    sentAt: string | null
  }>
}

export type NotificationPrefRow = {
  type: Enums<'notification_type'>
  emailEnabled: boolean
  pushEnabled: boolean
}

// ════════════════════════════════════════════════════════════════════════════
// Loaders (internal)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Profile.id pierwszego admina centrum — używane jako odbiorca wiadomości
 * od rodzica („Wyślij wiadomość do centrum").
 */
async function loadAdminProfileId(supabase: Supabase): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()
  if (error) throw error
  return data.id
}

async function loadParentSummary(supabase: Supabase, parentId: string): Promise<ParentSummary> {
  const { data, error } = await supabase
    .from('parents')
    .select(
      `
        profile_id,
        address,
        late_count,
        profile:profiles!parents_profile_id_fkey ( first_name, last_name, email, phone )
      `,
    )
    .eq('profile_id', parentId)
    .single()
  if (error) throw error

  const profile = (data.profile as unknown) as {
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
  }

  return {
    id: data.profile_id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    fullName: `${profile.first_name} ${profile.last_name}`,
    initials: getInitials(profile.first_name, profile.last_name),
    email: profile.email,
    phone: profile.phone,
    address: data.address,
    lateCount: data.late_count,
  }
}

async function loadChildren(supabase: Supabase, parentId: string): Promise<ChildSummary[]> {
  const { data, error } = await supabase
    .from('students')
    .select(
      `
        profile_id,
        school_class,
        school_name,
        level,
        birth_date,
        profile:profiles!students_profile_id_fkey ( first_name, last_name )
      `,
    )
    .eq('parent_id', parentId)
  if (error) throw error

  const rows = (data ?? []) as unknown as Array<{
    profile_id: string
    school_class: string
    school_name: string | null
    level: Enums<'student_level'>
    birth_date: string
    profile: { first_name: string; last_name: string }
  }>

  const children: ChildSummary[] = []
  for (const row of rows) {
    const fullName = `${row.profile.first_name} ${row.profile.last_name}`
    const stats = await computeChildStats(supabase, row.profile_id)
    children.push({
      id: row.profile_id,
      firstName: row.profile.first_name,
      lastName: row.profile.last_name,
      fullName,
      initials: getInitials(row.profile.first_name, row.profile.last_name),
      avatarColor: getAvatarColor(fullName),
      schoolClass: row.school_class,
      schoolName: row.school_name,
      level: row.level,
      levelLabel: LEVEL_LABELS[row.level],
      birthDate: row.birth_date,
      lessonsPerWeek: stats.lessonsPerWeek,
      attendancePercent: stats.attendancePercent,
    })
  }
  return children
}

async function computeChildStats(
  supabase: Supabase,
  studentId: string,
): Promise<{ lessonsPerWeek: number; attendancePercent: number }> {
  const classIds = await getStudentClassIdsLocal(supabase, studentId)
  if (classIds.length === 0) return { lessonsPerWeek: 0, attendancePercent: 100 }

  const [slots, lessonStats] = await Promise.all([
    supabase
      .from('weekly_slots')
      .select('id')
      .in('class_id', classIds)
      .is('active_to', null),
    supabase.from('lessons').select('status').in('class_id', classIds),
  ])
  if (slots.error) throw slots.error
  if (lessonStats.error) throw lessonStats.error

  let completed = 0
  let noShow = 0
  for (const l of lessonStats.data ?? []) {
    if (l.status === 'completed' || l.status === 'completed_no_entry') completed += 1
    else if (l.status === 'no_show') noShow += 1
  }
  const denom = completed + noShow
  const att = denom > 0 ? Math.round((completed / denom) * 100) : 100

  return { lessonsPerWeek: slots.data?.length ?? 0, attendancePercent: att }
}

async function getStudentClassIdsLocal(supabase: Supabase, studentId: string): Promise<string[]> {
  const [direct, memberships] = await Promise.all([
    supabase.from('classes').select('id').eq('student_id', studentId).eq('status', 'active'),
    supabase
      .from('group_members')
      .select('group_id')
      .eq('student_id', studentId)
      .is('left_at', null),
  ])
  if (direct.error) throw direct.error
  if (memberships.error) throw memberships.error

  const groupIds = (memberships.data ?? []).map((m) => m.group_id)
  let groupClasses: { id: string }[] = []
  if (groupIds.length > 0) {
    const { data, error } = await supabase
      .from('classes')
      .select('id')
      .in('group_id', groupIds)
      .eq('status', 'active')
    if (error) throw error
    groupClasses = data ?? []
  }
  return Array.from(
    new Set([...(direct.data ?? []), ...groupClasses].map((c) => c.id)),
  )
}

/**
 * Wszystkie class_id dzieci rodzica (lub jednego dziecka), pogrupowane po dziecku.
 * Mapa: studentId → classIds[].
 */
async function getChildClassMap(
  supabase: Supabase,
  parentId: string,
  filter: ChildFilter,
): Promise<Map<string, string[]>> {
  let studentsQ = supabase.from('students').select('profile_id').eq('parent_id', parentId)
  if (filter !== 'all') studentsQ = studentsQ.eq('profile_id', filter)
  const { data: students, error } = await studentsQ
  if (error) throw error

  const result = new Map<string, string[]>()
  for (const s of students ?? []) {
    result.set(s.profile_id, await getStudentClassIdsLocal(supabase, s.profile_id))
  }
  return result
}

// ════════════════════════════════════════════════════════════════════════════
// Lessons / entries (parent — INCLUDING entry_parent_notes)
// ════════════════════════════════════════════════════════════════════════════

async function loadLessonsForParent(
  supabase: Supabase,
  childClassMap: Map<string, string[]>,
  childIndex: Map<string, ChildSummary>,
  options: {
    from?: string
    to?: string
    limit?: number
    order?: 'asc' | 'desc'
    statuses?: Enums<'lesson_status'>[]
  } = {},
): Promise<ParentLessonRow[]> {
  const allClassIds = Array.from(childClassMap.values()).flat()
  if (allClassIds.length === 0) return []

  let query = supabase
    .from('lessons')
    .select(
      `
        id,
        class_id,
        lesson_date,
        start_time,
        end_time,
        status,
        cancel_reason,
        cancelled_more_than_24h,
        class:classes!lessons_class_id_fkey (
          form,
          level,
          student_id,
          group_id,
          group:groups!classes_group_id_fkey ( name )
        ),
        subject:subjects!lessons_subject_id_fkey ( name, color ),
        tutor:tutors!lessons_tutor_id_fkey (
          profile_id,
          tutor_profile:profiles!tutors_profile_id_fkey ( first_name, last_name )
        ),
        room:rooms!lessons_room_id_fkey ( name ),
        entry:entries!entries_lesson_id_fkey (
          id,
          topic,
          note_for_student,
          homework:homework!homework_entry_id_fkey ( id, content )
        )
      `,
    )
    .in('class_id', allClassIds)

  if (options.from) query = query.gte('lesson_date', options.from)
  if (options.to) query = query.lte('lesson_date', options.to)
  if (options.statuses && options.statuses.length > 0) {
    query = query.in('status', options.statuses)
  }
  query = query
    .order('lesson_date', { ascending: options.order !== 'desc' })
    .order('start_time', { ascending: options.order !== 'desc' })
  if (options.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error) throw error

  type LRow = {
    id: string
    class_id: string
    lesson_date: string
    start_time: string
    end_time: string
    status: Enums<'lesson_status'>
    cancel_reason: string | null
    cancelled_more_than_24h: boolean | null
    class: {
      form: Enums<'class_form'>
      level: Enums<'student_level'>
      student_id: string | null
      group_id: string | null
      group: { name: string } | null
    }
    subject: { name: string; color: string }
    tutor: {
      profile_id: string
      tutor_profile: { first_name: string; last_name: string }
    }
    room: { name: string } | null
    entry:
      | {
          id: string
          topic: string | null
          note_for_student: string | null
          homework: { id: string; content: string } | null
        }
      | null
  }
  const rows = (data ?? []) as unknown as LRow[]

  // Pre-fetch homework_completions + entry_parent_notes
  const homeworkIds = rows
    .map((r) => r.entry?.homework?.id)
    .filter((id): id is string => Boolean(id))
  const entryIds = rows.map((r) => r.entry?.id).filter((id): id is string => Boolean(id))

  // Map student → class for grouping homework/parent notes:
  // Dla classes z student_id (indyw./para) — homework_completion dla studenta.
  // Dla classes z group_id — może być wielu uczniów; tutaj zwracamy dane dziecka, więc
  // dla danej lekcji grupowej skanujemy WSZYSTKIE dzieci tego rodzica które są w klasie.
  const classToChildren = new Map<string, string[]>()
  for (const [childId, classIds] of Array.from(childClassMap.entries())) {
    for (const cid of classIds) {
      const list = classToChildren.get(cid) ?? []
      list.push(childId)
      classToChildren.set(cid, list)
    }
  }

  const allChildIds = Array.from(childIndex.keys())

  const [hwComps, parentNotes] = await Promise.all([
    homeworkIds.length > 0
      ? supabase
          .from('homework_completions')
          .select('homework_id, student_id, is_done, is_verified')
          .in('homework_id', homeworkIds)
          .in('student_id', allChildIds)
      : Promise.resolve({ data: [], error: null }),
    entryIds.length > 0
      ? supabase
          .from('entry_parent_notes')
          .select('entry_id, student_id, note')
          .in('entry_id', entryIds)
          .in('student_id', allChildIds)
      : Promise.resolve({ data: [], error: null }),
  ])
  if (hwComps.error) throw hwComps.error
  if (parentNotes.error) throw parentNotes.error

  // Indeksowanie kompletek / notatek:
  // (homework_id, student_id) → completion; (entry_id, student_id) → note
  const completionByKey = new Map<string, { is_done: boolean; is_verified: boolean }>()
  for (const c of hwComps.data ?? []) {
    completionByKey.set(`${c.homework_id}:${c.student_id}`, {
      is_done: c.is_done,
      is_verified: c.is_verified,
    })
  }
  const noteByKey = new Map<string, string>()
  for (const n of parentNotes.data ?? []) {
    noteByKey.set(`${n.entry_id}:${n.student_id}`, n.note)
  }

  const result: ParentLessonRow[] = []
  const now = Date.now()
  for (const r of rows) {
    const childIds = classToChildren.get(r.class_id) ?? []
    // Dla każdego dziecka rodzica które uczestniczy w tej lekcji — generuj wiersz.
    for (const childId of childIds) {
      const child = childIndex.get(childId)
      if (!child) continue

      const hwKey = r.entry?.homework ? `${r.entry.homework.id}:${childId}` : null
      const noteKey = r.entry ? `${r.entry.id}:${childId}` : null
      const completion = hwKey ? completionByKey.get(hwKey) : undefined
      const noteForParent = noteKey ? noteByKey.get(noteKey) ?? null : null

      const lessonStart = new Date(`${r.lesson_date}T${r.start_time}`)
      const isWithin24h = lessonStart.getTime() - now < 24 * 60 * 60 * 1000

      result.push({
        id: r.id,
        childId,
        childName: child.fullName,
        childInitials: child.initials,
        childAvatarColor: child.avatarColor,
        date: r.lesson_date,
        startTime: r.start_time.slice(0, 5),
        endTime: r.end_time.slice(0, 5),
        subjectName: r.subject.name,
        subjectColor: r.subject.color,
        tutorName: `${r.tutor.tutor_profile.first_name} ${r.tutor.tutor_profile.last_name}`,
        tutorId: r.tutor.profile_id,
        roomName: r.room?.name ?? null,
        status: r.status,
        level: r.class.level,
        levelLabel: LEVEL_LABELS[r.class.level],
        form: r.class.form,
        groupName: r.class.group?.name ?? null,
        cancelReason: r.cancel_reason,
        cancelledMoreThan24h: r.cancelled_more_than_24h,
        isWithin24h,
        entry: r.entry
          ? {
              topic: r.entry.topic,
              noteForStudent: r.entry.note_for_student,
              noteForParent,
              homeworkContent: r.entry.homework?.content ?? null,
              homeworkDone: completion?.is_done ?? false,
              homeworkVerified: completion?.is_verified ?? false,
            }
          : null,
      })
    }
  }
  return result
}

// ════════════════════════════════════════════════════════════════════════════
// Weekly schedule (per child)
// ════════════════════════════════════════════════════════════════════════════

async function loadWeeklyScheduleForChildren(
  supabase: Supabase,
  childClassMap: Map<string, string[]>,
  childIndex: Map<string, ChildSummary>,
): Promise<WeeklySlotForChild[]> {
  const allClassIds = Array.from(childClassMap.values()).flat()
  if (allClassIds.length === 0) return []

  const { data, error } = await supabase
    .from('weekly_slots')
    .select(
      `
        day_of_week,
        start_time,
        end_time,
        class_id,
        class:classes!weekly_slots_class_id_fkey (
          form,
          level,
          subject:subjects!classes_subject_id_fkey ( name, color ),
          tutor:tutors!classes_tutor_id_fkey (
            tutor_profile:profiles!tutors_profile_id_fkey ( first_name, last_name )
          ),
          room:rooms!classes_room_id_fkey ( name ),
          group:groups!classes_group_id_fkey ( name )
        ),
        room:rooms!weekly_slots_room_id_fkey ( name )
      `,
    )
    .in('class_id', allClassIds)
    .is('active_to', null)
    .order('day_of_week')
    .order('start_time')
  if (error) throw error

  const classToChildren = new Map<string, string[]>()
  for (const [childId, classIds] of Array.from(childClassMap.entries())) {
    for (const cid of classIds) {
      const list = classToChildren.get(cid) ?? []
      list.push(childId)
      classToChildren.set(cid, list)
    }
  }

  type SlotRow = {
    day_of_week: number
    start_time: string
    end_time: string
    class_id: string
    class: {
      form: Enums<'class_form'>
      level: Enums<'student_level'>
      subject: { name: string; color: string }
      tutor: { tutor_profile: { first_name: string; last_name: string } }
      room: { name: string } | null
      group: { name: string } | null
    }
    room: { name: string } | null
  }
  const rows = (data ?? []) as unknown as SlotRow[]

  const out: WeeklySlotForChild[] = []
  for (const slot of rows) {
    const childIds = classToChildren.get(slot.class_id) ?? []
    for (const childId of childIds) {
      const child = childIndex.get(childId)
      if (!child) continue
      out.push({
        childId,
        childName: child.fullName,
        childInitials: child.initials,
        childAvatarColor: child.avatarColor,
        dayOfWeek: slot.day_of_week,
        dayFull: DAY_NAMES_FULL[slot.day_of_week]!,
        dayShort: DAY_NAMES_SHORT[slot.day_of_week]!,
        startTime: slot.start_time.slice(0, 5),
        endTime: slot.end_time.slice(0, 5),
        subjectName: slot.class.subject.name,
        subjectColor: slot.class.subject.color,
        tutorName: `${slot.class.tutor.tutor_profile.first_name} ${slot.class.tutor.tutor_profile.last_name}`,
        roomName: slot.room?.name ?? slot.class.room?.name ?? null,
        form: slot.class.form,
        groupName: slot.class.group?.name ?? null,
        level: slot.class.level,
        levelLabel: LEVEL_LABELS[slot.class.level],
      })
    }
  }
  return out
}

async function loadExceptionsForChildren(
  supabase: Supabase,
  childClassMap: Map<string, string[]>,
  childIndex: Map<string, ChildSummary>,
): Promise<ScheduleExceptionForChild[]> {
  const allClassIds = Array.from(childClassMap.values()).flat()
  if (allClassIds.length === 0) return []

  const { data, error } = await supabase
    .from('schedule_exceptions')
    .select(
      `
        id,
        class_id,
        exception_date,
        exception_type,
        reason,
        details,
        class:classes!schedule_exceptions_class_id_fkey (
          subject:subjects!classes_subject_id_fkey ( name, color )
        )
      `,
    )
    .in('class_id', allClassIds)
    .order('exception_date', { ascending: false })
  if (error) throw error

  const classToChildren = new Map<string, string[]>()
  for (const [childId, classIds] of Array.from(childClassMap.entries())) {
    for (const cid of classIds) {
      const list = classToChildren.get(cid) ?? []
      list.push(childId)
      classToChildren.set(cid, list)
    }
  }

  type ERow = {
    id: string
    class_id: string
    exception_date: string
    exception_type: Enums<'schedule_exception_type'>
    reason: string | null
    details: string | null
    class: { subject: { name: string; color: string } }
  }
  const rows = (data ?? []) as unknown as ERow[]

  const out: ScheduleExceptionForChild[] = []
  for (const row of rows) {
    const childIds = classToChildren.get(row.class_id) ?? []
    for (const childId of childIds) {
      const child = childIndex.get(childId)
      if (!child) continue
      out.push({
        id: row.id,
        childId,
        childName: child.fullName,
        date: row.exception_date,
        type: row.exception_type,
        subjectName: row.class.subject.name,
        subjectColor: row.class.subject.color,
        reason: row.reason,
        details: row.details,
      })
    }
  }
  return out
}

// ════════════════════════════════════════════════════════════════════════════
// Makeup requests + available extra_slots for ping-pong
// ════════════════════════════════════════════════════════════════════════════

async function loadMakeupForParent(
  supabase: Supabase,
  childClassMap: Map<string, string[]>,
  childIndex: Map<string, ChildSummary>,
): Promise<ParentMakeupRow[]> {
  const allClassIds = Array.from(childClassMap.values()).flat()
  if (allClassIds.length === 0) return []

  const { data, error } = await supabase
    .from('makeup_requests')
    .select(
      `
        id,
        status,
        deadline,
        completed_at,
        cancel_reason,
        original_lesson:lessons!makeup_requests_original_lesson_id_fkey (
          id,
          lesson_date,
          class_id,
          class:classes!lessons_class_id_fkey ( level ),
          subject:subjects!lessons_subject_id_fkey ( name, color ),
          tutor:tutors!lessons_tutor_id_fkey (
            profile_id,
            tutor_profile:profiles!tutors_profile_id_fkey ( first_name, last_name )
          )
        ),
        proposals:makeup_proposals!makeup_proposals_request_id_fkey (
          round_number,
          proposed_by,
          action,
          proposed_date,
          proposed_start,
          proposed_end,
          note,
          created_at
        )
      `,
    )
    .order('id', { ascending: false })
  if (error) throw error

  type MRow = {
    id: string
    status: Enums<'makeup_status'>
    deadline: string | null
    completed_at: string | null
    cancel_reason: string | null
    original_lesson: {
      id: string
      lesson_date: string
      class_id: string
      class: { level: Enums<'student_level'> }
      subject: { name: string; color: string }
      tutor: {
        profile_id: string
        tutor_profile: { first_name: string; last_name: string }
      }
    }
    proposals: Array<{
      round_number: number
      proposed_by: Enums<'makeup_actor'>
      action: Enums<'makeup_action'>
      proposed_date: string | null
      proposed_start: string | null
      proposed_end: string | null
      note: string | null
      created_at: string
    }>
  }
  const rows = (data ?? []) as unknown as MRow[]

  const classToChildren = new Map<string, string[]>()
  for (const [childId, classIds] of Array.from(childClassMap.entries())) {
    for (const cid of classIds) {
      const list = classToChildren.get(cid) ?? []
      list.push(childId)
      classToChildren.set(cid, list)
    }
  }

  // Pre-load dostępne extra_slots wszystkich tutorów dotkniętych.
  const tutorIds = Array.from(new Set(rows.map((r) => r.original_lesson.tutor.profile_id)))
  const slotsByTutor = new Map<
    string,
    Array<{ id: string; date: string; startTime: string; endTime: string }>
  >()
  if (tutorIds.length > 0) {
    const today = new Date().toISOString().slice(0, 10)
    const { data: slots, error: slotsErr } = await supabase
      .from('extra_slots')
      .select('id, tutor_id, slot_date, start_time, end_time')
      .in('tutor_id', tutorIds)
      .eq('status', 'open')
      .gte('slot_date', today)
      .order('slot_date')
      .order('start_time')
    if (slotsErr) throw slotsErr
    for (const s of slots ?? []) {
      const list = slotsByTutor.get(s.tutor_id) ?? []
      list.push({
        id: s.id,
        date: s.slot_date,
        startTime: s.start_time.slice(0, 5),
        endTime: s.end_time.slice(0, 5),
      })
      slotsByTutor.set(s.tutor_id, list)
    }
  }

  const today = new Date()
  const result: ParentMakeupRow[] = []

  for (const r of rows) {
    const childIds = classToChildren.get(r.original_lesson.class_id) ?? []
    for (const childId of childIds) {
      const child = childIndex.get(childId)
      if (!child) continue

      const latest =
        r.proposals.length > 0
          ? [...r.proposals].sort((a, b) => b.round_number - a.round_number)[0]!
          : null
      const daysLeft = r.deadline
        ? Math.ceil((new Date(r.deadline).getTime() - today.getTime()) / 86_400_000)
        : null

      result.push({
        requestId: r.id,
        originalLessonId: r.original_lesson.id,
        childId,
        childName: child.fullName,
        childInitials: child.initials,
        childAvatarColor: child.avatarColor,
        originalDate: r.original_lesson.lesson_date,
        subjectName: r.original_lesson.subject.name,
        subjectColor: r.original_lesson.subject.color,
        tutorName: `${r.original_lesson.tutor.tutor_profile.first_name} ${r.original_lesson.tutor.tutor_profile.last_name}`,
        tutorId: r.original_lesson.tutor.profile_id,
        level: r.original_lesson.class.level,
        levelLabel: LEVEL_LABELS[r.original_lesson.class.level],
        cancelReason: r.cancel_reason,
        status: r.status,
        deadline: r.deadline,
        daysLeftToDeadline: daysLeft,
        completedDate: r.completed_at,
        proposal: latest
          ? {
              proposedBy: latest.proposed_by,
              proposedDate: latest.proposed_date,
              proposedStart: latest.proposed_start?.slice(0, 5) ?? null,
              proposedEnd: latest.proposed_end?.slice(0, 5) ?? null,
              note: latest.note,
            }
          : null,
        availableSlots: slotsByTutor.get(r.original_lesson.tutor.profile_id) ?? [],
      })
    }
  }
  return result
}

// ════════════════════════════════════════════════════════════════════════════
// Payments
// ════════════════════════════════════════════════════════════════════════════

async function loadPaymentsForParent(
  supabase: Supabase,
  parentId: string,
  childIndex: Map<string, ChildSummary>,
): Promise<PaymentSummary[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(
      `
        id,
        billing_month,
        due_date,
        status,
        total_amount,
        delay_number,
        paid_at,
        paid_amount,
        paid_on_time,
        lines:payment_lines!payment_lines_payment_id_fkey (
          student_id,
          class_id,
          description,
          lessons_per_week,
          amount,
          class:classes!payment_lines_class_id_fkey (
            subject:subjects!classes_subject_id_fkey ( name, color )
          )
        ),
        reminders:payment_reminders_sent!payment_reminders_sent_payment_id_fkey (
          sent_at,
          template:payment_reminder_templates!payment_reminders_sent_template_id_fkey (
            send_day_of_month,
            label
          )
        )
      `,
    )
    .eq('parent_id', parentId)
    .order('billing_month', { ascending: false })
  if (error) throw error

  // Wszystkie 3 szablony (do uzupełnienia "not sent" w UI).
  const { data: templates } = await supabase
    .from('payment_reminder_templates')
    .select('send_day_of_month, label')
    .order('sort_order')

  type PRow = {
    id: string
    billing_month: string
    due_date: string
    status: Enums<'payment_status'>
    total_amount: number
    delay_number: number
    paid_at: string | null
    paid_amount: number | null
    paid_on_time: boolean | null
    lines: Array<{
      student_id: string
      class_id: string | null
      description: string
      lessons_per_week: number | null
      amount: number
      class: { subject: { name: string; color: string } } | null
    }>
    reminders: Array<{
      sent_at: string
      template: { send_day_of_month: number; label: string }
    }>
  }
  const rows = (data ?? []) as unknown as PRow[]

  return rows.map((p) => {
    // Pogrupuj lines per dziecko
    const byChild = new Map<
      string,
      {
        subtotal: number
        items: PaymentSummary['breakdown'][number]['items']
      }
    >()

    for (const line of p.lines ?? []) {
      const existing = byChild.get(line.student_id) ?? { subtotal: 0, items: [] }
      existing.subtotal += Number(line.amount)
      existing.items.push({
        classId: line.class_id,
        description: line.description,
        subjectName: line.class?.subject.name ?? null,
        subjectColor: line.class?.subject.color ?? null,
        lessonsPerWeek: line.lessons_per_week,
        amount: Number(line.amount),
      })
      byChild.set(line.student_id, existing)
    }

    const breakdown: PaymentSummary['breakdown'] = []
    for (const [childId, agg] of Array.from(byChild.entries())) {
      const child = childIndex.get(childId)
      breakdown.push({
        childId,
        childName: child?.fullName ?? '—',
        childInitials: child?.initials ?? '?',
        childAvatarColor: child?.avatarColor ?? '#9B97AF',
        childSubtotal: agg.subtotal,
        items: agg.items,
      })
    }

    // Reminders: dla każdego globalnego szablonu określamy czy został wysłany.
    const sentByDay = new Map<number, string>()
    for (const r of p.reminders ?? []) {
      sentByDay.set(r.template.send_day_of_month, r.sent_at)
    }
    const reminders: PaymentSummary['reminders'] = (templates ?? []).map((t) => ({
      day: t.send_day_of_month,
      label: t.label,
      sent: sentByDay.has(t.send_day_of_month),
      sentAt: sentByDay.get(t.send_day_of_month) ?? null,
    }))

    return {
      id: p.id,
      billingMonth: p.billing_month,
      monthLabel: formatPolishMonth(p.billing_month),
      dueDate: p.due_date,
      status: p.status,
      totalAmount: Number(p.total_amount),
      delayNumber: p.delay_number,
      paidAt: p.paid_at,
      paidAmount: p.paid_amount !== null ? Number(p.paid_amount) : null,
      paidOnTime: p.paid_on_time,
      breakdown,
      reminders,
    }
  })
}

const POLISH_MONTHS = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
] as const

function formatPolishMonth(billingMonth: string): string {
  const d = new Date(billingMonth)
  return `${POLISH_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getParentDashboard
// ════════════════════════════════════════════════════════════════════════════

export type ParentDashboardData = {
  parent: ParentSummary
  children: ChildSummary[]
  filteredChildren: ChildSummary[]
  childFilter: ChildFilter
  upcomingLessons: ParentLessonRow[]
  recentEntries: ParentLessonRow[]
  currentPayment: PaymentSummary | null
  makeup: ParentMakeupRow[]
  center: {
    name: string
    phone: string
    email: string
    address: string
    /** Profile.id admina — odbiorca wiadomości z „Wyślij wiadomość do centrum". */
    adminId: string
  }
}

export async function getParentDashboard(
  supabase: Supabase,
  parentId: string,
  childFilter: ChildFilter,
): Promise<ParentDashboardData> {
  const [parent, children, payments, center, adminId] = await Promise.all([
    loadParentSummary(supabase, parentId),
    loadChildren(supabase, parentId),
    loadPaymentsForParent(supabase, parentId, new Map()),
    supabase.from('center_settings').select('name, phone, email, address').eq('id', 1).single(),
    loadAdminProfileId(supabase),
  ])
  if (center.error) throw center.error

  const childIndex = new Map(children.map((c) => [c.id, c] as const))
  const filteredChildren =
    childFilter === 'all' ? children : children.filter((c) => c.id === childFilter)

  const childClassMap = await getChildClassMap(supabase, parentId, childFilter)

  const today = new Date().toISOString().slice(0, 10)
  const inTwoWeeks = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10)

  // Refetch payments z poprawnym childIndex (do breakdown nazw dzieci).
  const paymentsWithChildren = await loadPaymentsForParent(supabase, parentId, childIndex)
  void payments // marker — initial fetch tylko żeby zrównoleglić

  const [upcoming, recentRaw, makeup] = await Promise.all([
    loadLessonsForParent(supabase, childClassMap, childIndex, {
      from: today,
      to: inTwoWeeks,
      limit: 8,
      order: 'asc',
    }),
    loadLessonsForParent(supabase, childClassMap, childIndex, {
      from: new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10),
      to: today,
      limit: 8,
      order: 'desc',
    }),
    loadMakeupForParent(supabase, childClassMap, childIndex),
  ])

  // Najbliższa płatność = bieżący miesiąc (lub najnowszy nieopłacony).
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
  const currentPayment =
    paymentsWithChildren.find((p) => p.billingMonth === currentMonth) ??
    paymentsWithChildren.find((p) => p.status !== 'paid') ??
    paymentsWithChildren[0] ??
    null

  return {
    parent,
    children,
    filteredChildren,
    childFilter,
    upcomingLessons: upcoming.filter(
      (l) => l.status === 'planned' || l.status === 'in_progress',
    ),
    recentEntries: recentRaw.filter((l) => l.entry !== null).slice(0, 6),
    currentPayment,
    makeup: makeup.filter(
      (m) => m.status !== 'completed' && m.status !== 'expired' && m.status !== 'rejected',
    ),
    center: {
      name: center.data!.name,
      phone: center.data!.phone,
      email: center.data!.email,
      address: center.data!.address,
      adminId,
    },
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getParentClasses
// ════════════════════════════════════════════════════════════════════════════

export type ParentClassesData = {
  parent: ParentSummary
  children: ChildSummary[]
  childFilter: ChildFilter
  schedule: WeeklySlotForChild[]
  exceptions: ScheduleExceptionForChild[]
  history: ParentLessonRow[]
  makeupPending: ParentMakeupRow[]
  makeupCompleted: ParentMakeupRow[]
}

export async function getParentClasses(
  supabase: Supabase,
  parentId: string,
  childFilter: ChildFilter,
): Promise<ParentClassesData> {
  const [parent, children] = await Promise.all([
    loadParentSummary(supabase, parentId),
    loadChildren(supabase, parentId),
  ])
  const childIndex = new Map(children.map((c) => [c.id, c] as const))
  const childClassMap = await getChildClassMap(supabase, parentId, childFilter)

  const [schedule, exceptions, history, makeup] = await Promise.all([
    loadWeeklyScheduleForChildren(supabase, childClassMap, childIndex),
    loadExceptionsForChildren(supabase, childClassMap, childIndex),
    loadLessonsForParent(supabase, childClassMap, childIndex, {
      limit: 60,
      order: 'desc',
      // Tab „Historia" pokazuje TYLKO zrealizowane (completed / completed_no_entry)
      // i odwołane (cancelled). Zaplanowane i no_show są w innych widokach.
      statuses: ['completed', 'completed_no_entry', 'cancelled'],
    }),
    loadMakeupForParent(supabase, childClassMap, childIndex),
  ])

  return {
    parent,
    children,
    childFilter,
    schedule,
    exceptions,
    history,
    makeupPending: makeup.filter((m) => m.status !== 'completed'),
    makeupCompleted: makeup.filter((m) => m.status === 'completed'),
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getParentPayments
// ════════════════════════════════════════════════════════════════════════════

export type ParentPaymentsData = {
  parent: ParentSummary
  children: ChildSummary[]
  current: PaymentSummary | null
  history: PaymentSummary[]
  contract: {
    startDate: string | null
    monthlyTotal: number
    paymentDeadlineDay: number
    bankAccount: string | null
    bankName: string | null
    titleTemplate: string
    children: ChildSummary[]
  }
  /** Liczba opóźnień (do badge'a w sidebarze). */
  overdueCount: number
}

export async function getParentPayments(
  supabase: Supabase,
  parentId: string,
): Promise<ParentPaymentsData> {
  const [parent, children, center, contract] = await Promise.all([
    loadParentSummary(supabase, parentId),
    loadChildren(supabase, parentId),
    supabase
      .from('center_settings')
      .select('bank_account, bank_name, payment_title_template')
      .eq('id', 1)
      .single(),
    supabase
      .from('contract_terms')
      .select('payment_deadline_day')
      .eq('id', 1)
      .single(),
  ])
  if (center.error) throw center.error
  if (contract.error) throw contract.error

  const childIndex = new Map(children.map((c) => [c.id, c] as const))
  const payments = await loadPaymentsForParent(supabase, parentId, childIndex)

  const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
  const current = payments.find((p) => p.billingMonth === currentMonth) ?? null
  const history = payments.filter((p) => p.billingMonth !== currentMonth)

  // Start umowy = najwcześniejsza data classes.start_date dzieci rodzica.
  let contractStartDate: string | null = null
  if (children.length > 0) {
    const childIds = children.map((c) => c.id)
    const { data: classes } = await supabase
      .from('classes')
      .select('start_date, student_id, group_id')
      .or(
        `student_id.in.(${childIds.join(',')}),group_id.in.(${await getGroupIdsForChildren(supabase, childIds)})`,
      )
      .order('start_date', { ascending: true })
      .limit(1)
    contractStartDate = classes?.[0]?.start_date ?? null
  }

  const monthlyTotal = current?.totalAmount ?? payments[0]?.totalAmount ?? 0
  const overdueCount = payments.filter(
    (p) => p.status === 'overdue' || p.status === 'pending',
  ).length

  return {
    parent,
    children,
    current,
    history,
    contract: {
      startDate: contractStartDate,
      monthlyTotal,
      paymentDeadlineDay: contract.data!.payment_deadline_day,
      bankAccount: center.data!.bank_account,
      bankName: center.data!.bank_name,
      titleTemplate: center.data!.payment_title_template,
      children,
    },
    overdueCount,
  }
}

async function getGroupIdsForChildren(
  supabase: Supabase,
  childIds: string[],
): Promise<string> {
  if (childIds.length === 0) return ''
  const { data } = await supabase
    .from('group_members')
    .select('group_id')
    .in('student_id', childIds)
    .is('left_at', null)
  return (data ?? []).map((g) => g.group_id).join(',') || ''
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getParentProfile
// ════════════════════════════════════════════════════════════════════════════

export type ChildProfileSection = {
  child: ChildSummary
  classes: Array<{
    classId: string
    form: Enums<'class_form'>
    subjectName: string
    subjectColor: string
    tutorName: string
    roomName: string | null
    groupName: string | null
    monthlyFee: number
    weeklySlots: Array<{
      dayOfWeek: number
      dayShort: string
      startTime: string
      endTime: string
    }>
  }>
  totalMonthly: number
}

export type ParentProfileData = {
  parent: ParentSummary
  children: ChildProfileSection[]
  contract: {
    startDate: string | null
    monthlyTotal: number
    paymentDeadlineDay: number
    minContractMonths: number
    cancellationNoticeDays: number
    makeupDeadlineDays: number
    lateEntryHours: number
    noShowPolicy: string
    cancellationPolicy: string
  }
  notifications: {
    paymentReminders: NotificationPrefRow[]
    others: NotificationPrefRow[]
  }
  center: {
    name: string
    address: string
    phone: string
    email: string
    /** Profile.id admina — odbiorca wiadomości z „Wyślij wiadomość do centrum". */
    adminId: string
  }
}

// Mapowanie typów do dwóch sekcji UI:
const PAYMENT_REMINDER_TYPES: Array<Enums<'notification_type'>> = [
  'payment_reminder_10',
  'payment_reminder_20',
  'payment_reminder_last',
]
const OTHER_PARENT_TYPES: Array<Enums<'notification_type'>> = [
  'new_entry',
  'schedule_change',
  'makeup_proposal',
  'message_received',
]

export async function getParentProfile(
  supabase: Supabase,
  parentId: string,
): Promise<ParentProfileData> {
  const [parent, children, contract, center, prefs, adminId] = await Promise.all([
    loadParentSummary(supabase, parentId),
    loadChildren(supabase, parentId),
    supabase.from('contract_terms').select('*').eq('id', 1).single(),
    supabase.from('center_settings').select('name, address, phone, email').eq('id', 1).single(),
    supabase
      .from('notification_preferences')
      .select('notif_type, email_enabled, push_enabled')
      .eq('profile_id', parentId),
    loadAdminProfileId(supabase),
  ])
  if (contract.error) throw contract.error
  if (center.error) throw center.error
  if (prefs.error) throw prefs.error

  // Klasy + tygodniowy plan per dziecko
  const childSections: ChildProfileSection[] = []
  for (const child of children) {
    const classIds = await getStudentClassIdsLocal(supabase, child.id)
    if (classIds.length === 0) {
      childSections.push({ child, classes: [], totalMonthly: 0 })
      continue
    }
    const { data: classData } = await supabase
      .from('classes')
      .select(
        `
          id,
          form,
          monthly_fee,
          subject:subjects!classes_subject_id_fkey ( name, color ),
          tutor:tutors!classes_tutor_id_fkey (
            tutor_profile:profiles!tutors_profile_id_fkey ( first_name, last_name )
          ),
          room:rooms!classes_room_id_fkey ( name ),
          group:groups!classes_group_id_fkey ( name ),
          slots:weekly_slots!weekly_slots_class_id_fkey (
            day_of_week,
            start_time,
            end_time
          )
        `,
      )
      .in('id', classIds)
      .eq('status', 'active')

    type CRow = {
      id: string
      form: Enums<'class_form'>
      monthly_fee: number
      subject: { name: string; color: string }
      tutor: { tutor_profile: { first_name: string; last_name: string } }
      room: { name: string } | null
      group: { name: string } | null
      slots: Array<{ day_of_week: number; start_time: string; end_time: string }>
    }
    const rows = (classData ?? []) as unknown as CRow[]
    let total = 0
    const classes = rows.map((c) => {
      total += Number(c.monthly_fee)
      return {
        classId: c.id,
        form: c.form,
        subjectName: c.subject.name,
        subjectColor: c.subject.color,
        tutorName: `${c.tutor.tutor_profile.first_name} ${c.tutor.tutor_profile.last_name}`,
        roomName: c.room?.name ?? null,
        groupName: c.group?.name ?? null,
        monthlyFee: Number(c.monthly_fee),
        weeklySlots: c.slots
          .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
          .map((s) => ({
            dayOfWeek: s.day_of_week,
            dayShort: DAY_NAMES_SHORT[s.day_of_week]!,
            startTime: s.start_time.slice(0, 5),
            endTime: s.end_time.slice(0, 5),
          })),
      }
    })
    childSections.push({ child, classes, totalMonthly: total })
  }

  // Notifications: defaults gdy brak wiersza
  const prefByType = new Map((prefs.data ?? []).map((p) => [p.notif_type, p] as const))
  const buildPref = (t: Enums<'notification_type'>): NotificationPrefRow => {
    const p = prefByType.get(t)
    return {
      type: t,
      emailEnabled: p?.email_enabled ?? true,
      pushEnabled: p?.push_enabled ?? true,
    }
  }

  const c = contract.data
  return {
    parent,
    children: childSections,
    contract: {
      startDate: null, // wstrzyknięte z payments query — tu pomijamy żeby nie duplikować zapytań
      monthlyTotal: childSections.reduce((sum, s) => sum + s.totalMonthly, 0),
      paymentDeadlineDay: c.payment_deadline_day,
      minContractMonths: c.min_contract_months,
      cancellationNoticeDays: c.cancellation_notice_days,
      makeupDeadlineDays: c.makeup_deadline_days,
      lateEntryHours: c.late_entry_hours,
      noShowPolicy: c.no_show_policy,
      cancellationPolicy: c.cancellation_policy,
    },
    notifications: {
      paymentReminders: PAYMENT_REMINDER_TYPES.map(buildPref),
      others: OTHER_PARENT_TYPES.map(buildPref),
    },
    center: {
      name: center.data!.name,
      address: center.data!.address,
      phone: center.data!.phone,
      email: center.data!.email,
      adminId,
    },
  }
}

/**
 * Pomocnicze: licznik zaległości do badge'a w sidebarze.
 * Wywoływane z layoutu — lekkie zapytanie.
 */
export async function getParentOverdueBadgeCount(
  supabase: Supabase,
  parentId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('payments')
    .select('id', { count: 'exact', head: true })
    .eq('parent_id', parentId)
    .in('status', ['pending', 'overdue'])
  if (error) throw error
  return count ?? 0
}
