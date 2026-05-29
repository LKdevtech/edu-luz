import { type NextRequest, NextResponse } from 'next/server'

import { generateLessonsForWeek } from '@/lib/backend/lesson-generator'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/generate-lessons
 *   body: { weekStart: 'YYYY-MM-DD' }  (poniedziałek tygodnia)
 * Wymaga roli admin (app_metadata.role). Zwraca raport generatora.
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

  const weekStart = (body as { weekStart?: unknown }).weekStart
  if (typeof weekStart !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
    return NextResponse.json(
      { error: 'Pole weekStart (YYYY-MM-DD) jest wymagane.' },
      { status: 400 },
    )
  }

  try {
    const report = await generateLessonsForWeek(supabase, weekStart)
    return NextResponse.json({ ok: true, report })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Błąd generowania lekcji.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
