import 'server-only'

import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Zwraca ID aktualnie zalogowanego ucznia.
 *
 * Tymczasowa logika dev-mode: gdy nie ma sesji Supabase Auth, używa
 * `DEV_STUDENT_ID` z `.env.local` (zalecane: Kacper Nowak z seed).
 *
 * TODO(auth): wpiąć middleware Supabase + sprawdzić rolę profilu.
 */
export async function getCurrentStudentId(): Promise<string> {
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
    if (profile?.role === 'student') {
      return user.id
    }
  }

  const devId = process.env.DEV_STUDENT_ID
  if (!devId) {
    throw new Error(
      'Brak zalogowanego ucznia i nie ustawiono DEV_STUDENT_ID w .env.local. ' +
        'Patrz .env.local.example.',
    )
  }
  return devId
}
