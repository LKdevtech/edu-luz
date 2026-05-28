import { getCurrentAdminId } from '@/lib/auth/getCurrentAdminId'
import { AdminStudentsView } from '@/lib/components/panel/admin/AdminStudentsView'
import { getAdminStudents, getAdminTutors } from '@/lib/queries/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminStudentsPage() {
  const adminId = await getCurrentAdminId()
  const supabase = createSupabaseServerClient()

  const [data, tutorsData, roomsResult] = await Promise.all([
    getAdminStudents(supabase),
    getAdminTutors(supabase),
    supabase.from('rooms').select('id, name').eq('is_active', true).order('name'),
  ])
  if (roomsResult.error) throw roomsResult.error

  const availableStudents = data.students.map((s) => ({
    id: s.id,
    fullName: s.fullName,
    schoolClass: s.schoolClass,
    level: s.levelLabel,
  }))
  const tutorsForActions = tutorsData.tutors.map((t) => ({ id: t.id, fullName: t.fullName }))

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <header className="mb-4">
        <h1 className="text-[20px] font-black text-primary">Uczniowie i grupy</h1>
      </header>

      <AdminStudentsView
        students={data.students}
        groups={data.groups}
        adminId={adminId}
        availableStudents={availableStudents}
        parents={data.parents}
        subjects={tutorsData.subjects}
        tutors={tutorsForActions}
        rooms={roomsResult.data ?? []}
      />
    </div>
  )
}
