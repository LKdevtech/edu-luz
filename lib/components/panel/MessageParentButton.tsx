'use client'

import { useEffect, useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type MessageParentButtonProps = {
  tutorId: string
  parentId: string
  parentName: string
  studentName: string
}

/**
 * Panel korepetytora: „Napisz do rodzica" w karcie ucznia.
 * Klik → form (temat + treść) → insert do direct_messages (sender=tutor, recipient=parent).
 * Toast po wysłaniu znika po 2s.
 */
export function MessageParentButton({
  tutorId,
  parentId,
  parentName,
  studentName,
}: MessageParentButtonProps) {
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
        sender_id: tutorId,
        recipient_id: parentId,
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
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-[10px] px-3 py-1.5 text-[11px] font-extrabold transition-colors hover:brightness-110"
        style={{ backgroundColor: '#3B8FF026', color: '#3B8FF0' }}
      >
        {open ? 'Anuluj' : '💬 Napisz do rodzica'}
      </button>

      {open && (
        <div className="flex flex-col gap-2 rounded-[10px] border border-[rgba(59,143,240,0.25)] bg-surface p-3">
          <div className="text-[11px] text-dim">
            Do: <span className="font-bold text-primary">{parentName}</span> · ucz. {studentName}
          </div>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Temat (opcjonalnie)"
            className="rounded-[8px] border border-[rgba(59,143,240,0.25)] bg-alt px-2.5 py-2 text-[12px] text-primary placeholder:text-dim focus:border-link focus:outline-none"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Twoja wiadomość…"
            rows={4}
            className="resize-none rounded-[8px] border border-[rgba(59,143,240,0.25)] bg-alt p-2.5 text-[12px] text-primary placeholder:text-dim focus:border-link focus:outline-none"
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
          className="rounded-[8px] px-3 py-2 text-center text-[12px] font-extrabold"
          style={{ backgroundColor: '#22C55E18', color: '#22C55E' }}
        >
          ✓ Wiadomość wysłana!
        </div>
      )}
    </div>
  )
}
