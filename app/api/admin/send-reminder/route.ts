import { type NextRequest, NextResponse } from 'next/server'

import { sendReminderForPayment } from '@/lib/backend/payment-reminders'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * POST /api/admin/send-reminder
 *   body: { paymentId: uuid }
 * Wymaga roli admin. Wysyła pojedyncze przypomnienie o płatności.
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

  const paymentId = (body as { paymentId?: unknown }).paymentId
  if (typeof paymentId !== 'string' || !UUID_RE.test(paymentId)) {
    return NextResponse.json({ error: 'Pole paymentId (uuid) jest wymagane.' }, { status: 400 })
  }

  try {
    const report = await sendReminderForPayment(supabase, paymentId)
    return NextResponse.json({ ok: true, report })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Błąd wysyłki przypomnienia.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
