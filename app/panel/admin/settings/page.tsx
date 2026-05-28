import { AdminSettingsPanel } from '@/lib/components/panel/admin/AdminSettingsPanel'
import { getAdminSettings } from '@/lib/queries/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const supabase = createSupabaseServerClient()
  const data = await getAdminSettings(supabase)

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <AdminSettingsPanel data={data} />
    </div>
  )
}
