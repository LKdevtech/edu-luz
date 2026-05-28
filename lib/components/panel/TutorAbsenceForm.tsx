'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type TutorAbsenceFormProps = {
  tutorId: string
}

type AbsenceType = 'sick' | 'vacation' | 'other'

const TYPES: Array<{ key: AbsenceType; label: string; color: string }> = [
  { key: 'sick', label: '🤒 Choroba', color: '#EF4444' },
  { key: 'vacation', label: '🌴 Urlop', color: '#FFCA28' },
  { key: 'other', label: '📅 Inne', color: '#7C5CFC' },
]

/**
 * Formularz zgłaszania nieobecności tutora. Po zatwierdzeniu przez admina
 * system odwoła dotknięte lekcje (logika po stronie admin panel — tutaj tylko
 * wpis do tabeli).
 */
export function TutorAbsenceForm({ tutorId }: TutorAbsenceFormProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<AbsenceType>('sick')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-[10px] px-4 py-2 text-[12px] font-extrabold hover:brightness-110"
        style={{ backgroundColor: '#EF444429', color: '#EF4444' }}
      >
        🚫 Zgłoś nieobecność
      </button>
    )
  }

  function reset() {
    setType('sick')
    setStartDate('')
    setEndDate('')
    setReason('')
    setError(null)
  }

  function submit() {
    setError(null)
    if (!startDate || !endDate) {
      setError('Wypełnij daty od/do.')
      return
    }
    if (endDate < startDate) {
      setError('Data końcowa nie może być wcześniejsza niż początkowa.')
      return
    }
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: insErr } = await supabase.from('tutor_absences').insert({
        tutor_id: tutorId,
        absence_type: type,
        start_date: startDate,
        end_date: endDate,
        reason: reason.trim() || null,
      })
      if (insErr) {
        setError(insErr.message)
        return
      }
      reset()
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <div className="rounded-card bg-surface p-4" style={{ border: '1px solid #EF444433' }}>
      <div className="mb-3 flex flex-wrap gap-2">
        {TYPES.map((t) => {
          const isActive = type === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setType(t.key)}
              className="rounded-[10px] border px-3 py-2 text-[12px] font-bold transition-colors"
              style={
                isActive
                  ? {
                      borderColor: `${t.color}80`,
                      backgroundColor: `${t.color}22`,
                      color: t.color,
                    }
                  : {
                      borderColor: 'rgba(59,143,240,0.10)',
                      backgroundColor: 'transparent',
                      color: '#8B879D',
                    }
              }
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-secondary">Od</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-[10px] border border-subtle bg-main p-2 text-[12px] text-primary focus:border-link focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-secondary">Do</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-[10px] border border-subtle bg-main p-2 text-[12px] text-primary focus:border-link focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1.5 block text-[11px] font-bold text-secondary">Powód</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Opisz powód — admin musi zatwierdzić"
          rows={2}
          className="w-full resize-y rounded-[10px] border border-subtle bg-main p-2.5 text-[12px] text-primary placeholder:text-dim focus:border-link focus:outline-none"
        />
      </div>

      <div
        className="mt-3 flex items-center gap-2 rounded-[10px] p-3"
        style={{ backgroundColor: '#EF444408', border: '1px solid #EF444422' }}
      >
        <span className="text-[14px]" aria-hidden>⚠️</span>
        <p className="text-[11px] font-semibold" style={{ color: '#EF4444' }}>
          Po zatwierdzeniu przez admina system automatycznie odwoła dotknięte lekcje i powiadomi rodziców.
        </p>
      </div>

      {error && (
        <p className="mt-3 rounded-[8px] bg-[#EF444418] px-3 py-2 text-[11px] font-bold" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            reset()
            setOpen(false)
          }}
          disabled={isPending}
          className="rounded-[10px] border border-subtle px-4 py-2 text-[12px] font-bold text-secondary hover:bg-surface-hover disabled:opacity-50"
        >
          Anuluj
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="rounded-[10px] px-4 py-2 text-[12px] font-extrabold text-white hover:brightness-110 disabled:opacity-50"
          style={{ backgroundColor: '#EF4444' }}
        >
          {isPending ? 'Wysyłanie…' : 'Zgłoś nieobecność'}
        </button>
      </div>
    </div>
  )
}
