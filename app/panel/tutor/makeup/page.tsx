import Link from 'next/link'

import { getCurrentTutorId } from '@/lib/auth/getCurrentTutorId'
import { TutorMakeupCard } from '@/lib/components/panel/TutorMakeupCard'
import { getTutorMakeup, type TutorMakeupRow } from '@/lib/queries/tutor'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatPolishDate } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

type SearchParams = { tab?: string }
type Tab = 'pending' | 'sent' | 'accepted' | 'history'

const TABS: Array<{ key: Tab; label: string; icon: string }> = [
  { key: 'pending', label: 'Oczekujące', icon: '📥' },
  { key: 'sent', label: 'Wysłane', icon: '📤' },
  { key: 'accepted', label: 'Zaakceptowane', icon: '✅' },
  { key: 'history', label: 'Historia', icon: '📋' },
]

export default async function TutorMakeupPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const tutorId = await getCurrentTutorId()
  const supabase = createSupabaseServerClient()
  const data = await getTutorMakeup(supabase, tutorId)

  const activeTab: Tab =
    searchParams.tab === 'sent' || searchParams.tab === 'accepted' || searchParams.tab === 'history'
      ? (searchParams.tab as Tab)
      : 'pending'

  const counts: Record<Tab, number> = {
    pending: data.pending.length,
    sent: data.sent.length,
    accepted: data.accepted.length,
    history: data.history.length,
  }

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <header className="mb-5">
        <h1 className="text-[20px] font-black text-primary">Odrabianie</h1>
        <p className="text-[12px] text-dim">
          Propozycje terminów odrabiania — ping-pong z rodzicami.
        </p>
      </header>

      <nav className="mb-5 flex flex-wrap gap-2 border-b border-subtle">
        {TABS.map((t) => {
          const isActive = activeTab === t.key
          const count = counts[t.key]
          return (
            <Link
              key={t.key}
              href={`?tab=${t.key}`}
              className="relative flex items-center gap-2 px-4 py-2.5 text-[13px] transition-colors"
              style={{
                borderBottom: isActive ? '2px solid #3B8FF0' : '2px solid transparent',
                marginBottom: '-1px',
                color: isActive ? '#3B8FF0' : '#9B97AF',
                fontWeight: isActive ? 800 : 600,
              }}
            >
              <span aria-hidden>{t.icon}</span>
              <span>{t.label}</span>
              {count > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-extrabold"
                  style={
                    isActive
                      ? { backgroundColor: '#3B8FF026', color: '#3B8FF0' }
                      : { backgroundColor: 'rgba(139,135,157,0.18)', color: '#8B879D' }
                  }
                >
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {activeTab === 'pending' && (
        <TabSection items={data.pending} tutorId={tutorId} mode="pending" emptyText="Brak propozycji od rodziców do rozpatrzenia." />
      )}
      {activeTab === 'sent' && (
        <TabSection items={data.sent} tutorId={tutorId} mode="sent" emptyText="Brak wysłanych propozycji oczekujących na rodzica." />
      )}
      {activeTab === 'accepted' && (
        <TabSection items={data.accepted} tutorId={tutorId} mode="accepted" emptyText="Brak zaakceptowanych odrabiań." />
      )}
      {activeTab === 'history' && <HistoryList items={data.history} />}
    </div>
  )
}

function TabSection({
  items,
  tutorId,
  mode,
  emptyText,
}: {
  items: TutorMakeupRow[]
  tutorId: string
  mode: 'pending' | 'sent' | 'accepted'
  emptyText: string
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">
        {emptyText}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      {items.map((m) => (
        <TutorMakeupCard key={m.requestId} item={m} tutorId={tutorId} mode={mode} />
      ))}
    </div>
  )
}

function HistoryList({ items }: { items: TutorMakeupRow[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">
        Brak historii odrabiań.
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map((m) => {
        const meta =
          m.status === 'completed'
            ? { color: '#22C55E', label: 'Odrobiona' }
            : m.status === 'rejected'
              ? { color: '#EF4444', label: 'Odrzucona przez rodzica' }
              : { color: '#8B879D', label: 'Wygasła (brak odpowiedzi)' }
        return (
          <article
            key={m.requestId}
            className="rounded-card bg-surface p-3 opacity-80"
            style={{ borderLeft: `3px solid ${meta.color}` }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-bold text-primary">{m.studentLabel}</span>
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase"
                style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
              >
                {meta.label}
              </span>
              <span className="text-[11px] text-dim">
                {m.subjectName} · Odwołana: {formatPolishDate(m.originalDate)}
                {m.completedDate && ` → Odrobiona: ${formatPolishDate(m.completedDate)}`}
              </span>
            </div>
          </article>
        )
      })}
    </div>
  )
}
