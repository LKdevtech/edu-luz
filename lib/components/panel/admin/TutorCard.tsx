'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import type { AdminTutorEnriched } from './AdminTutorsEnriched'
import {
  FormField,
  GhostBtn,
  Modal,
  PrimaryBtn,
  SelectInput,
  TextInput,
  TextareaInput,
} from './Modal'
import { RegistryDownload } from '@/lib/components/panel/admin/RegistryDownload'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Enums } from '@/lib/types/database.types'

const T = {
  bg: '#151827',
  surface: '#232840',
  surfaceHover: '#2A3050',
  text: '#F0EDE6',
  textMuted: '#9B97AF',
  textDim: '#6B6780',
  primary: '#3B8FF0',
  secondary: '#FF6F4A',
  tertiary: '#FFCA28',
  accent: '#7C5CFC',
  success: '#22C55E',
  cyan: '#06B6D4',
  danger: '#EF4444',
  pink: '#E84393',
  cardBorder: 'rgba(59,143,240,0.10)',
}

const DOT = '·'

const SUBJECT_COLOR: Record<string, string> = {
  Matematyka: '#3B8FF0',
  Angielski: '#06B6D4',
  Fizyka: '#F59E0B',
  Chemia: '#22C55E',
  Polski: '#E84393',
  Elektrotechnika: '#FF6F4A',
}

const LEVEL_COLOR: Record<Enums<'student_level'>, string> = {
  SP: '#06B6D4',
  E8: '#FFCA28',
  SR: '#3B8FF0',
  SR_EXT: '#7C5CFC',
  EM: '#EF4444',
  EM_EXT: '#E84393',
}

type ModalId = null | 'absence' | 'availability' | 'rates' | 'message' | 'edit'

type TutorCardProps = {
  tutor: AdminTutorEnriched
  adminId: string
}

export function TutorCard({ tutor, adminId }: TutorCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [hov, setHov] = useState(false)
  const [modal, setModal] = useState<ModalId>(null)

  const isAbsent = !tutor.isActive || tutor.isAbsentNow
  const statusLabel = isAbsent ? 'Nieobecny' : 'Aktywny'
  const statusColor = isAbsent ? T.danger : T.success
  const rate = tutor.currentRate

  const totalStudents = tutor.studentsIndiv + tutor.groupStudents

  const entryRate: number | null = tutor.settlement
    ? tutor.settlement.done + tutor.settlement.noShow + tutor.settlement.cancelled > 0
      ? Math.round(
          (tutor.settlement.done /
            (tutor.settlement.done + tutor.settlement.noShow + tutor.settlement.cancelled)) *
            100,
        )
      : null
    : null

  return (
    <div
      className="overflow-hidden rounded-[14px] transition-all"
      style={{
        background: hov && !expanded ? T.surfaceHover : T.surface,
        border: `1px solid ${isAbsent ? T.danger + '25' : T.cardBorder}`,
        opacity: isAbsent ? 0.85 : 1,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* ── Wiersz nagłówka (zawsze widoczny) ── */}
      <div
        onClick={() => setExpanded((e) => !e)}
        className="flex cursor-pointer items-center gap-3.5 px-[18px] py-3.5"
      >
        {/* Avatar */}
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-[15px] font-extrabold"
          style={{
            background: `${isAbsent ? T.danger : tutor.avatarColor}20`,
            color: isAbsent ? T.danger : tutor.avatarColor,
          }}
        >
          {tutor.initials}
        </div>

        {/* Nazwa + przedmioty + status */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-extrabold" style={{ color: T.text }}>
              {tutor.fullName}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-bold"
              style={{ color: statusColor, background: `${statusColor}15` }}
            >
              {statusLabel}
            </span>
            {tutor.hasUpcomingAbsence && (
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                style={{ color: T.tertiary, background: `${T.tertiary}12` }}
              >
                Planowana nieob.: {tutor.hasUpcomingAbsence.dates}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {tutor.subjects.length > 0 ? (
              tutor.subjects.map((s, i) => (
                <span
                  key={i}
                  className="rounded-full px-[7px] py-px text-[9px] font-bold"
                  style={{
                    color: SUBJECT_COLOR[s] ?? T.textDim,
                    background: `${SUBJECT_COLOR[s] ?? T.textDim}15`,
                  }}
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-[10px]" style={{ color: T.textDim }}>
                Brak przedmiotów
              </span>
            )}
          </div>
        </div>

        {/* Szybkie metryki */}
        <div className="flex shrink-0 gap-4">
          <Metric value={String(totalStudents)} label="uczniów" color={T.text} />
          <Metric value={String(tutor.lessonsPerWeek)} label="lek./tydz." color={T.primary} />
          {entryRate !== null && (
            <Metric
              value={`${entryRate}%`}
              label="wpisy"
              color={entryRate >= 95 ? T.success : entryRate >= 85 ? T.tertiary : T.danger}
            />
          )}
          {rate && <Metric value={`${rate.individual} zł`} label="stawka/h" color={T.tertiary} />}
        </div>

        <span
          className="ml-1 inline-block shrink-0 text-[12px] transition-transform"
          style={{ color: T.textDim, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </div>

      {/* ── Rozwinięcie ── */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${T.cardBorder}` }}>
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Kol. 1: Dane kontaktowe + stawki + rozliczenie */}
            <div
              className="px-[18px] py-4"
              style={{ borderRight: `1px solid ${T.cardBorder}` }}
            >
              <div className="mb-2.5 text-[11px] font-extrabold" style={{ color: T.text }}>
                Dane kontaktowe
              </div>
              {[
                { label: 'Telefon', value: tutor.phone },
                { label: 'Email', value: tutor.email },
              ].map((d) => (
                <div key={d.label} className="mb-2">
                  <div
                    className="text-[8px] font-semibold uppercase tracking-wider"
                    style={{ color: T.textDim }}
                  >
                    {d.label}
                  </div>
                  <div className="text-[12px] font-semibold" style={{ color: T.text }}>
                    {d.value ?? '—'}
                  </div>
                </div>
              ))}

              <div className="mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${T.cardBorder}` }}>
                <div className="mb-2 text-[11px] font-extrabold" style={{ color: T.text }}>
                  Stawki
                </div>
                {rate ? (
                  <div className="flex gap-3">
                    <div>
                      <div className="text-[8px]" style={{ color: T.textDim }}>
                        Indywidualnie
                      </div>
                      <div className="text-[14px] font-extrabold" style={{ color: T.tertiary }}>
                        {rate.individual} zł/h
                      </div>
                    </div>
                    <div>
                      <div className="text-[8px]" style={{ color: T.textDim }}>
                        Grupa
                      </div>
                      <div className="text-[14px] font-extrabold" style={{ color: T.tertiary }}>
                        {rate.group} zł/h
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px]" style={{ color: T.textDim }}>
                    Brak ustawionych stawek.
                  </div>
                )}
              </div>

              {/* Rozliczenie miesięczne */}
              {tutor.settlement && (
                <div className="mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${T.cardBorder}` }}>
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="text-[11px] font-extrabold" style={{ color: T.text }}>
                      Rozliczenie miesięczne
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: T.text }}>
                      {tutor.settlement.monthLabel}
                    </span>
                  </div>
                  <div className="mb-2.5 grid grid-cols-4 gap-1.5">
                    <SettlementStat label="Planowane" value={tutor.settlement.planned} color={T.primary} />
                    <SettlementStat label="Zrealizowane" value={tutor.settlement.done} color={T.success} />
                    <SettlementStat label="Odwołane" value={tutor.settlement.cancelled} color={T.danger} />
                    <SettlementStat label="No-show" value={tutor.settlement.noShow} color={T.secondary} />
                  </div>
                  <div
                    className="rounded-[8px] px-3 py-2"
                    style={{ background: `${T.tertiary}10`, border: `1px solid ${T.tertiary}20` }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[8px]" style={{ color: T.textDim }}>
                          Wypłata brutto
                        </div>
                        <div className="text-[20px] font-black" style={{ color: T.tertiary }}>
                          {tutor.settlement.payout.toLocaleString('pl-PL')} zł
                        </div>
                      </div>
                      <div className="text-right text-[9px]" style={{ color: T.textDim }}>
                        {rate && (
                          <div>
                            {tutor.settlement.individualHours}h indyw. × {rate.individual} zł
                          </div>
                        )}
                        {tutor.settlement.groupHours > 0 && rate && (
                          <div>
                            {tutor.settlement.groupHours}h grupa × {rate.group} zł
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Kol. 2: Uczniowie */}
            <div className="px-[18px] py-4" style={{ borderRight: `1px solid ${T.cardBorder}` }}>
              <div className="mb-2.5 flex items-center justify-between">
                <div className="text-[11px] font-extrabold" style={{ color: T.text }}>
                  Uczniowie ({tutor.students.length})
                </div>
                <span className="text-[9px]" style={{ color: T.textDim }}>
                  {tutor.studentsIndiv} indyw. {DOT} {tutor.groupsCount} grup
                </span>
              </div>
              {tutor.students.length === 0 ? (
                <div className="text-[10px]" style={{ color: T.textDim }}>
                  Brak przypisanych uczniów.
                </div>
              ) : (
                <div className="flex max-h-[220px] flex-col gap-1 overflow-auto">
                  {tutor.students.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 rounded-[8px] px-2 py-[5px] text-[10px]"
                      style={{ background: T.bg }}
                    >
                      <span
                        className="min-w-0 flex-1 truncate font-bold"
                        style={{ color: T.text }}
                      >
                        {s.name}
                      </span>
                      <span
                        className="shrink-0 text-[8px] font-bold"
                        style={{ color: SUBJECT_COLOR[s.subject] ?? T.textDim }}
                      >
                        {s.subject.slice(0, 3).toUpperCase()}
                      </span>
                      <span
                        className="shrink-0 rounded-[3px] px-1 text-[7px] font-extrabold"
                        style={{
                          color: LEVEL_COLOR[s.level] ?? T.textDim,
                          background: `${LEVEL_COLOR[s.level] ?? T.textDim}15`,
                        }}
                      >
                        {s.levelLabel}
                      </span>
                      <span className="shrink-0 text-[8px]" style={{ color: T.textDim }}>
                        {s.type === 'grupa' ? '👥' : ''}
                      </span>
                      <span className="shrink-0 text-[8px]" style={{ color: T.textDim }}>
                        {s.hours}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kol. 3: Nieobecności + akcje */}
            <div className="px-[18px] py-4">
              <div className="mb-2.5 text-[11px] font-extrabold" style={{ color: T.text }}>
                Nieobecności
              </div>
              {tutor.absences.length === 0 ? (
                <div className="py-2 text-[10px]" style={{ color: T.textDim }}>
                  Brak nieobecności w tym miesiącu
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {tutor.absences.map((a, i) => (
                    <AbsenceItem key={i} absence={a} />
                  ))}
                </div>
              )}

              <div className="mt-3.5 pt-3.5" style={{ borderTop: `1px solid ${T.cardBorder}` }}>
                <div className="mb-2.5 text-[11px] font-extrabold" style={{ color: T.text }}>
                  Akcje
                </div>
                <div className="flex flex-col gap-1.5">
                  <ActionButton label="Zgłoś nieobecność" color={T.danger} onClick={() => setModal('absence')} />
                  <ActionButton label="Edytuj dostępność" color={T.tertiary} onClick={() => setModal('availability')} />
                  <ActionButton label="Zmień stawki" color={T.accent} onClick={() => setModal('rates')} />
                  <ActionButton label="Wyślij wiadomość" color={T.cyan} onClick={() => setModal('message')} />
                </div>

                {/* Rejestr godzin (PDF) */}
                <div className="mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${T.cardBorder}` }}>
                  <div className="mb-2 text-[11px] font-extrabold" style={{ color: T.text }}>
                    Rejestr godzin
                  </div>
                  <RegistryDownload tutorId={tutor.id} tutorFullName={tutor.fullName} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modale ── */}
      <AbsenceModal
        open={modal === 'absence'}
        onClose={() => setModal(null)}
        tutorId={tutor.id}
        adminId={adminId}
        tutorName={tutor.fullName}
      />
      <AvailabilityModal
        open={modal === 'availability'}
        onClose={() => setModal(null)}
        tutorName={tutor.fullName}
      />
      <RatesModal
        open={modal === 'rates'}
        onClose={() => setModal(null)}
        tutorId={tutor.id}
        adminId={adminId}
        tutorName={tutor.fullName}
        currentRate={tutor.currentRate}
      />
      <MessageModal
        open={modal === 'message'}
        onClose={() => setModal(null)}
        tutorId={tutor.id}
        adminId={adminId}
        tutorName={tutor.fullName}
      />
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Drobne komponenty prezentacyjne
// ════════════════════════════════════════════════════════════════════════════

function Metric({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-[16px] font-black leading-none" style={{ color }}>
        {value}
      </div>
      <div className="mt-0.5 text-[8px]" style={{ color: T.textDim }}>
        {label}
      </div>
    </div>
  )
}

function SettlementStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-[6px] px-1 py-1.5 text-center" style={{ background: T.bg }}>
      <div className="text-[15px] font-black" style={{ color }}>
        {value}
      </div>
      <div className="text-[7px]" style={{ color: T.textDim }}>
        {label}
      </div>
    </div>
  )
}

const ABSENCE_TYPE_LABEL: Record<Enums<'tutor_absence_type'>, string> = {
  sick: 'Choroba',
  vacation: 'Urlop',
  other: 'Inne',
}
const ABSENCE_TYPE_COLOR: Record<Enums<'tutor_absence_type'>, string> = {
  sick: T.danger,
  vacation: T.primary,
  other: T.tertiary,
}
const ABSENCE_STATUS_LABEL: Record<'resolved' | 'active' | 'approved', string> = {
  resolved: 'Rozliczona',
  active: 'Trwa',
  approved: 'Zatwierdzona',
}
const ABSENCE_STATUS_COLOR: Record<'resolved' | 'active' | 'approved', string> = {
  resolved: T.textDim,
  active: T.danger,
  approved: T.success,
}

function AbsenceItem({
  absence,
}: {
  absence: {
    type: Enums<'tutor_absence_type'>
    dates: string
    days: number
    lessonsAffected: number
    status: 'resolved' | 'active' | 'approved'
  }
}) {
  const typeColor = ABSENCE_TYPE_COLOR[absence.type]
  return (
    <div
      className="rounded-[8px] px-2.5 py-2"
      style={{ background: T.bg, borderLeft: `3px solid ${typeColor}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold" style={{ color: typeColor }}>
          {ABSENCE_TYPE_LABEL[absence.type]}
        </span>
        <span
          className="rounded-full px-1.5 py-px text-[8px] font-bold"
          style={{
            color: ABSENCE_STATUS_COLOR[absence.status],
            background: `${ABSENCE_STATUS_COLOR[absence.status]}15`,
          }}
        >
          {ABSENCE_STATUS_LABEL[absence.status]}
        </span>
      </div>
      <div className="mt-[3px] text-[10px]" style={{ color: T.textMuted }}>
        {absence.dates} ({absence.days} dni, {absence.lessonsAffected} lekcji)
      </div>
    </div>
  )
}

function ActionButton({
  label,
  color,
  onClick,
}: {
  label: string
  color: string
  onClick: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="w-full rounded-[7px] py-[7px] text-[10px] font-bold transition-all"
      style={{
        background: hov ? color : `${color}12`,
        color: hov ? '#fff' : color,
      }}
    >
      {label}
    </button>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Modale (wizualnie zgodne z edu-luz-admin-detail-interactions.jsx)
// ════════════════════════════════════════════════════════════════════════════

function AbsenceModal({
  open,
  onClose,
  tutorId,
  adminId,
  tutorName,
}: {
  open: boolean
  onClose: () => void
  tutorId: string
  adminId: string
  tutorName: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState<Enums<'tutor_absence_type'>>('sick')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  function submit() {
    setError(null)
    if (!startDate) {
      setError('Podaj datę rozpoczęcia.')
      return
    }
    const effEnd = endDate || startDate
    if (effEnd < startDate) {
      setError('Data końcowa nie może być wcześniejsza.')
      return
    }
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: insErr } = await supabase.from('tutor_absences').insert({
        tutor_id: tutorId,
        absence_type: type,
        start_date: startDate,
        end_date: effEnd,
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
    <Modal open={open} onClose={onClose} title={`Zgłoś nieobecność — ${tutorName}`} icon="🤒">
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
        <FormField label="Od dnia" required>
          <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </FormField>
        <FormField label="Do dnia">
          <TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </FormField>
      </div>
      <FormField label="Komentarz">
        <TextareaInput rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Opcjonalny komentarz..." />
      </FormField>
      <div
        className="mb-3 rounded-[8px] px-3 py-2.5 text-[11px] font-semibold"
        style={{ background: `${T.danger}08`, border: `1px solid ${T.danger}15`, color: T.danger }}
      >
        ⚠ Dotknięte lekcje wymagają osobnego odwołania — na razie zapisujemy tylko nieobecność.
      </div>
      {error && (
        <p className="mb-2 text-[11px] font-bold" style={{ color: T.danger }}>
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 border-t border-subtle pt-4">
        <GhostBtn onClick={onClose}>Anuluj</GhostBtn>
        <PrimaryBtn color={T.danger} onClick={submit} disabled={isPending}>
          {isPending ? 'Zapisywanie…' : 'Zatwierdź i odwołaj lekcje'}
        </PrimaryBtn>
      </div>
    </Modal>
  )
}

function AvailabilityModal({
  open,
  onClose,
  tutorName,
}: {
  open: boolean
  onClose: () => void
  tutorName: string
}) {
  const days = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob']
  return (
    <Modal open={open} onClose={onClose} title={`Edytuj dostępność — ${tutorName}`} icon="📅">
      <FormField label="Dostępność tygodniowa">
        <div className="flex flex-col gap-1.5">
          {days.map((d) => (
            <div key={d} className="flex items-center gap-2">
              <span className="w-9 text-[12px] font-bold" style={{ color: T.textMuted }}>
                {d}
              </span>
              <TextInput type="time" className="!w-auto" />
              <span style={{ color: T.textDim }}>–</span>
              <TextInput type="time" className="!w-auto" />
            </div>
          ))}
        </div>
      </FormField>
      <div
        className="mb-3 rounded-[8px] px-3 py-2.5 text-[11px] font-semibold"
        style={{ background: `${T.primary}08`, border: `1px solid ${T.primary}15`, color: T.primary }}
      >
        ℹ Edycja dostępności nie jest jeszcze połączona z bazą — formularz poglądowy.
      </div>
      <div className="flex justify-end gap-2 border-t border-subtle pt-4">
        <GhostBtn onClick={onClose}>Anuluj</GhostBtn>
        <PrimaryBtn color={T.tertiary} onClick={onClose}>
          Zapisz dostępność
        </PrimaryBtn>
      </div>
    </Modal>
  )
}

function RatesModal({
  open,
  onClose,
  tutorId,
  adminId,
  tutorName,
  currentRate,
}: {
  open: boolean
  onClose: () => void
  tutorId: string
  adminId: string
  tutorName: string
  currentRate: AdminTutorEnriched['currentRate']
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
      return new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().slice(0, 10)
    }
    return specificDate
  }

  function submit() {
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
    <Modal open={open} onClose={onClose} title={`Zmień stawki — ${tutorName}`} icon="💰">
      {currentRate && (
        <div className="mb-3.5 rounded-[10px] bg-alt px-3.5 py-3">
          <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider" style={{ color: T.textDim }}>
            Obecne stawki
          </div>
          <div className="flex justify-between border-b border-subtle py-1 text-[12px]">
            <span style={{ color: T.textDim }}>Indywidualne</span>
            <span className="font-extrabold" style={{ color: T.text }}>
              {currentRate.individual} zł/h
            </span>
          </div>
          <div className="flex justify-between py-1 text-[12px]">
            <span style={{ color: T.textDim }}>Grupowe</span>
            <span className="font-extrabold" style={{ color: T.text }}>
              {currentRate.group} zł/h
            </span>
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
          <option value="immediately">Natychmiast</option>
          <option value="next_month">Od następnego miesiąca</option>
          <option value="specific_date">Od wybranej daty</option>
        </SelectInput>
      </FormField>
      {mode === 'specific_date' && (
        <FormField label="Data" required>
          <TextInput type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} />
        </FormField>
      )}
      <div
        className="mb-3 rounded-[8px] px-3 py-2.5 text-[11px] font-semibold"
        style={{ background: '#F59E0B08', border: '1px solid #F59E0B15', color: '#F59E0B' }}
      >
        ⚠ Zmiana stawek wpłynie na rozliczenia od wybranego momentu. Istniejące umowy uczniów nie
        zostaną zmienione automatycznie.
      </div>
      {error && (
        <p className="mb-2 text-[11px] font-bold" style={{ color: T.danger }}>
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 border-t border-subtle pt-4">
        <GhostBtn onClick={onClose}>Anuluj</GhostBtn>
        <PrimaryBtn color={T.tertiary} onClick={submit} disabled={isPending}>
          {isPending ? 'Zapisywanie…' : 'Zapisz nowe stawki'}
        </PrimaryBtn>
      </div>
    </Modal>
  )
}

function MessageModal({
  open,
  onClose,
  tutorId,
  adminId,
  tutorName,
}: {
  open: boolean
  onClose: () => void
  tutorId: string
  adminId: string
  tutorName: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [channel, setChannel] = useState<'email' | 'push' | 'both'>('both')

  function submit() {
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

  const channels: Array<{ id: 'email' | 'push' | 'both'; label: string }> = [
    { id: 'email', label: 'Email' },
    { id: 'push', label: 'Push' },
    { id: 'both', label: 'Oba' },
  ]

  return (
    <Modal open={open} onClose={onClose} title={`Wiadomość do ${tutorName}`} icon="💬">
      <FormField label="Kanał">
        <div className="flex gap-1.5">
          {channels.map((ch) => {
            const isActive = channel === ch.id
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => setChannel(ch.id)}
                className="rounded-[7px] px-3 py-1.5 text-[11px] font-bold transition-colors"
                style={{
                  background: isActive ? `${T.primary}18` : T.surface,
                  color: isActive ? T.primary : T.textMuted,
                  border: `1px solid ${isActive ? `${T.primary}30` : T.cardBorder}`,
                }}
              >
                {ch.label}
              </button>
            )
          })}
        </div>
      </FormField>
      <FormField label="Temat">
        <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="np. Przypomnienie o wpisach" />
      </FormField>
      <FormField label="Treść" required>
        <TextareaInput rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Treść wiadomości..." />
      </FormField>
      {error && (
        <p className="mb-2 text-[11px] font-bold" style={{ color: T.danger }}>
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 border-t border-subtle pt-4">
        <GhostBtn onClick={onClose}>Anuluj</GhostBtn>
        <PrimaryBtn onClick={submit} disabled={isPending}>
          {isPending ? 'Wysyłanie…' : '📤 Wyślij'}
        </PrimaryBtn>
      </div>
    </Modal>
  )
}
