'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type CancelOverlayProps = {
  lessonId: string
  parentId: string
  /** Czy do lekcji zostało mniej niż 24h. <24h = przepada bez odrobienia. */
  isWithin24h: boolean
}

/**
 * Panel rodzica: bezpośrednie odwołanie lekcji.
 *
 * Sekcja 3.2 SYSTEM_INSTRUCTIONS_v2:
 *   - >24h: lekcja odwołana + utworzony makeup_request (do odrobienia).
 *   - <24h: lekcja odwołana, przepada bez prawa do odrobienia.
 *
 * Migracja makeup_request po odwołaniu wykona się triggerem aplikacyjnym — tu
 * po prostu aktualizujemy lessons. Server Action wpadnie w kolejnej iteracji
 * (RPC supabase function albo logic po stronie route handler).
 */
export function CancelOverlay({ lessonId, parentId, isWithin24h }: CancelOverlayProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-[7px] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide transition-colors"
        style={
          isWithin24h
            ? {
                border: '1px solid #F59E0B40',
                backgroundColor: '#F59E0B10',
                color: '#F59E0B',
              }
            : {
                border: '1px solid #EF444440',
                backgroundColor: '#EF444410',
                color: '#EF4444',
              }
        }
      >
        Odwołaj
      </button>
    )
  }

  function confirm() {
    setError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const cancelledMoreThan24h = !isWithin24h
      const { error: updErr } = await supabase
        .from('lessons')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: parentId,
          cancel_reason: 'Odwołane przez rodzica',
          cancelled_more_than_24h: cancelledMoreThan24h,
        })
        .eq('id', lessonId)
      if (updErr) {
        setError(updErr.message)
        return
      }

      // >24h → utwórz makeup_request (aplikacja decyduje, nie DB trigger).
      if (cancelledMoreThan24h) {
        const { error: mkErr } = await supabase.from('makeup_requests').insert({
          original_lesson_id: lessonId,
          status: 'waiting_for_tutor',
          current_round: 0,
          cancel_reason: 'Odwołane przez rodzica',
        })
        if (mkErr && mkErr.code !== '23505') {
          setError(mkErr.message)
          return
        }
      }

      setOpen(false)
      router.refresh()
    })
  }

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-card bg-[rgba(21,24,39,0.94)] p-4 text-center backdrop-blur-sm">
      {isWithin24h ? (
        <>
          <p className="text-[12px] font-extrabold" style={{ color: '#F59E0B' }}>
            ⚠ Mniej niż 24h do lekcji
          </p>
          <p className="text-[11px] text-secondary">
            Lekcja przepadnie bez możliwości odrobienia.
          </p>
        </>
      ) : (
        <>
          <p className="text-[12px] font-extrabold text-success">
            Ponad 24h do lekcji — będzie można ją odrobić
          </p>
          <p className="text-[11px] text-secondary">
            Korepetytor zaproponuje termin odrobienia.
          </p>
        </>
      )}
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
          Anuluj
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={isPending}
          className="rounded-[8px] px-3 py-1.5 text-[12px] font-extrabold text-white hover:brightness-110 disabled:opacity-50"
          style={{ backgroundColor: isWithin24h ? '#F59E0B' : '#EF4444' }}
        >
          {isPending
            ? 'Wysyłanie…'
            : isWithin24h
              ? 'Odwołaj (przepadnie)'
              : 'Tak, odwołaj'}
        </button>
      </div>
    </div>
  )
}
