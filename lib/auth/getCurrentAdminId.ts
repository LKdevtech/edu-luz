import 'server-only'

import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Zwraca ID aktualnie zalogowanego admina (z sesji Supabase Auth).
 *
 * Fallback `DEV_ADMIN_ID` działa TYLKO w developmencie i TYLKO gdy nikt nie jest
 * zalogowany — ułatwia pracę bez logowania. W produkcji wymagana realna sesja.
 */
export async function getCurrentAdminId(): Promise<string> {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    if (user.app_metadata?.role === 'admin') {
      return user.id
    }
    throw new Error('Zalogowany użytkownik nie ma roli admin.')
  }

  // Brak sesji — dev fallback tylko w developmencie.
  if (process.env.NODE_ENV === 'development' && process.env.DEV_ADMIN_ID) {
    return process.env.DEV_ADMIN_ID
  }
  throw new Error('Brak zalogowanego admina — zaloguj się przez /login.')
}
