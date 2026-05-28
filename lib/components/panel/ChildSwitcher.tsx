'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import { cn } from '@/lib/utils/cn'

type ChildOption = {
  id: string
  initials: string
  color: string
  shortName: string
}

type ChildSwitcherProps = {
  options: ChildOption[]
  /** Jeśli null → "Wszystkie" jest aktywne. */
  activeChildId: string | null
}

/**
 * Globalny przełącznik dzieci na górze widoków rodzica (Dashboard, Zajęcia, Płatności).
 * Filtruje przez query param `?child=<id>` (brak = wszystkie).
 *
 * Sekcja 6.1 SYSTEM_INSTRUCTIONS_v2.
 */
export function ChildSwitcher({ options, activeChildId }: ChildSwitcherProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function hrefFor(childId: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (childId === null) params.delete('child')
    else params.set('child', childId)
    const q = params.toString()
    return q ? `${pathname}?${q}` : pathname
  }

  return (
    <nav
      aria-label="Przełącznik dzieci"
      className="mb-5 inline-flex items-center gap-1 rounded-[12px] bg-alt p-1"
    >
      <Link
        href={hrefFor(null)}
        className={cn(
          'flex items-center gap-2 rounded-[10px] px-3 py-1.5 text-[12px] transition-colors',
          activeChildId === null
            ? 'bg-[rgba(59,143,240,0.16)] font-extrabold text-link'
            : 'font-semibold text-secondary hover:text-primary',
        )}
      >
        <span aria-hidden>👨‍👩‍👧‍👦</span>
        <span>Wszystkie</span>
      </Link>
      {options.map((c) => {
        const isActive = activeChildId === c.id
        return (
          <Link
            key={c.id}
            href={hrefFor(c.id)}
            className={cn(
              'flex items-center gap-2 rounded-[10px] px-3 py-1.5 text-[12px] transition-colors',
              isActive ? 'font-extrabold' : 'font-semibold text-secondary hover:text-primary',
            )}
            style={
              isActive
                ? { backgroundColor: `${c.color}29`, color: c.color }
                : undefined
            }
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold"
              style={{ backgroundColor: `${c.color}29`, color: c.color }}
            >
              {c.initials}
            </span>
            <span>{c.shortName}</span>
          </Link>
        )
      })}
    </nav>
  )
}
