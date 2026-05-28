import { AdminScheduleView } from '@/lib/components/panel/admin/AdminScheduleView'
import { DASH, type AvailRange, type ScheduleLesson, type TutorAvailability } from '@/lib/components/panel/admin/ScheduleShared'
import { getAdminSchedule } from '@/lib/queries/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Enums } from '@/lib/types/database.types'

export const dynamic = 'force-dynamic'

type SearchParams = {
  view?: string
  mode?: string
  by?: string
  tutor?: string
  room?: string
  week?: string
}

const DAY_SHORT = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob']

// Czas "HH:MM" → godzina dziesiętna (9:30 → 9.5)
function toDecimal(hm: string): number {
  const [h, m] = hm.split(':').map(Number)
  return (h ?? 0) + (m ?? 0) / 60
}

// Etykieta formy zajęć z enuma class_form: grupa = "grupa", indywidualne/para = "indyw.".
function formLabel(form: Enums<'class_form'> | null): string {
  return form === 'group' ? 'grupa' : 'indyw.'
}

export default async function AdminSchedulePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createSupabaseServerClient()
  const data = await getAdminSchedule(supabase, searchParams.week)

  // ── Konfiguracja widoku z URL ──
  const view = (['day', 'week', 'avail'].includes(searchParams.view ?? '') ? searchParams.view : 'week') as
    | 'day'
    | 'week'
    | 'avail'
  const detailLevel = (searchParams.mode === 'compact' ? 'compact' : 'detailed') as 'detailed' | 'compact'
  const filterBy = (searchParams.by === 'room' ? 'room' : 'tutor') as 'tutor' | 'room'

  const filterTutorId =
    searchParams.tutor && data.tutors.some((t) => t.id === searchParams.tutor)
      ? searchParams.tutor
      : data.tutors[0]?.id ?? ''
  const filterRoomId =
    searchParams.room && data.rooms.some((r) => r.id === searchParams.room)
      ? searchParams.room
      : data.rooms[0]?.id ?? ''

  // ── Dni tygodnia (Pon–Sob) ──
  const monday = new Date(data.weekStart)
  const today = new Date().toISOString().slice(0, 10)
  let todayIdx = -1
  const dayIsoByIdx: string[] = []
  const weekDayLabels: string[] = []
  for (let i = 0; i < 6; i++) {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    const iso = d.toISOString().slice(0, 10)
    dayIsoByIdx.push(iso)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    weekDayLabels.push(`${DAY_SHORT[i]} ${dd}.${mm}`)
    if (iso === today) todayIdx = i
  }
  const isoToIdx = new Map(dayIsoByIdx.map((iso, i) => [iso, i]))

  // Etykieta dnia (nagłówek widoku Dzień) — dziś jeśli w tygodniu, inaczej poniedziałek.
  const headerDayIdx = todayIdx >= 0 ? todayIdx : 0
  const headerDate = new Date(dayIsoByIdx[headerDayIdx]!)
  const dayHeaderLabel = `${DAY_SHORT[headerDayIdx]} ${String(headerDate.getDate()).padStart(2, '0')}.${String(
    headerDate.getMonth() + 1,
  ).padStart(2, '0')}.${headerDate.getFullYear()}`

  // Zakres tygodnia "16–21.06.2026"
  const wStart = new Date(data.weekStart)
  const wEnd = new Date(dayIsoByIdx[5]!)
  const weekRangeLabel = `${String(wStart.getDate()).padStart(2, '0')}${DASH}${String(wEnd.getDate()).padStart(
    2,
    '0',
  )}.${String(wEnd.getMonth() + 1).padStart(2, '0')}.${wEnd.getFullYear()}`

  // ── Lekcje znormalizowane (tylko Pon–Sob) ──
  const lessons: ScheduleLesson[] = data.lessons
    .filter((l) => isoToIdx.has(l.date))
    .map((l) => ({
      id: l.id,
      dayIdx: isoToIdx.get(l.date)!,
      start: toDecimal(l.startTime),
      end: toDecimal(l.endTime),
      startLabel: l.startTime,
      endLabel: l.endTime,
      status: l.status,
      tutorId: l.tutorId,
      tutorName: l.tutorName,
      tutorInitials: data.tutors.find((t) => t.id === l.tutorId)?.initials ?? l.tutorName.slice(0, 2).toUpperCase(),
      roomId: l.roomId,
      roomName: l.roomName ?? '—',
      subjectName: l.subjectName,
      studentLabel: l.studentLabel,
      type: formLabel(l.form),
      level: l.level,
    }))

  // ── Tutorzy z przedmiotami (z lekcji w tym tygodniu) ──
  const subjectsByTutor = new Map<string, Set<string>>()
  for (const l of lessons) {
    const set = subjectsByTutor.get(l.tutorId) ?? new Set<string>()
    set.add(l.subjectName)
    subjectsByTutor.set(l.tutorId, set)
  }
  const tutors = data.tutors.map((t) => ({
    id: t.id,
    fullName: t.fullName,
    initials: t.initials,
    subjects: Array.from(subjectsByTutor.get(t.id) ?? []),
  }))

  // ── Dostępność (degradacja: brak w zapytaniu → syntetyzujemy z faktycznych lekcji) ──
  // Dla każdego tutora i dnia: blok obejmujący min(start)–max(end) zaokrąglony do pełnych godzin,
  // rozszerzony do min. 9–16; dzień bez lekcji = brak dostępności (null) tylko gdy tutor nie ma żadnej lekcji w tygodniu.
  const availability: Record<string, TutorAvailability> = {}
  for (const t of data.tutors) {
    const tutorLessons = lessons.filter((l) => l.tutorId === t.id && l.status !== 'cancelled')
    const hasAnyThisWeek = tutorLessons.length > 0
    const days: TutorAvailability = []
    for (let di = 0; di < 6; di++) {
      const dl = tutorLessons.filter((l) => l.dayIdx === di)
      if (dl.length === 0) {
        // Pon–Pt: domyślnie dostępny 9–16 jeśli tutor w ogóle pracuje w tym tygodniu; Sob: wolne.
        days.push(hasAnyThisWeek && di < 5 ? [[9, 16] as AvailRange] : null)
        continue
      }
      const minStart = Math.min(...dl.map((l) => Math.floor(l.start)))
      const maxEnd = Math.max(...dl.map((l) => Math.ceil(l.end)))
      const from = Math.min(9, minStart)
      const to = Math.max(16, maxEnd)
      days.push([[Math.max(7, from), Math.min(21, to)] as AvailRange])
    }
    availability[t.id] = days
  }

  // ── Linia "teraz" (tylko gdy dziś w tygodniu) ──
  const nowDecimal = todayIdx >= 0 ? toDecimal(new Date().toTimeString().slice(0, 5)) : null

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <AdminScheduleView
        lessons={lessons}
        tutors={tutors}
        rooms={data.rooms}
        availability={availability}
        weekDayLabels={weekDayLabels}
        dayHeaderLabel={dayHeaderLabel}
        weekRangeLabel={weekRangeLabel}
        todayIdx={todayIdx}
        nowDecimal={nowDecimal}
        weekStart={data.weekStart}
        view={view}
        detailLevel={detailLevel}
        filterBy={filterBy}
        filterTutorId={filterTutorId}
        filterRoomId={filterRoomId}
      />
    </div>
  )
}
