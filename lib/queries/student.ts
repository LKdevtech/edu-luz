import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database, Enums } from '@/lib/types/database.types'

import {
  DAY_NAMES_FULL,
  DAY_NAMES_SHORT,
  LEVEL_LABELS,
  getAvatarColor,
  getInitials,
  getStudentClassIds,
} from './_helpers'

type Supabase = SupabaseClient<Database>

// ════════════════════════════════════════════════════════════════════════════
// Wspólne shape'y zwracane do UI (utrzymują 1:1 z polami z mockupów)
// ════════════════════════════════════════════════════════════════════════════

export type StudentSummary = {
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
  parentFullName: string
  parentPhone: string | null
  parentEmail: string | null
}

export type WeeklySlot = {
  dayOfWeek: number
  dayFull: string
  dayShort: string
  startTime: string // 'HH:MM'
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

export type LessonRow = {
  id: string
  date: string // 'YYYY-MM-DD'
  startTime: string
  endTime: string
  subjectName: string
  subjectColor: string
  tutorName: string
  tutorInitials: string
  roomName: string | null
  status: Enums<'lesson_status'>
  level: Enums<'student_level'>
  levelLabel: string
  cancelReason: string | null
  cancelledMoreThan24h: boolean | null
  entry: {
    topic: string | null
    noteForStudent: string | null
    homeworkContent: string | null
    homeworkDone: boolean
    homeworkVerified: boolean
  } | null
}

export type HomeworkRow = {
  homeworkId: string
  lessonId: string
  lessonDate: string
  subjectName: string
  subjectColor: string
  topic: string | null
  content: string
  dueDate: string | null
  isDone: boolean
  doneAt: string | null
  isVerified: boolean
}

export type EntryRow = {
  entryId: string
  lessonId: string
  lessonDate: string
  subjectName: string
  subjectColor: string
  tutorName: string
  level: Enums<'student_level'>
  levelLabel: string
  topic: string | null
  noteForStudent: string | null
  homeworkContent: string | null
  homeworkDone: boolean
  homeworkVerified: boolean
}

export type MakeupRow = {
  requestId: string
  originalLessonId: string
  originalDate: string
  subjectName: string
  subjectColor: string
  tutorName: string
  level: Enums<'student_level'>
  levelLabel: string
  cancelReason: string | null
  status: Enums<'makeup_status'>
  deadline: string | null
  daysLeftToDeadline: number | null
  proposal: {
    proposedBy: Enums<'makeup_actor'>
    proposedDate: string | null
    proposedStart: string | null
    proposedEnd: string | null
    note: string | null
  } | null
  completedDate: string | null
}

export type ScheduleExceptionRow = {
  id: string
  date: string
  type: Enums<'schedule_exception_type'>
  subjectName: string
  reason: string | null
  details: string | null
}

export type TutorContactRow = {
  tutorId: string
  firstName: string
  lastName: string
  fullName: string
  initials: string
  subjectName: string
  subjectColor: string
}

export type StudentStats = {
  totalLessons: number
  completed: number
  cancelled: number
  noShow: number
  makeupDone: number
  attendancePercent: number
  contractSince: string | null
}

// ════════════════════════════════════════════════════════════════════════════
// Common: student summary (używany przez wszystkie 3 query helpers)
// ════════════════════════════════════════════════════════════════════════════

async function loadStudentSummary(
  supabase: Supabase,
  studentId: string,
): Promise<StudentSummary> {
  const { data, error } = await supabase
    .from('students')
    .select(
      `
        profile_id,
        school_class,
        school_name,
        level,
        birth_date,
        student_profile:profiles!students_profile_id_fkey ( first_name, last_name ),
        parent:parents!students_parent_id_fkey (
          profile_id,
          parent_profile:profiles!parents_profile_id_fkey ( first_name, last_name, phone, email )
        )
      `,
    )
    .eq('profile_id', studentId)
    .single()

  if (error) throw error
  if (!data) throw new Error(`Student ${studentId} not found`)

  const studentProfile = (data.student_profile as unknown) as {
    first_name: string
    last_name: string
  }
  const parent = (data.parent as unknown) as {
    parent_profile: {
      first_name: string
      last_name: string
      phone: string | null
      email: string | null
    }
  }

  return {
    id: data.profile_id,
    firstName: studentProfile.first_name,
    lastName: studentProfile.last_name,
    fullName: `${studentProfile.first_name} ${studentProfile.last_name}`,
    initials: getInitials(studentProfile.first_name, studentProfile.last_name),
    avatarColor: getAvatarColor(`${studentProfile.first_name} ${studentProfile.last_name}`),
    schoolClass: data.school_class,
    schoolName: data.school_name,
    level: data.level,
    levelLabel: LEVEL_LABELS[data.level],
    birthDate: data.birth_date,
    parentFullName: `${parent.parent_profile.first_name} ${parent.parent_profile.last_name}`,
    parentPhone: parent.parent_profile.phone,
    parentEmail: parent.parent_profile.email,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// loadWeeklySchedule (wspólne dla dashboard mini + classes tab + profile)
// ════════════════════════════════════════════════════════════════════════════

async function loadWeeklySchedule(
  supabase: Supabase,
  classIds: string[],
): Promise<WeeklySlot[]> {
  if (classIds.length === 0) return []

  const { data, error } = await supabase
    .from('weekly_slots')
    .select(
      `
        day_of_week,
        start_time,
        end_time,
        active_to,
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
    .in('class_id', classIds)
    .is('active_to', null)
    .order('day_of_week')
    .order('start_time')

  if (error) throw error

  return (data ?? []).map((slot) => {
    const cls = (slot.class as unknown) as {
      form: Enums<'class_form'>
      level: Enums<'student_level'>
      subject: { name: string; color: string }
      tutor: { tutor_profile: { first_name: string; last_name: string } }
      room: { name: string } | null
      group: { name: string } | null
    }
    const slotRoom = (slot.room as unknown) as { name: string } | null

    return {
      dayOfWeek: slot.day_of_week,
      dayFull: DAY_NAMES_FULL[slot.day_of_week]!,
      dayShort: DAY_NAMES_SHORT[slot.day_of_week]!,
      startTime: slot.start_time.slice(0, 5),
      endTime: slot.end_time.slice(0, 5),
      subjectName: cls.subject.name,
      subjectColor: cls.subject.color,
      tutorName: `${cls.tutor.tutor_profile.first_name} ${cls.tutor.tutor_profile.last_name}`,
      roomName: slotRoom?.name ?? cls.room?.name ?? null,
      form: cls.form,
      groupName: cls.group?.name ?? null,
      level: cls.level,
      levelLabel: LEVEL_LABELS[cls.level],
    }
  })
}

// ════════════════════════════════════════════════════════════════════════════
// loadTutors (distinct tutors dla ucznia)
// ════════════════════════════════════════════════════════════════════════════

async function loadTutorsForStudent(
  supabase: Supabase,
  classIds: string[],
): Promise<TutorContactRow[]> {
  if (classIds.length === 0) return []

  const { data, error } = await supabase
    .from('classes')
    .select(
      `
        tutor_id,
        subject:subjects!classes_subject_id_fkey ( name, color ),
        tutor:tutors!classes_tutor_id_fkey (
          tutor_profile:profiles!tutors_profile_id_fkey ( first_name, last_name )
        )
      `,
    )
    .in('id', classIds)

  if (error) throw error

  const seen = new Set<string>()
  const tutors: TutorContactRow[] = []
  for (const row of data ?? []) {
    const tutorId = row.tutor_id
    if (seen.has(tutorId)) continue
    seen.add(tutorId)

    const tutor = (row.tutor as unknown) as {
      tutor_profile: { first_name: string; last_name: string }
    }
    const subject = (row.subject as unknown) as { name: string; color: string }

    tutors.push({
      tutorId,
      firstName: tutor.tutor_profile.first_name,
      lastName: tutor.tutor_profile.last_name,
      fullName: `${tutor.tutor_profile.first_name} ${tutor.tutor_profile.last_name}`,
      initials: getInitials(
        tutor.tutor_profile.first_name,
        tutor.tutor_profile.last_name,
      ),
      subjectName: subject.name,
      subjectColor: subject.color,
    })
  }
  return tutors
}

// ════════════════════════════════════════════════════════════════════════════
// loadLessons — wspólny mapper z entry + homework_completion dla studenta
// ════════════════════════════════════════════════════════════════════════════

type LessonQueryRow = {
  id: string
  lesson_date: string
  start_time: string
  end_time: string
  status: Enums<'lesson_status'>
  cancel_reason: string | null
  cancelled_more_than_24h: boolean | null
  class: {
    level: Enums<'student_level'>
  }
  subject: { name: string; color: string }
  tutor: {
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

async function loadLessonsForStudent(
  supabase: Supabase,
  studentId: string,
  classIds: string[],
  options: {
    from?: string
    to?: string
    limit?: number
    order?: 'asc' | 'desc'
    statuses?: Enums<'lesson_status'>[]
  } = {},
): Promise<LessonRow[]> {
  if (classIds.length === 0) return []

  let query = supabase
    .from('lessons')
    .select(
      `
        id,
        lesson_date,
        start_time,
        end_time,
        status,
        cancel_reason,
        cancelled_more_than_24h,
        class:classes!lessons_class_id_fkey ( level ),
        subject:subjects!lessons_subject_id_fkey ( name, color ),
        tutor:tutors!lessons_tutor_id_fkey (
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
    .in('class_id', classIds)

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

  const lessons = (data ?? []) as unknown as LessonQueryRow[]

  // Bulk-fetch homework_completions dla wszystkich PD z tych lekcji.
  const homeworkIds = lessons
    .map((l) => l.entry?.homework?.id)
    .filter((id): id is string => Boolean(id))

  const completionByHwId = new Map<string, { is_done: boolean; is_verified: boolean }>()
  if (homeworkIds.length > 0) {
    const { data: completions, error: cErr } = await supabase
      .from('homework_completions')
      .select('homework_id, is_done, is_verified')
      .in('homework_id', homeworkIds)
      .eq('student_id', studentId)
    if (cErr) throw cErr
    for (const c of completions ?? []) {
      completionByHwId.set(c.homework_id, { is_done: c.is_done, is_verified: c.is_verified })
    }
  }

  return lessons.map((l) => {
    const hw = l.entry?.homework
    const completion = hw ? completionByHwId.get(hw.id) : undefined

    return {
      id: l.id,
      date: l.lesson_date,
      startTime: l.start_time.slice(0, 5),
      endTime: l.end_time.slice(0, 5),
      subjectName: l.subject.name,
      subjectColor: l.subject.color,
      tutorName: `${l.tutor.tutor_profile.first_name} ${l.tutor.tutor_profile.last_name}`,
      tutorInitials: getInitials(
        l.tutor.tutor_profile.first_name,
        l.tutor.tutor_profile.last_name,
      ),
      roomName: l.room?.name ?? null,
      status: l.status,
      level: l.class.level,
      levelLabel: LEVEL_LABELS[l.class.level],
      cancelReason: l.cancel_reason,
      cancelledMoreThan24h: l.cancelled_more_than_24h,
      entry: l.entry
        ? {
            topic: l.entry.topic,
            noteForStudent: l.entry.note_for_student,
            homeworkContent: hw?.content ?? null,
            homeworkDone: completion?.is_done ?? false,
            homeworkVerified: completion?.is_verified ?? false,
          }
        : null,
    }
  })
}

// ════════════════════════════════════════════════════════════════════════════
// loadHomework — aktywna + niedawno zrobiona PD ucznia
// ════════════════════════════════════════════════════════════════════════════

async function loadHomeworkForStudent(
  supabase: Supabase,
  studentId: string,
  classIds: string[],
): Promise<HomeworkRow[]> {
  if (classIds.length === 0) return []

  const { data, error } = await supabase
    .from('homework')
    .select(
      `
        id,
        content,
        due_date,
        entry:entries!homework_entry_id_fkey (
          topic,
          lesson:lessons!entries_lesson_id_fkey (
            id,
            lesson_date,
            class_id,
            subject:subjects!lessons_subject_id_fkey ( name, color )
          )
        )
      `,
    )

  if (error) throw error

  // Filtruj te których lesson należy do studenta (po classIds).
  type HwQuery = {
    id: string
    content: string
    due_date: string | null
    entry: {
      topic: string | null
      lesson: {
        id: string
        lesson_date: string
        class_id: string
        subject: { name: string; color: string }
      }
    }
  }
  const rows = (data ?? []) as unknown as HwQuery[]
  const filtered = rows.filter((r) => classIds.includes(r.entry.lesson.class_id))

  if (filtered.length === 0) return []

  const homeworkIds = filtered.map((r) => r.id)
  const { data: completions, error: cErr } = await supabase
    .from('homework_completions')
    .select('homework_id, is_done, done_at, is_verified')
    .in('homework_id', homeworkIds)
    .eq('student_id', studentId)
  if (cErr) throw cErr

  const completionByHw = new Map(
    (completions ?? []).map((c) => [c.homework_id, c] as const),
  )

  return filtered
    .map((r) => {
      const completion = completionByHw.get(r.id)
      return {
        homeworkId: r.id,
        lessonId: r.entry.lesson.id,
        lessonDate: r.entry.lesson.lesson_date,
        subjectName: r.entry.lesson.subject.name,
        subjectColor: r.entry.lesson.subject.color,
        topic: r.entry.topic,
        content: r.content,
        dueDate: r.due_date,
        isDone: completion?.is_done ?? false,
        doneAt: completion?.done_at ?? null,
        isVerified: completion?.is_verified ?? false,
      }
    })
    .sort((a, b) => {
      // Najpierw niezrobione, potem ostatnio zrobione.
      if (a.isDone !== b.isDone) return a.isDone ? 1 : -1
      return b.lessonDate.localeCompare(a.lessonDate)
    })
}

// ════════════════════════════════════════════════════════════════════════════
// loadEntries — ostatnie wpisy (notatki z lekcji) bez uwag dla rodzica
// ════════════════════════════════════════════════════════════════════════════

async function loadRecentEntries(
  supabase: Supabase,
  studentId: string,
  classIds: string[],
  limit = 6,
): Promise<EntryRow[]> {
  if (classIds.length === 0) return []

  const { data, error } = await supabase
    .from('entries')
    .select(
      `
        id,
        topic,
        note_for_student,
        lesson:lessons!entries_lesson_id_fkey (
          id,
          lesson_date,
          class_id,
          class:classes!lessons_class_id_fkey ( level ),
          subject:subjects!lessons_subject_id_fkey ( name, color ),
          tutor:tutors!lessons_tutor_id_fkey (
            tutor_profile:profiles!tutors_profile_id_fkey ( first_name, last_name )
          )
        ),
        homework:homework!homework_entry_id_fkey ( id, content )
      `,
    )
    .eq('status', 'published')
    .order('id', { ascending: false })
    .limit(limit * 3) // weź zapas, potem przefiltrujemy po classIds

  if (error) throw error

  type EntryQuery = {
    id: string
    topic: string | null
    note_for_student: string | null
    lesson: {
      id: string
      lesson_date: string
      class_id: string
      class: { level: Enums<'student_level'> }
      subject: { name: string; color: string }
      tutor: { tutor_profile: { first_name: string; last_name: string } }
    }
    homework: { id: string; content: string } | null
  }
  const rows = (data ?? []) as unknown as EntryQuery[]
  const filtered = rows
    .filter((r) => classIds.includes(r.lesson.class_id))
    .sort((a, b) => b.lesson.lesson_date.localeCompare(a.lesson.lesson_date))
    .slice(0, limit)

  if (filtered.length === 0) return []

  const homeworkIds = filtered
    .map((r) => r.homework?.id)
    .filter((id): id is string => Boolean(id))

  const completionByHw = new Map<string, { is_done: boolean; is_verified: boolean }>()
  if (homeworkIds.length > 0) {
    const { data: completions } = await supabase
      .from('homework_completions')
      .select('homework_id, is_done, is_verified')
      .in('homework_id', homeworkIds)
      .eq('student_id', studentId)
    for (const c of completions ?? []) {
      completionByHw.set(c.homework_id, { is_done: c.is_done, is_verified: c.is_verified })
    }
  }

  return filtered.map((r) => {
    const completion = r.homework ? completionByHw.get(r.homework.id) : undefined
    return {
      entryId: r.id,
      lessonId: r.lesson.id,
      lessonDate: r.lesson.lesson_date,
      subjectName: r.lesson.subject.name,
      subjectColor: r.lesson.subject.color,
      tutorName: `${r.lesson.tutor.tutor_profile.first_name} ${r.lesson.tutor.tutor_profile.last_name}`,
      level: r.lesson.class.level,
      levelLabel: LEVEL_LABELS[r.lesson.class.level],
      topic: r.topic,
      noteForStudent: r.note_for_student,
      homeworkContent: r.homework?.content ?? null,
      homeworkDone: completion?.is_done ?? false,
      homeworkVerified: completion?.is_verified ?? false,
    }
  })
}

// ════════════════════════════════════════════════════════════════════════════
// loadMakeup — wszystkie makeup_requests dla ucznia
// ════════════════════════════════════════════════════════════════════════════

async function loadMakeupForStudent(
  supabase: Supabase,
  classIds: string[],
): Promise<MakeupRow[]> {
  if (classIds.length === 0) return []

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

  type MakeupQuery = {
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
      tutor: { tutor_profile: { first_name: string; last_name: string } }
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
  const rows = (data ?? []) as unknown as MakeupQuery[]
  const filtered = rows.filter((r) => classIds.includes(r.original_lesson.class_id))

  const today = new Date()
  return filtered.map((r) => {
    const latest =
      r.proposals.length > 0
        ? [...r.proposals].sort((a, b) => b.round_number - a.round_number)[0]!
        : null

    const daysLeft = r.deadline
      ? Math.ceil((new Date(r.deadline).getTime() - today.getTime()) / 86_400_000)
      : null

    return {
      requestId: r.id,
      originalLessonId: r.original_lesson.id,
      originalDate: r.original_lesson.lesson_date,
      subjectName: r.original_lesson.subject.name,
      subjectColor: r.original_lesson.subject.color,
      tutorName: `${r.original_lesson.tutor.tutor_profile.first_name} ${r.original_lesson.tutor.tutor_profile.last_name}`,
      level: r.original_lesson.class.level,
      levelLabel: LEVEL_LABELS[r.original_lesson.class.level],
      cancelReason: r.cancel_reason,
      status: r.status,
      deadline: r.deadline,
      daysLeftToDeadline: daysLeft,
      proposal: latest
        ? {
            proposedBy: latest.proposed_by,
            proposedDate: latest.proposed_date,
            proposedStart: latest.proposed_start?.slice(0, 5) ?? null,
            proposedEnd: latest.proposed_end?.slice(0, 5) ?? null,
            note: latest.note,
          }
        : null,
      completedDate: r.completed_at,
    }
  })
}

// ════════════════════════════════════════════════════════════════════════════
// computeStats — agregaty lekcji
// ════════════════════════════════════════════════════════════════════════════

async function computeStudentStats(
  supabase: Supabase,
  classIds: string[],
): Promise<StudentStats> {
  if (classIds.length === 0) {
    return {
      totalLessons: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0,
      makeupDone: 0,
      attendancePercent: 0,
      contractSince: null,
    }
  }

  const { data, error } = await supabase
    .from('lessons')
    .select('status, makeup_for_lesson_id')
    .in('class_id', classIds)
  if (error) throw error

  let completed = 0
  let cancelled = 0
  let noShow = 0
  let makeupDone = 0
  const total = data?.length ?? 0

  for (const l of data ?? []) {
    if (l.status === 'completed' || l.status === 'completed_no_entry') {
      completed += 1
      if (l.makeup_for_lesson_id) makeupDone += 1
    } else if (l.status === 'cancelled') {
      cancelled += 1
    } else if (l.status === 'no_show') {
      noShow += 1
    }
  }

  // Frekwencja: zrealizowane / (zrealizowane + no_show). Odwołania są neutralne.
  const denominator = completed + noShow
  const attendancePercent = denominator > 0 ? Math.round((completed / denominator) * 100) : 100

  const { data: contractData } = await supabase
    .from('classes')
    .select('start_date')
    .in('id', classIds)
    .order('start_date', { ascending: true })
    .limit(1)

  return {
    totalLessons: total,
    completed,
    cancelled,
    noShow,
    makeupDone,
    attendancePercent,
    contractSince: contractData?.[0]?.start_date ?? null,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getStudentDashboard
// ════════════════════════════════════════════════════════════════════════════

export type StudentDashboardData = {
  student: StudentSummary
  upcomingLessons: LessonRow[]
  homework: HomeworkRow[]
  recentEntries: EntryRow[]
  tutors: TutorContactRow[]
  weeklyPlan: WeeklySlot[]
  makeup: MakeupRow[]
  lessonsPerWeek: number
  attendancePercent: number
  /** Lekcje dla których uczeń ma już pending lesson_cancel_request — UI pokazuje "CZEKA NA RODZICA". */
  pendingCancelLessonIds: Set<string>
}

export async function getStudentDashboard(
  supabase: Supabase,
  studentId: string,
): Promise<StudentDashboardData> {
  const [student, classIds] = await Promise.all([
    loadStudentSummary(supabase, studentId),
    getStudentClassIds(supabase, studentId),
  ])

  const today = new Date().toISOString().slice(0, 10)
  const inTwoWeeks = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10)

  const [upcoming, homework, recentEntries, tutors, weeklyPlan, makeup, stats, pendingCancels] =
    await Promise.all([
      loadLessonsForStudent(supabase, studentId, classIds, {
        from: today,
        to: inTwoWeeks,
        limit: 6,
        order: 'asc',
      }),
      loadHomeworkForStudent(supabase, studentId, classIds),
      loadRecentEntries(supabase, studentId, classIds, 6),
      loadTutorsForStudent(supabase, classIds),
      loadWeeklySchedule(supabase, classIds),
      loadMakeupForStudent(supabase, classIds),
      computeStudentStats(supabase, classIds),
      loadPendingCancelLessonIds(supabase, studentId),
    ])

  return {
    student,
    upcomingLessons: upcoming.filter((l) => l.status === 'planned' || l.status === 'in_progress'),
    homework,
    recentEntries,
    tutors,
    weeklyPlan,
    makeup: makeup.filter(
      (m) => m.status !== 'completed' && m.status !== 'expired' && m.status !== 'rejected',
    ),
    lessonsPerWeek: weeklyPlan.length,
    attendancePercent: stats.attendancePercent,
    pendingCancelLessonIds: pendingCancels,
  }
}

async function loadPendingCancelLessonIds(
  supabase: Supabase,
  studentId: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('lesson_cancel_requests')
    .select('lesson_id')
    .eq('student_id', studentId)
    .eq('status', 'pending')
  if (error) throw error
  return new Set((data ?? []).map((r) => r.lesson_id))
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getStudentClasses
// ════════════════════════════════════════════════════════════════════════════

export type StudentClassesData = {
  student: StudentSummary
  schedule: WeeklySlot[]
  exceptions: ScheduleExceptionRow[]
  history: LessonRow[]
  makeupPending: MakeupRow[]
  makeupCompleted: MakeupRow[]
  pendingCancelLessonIds: Set<string>
}

export async function getStudentClasses(
  supabase: Supabase,
  studentId: string,
): Promise<StudentClassesData> {
  const [student, classIds] = await Promise.all([
    loadStudentSummary(supabase, studentId),
    getStudentClassIds(supabase, studentId),
  ])

  const [schedule, exceptions, history, makeup, pendingCancels] = await Promise.all([
    loadWeeklySchedule(supabase, classIds),
    loadScheduleExceptions(supabase, classIds),
    loadLessonsForStudent(supabase, studentId, classIds, {
      limit: 50,
      order: 'desc',
      // Tab „Historia" pokazuje WYŁĄCZNIE zrealizowane lekcje. Zaplanowane,
      // odwołane i no_show są w innych widokach (harmonogram / odrabianie).
      statuses: ['completed', 'completed_no_entry'],
    }),
    loadMakeupForStudent(supabase, classIds),
    loadPendingCancelLessonIds(supabase, studentId),
  ])

  return {
    student,
    schedule,
    exceptions,
    history,
    makeupPending: makeup.filter((m) => m.status !== 'completed'),
    makeupCompleted: makeup.filter((m) => m.status === 'completed'),
    pendingCancelLessonIds: pendingCancels,
  }
}

async function loadScheduleExceptions(
  supabase: Supabase,
  classIds: string[],
): Promise<ScheduleExceptionRow[]> {
  if (classIds.length === 0) return []

  const { data, error } = await supabase
    .from('schedule_exceptions')
    .select(
      `
        id,
        exception_date,
        exception_type,
        reason,
        details,
        class:classes!schedule_exceptions_class_id_fkey (
          subject:subjects!classes_subject_id_fkey ( name )
        )
      `,
    )
    .in('class_id', classIds)
    .order('exception_date', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const cls = (row.class as unknown) as { subject: { name: string } }
    return {
      id: row.id,
      date: row.exception_date,
      type: row.exception_type,
      subjectName: cls.subject.name,
      reason: row.reason,
      details: row.details,
    }
  })
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getStudentProfile
// ════════════════════════════════════════════════════════════════════════════

export type NotificationPrefRow = {
  type: Enums<'notification_type'>
  emailEnabled: boolean
  pushEnabled: boolean
}

export type StudentProfileData = {
  student: StudentSummary
  schedule: WeeklySlot[]
  tutors: TutorContactRow[]
  notifications: NotificationPrefRow[]
  stats: StudentStats
  center: {
    name: string
    address: string
    phone: string
    email: string
  }
}

// Push-relevant notifications dla ucznia (sekcja 7.3 mockupa profile).
const STUDENT_NOTIFICATION_TYPES: Array<Enums<'notification_type'>> = [
  'schedule_change',
  'new_entry',
  'makeup_proposal',
  'message_received',
]

export async function getStudentProfile(
  supabase: Supabase,
  studentId: string,
): Promise<StudentProfileData> {
  const [student, classIds] = await Promise.all([
    loadStudentSummary(supabase, studentId),
    getStudentClassIds(supabase, studentId),
  ])

  const [schedule, tutors, stats, prefs, center] = await Promise.all([
    loadWeeklySchedule(supabase, classIds),
    loadTutorsForStudent(supabase, classIds),
    computeStudentStats(supabase, classIds),
    supabase
      .from('notification_preferences')
      .select('notif_type, email_enabled, push_enabled')
      .eq('profile_id', studentId)
      .in('notif_type', STUDENT_NOTIFICATION_TYPES),
    supabase.from('center_settings').select('name, address, phone, email').eq('id', 1).single(),
  ])

  if (center.error) throw center.error
  if (prefs.error) throw prefs.error

  // Uzupełnij domyślne preferencje dla typów których nie ma jeszcze w bazie.
  const prefByType = new Map(
    (prefs.data ?? []).map((p) => [p.notif_type, p] as const),
  )
  const notifications: NotificationPrefRow[] = STUDENT_NOTIFICATION_TYPES.map((t) => {
    const p = prefByType.get(t)
    return {
      type: t,
      emailEnabled: p?.email_enabled ?? true,
      pushEnabled: p?.push_enabled ?? true,
    }
  })

  return {
    student,
    schedule,
    tutors,
    notifications,
    stats,
    center: {
      name: center.data!.name,
      address: center.data!.address,
      phone: center.data!.phone,
      email: center.data!.email,
    },
  }
}
