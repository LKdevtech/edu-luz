'use client'

import { useEffect, useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type ContactCenterProps = {
  parentId: string
  adminId: string
}

/**
 * „Wyślij wiadomość do centrum" — przycisk w sidebarze rodzica (dashboard + profil).
 * Klik → form z polem tematu i treści → insert do direct_messages (recipient=admin).
 * Toast „✓ Wiadomość wysłana!" znika po 2s.
 */
export function ContactCenter({ parentId, adminId }: ContactCenterProps) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
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
        sender_id: parentId,
        recipient_id: adminId,
        subject: subject.trim() || null,
        body: text,
      })
      if (insErr) {
        setError(insErr.message)
        return
      }
      setSubject('')
      setBody('')
      setOpen(false)
      setSentToast(true)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 w-full rounded-[8px] bg-[rgba(59,143,240,0.12)] px-3 py-2 text-[12px] font-extrabold text-link hover:bg-[rgba(59,143,240,0.2)]"
      >
        {open ? 'Anuluj' : '💬 Wyślij wiadomość'}
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-2">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Temat (opcjonalnie)"
            className="rounded-[8px] border border-[rgba(59,143,240,0.25)] bg-surface px-2.5 py-2 text-[12px] text-primary placeholder:text-dim focus:border-link focus:outline-none"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Twoja wiadomość…"
            rows={4}
            className="resize-none rounded-[8px] border border-[rgba(59,143,240,0.25)] bg-surface p-2.5 text-[12px] text-primary placeholder:text-dim focus:border-link focus:outline-none"
          />
          <button
            type="button"
            onClick={send}
            disabled={isPending || body.trim().length === 0}
            className="rounded-[8px] bg-primary px-3 py-2 text-[12px] font-extrabold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {isPending ? 'Wysyłanie…' : 'Wyślij wiadomość'}
          </button>
          {error && (
            <p className="text-[11px] font-bold" style={{ color: '#EF4444' }}>
              Błąd: {error}
            </p>
          )}
        </div>
      )}

      {sentToast && (
        <div
          className="mt-2 rounded-[8px] px-3 py-2 text-center text-[12px] font-extrabold"
          style={{ backgroundColor: '#22C55E18', color: '#22C55E' }}
        >
          ✓ Wiadomość wysłana!
        </div>
      )}
    </>
  )
}
