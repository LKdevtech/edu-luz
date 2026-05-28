import 'server-only'

import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Zwraca ID aktualnie zalogowanego rodzica.
 *
 * Dev-mode fallback: `DEV_PARENT_ID` z `.env.local` (Monika Nowak).
 *
 * TODO(auth): wpiąć middleware Supabase + sprawdzić rolę profilu.
 */
export async function getCurrentParentId(): Promise<string> {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role === 'parent') {
      return user.id
    }
  }

  const devId = process.env.DEV_PARENT_ID
  if (!devId) {
    throw new Error(
      'Brak zalogowanego rodzica i nie ustawiono DEV_PARENT_ID w .env.local. ' +
        'Patrz .env.local.example.',
    )
  }
  return devId
}
