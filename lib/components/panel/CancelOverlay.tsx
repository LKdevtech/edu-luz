'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useId, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

import {
  getActiveCancelOverlay,
  setActiveCancelOverlay,
  subscribeCancelOverlay,
} from './cancelOverlayBus'

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
 * Modal w portalu (z-9999) + singleton bus — patrz CancelLessonOverlay.
 */
export function CancelOverlay({ lessonId, parentId, isWithin24h }: CancelOverlayProps) {
  const overlayId = useId()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    return subscribeCancelOverlay((id) => {
      if (id !== overlayId) setOpen(false)
    })
  }, [overlayId])

  function handleOpen() {
    setActiveCancelOverlay(overlayId)
    setOpen(true)
  }

  function handleClose() {
    if (getActiveCancelOverlay() === overlayId) {
      setActiveCancelOverlay(null)
    }
    setOpen(false)
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

      handleClose()
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
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
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 9999, backgroundColor: 'rgba(21,24,39,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={handleClose}
          >
            <div
              className="flex max-w-[360px] flex-col items-center gap-3 rounded-[14px] bg-surface p-5 text-center shadow-xl"
              style={{ border: '1px solid rgba(59,143,240,0.20)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {isWithin24h ? (
                <>
                  <p className="text-[13px] font-extrabold" style={{ color: '#F59E0B' }}>
                    ⚠ Mniej niż 24h do lekcji
                  </p>
                  <p className="text-[12px] text-secondary">
                    Lekcja przepadnie bez możliwości odrobienia.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[13px] font-extrabold text-success">
                    Ponad 24h do lekcji — będzie można ją odrobić
                  </p>
                  <p className="text-[12px] text-secondary">
                    Korepetytor zaproponuje termin odrobienia.
                  </p>
                </>
              )}
              {error && (
                <p className="text-[11px] font-bold" style={{ color: '#EF4444' }}>
                  Błąd: {error}
                </p>
              )}
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="rounded-[8px] border border-subtle bg-alt px-4 py-2 text-[12px] font-bold text-secondary hover:bg-surface-hover disabled:opacity-50"
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  disabled={isPending}
                  className="rounded-[8px] px-4 py-2 text-[12px] font-extrabold text-white hover:brightness-110 disabled:opacity-50"
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
          </div>,
          document.body,
        )}
    </>
  )
}
