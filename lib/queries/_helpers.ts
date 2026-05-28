import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/types/database.types'

type Supabase = SupabaseClient<Database>

/**
 * Wszystkie active classes danego ucznia — indywidualne, w parze, i grupowe
 * (poprzez group_members → group_id → classes.group_id).
 *
 * Zwraca listę class_id (rdzeń) wykorzystywany przez większość query helpers
 * do wyszukania lessons / entries / payment_lines etc.
 */
export async function getStudentClassIds(
  supabase: Supabase,
  studentId: string,
): Promise<string[]> {
  // 1. Bezpośrednie zajęcia (indyw./para)
  const { data: directClasses, error: directErr } = await supabase
    .from('classes')
    .select('id')
    .eq('student_id', studentId)
    .eq('status', 'active')

  if (directErr) throw directErr

  // 2. Grupowe — przez group_members
  const { data: memberships, error: memErr } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('student_id', studentId)
    .is('left_at', null)

  if (memErr) throw memErr

  const groupIds = memberships?.map((m) => m.group_id) ?? []

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

  const all = [...(directClasses ?? []), ...groupClasses].map((c) => c.id)
  return Array.from(new Set(all))
}

/**
 * Deterministyczny kolor avatara ucznia z hash imienia.
 * 8 kolorów z palety — pasują do dark theme.
 */
const AVATAR_COLORS = [
  '#3B8FF0', // primary
  '#06B6D4', // cyan
  '#7C5CFC', // accent
  '#22C55E', // success
  '#F59E0B', // warning
  '#E84393', // pink
  '#FF6F4A', // secondary
  '#FFCA28', // tertiary
] as const

export function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash |= 0
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!
}

/**
 * Inicjały z imienia + nazwiska. Profil ma generowaną kolumnę `initials`,
 * ale na froncie czasem trzeba obliczyć z fragmentów.
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/**
 * Polskie skróty dni tygodnia (day_of_week: 0=Pon ... 6=Ndz).
 */
export const DAY_NAMES_FULL = [
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
  'Niedziela',
] as const

export const DAY_NAMES_SHORT = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'] as const

/**
 * UI label dla poziomu — z gwiazdkami (jak w mockupach).
 */
export const LEVEL_LABELS: Record<
  Database['public']['Enums']['student_level'],
  string
> = {
  SP: 'SP',
  E8: 'E8',
  SR: 'ŚR',
  SR_EXT: 'ŚR★',
  EM: 'EM',
  EM_EXT: 'EM★',
}
