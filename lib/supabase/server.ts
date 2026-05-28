import 'server-only'

import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

import type { Database } from '@/lib/types/database.types'

/**
 * Server-side Supabase client.
 *
 * Tworzony per-request (cookies() jest dynamiczne). Używaj w:
 *   - Server Components
 *   - Server Actions
 *   - Route Handlers
 *
 * Cookies są zarządzane przez next/headers — sesja użytkownika jest odświeżana
 * automatycznie przy każdym wywołaniu.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Wywołanie z Server Component (read-only). Refresh-session
            // załatwi middleware przy następnym requeście.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // jak wyżej
          }
        },
      },
    },
  )
}
