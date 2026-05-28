'use client'

import { useEffect, useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type ContactTeacherProps = {
  tutorId: string
  studentId: string
  tutorName: string
  tutorInitials: string
}

/**
 * Karta korepetytora z przyciskiem „💬 Napisz" → textarea → wyślij wiadomość.
 * Toast "✓ Wiadomość wysłana!" znika po 2s.
 *
 * Mutacja: wpis w `direct_messages` (sender=student, recipient=tutor).
 */
export function ContactTeacher({
  tutorId,
  studentId,
  tutorName,
  tutorInitials,
}: ContactTeacherProps) {
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState('')
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
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.from('direct_messages').insert({
        sender_id: studentId,
        recipient_id: tutorId,
        body: text,
      })
      if (error) {
        console.error('Send message failed:', error)
        return
      }
      setBody('')
      setOpen(false)
      setSentToast(true)
    })
  }

  return (
    <div className="rounded-[10px] bg-surface p-3">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-extrabold"
          style={{ backgroundColor: '#3B8FF018', color: '#3B8FF0' }}
        >
          {tutorInitials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-bold text-primary">{tutorName}</div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-[8px] border border-[rgba(59,143,240,0.25)] bg-[rgba(59,143,240,0.08)] px-2.5 py-1.5 text-[11px] font-bold text-link hover:bg-[rgba(59,143,240,0.16)]"
        >
          {open ? 'Anuluj' : '💬 Napisz'}
        </button>
      </div>

      {open && (
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Twoja wiadomość…"
            rows={3}
            className="resize-none rounded-[8px] border border-[rgba(59,143,240,0.25)] bg-alt p-2 text-[12px] text-primary placeholder:text-dim focus:border-link focus:outline-none"
          />
          <button
            type="button"
            onClick={send}
            disabled={isPending || body.trim().length === 0}
            className="rounded-[8px] bg-primary px-3 py-2 text-[12px] font-extrabold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {isPending ? 'Wysyłanie…' : 'Wyślij wiadomość'}
          </button>
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
    </div>
  )
}
