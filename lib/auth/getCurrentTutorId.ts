import 'server-only'

import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Zwraca ID aktualnie zalogowanego korepetytora.
 *
 * Dev-mode fallback: `DEV_TUTOR_ID` z `.env.local` (Tomasz Kowalski).
 *
 * TODO(auth): wpiąć middleware Supabase + sprawdzić rolę profilu.
 */
export async function getCurrentTutorId(): Promise<string> {
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
    if (profile?.role === 'tutor') {
      return user.id
    }
  }

  const devId = process.env.DEV_TUTOR_ID
  if (!devId) {
    throw new Error(
      'Brak zalogowanego korepetytora i nie ustawiono DEV_TUTOR_ID w .env.local. ' +
        'Patrz .env.local.example.',
    )
  }
  return devId
}
