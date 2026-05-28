'use client'

import { createBrowserClient } from '@supabase/ssr'

import type { Database } from '@/lib/types/database.types'

/**
 * Browser-side Supabase client.
 *
 * Singleton — tworzony raz, reużywany w całej aplikacji po stronie klienta.
 * Używaj w Client Components do mutacji (np. PD checkbox, wysłanie wiadomości).
 */
let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined

export function createSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return browserClient
}
