'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type ConfirmPaymentButtonProps = {
  paymentId: string
  totalAmount: number
  dueDate: string
  /** Etykieta przycisku. Domyślnie "✓ Potwierdź wpłatę". */
  label?: string
  /** Wariant "inline" — pełna szerokość, styl pigułki z mockupu płatności. */
  variant?: 'default' | 'inline'
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
  label,
  variant = 'default',
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

  const defaultLabel = label ?? '✓ Potwierdź wpłatę'

  if (variant === 'inline') {
    return (
      <>
        <button
          type="button"
          onClick={confirm}
          disabled={isPending}
          className="w-full rounded-[7px] px-2 py-[7px] text-[10px] font-bold transition-colors hover:text-white disabled:opacity-50"
          style={{ backgroundColor: '#22C55E12', color: '#22C55E' }}
          onMouseEnter={(e) => {
            if (isPending) return
            e.currentTarget.style.backgroundColor = '#22C55E'
            e.currentTarget.style.color = '#FFFFFF'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#22C55E12'
            e.currentTarget.style.color = '#22C55E'
          }}
        >
          {isPending ? 'Zapisywanie…' : defaultLabel}
        </button>
        {error && (
          <span className="text-[10px] font-bold" style={{ color: '#EF4444' }}>
            {error}
          </span>
        )}
      </>
    )
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
        {isPending ? 'Zapisywanie…' : defaultLabel}
      </button>
      {error && (
        <span className="text-[10px] font-bold" style={{ color: '#EF4444' }}>
          {error}
        </span>
      )}
    </>
  )
}
