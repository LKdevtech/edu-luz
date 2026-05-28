'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import {
  FormField,
  GhostBtn,
  PrimaryBtn,
  SelectInput,
  TextInput,
  TextareaInput,
} from './Modal'
import { RegistryDownload } from './RegistryDownload'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { AdminTutorRow } from '@/lib/queries/admin'
import type { Enums } from '@/lib/types/database.types'

type TutorCardProps = {
  tutor: AdminTutorRow
  adminId: string
}

type ActionId = null | 'absence' | 'rates' | 'message'

export function TutorCard({ tutor, adminId }: TutorCardProps) {
  const [active, setActive] = useState<ActionId>(null)

  return (
    <article
      className="rounded-card bg-surface"
      style={{ border: '1px solid rgba(59,143,240,0.10)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-subtle p-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-[11px] text-[15px] font-extrabold"
          style={{ backgroundColor: `${tutor.avatarColor}22`, color: tutor.avatarColor }}
        >
          {tutor.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-extrabold text-primary">{tutor.fullName}</div>
          <div className="text-[12px] text-secondary">
            {tutor.subjects.join(' · ') || 'Brak przedmiotów'} · {tutor.studentCount} uczniów ·{' '}
            {tutor.lessonsPerWeek} lekcji/tydz
          </div>
          {tutor.currentRate && (
            <div className="text-[11px] text-dim">
              Stawka: {tutor.currentRate.individual} zł/h indyw. · {tutor.currentRate.group} zł/h grupa
              {' '}(od {tutor.currentRate.effectiveFrom})
            </div>
          )}
        </div>
        <span
          className="rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider"
          style={
            tutor.isActive
              ? { backgroundColor: '#22C55E22', color: '#22C55E' }
              : { backgroundColor: '#8B879D22', color: '#8B879D' }
          }
        >
          {tutor.isActive ? 'Aktywny' : 'Nieaktywny'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="flex flex-wrap gap-2">
          <ActionButton
            id="absence"
            label="Zgłoś nieobecność"
            icon="🤒"
            color="#EF4444"
            active={active}
            onClick={setActive}
          />
          <ActionButton
            id="rates"
            label="Zmień stawki"
            icon="💰"
            color="#FFCA28"
            active={active}
            onClick={setActive}
          />
          <ActionButton
            id="message"
            label="Wyślij wiadomość"
            icon="💬"
            color="#3B8FF0"
            active={active}
            onClick={setActive}
          />
        </div>
        <RegistryDownload tutorId={tutor.id} tutorFullName={tutor.fullName} />
      </div>

      {/* Expansions */}
      {active === 'absence' && (
        <AbsenceExpansion
          tutorId={tutor.id}
          adminId={adminId}
          tutorName={tutor.fullName}
          onClose={() => setActive(null)}
        />
      )}
      {active === 'rates' && (
        <RatesExpansion
          tutorId={tutor.id}
          adminId={adminId}
          tutorName={tutor.fullName}
          currentRate={tutor.currentRate}
          onClose={() => setActive(null)}
        />
      )}
      {active === 'message' && (
        <MessageExpansion
          tutorId={tutor.id}
          adminId={adminId}
          tutorName={tutor.fullName}
          onClose={() => setActive(null)}
        />
      )}
    </article>
  )
}

function ActionButton({
  id,
  label,
  icon,
  color,
  active,
  onClick,
}: {
  id: ActionId
  label: string
  icon: string
  color: string
  active: ActionId
  onClick: (id: ActionId) => void
}) {
  const isActive = active === id
  return (
    <button
      type="button"
      onClick={() => onClick(isActive ? null : id)}
      className="flex items-center gap-2 rounded-[8px] border px-3 py-1.5 text-[12px] font-bold transition-colors"
      style={
        isActive
          ? { borderColor: `${color}66`, backgroundColor: `${color}10`, color }
          : { borderColor: 'rgba(59,143,240,0.10)', backgroundColor: 'transparent', color: '#9B97AF' }
      }
    >
      <span aria-hidden>{icon}</span>
      {label}
    </button>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Expansion: Absence (admin → wstawia tutor_absence pre-approved)
// ════════════════════════════════════════════════════════════════════════════

function AbsenceExpansion({
  tutorId,
  adminId,
  tutorName,
  onClose,
}: {
  tutorId: string
  adminId: string
  tutorName: string
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState<Enums<'tutor_absence_type'>>('sick')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  async function submit() {
    setError(null)
    if (!startDate || !endDate) {
      setError('Wypełnij daty od/do.')
      return
    }
    if (endDate < startDate) {
      setError('Data końcowa nie może być wcześniejsza.')
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
        approved_at: new Date().toISOString(),
        approved_by: adminId,
      })
      if (insErr) {
        setError(insErr.message)
        return
      }
      onClose()
      router.refresh()
    })
  }

  return (
    <div className="border-t border-subtle p-4">
      <div className="mb-3 text-[13px] font-extrabold" style={{ color: '#EF4444' }}>
        🤒 Zgłoś nieobecność — {tutorName}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Typ" required>
          <SelectInput value={type} onChange={(e) => setType(e.target.value as Enums<'tutor_absence_type'>)}>
            <option value="sick">Choroba</option>
            <option value="vacation">Urlop</option>
            <option value="other">Inne</option>
          </SelectInput>
        </FormField>
        <div />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Od" required>
          <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </FormField>
        <FormField label="Do" required>
          <TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </FormField>
      </div>
      <FormField label="Komentarz">
        <TextareaInput rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Opcjonalny powód" />
      </FormField>
      {error && (
        <p className="mb-2 text-[11px] font-bold" style={{ color: '#EF4444' }}>{error}</p>
      )}
      <div className="flex gap-2">
        <PrimaryBtn color="#EF4444" onClick={submit} disabled={isPending}>
          {isPending ? 'Wysyłanie…' : 'Zatwierdź i odwołaj lekcje'}
        </PrimaryBtn>
        <GhostBtn onClick={onClose}>Anuluj</GhostBtn>
      </div>
      <p className="mt-2 text-[10px] italic text-dim">
        Automatyczne odwoływanie dotkniętych lekcji wymaga osobnej procedury — na razie zapis tylko w
        tabeli `tutor_absences`.
      </p>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Expansion: Rates (insert new tutor_rates with effective_from)
// ════════════════════════════════════════════════════════════════════════════

function RatesExpansion({
  tutorId,
  adminId,
  tutorName,
  currentRate,
  onClose,
}: {
  tutorId: string
  adminId: string
  tutorName: string
  currentRate: AdminTutorRow['currentRate']
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [individual, setIndividual] = useState(String(currentRate?.individual ?? ''))
  const [group, setGroup] = useState(String(currentRate?.group ?? ''))
  const [mode, setMode] = useState<'immediately' | 'next_month' | 'specific_date'>('next_month')
  const [specificDate, setSpecificDate] = useState('')

  function computeEffectiveDate(): string {
    const today = new Date()
    if (mode === 'immediately') return today.toISOString().slice(0, 10)
    if (mode === 'next_month') {
      const next = new Date(today.getFullYear(), today.getMonth() + 1, 1)
      return next.toISOString().slice(0, 10)
    }
    return specificDate
  }

  async function submit() {
    setError(null)
    if (!individual || !group) {
      setError('Wypełnij obie stawki.')
      return
    }
    const effFrom = computeEffectiveDate()
    if (!effFrom) {
      setError('Wybierz datę.')
      return
    }
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: insErr } = await supabase.from('tutor_rates').insert({
        tutor_id: tutorId,
        individual_rate: Number(individual),
        group_rate: Number(group),
        effective_from: effFrom,
        created_by: adminId,
      })
      if (insErr) {
        setError(insErr.message)
        return
      }
      onClose()
      router.refresh()
    })
  }

  return (
    <div className="border-t border-subtle p-4">
      <div className="mb-3 text-[13px] font-extrabold" style={{ color: '#FFCA28' }}>
        💰 Zmień stawki — {tutorName}
      </div>
      {currentRate && (
        <div className="mb-3 rounded-[10px] bg-alt p-3">
          <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-dim">
            Obecne stawki (od {currentRate.effectiveFrom})
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-dim">Indywidualne</span>
            <span className="font-extrabold text-primary">{currentRate.individual} zł/h</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-dim">Grupowe</span>
            <span className="font-extrabold text-primary">{currentRate.group} zł/h</span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Nowa stawka indyw. (zł/h)" required>
          <TextInput type="number" value={individual} onChange={(e) => setIndividual(e.target.value)} />
        </FormField>
        <FormField label="Nowa stawka grupa (zł/h)" required>
          <TextInput type="number" value={group} onChange={(e) => setGroup(e.target.value)} />
        </FormField>
      </div>
      <FormField label="Obowiązuje od" required>
        <SelectInput value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
          <option value="immediately">Natychmiast (dziś)</option>
          <option value="next_month">Od następnego miesiąca</option>
          <option value="specific_date">Od wybranej daty</option>
        </SelectInput>
      </FormField>
      {mode === 'specific_date' && (
        <FormField label="Data" required>
          <TextInput type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} />
        </FormField>
      )}
      <p className="mb-3 text-[11px]" style={{ color: '#F59E0B' }}>
        ⚠ Stawki obowiązują od wybranego momentu — istniejące rozliczenia nie zmienią się wstecznie.
      </p>
      {error && (
        <p className="mb-2 text-[11px] font-bold" style={{ color: '#EF4444' }}>{error}</p>
      )}
      <div className="flex gap-2">
        <PrimaryBtn color="#FFCA28" onClick={submit} disabled={isPending}>
          {isPending ? 'Zapisywanie…' : 'Zapisz nowe stawki'}
        </PrimaryBtn>
        <GhostBtn onClick={onClose}>Anuluj</GhostBtn>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Expansion: Message (direct_messages)
// ════════════════════════════════════════════════════════════════════════════

function MessageExpansion({
  tutorId,
  adminId,
  tutorName,
  onClose,
}: {
  tutorId: string
  adminId: string
  tutorName: string
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  async function submit() {
    setError(null)
    if (!body.trim()) {
      setError('Wpisz treść wiadomości.')
      return
    }
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: insErr } = await supabase.from('direct_messages').insert({
        sender_id: adminId,
        recipient_id: tutorId,
        subject: subject.trim() || null,
        body: body.trim(),
      })
      if (insErr) {
        setError(insErr.message)
        return
      }
      onClose()
      router.refresh()
    })
  }

  return (
    <div className="border-t border-subtle p-4">
      <div className="mb-3 text-[13px] font-extrabold text-link">💬 Wiadomość do {tutorName}</div>
      <FormField label="Temat">
        <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="np. Przypomnienie o wpisach" />
      </FormField>
      <FormField label="Treść" required>
        <TextareaInput rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Treść wiadomości..." />
      </FormField>
      {error && (
        <p className="mb-2 text-[11px] font-bold" style={{ color: '#EF4444' }}>{error}</p>
      )}
      <div className="flex gap-2">
        <PrimaryBtn onClick={submit} disabled={isPending}>
          {isPending ? 'Wysyłanie…' : '📤 Wyślij'}
        </PrimaryBtn>
        <GhostBtn onClick={onClose}>Anuluj</GhostBtn>
      </div>
    </div>
  )
}
