import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import { sendPaymentReminder } from '@/lib/email/resend'
import type { Database } from '@/lib/types/database.types'

// Przypomnienia o płatnościach.
//
// Dla każdej nieopłaconej płatności (status pending/overdue):
//   • wysyłamy email przez sendPaymentReminder (jeśli jest RESEND_API_KEY i adres),
//   • tworzymy powiadomienie w aplikacji (notifications, typ 'payment_reminder'),
//   • zapisujemy payments.reminder_sent_at (deduplikacja: okno 7 dni).
// Rodziców z parents.reminders_disabled pomijamy w wysyłce hurtowej.

type Supabase = SupabaseClient<Database>
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

const DEDUP_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

const plnFormatter = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })

export type BulkReminderReport = {
  total: number
  sent: number
  emailsSent: number
  skippedDisabled: number
  skippedRecent: number
  errors: number
}

export type SingleReminderReport = {
  paymentId: string
  status: 'sent' | 'skipped_disabled' | 'not_found' | 'error'
  emailSent: boolean
  message: string
}

type PaymentRow = {
  id: string
  parent_id: string
  billing_month: string
  total_amount: number
  reminder_sent_at: string | null
  parent: {
    reminders_disabled: boolean
    profile: { first_name: string; last_name: string; email: string | null } | null
  } | null
  lines: Array<{
    student: { profile: { first_name: string; last_name: string } | null } | null
  }>
}

const PAYMENT_SELECT = `
  id, parent_id, billing_month, total_amount, reminder_sent_at,
  parent:parents!payments_parent_id_fkey (
    reminders_disabled,
    profile:profiles!parents_profile_id_fkey ( first_name, last_name, email )
  ),
  lines:payment_lines!payment_lines_payment_id_fkey (
    student:students!payment_lines_student_id_fkey (
      profile:profiles!students_profile_id_fkey ( first_name, last_name )
    )
  )
`

function capitalize(s: string): string {
  return s.length > 0 ? s[0]!.toUpperCase() + s.slice(1) : s
}

function monthLabelOf(billingMonth: string): string {
  return capitalize(
    new Date(billingMonth).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }),
  )
}

function childNamesOf(row: PaymentRow): string {
  const names = new Set<string>()
  for (const line of row.lines) {
    const p = line.student?.profile
    if (p) names.add(`${p.first_name} ${p.last_name}`)
  }
  return names.size > 0 ? Array.from(names).join(', ') : 'dziecko'
}

/**
 * Wykonuje jedno przypomnienie dla danej płatności: email (jeśli możliwe),
 * powiadomienie w aplikacji i zapis reminder_sent_at. Zwraca czy email poszedł.
 */
async function processPayment(supabase: Supabase, row: PaymentRow): Promise<{ emailSent: boolean }> {
  const profile = row.parent?.profile
  const parentName = profile ? `${profile.first_name} ${profile.last_name}` : 'Rodzicu'
  const studentName = childNamesOf(row)
  const monthLabel = monthLabelOf(row.billing_month)
  const amount = Number(row.total_amount)

  // 1. Email (tylko gdy skonfigurowano klucz i znamy adres).
  let emailSent = false
  if (process.env.RESEND_API_KEY && profile?.email) {
    const res = await sendPaymentReminder({
      parentEmail: profile.email,
      parentName,
      studentName,
      amount,
      monthLabel,
    })
    emailSent = res.ok
  }

  // 2. Powiadomienie w aplikacji (zawsze).
  const notification: NotificationInsert = {
    user_id: row.parent_id,
    type: 'payment_reminder',
    title: 'Przypomnienie o płatności',
    message: `Przypomnienie o płatności za ${monthLabel} (${studentName}). Kwota: ${plnFormatter.format(amount)}.`,
  }
  const { error: notifErr } = await supabase.from('notifications').insert(notification)
  if (notifErr) throw notifErr

  // 3. Znacznik wysłania (dedup).
  const { error: updErr } = await supabase
    .from('payments')
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq('id', row.id)
  if (updErr) throw updErr

  return { emailSent }
}

/**
 * Hurtowo: przypomnienia dla wszystkich nieopłaconych płatności.
 * Pomija rodziców z opt-outem oraz płatności przypomniane w ostatnich 7 dniach.
 */
export async function sendPaymentReminders(supabase: Supabase): Promise<BulkReminderReport> {
  const { data, error } = await supabase
    .from('payments')
    .select(PAYMENT_SELECT)
    .in('status', ['pending', 'overdue'])
  if (error) throw error

  const rows = (data ?? []) as unknown as PaymentRow[]
  const report: BulkReminderReport = {
    total: rows.length,
    sent: 0,
    emailsSent: 0,
    skippedDisabled: 0,
    skippedRecent: 0,
    errors: 0,
  }

  const now = Date.now()
  for (const row of rows) {
    if (row.parent?.reminders_disabled) {
      report.skippedDisabled += 1
      continue
    }
    if (row.reminder_sent_at && now - new Date(row.reminder_sent_at).getTime() < DEDUP_WINDOW_MS) {
      report.skippedRecent += 1
      continue
    }
    try {
      const { emailSent } = await processPayment(supabase, row)
      report.sent += 1
      if (emailSent) report.emailsSent += 1
    } catch {
      report.errors += 1
    }
  }

  return report
}

/**
 * Pojedyncze przypomnienie (z UI admina). Honoruje opt-out rodzica, ale — w
 * odróżnieniu od wysyłki hurtowej — NIE stosuje okna 7 dni (admin świadomie
 * wysyła ręcznie).
 */
export async function sendReminderForPayment(
  supabase: Supabase,
  paymentId: string,
): Promise<SingleReminderReport> {
  const { data, error } = await supabase
    .from('payments')
    .select(PAYMENT_SELECT)
    .eq('id', paymentId)
    .maybeSingle()
  if (error) throw error
  if (!data) {
    return { paymentId, status: 'not_found', emailSent: false, message: 'Nie znaleziono płatności.' }
  }

  const row = data as unknown as PaymentRow
  if (row.parent?.reminders_disabled) {
    return {
      paymentId,
      status: 'skipped_disabled',
      emailSent: false,
      message: 'Rodzic ma wyłączone przypomnienia.',
    }
  }

  try {
    const { emailSent } = await processPayment(supabase, row)
    return {
      paymentId,
      status: 'sent',
      emailSent,
      message: emailSent ? 'Wysłano email i powiadomienie.' : 'Utworzono powiadomienie (email pominięty).',
    }
  } catch (err) {
    return {
      paymentId,
      status: 'error',
      emailSent: false,
      message: err instanceof Error ? err.message : 'Błąd wysyłki przypomnienia.',
    }
  }
}
