'use client'

import { useMemo, useState } from 'react'

import type { AdminGroupRow, AdminStudentRow } from '@/lib/queries/admin'

import { AdminStudentCard } from './AdminStudentCard'
import { GroupCard } from './GroupCard'
import {
  StudentsAddStudentModal,
  StudentsNewGroupModal,
  type SubjectOpt,
} from './AdminStudentsModals'

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

type StudentOpt = { id: string; fullName: string; schoolClass: string; level: string }
type ParentOpt = { id: string; fullName: string; phone: string | null }
type TutorOpt = { id: string; fullName: string }
type RoomOpt = { id: string; name: string }

type AdminStudentsViewProps = {
  students: AdminStudentRow[]
  groups: AdminGroupRow[]
  adminId: string
  availableStudents: StudentOpt[]
  parents: ParentOpt[]
  subjects: SubjectOpt[]
  tutors: TutorOpt[]
  rooms: RoomOpt[]
}

export function AdminStudentsView({
  students,
  groups,
  adminId,
  availableStudents,
  parents,
  subjects,
  tutors,
  rooms,
}: AdminStudentsViewProps) {
  const [tab, setTab] = useState<'students' | 'groups'>('students')
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState<'all' | string>('all')
  const [filterPay, setFilterPay] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')
  const [modal, setModal] = useState<null | 'student' | 'group'>(null)

  // Map: studentId → grupy, do których należy (z pełnymi danymi grupy)
  const groupsByStudent = useMemo(() => {
    const map = new Map<string, AdminGroupRow[]>()
    for (const g of groups) {
      for (const m of g.members) {
        const arr = map.get(m.id) ?? []
        arr.push(g)
        map.set(m.id, arr)
      }
    }
    return map
  }, [groups])

  const allSubjects = useMemo(
    () =>
      Array.from(new Set(students.flatMap((s) => s.classes.map((c) => c.subjectName)))).sort(),
    [students],
  )

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase()
    return students.filter((s) => {
      const matchSearch =
        q.length === 0 ||
        s.fullName.toLowerCase().includes(q) ||
        s.parentName.toLowerCase().includes(q)
      const matchSubject =
        filterSubject === 'all' || s.classes.some((c) => c.subjectName === filterSubject)
      const matchPay =
        filterPay === 'all' ||
        (filterPay === 'paid'
          ? s.payStatus === 'paid' || s.payStatus === 'paid_late'
          : s.payStatus === filterPay)
      return matchSearch && matchSubject && matchPay
    })
  }, [students, search, filterSubject, filterPay])

  const individualCount = students.filter((s) => groupsByStudent.has(s.id) === false).length
  const inGroupsCount = students.length - individualCount

  const summary = [
    { label: 'Uczniów', v: students.length, c: TEXT },
    { label: 'Grup', v: groups.length, c: '#7C5CFC' },
    { label: 'Tylko indyw.', v: individualCount, c: '#22C55E' },
    { label: 'W grupach', v: inGroupsCount, c: '#06B6D4' },
  ]

  return (
    <div>
      {/* ── Summary ── */}
      <div className="mb-3.5 flex flex-wrap gap-3">
        {summary.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-1.5 rounded-[10px] px-3.5 py-2"
            style={{ background: '#232840', border: '1px solid rgba(59,143,240,0.10)' }}
          >
            <span className="text-[16px] font-black" style={{ color: s.c }}>
              {s.v}
            </span>
            <span className="text-[9px]" style={{ color: TEXT_DIM }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Tab + filters ── */}
      <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
        <div className="flex gap-0.5 rounded-[8px] p-0.5" style={{ background: '#232840' }}>
          {(
            [
              ['students', `Uczniowie (${students.length})`],
              ['groups', `Grupy (${groups.length})`],
            ] as const
          ).map(([k, lb]) => {
            const isActive = tab === k
            return (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className="rounded-[6px] px-3.5 py-1.5 text-[11px] transition-all"
                style={{
                  fontWeight: isActive ? 800 : 500,
                  background: isActive ? '#3B8FF0' : 'transparent',
                  color: isActive ? '#fff' : '#9B97AF',
                }}
              >
                {lb}
              </button>
            )
          })}
        </div>

        {tab === 'students' && (
          <>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj ucznia lub rodzica..."
              className="w-[220px] rounded-[8px] px-3 py-1.5 text-[11px] outline-none"
              style={{
                background: '#232840',
                border: '1px solid rgba(59,143,240,0.10)',
                color: TEXT,
              }}
            />
            <div className="flex flex-wrap gap-0.5 rounded-[8px] p-0.5" style={{ background: '#232840' }}>
              <FilterPill
                active={filterSubject === 'all'}
                label="Wszystkie"
                color="#3B8FF0"
                onClick={() => setFilterSubject('all')}
              />
              {allSubjects.map((sub) => (
                <FilterPill
                  key={sub}
                  active={filterSubject === sub}
                  label={sub}
                  color={SUBJECT_COLOR[sub] ?? '#3B8FF0'}
                  onClick={() => setFilterSubject(sub)}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-0.5 rounded-[8px] p-0.5" style={{ background: '#232840' }}>
              {(
                [
                  ['all', 'Wszyscy', '#3B8FF0'],
                  ['paid', 'Opłacone', '#22C55E'],
                  ['pending', 'Oczekuje', '#FFCA28'],
                  ['overdue', 'Zaległe', '#EF4444'],
                ] as const
              ).map(([k, lb, color]) => (
                <FilterPill
                  key={k}
                  active={filterPay === k}
                  label={lb}
                  color={color}
                  onClick={() => setFilterPay(k)}
                />
              ))}
            </div>
            <div className="ml-auto" />
            <button
              type="button"
              onClick={() => setModal('student')}
              className="rounded-[8px] px-3.5 py-1.5 text-[10px] font-bold text-white transition-all hover:brightness-110"
              style={{ background: '#3B8FF0' }}
            >
              + Dodaj ucznia
            </button>
          </>
        )}

        {tab === 'groups' && (
          <>
            <div className="ml-auto" />
            <button
              type="button"
              onClick={() => setModal('group')}
              className="rounded-[8px] px-3.5 py-1.5 text-[10px] font-bold text-white transition-all hover:brightness-110"
              style={{ background: '#7C5CFC' }}
            >
              + Nowa grupa
            </button>
          </>
        )}
      </div>

      {/* ── Content ── */}
      {tab === 'students' && (
        <div className="flex flex-col gap-2">
          {filteredStudents.map((s) => (
            <AdminStudentCard
              key={s.id}
              student={s}
              studentGroups={groupsByStudent.get(s.id) ?? []}
              adminId={adminId}
            />
          ))}
          {filteredStudents.length === 0 && (
            <div className="py-10 text-center text-[12px]" style={{ color: TEXT_DIM }}>
              Brak uczniów spełniających kryteria
            </div>
          )}
        </div>
      )}

      {tab === 'groups' && (
        <div className="flex flex-col gap-2">
          {groups.map((g) => (
            <GroupCard
              key={g.id}
              group={g}
              adminId={adminId}
              availableStudents={availableStudents}
            />
          ))}
          {groups.length === 0 && (
            <div className="py-10 text-center text-[12px]" style={{ color: TEXT_DIM }}>
              Brak aktywnych grup
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <StudentsAddStudentModal
        open={modal === 'student'}
        onClose={() => setModal(null)}
        parents={parents}
        subjects={subjects}
        tutors={tutors}
      />
      <StudentsNewGroupModal
        open={modal === 'group'}
        onClose={() => setModal(null)}
        adminId={adminId}
        students={availableStudents}
        subjects={subjects}
        tutors={tutors}
        rooms={rooms}
      />
    </div>
  )
}

function FilterPill({
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
      className="rounded-[6px] px-2 py-1 text-[9px] transition-all"
      style={{
        fontWeight: active ? 800 : 500,
        background: active ? color : 'transparent',
        color: active ? '#fff' : '#9B97AF',
      }}
    >
      {label}
    </button>
  )
}
