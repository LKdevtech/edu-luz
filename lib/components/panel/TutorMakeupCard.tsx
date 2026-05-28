'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { LevelBadge, SubjectDot } from './Badges'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { TutorMakeupRow } from '@/lib/queries/tutor'
import { formatPolishDate } from '@/lib/utils/date'

type TutorMakeupCardProps = {
  item: TutorMakeupRow
  tutorId: string
  /** "pending" = rodzic czeka na tutora (3 buttony); "sent" = tutor czeka; "accepted"; "history". */
  mode: 'pending' | 'sent' | 'accepted' | 'history'
}

/**
 * Karta odrabiania w panelu tutora — ping-pong z rodzicem.
 *
 * Stany:
 *   - `pending`: rodzic wysłał propozycję → Akceptuj / Kontrpropozycja / Odrzuć
 *   - `sent`: tutor wysłał, czekamy
 *   - `accepted`: ustalony termin (z liczbą dni)
 *   - `history`: zakończone
 */
export function TutorMakeupCard({ item, tutorId, mode }: TutorMakeupCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [counterOpen, setCounterOpen] = useState(false)
  const [counterDate, setCounterDate] = useState('')
  const [counterStart, setCounterStart] = useState('')
  const [counterEnd, setCounterEnd] = useState('')
  const [counterNote, setCounterNote] = useState('')

  async function accept() {
    setError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: err } = await supabase
        .from('makeup_requests')
        .update({ status: 'accepted' })
        .eq('id', item.requestId)
      if (err) {
        setError(err.message)
        return
      }
      router.refresh()
    })
  }

  async function reject() {
    setError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: err } = await supabase
        .from('makeup_requests')
        .update({ status: 'rejected' })
        .eq('id', item.requestId)
      if (err) {
        setError(err.message)
        return
      }
      router.refresh()
    })
  }

  async function counterPropose() {
    setError(null)
    if (!counterDate || !counterStart || !counterEnd) {
      setError('Wypełnij datę i godziny propozycji.')
      return
    }
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const nextRound = (item.latestProposal?.round ?? 0) + 1
      const { error: insErr } = await supabase.from('makeup_proposals').insert({
        request_id: item.requestId,
        round_number: nextRound,
        proposed_by: 'tutor',
        proposed_by_id: tutorId,
        action: nextRound === 1 ? 'proposed' : 'counter_proposed',
        proposed_date: counterDate,
        proposed_start: `${counterStart}:00`,
        proposed_end: `${counterEnd}:00`,
        note: counterNote.trim() || null,
      })
      if (insErr) {
        setError(insErr.message)
        return
      }
      const { error: updErr } = await supabase
        .from('makeup_requests')
        .update({ status: 'waiting_for_parent', current_round: nextRound })
        .eq('id', item.requestId)
      if (updErr) {
        setError(updErr.message)
        return
      }
      setCounterOpen(false)
      setCounterDate('')
      setCounterStart('')
      setCounterEnd('')
      setCounterNote('')
      router.refresh()
    })
  }

  const accentColor = mode === 'pending' ? '#FFCA28' : mode === 'sent' ? '#3B8FF0' : mode === 'accepted' ? '#22C55E' : '#7C5CFC'

  return (
    <article
      className="rounded-card bg-surface p-4"
      style={{
        borderLeft: `4px solid ${accentColor}`,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
      }}
    >
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-extrabold"
          style={{ backgroundColor: `${item.studentColor}29`, color: item.studentColor }}
        >
          {item.studentInitials}
        </span>
        <span className="text-[15px] font-extrabold text-primary">{item.studentLabel}</span>
        <LevelBadge level={item.level} label={item.levelLabel} />
        <SubjectDot color={item.subjectColor} />
        <span className="text-[11px] text-secondary">{item.subjectName}</span>
        {item.latestProposal && item.latestProposal.round > 1 && (
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold"
            style={{ backgroundColor: '#7C5CFC22', color: '#7C5CFC' }}
          >
            Runda {item.latestProposal.round}
          </span>
        )}
      </div>

      <div className="mb-3 grid gap-2 md:grid-cols-2">
        <div
          className="rounded-[10px] p-3"
          style={{ backgroundColor: '#EF444408', border: '1px solid #EF444422' }}
        >
          <div className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: '#EF4444' }}>
            Odwołana lekcja
          </div>
          <div className="mt-0.5 text-[12px] font-bold text-primary">
            {formatPolishDate(item.originalDate)}
          </div>
          {item.cancelReason && (
            <div className="mt-0.5 text-[10px] text-secondary">{item.cancelReason}</div>
          )}
        </div>
        {item.latestProposal?.proposedDate && (
          <div
            className="rounded-[10px] p-3"
            style={{ backgroundColor: '#22C55E08', border: '1px solid #22C55E22' }}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-success">
              Proponowany termin
            </div>
            <div className="mt-0.5 text-[12px] font-bold text-primary">
              {formatPolishDate(item.latestProposal.proposedDate)}
              {item.latestProposal.proposedStart && ` · ${item.latestProposal.proposedStart}`}
              {item.latestProposal.proposedEnd && `–${item.latestProposal.proposedEnd}`}
            </div>
            <div className="mt-0.5 text-[10px] text-secondary">
              Od: {item.latestProposal.proposedByName}
            </div>
          </div>
        )}
      </div>

      {item.history.length > 1 && (
        <div className="mb-3 rounded-[10px] bg-alt p-3">
          <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-dim">
            Historia negocjacji
          </div>
          <div className="flex flex-col gap-2">
            {item.history.map((h, i) => {
              const color = h.proposedBy === 'parent' ? '#7C5CFC' : '#3B8FF0'
              const actionLabel = h.action === 'proposed' ? 'Zaproponował' : h.action === 'counter_proposed' ? 'Kontrpropozycja' : h.action === 'accepted' ? 'Zaakceptował' : 'Odrzucił'
              return (
                <div key={i} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div className="text-[11px]">
                    <span className="font-bold" style={{ color }}>
                      {h.proposedByName}
                    </span>{' '}
                    — {actionLabel}
                    {h.proposedDate && (
                      <>: <span className="text-secondary">{formatPolishDate(h.proposedDate)}</span></>
                    )}
                    {h.note && (
                      <div className="mt-0.5 italic text-dim">{`„${h.note}"`}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {error && (
        <p className="mb-3 rounded-[8px] bg-[#EF444418] px-3 py-2 text-[11px] font-bold" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}

      {mode === 'pending' && !counterOpen && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={accept}
            disabled={isPending}
            className="rounded-[10px] px-4 py-2 text-[12px] font-extrabold text-white hover:brightness-110 disabled:opacity-50"
            style={{ backgroundColor: '#22C55E' }}
          >
            ✓ Akceptuj termin
          </button>
          <button
            type="button"
            onClick={() => setCounterOpen(true)}
            disabled={isPending}
            className="rounded-[10px] border px-4 py-2 text-[12px] font-extrabold disabled:opacity-50"
            style={{ borderColor: '#7C5CFC66', backgroundColor: 'transparent', color: '#7C5CFC' }}
          >
            ↩ Kontrpropozycja
          </button>
          <button
            type="button"
            onClick={reject}
            disabled={isPending}
            className="rounded-[10px] border px-4 py-2 text-[12px] font-bold disabled:opacity-50"
            style={{ borderColor: 'rgba(59,143,240,0.10)', backgroundColor: 'transparent', color: '#EF4444' }}
          >
            ✗ Odrzuć
          </button>
        </div>
      )}

      {counterOpen && (
        <div className="rounded-[10px] bg-alt p-3">
          <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-accent">
            Zaproponuj inny termin
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold text-dim">Data</label>
              <input
                type="date"
                value={counterDate}
                onChange={(e) => setCounterDate(e.target.value)}
                className="w-full rounded-[8px] border border-subtle bg-main p-2 text-[12px] text-primary focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-dim">Od</label>
              <input
                type="time"
                value={counterStart}
                onChange={(e) => setCounterStart(e.target.value)}
                className="w-full rounded-[8px] border border-subtle bg-main p-2 text-[12px] text-primary focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-dim">Do</label>
              <input
                type="time"
                value={counterEnd}
                onChange={(e) => setCounterEnd(e.target.value)}
                className="w-full rounded-[8px] border border-subtle bg-main p-2 text-[12px] text-primary focus:border-accent focus:outline-none"
              />
            </div>
          </div>
          <textarea
            value={counterNote}
            onChange={(e) => setCounterNote(e.target.value)}
            placeholder="Opcjonalna uwaga (np. dlaczego ten termin nie pasuje)"
            rows={2}
            className="mt-2 w-full resize-y rounded-[8px] border border-subtle bg-main p-2 text-[12px] text-primary placeholder:text-dim focus:border-accent focus:outline-none"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCounterOpen(false)}
              disabled={isPending}
              className="rounded-[8px] border border-subtle px-3 py-1.5 text-[12px] font-bold text-secondary hover:bg-surface-hover disabled:opacity-50"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={counterPropose}
              disabled={isPending}
              className="rounded-[8px] px-3 py-1.5 text-[12px] font-extrabold text-white disabled:opacity-50"
              style={{ backgroundColor: '#7C5CFC' }}
            >
              {isPending ? 'Wysyłanie…' : 'Wyślij propozycję'}
            </button>
          </div>
        </div>
      )}

      {mode === 'sent' && item.latestProposal && (
        <div className="text-[11px] text-secondary">
          Oczekuje na odpowiedź rodzica.
        </div>
      )}

      {mode === 'accepted' && (
        <div className="rounded-[10px] p-2 text-[12px] font-bold" style={{ backgroundColor: '#22C55E15', color: '#22C55E' }}>
          ✓ Termin ustalony
        </div>
      )}
    </article>
  )
}
