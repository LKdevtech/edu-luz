'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { ConfirmPaymentButton } from '@/lib/components/panel/admin/ConfirmPaymentButton'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

// ════════════════════════════════════════════════════════════════════════════
// Tokeny (inline hex — zgodne z mockupem płatności)
// ════════════════════════════════════════════════════════════════════════════

const T = {
  bg: '#151827',
  surface: '#232840',
  surfaceHover: '#2A3050',
  text: '#F0EDE6',
  textMuted: '#9B97AF',
  textDim: '#6B6780',
  primary: '#3B8FF0',
  secondary: '#FF6F4A',
  tertiary: '#FFCA28',
  success: '#22C55E',
  danger: '#EF4444',
  cardBorder: 'rgba(59,143,240,0.10)',
} as const

export type PaymentStatus = 'paid' | 'paid_late' | 'pending' | 'overdue'

/** Wpis historii wpłat (dla pojedynczego miesiąca). */
export type AdminPaymentHistoryEntry = {
  monthShort: string
  status: PaymentStatus
  paidDate: string | null
  onTime: boolean | null
  amount: number
}

/** Składowa opłaty — pojedyncza pozycja (uczeń + opis + kwota). */
export type AdminPaymentLine = {
  childName: string
  description: string
  amount: number
}

/** Serializowalny model wiersza płatności (przekazywany z serwera do klienta). */
export type AdminPaymentBoardRow = {
  paymentId: string
  parentId: string
  remindersDisabled: boolean
  parentName: string
  parentInitials: string
  parentColor: string
  childrenNames: string[]
  lines: AdminPaymentLine[]
  total: number
  status: PaymentStatus
  delayNumber: number
  paidDate: string | null
  dueDate: string
  history: AdminPaymentHistoryEntry[]
}

type FilterKey = 'all' | 'paid' | 'pending' | 'overdue' | 'late'

function fmtZl(n: number): string {
  return `${new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(n)} zł`
}

// Kolor + etykieta statusu (paid_late traktowane jak "po terminie", żółty)
function statusColor(status: PaymentStatus): string {
  if (status === 'paid') return T.success
  if (status === 'pending' || status === 'paid_late') return T.tertiary
  return T.danger
}
function statusLabel(status: PaymentStatus): string {
  if (status === 'paid') return 'Opłacone'
  if (status === 'paid_late') return 'Opłacone (po terminie)'
  if (status === 'pending') return 'Oczekuje'
  return 'Zaległość'
}

// ════════════════════════════════════════════════════════════════════════════
// Kropka historii
// ════════════════════════════════════════════════════════════════════════════

function HistoryDot({ entry }: { entry: AdminPaymentHistoryEntry }) {
  const isPaid = entry.status === 'paid' || entry.status === 'paid_late'
  const onTime = entry.status === 'paid' ? entry.onTime !== false : false
  let background: string
  let border = 'none'
  if (isPaid) {
    background = onTime ? T.success : T.tertiary
  } else if (entry.status === 'pending') {
    background = `${T.tertiary}50`
    border = `1px solid ${T.tertiary}`
  } else {
    background = T.danger
    border = `1px solid ${T.danger}`
  }
  const title = isPaid
    ? `${entry.monthShort}: opłacone${onTime ? '' : ' (po terminie)'}`
    : `${entry.monthShort}: ${entry.status === 'pending' ? 'oczekuje' : 'zaległość'}`
  return (
    <div
      title={title}
      style={{ width: 8, height: 8, borderRadius: 50, background, border }}
    />
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Wiersz płatności (rozwijany)
// ════════════════════════════════════════════════════════════════════════════

function PaymentRow({
  p,
  year,
  expanded,
  onToggle,
  onNotice,
  onChanged,
}: {
  p: AdminPaymentBoardRow
  year: number
  expanded: boolean
  onToggle: () => void
  onNotice: (ok: boolean, text: string) => void
  onChanged: () => void
}) {
  const [hover, setHover] = useState(false)
  const [rowBusy, setRowBusy] = useState(false)
  const sc = statusColor(p.status)
  const isUnpaid = p.status === 'pending' || p.status === 'overdue'

  async function sendOne() {
    setRowBusy(true)
    try {
      const res = await fetch('/api/admin/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: p.paymentId }),
      })
      const json: { error?: string; report?: { status: string; message: string } } =
        await res.json()
      if (!res.ok || !json.report) {
        onNotice(false, json.error ?? `Błąd ${res.status}.`)
      } else {
        const ok = json.report.status === 'sent'
        onNotice(ok, `${p.parentName}: ${json.report.message}`)
        onChanged()
      }
    } catch {
      onNotice(false, 'Błąd połączenia z serwerem.')
    } finally {
      setRowBusy(false)
    }
  }

  async function toggleDisabled() {
    setRowBusy(true)
    const next = !p.remindersDisabled
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('parents')
        .update({ reminders_disabled: next })
        .eq('profile_id', p.parentId)
      if (error) {
        onNotice(false, error.message)
      } else {
        onNotice(
          true,
          next
            ? `Wyłączono przypomnienia dla: ${p.parentName}.`
            : `Włączono przypomnienia dla: ${p.parentName}.`,
        )
        onChanged()
      }
    } finally {
      setRowBusy(false)
    }
  }

  return (
    <div
      style={{
        background: hover && !expanded ? T.surfaceHover : T.surface,
        borderRadius: 14,
        border: `1px solid ${p.status === 'overdue' ? `${T.danger}30` : T.cardBorder}`,
        overflow: 'hidden',
        transition: 'all 0.15s',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* ── Collapsed header ── */}
      <div
        onClick={onToggle}
        style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            flexShrink: 0,
            background: `${p.parentColor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 800,
            color: p.parentColor,
          }}
        >
          {p.parentInitials}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{p.parentName}</span>
            <span
              style={{
                fontSize: 8,
                fontWeight: 700,
                color: sc,
                background: `${sc}15`,
                padding: '2px 8px',
                borderRadius: 50,
              }}
            >
              {statusLabel(p.status)}
            </span>
            {p.delayNumber > 0 && (
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: p.delayNumber >= 3 ? T.danger : T.tertiary,
                }}
              >
                {`${p.delayNumber}. opóźnienie`}
              </span>
            )}
          </div>
          <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>
            {p.childrenNames.join(', ')}
          </div>
        </div>

        {/* Amount + history dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {p.history.length > 0 && (
            <div style={{ display: 'flex', gap: 3 }}>
              {p.history.map((h, i) => (
                <HistoryDot key={i} entry={h} />
              ))}
            </div>
          )}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>{fmtZl(p.total)}</div>
            <div style={{ fontSize: 8, color: T.textDim }}>miesięcznie</div>
          </div>
        </div>
        <span
          style={{
            fontSize: 11,
            color: T.textDim,
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
            display: 'inline-block',
            flexShrink: 0,
          }}
        >
          ▼
        </span>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${T.cardBorder}`, padding: '14px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* LEWA: składowe + akcje + przypomnienia */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 8 }}>
                Składowe opłaty
              </div>
              {p.lines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 10px',
                    background: T.bg,
                    borderRadius: 8,
                    marginBottom: 4,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.text }}>
                      {line.childName}
                    </div>
                    {line.description && (
                      <div style={{ fontSize: 9, color: T.textDim, marginTop: 1 }}>
                        {line.description}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: T.tertiary, flexShrink: 0 }}>
                    {fmtZl(line.amount)}
                  </span>
                </div>
              ))}
              {p.lines.length > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    marginTop: 4,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 800, color: T.text }}>Łącznie</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: T.tertiary }}>
                    {fmtZl(p.total)}
                  </span>
                </div>
              )}

              {/* Akcje */}
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {isUnpaid && (
                  <ConfirmPaymentButton
                    paymentId={p.paymentId}
                    totalAmount={p.total}
                    dueDate={p.dueDate}
                    label="Oznacz jako opłacone"
                    variant="inline"
                  />
                )}
                {isUnpaid && (
                  <ActionButton
                    label={rowBusy ? 'Wysyłanie…' : 'Wyślij przypomnienie'}
                    color={T.tertiary}
                    onClick={sendOne}
                    disabled={rowBusy}
                  />
                )}
                <ActionButton label="Historia rozliczeń" color={T.primary} />
              </div>

              {/* Przypomnienia automatyczne */}
              <div style={{ marginTop: 12, borderTop: `1px solid ${T.cardBorder}`, paddingTop: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: T.text, marginBottom: 6 }}>
                  Przypomnienia automatyczne
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { label: '10. dnia (termin wpłaty)' },
                    { label: '20. dnia (pierwsze przypomnienie)' },
                    { label: 'Ostatni dzień miesiąca' },
                  ].map((r, ri) => (
                    <label
                      key={ri}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '3px 0' }}
                    >
                      <input type="checkbox" checked readOnly style={{ accentColor: T.primary }} />
                      <span style={{ fontSize: 10, color: T.textMuted }}>{r.label}</span>
                    </label>
                  ))}
                </div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: rowBusy ? 'wait' : 'pointer',
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: `1px solid ${T.cardBorder}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={p.remindersDisabled}
                    disabled={rowBusy}
                    onChange={toggleDisabled}
                    style={{ accentColor: T.danger }}
                  />
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.textMuted }}>
                    Nie wysyłaj przypomnień temu rodzicowi
                  </span>
                </label>
              </div>
            </div>

            {/* PRAWA: historia wpłat */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 8 }}>
                {`Historia wpłat ${year}`}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {p.history.length === 0 && (
                  <div
                    style={{
                      fontSize: 10,
                      color: T.textDim,
                      padding: '8px 10px',
                      background: T.bg,
                      borderRadius: 6,
                    }}
                  >
                    Brak historii wpłat.
                  </div>
                )}
                {p.history.map((h, i) => {
                  const isPaid = h.status === 'paid' || h.status === 'paid_late'
                  const onTime = h.status === 'paid' ? h.onTime !== false : false
                  const hc = isPaid ? (onTime ? T.success : T.tertiary) : h.status === 'pending' ? T.tertiary : T.danger
                  const hl = isPaid ? (onTime ? 'W terminie' : 'Po terminie') : h.status === 'pending' ? 'Oczekuje' : 'Zaległość'
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '5px 10px',
                        background: T.bg,
                        borderRadius: 6,
                        borderLeft: `3px solid ${hc}`,
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.text, width: 32 }}>
                        {h.monthShort}
                      </span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: hc }}>{hl}</span>
                      <div style={{ flex: 1 }} />
                      {h.paidDate && <span style={{ fontSize: 9, color: T.textDim }}>{h.paidDate}</span>}
                      <span style={{ fontSize: 10, fontWeight: 800, color: T.textMuted }}>{fmtZl(h.amount)}</span>
                    </div>
                  )
                })}
              </div>
              {p.history.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 10px',
                    background: T.bg,
                    borderRadius: 6,
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.textDim }}>Wpłacone łącznie</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: T.success }}>
                    {fmtZl(
                      p.history
                        .filter((h) => h.status === 'paid' || h.status === 'paid_late')
                        .reduce((sum, h) => sum + h.amount, 0),
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ActionButton({
  label,
  color,
  onClick,
  disabled,
}: {
  label: string
  color: string
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '7px',
        fontSize: 10,
        fontWeight: 700,
        borderRadius: 7,
        border: 'none',
        cursor: disabled ? 'wait' : 'pointer',
        background: `${color}12`,
        color,
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.12s',
      }}
      onMouseEnter={(e) => {
        if (disabled) return
        e.currentTarget.style.background = color
        e.currentTarget.style.color = '#fff'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `${color}12`
        e.currentTarget.style.color = color
      }}
    >
      {label}
    </button>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Filtry: search + pills + akcje
// ════════════════════════════════════════════════════════════════════════════

const FILTERS: Array<[FilterKey, string]> = [
  ['all', 'Wszyscy'],
  ['paid', 'Opłacone'],
  ['pending', 'Oczekujące'],
  ['overdue', 'Zaległe'],
  ['late', 'Spóźnieni'],
]
const FILTER_COLORS: Record<FilterKey, string> = {
  all: T.primary,
  paid: T.success,
  pending: T.tertiary,
  overdue: T.danger,
  late: T.secondary,
}

// ════════════════════════════════════════════════════════════════════════════
// Główny board (klient): search + filter + lista rozwijanych wierszy
// ════════════════════════════════════════════════════════════════════════════

export function AdminPaymentsBoard({
  rows,
  year,
}: {
  rows: AdminPaymentBoardRow[]
  year: number
}) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)
  const [bulkBusy, setBulkBusy] = useState(false)

  async function sendBulk() {
    setBulkBusy(true)
    setNotice(null)
    try {
      const res = await fetch('/api/admin/send-reminders', { method: 'POST' })
      const json: {
        error?: string
        report?: { sent: number; emailsSent: number; skippedDisabled: number; skippedRecent: number; errors: number }
      } = await res.json()
      if (!res.ok || !json.report) {
        setNotice({ ok: false, text: json.error ?? `Błąd ${res.status}.` })
      } else {
        const r = json.report
        setNotice({
          ok: true,
          text: `Wysłano ${r.sent} (maile: ${r.emailsSent}). Pominięto: ${r.skippedDisabled} wyłączonych, ${r.skippedRecent} niedawnych. Błędy: ${r.errors}.`,
        })
        router.refresh()
      }
    } catch {
      setNotice({ ok: false, text: 'Błąd połączenia z serwerem.' })
    } finally {
      setBulkBusy(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rows.filter((p) => {
      const matchesSearch =
        p.parentName.toLowerCase().includes(q) ||
        p.childrenNames.some((c) => c.toLowerCase().includes(q))
      const isPaid = p.status === 'paid' || p.status === 'paid_late'
      const matchesFilter =
        filter === 'all' ||
        (filter === 'paid' && isPaid) ||
        (filter === 'pending' && p.status === 'pending') ||
        (filter === 'overdue' && p.status === 'overdue') ||
        (filter === 'late' && p.delayNumber > 0)
      return matchesSearch && matchesFilter
    })
  }, [rows, search, filter])

  return (
    <>
      {/* Filtry */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj rodzica lub ucznia..."
          style={{
            fontSize: 11,
            fontFamily: 'inherit',
            padding: '6px 12px',
            borderRadius: 8,
            border: `1px solid ${T.cardBorder}`,
            background: T.surface,
            color: T.text,
            outline: 'none',
            width: 240,
          }}
        />
        <div style={{ display: 'flex', background: T.surface, borderRadius: 8, padding: 2, gap: 2 }}>
          {FILTERS.map(([k, lb]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              style={{
                fontSize: 10,
                fontWeight: filter === k ? 800 : 500,
                fontFamily: 'inherit',
                padding: '5px 10px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: filter === k ? FILTER_COLORS[k] : 'transparent',
                color: filter === k ? '#fff' : T.textMuted,
                transition: 'all 0.12s',
              }}
            >
              {lb}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={sendBulk}
          disabled={bulkBusy}
          style={{
            fontSize: 10,
            fontWeight: 700,
            fontFamily: 'inherit',
            padding: '6px 14px',
            borderRadius: 8,
            border: 'none',
            cursor: bulkBusy ? 'wait' : 'pointer',
            background: T.tertiary,
            color: T.bg,
            opacity: bulkBusy ? 0.6 : 1,
          }}
        >
          {bulkBusy ? 'Wysyłanie…' : 'Wyślij przypomnienia'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/panel/admin/settings')}
          style={{
            fontSize: 10,
            fontWeight: 700,
            fontFamily: 'inherit',
            padding: '6px 14px',
            borderRadius: 8,
            border: `1px solid ${T.cardBorder}`,
            cursor: 'pointer',
            background: 'transparent',
            color: T.textMuted,
          }}
        >
          ⚙ Ustawienia przypomnień
        </button>
      </div>

      {notice && (
        <div
          style={{
            marginBottom: 12,
            padding: '8px 14px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            background: notice.ok ? `${T.success}18` : `${T.danger}18`,
            color: notice.ok ? T.success : T.danger,
          }}
        >
          {notice.text}
        </div>
      )}

      {/* Legenda historii wpłat */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 9, color: T.textDim, flexWrap: 'wrap' }}>
        <span>Historia wpłat:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: 50, background: T.success }} />
          <span>w terminie</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: 50, background: T.tertiary }} />
          <span>po terminie</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <div
            style={{ width: 8, height: 8, borderRadius: 50, background: `${T.tertiary}50`, border: `1px solid ${T.tertiary}` }}
          />
          <span>oczekuje</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: 50, background: T.danger }} />
          <span>zaległość</span>
        </div>
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((p) => (
          <PaymentRow
            key={p.paymentId}
            p={p}
            year={year}
            expanded={expandedId === p.paymentId}
            onToggle={() => setExpandedId(expandedId === p.paymentId ? null : p.paymentId)}
            onNotice={(ok, text) => setNotice({ ok, text })}
            onChanged={() => router.refresh()}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: T.textDim, fontSize: 12 }}>
            Brak wyników
          </div>
        )}
      </div>
    </>
  )
}
