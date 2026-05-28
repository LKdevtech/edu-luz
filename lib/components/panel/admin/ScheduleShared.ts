// Wspólne typy + stałe dla widoku harmonogramu admina.
// Kolory/symbole statusów 1:1 z mockupem edu-luz-admin-schedule.jsx.
import type { Enums } from '@/lib/types/database.types'

export const T = {
  bg: '#151827',
  bgAlt: '#1C2035',
  surface: '#232840',
  surfaceHover: '#2A3050',
  text: '#F0EDE6',
  textMuted: '#9B97AF',
  textDim: '#6B6780',
  primary: '#3B8FF0',
  secondary: '#FF6F4A',
  tertiary: '#FFCA28',
  accent: '#7C5CFC',
  success: '#22C55E',
  cyan: '#06B6D4',
  danger: '#EF4444',
  pink: '#E84393',
  cardBorder: 'rgba(59,143,240,0.10)',
} as const

export const DASH = '–'
export const DOT = '·'

export const SUBJECT_ABBR: Record<string, string> = {
  Matematyka: 'MAT',
  Angielski: 'ANG',
  Fizyka: 'FIZ',
  Chemia: 'CHE',
  Polski: 'POL',
  Elektrotechnika: 'ELE',
}

export const SUBJECT_COLOR: Record<string, string> = {
  Matematyka: '#3B8FF0',
  Angielski: '#06B6D4',
  Fizyka: '#F59E0B',
  Chemia: '#22C55E',
  Polski: '#E84393',
  Elektrotechnika: '#FF6F4A',
}

// Poziomy (DB enum → etykieta i kolor)
export const LEVEL_LABEL: Record<Enums<'student_level'>, string> = {
  SP: 'SP',
  E8: 'E8',
  SR: 'ŚR',
  SR_EXT: 'ŚR★',
  EM: 'EM',
  EM_EXT: 'EM★',
}
export const LEVEL_COLOR: Record<Enums<'student_level'>, string> = {
  SP: T.cyan,
  E8: T.tertiary,
  SR: T.primary,
  SR_EXT: T.accent,
  EM: T.danger,
  EM_EXT: T.pink,
}

export type StatusMeta = { symbol: string; label: string; color: string; bg: string }

// Mapowanie statusów DB → wygląd z mockupu.
// 'completed' = z wpisem (zielony), 'completed_no_entry' = brak wpisu (żółty).
export const STATUS_META: Record<Enums<'lesson_status'>, StatusMeta> = {
  completed: { symbol: '✓', label: 'Zrealizowana (z wpisem)', color: T.success, bg: T.success + '15' },
  completed_no_entry: {
    symbol: '✓',
    label: 'Zrealizowana (brak wpisu)',
    color: T.tertiary,
    bg: T.tertiary + '12',
  },
  in_progress: { symbol: '●', label: 'W trakcie', color: T.tertiary, bg: T.tertiary + '15' },
  planned: { symbol: '○', label: 'Zaplanowana', color: T.primary, bg: T.primary + '12' },
  cancelled: { symbol: '✕', label: 'Odwołana', color: T.danger, bg: T.danger + '12' },
  no_show: { symbol: '⊘', label: 'No-show', color: T.secondary, bg: T.secondary + '12' },
  makeup: { symbol: '↻', label: 'Odrabianie', color: T.accent, bg: T.accent + '12' },
}

// Kolejność legendy/statystyk — jak w mockupie.
export const STATUS_ORDER: Array<Enums<'lesson_status'>> = [
  'completed',
  'completed_no_entry',
  'in_progress',
  'planned',
  'cancelled',
  'no_show',
  'makeup',
]

// Lekcja przekazywana do widoku (znormalizowana z getAdminSchedule).
export type ScheduleLesson = {
  id: string
  dayIdx: number // 0=Pon ... 5=Sob
  start: number // godzina dziesiętna, np. 9.5
  end: number
  startLabel: string // "9:00"
  endLabel: string
  status: Enums<'lesson_status'>
  tutorId: string
  tutorName: string
  tutorInitials: string
  roomId: string | null
  roomName: string
  subjectName: string
  studentLabel: string
  type: string // "indyw." | "grupa" | "para"
  level: Enums<'student_level'> | null
}

export type ScheduleTutor = { id: string; fullName: string; initials: string; subjects: string[] }
export type ScheduleRoom = { id: string; name: string }

// Dostępność: dla każdego tutora 6 dni (Pon–Sob), każdy dzień = lista bloków [od,do] lub null.
export type AvailRange = [number, number]
export type TutorAvailability = Array<AvailRange[] | null>

export function fmtTime(dec: number): string {
  const h = Math.floor(dec)
  const m = Math.round((dec - h) * 60)
  return h + ':' + String(m).padStart(2, '0')
}
export function fmtRange(s: number, e: number): string {
  return fmtTime(s) + DASH + fmtTime(e)
}

export function isAvailHour(ranges: AvailRange[] | null | undefined, h: number): boolean {
  if (!ranges) return false
  return ranges.some(([s, e]) => h >= s && h < e)
}

export const WEEK_DAYS_FULL = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota']
