import { type NextRequest, NextResponse } from 'next/server'

import { handleApprovedAbsence } from '@/lib/backend/absence-handler'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * POST /api/admin/handle-absence
 *   body: { absenceId: uuid }
 * Wymaga roli admin. Odwołuje lekcje korepetytora objęte (zatwierdzoną)
 * nieobecnością i tworzy powiadomienia. Zwraca raport.
 */
export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Brak uprawnień (wymagana rola admin).' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Niepoprawny JSON.' }, { status: 400 })
  }

  const absenceId = (body as { absenceId?: unknown }).absenceId
  if (typeof absenceId !== 'string' || !UUID_RE.test(absenceId)) {
    return NextResponse.json({ error: 'Pole absenceId (uuid) jest wymagane.' }, { status: 400 })
  }

  try {
    const report = await handleApprovedAbsence(supabase, absenceId)
    return NextResponse.json({ ok: true, report })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Błąd obsługi nieobecności.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
