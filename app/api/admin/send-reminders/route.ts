import { NextResponse } from 'next/server'

import { sendPaymentReminders } from '@/lib/backend/payment-reminders'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/send-reminders
 * Wymaga roli admin. Wysyła przypomnienia hurtowo do wszystkich nieopłaconych.
 */
export async function POST() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Brak uprawnień (wymagana rola admin).' }, { status: 403 })
  }

  try {
    const report = await sendPaymentReminders(supabase)
    return NextResponse.json({ ok: true, report })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Błąd wysyłki przypomnień.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
