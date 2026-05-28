'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { formatPolishDate } from '@/lib/utils/date'

type ExtraSlotRowProps = {
  slotId: string
  date: string
  startTime: string
  endTime: string
  roomName: string | null
  note: string | null
  status: string
}

/**
 * Wiersz dodatkowego terminu (extra_slot) z opcją usunięcia.
 * Usunięcie blokowane gdy slot jest 'booked' (już użyty w odrabianiu).
 */
export function ExtraSlotRow({
  slotId,
  date,
  startTime,
  endTime,
  roomName,
  note,
  status,
}: ExtraSlotRowProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isBooked = status === 'booked'

  function remove() {
    setError(null)
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: delErr } = await supabase.from('extra_slots').delete().eq('id', slotId)
      if (delErr) {
        setError(delErr.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <article
      className="flex items-center gap-4 rounded-card bg-surface p-3"
      style={{ borderLeft: `3px solid #22C55E` }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[16px]"
        style={{ backgroundColor: '#22C55E29' }}
      >
        ➕
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-extrabold text-primary">
          {formatPolishDate(date)} · {startTime}–{endTime}
        </div>
        <div className="text-[11px] text-secondary">
          {roomName && <span>📍 {roomName}</span>}
          {roomName && note && <span> · </span>}
          {note && <span>{note}</span>}
          {!roomName && !note && <span className="italic text-dim">Bez uwag</span>}
        </div>
      </div>
      {isBooked ? (
        <span
          className="rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase"
          style={{ backgroundColor: '#7C5CFC22', color: '#7C5CFC' }}
        >
          🔒 Zarezerwowany
        </span>
      ) : (
        <button
          type="button"
          onClick={remove}
          disabled={isPending}
          aria-label="Usuń termin"
          className="rounded-[8px] p-1.5 text-[14px] text-secondary hover:bg-[#EF444418] hover:text-[#EF4444] disabled:opacity-50"
        >
          ✕
        </button>
      )}
      {error && (
        <span className="text-[10px] font-bold" style={{ color: '#EF4444' }}>
          {error}
        </span>
      )}
    </article>
  )
}
