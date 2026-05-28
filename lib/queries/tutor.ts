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
// Shared shapes
// ════════════════════════════════════════════════════════════════════════════

export type TutorSummary = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  initials: string
  avatarColor: string
}

export type TutorLessonRow = {
  id: string
  classId: string
  date: string
  startTime: string
  endTime: string
  durationMin: number
  subjectName: string
  subjectColor: string
  roomName: string | null
  form: Enums<'class_form'>
  level: Enums<'student_level'>
  levelLabel: string
  status: Enums<'lesson_status'>
  cancelReason: string | null
  /** Imię + nazwisko ucznia (indyw) lub nazwa grupy. */
  studentLabel: string
  /** Lista uczniów (1 element dla indyw, N dla grupy). */
  students: Array<{
    id: string
    fullName: string
    firstName: string
    initials: string
  }>
  /** Liczba minut do końca okna 48h na wpis (negatywne = już zablokowane). */
  hoursLeftForEntry: number | null
  /** Bieżący status wpisu lub null gdy lekcja jeszcze nie zaszła. */
  entryStatus: Enums<'entry_status'> | 'missing' | 'no_entry' | null
}

export type PreviousLessonHint = {
  lessonId: string
  date: string
  topic: string | null
  noteForStudent: string | null
  homework: string | null
}

export type TutorMakeupRow = {
  requestId: string
  originalLessonId: string
  status: Enums<'makeup_status'>
  cancelReason: string | null
  originalDate: string
  subjectName: string
  subjectColor: string
  level: Enums<'student_level'>
  levelLabel: string
  studentLabel: string
  studentInitials: string
  studentColor: string
  /** Najnowsza propozycja w ping-pongu. */
  latestProposal: {
    round: number
    proposedBy: Enums<'makeup_actor'>
    proposedByName: string
    action: Enums<'makeup_action'>
    proposedDate: string | null
    proposedStart: string | null
    proposedEnd: string | null
    note: string | null
    createdAt: string
  } | null
  history: Array<{
    round: number
    proposedBy: Enums<'makeup_actor'>
    proposedByName: string
    action: Enums<'makeup_action'>
    proposedDate: string | null
    note: string | null
    createdAt: string
  }>
  deadline: string | null
  daysLeftToDeadline: number | null
  completedDate: string | null
}

export type TutorStudentRow = {
  /** ID dokumentu — dla indyw to student_id, dla grupy to group_id. */
  id: string
  isGroup: boolean
  name: string
  initials: string
  color: string
  schoolClass: string
  level: Enums<'student_level'>
  levelLabel: string
  subjectName: string
  subjectColor: string
  form: Enums<'class_form'>
  scheduleLabel: string
  parentLabel: string | null
  nextLessonLabel: string | null
  classId: string
  stats: {
    totalLessons: number
    attended: number | null
    cancelled: number
    avgPerMonth: number
  }
  lastTopic: string | null
  lastHomework: string | null
  lastNote: string | null
  internalNote: string | null
  groupMembers: Array<{
    id: string
    fullName: string
    initials: string
    schoolClass: string
    parentName: string | null
  }>
}

export type ExtraSlotRow = {
  id: string
  date: string
  startTime: string
  endTime: string
  roomName: string | null
  note: string | null
  status: string
}

export type TutorAbsenceRow = {
  id: string
  type: Enums<'tutor_absence_type'>
  startDate: string
  endDate: string
  reason: string | null
  approvedAt: string | null
  affectedLessonsCount: number | null
}

// ════════════════════════════════════════════════════════════════════════════
// Common loaders
// ════════════════════════════════════════════════════════════════════════════

async function loadTutorSummary(supabase: Supabase, tutorId: string): Promise<TutorSummary> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('id', tutorId)
    .single()
  if (error) throw error

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    fullName: `${data.first_name} ${data.last_name}`,
    initials: getInitials(data.first_name, data.last_name),
    avatarColor: getAvatarColor(`${data.first_name} ${data.last_name}`),
  }
}

/**
 * Wszystkie klasy tutora (active).
 */
async function loadTutorClassIds(supabase: Supabase, tutorId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('classes')
    .select('id')
    .eq('tutor_id', tutorId)
    .eq('status', 'active')
  if (error) throw error
  return (data ?? []).map((c) => c.id)
}

// ════════════════════════════════════════════════════════════════════════════
// loadLessonsForTutor — wspólny mapper
// ════════════════════════════════════════════════════════════════════════════

type LessonQueryRow = {
  id: string
  class_id: string
  lesson_date: string
  start_time: string
  end_time: string
  status: Enums<'lesson_status'>
  cancel_reason: string | null
  class: {
    form: Enums<'class_form'>
    level: Enums<'student_level'>
    student_id: string | null
    group_id: string | null
    student: {
      profile_id: string
      profile: { first_name: string; last_name: string }
    } | null
    group: {
      id: string
      name: string
      members: Array<{
        student_id: string
        left_at: string | null
        student: {
          profile_id: string
          profile: { first_name: string; last_name: string }
        }
      }>
    } | null
  }
  subject: { name: string; color: string }
  room: { name: string } | null
  entry: { id: string; status: Enums<'entry_status'> } | null
}

async function loadLessonsForTutor(
  supabase: Supabase,
  tutorId: string,
  options: { from?: string; to?: string; limit?: number; order?: 'asc' | 'desc' } = {},
): Promise<TutorLessonRow[]> {
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
        class:classes!lessons_class_id_fkey (
          form,
          level,
          student_id,
          group_id,
          student:students!classes_student_id_fkey (
            profile_id,
            profile:profiles!students_profile_id_fkey ( first_name, last_name )
          ),
          group:groups!classes_group_id_fkey (
            id,
            name,
            members:group_members!group_members_group_id_fkey (
              student_id,
              left_at,
              student:students!group_members_student_id_fkey (
                profile_id,
                profile:profiles!students_profile_id_fkey ( first_name, last_name )
              )
            )
          )
        ),
        subject:subjects!lessons_subject_id_fkey ( name, color ),
        room:rooms!lessons_room_id_fkey ( name ),
        entry:entries!entries_lesson_id_fkey ( id, status )
      `,
    )
    .eq('tutor_id', tutorId)

  if (options.from) query = query.gte('lesson_date', options.from)
  if (options.to) query = query.lte('lesson_date', options.to)
  query = query
    .order('lesson_date', { ascending: options.order !== 'desc' })
    .order('start_time', { ascending: options.order !== 'desc' })
  if (options.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error) throw error

  const rows = (data ?? []) as unknown as LessonQueryRow[]

  return rows.map((r) => mapLesson(r))
}

function mapLesson(r: LessonQueryRow): TutorLessonRow {
  // Buduj listę uczniów.
  const students: TutorLessonRow['students'] = []
  let studentLabel: string

  if (r.class.form === 'group' && r.class.group) {
    studentLabel = r.class.group.name
    for (const m of r.class.group.members) {
      if (m.left_at) continue
      const fullName = `${m.student.profile.first_name} ${m.student.profile.last_name}`
      students.push({
        id: m.student.profile_id,
        fullName,
        firstName: m.student.profile.first_name,
        initials: getInitials(m.student.profile.first_name, m.student.profile.last_name),
      })
    }
  } else if (r.class.student) {
    const fullName = `${r.class.student.profile.first_name} ${r.class.student.profile.last_name}`
    studentLabel = fullName
    students.push({
      id: r.class.student.profile_id,
      fullName,
      firstName: r.class.student.profile.first_name,
      initials: getInitials(r.class.student.profile.first_name, r.class.student.profile.last_name),
    })
  } else {
    studentLabel = '—'
  }

  // Duration
  const durMin = computeDurationMinutes(r.start_time, r.end_time)

  // hoursLeftForEntry: 48h od KOŃCA lekcji.
  let hoursLeft: number | null = null
  const lessonEnd = new Date(`${r.lesson_date}T${r.end_time}`)
  if (r.status === 'completed' || r.status === 'completed_no_entry') {
    const cutoff = lessonEnd.getTime() + 48 * 60 * 60 * 1000
    hoursLeft = Math.round((cutoff - Date.now()) / (60 * 60 * 1000))
  }

  // entryStatus dla UI:
  // - lekcja zaplanowana → null
  // - no_show → 'no_entry' (blocked)
  // - completed bez wpisu → 'missing'
  // - completed bez wpisu po 48h → 'locked' (effektywnie zablokowane)
  // - completed z wpisem → entry.status
  let entryStatus: TutorLessonRow['entryStatus'] = null
  if (r.status === 'planned' || r.status === 'in_progress' || r.status === 'cancelled' || r.status === 'makeup') {
    entryStatus = null
  } else if (r.status === 'no_show') {
    entryStatus = 'no_entry'
  } else if (r.entry) {
    entryStatus = r.entry.status
  } else if (hoursLeft !== null && hoursLeft <= 0) {
    entryStatus = 'no_entry'
  } else {
    entryStatus = 'missing'
  }

  return {
    id: r.id,
    classId: r.class_id,
    date: r.lesson_date,
    startTime: r.start_time.slice(0, 5),
    endTime: r.end_time.slice(0, 5),
    durationMin: durMin,
    subjectName: r.subject.name,
    subjectColor: r.subject.color,
    roomName: r.room?.name ?? null,
    form: r.class.form,
    level: r.class.level,
    levelLabel: LEVEL_LABELS[r.class.level],
    status: r.status,
    cancelReason: r.cancel_reason,
    studentLabel,
    students,
    hoursLeftForEntry: hoursLeft,
    entryStatus,
  }
}

function computeDurationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return eh! * 60 + em! - (sh! * 60 + sm!)
}

// ════════════════════════════════════════════════════════════════════════════
// Previous lesson hint (kluczowa funkcja — klik na planowaną → poprzednia)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Dla danej lekcji w przyszłości — znajdź ostatnią zrealizowaną lekcję z tym samym
 * studentem (lub w tej samej grupie) i zwróć jej temat / notatkę / pracę domową.
 */
export async function getPreviousLessonHint(
  supabase: Supabase,
  lessonId: string,
): Promise<PreviousLessonHint | null> {
  // 1) Załaduj lekcję bazową
  const { data: base, error } = await supabase
    .from('lessons')
    .select('id, class_id, lesson_date, start_time')
    .eq('id', lessonId)
    .single()
  if (error) throw error
  if (!base) return null

  // 2) Znajdź poprzednią lekcję w tej samej klasie (proste, bo grupowe lekcje
  // mają tę samą class_id, indyw też). Wykluczamy cancelled/no_show.
  const { data: prev } = await supabase
    .from('lessons')
    .select(
      `
        id,
        lesson_date,
        entry:entries!entries_lesson_id_fkey (
          topic,
          note_for_student,
          homework:homework!homework_entry_id_fkey ( content )
        )
      `,
    )
    .eq('class_id', base.class_id)
    .in('status', ['completed', 'completed_no_entry'])
    .lt('lesson_date', base.lesson_date)
    .order('lesson_date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(1)

  if (!prev || prev.length === 0) return null

  type PrevRow = {
    id: string
    lesson_date: string
    entry: {
      topic: string | null
      note_for_student: string | null
      homework: { content: string } | null
    } | null
  }
  const row = (prev[0] as unknown) as PrevRow

  return {
    lessonId: row.id,
    date: row.lesson_date,
    topic: row.entry?.topic ?? null,
    noteForStudent: row.entry?.note_for_student ?? null,
    homework: row.entry?.homework?.content ?? null,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Makeup requests dla tutora
// ════════════════════════════════════════════════════════════════════════════

async function loadMakeupForTutor(
  supabase: Supabase,
  tutorId: string,
): Promise<TutorMakeupRow[]> {
  // Najpierw lekcje tutora (do filtra makeup_requests)
  const classIds = await loadTutorClassIds(supabase, tutorId)
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
          tutor_id,
          class:classes!lessons_class_id_fkey (
            level,
            form,
            student:students!classes_student_id_fkey (
              profile:profiles!students_profile_id_fkey ( first_name, last_name )
            ),
            group:groups!classes_group_id_fkey ( name )
          ),
          subject:subjects!lessons_subject_id_fkey ( name, color )
        ),
        proposals:makeup_proposals!makeup_proposals_request_id_fkey (
          round_number,
          proposed_by,
          proposed_by_id,
          action,
          proposed_date,
          proposed_start,
          proposed_end,
          note,
          created_at,
          actor_profile:profiles!makeup_proposals_proposed_by_id_fkey ( first_name, last_name )
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
      tutor_id: string
      class: {
        level: Enums<'student_level'>
        form: Enums<'class_form'>
        student: { profile: { first_name: string; last_name: string } } | null
        group: { name: string } | null
      }
      subject: { name: string; color: string }
    }
    proposals: Array<{
      round_number: number
      proposed_by: Enums<'makeup_actor'>
      proposed_by_id: string
      action: Enums<'makeup_action'>
      proposed_date: string | null
      proposed_start: string | null
      proposed_end: string | null
      note: string | null
      created_at: string
      actor_profile: { first_name: string; last_name: string } | null
    }>
  }
  const rows = (data ?? []) as unknown as MRow[]

  const today = new Date()
  const filtered = rows.filter((r) => r.original_lesson.tutor_id === tutorId)

  return filtered.map((r) => {
    const sorted = [...r.proposals].sort((a, b) => b.round_number - a.round_number)
    const latest = sorted[0] ?? null

    const studentLabel = r.original_lesson.class.group
      ? r.original_lesson.class.group.name
      : r.original_lesson.class.student
        ? `${r.original_lesson.class.student.profile.first_name} ${r.original_lesson.class.student.profile.last_name}`
        : '—'

    const initials = r.original_lesson.class.group
      ? r.original_lesson.class.group.name.slice(0, 2).toUpperCase()
      : r.original_lesson.class.student
        ? getInitials(
            r.original_lesson.class.student.profile.first_name,
            r.original_lesson.class.student.profile.last_name,
          )
        : '??'

    const daysLeft = r.deadline
      ? Math.ceil((new Date(r.deadline).getTime() - today.getTime()) / 86_400_000)
      : null

    return {
      requestId: r.id,
      originalLessonId: r.original_lesson.id,
      status: r.status,
      cancelReason: r.cancel_reason,
      originalDate: r.original_lesson.lesson_date,
      subjectName: r.original_lesson.subject.name,
      subjectColor: r.original_lesson.subject.color,
      level: r.original_lesson.class.level,
      levelLabel: LEVEL_LABELS[r.original_lesson.class.level],
      studentLabel,
      studentInitials: initials,
      studentColor: getAvatarColor(studentLabel),
      latestProposal: latest
        ? {
            round: latest.round_number,
            proposedBy: latest.proposed_by,
            proposedByName: latest.actor_profile
              ? `${latest.actor_profile.first_name} ${latest.actor_profile.last_name}`
              : latest.proposed_by === 'tutor'
                ? 'Ty'
                : 'Rodzic',
            action: latest.action,
            proposedDate: latest.proposed_date,
            proposedStart: latest.proposed_start?.slice(0, 5) ?? null,
            proposedEnd: latest.proposed_end?.slice(0, 5) ?? null,
            note: latest.note,
            createdAt: latest.created_at,
          }
        : null,
      history: sorted.map((p) => ({
        round: p.round_number,
        proposedBy: p.proposed_by,
        proposedByName: p.actor_profile
          ? `${p.actor_profile.first_name} ${p.actor_profile.last_name}`
          : p.proposed_by === 'tutor'
            ? 'Ty'
            : 'Rodzic',
        action: p.action,
        proposedDate: p.proposed_date,
        note: p.note,
        createdAt: p.created_at,
      })),
      deadline: r.deadline,
      daysLeftToDeadline: daysLeft,
      completedDate: r.completed_at,
    }
  })
}

// ════════════════════════════════════════════════════════════════════════════
// Students dla tutora
// ════════════════════════════════════════════════════════════════════════════

async function loadStudentsForTutor(supabase: Supabase, tutorId: string): Promise<TutorStudentRow[]> {
  const { data, error } = await supabase
    .from('classes')
    .select(
      `
        id,
        form,
        level,
        notes,
        start_date,
        student_id,
        group_id,
        student:students!classes_student_id_fkey (
          profile_id,
          school_class,
          profile:profiles!students_profile_id_fkey ( first_name, last_name ),
          parent:parents!students_parent_id_fkey (
            profile:profiles!parents_profile_id_fkey ( first_name, last_name )
          )
        ),
        group:groups!classes_group_id_fkey (
          id,
          name,
          members:group_members!group_members_group_id_fkey (
            left_at,
            student_id,
            student:students!group_members_student_id_fkey (
              profile_id,
              school_class,
              profile:profiles!students_profile_id_fkey ( first_name, last_name ),
              parent:parents!students_parent_id_fkey (
                profile:profiles!parents_profile_id_fkey ( first_name, last_name )
              )
            )
          )
        ),
        subject:subjects!classes_subject_id_fkey ( name, color ),
        slots:weekly_slots!weekly_slots_class_id_fkey (
          day_of_week,
          start_time,
          end_time
        )
      `,
    )
    .eq('tutor_id', tutorId)
    .eq('status', 'active')

  if (error) throw error

  type CRow = {
    id: string
    form: Enums<'class_form'>
    level: Enums<'student_level'>
    notes: string | null
    start_date: string
    student_id: string | null
    group_id: string | null
    student: {
      profile_id: string
      school_class: string
      profile: { first_name: string; last_name: string }
      parent: {
        profile: { first_name: string; last_name: string }
      } | null
    } | null
    group: {
      id: string
      name: string
      members: Array<{
        left_at: string | null
        student_id: string
        student: {
          profile_id: string
          school_class: string
          profile: { first_name: string; last_name: string }
          parent: {
            profile: { first_name: string; last_name: string }
          } | null
        }
      }>
    } | null
    subject: { name: string; color: string }
    slots: Array<{ day_of_week: number; start_time: string; end_time: string }>
  }
  const rows = (data ?? []) as unknown as CRow[]

  // Wszystkie lekcje tutora (do statystyk per klasa)
  const allLessons = await supabase
    .from('lessons')
    .select('class_id, status, lesson_date, entry:entries!entries_lesson_id_fkey ( topic, note_for_student, internal_note, homework:homework!homework_entry_id_fkey ( content ) )')
    .eq('tutor_id', tutorId)
    .order('lesson_date', { ascending: false })
  if (allLessons.error) throw allLessons.error

  type LStatRow = {
    class_id: string
    status: Enums<'lesson_status'>
    lesson_date: string
    entry: {
      topic: string | null
      note_for_student: string | null
      internal_note: string | null
      homework: { content: string } | null
    } | null
  }
  const lessons = (allLessons.data ?? []) as unknown as LStatRow[]

  const result: TutorStudentRow[] = []

  for (const c of rows) {
    const isGroup = c.form === 'group'
    const classLessons = lessons.filter((l) => l.class_id === c.id)
    const total = classLessons.length
    const cancelled = classLessons.filter((l) => l.status === 'cancelled').length
    const completed = classLessons.filter(
      (l) => l.status === 'completed' || l.status === 'completed_no_entry',
    ).length

    // Średnio per miesiąc — rough estimate: total / liczba miesięcy od start_date
    const monthsAgo = Math.max(
      1,
      Math.round((Date.now() - new Date(c.start_date).getTime()) / (30 * 86_400_000)),
    )
    const avgPerMonth = Math.round(total / monthsAgo)

    // Last lesson info
    const lastLesson = classLessons.find((l) => l.entry)
    const lastTopic = lastLesson?.entry?.topic ?? null
    const lastNote = lastLesson?.entry?.note_for_student ?? null
    const lastHomework = lastLesson?.entry?.homework?.content ?? null
    const internalNote = lastLesson?.entry?.internal_note ?? null

    // Schedule label: dni z czasami
    const scheduleLabel = c.slots
      .sort((a, b) => a.day_of_week - b.day_of_week)
      .map((s) => `${DAY_NAMES_SHORT[s.day_of_week]} ${s.start_time.slice(0, 5)}`)
      .join(', ')

    if (isGroup && c.group) {
      result.push({
        id: c.group.id,
        isGroup: true,
        name: c.group.name,
        initials: c.group.name.slice(0, 2).toUpperCase(),
        color: '#22C55E',
        schoolClass: '—',
        level: c.level,
        levelLabel: LEVEL_LABELS[c.level],
        subjectName: c.subject.name,
        subjectColor: c.subject.color,
        form: c.form,
        scheduleLabel,
        parentLabel: null,
        nextLessonLabel: null,
        classId: c.id,
        stats: {
          totalLessons: total,
          attended: null,
          cancelled,
          avgPerMonth,
        },
        lastTopic,
        lastHomework,
        lastNote,
        internalNote,
        groupMembers: c.group.members
          .filter((m) => !m.left_at)
          .map((m) => ({
            id: m.student.profile_id,
            fullName: `${m.student.profile.first_name} ${m.student.profile.last_name}`,
            initials: getInitials(m.student.profile.first_name, m.student.profile.last_name),
            schoolClass: m.student.school_class,
            parentName: m.student.parent
              ? `${m.student.parent.profile.first_name} ${m.student.parent.profile.last_name}`
              : null,
          })),
      })
    } else if (c.student) {
      const fullName = `${c.student.profile.first_name} ${c.student.profile.last_name}`
      const parentLabel = c.student.parent
        ? `${c.student.parent.profile.first_name} ${c.student.parent.profile.last_name}`
        : null
      result.push({
        id: c.student.profile_id,
        isGroup: false,
        name: fullName,
        initials: getInitials(c.student.profile.first_name, c.student.profile.last_name),
        color: getAvatarColor(fullName),
        schoolClass: c.student.school_class,
        level: c.level,
        levelLabel: LEVEL_LABELS[c.level],
        subjectName: c.subject.name,
        subjectColor: c.subject.color,
        form: c.form,
        scheduleLabel,
        parentLabel,
        nextLessonLabel: null,
        classId: c.id,
        stats: {
          totalLessons: total,
          attended: completed,
          cancelled,
          avgPerMonth,
        },
        lastTopic,
        lastHomework,
        lastNote,
        internalNote,
        groupMembers: [],
      })
    }
  }

  return result
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getTutorDashboard
// ════════════════════════════════════════════════════════════════════════════

export type TutorDashboardData = {
  tutor: TutorSummary
  todayLessons: TutorLessonRow[]
  missingEntries: TutorLessonRow[]
  incomingMakeup: TutorMakeupRow[]
  monthStats: {
    hoursDone: number
    hoursPlanned: number
    plannedRemaining: number
    cancelled: number
    grossEarningsZl: number
  }
}

export async function getTutorDashboard(
  supabase: Supabase,
  tutorId: string,
): Promise<TutorDashboardData> {
  const tutor = await loadTutorSummary(supabase, tutorId)
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = today.slice(0, 8) + '01'
  const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10)

  const [todayRaw, missingRaw, makeup, monthLessons, currentRate] = await Promise.all([
    loadLessonsForTutor(supabase, tutorId, { from: today, to: today, order: 'asc' }),
    loadLessonsForTutor(supabase, tutorId, {
      from: new Date(Date.now() - 5 * 86_400_000).toISOString().slice(0, 10),
      to: today,
      order: 'desc',
    }),
    loadMakeupForTutor(supabase, tutorId),
    loadLessonsForTutor(supabase, tutorId, { from: monthStart, to: monthEnd }),
    supabase
      .from('tutor_rates')
      .select('individual_rate, group_rate, effective_from')
      .eq('tutor_id', tutorId)
      .lte('effective_from', today)
      .order('effective_from', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  // Brakujące wpisy: lekcje completed bez wpisu, posortowane po hoursLeft rosnąco.
  const missingEntries = missingRaw
    .filter(
      (l) =>
        (l.status === 'completed' || l.status === 'completed_no_entry') &&
        (l.entryStatus === 'missing' || l.entryStatus === 'no_entry') &&
        l.hoursLeftForEntry !== null,
    )
    .sort((a, b) => (a.hoursLeftForEntry ?? 0) - (b.hoursLeftForEntry ?? 0))

  // Incoming makeup: status='waiting_for_tutor' (rodzic czeka na akceptację/odpowiedź)
  const incomingMakeup = makeup.filter((m) => m.status === 'waiting_for_tutor')

  // Stats miesiąca
  let hoursDone = 0
  let hoursPlanned = 0
  let plannedRemaining = 0
  let cancelled = 0
  let grossEarningsZl = 0

  const rate = currentRate.data
  for (const l of monthLessons) {
    const hours = l.durationMin / 60
    if (l.status === 'completed' || l.status === 'completed_no_entry') {
      hoursDone += hours
      hoursPlanned += hours
      if (rate) {
        const r = l.form === 'group' ? rate.group_rate : rate.individual_rate
        grossEarningsZl += hours * Number(r)
      }
    } else if (l.status === 'planned' || l.status === 'in_progress' || l.status === 'makeup') {
      hoursPlanned += hours
      plannedRemaining += 1
    } else if (l.status === 'cancelled') {
      cancelled += 1
    }
  }

  return {
    tutor,
    todayLessons: todayRaw,
    missingEntries: missingEntries.slice(0, 6),
    incomingMakeup,
    monthStats: {
      hoursDone: Math.round(hoursDone),
      hoursPlanned: Math.round(hoursPlanned),
      plannedRemaining,
      cancelled,
      grossEarningsZl: Math.round(grossEarningsZl),
    },
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getTutorSchedule (week view)
// ════════════════════════════════════════════════════════════════════════════

export type TutorScheduleData = {
  tutor: TutorSummary
  weekStart: string // Monday YYYY-MM-DD
  weekEnd: string
  days: Array<{
    dayOfWeek: number
    dateLabel: string
    dayFull: string
    dayShort: string
    isToday: boolean
    lessons: TutorLessonRow[]
  }>
}

export async function getTutorSchedule(
  supabase: Supabase,
  tutorId: string,
  weekStartIso?: string,
): Promise<TutorScheduleData> {
  const tutor = await loadTutorSummary(supabase, tutorId)
  const monday = weekStartIso ? new Date(weekStartIso) : getStartOfWeek(new Date())
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)

  const fromIso = monday.toISOString().slice(0, 10)
  const toIso = sunday.toISOString().slice(0, 10)
  const todayIso = new Date().toISOString().slice(0, 10)

  const lessons = await loadLessonsForTutor(supabase, tutorId, { from: fromIso, to: toIso })

  const days: TutorScheduleData['days'] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    const iso = d.toISOString().slice(0, 10)
    const dayLessons = lessons.filter((l) => l.date === iso)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    days.push({
      dayOfWeek: i,
      dateLabel: `${dd}.${mm}`,
      dayFull: DAY_NAMES_FULL[i]!,
      dayShort: DAY_NAMES_SHORT[i]!,
      isToday: iso === todayIso,
      lessons: dayLessons,
    })
  }

  return { tutor, weekStart: fromIso, weekEnd: toIso, days }
}

function getStartOfWeek(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  const day = out.getDay()
  const diff = day === 0 ? -6 : 1 - day // Sunday=0 → -6 backward to Monday
  out.setDate(out.getDate() + diff)
  return out
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getTutorDayView
// ════════════════════════════════════════════════════════════════════════════

export type TutorDayViewData = {
  tutor: TutorSummary
  date: string
  isToday: boolean
  dayFull: string
  lessons: TutorLessonRow[]
}

export async function getTutorDayView(
  supabase: Supabase,
  tutorId: string,
  dateIso?: string,
): Promise<TutorDayViewData> {
  const tutor = await loadTutorSummary(supabase, tutorId)
  const target = dateIso ?? new Date().toISOString().slice(0, 10)
  const dayIdx = new Date(target).getDay()
  const dayOfWeekIdx = (dayIdx + 6) % 7

  const lessons = await loadLessonsForTutor(supabase, tutorId, { from: target, to: target })

  return {
    tutor,
    date: target,
    isToday: target === new Date().toISOString().slice(0, 10),
    dayFull: DAY_NAMES_FULL[dayOfWeekIdx]!,
    lessons,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getTutorStudents
// ════════════════════════════════════════════════════════════════════════════

export type TutorStudentsData = {
  tutor: TutorSummary
  students: TutorStudentRow[]
}

export async function getTutorStudents(
  supabase: Supabase,
  tutorId: string,
): Promise<TutorStudentsData> {
  const [tutor, students] = await Promise.all([
    loadTutorSummary(supabase, tutorId),
    loadStudentsForTutor(supabase, tutorId),
  ])
  return { tutor, students }
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getTutorLessons (dziennik wpisów)
// ════════════════════════════════════════════════════════════════════════════

export type TutorLessonsData = {
  tutor: TutorSummary
  missingEntries: TutorLessonRow[]
  recentEntries: Array<TutorLessonRow & {
    entry: {
      topic: string | null
      hasHomework: boolean
    }
  }>
}

export async function getTutorLessons(
  supabase: Supabase,
  tutorId: string,
): Promise<TutorLessonsData> {
  const tutor = await loadTutorSummary(supabase, tutorId)
  const today = new Date().toISOString().slice(0, 10)
  const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)

  // Missing entries
  const missing = await loadLessonsForTutor(supabase, tutorId, {
    from: monthAgo,
    to: today,
    order: 'desc',
  })
  const missingEntries = missing
    .filter(
      (l) =>
        (l.status === 'completed' || l.status === 'completed_no_entry') &&
        (l.entryStatus === 'missing' || l.entryStatus === 'no_entry'),
    )
    .filter((l) => l.hoursLeftForEntry !== null && l.hoursLeftForEntry > 0)

  // Recent entries: lekcje z opublikowanym/draft/locked wpisem
  // Pobieramy lekcje + entry.topic + homework count w jednym strzale.
  const recent = await supabase
    .from('lessons')
    .select(
      `
        id,
        lesson_date,
        start_time,
        end_time,
        status,
        cancel_reason,
        class_id,
        class:classes!lessons_class_id_fkey (
          form, level,
          student:students!classes_student_id_fkey (
            profile_id,
            profile:profiles!students_profile_id_fkey ( first_name, last_name )
          ),
          group:groups!classes_group_id_fkey (
            id, name,
            members:group_members!group_members_group_id_fkey (
              left_at, student_id,
              student:students!group_members_student_id_fkey (
                profile_id,
                profile:profiles!students_profile_id_fkey ( first_name, last_name )
              )
            )
          )
        ),
        subject:subjects!lessons_subject_id_fkey ( name, color ),
        room:rooms!lessons_room_id_fkey ( name ),
        entry:entries!entries_lesson_id_fkey (
          id, status, topic,
          homework:homework!homework_entry_id_fkey ( id )
        )
      `,
    )
    .eq('tutor_id', tutorId)
    .gte('lesson_date', monthAgo)
    .order('lesson_date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(40)
  if (recent.error) throw recent.error

  type LRow = LessonQueryRow & {
    entry: {
      id: string
      status: Enums<'entry_status'>
      topic: string | null
      homework: { id: string } | null
    } | null
  }
  const rrows = (recent.data ?? []) as unknown as LRow[]

  const recentEntries = rrows
    .filter((r) => r.entry !== null)
    .map((r) => ({
      ...mapLesson(r),
      entry: {
        topic: r.entry?.topic ?? null,
        hasHomework: Boolean(r.entry?.homework),
      },
    }))

  return { tutor, missingEntries, recentEntries }
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getTutorMakeup
// ════════════════════════════════════════════════════════════════════════════

export type TutorMakeupData = {
  tutor: TutorSummary
  pending: TutorMakeupRow[] // rodzic wysłał propozycję, czekamy na tutora
  sent: TutorMakeupRow[] // tutor wysłał propozycję, czekamy na rodzica
  accepted: TutorMakeupRow[]
  history: TutorMakeupRow[]
}

export async function getTutorMakeup(
  supabase: Supabase,
  tutorId: string,
): Promise<TutorMakeupData> {
  const [tutor, makeup] = await Promise.all([
    loadTutorSummary(supabase, tutorId),
    loadMakeupForTutor(supabase, tutorId),
  ])

  return {
    tutor,
    pending: makeup.filter((m) => m.status === 'waiting_for_tutor'),
    sent: makeup.filter((m) => m.status === 'waiting_for_parent'),
    accepted: makeup.filter((m) => m.status === 'accepted'),
    history: makeup.filter(
      (m) => m.status === 'completed' || m.status === 'rejected' || m.status === 'expired',
    ),
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: getTutorAvailability
// ════════════════════════════════════════════════════════════════════════════

export type AvailabilityBlock = {
  dayOfWeek: number
  dayShort: string
  dayFull: string
  startTime: string
  endTime: string
  /** ID rekordu — do potencjalnej edycji. */
  id: string
}

export type TutorAvailabilityData = {
  tutor: TutorSummary
  baseline: AvailabilityBlock[]
  totalWeeklyHours: number
  extraSlots: ExtraSlotRow[]
  absences: TutorAbsenceRow[]
}

export async function getTutorAvailability(
  supabase: Supabase,
  tutorId: string,
): Promise<TutorAvailabilityData> {
  const today = new Date().toISOString().slice(0, 10)
  const tutor = await loadTutorSummary(supabase, tutorId)

  const [blocks, extras, absences] = await Promise.all([
    supabase
      .from('availability_blocks')
      .select('id, day_of_week, start_time, end_time')
      .eq('tutor_id', tutorId)
      .order('day_of_week')
      .order('start_time'),
    supabase
      .from('extra_slots')
      .select(
        `
          id, slot_date, start_time, end_time, note, status,
          room:rooms!extra_slots_room_id_fkey ( name )
        `,
      )
      .eq('tutor_id', tutorId)
      .gte('slot_date', today)
      .order('slot_date'),
    supabase
      .from('tutor_absences')
      .select('id, absence_type, start_date, end_date, reason, approved_at, affected_lessons_count')
      .eq('tutor_id', tutorId)
      .gte('end_date', today)
      .order('start_date'),
  ])
  if (blocks.error) throw blocks.error
  if (extras.error) throw extras.error
  if (absences.error) throw absences.error

  const baseline: AvailabilityBlock[] = (blocks.data ?? []).map((b) => ({
    id: b.id,
    dayOfWeek: b.day_of_week,
    dayShort: DAY_NAMES_SHORT[b.day_of_week]!,
    dayFull: DAY_NAMES_FULL[b.day_of_week]!,
    startTime: b.start_time.slice(0, 5),
    endTime: b.end_time.slice(0, 5),
  }))

  const totalWeeklyHours = baseline.reduce((sum, b) => {
    return sum + computeDurationMinutes(b.startTime, b.endTime) / 60
  }, 0)

  type ExtraQuery = {
    id: string
    slot_date: string
    start_time: string
    end_time: string
    note: string | null
    status: string
    room: { name: string } | null
  }
  const extraRows = (extras.data ?? []) as unknown as ExtraQuery[]
  const extraSlots: ExtraSlotRow[] = extraRows.map((e) => ({
    id: e.id,
    date: e.slot_date,
    startTime: e.start_time.slice(0, 5),
    endTime: e.end_time.slice(0, 5),
    roomName: e.room?.name ?? null,
    note: e.note,
    status: e.status,
  }))

  const absenceRows: TutorAbsenceRow[] = (absences.data ?? []).map((a) => ({
    id: a.id,
    type: a.absence_type,
    startDate: a.start_date,
    endDate: a.end_date,
    reason: a.reason,
    approvedAt: a.approved_at,
    affectedLessonsCount: a.affected_lessons_count,
  }))

  return {
    tutor,
    baseline,
    totalWeeklyHours: Math.round(totalWeeklyHours * 10) / 10,
    extraSlots,
    absences: absenceRows,
  }
}

/**
 * Batch-fetch poprzednich lekcji dla zbioru lekcji.
 * Dla każdej `lesson` znajduje ostatnią completed-z-entry lekcję w tej samej klasie
 * przed datą tej lekcji. Zwraca Map<lessonId, hint>.
 */
export async function loadPrevHintsBatch(
  supabase: Supabase,
  lessons: Array<{ id: string; classId: string; date: string; startTime: string }>,
): Promise<Map<string, PreviousLessonHint>> {
  if (lessons.length === 0) return new Map()
  const classIds = Array.from(new Set(lessons.map((l) => l.classId)))

  // Pobierz wszystkie completed/completed_no_entry lekcje z entry dla tych klas.
  const { data, error } = await supabase
    .from('lessons')
    .select(
      `
        id,
        class_id,
        lesson_date,
        start_time,
        entry:entries!entries_lesson_id_fkey (
          topic,
          note_for_student,
          homework:homework!homework_entry_id_fkey ( content )
        )
      `,
    )
    .in('class_id', classIds)
    .in('status', ['completed', 'completed_no_entry'])
    .order('lesson_date', { ascending: false })
    .order('start_time', { ascending: false })
  if (error) throw error

  type Row = {
    id: string
    class_id: string
    lesson_date: string
    start_time: string
    entry: {
      topic: string | null
      note_for_student: string | null
      homework: { content: string } | null
    } | null
  }
  const rows = (data ?? []) as unknown as Row[]

  // Pogrupuj po classId (już posortowane desc).
  const byClass = new Map<string, Row[]>()
  for (const r of rows) {
    const arr = byClass.get(r.class_id) ?? []
    arr.push(r)
    byClass.set(r.class_id, arr)
  }

  const result = new Map<string, PreviousLessonHint>()
  for (const l of lessons) {
    const cands = byClass.get(l.classId) ?? []
    const prev = cands.find(
      (c) =>
        c.lesson_date < l.date ||
        (c.lesson_date === l.date && c.start_time < l.startTime),
    )
    if (prev) {
      result.set(l.id, {
        lessonId: prev.id,
        date: prev.lesson_date,
        topic: prev.entry?.topic ?? null,
        noteForStudent: prev.entry?.note_for_student ?? null,
        homework: prev.entry?.homework?.content ?? null,
      })
    }
  }
  return result
}

/**
 * Pomocnicze do badge'a sidebar — liczba pending makeup od rodziców (czekają na tutora).
 */
export async function getTutorPendingMakeupCount(
  supabase: Supabase,
  tutorId: string,
): Promise<number> {
  // Wszystkie classes tutora
  const { data: classRows, error } = await supabase
    .from('classes')
    .select('id')
    .eq('tutor_id', tutorId)
    .eq('status', 'active')
  if (error) throw error
  const classIds = (classRows ?? []).map((c) => c.id)
  if (classIds.length === 0) return 0

  // Najpierw lekcje tutora w tych klasach
  const { data: lessonRows } = await supabase
    .from('lessons')
    .select('id')
    .in('class_id', classIds)
  const lessonIds = (lessonRows ?? []).map((l) => l.id)
  if (lessonIds.length === 0) return 0

  const { count } = await supabase
    .from('makeup_requests')
    .select('id', { count: 'exact', head: true })
    .in('original_lesson_id', lessonIds)
    .eq('status', 'waiting_for_tutor')

  return count ?? 0
}
