import { type NextRequest, NextResponse } from 'next/server'

import { cancelLessonAndNotify } from '@/lib/backend/absence-handler'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * POST /api/admin/cancel-lesson
 *   body: { lessonId: uuid, reason: string }
 * Wymaga roli admin. Odwołuje pojedynczą lekcję i powiadamia ucznia/rodzica.
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

  const { lessonId, reason } = body as { lessonId?: unknown; reason?: unknown }
  if (typeof lessonId !== 'string' || !UUID_RE.test(lessonId)) {
    return NextResponse.json({ error: 'Pole lessonId (uuid) jest wymagane.' }, { status: 400 })
  }
  const reasonText = typeof reason === 'string' ? reason : ''

  try {
    const report = await cancelLessonAndNotify(supabase, lessonId, reasonText)
    return NextResponse.json({ ok: true, report })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Błąd odwoływania lekcji.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
