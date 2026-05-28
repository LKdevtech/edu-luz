'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type ExtraSlotFormProps = {
  tutorId: string
  rooms: Array<{ id: string; name: string }>
}

/**
 * Inline-form do dodawania dodatkowych terminów (extra_slots).
 * Dodatkowe godziny poza stałym planem — używane do propozycji odrabiania.
 */
export function ExtraSlotForm({ tutorId, rooms }: ExtraSlotFormProps) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [roomId, setRoomId] = useState<string>('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-[10px] px-4 py-2 text-[12px] font-extrabold hover:brightness-110"
        style={{ backgroundColor: '#22C55E29', color: '#22C55E' }}
      >
        + Dodaj termin
      </button>
    )
  }

  function reset() {
    setDate('')
    setStartTime('')
    setEndTime('')
    setRoomId('')
    setNote('')
    setError(null)
  }

  function submit() {
    setError(null)
    if (!date || !startTime || !endTime) {
      setError('Wypełnij datę, godzinę początkową i końcową.')
      return
    }
    if (endTime <= startTime) {
      setError('Godzina końcowa musi być późniejsza niż początkowa.')
      return
    }

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: insErr } = await supabase.from('extra_slots').insert({
        tutor_id: tutorId,
        slot_date: date,
        start_time: startTime,
        end_time: endTime,
        room_id: roomId || null,
        note: note.trim() || null,
        status: 'open',
      })
      if (insErr) {
        setError(insErr.message)
        return
      }
      reset()
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <div
      className="rounded-card bg-surface p-4"
      style={{ border: '1px solid #22C55E33' }}
    >
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-secondary">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-[10px] border border-subtle bg-main p-2 text-[12px] text-primary focus:border-link focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-secondary">Od</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-[10px] border border-subtle bg-main p-2 text-[12px] text-primary focus:border-link focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-secondary">Do</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-[10px] border border-subtle bg-main p-2 text-[12px] text-primary focus:border-link focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-[200px_1fr]">
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-secondary">Sala</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full rounded-[10px] border border-subtle bg-main p-2 text-[12px] text-primary focus:border-link focus:outline-none"
          >
            <option value="">— bez przypisania —</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-secondary">
            Uwaga (opcjonalna)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Np. Tylko na odrabianie"
            className="w-full rounded-[10px] border border-subtle bg-main p-2 text-[12px] text-primary placeholder:text-dim focus:border-link focus:outline-none"
          />
        </div>
      </div>
      {error && (
        <p className="mt-3 rounded-[8px] bg-[#EF444418] px-3 py-2 text-[11px] font-bold" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            reset()
            setOpen(false)
          }}
          disabled={isPending}
          className="rounded-[10px] border border-subtle px-4 py-2 text-[12px] font-bold text-secondary hover:bg-surface-hover disabled:opacity-50"
        >
          Anuluj
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="rounded-[10px] px-4 py-2 text-[12px] font-extrabold text-white hover:brightness-110 disabled:opacity-50"
          style={{ backgroundColor: '#22C55E' }}
        >
          {isPending ? 'Dodawanie…' : 'Dodaj'}
        </button>
      </div>
    </div>
  )
}
