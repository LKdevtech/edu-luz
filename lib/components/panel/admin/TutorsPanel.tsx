'use client'

import { useMemo, useState } from 'react'

import type { AdminTutorEnriched } from './AdminTutorsEnriched'
import { FormField, GhostBtn, Modal, PrimaryBtn, TextInput } from './Modal'
import { TutorCard } from './TutorCard'

const T = {
  surface: '#232840',
  text: '#F0EDE6',
  textMuted: '#9B97AF',
  textDim: '#6B6780',
  primary: '#3B8FF0',
  success: '#22C55E',
  danger: '#EF4444',
  cyan: '#06B6D4',
  cardBorder: 'rgba(59,143,240,0.10)',
}

const SUBJECT_COLOR: Record<string, string> = {
  Matematyka: '#3B8FF0',
  Angielski: '#06B6D4',
  Fizyka: '#F59E0B',
  Chemia: '#22C55E',
  Polski: '#E84393',
  Elektrotechnika: '#FF6F4A',
}

type TutorsPanelProps = {
  tutors: AdminTutorEnriched[]
  subjects: Array<{ id: string; name: string; color: string }>
  adminId: string
}

export function TutorsPanel({ tutors, subjects, adminId }: TutorsPanelProps) {
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [addOpen, setAddOpen] = useState(false)

  const allSubjects = useMemo(() => {
    const used = new Set<string>()
    for (const t of tutors) for (const s of t.subjects) used.add(s)
    // zachowaj kolejność z listy przedmiotów systemu, ale tylko te faktycznie używane
    const ordered = subjects.map((s) => s.name).filter((n) => used.has(n))
    for (const u of Array.from(used)) if (!ordered.includes(u)) ordered.push(u)
    return ordered
  }, [tutors, subjects])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tutors.filter((t) => {
      const matchSearch = !q || t.fullName.toLowerCase().includes(q)
      const matchSubject = filterSubject === 'all' || t.subjects.includes(filterSubject)
      return matchSearch && matchSubject
    })
  }, [tutors, search, filterSubject])

  const absentCount = tutors.filter((t) => !t.isActive || t.isAbsentNow).length
  const totalStudents = tutors.reduce((s, t) => s + t.studentsIndiv + t.groupStudents, 0)
  const totalWeekLessons = tutors.reduce((s, t) => s + t.lessonsPerWeek, 0)

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {/* ── Pasek podsumowania ── */}
      <div className="mb-4 flex flex-wrap gap-4">
        <SummaryStat value={tutors.length} label="Korepetytorzy" color={T.text} />
        <SummaryStat value={tutors.length - absentCount} label="Aktywni" color={T.success} />
        <SummaryStat value={absentCount} label="Nieobecni" color={T.danger} />
        <SummaryStat value={totalStudents} label="Uczniów łącznie" color={T.cyan} />
        <SummaryStat value={totalWeekLessons} label="Lekcji / tydzień" color={T.primary} />
      </div>

      {/* ── Pasek filtrów ── */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj korepetytora..."
          className="w-[240px] rounded-[8px] px-3.5 py-[7px] text-[12px] outline-none"
          style={{ background: T.surface, color: T.text, border: `1px solid ${T.cardBorder}` }}
        />
        <div className="flex flex-wrap gap-0.5 rounded-[8px] p-0.5" style={{ background: T.surface }}>
          <FilterChip
            label="Wszyscy"
            active={filterSubject === 'all'}
            color={T.primary}
            onClick={() => setFilterSubject('all')}
          />
          {allSubjects.map((s) => (
            <FilterChip
              key={s}
              label={s}
              active={filterSubject === s}
              color={SUBJECT_COLOR[s] ?? T.primary}
              onClick={() => setFilterSubject(s)}
            />
          ))}
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="rounded-[8px] px-4 py-[7px] text-[11px] font-bold text-white transition-all hover:brightness-110"
          style={{ background: T.primary }}
        >
          + Dodaj korepetytora
        </button>
      </div>

      {/* ── Lista korepetytorów ── */}
      <div className="flex flex-col gap-2.5">
        {filtered.map((t) => (
          <TutorCard key={t.id} tutor={t} adminId={adminId} />
        ))}
        {filtered.length === 0 && (
          <div className="py-10 text-center text-[13px]" style={{ color: T.textDim }}>
            Brak korepetytorów spełniających kryteria
          </div>
        )}
      </div>

      <AddTutorModal open={addOpen} onClose={() => setAddOpen(false)} subjects={subjects} />
    </div>
  )
}

function SummaryStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-[10px] px-4 py-2.5"
      style={{ background: T.surface, border: `1px solid ${T.cardBorder}` }}
    >
      <span className="text-[18px] font-black" style={{ color }}>
        {value}
      </span>
      <span className="text-[10px]" style={{ color: T.textDim }}>
        {label}
      </span>
    </div>
  )
}

function FilterChip({
  label,
  active,
  color,
  onClick,
}: {
  label: string
  active: boolean
  color: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[6px] px-2.5 py-[5px] text-[10px] transition-colors"
      style={{
        background: active ? color : 'transparent',
        color: active ? '#fff' : T.textMuted,
        fontWeight: active ? 800 : 500,
      }}
    >
      {label}
    </button>
  )
}

// ── Dodaj korepetytora (poglądowy — utworzenie konta wymaga osobnej procedury auth) ──

function AddTutorModal({
  open,
  onClose,
  subjects,
}: {
  open: boolean
  onClose: () => void
  subjects: Array<{ id: string; name: string; color: string }>
}) {
  // Wybrane przedmioty (multi-select) — korepetytor może uczyć kilku przedmiotów.
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  function toggleSubject(id: string) {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  function handleClose() {
    setSelectedSubjects([])
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Dodaj korepetytora" icon="👨‍🏫" width={560}>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Imię" required>
          <TextInput placeholder="np. Tomasz" />
        </FormField>
        <FormField label="Nazwisko" required>
          <TextInput placeholder="np. Krawczyk" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Telefon">
          <TextInput placeholder="601 234 567" />
        </FormField>
        <FormField label="Email" required>
          <TextInput type="email" placeholder="t.krawczyk@edu-luz.pl" />
        </FormField>
      </div>
      <FormField label="Przedmioty" required>
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((s) => {
            const color = SUBJECT_COLOR[s.name] ?? s.color ?? T.primary
            const active = selectedSubjects.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSubject(s.id)}
                className="rounded-full px-3 py-1.5 text-[11px] font-bold transition-all"
                style={{
                  background: active ? `${color}22` : T.surface,
                  color: active ? color : T.textMuted,
                  border: `1px solid ${active ? `${color}55` : T.cardBorder}`,
                }}
              >
                {active ? '✓ ' : ''}
                {s.name}
              </button>
            )
          })}
        </div>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Stawka indyw. (zł/h)" required>
          <TextInput type="number" placeholder="np. 70" />
        </FormField>
        <FormField label="Stawka grupa (zł/h)" required>
          <TextInput type="number" placeholder="np. 50" />
        </FormField>
      </div>
      <div
        className="mb-3 rounded-[8px] px-3 py-2.5 text-[11px] font-semibold"
        style={{ background: `${T.primary}08`, border: `1px solid ${T.primary}15`, color: T.primary }}
      >
        ℹ Utworzenie korepetytora wymaga założenia konta logowania — formularz jest na razie
        poglądowy i nie zapisuje danych.
      </div>
      <div className="flex justify-end gap-2 border-t border-subtle pt-4">
        <GhostBtn onClick={handleClose}>Anuluj</GhostBtn>
        <PrimaryBtn color={T.success} onClick={handleClose}>
          ✓ Dodaj korepetytora
        </PrimaryBtn>
      </div>
    </Modal>
  )
}
