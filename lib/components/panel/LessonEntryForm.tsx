'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type StudentInForm = {
  id: string
  fullName: string
  firstName: string
}

type LessonEntryFormProps = {
  lessonId: string
  tutorId: string
  isGroup: boolean
  students: StudentInForm[]
  initial?: {
    topic: string | null
    noteForStudent: string | null
    internalNote: string | null
    homeworkContent: string | null
    homeworkDueDate: string | null
    /** Per-uczeń uwagi dla rodzica (entry_parent_notes). */
    parentNotes: Record<string, string>
    /** Per-uczeń obecność. */
    attendance: Record<string, 'present' | 'absent'>
    status: 'missing' | 'draft' | 'published' | 'locked' | 'blocked'
  }
  onClose?: () => void
}

/**
 * Formularz wpisu po lekcji. Sekcje:
 * - Obecność (solo: 1 toggle / grupa: lista per-uczeń z toggle + opcjonalna uwaga dla rodzica)
 * - Temat lekcji (required)
 * - Notatka dla ucznia (required, wspólna dla grupy)
 * - Notatka dla rodzica (solo: 1 textarea; grupa: per-uczeń, dodawana inline przy uczniu)
 * - Praca domowa (treść + termin)
 * - Notatka wewnętrzna (tylko admin + tutor)
 *
 * Buttony: Anuluj, Zapisz szkic, Opublikuj wpis.
 * Reguła: opublikowanie wymaga temat + notatka dla ucznia.
 *
 * Mutacje (browser client):
 *   1. upsert entries (lesson_id)
 *   2. upsert homework (entry_id) jeśli content
 *   3. upsert attendance per uczeń
 *   4. upsert entry_parent_notes per uczeń (tylko te z niepustą notatką)
 */
export function LessonEntryForm({
  lessonId,
  tutorId,
  isGroup,
  students,
  initial,
  onClose,
}: LessonEntryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'published' | 'draft' | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const [topic, setTopic] = useState(initial?.topic ?? '')
  const [noteForStudent, setNoteForStudent] = useState(initial?.noteForStudent ?? '')
  const [noteForParentSolo, setNoteForParentSolo] = useState(
    !isGroup ? initial?.parentNotes[students[0]?.id ?? ''] ?? '' : '',
  )
  const [homeworkContent, setHomeworkContent] = useState(initial?.homeworkContent ?? '')
  const [homeworkDueDate, setHomeworkDueDate] = useState(initial?.homeworkDueDate ?? '')
  const [internalNote, setInternalNote] = useState(initial?.internalNote ?? '')

  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>(
    () => {
      if (initial?.attendance) return { ...initial.attendance }
      const init: Record<string, 'present' | 'absent'> = {}
      for (const s of students) init[s.id] = 'present'
      return init
    },
  )
  const [parentNotes, setParentNotes] = useState<Record<string, string>>(
    () => ({ ...(initial?.parentNotes ?? {}) }),
  )
  const [parentNoteOpen, setParentNoteOpen] = useState<Record<string, boolean>>({})

  const canPublish = topic.trim().length > 0 && noteForStudent.trim().length > 0

  async function save(status: 'draft' | 'published') {
    setError(null)
    if (status === 'published' && !canPublish) {
      setError('Temat i notatka dla ucznia są wymagane do opublikowania.')
      return
    }

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()

      // 1. Upsert entry
      const { data: entryRow, error: entryErr } = await supabase
        .from('entries')
        .upsert(
          {
            lesson_id: lessonId,
            status,
            topic: topic.trim() || null,
            note_for_student: noteForStudent.trim() || null,
            internal_note: internalNote.trim() || null,
            published_at: status === 'published' ? new Date().toISOString() : null,
            created_by: tutorId,
          },
          { onConflict: 'lesson_id' },
        )
        .select('id')
        .single()
      if (entryErr) {
        setError(entryErr.message)
        return
      }
      const entryId = entryRow.id

      // 2. Homework
      if (homeworkContent.trim()) {
        const { error: hwErr } = await supabase.from('homework').upsert(
          {
            entry_id: entryId,
            content: homeworkContent.trim(),
            due_date: homeworkDueDate || null,
          },
          { onConflict: 'entry_id' },
        )
        if (hwErr) {
          setError(hwErr.message)
          return
        }
      }

      // 3. Attendance per uczeń
      for (const s of students) {
        const att = attendance[s.id] ?? 'present'
        const { error: attErr } = await supabase.from('attendance').upsert(
          {
            lesson_id: lessonId,
            student_id: s.id,
            status: att,
            noted_at: new Date().toISOString(),
            noted_by: tutorId,
          },
          { onConflict: 'lesson_id,student_id' },
        )
        if (attErr) {
          setError(attErr.message)
          return
        }
      }

      // 4. Parent notes
      if (isGroup) {
        for (const s of students) {
          const note = (parentNotes[s.id] ?? '').trim()
          if (note) {
            const { error: pnErr } = await supabase
              .from('entry_parent_notes')
              .upsert(
                { entry_id: entryId, student_id: s.id, note },
                { onConflict: 'entry_id,student_id' },
              )
            if (pnErr) {
              setError(pnErr.message)
              return
            }
          } else {
            // Usuń jeśli była a teraz pusta
            await supabase
              .from('entry_parent_notes')
              .delete()
              .eq('entry_id', entryId)
              .eq('student_id', s.id)
          }
        }
      } else if (students.length > 0) {
        const studentId = students[0]!.id
        const note = noteForParentSolo.trim()
        if (note) {
          const { error: pnErr } = await supabase
            .from('entry_parent_notes')
            .upsert(
              { entry_id: entryId, student_id: studentId, note },
              { onConflict: 'entry_id,student_id' },
            )
          if (pnErr) {
            setError(pnErr.message)
            return
          }
        } else {
          await supabase
            .from('entry_parent_notes')
            .delete()
            .eq('entry_id', entryId)
            .eq('student_id', studentId)
        }
      }

      // 5. Po opublikowaniu wpisu lekcja „bez wpisu" staje się „z wpisem"
      //    (completed_no_entry → completed) — harmonogram zmieni kolor żółty→zielony.
      if (status === 'published') {
        const { error: stErr } = await supabase
          .from('lessons')
          .update({ status: 'completed' })
          .eq('id', lessonId)
          .in('status', ['completed_no_entry', 'in_progress'])
        if (stErr) {
          setError(stErr.message)
          return
        }
      }

      // Feedback + odświeżenie danych server-side (harmonogram, dziennik).
      setToast(status)
      router.refresh()
      if (onClose) onClose()
    })
  }

  return (
    <div className="rounded-card bg-surface p-5" style={{ border: '1px solid rgba(59,143,240,0.2)' }}>
      {/* Obecność */}
      <div className="mb-5 rounded-[14px] bg-alt p-4">
        <div className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-dim">
          {isGroup ? 'Obecność i uwagi indywidualne' : 'Obecność'}
        </div>
        <div className="flex flex-col gap-2">
          {students.map((s) => {
            const isOpen = parentNoteOpen[s.id] ?? false
            const att = attendance[s.id] ?? 'present'
            return (
              <div key={s.id} className="rounded-[10px] bg-main p-3" style={{ border: '1px solid rgba(59,143,240,0.10)' }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-bold text-primary">{s.fullName}</span>
                  <div className="flex items-center gap-2">
                    <AttendanceButton
                      active={att === 'present'}
                      label="Obecny/a"
                      color="#22C55E"
                      onClick={() => setAttendance((p) => ({ ...p, [s.id]: 'present' }))}
                    />
                    <AttendanceButton
                      active={att === 'absent'}
                      label="Nieobecny/a"
                      color="#EF4444"
                      onClick={() => setAttendance((p) => ({ ...p, [s.id]: 'absent' }))}
                    />
                    {isGroup && (
                      <button
                        type="button"
                        onClick={() => setParentNoteOpen((p) => ({ ...p, [s.id]: !isOpen }))}
                        className="ml-2 rounded-[8px] border border-subtle px-2.5 py-1 text-[10px] font-bold transition-colors hover:bg-surface-hover"
                        style={{
                          color: parentNotes[s.id]?.trim() ? '#3B8FF0' : '#8B879D',
                        }}
                      >
                        {parentNotes[s.id]?.trim() ? '✏️ Uwaga' : '+ Uwaga'}
                      </button>
                    )}
                  </div>
                </div>
                {isGroup && isOpen && (
                  <div className="mt-3">
                    <textarea
                      value={parentNotes[s.id] ?? ''}
                      onChange={(e) =>
                        setParentNotes((p) => ({ ...p, [s.id]: e.target.value }))
                      }
                      placeholder={`Uwaga dla rodzica ${s.firstName} — widoczna tylko dla tego rodzica`}
                      rows={2}
                      className="w-full resize-none rounded-[10px] border border-subtle bg-alt p-2 text-[12px] text-primary placeholder:text-dim focus:border-link focus:outline-none"
                    />
                    <p className="mt-1 text-[10px] italic text-dim">
                      Widoczna tylko dla rodzica tego ucznia.
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-[10px] italic text-dim">
          {isGroup
            ? 'Oznacz obecność i dodaj indywidualne uwagi dla rodziców.'
            : 'System sam zweryfikuje czy nieobecność była zgłoszona z wyprzedzeniem.'}
        </p>
      </div>

      {/* Temat */}
      <Field
        label="Temat lekcji"
        required
        value={topic}
        onChange={setTopic}
        placeholder="Np. Ciągi geometryczne — obliczanie sumy"
      />

      {/* Notatka dla ucznia */}
      <Field
        label="Notatka dla ucznia"
        required
        value={noteForStudent}
        onChange={setNoteForStudent}
        multiline
        placeholder="Co uczeń powinien wiedzieć / powtórzyć"
        hint={isGroup ? 'wspólna dla całej grupy' : 'widoczna dla ucznia'}
      />

      {/* Notatka dla rodzica — solo only */}
      {!isGroup && students.length > 0 && (
        <Field
          label="Notatka dla rodzica"
          value={noteForParentSolo}
          onChange={setNoteForParentSolo}
          multiline
          placeholder="Opcjonalna uwaga dla rodzica"
          hint="opcjonalna, widoczna dla rodzica"
        />
      )}
      {isGroup && (
        <p className="mb-4 flex items-center gap-2 text-[10px] font-bold text-accent">
          ℹ️ Uwagi dla poszczególnych rodziców dodajesz wyżej, przy każdym uczniu osobno.
        </p>
      )}

      {/* PD */}
      <div className="grid gap-3 md:grid-cols-[1fr_180px]">
        <Field
          label="Praca domowa"
          value={homeworkContent}
          onChange={setHomeworkContent}
          placeholder="Np. Zad. 5.1–5.10 str. 94"
          hint="widoczna dla ucznia i rodzica"
        />
        <div className="mb-4">
          <label className="mb-1.5 block text-[12px] font-bold text-secondary">
            Termin PD
          </label>
          <input
            type="date"
            value={homeworkDueDate}
            onChange={(e) => setHomeworkDueDate(e.target.value)}
            className="w-full rounded-[10px] border border-subtle bg-main p-2.5 text-[12px] text-primary placeholder:text-dim focus:border-link focus:outline-none"
          />
        </div>
      </div>

      {/* Notatka wewnętrzna */}
      <div className="mt-2 border-t border-subtle pt-4">
        <Field
          label="Notatka wewnętrzna"
          value={internalNote}
          onChange={setInternalNote}
          multiline
          placeholder="Tylko dla Ciebie i admina — rodzic/uczeń NIE widzą"
          hint="prywatna, tylko admin i Ty"
        />
      </div>

      {error && (
        <p className="mb-3 rounded-[8px] bg-[#EF444418] px-3 py-2 text-[12px] font-bold" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-[10px] border border-subtle px-5 py-2.5 text-[13px] font-bold text-secondary hover:bg-surface-hover disabled:opacity-50"
          >
            Anuluj
          </button>
        )}
        <button
          type="button"
          onClick={() => save('draft')}
          disabled={isPending}
          className="rounded-[10px] px-5 py-2.5 text-[13px] font-extrabold disabled:opacity-50"
          style={{
            border: '1.5px solid #FFCA2840',
            backgroundColor: 'transparent',
            color: '#FFCA28',
          }}
        >
          Zapisz szkic
        </button>
        <button
          type="button"
          onClick={() => save('published')}
          disabled={isPending || !canPublish}
          className="rounded-[10px] px-6 py-2.5 text-[13px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor: canPublish ? '#22C55E' : '#8B879D',
          }}
        >
          {isPending ? 'Zapisywanie…' : 'Opublikuj wpis'}
        </button>
      </div>
      <p className="mt-2 text-right text-[10px] italic text-dim">
        * Temat i notatka dla ucznia wymagane do opublikowania. Szkic można zapisać bez nich.
      </p>

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 rounded-[12px] px-4 py-3 text-[13px] font-extrabold shadow-xl"
          style={
            toast === 'published'
              ? { backgroundColor: '#22C55E', color: '#fff' }
              : { backgroundColor: '#FFCA28', color: '#1a1400' }
          }
          role="status"
        >
          <span aria-hidden>✓</span>
          {toast === 'published' ? 'Wpis opublikowany' : 'Szkic zapisany'}
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  required,
  value,
  onChange,
  multiline,
  placeholder,
  hint,
}: {
  label: string
  required?: boolean
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  placeholder?: string
  hint?: string
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold text-secondary">
        {label}
        {required && <span className="text-[10px]" style={{ color: '#FF6F4A' }}>*</span>}
        {hint && <span className="text-[10px] italic text-dim">— {hint}</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full resize-y rounded-[10px] border border-subtle bg-main p-2.5 text-[13px] text-primary placeholder:text-dim focus:border-link focus:outline-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-[10px] border border-subtle bg-main p-2.5 text-[13px] text-primary placeholder:text-dim focus:border-link focus:outline-none"
        />
      )}
    </div>
  )
}

function AttendanceButton({
  active,
  label,
  color,
  onClick,
}: {
  active: boolean
  label: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[8px] border px-3 py-1 text-[10px] font-bold transition-colors"
      style={
        active
          ? { borderColor: `${color}80`, backgroundColor: `${color}29`, color }
          : { borderColor: 'rgba(59,143,240,0.10)', backgroundColor: 'transparent', color: '#8B879D' }
      }
    >
      {label}
    </button>
  )
}
