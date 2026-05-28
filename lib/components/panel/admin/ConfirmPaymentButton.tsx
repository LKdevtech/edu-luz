'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type ConfirmPaymentButtonProps = {
  paymentId: string
  totalAmount: number
  dueDate: string
}

/**
 * Przycisk potwierdzania wpłaty przez admina. Po kliku aktualizuje payments:
 * - status = 'paid' / 'paid_late' (zależnie od daty)
 * - paid_at = teraz
 * - paid_amount = total_amount
 * - paid_on_time = paid_at <= due_date
 */
export function ConfirmPaymentButton({
  paymentId,
  totalAmount,
  dueDate,
}: ConfirmPaymentButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function confirm() {
    setError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const now = new Date()
      const due = new Date(dueDate)
      const onTime = now.getTime() <= due.getTime() + 86_400_000 // do końca dnia terminu
      const status: 'paid' | 'paid_late' = onTime ? 'paid' : 'paid_late'
      const { error: updErr } = await supabase
        .from('payments')
        .update({
          status,
          paid_at: now.toISOString(),
          paid_amount: totalAmount,
          paid_on_time: onTime,
        })
        .eq('id', paymentId)
      if (updErr) {
        setError(updErr.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={confirm}
        disabled={isPending}
        className="rounded-[8px] px-3 py-1.5 text-[11px] font-extrabold text-white hover:brightness-110 disabled:opacity-50"
        style={{ backgroundColor: '#22C55E' }}
      >
        {isPending ? 'Zapisywanie…' : '✓ Potwierdź wpłatę'}
      </button>
      {error && (
        <span className="text-[10px] font-bold" style={{ color: '#EF4444' }}>
          {error}
        </span>
      )}
    </>
  )
}
