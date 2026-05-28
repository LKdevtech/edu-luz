'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Enums } from '@/lib/types/database.types'

import {
  FormField,
  GhostBtn,
  Modal,
  ModalFooter,
  PrimaryBtn,
  SelectInput,
  TextInput,
} from './Modal'

export type SubjectOpt = { id: string; name: string; color: string }
type TutorOpt = { id: string; fullName: string }
type StudentOpt = { id: string; fullName: string; schoolClass: string; level: string }
type ParentOpt = { id: string; fullName: string; phone: string | null }
type RoomOpt = { id: string; name: string }

// ════════════════════════════════════════════════════════════════════════════
// Dodaj ucznia — kreator 3-krokowy (UI; tworzenie konta wymaga service_role)
// ════════════════════════════════════════════════════════════════════════════

export function StudentsAddStudentModal({
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

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [schoolClass, setSchoolClass] = useState('')
  const [level, setLevel] = useState<Enums<'student_level'>>('SR')
  const [birthDate, setBirthDate] = useState('')

  const [useExistingParent, setUseExistingParent] = useState(true)
  const [parentId, setParentId] = useState('')
  const [parentFirstName, setParentFirstName] = useState('')
  const [parentLastName, setParentLastName] = useState('')
  const [parentPhone, setParentPhone] = useState('')

  const [withClasses, setWithClasses] = useState(false)
  const [classSubjectId, setClassSubjectId] = useState('')
  const [classTutorId, setClassTutorId] = useState('')
  const [classFee, setClassFee] = useState('')
  const [classLevelScope, setClassLevelScope] = useState('')
  const [classGoal, setClassGoal] = useState('')

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
    setWithClasses(false)
    setClassSubjectId('')
    setClassTutorId('')
    setClassFee('')
    setClassLevelScope('')
    setClassGoal('')
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

  return (
    <Modal open={open} onClose={handleClose} title="Dodaj ucznia" icon="🎓" width={560}>
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
                <option value="SP">Szkoła podstawowa</option>
                <option value="SR">Szkoła średnia</option>
              </SelectInput>
            </FormField>
          </div>
          <FormField label="Data urodzenia" required>
            <TextInput type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </FormField>
        </div>
      )}

      {step === 2 && (
        <div
          className="rounded-[10px] p-3"
          style={{ background: '#1C2035', border: '1px dashed rgba(59,143,240,0.20)' }}
        >
          <div className="mb-2 flex items-center gap-3">
            <label className="flex items-center gap-2 text-[12px] font-bold text-primary">
              <input type="radio" checked={useExistingParent} onChange={() => setUseExistingParent(true)} />
              Istniejący rodzic
            </label>
            <label className="flex items-center gap-2 text-[12px] font-bold text-primary">
              <input type="radio" checked={!useExistingParent} onChange={() => setUseExistingParent(false)} />
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
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Imię" required>
                <TextInput value={parentFirstName} onChange={(e) => setParentFirstName(e.target.value)} placeholder="np. Monika" />
              </FormField>
              <FormField label="Nazwisko" required>
                <TextInput value={parentLastName} onChange={(e) => setParentLastName(e.target.value)} placeholder="np. Nowak" />
              </FormField>
              <FormField label="Telefon" required>
                <TextInput value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="+48 ..." />
              </FormField>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-3">
          <div className="rounded-[10px] bg-alt p-3 text-[12px]">
            Ten krok jest <span className="font-extrabold text-link">opcjonalny</span>. Jeśli uczeń
            {' dołącza tylko do grupy — pomiń i dodaj go do grupy później.'}
          </div>
          <label className="flex items-center gap-2 text-[12px] font-bold text-primary">
            <input type="checkbox" checked={withClasses} onChange={(e) => setWithClasses(e.target.checked)} />
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
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Poziom">
                  <SelectInput value={classLevelScope} onChange={(e) => setClassLevelScope(e.target.value)}>
                    <option value="">— nie dotyczy —</option>
                    <option value="basic">Podstawa</option>
                    <option value="extended">Rozszerzenie</option>
                  </SelectInput>
                </FormField>
                <FormField label="Cel">
                  <SelectInput value={classGoal} onChange={(e) => setClassGoal(e.target.value)}>
                    <option value="">— nie dotyczy —</option>
                    <option value="e8">Egzamin ósmoklasisty</option>
                    <option value="matura">Matura</option>
                    <option value="support">Bieżące wsparcie</option>
                  </SelectInput>
                </FormField>
              </div>
              <p className="mt-1 text-[10px] italic text-dim">Poziom i cel są opcjonalne.</p>
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
          <GhostBtn onClick={() => setStep((step - 1) as 1 | 2)}>← Wstecz</GhostBtn>
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
                setStep((step + 1) as 2 | 3)
              }}
            >
              Dalej →
            </PrimaryBtn>
          ) : (
            <PrimaryBtn
              color="#22C55E"
              onClick={() =>
                setError(
                  'Tworzenie konta ucznia wymaga klucza service_role (Supabase Auth Admin API) — ' +
                    'wpięcie po stronie serwera w kolejnej fazie. UI demonstruje workflow.',
                )
              }
            >
              ✓ Dodaj ucznia
            </PrimaryBtn>
          )}
        </div>
      </ModalFooter>
    </Modal>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Nowa grupa — realne mutacje (group + members + class + slot)
// ════════════════════════════════════════════════════════════════════════════

export function StudentsNewGroupModal({
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

  function submit() {
    setError(null)
    if (!name.trim() || !subjectId || !tutorId || !monthlyFee || !startTime || !endTime) {
      setError('Wypełnij wszystkie wymagane pola.')
      return
    }
    if (endTime <= startTime) {
      setError('Godzina końcowa musi być późniejsza niż początkowa.')
      return
    }

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()

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

      if (memberIds.length > 0) {
        const { error: mErr } = await supabase
          .from('group_members')
          .insert(memberIds.map((sid) => ({ group_id: groupId, student_id: sid })))
        if (mErr) {
          setError(mErr.message)
          return
        }
      }

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
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
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
              <option key={t.id} value={t.id}>
                {t.fullName}
              </option>
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
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
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
                    <div className="text-[11px] text-dim">
                      {s.schoolClass} · {s.level}
                    </div>
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
                  <span className="ml-2 text-[11px] text-dim">
                    {m.schoolClass} · {m.level}
                  </span>
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
