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
  // Ostrzeżenie o pokryciu ze stałą dostępnością (nie blokuje — wymaga potwierdzenia).
  const [warning, setWarning] = useState<string | null>(null)
  const [confirmAnyway, setConfirmAnyway] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Czyść ostrzeżenie/potwierdzenie po edycji terminu.
  function clearChecks() {
    setWarning(null)
    setConfirmAnyway(false)
    setError(null)
  }

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
    setWarning(null)
    setConfirmAnyway(false)
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

      // Walidacja nakładania — sprawdź lekcje, inne extra_sloty i stałą dostępność.
      const dow = (new Date(date).getDay() + 6) % 7 // 0=Pon … 6=Ndz
      const [lessonsRes, slotsRes, availRes] = await Promise.all([
        supabase
          .from('lessons')
          .select('start_time, end_time, status')
          .eq('tutor_id', tutorId)
          .eq('lesson_date', date),
        supabase
          .from('extra_slots')
          .select('start_time, end_time')
          .eq('tutor_id', tutorId)
          .eq('slot_date', date),
        supabase
          .from('availability_blocks')
          .select('start_time, end_time')
          .eq('tutor_id', tutorId)
          .eq('day_of_week', dow),
      ])
      if (lessonsRes.error) {
        setError(lessonsRes.error.message)
        return
      }
      if (slotsRes.error) {
        setError(slotsRes.error.message)
        return
      }
      if (availRes.error) {
        setError(availRes.error.message)
        return
      }

      const overlaps = (bStart: string, bEnd: string) =>
        startTime < bEnd.slice(0, 5) && endTime > bStart.slice(0, 5)

      // 1. Lekcja w tym czasie → BLOKADA
      const lessonConflict = (lessonsRes.data ?? []).some(
        (l) =>
          l.status !== 'cancelled' &&
          l.status !== 'no_show' &&
          overlaps(l.start_time, l.end_time),
      )
      if (lessonConflict) {
        setWarning(null)
        setError('Masz lekcję w tym terminie.')
        return
      }

      // 2. Inny extra_slot w tym czasie → BLOKADA
      const slotConflict = (slotsRes.data ?? []).some((x) => overlaps(x.start_time, x.end_time))
      if (slotConflict) {
        setWarning(null)
        setError('Masz już dodatkowy termin w tym czasie.')
        return
      }

      // 3. Pokrycie ze stałą dostępnością → OSTRZEŻENIE (wymaga potwierdzenia)
      const availOverlap = (availRes.data ?? []).some((a) => overlaps(a.start_time, a.end_time))
      if (availOverlap && !confirmAnyway) {
        setWarning(
          'Ten termin pokrywa się z Twoją stałą dostępnością — dodaj tylko jeśli chcesz otworzyć go specjalnie na odrabianie.',
        )
        setConfirmAnyway(true)
        return
      }

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
            onChange={(e) => {
              setDate(e.target.value)
              clearChecks()
            }}
            className="w-full rounded-[10px] border border-subtle bg-main p-2 text-[12px] text-primary focus:border-link focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-secondary">Od</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value)
              clearChecks()
            }}
            className="w-full rounded-[10px] border border-subtle bg-main p-2 text-[12px] text-primary focus:border-link focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-secondary">Do</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => {
              setEndTime(e.target.value)
              clearChecks()
            }}
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
      {warning && (
        <p
          className="mt-3 rounded-[8px] px-3 py-2 text-[11px] font-bold"
          style={{ backgroundColor: '#FFCA2818', color: '#FFCA28' }}
        >
          ⚠ {warning}
        </p>
      )}
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
          style={{ backgroundColor: confirmAnyway ? '#FFCA28' : '#22C55E', color: confirmAnyway ? '#1a1400' : '#fff' }}
        >
          {isPending ? 'Dodawanie…' : confirmAnyway ? 'Dodaj mimo to' : 'Dodaj'}
        </button>
      </div>
    </div>
  )
}
