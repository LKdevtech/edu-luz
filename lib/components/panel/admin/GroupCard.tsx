'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { LevelBadge } from '@/lib/components/panel/Badges'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { AdminGroupRow } from '@/lib/queries/admin'

import { FormField, GhostBtn, PrimaryBtn, TextInput, TextareaInput } from './Modal'

type Action = null | 'edit' | 'add_member' | 'dissolve'

const SUBJECT_COLOR: Record<string, string> = {
  Matematyka: '#3B8FF0',
  Angielski: '#06B6D4',
  Fizyka: '#F59E0B',
  Chemia: '#22C55E',
  Polski: '#E84393',
  Elektrotechnika: '#FF6F4A',
}

const TEXT = '#F0EDE6'
const TEXT_DIM = '#8B879D'
const TERTIARY = '#FFCA28'

type GroupCardProps = {
  group: AdminGroupRow
  adminId: string
  availableStudents: Array<{ id: string; fullName: string; schoolClass: string; level: string }>
}

export function GroupCard({ group, adminId, availableStudents }: GroupCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [hov, setHov] = useState(false)
  const [active, setActive] = useState<Action>(null)

  const color = group.subjectColor || SUBJECT_COLOR[group.subjectName] || '#8B879D'
  const slot = group.weeklySlots[0]

  return (
    <div
      className="overflow-hidden rounded-[14px] transition-all"
      style={{
        background: hov && !expanded ? '#2A3050' : '#232840',
        border: '1px solid rgba(59,143,240,0.10)',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* ── Wiersz zwinięty ── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-[11px] font-extrabold"
          style={{ backgroundColor: `${color}20`, color }}
        >
          👥
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-extrabold" style={{ color: TEXT }}>
              {group.name}
            </span>
            <span
              className="rounded-full px-1.5 py-px text-[9px] font-bold"
              style={{ color, backgroundColor: `${color}15` }}
            >
              {group.subjectName}
            </span>
            <LevelBadge level={group.level} label={group.levelLabel} />
          </div>
          <div className="mt-1 text-[10px]" style={{ color: TEXT_DIM }}>
            {group.tutorName}
            {slot ? ` · ${slot.dayShort} ${slot.startTime}–${slot.endTime}` : ''}
            {slot?.roomName ? ` · ${slot.roomName}` : ''}
          </div>
        </div>
        <div className="flex shrink-0 gap-3">
          <div className="text-center">
            <div className="text-[15px] font-black" style={{ color: TEXT }}>
              {group.members.length}
            </div>
            <div className="text-[7px]" style={{ color: TEXT_DIM }}>
              osób
            </div>
          </div>
          <div className="text-center">
            <div className="text-[15px] font-black" style={{ color: TERTIARY }}>
              {group.monthlyFeePerStudent} zł
            </div>
            <div className="text-[7px]" style={{ color: TEXT_DIM }}>
              os/msc
            </div>
          </div>
        </div>
        <span
          aria-hidden
          className="inline-block shrink-0 text-[11px] transition-transform"
          style={{ color: TEXT_DIM, transform: expanded ? 'rotate(180deg)' : 'none' }}
        >
          ▼
        </span>
      </button>

      {/* ── Rozwinięcie (3 kolumny: członkowie / szczegóły / akcje) ── */}
      {expanded && (
        <div className="border-t border-subtle p-4">
          <div className="flex flex-col gap-5 md:flex-row md:gap-5">
            {/* Członkowie */}
            <MembersColumn group={group} />

            {/* Szczegóły */}
            <div>
              <div className="mb-1.5 text-[10px] font-extrabold" style={{ color: TEXT }}>
                Szczegóły
              </div>
              {[
                { l: 'Korepetytor', v: group.tutorName },
                {
                  l: 'Termin',
                  v: slot ? `${slot.dayShort} ${slot.startTime}–${slot.endTime}` : '—',
                },
                { l: 'Sala', v: slot?.roomName ?? '—' },
                { l: 'Max. osób', v: String(group.maxSize) },
                { l: 'Opłata msc/os.', v: `${group.monthlyFeePerStudent} zł` },
              ].map((d) => (
                <div key={d.l} className="mb-1">
                  <div className="text-[7px] font-semibold uppercase" style={{ color: TEXT_DIM }}>
                    {d.l}
                  </div>
                  <div className="text-[11px] font-semibold" style={{ color: TEXT }}>
                    {d.v}
                  </div>
                </div>
              ))}
            </div>

            {/* Akcje */}
            <div className="flex flex-col gap-1.5 md:ml-auto">
              {[
                { id: 'edit' as const, label: 'Edytuj grupę', color: '#3B8FF0' },
                { id: 'add_member' as const, label: 'Dodaj członka', color: '#22C55E' },
                { id: 'dissolve' as const, label: 'Rozwiąż grupę', color: '#EF4444' },
              ].map((a) => {
                const isActive = active === a.id
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setActive(isActive ? null : a.id)}
                    className="rounded-[7px] px-3.5 py-1.5 text-[10px] font-bold transition-all hover:brightness-110"
                    style={
                      isActive
                        ? { background: a.color, color: '#fff' }
                        : { background: `${a.color}12`, color: a.color }
                    }
                  >
                    {a.label}
                  </button>
                )
              })}
            </div>
          </div>

          {active === 'edit' && (
            <EditGroupExpansion group={group} onClose={() => setActive(null)} />
          )}
          {active === 'add_member' && (
            <AddMemberExpansion
              group={group}
              adminId={adminId}
              availableStudents={availableStudents.filter(
                (s) => !group.members.find((m) => m.id === s.id),
              )}
              onClose={() => setActive(null)}
            />
          )}
          {active === 'dissolve' && (
            <DissolveExpansion group={group} adminId={adminId} onClose={() => setActive(null)} />
          )}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Members column (z inline usuwaniem członka)
// ════════════════════════════════════════════════════════════════════════════

function MembersColumn({ group }: { group: AdminGroupRow }) {
  const router = useRouter()
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function removeMember(studentId: string) {
    setError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: updErr } = await supabase
        .from('group_members')
        .update({ left_at: new Date().toISOString() })
        .eq('group_id', group.id)
        .eq('student_id', studentId)
        .is('left_at', null)
      if (updErr) {
        setError(updErr.message)
        return
      }
      setConfirmRemove(null)
      router.refresh()
    })
  }

  return (
    <div className="min-w-[200px]">
      <div className="mb-1.5 text-[10px] font-extrabold" style={{ color: TEXT }}>
        Członkowie ({group.members.length})
      </div>
      {group.members.length === 0 ? (
        <p className="text-[11px] italic" style={{ color: TEXT_DIM }}>
          Grupa nie ma jeszcze członków.
        </p>
      ) : (
        group.members.map((m, i) => (
          <div key={m.id} className="flex items-center gap-1.5 py-0.5 text-[11px]" style={{ color: TEXT }}>
            <span style={{ color: TEXT_DIM }}>{i + 1}.</span>
            <span className="font-semibold">{m.fullName}</span>
            {confirmRemove === m.id ? (
              <span className="ml-auto flex gap-1">
                <button
                  type="button"
                  onClick={() => removeMember(m.id)}
                  disabled={isPending}
                  className="rounded-md px-2 py-0.5 text-[9px] font-extrabold text-white hover:brightness-110 disabled:opacity-50"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  Usuń
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRemove(null)}
                  className="rounded-md border border-subtle px-2 py-0.5 text-[9px] font-bold text-secondary hover:bg-surface-hover"
                >
                  Nie
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmRemove(m.id)}
                aria-label="Usuń członka"
                className="ml-auto flex h-5 w-5 items-center justify-center rounded-[6px] text-[10px] font-extrabold hover:brightness-110"
                style={{ backgroundColor: '#EF444410', color: '#EF4444' }}
              >
                ✕
              </button>
            )}
          </div>
        ))
      )}
      {error && (
        <p className="mt-1 text-[10px] font-bold" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Edit Group
// ════════════════════════════════════════════════════════════════════════════

function EditGroupExpansion({ group, onClose }: { group: AdminGroupRow; onClose: () => void }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(group.name)
  const [maxSize, setMaxSize] = useState(String(group.maxSize))
  const [monthlyFee, setMonthlyFee] = useState(String(group.monthlyFeePerStudent))

  function submit() {
    setError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: updErr } = await supabase
        .from('groups')
        .update({
          name: name.trim(),
          max_size: Number(maxSize),
          monthly_fee_per_student: Number(monthlyFee),
        })
        .eq('id', group.id)
      if (updErr) {
        setError(updErr.message)
        return
      }
      onClose()
      router.refresh()
    })
  }

  return (
    <div className="mt-3 border-t border-subtle pt-3">
      <div className="mb-3 text-[13px] font-extrabold text-link">✏️ Edytuj grupę — {group.name}</div>
      <div className="grid grid-cols-[2fr_1fr] gap-3">
        <FormField label="Nazwa grupy" required>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="Max. osób">
          <TextInput type="number" value={maxSize} onChange={(e) => setMaxSize(e.target.value)} />
        </FormField>
      </div>
      <FormField label="Opłata/os./msc (zł)" required>
        <TextInput type="number" value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} />
      </FormField>
      <p className="mb-3 text-[11px]" style={{ color: '#F59E0B' }}>
        ⚠ Zmiana harmonogramu lub korepetytora wpłynie na plan zajęć wszystkich {group.members.length}{' '}
        członków grupy i wymaga osobnej procedury.
      </p>
      {error && (
        <p className="mb-2 text-[11px] font-bold" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <PrimaryBtn onClick={submit} disabled={isPending}>
          {isPending ? 'Zapisywanie…' : 'Zapisz zmiany'}
        </PrimaryBtn>
        <GhostBtn onClick={onClose}>Anuluj</GhostBtn>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Add Member
// ════════════════════════════════════════════════════════════════════════════

function AddMemberExpansion({
  group,
  availableStudents,
  onClose,
}: {
  group: AdminGroupRow
  adminId: string
  availableStudents: Array<{ id: string; fullName: string; schoolClass: string; level: string }>
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const results =
    search.length >= 2
      ? availableStudents
          .filter((s) => s.fullName.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 5)
      : []

  function addMember(studentId: string) {
    setError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: insErr } = await supabase.from('group_members').insert({
        group_id: group.id,
        student_id: studentId,
      })
      if (insErr) {
        setError(insErr.message)
        return
      }
      router.refresh()
    })
  }

  const slot = group.weeklySlots[0]

  return (
    <div className="mt-3 border-t border-subtle pt-3">
      <div className="mb-3 text-[13px] font-extrabold text-success">
        ➕ Dodaj członka do {group.name}
      </div>
      <div className="relative mb-3">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Wyszukaj ucznia po imieniu lub nazwisku..."
        />
        {results.length > 0 && (
          <div
            className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-[10px] bg-surface"
            style={{ border: '1px solid #22C55E33', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
          >
            {results.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => addMember(s.id)}
                disabled={isPending}
                className="flex w-full items-center justify-between border-b border-subtle px-3 py-2 text-left hover:bg-surface-hover disabled:opacity-50"
              >
                <div>
                  <div className="text-[13px] font-bold text-primary">{s.fullName}</div>
                  <div className="text-[11px] text-dim">
                    {s.schoolClass} · {s.level}
                  </div>
                </div>
                <span className="text-[11px] font-extrabold text-success">+ Dodaj</span>
              </button>
            ))}
          </div>
        )}
        {search.length >= 2 && results.length === 0 && (
          <div
            className="absolute left-0 right-0 top-full z-10 mt-1 rounded-[10px] bg-surface px-3 py-2"
            style={{ border: '1px solid rgba(59,143,240,0.10)' }}
          >
            <span className="text-[12px] text-dim">{`Brak wyników dla „${search}"`}</span>
          </div>
        )}
      </div>
      <div
        className="rounded-[10px] p-3"
        style={{ backgroundColor: '#22C55E08', border: '1px solid #22C55E22' }}
      >
        <div className="text-[11px] font-extrabold text-success">ℹ Automatyczne przypisanie</div>
        <p className="mt-1 text-[11px] text-secondary">
          Dodanie ucznia automatycznie doda mu zajęcia grupowe (
          {slot ? `${slot.dayShort} ${slot.startTime}–${slot.endTime}` : '—'}) oraz opłatę{' '}
          {group.monthlyFeePerStudent} zł/msc do miesięcznego rachunku rodzica (w nowych fakturach).
        </p>
      </div>
      {error && (
        <p className="mt-2 text-[11px] font-bold" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <GhostBtn onClick={onClose}>Zamknij</GhostBtn>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Dissolve Group
// ════════════════════════════════════════════════════════════════════════════

function DissolveExpansion({
  group,
  onClose,
}: {
  group: AdminGroupRow
  adminId: string
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  function submit() {
    setError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: updErr } = await supabase
        .from('groups')
        .update({
          status: 'dissolved',
          dissolved_at: new Date().toISOString(),
          dissolved_reason: reason.trim() || null,
        })
        .eq('id', group.id)
      if (updErr) {
        setError(updErr.message)
        return
      }
      await supabase
        .from('group_members')
        .update({ left_at: new Date().toISOString() })
        .eq('group_id', group.id)
        .is('left_at', null)
      if (group.classId) {
        await supabase
          .from('classes')
          .update({ status: 'ended', end_date: new Date().toISOString().slice(0, 10) })
          .eq('id', group.classId)
      }
      onClose()
      router.refresh()
    })
  }

  return (
    <div className="mt-3 border-t border-subtle pt-3">
      <div className="mb-3 text-[13px] font-extrabold" style={{ color: '#EF4444' }}>
        🗑 Rozwiąż grupę — {group.name}
      </div>
      <div
        className="mb-3 rounded-[10px] p-3"
        style={{ backgroundColor: '#EF444408', border: '1px solid #EF444422' }}
      >
        <div className="mb-2 text-[12px] font-extrabold" style={{ color: '#EF4444' }}>
          ⚠ Ta operacja jest nieodwracalna
        </div>
        <ul className="flex list-none flex-col gap-1 text-[11px] text-secondary">
          <li>
            • Usunięcie zajęć grupowych z harmonogramu wszystkich {group.members.length} członków
          </li>
          <li>• Usunięcie opłaty za grupę z rachunków rodziców (w nowych fakturach)</li>
          <li>• Odwołanie wszystkich zaplanowanych lekcji grupowych (manualnie)</li>
        </ul>
      </div>

      {group.members.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-dim">
            Dotknięci uczniowie:
          </div>
          <div className="flex flex-wrap gap-1">
            {group.members.map((m) => (
              <span
                key={m.id}
                className="rounded-md px-2 py-0.5 text-[11px] font-bold"
                style={{
                  backgroundColor: '#1C2035',
                  color: '#F0EDE6',
                  border: '1px solid rgba(59,143,240,0.10)',
                }}
              >
                {m.fullName}
              </span>
            ))}
          </div>
        </div>
      )}

      <FormField label="Powód rozwiązania">
        <TextareaInput
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Opcjonalny powód..."
        />
      </FormField>

      {error && (
        <p className="mb-2 text-[11px] font-bold" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <PrimaryBtn color="#EF4444" onClick={submit} disabled={isPending}>
          {isPending ? 'Rozwiązywanie…' : '🗑 Rozwiąż grupę'}
        </PrimaryBtn>
        <GhostBtn onClick={onClose}>Anuluj</GhostBtn>
      </div>
    </div>
  )
}
