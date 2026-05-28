import Link from 'next/link'

import { AdminJournalList } from '@/lib/components/panel/admin/AdminJournalList'
import { getAdminJournal } from '@/lib/queries/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type SearchParams = { tutor?: string }

export default async function AdminLessonsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createSupabaseServerClient()
  const selectedTutor = searchParams.tutor
  const data = await getAdminJournal(supabase, selectedTutor)

  // Bezpieczeństwo: jeśli ?tutor wskazuje na nieistniejącego korepetytora,
  // traktuj jak "Wszyscy" (brak aktywnego filtra).
  const activeTutorId =
    selectedTutor && data.tutors.some((t) => t.id === selectedTutor) ? selectedTutor : undefined

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <header className="mb-5">
        <h1 className="text-[20px] font-black text-primary">Dziennik wpisów</h1>
        <p className="text-[12px] text-dim">
          Wpisy zrealizowanych lekcji wszystkich korepetytorów (ostatnie 60 dni). Filtruj po
          korepetytorze, podejrzyj notatki wewnętrzne i punkty karne.
        </p>
      </header>

      {/* ── Pasek filtra ── */}
      <div className="mb-5 flex flex-wrap gap-2">
        <FilterPill href="/panel/admin/lessons" label="Wszyscy" active={!activeTutorId} />
        {data.tutors.map((t) => (
          <FilterPill
            key={t.id}
            href={`/panel/admin/lessons?tutor=${t.id}`}
            label={t.name}
            active={activeTutorId === t.id}
            penaltyCount={t.penaltyCount}
          />
        ))}
      </div>

      {/* ── Lista wpisów ── */}
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-[16px] font-black text-primary">
          {activeTutorId
            ? (data.tutors.find((t) => t.id === activeTutorId)?.name ?? 'Wpisy')
            : 'Wszystkie wpisy'}
        </h2>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-extrabold"
          style={{ backgroundColor: 'rgba(59,143,240,0.18)', color: '#3B8FF0' }}
        >
          {data.entries.length}
        </span>
      </div>

      <AdminJournalList entries={data.entries} />
    </div>
  )
}

function FilterPill({
  href,
  label,
  active,
  penaltyCount,
}: {
  href: string
  label: string
  active: boolean
  penaltyCount?: number
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-[10px] border px-3 py-1.5 text-[11px] font-bold transition-colors"
      style={
        active
          ? {
              borderColor: 'rgba(59,143,240,0.5)',
              backgroundColor: 'rgba(59,143,240,0.18)',
              color: '#3B8FF0',
            }
          : { borderColor: 'rgba(59,143,240,0.10)', backgroundColor: 'transparent', color: '#9B97AF' }
      }
    >
      {label}
      {penaltyCount !== undefined && penaltyCount > 0 && (
        <span
          className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold"
          style={{ backgroundColor: '#EF444422', color: '#EF4444' }}
          title={`${penaltyCount} punktów karnych`}
        >
          ⚠ {penaltyCount}
        </span>
      )}
    </Link>
  )
}
