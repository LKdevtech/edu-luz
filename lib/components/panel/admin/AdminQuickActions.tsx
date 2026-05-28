'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'

import {
  FormField,
  GhostBtn,
  Modal,
  ModalFooter,
  PrimaryBtn,
  SelectInput,
  TextInput,
  TextareaInput,
} from './Modal'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Enums } from '@/lib/types/database.types'

type ActionId = 'student' | 'classes' | 'group' | 'broadcast' | null

const ACTIONS = [
  { id: 'student' as const, label: 'Dodaj ucznia', icon: '🎓', color: '#3B8FF0' },
  { id: 'classes' as const, label: 'Dodaj zajęcia', icon: '📚', color: '#22C55E' },
  { id: 'group' as const, label: 'Nowa grupa', icon: '👥', color: '#7C5CFC' },
  { id: 'broadcast' as const, label: 'Wyślij komunikat', icon: '📢', color: '#F59E0B' },
]

type RoomOpt = { id: string; name: string }
type SubjectOpt = { id: string; name: string; color: string }
type TutorOpt = { id: string; fullName: string }
type StudentOpt = { id: string; fullName: string; schoolClass: string; level: string }
type ParentOpt = { id: string; fullName: string; phone: string | null }

export type AdminQuickActionsProps = {
  adminId: string
  rooms: RoomOpt[]
  subjects: SubjectOpt[]
  tutors: TutorOpt[]
  students: StudentOpt[]
  parents: ParentOpt[]
}

/**
 * 4 modale "szybkich akcji" z dashboardu admina (sekcja 5.7 SYSTEM_INSTRUCTIONS_v2).
 */
export function AdminQuickActions(props: AdminQuickActionsProps) {
  const [active, setActive] = useState<ActionId>(null)

  return (
    <>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setActive(a.id)}
            className="flex flex-col items-center gap-2 rounded-[12px] px-3 py-4 text-[12px] font-bold transition-all hover:brightness-110 hover:scale-[1.02]"
            style={{ backgroundColor: `${a.color}22`, color: a.color }}
          >
            <span className="text-[22px]" aria-hidden>
              {a.icon}
            </span>
            {a.label}
          </button>
        ))}
      </div>

      <AddStudentModal
        open={active === 'student'}
        onClose={() => setActive(null)}
        parents={props.parents}
        subjects={props.subjects}
        tutors={props.tutors}
      />
      <AddClassesModal
        open={active === 'classes'}
        onClose={() => setActive(null)}
        adminId={props.adminId}
        students={props.students}
        subjects={props.subjects}
        tutors={props.tutors}
        rooms={props.rooms}
      />
      <NewGroupModal
        open={active === 'group'}
        onClose={() => setActive(null)}
        adminId={props.adminId}
        students={props.students}
        subjects={props.subjects}
        tutors={props.tutors}
        rooms={props.rooms}
      />
      <BroadcastModal
        open={active === 'broadcast'}
        onClose={() => setActive(null)}
        adminId={props.adminId}
      />
    </>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 1. Dodaj ucznia — 3-step wizard
// ════════════════════════════════════════════════════════════════════════════

function AddStudentModal({
  open,
  onClose,
  parents,
  subjects,
  tutors,
}: {
  open: boolean
  onClose: () => void
  parents: ParentOpt[]
  subjects: SubjectOpt[]
  tutors: TutorOpt[]
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [error, setError] = useState<string | null>(null)

  // Step 1
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [schoolClass, setSchoolClass] = useState('')
  const [level, setLevel] = useState<Enums<'student_level'>>('SR')
  const [birthDate, setBirthDate] = useState('')

  // Step 2
  const [useExistingParent, setUseExistingParent] = useState(true)
  const [parentId, setParentId] = useState('')
  const [parentFirstName, setParentFirstName] = useState('')
  const [parentLastName, setParentLastName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [parentAddress, setParentAddress] = useState('')

  // Step 3
  const [withClasses, setWithClasses] = useState(false)
  const [classSubjectId, setClassSubjectId] = useState('')
  const [classTutorId, setClassTutorId] = useState('')
  const [classFee, setClassFee] = useState('')

  function reset() {
    setStep(1)
    setError(null)
    setFirstName('')
    setLastName('')
    setSchoolClass('')
    setLevel('SR')
    setBirthDate('')
    setUseExistingParent(true)
    setParentId('')
    setParentFirstName('')
    setParentLastName('')
    setParentPhone('')
    setParentEmail('')
    setParentAddress('')
    setWithClasses(false)
    setClassSubjectId('')
    setClassTutorId('')
    setClassFee('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  function canAdvance1(): boolean {
    return firstName.trim().length > 0 && lastName.trim().length > 0 && Boolean(birthDate)
  }
  function canAdvance2(): boolean {
    if (useExistingParent) return Boolean(parentId)
    return (
      parentFirstName.trim().length > 0 &&
      parentLastName.trim().length > 0 &&
      parentPhone.trim().length > 0
    )
  }

  function handleSave() {
    setError(
      'Dodawanie uczniów wymaga klucza service_role (Supabase Auth Admin API) ' +
        'do utworzenia konta. Wpiącie po stronie serwera w kolejnej fazie ' +
        '— na razie UI demonstruje workflow.',
    )
  }

  return (
    <Modal open={open} onClose={handleClose} title="Dodaj ucznia" icon="🎓" width={560}>
      {/* Step indicator */}
      <div className="mb-5 flex gap-2">
        {['Dane ucznia', 'Rodzic', 'Zajęcia'].map((s, i) => {
          const idx = (i + 1) as 1 | 2 | 3
          const isActive = idx <= step
          return (
            <div key={s} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="h-[3px] w-full rounded-full"
                style={{ backgroundColor: isActive ? '#3B8FF0' : 'rgba(59,143,240,0.10)' }}
              />
              <span
                className="text-[10px] font-extrabold"
                style={{ color: isActive ? '#3B8FF0' : '#8B879D' }}
              >
                {idx}. {s}
              </span>
            </div>
          )
        })}
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Imię" required>
              <TextInput value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="np. Kacper" />
            </FormField>
            <FormField label="Nazwisko" required>
              <TextInput value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="np. Nowak" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Klasa / rocznik">
              <TextInput value={schoolClass} onChange={(e) => setSchoolClass(e.target.value)} placeholder="np. 2 LO" />
            </FormField>
            <FormField label="Poziom" required>
              <SelectInput value={level} onChange={(e) => setLevel(e.target.value as Enums<'student_level'>)}>
                <option value="SP">SP — Szkoła Podstawowa</option>
                <option value="E8">E8 — Egzamin 8-klasisty</option>
                <option value="SR">ŚR — Szkoła Średnia</option>
                <option value="SR_EXT">ŚR★ — Średnia rozszerzenie</option>
                <option value="EM">EM — Matura</option>
                <option value="EM_EXT">EM★ — Matura rozszerzenie</option>
              </SelectInput>
            </FormField>
          </div>
          <FormField label="Data urodzenia" required>
            <TextInput type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </FormField>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-3">
          <div
            className="rounded-[10px] p-3"
            style={{ background: '#1C2035', border: '1px dashed rgba(59,143,240,0.20)' }}
          >
            <div className="mb-2 flex items-center gap-3">
              <label className="flex items-center gap-2 text-[12px] font-bold text-primary">
                <input
                  type="radio"
                  checked={useExistingParent}
                  onChange={() => setUseExistingParent(true)}
                />
                Istniejący rodzic
              </label>
              <label className="flex items-center gap-2 text-[12px] font-bold text-primary">
                <input
                  type="radio"
                  checked={!useExistingParent}
                  onChange={() => setUseExistingParent(false)}
                />
                Nowy rodzic
              </label>
            </div>
            {useExistingParent ? (
              <SelectInput value={parentId} onChange={(e) => setParentId(e.target.value)}>
                <option value="">— wybierz rodzica —</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName}
                    {p.phone ? ` (${p.phone})` : ''}
                  </option>
                ))}
              </SelectInput>
            ) : (
              <>
                <div className="mb-2 grid grid-cols-2 gap-3">
                  <FormField label="Imię" required>
                    <TextInput value={parentFirstName} onChange={(e) => setParentFirstName(e.target.value)} placeholder="np. Monika" />
                  </FormField>
                  <FormField label="Nazwisko" required>
                    <TextInput value={parentLastName} onChange={(e) => setParentLastName(e.target.value)} placeholder="np. Nowak" />
                  </FormField>
                </div>
                <div className="mb-2 grid grid-cols-2 gap-3">
                  <FormField label="Telefon" required>
                    <TextInput value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="+48 ..." />
                  </FormField>
                  <FormField label="Email">
                    <TextInput type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} />
                  </FormField>
                </div>
                <FormField label="Adres">
                  <TextInput value={parentAddress} onChange={(e) => setParentAddress(e.target.value)} placeholder="ul. Kwiatowa 15/3, Tomaszów Mazowiecki" />
                </FormField>
              </>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-3">
          <div className="rounded-[10px] bg-alt p-3 text-[12px]">
            Ten krok jest{' '}
            <span className="font-extrabold text-link">opcjonalny</span>. Jeśli uczeń dołącza
            {'tylko do grupy — pomiń i dodaj go do grupy później z ekranu „Nowa grupa".'}
          </div>

          <label className="flex items-center gap-2 text-[12px] font-bold text-primary">
            <input
              type="checkbox"
              checked={withClasses}
              onChange={(e) => setWithClasses(e.target.checked)}
            />
            Dodaj zajęcia indywidualne
          </label>

          {withClasses && (
            <div
              className="rounded-[10px] p-3"
              style={{ background: 'rgba(59,143,240,0.05)', border: '1px dashed rgba(59,143,240,0.20)' }}
            >
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Przedmiot" required>
                  <SelectInput value={classSubjectId} onChange={(e) => setClassSubjectId(e.target.value)}>
                    <option value="">— wybierz —</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </SelectInput>
                </FormField>
                <FormField label="Korepetytor" required>
                  <SelectInput value={classTutorId} onChange={(e) => setClassTutorId(e.target.value)}>
                    <option value="">— wybierz —</option>
                    {tutors.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </SelectInput>
                </FormField>
              </div>
              <FormField label="Opłata miesięczna (zł)" required>
                <TextInput type="number" value={classFee} onChange={(e) => setClassFee(e.target.value)} placeholder="np. 360" />
              </FormField>
              <p className="mt-1 text-[10px] italic text-dim">
                {'Harmonogram tygodniowy dodaj po utworzeniu ucznia w ekranie „Dodaj zajęcia".'}
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-[8px] bg-[#EF444418] px-3 py-2 text-[12px] font-bold" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}

      <ModalFooter>
        {step > 1 ? (
          <GhostBtn onClick={() => setStep(((step - 1) as 1 | 2))}>← Wstecz</GhostBtn>
        ) : (
          <div />
        )}
        <div className="ml-auto flex gap-2">
          <GhostBtn onClick={handleClose}>Anuluj</GhostBtn>
          {step < 3 ? (
            <PrimaryBtn
              onClick={() => {
                setError(null)
                if (step === 1 && !canAdvance1()) {
                  setError('Wypełnij wymagane pola.')
                  return
                }
                if (step === 2 && !canAdvance2()) {
                  setError('Wybierz rodzica lub uzupełnij dane.')
                  return
                }
                setStep(((step + 1) as 2 | 3))
              }}
            >
              Dalej →
            </PrimaryBtn>
          ) : (
            <PrimaryBtn color="#22C55E" onClick={handleSave}>
              ✓ Dodaj ucznia
            </PrimaryBtn>
          )}
        </div>
      </ModalFooter>
    </Modal>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Combobox ucznia — wyszukiwarka zamiast <select> (użyteczna przy 100+ uczniach)
// ════════════════════════════════════════════════════════════════════════════

function StudentCombobox({
  students,
  value,
  onChange,
}: {
  students: StudentOpt[]
  value: string
  onChange: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const selected = students.find((s) => s.id === value)

  // Zamknij listę przy kliknięciu poza komponentem.
  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const q = query.trim().toLowerCase()
  const matches = q
    ? students
        .filter(
          (s) =>
            s.fullName.toLowerCase().includes(q) ||
            s.schoolClass.toLowerCase().includes(q),
        )
        .slice(0, 20)
    : students.slice(0, 20)

  // Tekst w polu: gdy lista zamknięta i wybrano ucznia — pokaż jego imię.
  const inputValue = open ? query : selected ? selected.fullName : ''

  function select(s: StudentOpt) {
    onChange(s.id)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="relative" ref={wrapRef}>
      <TextInput
        value={inputValue}
        placeholder="🔍 Wpisz imię, nazwisko lub klasę…"
        onChange={(e) => {
          setQuery(e.target.value)
          if (!open) setOpen(true)
          if (value) onChange('')
        }}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <div
          className="absolute left-0 right-0 top-full z-10 mt-1 max-h-[240px] overflow-auto rounded-[10px] bg-surface"
          style={{ border: '1px solid rgba(59,143,240,0.30)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
        >
          {matches.length > 0 ? (
            matches.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => select(s)}
                className="flex w-full items-center justify-between border-b border-subtle px-3 py-2 text-left hover:bg-surface-hover"
                style={s.id === value ? { backgroundColor: 'rgba(59,143,240,0.12)' } : undefined}
              >
                <div>
                  <div className="text-[13px] font-bold text-primary">{s.fullName}</div>
                  <div className="text-[11px] text-dim">
                    {s.schoolClass} · {s.level}
                  </div>
                </div>
                {s.id === value && <span className="text-[12px] font-extrabold text-link">✓</span>}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-[12px] text-dim">Brak wyników</div>
          )}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 2. Dodaj zajęcia (dla istniejącego ucznia)
// ════════════════════════════════════════════════════════════════════════════

function AddClassesModal({
  open,
  onClose,
  adminId,
  students,
  subjects,
  tutors,
  rooms,
}: {
  open: boolean
  onClose: () => void
  adminId: string
  students: StudentOpt[]
  subjects: SubjectOpt[]
  tutors: TutorOpt[]
  rooms: RoomOpt[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [studentId, setStudentId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [tutorId, setTutorId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [monthlyFee, setMonthlyFee] = useState('')
  const [form, setForm] = useState<Enums<'class_form'>>('individual')

  function reset() {
    setStudentId('')
    setSubjectId('')
    setTutorId('')
    setRoomId('')
    setMonthlyFee('')
    setForm('individual')
    setError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function submit() {
    setError(null)
    if (!studentId || !subjectId || !tutorId || !monthlyFee) {
      setError('Wypełnij wszystkie wymagane pola.')
      return
    }
    const student = students.find((s) => s.id === studentId)
    if (!student) {
      setError('Nieprawidłowy uczeń.')
      return
    }

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: insErr } = await supabase.from('classes').insert({
        form,
        subject_id: subjectId,
        tutor_id: tutorId,
        level: levelToEnum(student.level),
        student_id: studentId,
        monthly_fee: Number(monthlyFee),
        room_id: roomId || null,
        start_date: new Date().toISOString().slice(0, 10),
        created_by: adminId,
      })
      if (insErr) {
        setError(insErr.message)
        return
      }
      handleClose()
      router.refresh()
    })
  }

  return (
    <Modal open={open} onClose={handleClose} title="Dodaj zajęcia" icon="📚">
      <FormField label="Uczeń" required>
        <StudentCombobox
          students={students}
          value={studentId}
          onChange={setStudentId}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Przedmiot" required>
          <SelectInput value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">— wybierz —</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Korepetytor" required>
          <SelectInput value={tutorId} onChange={(e) => setTutorId(e.target.value)}>
            <option value="">— wybierz —</option>
            {tutors.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <FormField label="Typ">
          <SelectInput value={form} onChange={(e) => setForm(e.target.value as Enums<'class_form'>)}>
            <option value="individual">Indywidualne</option>
            <option value="pair">W parze</option>
          </SelectInput>
        </FormField>
        <FormField label="Sala">
          <SelectInput value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <option value="">— bez przypisania —</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Opłata/msc (zł)" required>
          <TextInput type="number" value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} placeholder="np. 360" />
        </FormField>
      </div>
      <p className="text-[10px] italic text-dim">
        Harmonogram tygodniowy (dni + godziny) edytuj po utworzeniu klasy w karcie ucznia.
      </p>

      {error && (
        <p className="mt-3 rounded-[8px] bg-[#EF444418] px-3 py-2 text-[12px] font-bold" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}

      <ModalFooter>
        <GhostBtn onClick={handleClose} disabled={isPending}>
          Anuluj
        </GhostBtn>
        <PrimaryBtn color="#22C55E" onClick={submit} disabled={isPending}>
          {isPending ? 'Dodawanie…' : '✓ Dodaj zajęcia'}
        </PrimaryBtn>
      </ModalFooter>
    </Modal>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 3. Nowa grupa
// ════════════════════════════════════════════════════════════════════════════

function NewGroupModal({
  open,
  onClose,
  adminId,
  students,
  subjects,
  tutors,
  rooms,
}: {
  open: boolean
  onClose: () => void
  adminId: string
  students: StudentOpt[]
  subjects: SubjectOpt[]
  tutors: TutorOpt[]
  rooms: RoomOpt[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [maxSize, setMaxSize] = useState('6')
  const [subjectId, setSubjectId] = useState('')
  const [level, setLevel] = useState<Enums<'student_level'>>('SP')
  const [tutorId, setTutorId] = useState('')
  const [monthlyFee, setMonthlyFee] = useState('')
  const [roomId, setRoomId] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState('2')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [search, setSearch] = useState('')
  const [memberIds, setMemberIds] = useState<string[]>([])

  function reset() {
    setName('')
    setMaxSize('6')
    setSubjectId('')
    setLevel('SP')
    setTutorId('')
    setMonthlyFee('')
    setRoomId('')
    setDayOfWeek('2')
    setStartTime('')
    setEndTime('')
    setSearch('')
    setMemberIds([])
    setError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  const searchResults =
    search.length >= 2
      ? students
          .filter((s) => s.fullName.toLowerCase().includes(search.toLowerCase()))
          .filter((s) => !memberIds.includes(s.id))
          .slice(0, 5)
      : []

  const selectedMembers = memberIds
    .map((id) => students.find((s) => s.id === id))
    .filter((s): s is StudentOpt => Boolean(s))

  async function submit() {
    setError(null)
    if (
      !name.trim() ||
      !subjectId ||
      !tutorId ||
      !monthlyFee ||
      !startTime ||
      !endTime
    ) {
      setError('Wypełnij wszystkie wymagane pola.')
      return
    }
    if (endTime <= startTime) {
      setError('Godzina końcowa musi być późniejsza niż początkowa.')
      return
    }

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()

      // 1) Utwórz grupę
      const { data: groupRow, error: gErr } = await supabase
        .from('groups')
        .insert({
          name: name.trim(),
          subject_id: subjectId,
          level,
          tutor_id: tutorId,
          max_size: Number(maxSize),
          monthly_fee_per_student: Number(monthlyFee),
          created_by: adminId,
        })
        .select('id')
        .single()
      if (gErr) {
        setError(gErr.message)
        return
      }
      const groupId = groupRow.id

      // 2) Dodaj członków
      if (memberIds.length > 0) {
        const { error: mErr } = await supabase.from('group_members').insert(
          memberIds.map((sid) => ({ group_id: groupId, student_id: sid })),
        )
        if (mErr) {
          setError(mErr.message)
          return
        }
      }

      // 3) Utwórz class (form='group') + 1 weekly slot
      const { data: classRow, error: cErr } = await supabase
        .from('classes')
        .insert({
          form: 'group',
          subject_id: subjectId,
          tutor_id: tutorId,
          level,
          group_id: groupId,
          monthly_fee: Number(monthlyFee),
          room_id: roomId || null,
          start_date: new Date().toISOString().slice(0, 10),
          created_by: adminId,
        })
        .select('id')
        .single()
      if (cErr) {
        setError(cErr.message)
        return
      }
      const { error: slotErr } = await supabase.from('weekly_slots').insert({
        class_id: classRow.id,
        day_of_week: Number(dayOfWeek),
        start_time: startTime,
        end_time: endTime,
        room_id: roomId || null,
        active_from: new Date().toISOString().slice(0, 10),
      })
      if (slotErr) {
        setError(slotErr.message)
        return
      }

      handleClose()
      router.refresh()
    })
  }

  return (
    <Modal open={open} onClose={handleClose} title="Nowa grupa" icon="👥" width={600}>
      <div className="grid grid-cols-[2fr_1fr] gap-3">
        <FormField label="Nazwa grupy" required>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Grupa A — Angielski SP" />
        </FormField>
        <FormField label="Max. osób">
          <TextInput type="number" value={maxSize} onChange={(e) => setMaxSize(e.target.value)} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Przedmiot" required>
          <SelectInput value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">— wybierz —</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Poziom" required>
          <SelectInput value={level} onChange={(e) => setLevel(e.target.value as Enums<'student_level'>)}>
            <option value="SP">SP</option>
            <option value="E8">E8</option>
            <option value="SR">ŚR</option>
            <option value="SR_EXT">ŚR★</option>
            <option value="EM">EM</option>
            <option value="EM_EXT">EM★</option>
          </SelectInput>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Korepetytor" required>
          <SelectInput value={tutorId} onChange={(e) => setTutorId(e.target.value)}>
            <option value="">— wybierz —</option>
            {tutors.map((t) => (
              <option key={t.id} value={t.id}>{t.fullName}</option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Opłata/os./msc (zł)" required>
          <TextInput type="number" value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} placeholder="180" />
        </FormField>
      </div>
      <FormField label="Harmonogram" required>
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2">
          <SelectInput value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
            <option value="0">Pon</option>
            <option value="1">Wt</option>
            <option value="2">Śr</option>
            <option value="3">Czw</option>
            <option value="4">Pt</option>
            <option value="5">Sob</option>
          </SelectInput>
          <TextInput type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <TextInput type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          <SelectInput value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <option value="">— sala —</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </SelectInput>
        </div>
      </FormField>

      <FormField label="Członkowie grupy">
        <div className="relative">
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Wyszukaj ucznia po imieniu lub nazwisku..."
          />
          {searchResults.length > 0 && (
            <div
              className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-[10px] bg-surface"
              style={{ border: '1px solid rgba(59,143,240,0.30)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
            >
              {searchResults.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => {
                    setMemberIds([...memberIds, s.id])
                    setSearch('')
                  }}
                  className="flex w-full items-center justify-between border-b border-subtle px-3 py-2 text-left hover:bg-surface-hover"
                >
                  <div>
                    <div className="text-[13px] font-bold text-primary">{s.fullName}</div>
                    <div className="text-[11px] text-dim">{s.schoolClass} · {s.level}</div>
                  </div>
                  <span className="text-[11px] font-extrabold text-link">+ Dodaj</span>
                </button>
              ))}
            </div>
          )}
          {search.length >= 2 && searchResults.length === 0 && (
            <div
              className="absolute left-0 right-0 top-full z-10 mt-1 rounded-[10px] bg-surface px-3 py-2"
              style={{ border: '1px solid rgba(59,143,240,0.10)' }}
            >
              <span className="text-[12px] text-dim">{`Brak wyników dla „${search}"`}</span>
            </div>
          )}
        </div>

        {selectedMembers.length > 0 ? (
          <div className="mt-2 flex flex-col gap-1">
            {selectedMembers.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-[8px] bg-alt px-3 py-2"
                style={{ border: '1px solid rgba(59,143,240,0.10)' }}
              >
                <div>
                  <span className="text-[12px] font-bold text-primary">{m.fullName}</span>
                  <span className="ml-2 text-[11px] text-dim">{m.schoolClass} · {m.level}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMemberIds(memberIds.filter((id) => id !== m.id))}
                  className="flex h-6 w-6 items-center justify-center rounded-[6px] text-[11px] font-extrabold hover:brightness-110"
                  style={{ backgroundColor: '#EF444422', color: '#EF4444' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="mt-2 rounded-[8px] bg-alt p-3 text-center text-[12px] text-dim"
            style={{ border: '1px dashed rgba(59,143,240,0.10)' }}
          >
            Wyszukaj i dodaj uczniów do grupy.
          </div>
        )}
      </FormField>

      <div
        className="rounded-[10px] p-3"
        style={{ backgroundColor: 'rgba(59,143,240,0.08)', border: '1px solid rgba(59,143,240,0.15)' }}
      >
        <div className="text-[11px] font-extrabold text-link">ℹ Automatyczne przypisanie</div>
        <p className="mt-1 text-[11px] text-secondary">
          Utworzenie grupy automatycznie doda zajęcia grupowe wszystkim członkom
          {monthlyFee && ` (opłata ${monthlyFee} zł/os./msc zostanie doliczona do rachunków)`}.
        </p>
      </div>

      {error && (
        <p className="mt-3 rounded-[8px] bg-[#EF444418] px-3 py-2 text-[12px] font-bold" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}

      <ModalFooter>
        <GhostBtn onClick={handleClose} disabled={isPending}>
          Anuluj
        </GhostBtn>
        <PrimaryBtn color="#22C55E" onClick={submit} disabled={isPending}>
          {isPending ? 'Tworzenie…' : `✓ Utwórz grupę (${memberIds.length} os.)`}
        </PrimaryBtn>
      </ModalFooter>
    </Modal>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 4. Wyślij komunikat
// ════════════════════════════════════════════════════════════════════════════

function BroadcastModal({
  open,
  onClose,
  adminId,
}: {
  open: boolean
  onClose: () => void
  adminId: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [audience, setAudience] = useState<Enums<'message_audience'>>('all_parents')
  const [channel, setChannel] = useState<Enums<'message_channel'>>('both')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  function reset() {
    setAudience('all_parents')
    setChannel('both')
    setSubject('')
    setBody('')
    setError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function appendVar(v: string) {
    setBody((b) => b + ' ' + v)
  }

  async function submit() {
    setError(null)
    if (!subject.trim() || !body.trim()) {
      setError('Wypełnij temat i treść.')
      return
    }
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: insErr } = await supabase.from('admin_announcements').insert({
        sent_by: adminId,
        audience,
        channel,
        subject: subject.trim(),
        body: body.trim(),
      })
      if (insErr) {
        setError(insErr.message)
        return
      }
      handleClose()
      router.refresh()
    })
  }

  return (
    <Modal open={open} onClose={handleClose} title="Wyślij komunikat" icon="📢" width={560}>
      <FormField label="Odbiorcy" required>
        <SelectInput value={audience} onChange={(e) => setAudience(e.target.value as Enums<'message_audience'>)}>
          <option value="all_parents">Wszyscy rodzice</option>
          <option value="parents_with_overdue">Rodzice z zaległościami</option>
          <option value="all_tutors">Wszyscy korepetytorzy</option>
        </SelectInput>
      </FormField>

      <FormField label="Kanał">
        <div className="flex gap-2">
          {(['email', 'push', 'both'] as const).map((c) => {
            const isActive = channel === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                className="rounded-[8px] border px-3 py-1.5 text-[12px] font-bold transition-colors"
                style={
                  isActive
                    ? { borderColor: 'rgba(59,143,240,0.5)', backgroundColor: 'rgba(59,143,240,0.18)', color: '#3B8FF0' }
                    : { borderColor: 'rgba(59,143,240,0.10)', backgroundColor: 'transparent', color: '#8B879D' }
                }
              >
                {c === 'email' ? 'Email' : c === 'push' ? 'Push' : 'Email + Push'}
              </button>
            )
          })}
        </div>
      </FormField>

      <FormField label="Temat" required>
        <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="np. Zmiana godzin pracy w święta" />
      </FormField>

      <FormField label="Treść" required>
        <TextareaInput value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="Treść komunikatu..." />
      </FormField>

      <div className="rounded-[10px] bg-alt p-3">
        <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-dim">
          Dostępne zmienne (kliknij, by wstawić)
        </div>
        <div className="flex flex-wrap gap-2">
          {['{rodzic}', '{uczeń}', '{miesiąc}', '{kwota}'].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => appendVar(v)}
              className="rounded-md px-2 py-0.5 text-[11px] font-bold transition-colors hover:brightness-110"
              style={{ backgroundColor: 'rgba(59,143,240,0.12)', color: '#3B8FF0' }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-[8px] bg-[#EF444418] px-3 py-2 text-[12px] font-bold" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}

      <ModalFooter>
        <GhostBtn onClick={handleClose} disabled={isPending}>
          Anuluj
        </GhostBtn>
        <PrimaryBtn onClick={submit} disabled={isPending}>
          {isPending ? 'Wysyłanie…' : '📤 Wyślij komunikat'}
        </PrimaryBtn>
      </ModalFooter>
    </Modal>
  )
}

function levelToEnum(s: string): Enums<'student_level'> {
  switch (s) {
    case 'SP': return 'SP'
    case 'E8': return 'E8'
    case 'SR': return 'SR'
    case 'SR_EXT': return 'SR_EXT'
    case 'EM': return 'EM'
    case 'EM_EXT': return 'EM_EXT'
    default: return 'SR'
  }
}
