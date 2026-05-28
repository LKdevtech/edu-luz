'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { AdminAlert } from '@/lib/queries/admin'

const SUBJECT_COLORS: Record<string, string> = {
  Matematyka: '#3B8FF0',
  Angielski: '#06B6D4',
  Fizyka: '#F59E0B',
  Chemia: '#22C55E',
  Polski: '#E84393',
  Elektrotechnika: '#FF6F4A',
}

const PLAN_ACTIONS: Array<{ label: string; primary: boolean }> = [
  { label: 'Zatwierdź zmianę', primary: true },
  { label: 'Zaproponuj inny termin', primary: false },
  { label: 'Odrzuć', primary: false },
]

export function AdminAlerts({ alerts, adminId }: { alerts: AdminAlert[]; adminId: string }) {
  const [expandedAll, setExpandedAll] = useState(false)
  const visible = expandedAll ? alerts : alerts.slice(0, 3)

  return (
    <div className="mb-7">
      <div className="mb-3.5 flex items-center gap-2">
        <span className="text-[16px]" aria-hidden>🚨</span>
        <span className="text-[16px] font-black text-primary">Wymagają uwagi</span>
        {alerts.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1.5 text-[10px] font-extrabold text-white">
            {alerts.length}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">
          🎉 Brak spraw wymagających uwagi.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((a, i) => (
            <AlertCard key={i} alert={a} adminId={adminId} />
          ))}
        </div>
      )}

      {alerts.length > 3 && (
        <button
          type="button"
          onClick={() => setExpandedAll((v) => !v)}
          className="mt-2.5 bg-transparent text-[12px] font-bold text-link hover:underline"
        >
          {expandedAll ? 'Zwiń ▲' : `Pokaż wszystkie (${alerts.length}) ▼`}
        </button>
      )}
    </div>
  )
}

function AlertCard({ alert, adminId }: { alert: AdminAlert; adminId: string }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // absence: zatwierdź nieobecność → odwołane lekcje
  function approveAbsence() {
    const absenceId = alert.absenceId
    if (!absenceId) return
    setError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: updErr } = await supabase
        .from('tutor_absences')
        .update({ approved_at: new Date().toISOString(), approved_by: adminId })
        .eq('id', absenceId)
      if (updErr) {
        setError(updErr.message)
        return
      }
      router.refresh()
    })
  }

  // makeup: wyślij przypomnienie do każdego korepetytora przez direct_messages
  function remindTutors() {
    const tutorIds = alert.reminderTutorIds ?? []
    if (tutorIds.length === 0) return
    setError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: insErr } = await supabase.from('direct_messages').insert(
        tutorIds.map((tutorId) => ({
          sender_id: adminId,
          recipient_id: tutorId,
          subject: 'Przypomnienie o odrabianiu',
          body: 'Przypomnienie: oczekująca propozycja odrabiania wymaga Twojej reakcji.',
        })),
      )
      if (insErr) {
        setError(insErr.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <div
      className="overflow-hidden rounded-[14px] bg-surface transition-colors hover:bg-surface-hover"
      style={{ border: '1px solid rgba(59,143,240,0.10)', borderLeft: `3px solid ${alert.color}` }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start gap-3 px-4.5 py-3.5 text-left"
        style={{ paddingLeft: 18, paddingRight: 18 }}
      >
        <span className="mt-0.5 shrink-0 text-[18px]" aria-hidden>{alert.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-extrabold text-primary">{alert.title}</span>
            <span className="shrink-0 text-[10px] text-dim">{alert.time}</span>
          </div>
          <div className="mt-0.5 text-[12px] text-secondary">{alert.desc}</div>
        </div>
        <span
          className="mt-0.5 shrink-0 text-[12px] text-dim transition-transform"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
          aria-hidden
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div className="border-t border-subtle pb-4 pl-12 pr-[18px] pt-3.5">
          {alert.type === 'absence' && (
            <div className="mb-3 flex flex-col gap-1.5">
              {(alert.lessons ?? []).map((l, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2.5 text-[12px] text-secondary">
                  <span className="min-w-[90px] font-bold text-primary">{l.time}</span>
                  <span>{l.student}</span>
                  <span
                    className="rounded-full px-1.5 py-px text-[10px]"
                    style={{
                      color: SUBJECT_COLORS[l.subject] ?? '#6B6780',
                      backgroundColor: `${SUBJECT_COLORS[l.subject] ?? '#6B6780'}15`,
                    }}
                  >
                    {l.subject}
                  </span>
                  <span className="text-[10px] text-dim">{l.room}</span>
                </div>
              ))}
              {alert.note && <div className="mt-1.5 text-[11px] italic text-dim">{alert.note}</div>}
            </div>
          )}

          {alert.type === 'plan' && (
            <div className="mb-3 flex flex-col gap-2">
              <div
                className="rounded-[10px] px-3.5 py-2.5 text-[12px] leading-relaxed text-secondary"
                style={{ backgroundColor: '#FFCA2808', borderLeft: '2px solid #FFCA2840' }}
              >
                {alert.message}
              </div>
              {alert.affected && (
                <div className="text-[11px] text-secondary">
                  Dotyczy: <span className="font-bold text-primary">{alert.affected}</span>
                </div>
              )}
            </div>
          )}

          {alert.type === 'entry' && (
            <div className="mb-3 flex flex-col gap-1.5">
              {(alert.entries ?? []).map((e, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2.5 text-[12px] text-secondary">
                  <span className="min-w-[80px] font-bold text-primary">{e.tutor}</span>
                  <span>{e.date}</span>
                  <span>{e.student}</span>
                  <span className="text-[10px] font-extrabold" style={{ color: '#EF4444' }}>+{e.overdue}</span>
                </div>
              ))}
            </div>
          )}

          {alert.type === 'makeup' && (
            <div className="mb-3 flex flex-col gap-1.5">
              {(alert.items ?? []).map((m, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2.5 text-[12px] text-secondary">
                  <span className="font-bold text-primary">{m.student}</span>
                  <span>→ {m.tutor}</span>
                  <span style={{ color: '#06B6D4' }}>{m.proposed}</span>
                  <span className="text-[10px] font-extrabold" style={{ color: '#EF4444' }}>czeka {m.waiting}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {alert.type === 'absence' && (
              <>
                <button
                  type="button"
                  onClick={approveAbsence}
                  disabled={isPending || !alert.absenceId}
                  className="rounded-[8px] px-4 py-1.5 text-[11px] font-bold transition-all disabled:opacity-50"
                  style={{ backgroundColor: `${alert.color}20`, color: alert.color }}
                >
                  {isPending ? 'Wysyłanie…' : 'Zatwierdź i odwołaj lekcje'}
                </button>
                <button
                  type="button"
                  className="rounded-[8px] px-4 py-1.5 text-[11px] font-bold transition-all"
                  style={{ backgroundColor: 'transparent', color: '#9B97AF' }}
                >
                  Odrzuć — wyjaśni
                </button>
              </>
            )}

            {alert.type === 'plan' &&
              PLAN_ACTIONS.map((a, i) => (
                <button
                  key={i}
                  type="button"
                  className="rounded-[8px] px-4 py-1.5 text-[11px] font-bold transition-all"
                  style={
                    a.primary
                      ? { backgroundColor: `${alert.color}20`, color: alert.color }
                      : { backgroundColor: 'transparent', color: '#9B97AF' }
                  }
                >
                  {a.label}
                </button>
              ))}

            {alert.type === 'entry' && (
              <button
                type="button"
                onClick={() => router.push('/panel/admin/lessons')}
                className="rounded-[8px] px-4 py-1.5 text-[11px] font-bold transition-all"
                style={{ backgroundColor: `${alert.color}20`, color: alert.color }}
              >
                Otwórz dziennik wpisów →
              </button>
            )}

            {alert.type === 'makeup' && (
              <button
                type="button"
                onClick={remindTutors}
                disabled={isPending || (alert.reminderTutorIds ?? []).length === 0}
                className="rounded-[8px] px-4 py-1.5 text-[11px] font-bold transition-all disabled:opacity-50"
                style={{ backgroundColor: `${alert.color}20`, color: alert.color }}
              >
                {isPending ? 'Wysyłanie…' : 'Przypomnij korepetytorom'}
              </button>
            )}

            {error && (
              <span className="text-[10px] font-bold" style={{ color: '#EF4444' }}>
                {error}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
