import { ConfirmPaymentButton } from '@/lib/components/panel/admin/ConfirmPaymentButton'
import { getAdminPayments, type AdminPaymentRow } from '@/lib/queries/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatPolishDate } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

type SearchParams = { month?: string; status?: string }

const STATUS_LABELS = {
  paid: { label: 'Opłacone', color: '#22C55E' },
  paid_late: { label: 'Opłacone (po terminie)', color: '#F59E0B' },
  pending: { label: 'Oczekuje', color: '#F59E0B' },
  overdue: { label: 'Zaległość', color: '#EF4444' },
} as const

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createSupabaseServerClient()
  const data = await getAdminPayments(supabase, searchParams.month)

  let payments = data.payments
  if (searchParams.status) {
    payments = payments.filter((p) => p.status === searchParams.status)
  }

  // Nawigacja po miesiącach
  const cur = new Date(data.month)
  const prev = new Date(cur.getFullYear(), cur.getMonth() - 1, 1)
  const next = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
  const fmtMonth = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-black text-primary">Płatności</h1>
          <p className="text-[12px] text-dim capitalize">{data.monthLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`?month=${fmtMonth(prev)}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
            className="rounded-[8px] border border-subtle bg-surface px-3 py-1.5 text-[12px] font-bold text-dim hover:bg-surface-hover hover:text-primary"
          >
            ←
          </a>
          <a
            href={`/panel/admin/payments${searchParams.status ? `?status=${searchParams.status}` : ''}`}
            className="rounded-[8px] border border-subtle bg-surface px-3 py-1.5 text-[12px] font-bold text-link hover:bg-surface-hover"
          >
            Bieżący
          </a>
          <a
            href={`?month=${fmtMonth(next)}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
            className="rounded-[8px] border border-subtle bg-surface px-3 py-1.5 text-[12px] font-bold text-dim hover:bg-surface-hover hover:text-primary"
          >
            →
          </a>
        </div>
      </header>

      {/* Stats */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatBox label="Łącznie do zebrania" value={`${formatAmount(data.stats.totalDue)} zł`} color="#3B8FF0" />
        <StatBox label="Zebrane" value={`${formatAmount(data.stats.totalPaid)} zł`} color="#22C55E" />
        <StatBox label="Zaległości" value={String(data.stats.overdueCount)} color="#EF4444" />
        <StatBox label="Oczekujące" value={String(data.stats.pendingCount)} color="#FFCA28" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusFilter label="Wszystkie" current={searchParams.status} value="" month={searchParams.month} />
        <StatusFilter label="Opłacone" current={searchParams.status} value="paid" month={searchParams.month} />
        <StatusFilter label="Po terminie" current={searchParams.status} value="paid_late" month={searchParams.month} />
        <StatusFilter label="Oczekujące" current={searchParams.status} value="pending" month={searchParams.month} />
        <StatusFilter label="Zaległości" current={searchParams.status} value="overdue" month={searchParams.month} />
      </div>

      {/* List */}
      {payments.length === 0 ? (
        <div className="rounded-card bg-surface p-10 text-center text-[13px] text-dim">
          Brak płatności w tym miesiącu.
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-card bg-surface"
          style={{ border: '1px solid rgba(59,143,240,0.10)' }}
        >
          {payments.map((p) => (
            <PaymentRow key={p.paymentId} payment={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-card bg-surface p-4" style={{ border: '1px solid rgba(59,143,240,0.10)' }}>
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-dim">{label}</div>
      <div className="mt-1 text-[22px] font-black" style={{ color }}>
        {value}
      </div>
    </div>
  )
}

function StatusFilter({
  label,
  current,
  value,
  month,
}: {
  label: string
  current: string | undefined
  value: string
  month: string | undefined
}) {
  const isActive = (current ?? '') === value
  const params = new URLSearchParams()
  if (month) params.set('month', month)
  if (value) params.set('status', value)
  const href = `?${params.toString()}`
  return (
    <a
      href={href}
      className="rounded-[10px] border px-3 py-1.5 text-[12px] font-bold transition-colors"
      style={
        isActive
          ? { borderColor: 'rgba(59,143,240,0.5)', backgroundColor: 'rgba(59,143,240,0.18)', color: '#3B8FF0' }
          : { borderColor: 'rgba(59,143,240,0.10)', backgroundColor: 'transparent', color: '#9B97AF' }
      }
    >
      {label}
    </a>
  )
}

function PaymentRow({ payment }: { payment: AdminPaymentRow }) {
  const meta = STATUS_LABELS[payment.status]
  const isUnpaid = payment.status === 'pending' || payment.status === 'overdue'
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-subtle px-4 py-3 last:border-b-0">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[12px] font-extrabold"
        style={{ backgroundColor: `${payment.parentColor}29`, color: payment.parentColor }}
      >
        {payment.parentInitials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-extrabold text-primary">{payment.parentName}</div>
        <div className="text-[11px] text-dim">{payment.childrenNames}</div>
      </div>
      <span
        className="rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider"
        style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
      >
        {meta.label}
      </span>
      {payment.delayNumber > 0 && payment.status !== 'paid' && (
        <span
          className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold"
          style={{ backgroundColor: '#EF444422', color: '#EF4444' }}
        >
          {payment.delayNumber}. opóźn.
        </span>
      )}
      <div className="text-right">
        <div className="text-[15px] font-extrabold text-primary">
          {formatAmount(payment.totalAmount)} zł
        </div>
        <div className="text-[10px] text-dim">
          {payment.paidAt ? `Wpłata: ${formatPolishDate(payment.paidAt)}` : `Termin: ${formatPolishDate(payment.dueDate)}`}
        </div>
      </div>
      {isUnpaid && (
        <ConfirmPaymentButton
          paymentId={payment.paymentId}
          totalAmount={payment.totalAmount}
          dueDate={payment.dueDate}
        />
      )}
    </div>
  )
}

function formatAmount(n: number): string {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(n)
}
