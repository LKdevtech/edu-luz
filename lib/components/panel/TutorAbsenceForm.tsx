'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type TutorAbsenceFormProps = {
  tutorId: string
}

type Urgency = 'urgent' | 'planned'
type ReasonKey = 'choroba' | 'sprawy_osobiste' | 'inne'

const REASONS: Array<{ key: ReasonKey; label: string; absenceType: 'sick' | 'other' }> = [
  { key: 'choroba', label: 'Choroba', absenceType: 'sick' },
  { key: 'sprawy_osobiste', label: 'Sprawy osobiste', absenceType: 'other' },
  { key: 'inne', label: 'Inne', absenceType: 'other' },
]

/**
 * Zgłaszanie nieobecności korepetytora — flow z mockupu:
 *   1. Typ: Nagła / Planowana
 *   2. Powód: Choroba / Sprawy osobiste / Inne
 *   3. Termin: zakres dat + opcjonalnie KONKRETNE GODZINY (np. niedostępny
 *      14:00–16:00, a resztę dnia pracuje normalnie). Cały dzień = bez godzin.
 *
 * Po zatwierdzeniu przez admina system odwoła dotknięte lekcje.
 */
export function TutorAbsenceForm({ tutorId }: TutorAbsenceFormProps) {
  const [open, setOpen] = useState(false)
  const [urgency, setUrgency] = useState<Urgency>('planned')
  const [reasonKey, setReasonKey] = useState<ReasonKey>('choroba')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [wholeDay, setWholeDay] = useState(true)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [note, setNote] = useState('')
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
    setUrgency('planned')
    setReasonKey('choroba')
    setStartDate('')
    setEndDate('')
    setWholeDay(true)
    setStartTime('')
    setEndTime('')
    setNote('')
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
    if (!wholeDay) {
      if (!startTime || !endTime) {
        setError('Podaj godziny niedostępności lub zaznacz „cały dzień”.')
        return
      }
      if (endTime <= startTime) {
        setError('Godzina końcowa musi być późniejsza niż początkowa.')
        return
      }
    }
    const reason = REASONS.find((r) => r.key === reasonKey)!
    const reasonText = note.trim() ? `${reason.label} — ${note.trim()}` : reason.label

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: insErr } = await supabase.from('tutor_absences').insert({
        tutor_id: tutorId,
        absence_type: reason.absenceType,
        is_urgent: urgency === 'urgent',
        start_date: startDate,
        end_date: endDate,
        start_time: wholeDay ? null : `${startTime}:00`,
        end_time: wholeDay ? null : `${endTime}:00`,
        reason: reasonText,
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

  const accent = urgency === 'urgent' ? '#EF4444' : '#FFCA28'

  return (
    <div className="w-full rounded-card bg-surface p-4" style={{ border: `1px solid ${accent}33` }}>
      {/* Krok 1: typ */}
      <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-dim">
        1. Rodzaj zgłoszenia
      </div>
      <div className="mb-4 flex gap-2">
        {([
          { key: 'urgent' as const, label: '⚠️ Nagła', color: '#EF4444' },
          { key: 'planned' as const, label: '📅 Planowana', color: '#FFCA28' },
        ]).map((opt) => {
          const isActive = urgency === opt.key
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setUrgency(opt.key)}
              className="rounded-[10px] border px-4 py-2 text-[12px] font-bold transition-colors"
              style={
                isActive
                  ? { borderColor: `${opt.color}80`, backgroundColor: `${opt.color}22`, color: opt.color }
                  : { borderColor: 'rgba(59,143,240,0.10)', backgroundColor: 'transparent', color: '#8B879D' }
              }
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Krok 2: powód */}
      <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-dim">
        2. Powód
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {REASONS.map((r) => {
          const isActive = reasonKey === r.key
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => setReasonKey(r.key)}
              className="rounded-[8px] border px-3.5 py-1.5 text-[11px] font-bold transition-colors"
              style={
                isActive
                  ? { borderColor: '#3B8FF080', backgroundColor: '#3B8FF018', color: '#3B8FF0' }
                  : { borderColor: 'rgba(59,143,240,0.10)', backgroundColor: 'transparent', color: '#8B879D' }
              }
            >
              {r.label}
            </button>
          )
        })}
      </div>

      {/* Krok 3: termin */}
      <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-dim">
        3. Termin
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

      {/* Godziny — opcjonalne (cały dzień vs konkretny przedział) */}
      <div className="mt-3 flex items-center gap-2">
        <input
          id="wholeDay"
          type="checkbox"
          checked={wholeDay}
          onChange={(e) => setWholeDay(e.target.checked)}
          className="h-4 w-4 accent-[#3B8FF0]"
        />
        <label htmlFor="wholeDay" className="text-[12px] font-semibold text-secondary">
          Cały dzień
        </label>
      </div>
      {!wholeDay && (
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold text-secondary">Niedostępny od godz.</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-[10px] border border-subtle bg-main p-2 text-[12px] text-primary focus:border-link focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold text-secondary">do godz.</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-[10px] border border-subtle bg-main p-2 text-[12px] text-primary focus:border-link focus:outline-none"
            />
          </div>
          <p className="md:col-span-2 -mt-1 text-[10px] italic text-dim">
            Niedostępny tylko w tych godzinach — resztę dnia pracujesz normalnie.
          </p>
        </div>
      )}

      {/* Notatka */}
      <div className="mt-3">
        <label className="mb-1.5 block text-[11px] font-bold text-secondary">Notatka (opcjonalna)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Dodatkowe informacje dla admina"
          rows={2}
          className="w-full resize-y rounded-[10px] border border-subtle bg-main p-2.5 text-[12px] text-primary placeholder:text-dim focus:border-link focus:outline-none"
        />
      </div>

      <div
        className="mt-3 flex items-center gap-2 rounded-[10px] p-3"
        style={{ backgroundColor: `${accent}0F`, border: `1px solid ${accent}22` }}
      >
        <span className="text-[14px]" aria-hidden>⚠️</span>
        <p className="text-[11px] font-semibold" style={{ color: accent }}>
          Po zatwierdzeniu przez admina system automatycznie odwoła dotknięte lekcje i powiadomi rodziców.
          {urgency === 'urgent' && ' Zgłoszenie nagłe — admin zostanie powiadomiony natychmiast.'}
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
          style={{ backgroundColor: urgency === 'urgent' ? '#EF4444' : '#FFCA28' }}
        >
          {isPending ? 'Wysyłanie…' : urgency === 'urgent' ? 'Zgłoś pilnie' : 'Zgłoś nieobecność'}
        </button>
      </div>
    </div>
  )
}
