import 'server-only'

import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Zwraca ID aktualnie zalogowanego admina.
 *
 * Dev-mode fallback: `DEV_ADMIN_ID` z `.env.local`.
 *
 * TODO(auth): wpiąć middleware Supabase + sprawdzić rolę profilu.
 */
export async function getCurrentAdminId(): Promise<string> {
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
    if (profile?.role === 'admin') {
      return user.id
    }
  }

  const devId = process.env.DEV_ADMIN_ID
  if (!devId) {
    throw new Error(
      'Brak zalogowanego admina i nie ustawiono DEV_ADMIN_ID w .env.local. ' +
        'Patrz .env.local.example.',
    )
  }
  return devId
}
