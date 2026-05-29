import 'server-only'

import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Zwraca ID aktualnie zalogowanego korepetytora (z sesji Supabase Auth).
 *
 * Fallback `DEV_TUTOR_ID` działa TYLKO w developmencie i TYLKO gdy nikt nie jest
 * zalogowany. W produkcji wymagana realna sesja.
 */
export async function getCurrentTutorId(): Promise<string> {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    if (user.app_metadata?.role === 'tutor') {
      return user.id
    }
    throw new Error('Zalogowany użytkownik nie ma roli korepetytora.')
  }

  // Brak sesji — dev fallback tylko w developmencie.
  if (process.env.NODE_ENV === 'development' && process.env.DEV_TUTOR_ID) {
    return process.env.DEV_TUTOR_ID
  }
  throw new Error('Brak zalogowanego korepetytora — zaloguj się przez /login.')
}
