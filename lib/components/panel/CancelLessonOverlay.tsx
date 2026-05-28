'use client'

import { useEffect, useId, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

import {
  getActiveCancelOverlay,
  setActiveCancelOverlay,
  subscribeCancelOverlay,
} from './cancelOverlayBus'

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
 * Panel ucznia: kliknięcie „Odwołaj" → modal potwierdzenia → INSERT do
 * `lesson_cancel_requests` (status='pending'). Po wysłaniu pokazuje badge
 * „CZEKA NA RODZICA". Sekcja 3.2 SYSTEM_INSTRUCTIONS_v2.
 *
 * Modal renderowany przez portal w document.body z z-index 9999 — żeby zawsze
 * był na wierzchu (transform na sąsiednich kartach przy hoverze nie schowa go).
 * Singleton z `cancelOverlayBus` gwarantuje, że na raz otwarty jest TYLKO jeden
 * overlay w całej aplikacji.
 */
export function CancelLessonOverlay({ lessonId, studentId, pending = false }: CancelLessonOverlayProps) {
  const overlayId = useId()
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(pending)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Subskrybuj globalny stan — jeśli inny overlay się otworzy, zamknij ten.
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
          handleClose()
          return
        }
        setError(insertErr.message)
        return
      }
      setSent(true)
      handleClose()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-[7px] border border-[#F59E0B40] bg-[#F59E0B10] px-2.5 py-1 text-[11px] font-extrabold text-[#F59E0B] hover:bg-[#F59E0B20]"
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
              <p className="text-[13px] font-extrabold text-primary">
                Poprosić o odwołanie lekcji?
              </p>
              <p className="text-[12px] text-secondary">
                ⚠ Prośba trafi do rodzica — to on zdecyduje.
              </p>
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
                  Nie
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  disabled={isPending}
                  className="rounded-[8px] bg-[#F59E0B] px-4 py-2 text-[12px] font-extrabold text-white hover:brightness-110 disabled:opacity-50"
                >
                  {isPending ? 'Wysyłanie…' : 'Wyślij prośbę'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
