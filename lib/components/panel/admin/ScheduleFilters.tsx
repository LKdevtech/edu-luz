'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type ScheduleFiltersProps = {
  tutors: Array<{ id: string; fullName: string }>
  rooms: Array<{ id: string; name: string }>
  subjects: Array<{ id: string; name: string }>
}

export function ScheduleFilters({ tutors, rooms, subjects }: ScheduleFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    const q = next.toString()
    router.push(q ? `${pathname}?${q}` : pathname)
  }

  const hasAny = params.get('tutor') || params.get('room') || params.get('subject')

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        placeholder="Wszyscy korepetytorzy"
        value={params.get('tutor') ?? ''}
        options={tutors.map((t) => ({ value: t.id, label: t.fullName }))}
        onChange={(v) => setParam('tutor', v)}
      />
      <Select
        placeholder="Wszystkie sale"
        value={params.get('room') ?? ''}
        options={rooms.map((r) => ({ value: r.id, label: r.name }))}
        onChange={(v) => setParam('room', v)}
      />
      <Select
        placeholder="Wszystkie przedmioty"
        value={params.get('subject') ?? ''}
        options={subjects.map((s) => ({ value: s.id, label: s.name }))}
        onChange={(v) => setParam('subject', v)}
      />
      {hasAny && (
        <button
          type="button"
          onClick={() => {
            const next = new URLSearchParams(params.toString())
            next.delete('tutor')
            next.delete('room')
            next.delete('subject')
            const q = next.toString()
            router.push(q ? `${pathname}?${q}` : pathname)
          }}
          className="text-[11px] font-bold text-secondary hover:text-primary"
        >
          ✕ Wyczyść filtry
        </button>
      )}
    </div>
  )
}

function Select({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string
  placeholder: string
  options: Array<{ value: string; label: string }>
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-[8px] border border-subtle bg-alt px-2 py-1.5 text-[12px] font-bold text-primary focus:border-link focus:outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
