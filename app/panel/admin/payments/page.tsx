import {
  AdminPaymentsBoard,
  type AdminPaymentBoardRow,
  type AdminPaymentHistoryEntry,
} from '@/lib/components/panel/admin/AdminPaymentsBoard'
import { getAdminPayments, type AdminPaymentRow } from '@/lib/queries/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type SearchParams = { month?: string }

const T = {
  bg: '#151827',
  surface: '#232840',
  text: '#F0EDE6',
  textDim: '#6B6780',
  primary: '#3B8FF0',
  secondary: '#FF6F4A',
  tertiary: '#FFCA28',
  success: '#22C55E',
  danger: '#EF4444',
  cardBorder: 'rgba(59,143,240,0.10)',
} as const

const MONTHS_SHORT = [
  'Sty',
  'Lut',
  'Mar',
  'Kwi',
  'Maj',
  'Cze',
  'Lip',
  'Sie',
  'Wrz',
  'Paź',
  'Lis',
  'Gru',
] as const

function fmtZl(n: number): string {
  return `${new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(n)} zł`
}

function fmtMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function shortPaidDate(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Mapuje wiersz z query → serializowalny model dla klienta. */
function toBoardRow(p: AdminPaymentRow): AdminPaymentBoardRow {
  const childrenNames = p.childrenNames ? p.childrenNames.split(', ').filter(Boolean) : []
  // Historia z query jest od najnowszego — odwracamy chronologicznie (Sty → Gru) jak w mockupie.
  const history: AdminPaymentHistoryEntry[] = [...p.history]
    .reverse()
    .map((h) => ({
      monthShort: MONTHS_SHORT[new Date(h.billingMonth).getMonth()] ?? h.monthShort,
      status: h.status,
      paidDate: h.paidAt ? shortPaidDate(h.paidAt) : null,
      onTime: h.onTime,
      amount: h.amount,
    }))
  return {
    paymentId: p.paymentId,
    parentName: p.parentName,
    parentInitials: p.parentInitials,
    parentColor: p.parentColor,
    childrenNames,
    lines: p.lines.map((line) => ({
      childName: line.childName,
      description: line.description,
      amount: line.amount,
    })),
    total: p.totalAmount,
    status: p.status,
    delayNumber: p.delayNumber,
    paidDate: p.paidAt ? shortPaidDate(p.paidAt) : null,
    dueDate: p.dueDate,
    history,
  }
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createSupabaseServerClient()
  const data = await getAdminPayments(supabase, searchParams.month)

  // ── Summary (na bazie danych z query, logika jak w mockupie) ──
  const totalExpected = data.stats.totalDue
  const collected = data.stats.totalPaid
  const collPct = totalExpected > 0 ? Math.round((collected / totalExpected) * 100) : 0
  const collColor = collPct >= 90 ? T.success : collPct >= 60 ? T.tertiary : T.secondary

  const pending = data.payments.filter((p) => p.status === 'pending')
  const overdue = data.payments.filter((p) => p.status === 'overdue')
  const pendingAmount = pending.reduce((s, p) => s + p.totalAmount, 0)
  const overdueAmount = overdue.reduce((s, p) => s + p.totalAmount, 0)
  const lateParents = data.payments.filter((p) => p.delayNumber > 0).length

  // ── Nawigacja po miesiącach ──
  const cur = new Date(data.month)
  const prev = new Date(cur.getFullYear(), cur.getMonth() - 1, 1)
  const next = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
  const monthHref = (d: Date) => `?month=${fmtMonth(d)}`

  const rows = data.payments.map(toBoardRow)
  const historyYear = new Date(data.month).getFullYear()

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {/* ── Nawigacja po miesiącach + termin wpłat ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <a
          href={monthHref(prev)}
          style={{ color: T.textDim, fontSize: 14, textDecoration: 'none' }}
          aria-label="Poprzedni miesiąc"
        >
          ←
        </a>
        <span style={{ fontSize: 14, fontWeight: 900, color: T.text, textTransform: 'capitalize' }}>
          {data.monthLabel}
        </span>
        <a
          href={monthHref(next)}
          style={{ color: T.textDim, fontSize: 14, textDecoration: 'none' }}
          aria-label="Następny miesiąc"
        >
          →
        </a>
        <span style={{ fontSize: 10, color: T.textDim, marginLeft: 4 }}>
          Termin wpłat: do 10. dnia miesiąca
          <span style={{ fontSize: 9, color: `${T.danger}90`, marginLeft: 8 }}>
            Po 10. oczekujące → zaległość automatycznie
          </span>
        </span>
      </div>

      {/* ── Karty podsumowania ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {/* Zebrane (% + progress bar) */}
        <div
          style={{
            flex: 1,
            minWidth: 200,
            background: T.surface,
            borderRadius: 12,
            padding: '14px 18px',
            border: `1px solid ${T.cardBorder}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: T.textDim, fontWeight: 600 }}>Zebrane</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: collColor }}>{`${collPct}%`}</span>
          </div>
          <div style={{ height: 8, borderRadius: 50, background: `${T.primary}15`, overflow: 'hidden', marginBottom: 6 }}>
            <div
              style={{
                width: `${collPct}%`,
                height: '100%',
                borderRadius: 50,
                background: `linear-gradient(90deg, ${T.primary}, ${T.success})`,
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ fontWeight: 800, color: T.success }}>{fmtZl(collected)}</span>
            <span style={{ color: T.textDim }}>{`z ${fmtZl(totalExpected)}`}</span>
          </div>
        </div>

        {/* Oczekujące / Zaległe / Opóźnieni */}
        {[
          { label: 'Oczekujące', value: fmtZl(pendingAmount), count: `${pending.length} rodziców`, color: T.tertiary },
          { label: 'Zaległe', value: fmtZl(overdueAmount), count: `${overdue.length} rodziców`, color: T.danger },
          { label: 'Opóźnieni (ogółem)', value: `${lateParents} rodziców`, count: null, color: T.secondary },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: T.surface,
              borderRadius: 12,
              padding: '14px 18px',
              border: `1px solid ${T.cardBorder}`,
              minWidth: 140,
            }}
          >
            <div style={{ fontSize: 10, color: T.textDim, marginBottom: 4, fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
            {s.count !== null && <div style={{ fontSize: 9, color: T.textDim }}>{s.count}</div>}
          </div>
        ))}
      </div>

      {/* ── Filtry + legenda + lista (klient) ── */}
      <AdminPaymentsBoard rows={rows} year={historyYear} />
    </div>
  )
}
