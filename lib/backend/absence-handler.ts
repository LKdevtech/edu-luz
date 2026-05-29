import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import { sendLessonCancellation } from '@/lib/email/resend'
import type { Database } from '@/lib/types/database.types'
import { formatPolishDate } from '@/lib/utils/date'

// Auto-odwoływanie lekcji + powiadomienia.
//
// UWAGA do schematu:
//   • lesson_status nie ma 'cancelled_by_tutor' — używamy 'cancelled' i zapisujemy
//     przyczynę w lessons.cancel_reason.
//   • notifications.type ∈ (lesson_change, payment_reminder, absence, entry_added,
//     admin_message) — dla odwołania używamy 'lesson_change'.
//   • Odwołanie z powodu nieobecności korepetytora UPRAWNIA do odrabiania, więc
//     ustawiamy cancelled_more_than_24h = true (gate prawa do makeup).

type Supabase = SupabaseClient<Database>
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

export type AbsenceReport = {
  absenceId: string
  lessonsCancelled: number
  notificationsCreated: number
  emailsSent: number
}

export type CancelLessonReport = {
  lessonId: string
  cancelled: boolean
  notificationsCreated: number
  emailsSent: number
}

type CancelledLessonInfo = {
  id: string
  lessonDate: string
  startTime: string
  endTime: string
  studentId: string | null
  groupId: string | null
  subjectName: string
  tutorName: string
}

type LessonQueryRow = {
  id: string
  lesson_date: string
  start_time: string
  end_time: string
  subject: { name: string } | null
  class: { student_id: string | null; group_id: string | null } | null
  tutor: { profile: { first_name: string; last_name: string } | null } | null
}

const LESSON_SELECT = `
  id, lesson_date, start_time, end_time,
  subject:subjects!lessons_subject_id_fkey ( name ),
  class:classes!lessons_class_id_fkey ( student_id, group_id ),
  tutor:tutors!lessons_tutor_id_fkey ( profile:profiles!tutors_profile_id_fkey ( first_name, last_name ) )
`

function toInfo(row: LessonQueryRow): CancelledLessonInfo {
  const t = row.tutor?.profile
  return {
    id: row.id,
    lessonDate: row.lesson_date,
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    studentId: row.class?.student_id ?? null,
    groupId: row.class?.group_id ?? null,
    subjectName: row.subject?.name ?? 'Zajęcia',
    tutorName: t ? `${t.first_name} ${t.last_name}` : 'korepetytor',
  }
}

/**
 * Wspólne: dla zbioru już-odwołanych lekcji tworzy powiadomienia (uczeń + rodzic)
 * i — jeśli skonfigurowano RESEND_API_KEY — wysyła maile do rodziców.
 */
async function notifyForLessons(
  supabase: Supabase,
  lessons: CancelledLessonInfo[],
  reason: string,
): Promise<{ notificationsCreated: number; emailsSent: number }> {
  if (lessons.length === 0) return { notificationsCreated: 0, emailsSent: 0 }

  // 1. Rozwiń uczniów per lekcja (indyw. → 1, grupa → członkowie aktywni).
  const groupIds = Array.from(
    new Set(lessons.map((l) => l.groupId).filter((g): g is string => Boolean(g))),
  )
  const membersByGroup = new Map<string, string[]>()
  if (groupIds.length > 0) {
    const { data: members, error } = await supabase
      .from('group_members')
      .select('group_id, student_id')
      .in('group_id', groupIds)
      .is('left_at', null)
    if (error) throw error
    for (const m of members ?? []) {
      const list = membersByGroup.get(m.group_id) ?? []
      list.push(m.student_id)
      membersByGroup.set(m.group_id, list)
    }
  }

  const studentIdsByLesson = new Map<string, string[]>()
  for (const l of lessons) {
    const ids = l.studentId ? [l.studentId] : l.groupId ? membersByGroup.get(l.groupId) ?? [] : []
    studentIdsByLesson.set(l.id, ids)
  }

  // 2. Dane uczniów + rodziców (imię ucznia, id/imię/email rodzica).
  const allStudentIds = Array.from(new Set(Array.from(studentIdsByLesson.values()).flat()))
  type StudentInfo = {
    studentName: string
    parentId: string
    parentName: string
    parentEmail: string | null
  }
  const studentInfo = new Map<string, StudentInfo>()
  if (allStudentIds.length > 0) {
    const { data: rows, error } = await supabase
      .from('students')
      .select(
        `
          profile_id,
          parent_id,
          student_profile:profiles!students_profile_id_fkey ( first_name, last_name ),
          parent:parents!students_parent_id_fkey (
            parent_profile:profiles!parents_profile_id_fkey ( first_name, last_name, email )
          )
        `,
      )
      .in('profile_id', allStudentIds)
    if (error) throw error

    type SRow = {
      profile_id: string
      parent_id: string
      student_profile: { first_name: string; last_name: string } | null
      parent: { parent_profile: { first_name: string; last_name: string; email: string | null } | null } | null
    }
    for (const r of (rows ?? []) as unknown as SRow[]) {
      const sp = r.student_profile
      const pp = r.parent?.parent_profile
      studentInfo.set(r.profile_id, {
        studentName: sp ? `${sp.first_name} ${sp.last_name}` : 'uczeń',
        parentId: r.parent_id,
        parentName: pp ? `${pp.first_name} ${pp.last_name}` : 'Rodzicu',
        parentEmail: pp?.email ?? null,
      })
    }
  }

  // 3. Buduj powiadomienia (uczeń + rodzic) i listę maili.
  const notifications: NotificationInsert[] = []
  const emailJobs: Array<{
    recipientEmail: string
    recipientName: string
    lessonDate: string
    lessonTime: string
    subject: string
    tutorName: string
    reason: string
  }> = []
  const sendEmails = Boolean(process.env.RESEND_API_KEY)

  for (const l of lessons) {
    const dateLabel = formatPolishDate(l.lessonDate)
    const timeLabel = `${l.startTime}–${l.endTime}`
    for (const studentId of studentIdsByLesson.get(l.id) ?? []) {
      const info = studentInfo.get(studentId)
      if (!info) continue

      notifications.push({
        user_id: studentId,
        type: 'lesson_change',
        title: 'Lekcja odwołana',
        message: `Twoja lekcja ${l.subjectName} (${dateLabel}, ${timeLabel}) została odwołana. ${reason}`,
      })
      notifications.push({
        user_id: info.parentId,
        type: 'lesson_change',
        title: 'Lekcja odwołana',
        message: `Lekcja ${l.subjectName} dla ${info.studentName} (${dateLabel}, ${timeLabel}) została odwołana. ${reason}`,
      })

      if (sendEmails && info.parentEmail) {
        emailJobs.push({
          recipientEmail: info.parentEmail,
          recipientName: info.parentName,
          lessonDate: dateLabel,
          lessonTime: timeLabel,
          subject: l.subjectName,
          tutorName: l.tutorName,
          reason,
        })
      }
    }
  }

  let notificationsCreated = 0
  if (notifications.length > 0) {
    const { error } = await supabase.from('notifications').insert(notifications)
    if (error) throw error
    notificationsCreated = notifications.length
  }

  let emailsSent = 0
  for (const job of emailJobs) {
    const res = await sendLessonCancellation(job)
    if (res.ok) emailsSent += 1
  }

  return { notificationsCreated, emailsSent }
}

/**
 * Po zatwierdzeniu nieobecności korepetytora: odwołuje wszystkie jego lekcje
 * 'planned' w zakresie dat (i godzin, jeśli nieobecność częściowa), tworzy
 * powiadomienia i — opcjonalnie — wysyła maile do rodziców.
 */
export async function handleApprovedAbsence(
  supabase: Supabase,
  absenceId: string,
): Promise<AbsenceReport> {
  const { data: absence, error: absErr } = await supabase
    .from('tutor_absences')
    .select('id, tutor_id, start_date, end_date, start_time, end_time, reason')
    .eq('id', absenceId)
    .single()
  if (absErr) throw absErr

  // Lekcje korepetytora w zakresie dat, jeszcze zaplanowane.
  const { data: lessonData, error: lessonErr } = await supabase
    .from('lessons')
    .select(LESSON_SELECT)
    .eq('tutor_id', absence.tutor_id)
    .eq('status', 'planned')
    .gte('lesson_date', absence.start_date)
    .lte('lesson_date', absence.end_date)
  if (lessonErr) throw lessonErr

  let lessons = ((lessonData ?? []) as unknown as LessonQueryRow[]).map(toInfo)

  // Nieobecność częściowa (z godzinami) → tylko nakładające się lekcje.
  if (absence.start_time && absence.end_time) {
    const aStart = absence.start_time.slice(0, 5)
    const aEnd = absence.end_time.slice(0, 5)
    lessons = lessons.filter((l) => l.startTime < aEnd && l.endTime > aStart)
  }

  if (lessons.length === 0) {
    return { absenceId, lessonsCancelled: 0, notificationsCreated: 0, emailsSent: 0 }
  }

  const reason = `Nieobecność korepetytora${absence.reason ? `: ${absence.reason}` : '.'}`
  const lessonIds = lessons.map((l) => l.id)

  const { error: updErr } = await supabase
    .from('lessons')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: absence.tutor_id,
      cancel_reason: reason,
      cancelled_more_than_24h: true,
    })
    .in('id', lessonIds)
  if (updErr) throw updErr

  const { notificationsCreated, emailsSent } = await notifyForLessons(supabase, lessons, reason)

  // Snapshot liczby odwołanych lekcji na nieobecności (kolumna w schemacie).
  await supabase
    .from('tutor_absences')
    .update({ affected_lessons_count: lessons.length })
    .eq('id', absenceId)

  return {
    absenceId,
    lessonsCancelled: lessons.length,
    notificationsCreated,
    emailsSent,
  }
}

/**
 * Odwołanie pojedynczej lekcji z powiadomieniami — do użytku z UI admina.
 */
export async function cancelLessonAndNotify(
  supabase: Supabase,
  lessonId: string,
  reason: string,
): Promise<CancelLessonReport> {
  const { data: lessonRow, error: lessonErr } = await supabase
    .from('lessons')
    .select(LESSON_SELECT)
    .eq('id', lessonId)
    .single()
  if (lessonErr) throw lessonErr

  const info = toInfo(lessonRow as unknown as LessonQueryRow)
  const reasonText = reason.trim() || 'Lekcja odwołana przez centrum.'

  const lessonStart = new Date(`${info.lessonDate}T${lessonRow.start_time}`)
  const moreThan24h = lessonStart.getTime() - Date.now() > 24 * 60 * 60 * 1000

  const { error: updErr } = await supabase
    .from('lessons')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancel_reason: reasonText,
      cancelled_more_than_24h: moreThan24h,
    })
    .eq('id', lessonId)
  if (updErr) throw updErr

  const { notificationsCreated, emailsSent } = await notifyForLessons(supabase, [info], reasonText)

  return { lessonId, cancelled: true, notificationsCreated, emailsSent }
}
