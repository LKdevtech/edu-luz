'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { LevelBadge, SubjectDot } from './Badges'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { ParentMakeupRow } from '@/lib/queries/parent'
import { formatPolishDate } from '@/lib/utils/date'

type MakeupCardProps = {
  item: ParentMakeupRow
  parentId: string
  /** Wariant "compact" do prawej kolumny dashboardu, "full" do tabu Odrabianie. */
  variant?: 'compact' | 'full'
}

/**
 * Karta odrabiania w panelu rodzica — ping-pong z korepetytorem.
 *
 * Stany:
 *   - status='waiting_for_parent' + brak propozycji → picker slotów (rodzic proponuje).
 *   - status='proposed' + propozycja od tutora → 3 przyciski (Akceptuj / Kontropropozycja / Odrzuć).
 *   - status='proposed' + propozycja od rodzica (czeka na tutora) → info "Czeka na korepetytora".
 *   - status='accepted' → "Termin ustalony".
 */
export function MakeupCard({ item, parentId, variant = 'full' }: MakeupCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'idle' | 'picker'>('idle')
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const isProposedByTutor =
    item.status === 'proposed' && item.proposal?.proposedBy === 'tutor'
  const isProposedByParent =
    item.status === 'proposed' && item.proposal?.proposedBy === 'parent'
  // Rodzic może zaproponować termin gdy nie ma jeszcze propozycji — niezależnie
  // od tego, czy makeup_request startuje z `waiting_for_tutor` (po odwołaniu) czy
  // `waiting_for_parent` (po odrzuceniu przez tutora w kolejnej rundzie).
  const needsParentProposal =
    !item.proposal &&
    (item.status === 'waiting_for_parent' || item.status === 'waiting_for_tutor')
  const compact = variant === 'compact'

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

  async function proposeSlot() {
    if (!selectedSlotId) return
    const slot = item.availableSlots.find((s) => s.id === selectedSlotId)
    if (!slot) return

    setError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const nextRound = item.proposal ? 2 : 1
      const action = item.proposal ? 'counter_proposed' : 'proposed'
      const { error: insErr } = await supabase.from('makeup_proposals').insert({
        request_id: item.requestId,
        round_number: nextRound,
        proposed_by: 'parent',
        proposed_by_id: parentId,
        action,
        proposed_date: slot.date,
        proposed_start: `${slot.startTime}:00`,
        proposed_end: `${slot.endTime}:00`,
      })
      if (insErr) {
        setError(insErr.message)
        return
      }
      const { error: updErr } = await supabase
        .from('makeup_requests')
        .update({
          status: 'waiting_for_tutor',
          current_round: nextRound,
        })
        .eq('id', item.requestId)
      if (updErr) {
        setError(updErr.message)
        return
      }
      setMode('idle')
      setSelectedSlotId(null)
      router.refresh()
    })
  }

  return (
    <article
      className="rounded-card bg-surface p-4"
      style={{ borderLeft: '3px solid #7C5CFC' }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-[14px] font-extrabold"
          style={{ backgroundColor: '#7C5CFC29', color: '#7C5CFC' }}
        >
          ↻
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold"
              style={{ backgroundColor: `${item.childAvatarColor}29`, color: item.childAvatarColor }}
            >
              {item.childInitials}
            </span>
            <span className="text-[12px] font-extrabold text-primary">{item.childName}</span>
            <SubjectDot color={item.subjectColor} />
            <span className="text-[13px] font-extrabold text-primary">{item.subjectName}</span>
            <LevelBadge level={item.level} label={item.levelLabel} />
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold"
              style={{ backgroundColor: '#7C5CFC22', color: '#7C5CFC' }}
            >
              ODR
            </span>
          </div>
          <div className="mt-1 text-[11px] text-secondary">
            {item.tutorName} • Odwołana: {formatPolishDate(item.originalDate)}
            {item.cancelReason ? ` • ${item.cancelReason}` : ''}
          </div>
          {item.deadline && (
            <div
              className="mt-1 text-[11px]"
              style={{
                color: item.daysLeftToDeadline !== null && item.daysLeftToDeadline < 7 ? '#EF4444' : '#F59E0B',
              }}
            >
              Termin: do {formatPolishDate(item.deadline)}
              {item.daysLeftToDeadline !== null && ` (${item.daysLeftToDeadline} dni)`}
            </div>
          )}
        </div>
      </div>

      {/* Stan: tutor zaproponował termin */}
      {isProposedByTutor && item.proposal && (
        <div
          className="mt-3 rounded-[10px] p-3"
          style={{ backgroundColor: '#22C55E0A', borderLeft: '3px solid #22C55E66' }}
        >
          <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-success">
            Propozycja od korepetytora
          </div>
          {item.proposal.proposedDate && (
            <div className="text-[14px] font-extrabold text-primary">
              📅 {formatPolishDate(item.proposal.proposedDate)}
              {item.proposal.proposedStart && ` • ${item.proposal.proposedStart}`}
              {item.proposal.proposedEnd && `–${item.proposal.proposedEnd}`}
            </div>
          )}
          {item.proposal.note && (
            <p className="mt-1 text-[11px] text-secondary">{item.proposal.note}</p>
          )}
          {!compact && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={accept}
                disabled={isPending}
                className="rounded-[8px] bg-success px-3 py-1.5 text-[12px] font-extrabold text-white hover:brightness-110 disabled:opacity-50"
              >
                ✓ Akceptuj
              </button>
              <button
                type="button"
                onClick={() => setMode(mode === 'picker' ? 'idle' : 'picker')}
                disabled={isPending}
                className="rounded-[8px] border border-subtle bg-surface px-3 py-1.5 text-[12px] font-bold text-secondary hover:bg-surface-hover disabled:opacity-50"
              >
                Kontropropozycja
              </button>
              <button
                type="button"
                onClick={reject}
                disabled={isPending}
                className="rounded-[8px] border px-3 py-1.5 text-[12px] font-bold disabled:opacity-50"
                style={{ borderColor: '#EF444433', color: '#EF4444' }}
              >
                Odrzuć
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stan: rodzic zaproponował, czeka na tutora */}
      {isProposedByParent && item.proposal && (
        <div
          className="mt-3 rounded-[10px] p-3"
          style={{ backgroundColor: '#FFCA280A', borderLeft: '3px solid #FFCA2866' }}
        >
          <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider" style={{ color: '#FFCA28' }}>
            ⏳ Czeka na potwierdzenie korepetytora
          </div>
          {item.proposal.proposedDate && (
            <div className="text-[13px] font-extrabold text-primary">
              Twoja propozycja: 📅 {formatPolishDate(item.proposal.proposedDate)}
              {item.proposal.proposedStart && ` • ${item.proposal.proposedStart}`}
            </div>
          )}
        </div>
      )}

      {/* Stan: brak propozycji — rodzic proponuje pierwszy.
          Dostępne też w trybie compact (dashboard sidebar). */}
      {needsParentProposal && mode === 'idle' && (
        <div
          className="mt-3 rounded-[10px] p-3"
          style={{ backgroundColor: '#F59E0B0A', borderLeft: '3px solid #F59E0B66' }}
        >
          <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider" style={{ color: '#F59E0B' }}>
            ⏳ Czeka na Twoją propozycję terminu
          </div>
          <button
            type="button"
            onClick={() => setMode('picker')}
            className="mt-2 rounded-[8px] bg-primary px-3 py-1.5 text-[12px] font-extrabold text-white hover:bg-primary-dark"
          >
            📅 Wybierz termin
          </button>
        </div>
      )}

      {/* Picker slotów (rodzic proponuje albo kontrpropozycja).
          Dostępny też w trybie compact (dashboard sidebar). */}
      {mode === 'picker' && (
        <div
          className="mt-3 rounded-[10px] p-3"
          style={{ backgroundColor: 'rgba(59,143,240,0.08)', borderLeft: '3px solid rgba(59,143,240,0.4)' }}
        >
          <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-link">
            Dostępne terminy u {item.tutorName}
          </div>
          {item.availableSlots.length === 0 ? (
            <p className="text-[11px] text-dim">
              Korepetytor nie dodał jeszcze dodatkowych terminów. Skontaktuj się z centrum.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {item.availableSlots.map((s) => {
                const isSelected = selectedSlotId === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSlotId(s.id)}
                    className="flex items-center justify-between rounded-[8px] px-3 py-2 text-[12px] transition-colors"
                    style={
                      isSelected
                        ? {
                            backgroundColor: 'rgba(59,143,240,0.22)',
                            border: '1px solid rgba(59,143,240,0.5)',
                            color: '#3B8FF0',
                          }
                        : {
                            backgroundColor: '#232840',
                            border: '1px solid transparent',
                            color: '#F0EDE6',
                          }
                    }
                  >
                    <span className="font-extrabold">📅 {formatPolishDate(s.date)}</span>
                    <span className="text-secondary">
                      {s.startTime}–{s.endTime}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={proposeSlot}
              disabled={isPending || !selectedSlotId}
              className="rounded-[8px] bg-primary px-3 py-1.5 text-[12px] font-extrabold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {isPending ? 'Wysyłanie…' : 'Zaproponuj termin'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('idle')
                setSelectedSlotId(null)
              }}
              disabled={isPending}
              className="rounded-[8px] border border-subtle bg-surface px-3 py-1.5 text-[12px] font-bold text-secondary hover:bg-surface-hover disabled:opacity-50"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-[11px] font-bold" style={{ color: '#EF4444' }}>
          Błąd: {error}
        </p>
      )}
    </article>
  )
}
