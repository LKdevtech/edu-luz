import 'server-only'

import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Zwraca ID aktualnie zalogowanego rodzica (z sesji Supabase Auth).
 *
 * Fallback `DEV_PARENT_ID` działa TYLKO w developmencie i TYLKO gdy nikt nie jest
 * zalogowany. W produkcji wymagana realna sesja.
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
    throw new Error('Zalogowany użytkownik nie ma roli rodzica.')
  }

  // Brak sesji — dev fallback tylko w developmencie.
  if (process.env.NODE_ENV === 'development' && process.env.DEV_PARENT_ID) {
    return process.env.DEV_PARENT_ID
  }
  throw new Error('Brak zalogowanego rodzica — zaloguj się przez /login.')
}
