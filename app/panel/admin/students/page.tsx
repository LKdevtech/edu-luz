import Link from 'next/link'

import { getCurrentAdminId } from '@/lib/auth/getCurrentAdminId'
import { GroupCard } from '@/lib/components/panel/admin/GroupCard'
import { LevelBadge, SubjectDot } from '@/lib/components/panel/Badges'
import { getAdminStudents, type AdminStudentRow } from '@/lib/queries/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type SearchParams = { tab?: string }

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const adminId = await getCurrentAdminId()
  const supabase = createSupabaseServerClient()
  const data = await getAdminStudents(supabase)
  const tab = searchParams.tab === 'groups' ? 'groups' : 'students'

  const availableStudents = data.students.map((s) => ({
    id: s.id,
    fullName: s.fullName,
    schoolClass: s.schoolClass,
    level: s.levelLabel,
  }))

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-black text-primary">Uczniowie i grupy</h1>
          <p className="text-[12px] text-dim">
            {data.students.length} uczniów · {data.groups.length} aktywnych grup
          </p>
        </div>
      </header>

      <nav className="mb-5 flex gap-2 border-b border-subtle">
        <TabLink active={tab === 'students'} href="?tab=students" label={`Uczniowie (${data.students.length})`} />
        <TabLink active={tab === 'groups'} href="?tab=groups" label={`Grupy (${data.groups.length})`} />
      </nav>

      {tab === 'students' && (
        <>
          {data.students.length === 0 ? (
            <div className="rounded-card bg-surface p-10 text-center text-[13px] text-dim">
              {'Brak uczniów. Użyj „Dodaj ucznia" z dashboardu.'}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data.students.map((s) => (
                <StudentCard key={s.id} student={s} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'groups' && (
        <>
          {data.groups.length === 0 ? (
            <div className="rounded-card bg-surface p-10 text-center text-[13px] text-dim">
              {'Brak aktywnych grup. Użyj „Nowa grupa" z dashboardu.'}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data.groups.map((g) => (
                <GroupCard
                  key={g.id}
                  group={g}
                  adminId={adminId}
                  availableStudents={availableStudents}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TabLink({ active, href, label }: { active: boolean; href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-5 py-2.5 text-[13px] transition-colors"
      style={{
        borderBottom: active ? '2px solid #3B8FF0' : '2px solid transparent',
        marginBottom: '-1px',
        color: active ? '#3B8FF0' : '#9B97AF',
        fontWeight: active ? 800 : 600,
      }}
    >
      {label}
    </Link>
  )
}

function StudentCard({ student }: { student: AdminStudentRow }) {
  return (
    <details
      className="rounded-card bg-surface"
      style={{ border: '1px solid rgba(59,143,240,0.10)' }}
    >
      <summary className="flex cursor-pointer items-center gap-4 p-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-[11px] text-[15px] font-extrabold"
          style={{ backgroundColor: `${student.avatarColor}29`, color: student.avatarColor }}
        >
          {student.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-extrabold text-primary">{student.fullName}</span>
            <LevelBadge level={student.level} label={student.levelLabel} />
          </div>
          <div className="text-[11px] text-secondary">
            {student.schoolClass} · Rodzic: {student.parentName}
            {student.parentPhone && ` · ${student.parentPhone}`}
          </div>
          <div className="mt-0.5 text-[11px] text-dim">
            {student.classes.length}{' '}
            {student.classes.length === 1 ? 'zajęcia' : 'zajęć'} · {formatAmount(student.totalMonthly)} zł/msc
          </div>
        </div>
        <span aria-hidden className="text-[12px] text-dim">
          ▼
        </span>
      </summary>

      <div className="border-t border-subtle p-4">
        {student.classes.length === 0 ? (
          <p className="text-[12px] italic text-dim">Brak zajęć.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {student.classes.map((c) => (
              <div
                key={c.classId}
                className="flex items-center justify-between gap-3 rounded-[10px] bg-alt p-3"
                style={{ borderLeft: `3px solid ${c.subjectColor}` }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <SubjectDot color={c.subjectColor} />
                    <span className="text-[13px] font-extrabold text-primary">{c.subjectName}</span>
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase"
                      style={
                        c.form === 'group'
                          ? { backgroundColor: '#7C5CFC22', color: '#7C5CFC' }
                          : { backgroundColor: '#3B8FF022', color: '#3B8FF0' }
                      }
                    >
                      {c.form === 'group' ? `GRUPA${c.groupName ? ` · ${c.groupName}` : ''}` : 'INDYW.'}
                    </span>
                  </div>
                  <div className="text-[11px] text-secondary">{c.tutorName}</div>
                </div>
                <span className="text-[13px] font-extrabold text-primary">
                  {formatAmount(c.monthlyFee)} zł/msc
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </details>
  )
}

function formatAmount(n: number): string {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(n)
}
