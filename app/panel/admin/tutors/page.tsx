import { getCurrentAdminId } from '@/lib/auth/getCurrentAdminId'
import { TutorCard } from '@/lib/components/panel/admin/TutorCard'
import { getAdminTutors } from '@/lib/queries/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminTutorsPage() {
  const adminId = await getCurrentAdminId()
  const supabase = createSupabaseServerClient()
  const data = await getAdminTutors(supabase)

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <header className="mb-5">
        <h1 className="text-[20px] font-black text-primary">Korepetytorzy</h1>
        <p className="text-[12px] text-dim">
          {data.tutors.length} {pluralize(data.tutors.length, ['korepetytor', 'korepetytorów', 'korepetytorów'])}{' '}
          · Zarządzaj stawkami, nieobecnościami i pobieraj rejestry godzin
        </p>
      </header>

      {data.tutors.length === 0 ? (
        <div className="rounded-card bg-surface p-10 text-center text-[13px] text-dim">
          Brak zarejestrowanych korepetytorów.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.tutors.map((t) => (
            <TutorCard key={t.id} tutor={t} adminId={adminId} />
          ))}
        </div>
      )}
    </div>
  )
}

function pluralize(n: number, forms: [string, string, string]): string {
  if (n === 1) return forms[0]
  const lastTwo = n % 100
  if (lastTwo >= 12 && lastTwo <= 14) return forms[2]
  const last = n % 10
  if (last >= 2 && last <= 4) return forms[1]
  return forms[2]
}
