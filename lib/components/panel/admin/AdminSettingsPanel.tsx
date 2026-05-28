'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { SubjectDot } from '@/lib/components/panel/Badges'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { AdminSettingsData } from '@/lib/queries/admin'
import type { Enums } from '@/lib/types/database.types'

// ════════════════════════════════════════════════════════════════════════════
// Tokeny kolorów (z mockupu — inline hex tam, gdzie brak tokena Tailwind)
// ════════════════════════════════════════════════════════════════════════════
const T = {
  bg: '#151827',
  bgAlt: '#1C2035',
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

type SectionId =
  | 'center'
  | 'rooms'
  | 'subjects'
  | 'hours'
  | 'reminders'
  | 'contracts'
  | 'accounts'
  | 'notifications'

const settingSections: Array<{ id: SectionId; icon: string; label: string }> = [
  { id: 'center', icon: '🏢', label: 'Centrum' },
  { id: 'rooms', icon: '📍', label: 'Sale' },
  { id: 'subjects', icon: '📚', label: 'Przedmioty' },
  { id: 'hours', icon: '🕒', label: 'Godziny pracy' },
  { id: 'reminders', icon: '🔔', label: 'Przypomnienia' },
  { id: 'contracts', icon: '📄', label: 'Umowy' },
  { id: 'accounts', icon: '👤', label: 'Konta' },
  { id: 'notifications', icon: '📢', label: 'Powiadomienia' },
]

const ROLE_LABEL: Record<Enums<'user_role'>, string> = {
  admin: 'admin',
  tutor: 'korepetytor',
  parent: 'rodzic',
  student: 'uczeń',
}

// Powiadomienia — brak w AdminSettingsData, prezentacja wizualna (mockup)
const notifSettings = [
  { id: 'new_absence', label: 'Nowa nieobecność korepetytora', email: true, push: true },
  { id: 'plan_change', label: 'Prośba o zmianę planu', email: true, push: true },
  { id: 'entry_blocked', label: 'Zablokowany wpis (>48h)', email: false, push: true },
  { id: 'payment_received', label: 'Wpłata zaksięgowana', email: true, push: false },
  { id: 'payment_overdue', label: 'Nowa zaległość', email: true, push: true },
  { id: 'makeup_no_response', label: 'Odrabianie bez odpowiedzi >3 dni', email: false, push: true },
  { id: 'contract_ending', label: 'Umowa kończy się w ciągu 30 dni', email: true, push: false },
]

// ════════════════════════════════════════════════════════════════════════════
// Główny komponent — wewnętrzny układ: nav sekcji + treść
// ════════════════════════════════════════════════════════════════════════════
export function AdminSettingsPanel({ data }: { data: AdminSettingsData }) {
  const [activeSection, setActiveSection] = useState<SectionId>('center')

  const renderSection = () => {
    switch (activeSection) {
      case 'center':
        return <CenterSection center={data.center} />
      case 'rooms':
        return <RoomsSection rooms={data.rooms} />
      case 'subjects':
        return <SubjectsSection subjects={data.subjects} />
      case 'hours':
        return <HoursSection workingHours={data.workingHours} />
      case 'reminders':
        return <RemindersSection templates={data.reminderTemplates} />
      case 'contracts':
        return <ContractsSection terms={data.contractTerms} />
      case 'accounts':
        return <AccountsSection accounts={data.accounts} userAccounts={data.userAccounts} />
      case 'notifications':
        return <NotificationsSection />
      default:
        return <CenterSection center={data.center} />
    }
  }

  return (
    <div
      className="flex overflow-hidden rounded-card bg-surface"
      style={{ border: '1px solid ' + T.cardBorder }}
    >
      {/* Settings nav */}
      <div
        className="w-[200px] shrink-0 overflow-auto p-3"
        style={{ borderRight: '1px solid ' + T.cardBorder }}
      >
        {settingSections.map((s) => {
          const isActive = activeSection === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSection(s.id)}
              className="mb-0.5 flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2.5 text-left transition-colors hover:bg-[#3B8FF008]"
              style={{ background: isActive ? T.primary + '15' : 'transparent' }}
            >
              <span className="text-[14px]" aria-hidden>
                {s.icon}
              </span>
              <span
                className="text-[11px]"
                style={{
                  fontWeight: isActive ? 800 : 500,
                  color: isActive ? T.primary : T.textMuted,
                }}
              >
                {s.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 overflow-auto px-6 py-5">{renderSection()}</div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Pola pomocnicze
// ════════════════════════════════════════════════════════════════════════════
function Field({ label, value, editable }: { label: string; value: string; editable?: boolean }) {
  return (
    <div className="mb-2.5">
      <div
        className="mb-0.5 text-[8px] font-semibold uppercase tracking-[0.5px]"
        style={{ color: T.textDim }}
      >
        {label}
      </div>
      {editable ? (
        <input
          defaultValue={value}
          className="w-full rounded-[6px] px-2.5 py-1.5 text-[12px] font-semibold outline-none"
          style={{ color: T.text, border: '1px solid ' + T.cardBorder, background: T.bg }}
        />
      ) : (
        <div className="text-[12px] font-semibold" style={{ color: T.text }}>
          {value}
        </div>
      )}
    </div>
  )
}

function Toggle({ checked, label }: { checked: boolean; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <div
        className="relative h-5 w-9 rounded-full transition-colors"
        style={{ background: checked ? T.success : T.textDim + '40' }}
      >
        <div
          className="absolute h-4 w-4 rounded-full bg-white transition-all"
          style={{ top: 2, left: checked ? 18 : 2 }}
        />
      </div>
      <span className="text-[11px] font-semibold" style={{ color: T.text }}>
        {label}
      </span>
    </label>
  )
}

function SaveBtn({ children }: { children: string }) {
  return (
    <button
      type="button"
      className="mt-4 rounded-[8px] px-6 py-2 text-[11px] font-bold text-white"
      style={{ background: T.primary }}
    >
      {children}
    </button>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Sekcja: Centrum
// ════════════════════════════════════════════════════════════════════════════
function CenterSection({ center }: { center: AdminSettingsData['center'] }) {
  return (
    <div>
      <div className="mb-4 text-[16px] font-black" style={{ color: T.text }}>
        Dane centrum
      </div>
      <div className="grid max-w-[600px] grid-cols-2 gap-4">
        <div>
          <Field label="Nazwa" value={center.name} editable />
          {center.fullName !== null && <Field label="Pełna nazwa" value={center.fullName} editable />}
          <Field label="Adres" value={center.address} editable />
        </div>
        <div>
          <Field label="Telefon" value={center.phone} editable />
          <Field label="Email" value={center.email} editable />
          {center.nip !== null && <Field label="NIP" value={center.nip} editable />}
          {center.bankAccount !== null && (
            <Field label="Nr konta bankowego" value={center.bankAccount} editable />
          )}
          {center.bankName !== null && <Field label="Bank" value={center.bankName} editable />}
        </div>
      </div>
      <SaveBtn>Zapisz zmiany</SaveBtn>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Sekcja: Sale — pełny CRUD (zapis do Supabase)
// ════════════════════════════════════════════════════════════════════════════
type RoomRow = AdminSettingsData['rooms'][number]

function RoomsSection({ rooms }: { rooms: AdminSettingsData['rooms'] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editId, setEditId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pola formularza „dodaj"
  const [newName, setNewName] = useState('')
  const [newCapacity, setNewCapacity] = useState('4')
  const [newEquipment, setNewEquipment] = useState('')

  function resetAdd() {
    setNewName('')
    setNewCapacity('4')
    setNewEquipment('')
  }

  function addRoom() {
    const name = newName.trim()
    const capacity = Number.parseInt(newCapacity, 10)
    if (!name) {
      setError('Podaj nazwę sali')
      return
    }
    if (!Number.isFinite(capacity) || capacity <= 0) {
      setError('Pojemność musi być liczbą większą od 0')
      return
    }
    setError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: insErr } = await supabase
        .from('rooms')
        .insert({ name, capacity, equipment: newEquipment.trim() || null })
      if (insErr) {
        setError(insErr.message)
        return
      }
      resetAdd()
      setAdding(false)
      router.refresh()
    })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[16px] font-black" style={{ color: T.text }}>
          {'Sale (' + rooms.length + ')'}
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null)
            setAdding(!adding)
          }}
          className="rounded-[8px] px-3.5 py-1.5 text-[10px] font-bold text-white"
          style={{ background: adding ? T.textDim : T.primary }}
        >
          {adding ? 'Anuluj' : '+ Dodaj salę'}
        </button>
      </div>
      {error && (
        <div
          className="mb-2.5 max-w-[600px] rounded-[8px] px-3 py-2 text-[11px] font-bold"
          style={{ background: T.danger + '15', color: T.danger }}
        >
          {error}
        </div>
      )}
      {adding && (
        <div
          className="mb-2.5 max-w-[600px] rounded-[10px] px-4 py-3.5"
          style={{ background: T.surface, border: '1px dashed ' + T.primary + '50' }}
        >
          <div className="mb-2 text-[11px] font-extrabold" style={{ color: T.primary }}>
            Nowa sala
          </div>
          <div className="mb-2 flex flex-wrap gap-2">
            <NewField
              label="Nazwa"
              placeholder="Sala 5"
              width={120}
              value={newName}
              onChange={setNewName}
            />
            <NewField
              label="Pojemność"
              placeholder="4"
              width={60}
              center
              value={newCapacity}
              onChange={setNewCapacity}
            />
            <NewField
              label="Wyposażenie"
              placeholder="Tablica, projektor"
              width={200}
              value={newEquipment}
              onChange={setNewEquipment}
            />
          </div>
          <GreenBtn onClick={addRoom} disabled={isPending}>
            {isPending ? 'Zapisywanie…' : 'Dodaj salę'}
          </GreenBtn>
        </div>
      )}
      <div className="flex max-w-[600px] flex-col gap-2">
        {rooms.map((r, idx) => (
          <RoomItem
            key={r.id}
            room={r}
            index={idx}
            isOpen={editId === r.id}
            onToggle={() => {
              setError(null)
              setEditId(editId === r.id ? null : r.id)
            }}
            onSetError={setError}
            onDone={() => {
              setEditId(null)
              router.refresh()
            }}
          />
        ))}
      </div>
    </div>
  )
}

function RoomItem({
  room,
  index,
  isOpen,
  onToggle,
  onSetError,
  onDone,
}: {
  room: RoomRow
  index: number
  isOpen: boolean
  onToggle: () => void
  onSetError: (msg: string | null) => void
  onDone: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(room.name)
  const [capacity, setCapacity] = useState(String(room.capacity))
  const [equipment, setEquipment] = useState(room.equipment ?? '')

  function save() {
    const trimmed = name.trim()
    const cap = Number.parseInt(capacity, 10)
    if (!trimmed) {
      onSetError('Podaj nazwę sali')
      return
    }
    if (!Number.isFinite(cap) || cap <= 0) {
      onSetError('Pojemność musi być liczbą większą od 0')
      return
    }
    onSetError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: updErr } = await supabase
        .from('rooms')
        .update({ name: trimmed, capacity: cap, equipment: equipment.trim() || null })
        .eq('id', room.id)
      if (updErr) {
        onSetError(updErr.message)
        return
      }
      onDone()
    })
  }

  function remove() {
    if (!window.confirm('Usunąć salę „' + room.name + '"?')) return
    onSetError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { count, error: cntErr } = await supabase
        .from('classes')
        .select('id', { count: 'exact', head: true })
        .eq('room_id', room.id)
      if (cntErr) {
        onSetError(cntErr.message)
        return
      }
      if ((count ?? 0) > 0) {
        onSetError('Nie można usunąć — sala jest przypisana do zajęć')
        return
      }
      const { error: delErr } = await supabase.from('rooms').delete().eq('id', room.id)
      if (delErr) {
        onSetError(delErr.message)
        return
      }
      onDone()
    })
  }

  return (
    <div
      className="overflow-hidden rounded-[10px]"
      style={{ background: T.surface, border: '1px solid ' + T.cardBorder, opacity: room.isActive ? 1 : 0.5 }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[14px] font-black"
          style={{ background: T.primary + '20', color: T.primary }}
        >
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-extrabold" style={{ color: T.text }}>
            {room.name}
          </div>
          <div className="text-[10px]" style={{ color: T.textDim }}>
            {(room.equipment ? room.equipment + ' · ' : '') + 'max ' + room.capacity + ' os.'}
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-[6px] px-3 py-1 text-[9px] font-bold"
          style={
            isOpen
              ? { background: T.textDim + '30', color: T.textDim }
              : { background: T.primary + '12', color: T.primary }
          }
        >
          {isOpen ? 'Zwiń' : 'Edytuj'}
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={isPending}
          className="rounded-[6px] px-3 py-1 text-[9px] font-bold disabled:opacity-50"
          style={{ background: T.danger + '12', color: T.danger }}
        >
          Usuń
        </button>
      </div>
      {isOpen && (
        <div
          className="px-4 pb-3.5 pt-3"
          style={{ borderTop: '1px solid ' + T.cardBorder, paddingLeft: 64 }}
        >
          <div className="mb-2 flex flex-wrap gap-2">
            <NewField label="Nazwa" value={name} onChange={setName} width={120} />
            <NewField label="Pojemność" value={capacity} onChange={setCapacity} width={60} center />
            <NewField label="Wyposażenie" value={equipment} onChange={setEquipment} width={200} />
          </div>
          <GreenBtn onClick={save} disabled={isPending}>
            {isPending ? 'Zapisywanie…' : 'Zapisz'}
          </GreenBtn>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Sekcja: Przedmioty — pełny CRUD (zapis do Supabase)
// ════════════════════════════════════════════════════════════════════════════
type SubjectRow = AdminSettingsData['subjects'][number]

function SubjectsSection({ subjects }: { subjects: AdminSettingsData['subjects'] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editId, setEditId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pola formularza „dodaj"
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#9B59B6')
  const [newSortOrder, setNewSortOrder] = useState(String(subjects.length + 1))

  function resetAdd() {
    setNewName('')
    setNewColor('#9B59B6')
    setNewSortOrder(String(subjects.length + 1))
  }

  function addSubject() {
    const name = newName.trim()
    const sortOrder = Number.parseInt(newSortOrder, 10)
    if (!name) {
      setError('Podaj nazwę przedmiotu')
      return
    }
    setError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: insErr } = await supabase.from('subjects').insert({
        name,
        color: newColor,
        sort_order: Number.isFinite(sortOrder) ? sortOrder : subjects.length + 1,
      })
      if (insErr) {
        setError(insErr.message)
        return
      }
      resetAdd()
      setAdding(false)
      router.refresh()
    })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[16px] font-black" style={{ color: T.text }}>
          {'Przedmioty (' + subjects.length + ')'}
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null)
            setAdding(!adding)
          }}
          className="rounded-[8px] px-3.5 py-1.5 text-[10px] font-bold text-white"
          style={{ background: adding ? T.textDim : T.primary }}
        >
          {adding ? 'Anuluj' : '+ Dodaj przedmiot'}
        </button>
      </div>
      {error && (
        <div
          className="mb-2.5 max-w-[600px] rounded-[8px] px-3 py-2 text-[11px] font-bold"
          style={{ background: T.danger + '15', color: T.danger }}
        >
          {error}
        </div>
      )}
      {adding && (
        <div
          className="mb-2.5 max-w-[600px] rounded-[10px] px-4 py-3.5"
          style={{ background: T.surface, border: '1px dashed ' + T.primary + '50' }}
        >
          <div className="mb-2 text-[11px] font-extrabold" style={{ color: T.primary }}>
            Nowy przedmiot
          </div>
          <div className="mb-2 flex items-end gap-2">
            <NewField label="Nazwa" placeholder="Biologia" width={160} value={newName} onChange={setNewName} />
            <NewField label="Kolejność" placeholder="7" width={60} center value={newSortOrder} onChange={setNewSortOrder} />
            <div>
              <div className="mb-0.5 text-[8px]" style={{ color: T.textDim }}>
                Kolor
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="h-7 w-9 cursor-pointer rounded-[6px] p-0"
                  style={{ border: '1px solid ' + T.cardBorder }}
                />
                <input
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-[80px] rounded-[6px] px-2 py-[5px] text-[11px] outline-none"
                  style={{ width: 80, color: T.text, border: '1px solid ' + T.cardBorder, background: T.bg }}
                />
              </div>
            </div>
          </div>
          <GreenBtn onClick={addSubject} disabled={isPending}>
            {isPending ? 'Zapisywanie…' : 'Dodaj przedmiot'}
          </GreenBtn>
        </div>
      )}
      <div className="flex max-w-[600px] flex-col gap-1.5">
        {subjects.map((s) => (
          <SubjectItem
            key={s.id}
            subject={s}
            isOpen={editId === s.id}
            onToggle={() => {
              setError(null)
              setEditId(editId === s.id ? null : s.id)
            }}
            onSetError={setError}
            onDone={() => {
              setEditId(null)
              router.refresh()
            }}
          />
        ))}
      </div>
    </div>
  )
}

function SubjectItem({
  subject,
  isOpen,
  onToggle,
  onSetError,
  onDone,
}: {
  subject: SubjectRow
  isOpen: boolean
  onToggle: () => void
  onSetError: (msg: string | null) => void
  onDone: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(subject.name)
  const [color, setColor] = useState(subject.color)

  function save() {
    const trimmed = name.trim()
    if (!trimmed) {
      onSetError('Podaj nazwę przedmiotu')
      return
    }
    onSetError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: updErr } = await supabase
        .from('subjects')
        .update({ name: trimmed, color })
        .eq('id', subject.id)
      if (updErr) {
        onSetError(updErr.message)
        return
      }
      onDone()
    })
  }

  function remove() {
    if (!window.confirm('Usunąć przedmiot „' + subject.name + '"?')) return
    onSetError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { count, error: cntErr } = await supabase
        .from('classes')
        .select('id', { count: 'exact', head: true })
        .eq('subject_id', subject.id)
      if (cntErr) {
        onSetError(cntErr.message)
        return
      }
      if ((count ?? 0) > 0) {
        onSetError('Nie można usunąć — przedmiot jest używany w zajęciach')
        return
      }
      const { error: delErr } = await supabase.from('subjects').delete().eq('id', subject.id)
      if (delErr) {
        onSetError(delErr.message)
        return
      }
      onDone()
    })
  }

  return (
    <div
      className="overflow-hidden rounded-[10px]"
      style={{ background: T.surface, border: '1px solid ' + T.cardBorder, opacity: subject.isActive ? 1 : 0.5 }}
    >
      <div className="flex items-center gap-3 px-4 py-2.5">
        <SubjectDot color={color} />
        <span className="flex-1 text-[13px] font-extrabold" style={{ color: T.text }}>
          {subject.name}
        </span>
        {!subject.isActive && (
          <span className="text-[9px]" style={{ color: T.textDim }}>
            nieaktywny
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-[6px] px-3 py-1 text-[9px] font-bold"
          style={
            isOpen
              ? { background: T.textDim + '30', color: T.textDim }
              : { background: T.primary + '12', color: T.primary }
          }
        >
          {isOpen ? 'Zwiń' : 'Edytuj'}
        </button>
      </div>
      {isOpen && (
        <div
          className="px-4 pb-3 pt-2.5"
          style={{ borderTop: '1px solid ' + T.cardBorder, paddingLeft: 40 }}
        >
          <div className="mb-2 flex items-end gap-2">
            <NewField label="Nazwa" value={name} onChange={setName} width={160} />
            <div>
              <div className="mb-0.5 text-[8px]" style={{ color: T.textDim }}>
                Kolor
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-7 w-9 cursor-pointer rounded-[6px] p-0"
                  style={{ border: '1px solid ' + T.cardBorder }}
                />
                <input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="rounded-[6px] px-2 py-[5px] text-[11px] outline-none"
                  style={{ width: 80, color: T.text, border: '1px solid ' + T.cardBorder, background: T.bg }}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <GreenBtn onClick={save} disabled={isPending}>
              {isPending ? 'Zapisywanie…' : 'Zapisz'}
            </GreenBtn>
            <button
              type="button"
              onClick={remove}
              disabled={isPending}
              className="rounded-[6px] px-4 py-1.5 text-[10px] font-bold disabled:opacity-50"
              style={{ background: T.danger + '12', color: T.danger }}
            >
              Usuń przedmiot
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Sekcja: Godziny pracy
// ════════════════════════════════════════════════════════════════════════════
type HoursRow = AdminSettingsData['workingHours']['lessons'][number]

function HoursTable({ data, label, color }: { data: HoursRow[]; label: string; color: string }) {
  return (
    <div className="flex-1">
      <div className="mb-2 text-[12px] font-extrabold" style={{ color }}>
        {label}
      </div>
      <div className="flex flex-col gap-1">
        {data.map((wh) => (
          <div
            key={wh.dayOfWeek}
            className="flex items-center gap-2 rounded-[6px] px-2.5 py-1.5"
            style={{
              background: T.surface,
              border: '1px solid ' + T.cardBorder,
              opacity: wh.isActive ? 1 : 0.5,
            }}
          >
            <input type="checkbox" checked={wh.isActive} readOnly style={{ accentColor: color }} />
            <span className="w-[90px] text-[11px] font-bold" style={{ color: T.text }}>
              {wh.dayFull}
            </span>
            {wh.isActive ? (
              <div className="flex items-center gap-1">
                <input
                  defaultValue={wh.openTime}
                  className="w-[52px] rounded-[5px] px-1.5 py-[3px] text-center text-[10px] font-bold outline-none"
                  style={{ color: T.text, border: '1px solid ' + T.cardBorder, background: T.bg }}
                />
                <span className="text-[9px]" style={{ color: T.textDim }}>
                  –
                </span>
                <input
                  defaultValue={wh.closeTime}
                  className="w-[52px] rounded-[5px] px-1.5 py-[3px] text-center text-[10px] font-bold outline-none"
                  style={{ color: T.text, border: '1px solid ' + T.cardBorder, background: T.bg }}
                />
              </div>
            ) : (
              <span className="text-[10px]" style={{ color: T.textDim }}>
                Nieczynne
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function HoursSection({ workingHours }: { workingHours: AdminSettingsData['workingHours'] }) {
  return (
    <div>
      <div className="mb-1.5 text-[16px] font-black" style={{ color: T.text }}>
        Godziny pracy centrum
      </div>
      <div className="mb-4 text-[10px]" style={{ color: T.textDim }}>
        Dwa osobne harmonogramy — godziny zajęć i godziny kontaktu telefonicznego
      </div>
      <div className="flex max-w-[700px] gap-6">
        <HoursTable data={workingHours.lessons} label="📚 Godziny zajęć (korepetycje)" color={T.primary} />
        <HoursTable data={workingHours.phone} label="📞 Kontakt telefoniczny" color={T.cyan} />
      </div>
      <SaveBtn>Zapisz godziny</SaveBtn>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Sekcja: Przypomnienia
// ════════════════════════════════════════════════════════════════════════════
function RemindersSection({ templates }: { templates: AdminSettingsData['reminderTemplates'] }) {
  const [editing, setEditing] = useState<string | null>(null)
  const autoEnabled = templates.some((t) => t.isEnabled)
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[16px] font-black" style={{ color: T.text }}>
          Przypomnienia o płatnościach
        </div>
        <Toggle checked={autoEnabled} label="Automatyczne wysyłanie" />
      </div>
      <div className="flex max-w-[650px] flex-col gap-2.5">
        {templates.map((s) => (
          <div
            key={s.id}
            className="rounded-[10px] px-4 py-3.5"
            style={{ background: T.surface, border: '1px solid ' + T.cardBorder }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={s.isEnabled} readOnly style={{ accentColor: T.primary }} />
                <span className="text-[12px] font-extrabold" style={{ color: T.text }}>
                  {s.label}
                </span>
                <span className="text-[9px]" style={{ color: T.textDim }}>
                  {'(' +
                    (s.sendDayOfMonth === 0 ? 'ostatni dzień' : s.sendDayOfMonth + '. dzień') +
                    ' o ' +
                    s.sendTime +
                    ')'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditing(editing === s.id ? null : s.id)}
                className="rounded-[6px] px-3 py-1 text-[9px] font-bold"
                style={{ background: T.primary + '12', color: T.primary }}
              >
                {editing === s.id ? 'Zwiń' : 'Edytuj szablon'}
              </button>
            </div>
            {editing === s.id ? (
              <div>
                <div className="mb-2 flex gap-2">
                  <div>
                    <div className="mb-0.5 text-[8px]" style={{ color: T.textDim }}>
                      Dzień miesiąca
                    </div>
                    <input
                      defaultValue={s.sendDayOfMonth === 0 ? 'ostatni' : String(s.sendDayOfMonth)}
                      className="w-[70px] rounded-[6px] px-2 py-1 text-[11px] font-bold outline-none"
                      style={{ color: T.text, border: '1px solid ' + T.cardBorder, background: T.bg }}
                    />
                  </div>
                  <div>
                    <div className="mb-0.5 text-[8px]" style={{ color: T.textDim }}>
                      Godzina wysyłki
                    </div>
                    <input
                      defaultValue={s.sendTime}
                      className="w-[70px] rounded-[6px] px-2 py-1 text-[11px] font-bold outline-none"
                      style={{ color: T.text, border: '1px solid ' + T.cardBorder, background: T.bg }}
                    />
                  </div>
                </div>
                <div className="mb-0.5 text-[8px]" style={{ color: T.textDim }}>
                  Temat wiadomości
                </div>
                <input
                  defaultValue={s.subjectTemplate}
                  className="mb-2 w-full rounded-[6px] px-2.5 py-1.5 text-[11px] outline-none"
                  style={{ color: T.text, border: '1px solid ' + T.cardBorder, background: T.bg }}
                />
                <div className="mb-0.5 text-[8px]" style={{ color: T.textDim }}>
                  Treść wiadomości
                </div>
                <textarea
                  defaultValue={s.bodyTemplate}
                  className="h-20 w-full resize-y rounded-[6px] px-2.5 py-2 text-[11px] outline-none"
                  style={{ color: T.text, border: '1px solid ' + T.cardBorder, background: T.bg }}
                />
                <div className="mt-1 text-[8px]" style={{ color: T.textDim }}>
                  {'Zmienne: {miesiąc}, {kwota}, {rodzic}, {uczeń}, {termin}'}
                </div>
                <GreenBtn>Zapisz szablon</GreenBtn>
              </div>
            ) : (
              <div
                className="rounded-[6px] px-2.5 py-2 text-[10px] leading-relaxed"
                style={{ color: T.textMuted, background: T.bg }}
              >
                {s.bodyTemplate}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Sekcja: Umowy
// ════════════════════════════════════════════════════════════════════════════
function ContractsSection({ terms }: { terms: AdminSettingsData['contractTerms'] }) {
  const rows = [
    { label: 'Termin płatności (dzień miesiąca)', value: terms.paymentDeadlineDay },
    { label: 'Minimalny okres umowy (miesiące)', value: terms.minContractMonths },
    { label: 'Wypowiedzenie umowy (dni)', value: terms.cancellationNoticeDays },
    { label: 'Termin na odrobienie (dni)', value: terms.makeupDeadlineDays },
    { label: 'Czas na wpis po lekcji (godziny)', value: terms.lateEntryHours },
    { label: 'Cutoff odwołań (godziny)', value: terms.cancellationHoursCutoff },
  ]
  return (
    <div>
      <div className="mb-4 text-[16px] font-black" style={{ color: T.text }}>
        Domyślne warunki umów
      </div>
      <div className="flex max-w-[500px] flex-col gap-2.5">
        {rows.map((f, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-[8px] px-3.5 py-2.5"
            style={{ background: T.surface, border: '1px solid ' + T.cardBorder }}
          >
            <span className="text-[11px] font-semibold" style={{ color: T.text }}>
              {f.label}
            </span>
            <input
              defaultValue={String(f.value)}
              className="w-[60px] rounded-[6px] px-2 py-1 text-center text-[12px] font-extrabold outline-none"
              style={{ color: T.tertiary, border: '1px solid ' + T.cardBorder, background: T.bg }}
            />
          </div>
        ))}
        <div
          className="rounded-[8px] px-3.5 py-2.5"
          style={{ background: T.surface, border: '1px solid ' + T.cardBorder }}
        >
          <div className="mb-1 text-[11px] font-semibold" style={{ color: T.text }}>
            Polityka no-show
          </div>
          <textarea
            defaultValue={terms.noShowPolicy}
            className="h-[60px] w-full resize-y rounded-[6px] px-2 py-1.5 text-[10px] outline-none"
            style={{ color: T.textMuted, border: '1px solid ' + T.cardBorder, background: T.bg }}
          />
        </div>
        <div
          className="rounded-[8px] px-3.5 py-2.5"
          style={{ background: T.surface, border: '1px solid ' + T.cardBorder }}
        >
          <div className="mb-1 text-[11px] font-semibold" style={{ color: T.text }}>
            Polityka odwołań
          </div>
          <textarea
            defaultValue={terms.cancellationPolicy}
            className="h-[60px] w-full resize-y rounded-[6px] px-2 py-1.5 text-[10px] outline-none"
            style={{ color: T.textMuted, border: '1px solid ' + T.cardBorder, background: T.bg }}
          />
        </div>
      </div>
      <SaveBtn>Zapisz warunki</SaveBtn>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Sekcja: Konta
// ════════════════════════════════════════════════════════════════════════════
function AccountsSection({
  accounts,
  userAccounts,
}: {
  accounts: AdminSettingsData['accounts']
  userAccounts: AdminSettingsData['userAccounts']
}) {
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [view, setView] = useState<'staff' | 'users'>('staff')
  const roles: Enums<'user_role'>[] = ['admin', 'tutor']

  function initialsOf(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <div>
      {/* Przełącznik: konta administracyjne vs. rodzice/uczniowie */}
      <div className="mb-4 flex gap-1.5">
        {(
          [
            { id: 'staff', label: 'Administracja' },
            { id: 'users', label: 'Rodzice i uczniowie' },
          ] as const
        ).map((tab) => {
          const isActive = view === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              className="rounded-[8px] px-3.5 py-1.5 text-[11px] font-bold transition-colors"
              style={{
                background: isActive ? T.primary + '20' : T.surface,
                color: isActive ? T.primary : T.textMuted,
                border: '1px solid ' + (isActive ? T.primary + '40' : T.cardBorder),
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {view === 'users' && <UserAccountsBlock userAccounts={userAccounts} />}

      {view === 'staff' && (
        <>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[16px] font-black" style={{ color: T.text }}>
          Konta administracyjne
        </div>
        <button
          type="button"
          onClick={() => setAdding(!adding)}
          className="rounded-[8px] px-3.5 py-1.5 text-[10px] font-bold text-white"
          style={{ background: adding ? T.textDim : T.primary }}
        >
          {adding ? 'Anuluj' : '+ Dodaj konto'}
        </button>
      </div>
      {adding && (
        <div
          className="mb-2.5 max-w-[600px] rounded-[10px] px-4 py-3.5"
          style={{ background: T.surface, border: '1px dashed ' + T.primary + '50' }}
        >
          <div className="mb-2 text-[11px] font-extrabold" style={{ color: T.primary }}>
            Nowe konto
          </div>
          <div className="mb-2 flex flex-wrap gap-2">
            <NewField label="Imię i nazwisko" placeholder="Jan Kowalski" width={160} />
            <NewField label="Email" placeholder="jan@edu-luz.pl" width={180} />
            <div>
              <div className="mb-0.5 text-[8px]" style={{ color: T.textDim }}>
                Rola
              </div>
              <select
                defaultValue="tutor"
                className="rounded-[6px] px-2 py-1.5 text-[11px] outline-none"
                style={{ color: T.text, border: '1px solid ' + T.cardBorder, background: T.bg }}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-0.5 text-[8px]" style={{ color: T.textDim }}>
                Hasło tymczasowe
              </div>
              <input
                type="password"
                placeholder="••••••"
                className="w-[120px] rounded-[6px] px-2 py-1.5 text-[11px] outline-none"
                style={{ color: T.text, border: '1px solid ' + T.cardBorder, background: T.bg }}
              />
            </div>
          </div>
          <GreenBtn>Utwórz konto</GreenBtn>
        </div>
      )}
      <div className="flex max-w-[600px] flex-col gap-2">
        {accounts.map((a) => (
          <div
            key={a.id}
            className="overflow-hidden rounded-[10px]"
            style={{ background: T.surface, border: '1px solid ' + T.cardBorder, opacity: a.isActive ? 1 : 0.5 }}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-extrabold"
                style={{ background: T.accent + '20', color: T.accent }}
              >
                {initialsOf(a.fullName)}
              </div>
              <div className="flex-1">
                <div className="text-[12px] font-bold" style={{ color: T.text }}>
                  {a.fullName}
                </div>
                <div className="text-[9px]" style={{ color: T.textDim }}>
                  {(a.email ?? '— bez emaila —') +
                    ' · ' +
                    ROLE_LABEL[a.role] +
                    ' · Ostatnie logowanie: ' +
                    formatLogin(a.lastLoginAt)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditId(editId === a.id ? null : a.id)}
                className="rounded-[6px] px-3 py-1 text-[9px] font-bold"
                style={
                  editId === a.id
                    ? { background: T.textDim + '30', color: T.textDim }
                    : { background: T.primary + '12', color: T.primary }
                }
              >
                {editId === a.id ? 'Zwiń' : 'Edytuj'}
              </button>
            </div>
            {editId === a.id && (
              <div
                className="px-4 pb-3.5 pt-3"
                style={{ borderTop: '1px solid ' + T.cardBorder, paddingLeft: 64 }}
              >
                <div className="mb-2 flex flex-wrap gap-2">
                  <NewField label="Imię i nazwisko" value={a.fullName} width={160} />
                  <NewField label="Email" value={a.email ?? ''} width={180} />
                  <div>
                    <div className="mb-0.5 text-[8px]" style={{ color: T.textDim }}>
                      Rola
                    </div>
                    <select
                      defaultValue={a.role}
                      className="rounded-[6px] px-2 py-1.5 text-[11px] outline-none"
                      style={{ color: T.text, border: '1px solid ' + T.cardBorder, background: T.bg }}
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <GreenBtn>Zapisz</GreenBtn>
                  <button
                    type="button"
                    className="rounded-[6px] px-4 py-1.5 text-[10px] font-bold"
                    style={{ background: T.tertiary + '15', color: T.tertiary }}
                  >
                    Resetuj hasło
                  </button>
                  <button
                    type="button"
                    className="rounded-[6px] px-4 py-1.5 text-[10px] font-bold"
                    style={{ background: T.danger + '12', color: T.danger }}
                  >
                    Usuń konto
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  )
}

function formatLogin(iso: string | null): string {
  if (!iso) return 'nigdy'
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ────────────────────────────────────────────────────────────────────────────
// Konta rodziców i uczniów — podgląd read-only z wyszukiwarką
// ────────────────────────────────────────────────────────────────────────────
const USER_ROLE_LABEL: Partial<Record<Enums<'user_role'>, string>> = {
  parent: 'Rodzic',
  student: 'Uczeń',
}

function formatCreatedAt(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}

function UserAccountsBlock({
  userAccounts,
}: {
  userAccounts: AdminSettingsData['userAccounts']
}) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const filtered = q
    ? userAccounts.filter(
        (a) =>
          a.fullName.toLowerCase().includes(q) ||
          (a.email ?? '').toLowerCase().includes(q),
      )
    : userAccounts

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="text-[16px] font-black" style={{ color: T.text }}>
          {'Rodzice i uczniowie (' + userAccounts.length + ')'}
        </div>
      </div>
      <div className="mb-3 text-[10px]" style={{ color: T.textDim }}>
        Podgląd kont. Zarządzanie kontami w osobnej iteracji.
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Szukaj po imieniu lub emailu…"
        className="mb-3 w-full max-w-[600px] rounded-[8px] px-3 py-2 text-[12px] outline-none"
        style={{ color: T.text, border: '1px solid ' + T.cardBorder, background: T.bg }}
      />
      <div className="max-w-[600px] overflow-hidden rounded-[10px]" style={{ border: '1px solid ' + T.cardBorder }}>
        <div
          className="flex gap-2 px-3.5 py-2"
          style={{ background: T.surface, borderBottom: '1px solid ' + T.cardBorder }}
        >
          <span className="flex-1 text-[10px] font-bold" style={{ color: T.textDim }}>
            Imię i nazwisko
          </span>
          <span className="w-[170px] text-[10px] font-bold" style={{ color: T.textDim }}>
            Email
          </span>
          <span className="w-[70px] text-[10px] font-bold" style={{ color: T.textDim }}>
            Rola
          </span>
          <span className="w-[80px] text-right text-[10px] font-bold" style={{ color: T.textDim }}>
            Utworzono
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="px-3.5 py-4 text-center text-[11px]" style={{ color: T.textDim }}>
            Brak kont spełniających kryteria.
          </div>
        ) : (
          filtered.map((a, i) => (
            <div
              key={a.id}
              className="flex items-center gap-2 px-3.5 py-2"
              style={{ background: i % 2 === 0 ? 'transparent' : T.surface }}
            >
              <span className="flex-1 truncate text-[12px] font-semibold" style={{ color: T.text }}>
                {a.fullName}
              </span>
              <span className="w-[170px] truncate text-[11px]" style={{ color: T.textMuted }}>
                {a.email ?? '—'}
              </span>
              <span className="w-[70px] text-[11px] font-bold" style={{ color: a.role === 'parent' ? T.accent : T.cyan }}>
                {USER_ROLE_LABEL[a.role] ?? a.role}
              </span>
              <span className="w-[80px] text-right text-[10px]" style={{ color: T.textDim }}>
                {formatCreatedAt(a.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Sekcja: Powiadomienia (wizualna — brak w AdminSettingsData)
// ════════════════════════════════════════════════════════════════════════════
function NotificationsSection() {
  return (
    <div>
      <div className="mb-1.5 text-[16px] font-black" style={{ color: T.text }}>
        Powiadomienia
      </div>
      <div className="mb-4 text-[10px]" style={{ color: T.textDim }}>
        Jakie zdarzenia wywołują powiadomienia dla administratora
      </div>
      <div className="max-w-[550px]">
        <div
          className="mb-1 flex gap-2 px-3 py-1.5"
          style={{ borderBottom: '1px solid ' + T.cardBorder }}
        >
          <span className="flex-1 text-[10px] font-bold" style={{ color: T.textDim }}>
            Zdarzenie
          </span>
          <span className="w-[60px] text-center text-[10px] font-bold" style={{ color: T.textDim }}>
            Email
          </span>
          <span className="w-[60px] text-center text-[10px] font-bold" style={{ color: T.textDim }}>
            Push
          </span>
        </div>
        {notifSettings.map((n, i) => (
          <div
            key={n.id}
            className="flex items-center gap-2 rounded-[6px] px-3 py-2"
            style={{ background: i % 2 === 0 ? T.surface : 'transparent' }}
          >
            <span className="flex-1 text-[11px] font-semibold" style={{ color: T.text }}>
              {n.label}
            </span>
            <div className="flex w-[60px] justify-center">
              <input type="checkbox" checked={n.email} readOnly style={{ accentColor: T.primary }} />
            </div>
            <div className="flex w-[60px] justify-center">
              <input type="checkbox" checked={n.push} readOnly style={{ accentColor: T.primary }} />
            </div>
          </div>
        ))}
      </div>
      <SaveBtn>Zapisz ustawienia</SaveBtn>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Drobne komponenty pomocnicze
// ════════════════════════════════════════════════════════════════════════════
function NewField({
  label,
  value,
  placeholder,
  width,
  center,
  onChange,
}: {
  label: string
  value?: string
  placeholder?: string
  width: number
  center?: boolean
  /** Jeśli podane → pole kontrolowane (CRUD); inaczej tylko prezentacja. */
  onChange?: (value: string) => void
}) {
  return (
    <div>
      <div className="mb-0.5 text-[8px]" style={{ color: T.textDim }}>
        {label}
      </div>
      {onChange ? (
        <input
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={'rounded-[6px] px-2 py-[5px] text-[11px] outline-none' + (center ? ' text-center' : '')}
          style={{ width, color: T.text, border: '1px solid ' + T.cardBorder, background: T.bg }}
        />
      ) : (
        <input
          defaultValue={value}
          placeholder={placeholder}
          className={'rounded-[6px] px-2 py-[5px] text-[11px] outline-none' + (center ? ' text-center' : '')}
          style={{ width, color: T.text, border: '1px solid ' + T.cardBorder, background: T.bg }}
        />
      )}
    </div>
  )
}

function GreenBtn({
  children,
  onClick,
  disabled,
}: {
  children: string
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-[6px] px-4 py-1.5 text-[10px] font-bold text-white disabled:opacity-50"
      style={{ background: T.success }}
    >
      {children}
    </button>
  )
}
