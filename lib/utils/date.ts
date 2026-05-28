const DAY_SHORT = ['Ndz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'] as const

/**
 * Polski label daty: "Dziś", "Jutro", "Pon 24.05".
 * Wejście: 'YYYY-MM-DD' (lessons.lesson_date).
 */
export function formatLessonDate(isoDate: string): string {
  const d = new Date(isoDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)

  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000)
  if (diffDays === 0) return 'Dziś'
  if (diffDays === 1) return 'Jutro'
  if (diffDays === -1) return 'Wczoraj'

  const dayShort = DAY_SHORT[d.getDay()]!
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dayShort} ${dd}.${mm}`
}

/**
 * Polski format "DD.MM.YYYY".
 */
export function formatPolishDate(isoDate: string): string {
  const d = new Date(isoDate)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getFullYear()}`
}

/**
 * Polski wiek z daty urodzenia w prosty sposób (do labelu profilu).
 */
export function formatBirthDate(isoDate: string): string {
  return formatPolishDate(isoDate)
}
