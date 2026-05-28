'use client'

import { useEffect, useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type ChangeRequestFormProps = {
  tutorId: string
  adminId: string
}

const SUBJECT = 'Prośba o zmianę planu'

/**
 * Panel korepetytora: „📋 Poproś o zmianę planu" → textarea → insert do
 * direct_messages z subject="Prośba o zmianę planu" (sender=tutor, recipient=admin).
 * Admin powiadamiany standardowym mechanizmem wiadomości.
 */
export function ChangeRequestForm({ tutorId, adminId }: ChangeRequestFormProps) {
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sentToast, setSentToast] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!sentToast) return
    const t = setTimeout(() => setSentToast(false), 2000)
    return () => clearTimeout(t)
  }, [sentToast])

  function send() {
    const text = body.trim()
    if (!text) return
    setError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: insErr } = await supabase.from('direct_messages').insert({
        sender_id: tutorId,
        recipient_id: adminId,
        subject: SUBJECT,
        body: text,
      })
      if (insErr) {
        setError(insErr.message)
        return
      }
      setBody('')
      setOpen(false)
      setSentToast(true)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-[10px] px-4 py-2 text-[12px] font-extrabold transition-colors hover:brightness-110"
        style={{ backgroundColor: '#7C5CFC25', color: '#7C5CFC' }}
      >
        {open ? 'Anuluj' : '📋 Poproś o zmianę planu'}
      </button>

      {open && (
        <div
          className="rounded-card bg-surface p-5"
          style={{ border: '1px solid #7C5CFC22' }}
        >
          <p className="mb-2 text-[12px] font-extrabold" style={{ color: '#7C5CFC' }}>
            Opisz jaką zmianę chcesz wprowadzić:
          </p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Np. 'Chciałbym przenieść środowe zajęcia z 14:00–18:00 na 15:00–19:00 od lipca' albo 'Proszę o dodanie slotu w czwartki 19:00–20:00'"
            rows={3}
            className="w-full resize-none rounded-[12px] border border-subtle bg-alt px-3.5 py-2.5 text-[12px] text-primary placeholder:text-dim focus:border-accent focus:outline-none"
          />
          <p className="mt-1.5 mb-3 text-[10px] italic text-dim">
            Admin dostanie powiadomienie i zatwierdzi lub skontaktuje się z Tobą.
          </p>
          {error && (
            <p className="mb-2 text-[11px] font-bold" style={{ color: '#EF4444' }}>
              Błąd: {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="rounded-[10px] border border-subtle bg-transparent px-4 py-2 text-[12px] font-bold text-secondary hover:bg-surface-hover disabled:opacity-50"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={send}
              disabled={isPending || body.trim().length === 0}
              className="rounded-[10px] px-5 py-2 text-[12px] font-extrabold text-white hover:brightness-110 disabled:opacity-50"
              style={{ backgroundColor: '#7C5CFC' }}
            >
              {isPending ? 'Wysyłanie…' : 'Wyślij prośbę'}
            </button>
          </div>
        </div>
      )}

      {sentToast && (
        <div
          className="rounded-[8px] px-3 py-2 text-center text-[12px] font-extrabold"
          style={{ backgroundColor: '#22C55E18', color: '#22C55E' }}
        >
          ✓ Prośba wysłana do admina!
        </div>
      )}
    </div>
  )
}
