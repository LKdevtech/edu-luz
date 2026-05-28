'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { AdminStudentRow } from '@/lib/queries/admin'

import { FormField, GhostBtn, PrimaryBtn, TextInput, TextareaInput } from './Modal'

type Action = null | 'edit' | 'classes' | 'end' | 'message'

const ACTIONS: Array<{ id: Exclude<Action, null>; label: string; color: string }> = [
  { id: 'edit', label: 'Edytuj dane', color: '#3B8FF0' },
  { id: 'classes', label: 'Dodaj zajęcia', color: '#22C55E' },
  { id: 'end', label: 'Zakończ umowę', color: '#EF4444' },
  { id: 'message', label: 'Wyślij wiadomość do rodzica', color: '#06B6D4' },
]

export function StudentDetailActions({
  student,
  adminId,
}: {
  student: AdminStudentRow
  adminId: string
}) {
  const [active, setActive] = useState<Action>(null)

  return (
    <div className="flex flex-col gap-1.5">
      {ACTIONS.map((a) => {
        const isActive = active === a.id
        return (
          <div key={a.id}>
            <button
              type="button"
              onClick={() => setActive(isActive ? null : a.id)}
              className="w-full rounded-[7px] px-2 py-1.5 text-[10px] font-bold transition-all hover:brightness-110"
              style={
                isActive
                  ? { background: a.color, color: '#fff' }
                  : { background: `${a.color}12`, color: a.color }
              }
            >
              {a.label}
            </button>
            {isActive && a.id === 'edit' && (
              <EditStudentForm student={student} onClose={() => setActive(null)} />
            )}
            {isActive && a.id === 'classes' && (
              <AddClassesNote onClose={() => setActive(null)} />
            )}
            {isActive && a.id === 'end' && (
              <EndContractConfirm student={student} onClose={() => setActive(null)} />
            )}
            {isActive && a.id === 'message' && (
              <MessageParentForm student={student} adminId={adminId} onClose={() => setActive(null)} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Edytuj dane (visual; brak service_role do edycji profilu konta) ──
function EditStudentForm({
  student,
  onClose,
}: {
  student: AdminStudentRow
  onClose: () => void
}) {
  const [schoolClass, setSchoolClass] = useState(student.schoolClass)

  return (
    <div className="mt-2 rounded-[8px] p-3" style={{ background: '#151827' }}>
      <div className="mb-2 text-[11px] font-extrabold text-link">✏️ Edytuj dane — {student.fullName}</div>
      <FormField label="Klasa / rocznik">
        <TextInput value={schoolClass} onChange={(e) => setSchoolClass(e.target.value)} />
      </FormField>
      <p className="mb-2 text-[10px]" style={{ color: '#F59E0B' }}>
        ⚠ Edycja danych ucznia i konta wymaga uprawnień service_role — wpięcie po stronie serwera w
        kolejnej fazie.
      </p>
      <div className="flex gap-2">
        <PrimaryBtn onClick={onClose}>Zamknij</PrimaryBtn>
      </div>
    </div>
  )
}

// ── Dodaj zajęcia (kieruje do „Dodaj zajęcia" z dashboardu) ──
function AddClassesNote({ onClose }: { onClose: () => void }) {
  return (
    <div className="mt-2 rounded-[8px] p-3" style={{ background: '#151827' }}>
      <div className="mb-2 text-[11px] font-extrabold text-success">📚 Dodaj zajęcia</div>
      <p className="mb-2 text-[11px] text-secondary">
        {'Nowe zajęcia indywidualne dodasz przez „Dodaj zajęcia" w panelu szybkich akcji ' +
          '(dashboard) — z wyborem ucznia, przedmiotu, korepetytora i opłaty.'}
      </p>
      <div className="flex gap-2">
        <GhostBtn onClick={onClose}>Zamknij</GhostBtn>
      </div>
    </div>
  )
}

// ── Zakończ umowę (confirm UI only — bez realnego usuwania) ──
function EndContractConfirm({
  student,
  onClose,
}: {
  student: AdminStudentRow
  onClose: () => void
}) {
  const [reason, setReason] = useState('')

  return (
    <div
      className="mt-2 rounded-[8px] p-3"
      style={{ background: '#EF444408', border: '1px solid #EF444422' }}
    >
      <div className="mb-2 text-[11px] font-extrabold" style={{ color: '#EF4444' }}>
        🗑 Zakończ umowę — {student.fullName}
      </div>
      <p className="mb-2 text-[10px] text-secondary">
        Zakończenie umowy zamknie wszystkie aktywne zajęcia ucznia ({student.classes.length}) oraz
        wstrzyma naliczanie opłat. Operacja wymaga potwierdzenia przez serwer.
      </p>
      <FormField label="Powód zakończenia">
        <TextareaInput
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Opcjonalny powód..."
        />
      </FormField>
      <div className="flex gap-2">
        <PrimaryBtn color="#EF4444" disabled>
          🗑 Zakończ umowę
        </PrimaryBtn>
        <GhostBtn onClick={onClose}>Anuluj</GhostBtn>
      </div>
    </div>
  )
}

// ── Wyślij wiadomość do rodzica (realny insert do direct_messages) ──
function MessageParentForm({
  student,
  adminId,
  onClose,
}: {
  student: AdminStudentRow
  adminId: string
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

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
        recipient_id: student.parentId,
        subject: subject.trim() || null,
        body: body.trim(),
      })
      if (insErr) {
        setError(insErr.message)
        return
      }
      setDone(true)
      router.refresh()
    })
  }

  return (
    <div className="mt-2 rounded-[8px] p-3" style={{ background: '#151827' }}>
      <div className="mb-2 text-[11px] font-extrabold text-link">
        💬 Wiadomość do {student.parentName}
      </div>
      {done ? (
        <>
          <p className="mb-2 text-[11px] font-bold text-success">✓ Wiadomość wysłana.</p>
          <GhostBtn onClick={onClose}>Zamknij</GhostBtn>
        </>
      ) : (
        <>
          <FormField label="Temat">
            <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="np. Informacja o zajęciach" />
          </FormField>
          <FormField label="Treść" required>
            <TextareaInput rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Treść wiadomości..." />
          </FormField>
          {error && (
            <p className="mb-2 text-[11px] font-bold" style={{ color: '#EF4444' }}>
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <PrimaryBtn onClick={submit} disabled={isPending}>
              {isPending ? 'Wysyłanie…' : '📤 Wyślij'}
            </PrimaryBtn>
            <GhostBtn onClick={onClose}>Anuluj</GhostBtn>
          </div>
        </>
      )}
    </div>
  )
}
