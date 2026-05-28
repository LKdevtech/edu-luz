'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { LevelBadge, SubjectDot } from '@/lib/components/panel/Badges'
import { FormField, GhostBtn, PrimaryBtn, TextInput, TextareaInput } from './Modal'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { AdminGroupRow } from '@/lib/queries/admin'

type Action = null | 'edit' | 'add_member' | 'dissolve'

type GroupCardProps = {
  group: AdminGroupRow
  adminId: string
  availableStudents: Array<{ id: string; fullName: string; schoolClass: string; level: string }>
}

export function GroupCard({ group, adminId, availableStudents }: GroupCardProps) {
  const router = useRouter()
  const [active, setActive] = useState<Action>(null)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function removeMember(studentId: string) {
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
    <article
      className="rounded-card bg-surface"
      style={{ border: '1px solid rgba(59,143,240,0.10)' }}
    >
      {/* Header */}
      <div className="border-b border-subtle p-4">
        <div className="flex flex-wrap items-center gap-2">
          <SubjectDot color={group.subjectColor} />
          <span className="text-[15px] font-extrabold text-primary">{group.name}</span>
          <LevelBadge level={group.level} label={group.levelLabel} />
          <span className="text-[11px] text-dim">
            {group.subjectName} · {group.tutorName}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-secondary">
          {group.weeklySlots.map((s, i) => (
            <span key={i}>
              📅 {s.dayShort} {s.startTime}–{s.endTime}
              {s.roomName && ` · ${s.roomName}`}
            </span>
          ))}
          <span>
            👥 {group.members.length}/{group.maxSize} os.
          </span>
          <span>💰 {group.monthlyFeePerStudent} zł/os./msc</span>
        </div>
      </div>

      {/* Members list */}
      <div className="border-b border-subtle p-3">
        <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-dim">
          Członkowie ({group.members.length})
        </div>
        {group.members.length === 0 ? (
          <p className="text-[12px] italic text-dim">Grupa nie ma jeszcze członków.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {group.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-[8px] bg-alt px-3 py-2"
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-[7px] text-[10px] font-extrabold"
                  style={{ backgroundColor: '#06B6D418', color: '#06B6D4' }}
                >
                  {m.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[12px] font-bold text-primary">{m.fullName}</span>
                  <span className="ml-2 text-[11px] text-dim">{m.schoolClass}</span>
                </div>
                {m.parentName && (
                  <span className="text-[11px] text-dim">Rodzic: {m.parentName}</span>
                )}
                {confirmRemove === m.id ? (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => removeMember(m.id)}
                      disabled={isPending}
                      className="rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white hover:brightness-110 disabled:opacity-50"
                      style={{ backgroundColor: '#EF4444' }}
                    >
                      Usuń
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(null)}
                      className="rounded-md border border-subtle px-2 py-0.5 text-[10px] font-bold text-secondary hover:bg-surface-hover"
                    >
                      Nie
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(m.id)}
                    aria-label="Usuń członka"
                    className="flex h-6 w-6 items-center justify-center rounded-[6px] text-[11px] font-extrabold hover:brightness-110"
                    style={{ backgroundColor: '#EF444410', color: '#EF4444' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {error && (
          <p className="mt-2 text-[11px] font-bold" style={{ color: '#EF4444' }}>
            {error}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 p-3">
        <ActionButton
          id="edit"
          label="Edytuj grupę"
          icon="✏️"
          color="#3B8FF0"
          active={active}
          onClick={setActive}
        />
        <ActionButton
          id="add_member"
          label="Dodaj członka"
          icon="➕"
          color="#22C55E"
          active={active}
          onClick={setActive}
        />
        <ActionButton
          id="dissolve"
          label="Rozwiąż grupę"
          icon="🗑"
          color="#EF4444"
          active={active}
          onClick={setActive}
        />
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
        <DissolveExpansion
          group={group}
          adminId={adminId}
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
  id: Action
  label: string
  icon: string
  color: string
  active: Action
  onClick: (id: Action) => void
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
// Edit Group
// ════════════════════════════════════════════════════════════════════════════

function EditGroupExpansion({ group, onClose }: { group: AdminGroupRow; onClose: () => void }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(group.name)
  const [maxSize, setMaxSize] = useState(String(group.maxSize))
  const [monthlyFee, setMonthlyFee] = useState(String(group.monthlyFeePerStudent))

  async function submit() {
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
    <div className="border-t border-subtle p-4">
      <div className="mb-3 text-[13px] font-extrabold text-link">
        ✏️ Edytuj grupę — {group.name}
      </div>
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
        ⚠ Zmiana stawki wpłynie na NOWE rachunki — istniejące rozliczenia pozostają.
        Zmiana harmonogramu / przedmiotu / korepetytora wymaga osobnej procedury.
      </p>
      {error && (
        <p className="mb-2 text-[11px] font-bold" style={{ color: '#EF4444' }}>{error}</p>
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

  async function addMember(studentId: string) {
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

  return (
    <div className="border-t border-subtle p-4">
      <div className="mb-3 text-[13px] font-extrabold text-success">
        ➕ Dodaj członka do {group.name}
      </div>
      <div className="relative mb-3">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Wyszukaj ucznia..."
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
                  <div className="text-[11px] text-dim">{s.schoolClass} · {s.level}</div>
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
          {group.weeklySlots[0]
            ? `${group.weeklySlots[0].dayShort} ${group.weeklySlots[0].startTime}–${group.weeklySlots[0].endTime}`
            : '—'}
          ) oraz opłatę {group.monthlyFeePerStudent} zł/msc do miesięcznego rachunku rodzica
          (w nowych fakturach).
        </p>
      </div>
      {error && (
        <p className="mt-2 text-[11px] font-bold" style={{ color: '#EF4444' }}>{error}</p>
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

  async function submit() {
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
      // Mark all members as left
      await supabase
        .from('group_members')
        .update({ left_at: new Date().toISOString() })
        .eq('group_id', group.id)
        .is('left_at', null)
      // Mark related classes as ended
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
    <div className="border-t border-subtle p-4">
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
          <li>• Usunięcie zajęć grupowych z harmonogramu wszystkich {group.members.length} członków</li>
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
                style={{ backgroundColor: '#1C2035', color: '#F0EDE6', border: '1px solid rgba(59,143,240,0.10)' }}
              >
                {m.fullName}
              </span>
            ))}
          </div>
        </div>
      )}

      <FormField label="Powód rozwiązania">
        <TextareaInput rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Opcjonalny powód..." />
      </FormField>

      {error && (
        <p className="mb-2 text-[11px] font-bold" style={{ color: '#EF4444' }}>{error}</p>
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
