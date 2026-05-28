'use client'

import { useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type CancelLessonOverlayProps = {
  lessonId: string
  studentId: string
  /**
   * Czy uczeń już wysłał prośbę dla tej lekcji (i czeka na rodzica).
   * Wtedy renderujemy badge zamiast przycisku „Odwołaj".
   */
  pending?: boolean
}

/**
 * Panel ucznia: kliknięcie „Odwołaj" → overlay potwierdzenia → INSERT do
 * `lesson_cancel_requests` (status='pending'). Po wysłaniu pokazuje badge
 * „CZEKA NA RODZICA". Sekcja 3.2 SYSTEM_INSTRUCTIONS_v2.
 *
 * Po stronie rodzica admin/rodzic UI zaakceptuje lub odrzuci prośbę osobnym
 * widokiem (panel rodzica — kolejna faza).
 */
export function CancelLessonOverlay({ lessonId, studentId, pending = false }: CancelLessonOverlayProps) {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(pending)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (sent) {
    return (
      <span
        className="rounded-[7px] px-2 py-1 text-[10px] font-extrabold uppercase"
        style={{ backgroundColor: '#F59E0B22', color: '#F59E0B' }}
      >
        ⏳ Czeka na rodzica
      </span>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-[7px] border border-[#F59E0B40] bg-[#F59E0B10] px-2.5 py-1 text-[11px] font-extrabold text-[#F59E0B] hover:bg-[#F59E0B20]"
      >
        Odwołaj
      </button>
    )
  }

  function confirm() {
    setError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: insertErr } = await supabase
        .from('lesson_cancel_requests')
        .insert({
          lesson_id: lessonId,
          student_id: studentId,
          status: 'pending',
        })
      if (insertErr) {
        // Unique index `pending` może uderzyć jeśli już istnieje pending —
        // wtedy traktuj jak sukces (idempotentnie pokaż badge).
        if (insertErr.code === '23505') {
          setSent(true)
          setOpen(false)
          return
        }
        setError(insertErr.message)
        return
      }
      setSent(true)
      setOpen(false)
    })
  }

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-[14px] bg-[rgba(21,24,39,0.94)] p-4 text-center backdrop-blur-sm">
      <p className="text-[12px] font-bold text-primary">
        Poprosić o odwołanie lekcji?
      </p>
      <p className="text-[11px] text-secondary">
        ⚠ Prośba trafi do rodzica — to on zdecyduje.
      </p>
      {error && (
        <p className="text-[11px] font-bold" style={{ color: '#EF4444' }}>
          Błąd: {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={isPending}
          className="rounded-[8px] border border-subtle bg-surface px-3 py-1.5 text-[12px] font-bold text-secondary hover:bg-surface-hover disabled:opacity-50"
        >
          Nie
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={isPending}
          className="rounded-[8px] bg-[#F59E0B] px-3 py-1.5 text-[12px] font-extrabold text-white hover:brightness-110 disabled:opacity-50"
        >
          {isPending ? 'Wysyłanie…' : 'Wyślij prośbę'}
        </button>
      </div>
    </div>
  )
}
