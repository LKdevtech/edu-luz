'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type GenerateReport = {
  weekStart: string
  weekEnd: string
  created: number
  skippedDuplicate: number
  skippedAbsence: number
}

/** Poniedziałek przyszłego tygodnia w formacie YYYY-MM-DD (czas lokalny). */
function nextWeekMonday(): string {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const dow = now.getDay() // 0 = niedziela … 6 = sobota
  const daysSinceMonday = (dow + 6) % 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - daysSinceMonday + 7)
  const yyyy = monday.getFullYear()
  const mm = String(monday.getMonth() + 1).padStart(2, '0')
  const dd = String(monday.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function GenerateLessonsButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)

  async function run() {
    setLoading(true)
    setNotice(null)
    const weekStart = nextWeekMonday()
    try {
      const res = await fetch('/api/admin/generate-lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart }),
      })
      const json: { error?: string; report?: GenerateReport } = await res.json()
      if (!res.ok || !json.report) {
        setNotice({ ok: false, text: json.error ?? `Błąd ${res.status}.` })
      } else {
        const r = json.report
        setNotice({
          ok: true,
          text: `Tydzień ${r.weekStart} – ${r.weekEnd}: utworzono ${r.created}, pominięto ${r.skippedDuplicate} (duplikat) i ${r.skippedAbsence} (nieobecność).`,
        })
        router.refresh()
      }
    } catch {
      setNotice({ ok: false, text: 'Błąd połączenia z serwerem.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="w-full rounded-[12px] bg-primary px-4 py-2.5 text-[13px] font-extrabold text-white transition-all hover:scale-[1.01] disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? 'Generowanie…' : '📅 Generuj lekcje na przyszły tydzień'}
      </button>
      {notice && (
        <div
          className="rounded-[10px] px-3 py-2 text-[12px] font-semibold"
          style={
            notice.ok
              ? { backgroundColor: '#22C55E18', color: '#22C55E' }
              : { backgroundColor: '#EF444418', color: '#EF4444' }
          }
        >
          {notice.text}
        </div>
      )}
    </div>
  )
}
