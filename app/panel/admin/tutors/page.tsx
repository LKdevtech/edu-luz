import { getAdminTutorsEnriched } from '@/lib/components/panel/admin/AdminTutorsEnriched'
import { TutorsPanel } from '@/lib/components/panel/admin/TutorsPanel'
import { getCurrentAdminId } from '@/lib/auth/getCurrentAdminId'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminTutorsPage() {
  const adminId = await getCurrentAdminId()
  const supabase = createSupabaseServerClient()
  const data = await getAdminTutorsEnriched(supabase)

  return <TutorsPanel tutors={data.tutors} subjects={data.subjects} adminId={adminId} />
}
