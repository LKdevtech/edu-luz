'use client'

import { useState } from 'react'

type RegistryDownloadProps = {
  tutorId: string
  tutorFullName: string
}

/**
 * Dropdown wyboru miesiąca + pobierz PDF rejestru godzin.
 * Domyślnie podpowiada poprzedni miesiąc.
 */
export function RegistryDownload({ tutorId }: RegistryDownloadProps) {
  const now = new Date()
  // Domyślnie poprzedni miesiąc (rejestr wystawiamy po zakończeniu okresu).
  const defaultDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const [year, setYear] = useState(defaultDate.getFullYear())
  const [month, setMonth] = useState(defaultDate.getMonth() + 1)

  const months = [
    { value: 1, label: 'Styczeń' },
    { value: 2, label: 'Luty' },
    { value: 3, label: 'Marzec' },
    { value: 4, label: 'Kwiecień' },
    { value: 5, label: 'Maj' },
    { value: 6, label: 'Czerwiec' },
    { value: 7, label: 'Lipiec' },
    { value: 8, label: 'Sierpień' },
    { value: 9, label: 'Wrzesień' },
    { value: 10, label: 'Październik' },
    { value: 11, label: 'Listopad' },
    { value: 12, label: 'Grudzień' },
  ]
  const currentYear = now.getFullYear()
  const years = [currentYear - 1, currentYear]

  const href = `/api/admin/registry/${tutorId}/${year}-${String(month).padStart(2, '0')}`

  return (
    <div className="flex items-center gap-2">
      <select
        value={month}
        onChange={(e) => setMonth(Number(e.target.value))}
        className="rounded-[8px] border border-subtle bg-alt px-2 py-1.5 text-[12px] font-bold text-primary focus:border-link focus:outline-none"
      >
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <select
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className="rounded-[8px] border border-subtle bg-alt px-2 py-1.5 text-[12px] font-bold text-primary focus:border-link focus:outline-none"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-[8px] px-3 py-1.5 text-[12px] font-extrabold transition-colors hover:brightness-110"
        style={{ backgroundColor: 'rgba(59,143,240,0.18)', color: '#3B8FF0' }}
      >
        📄 Pobierz rejestr godzin
      </a>
    </div>
  )
}
