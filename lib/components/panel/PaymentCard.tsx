import type { PaymentSummary } from '@/lib/queries/parent'
import { SubjectDot } from './Badges'
import { formatPolishDate } from '@/lib/utils/date'

type PaymentCardProps = {
  payment: PaymentSummary
  /** Wariant "current" (bieżący miesiąc, duży header) lub "history" (kompakt). */
  variant?: 'current' | 'history'
  /** Czy pokazać szczegółowy breakdown per dziecko. */
  showBreakdown?: boolean
}

const STATUS_META: Record<
  PaymentSummary['status'],
  { label: string; color: string; icon: string }
> = {
  paid: { label: 'Opłacone', color: '#22C55E', icon: '✓' },
  pending: { label: 'Oczekuje', color: '#F59E0B', icon: '⏳' },
  overdue: { label: 'Zaległość', color: '#EF4444', icon: '!' },
  paid_late: { label: 'Opłacone (po terminie)', color: '#F59E0B', icon: '✓' },
}

export function PaymentCard({ payment, variant = 'current', showBreakdown = true }: PaymentCardProps) {
  const meta = STATUS_META[payment.status]

  if (variant === 'history') {
    return (
      <article className="rounded-card bg-surface p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-block h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: meta.color }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-extrabold text-primary">
                  {payment.monthLabel}
                </span>
                {payment.status === 'paid_late' && (
                  <span
                    className="rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider"
                    style={{ backgroundColor: '#F59E0B22', color: '#F59E0B' }}
                  >
                    Po terminie
                  </span>
                )}
              </div>
              <div className="text-[11px] text-secondary">
                {payment.paidAt
                  ? `Wpłata: ${formatPolishDate(payment.paidAt)}`
                  : `Termin: ${formatPolishDate(payment.dueDate)}`}
                {payment.delayNumber > 0 && ` • ${payment.delayNumber}. opóźnienie`}
              </div>
            </div>
          </div>
          <span className="text-[15px] font-extrabold text-primary">
            {formatAmount(payment.totalAmount)} zł
          </span>
        </div>
      </article>
    )
  }

  return (
    <article
      className="rounded-card p-5"
      style={{
        backgroundColor: `${meta.color}0A`,
        borderLeft: `4px solid ${meta.color}`,
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-secondary">
            {payment.monthLabel}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[32px] font-black text-primary leading-none">
              {formatAmount(payment.totalAmount)}
            </span>
            <span className="text-[14px] font-bold text-secondary">zł</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider"
              style={{ backgroundColor: `${meta.color}29`, color: meta.color }}
            >
              {meta.icon} {meta.label}
            </span>
            {payment.delayNumber > 0 && payment.status !== 'paid' && (
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold"
                style={{ backgroundColor: '#EF444422', color: '#EF4444' }}
              >
                {payment.delayNumber}. opóźnienie w tym roku
              </span>
            )}
          </div>
        </div>
        <div className="text-right text-[11px] text-secondary">
          <div className="font-extrabold uppercase tracking-wider text-dim">
            Termin płatności
          </div>
          <div className="mt-0.5 font-bold text-primary">
            {formatPolishDate(payment.dueDate)}
          </div>
        </div>
      </div>

      {showBreakdown && payment.breakdown.length > 0 && (
        <div className="mt-4 rounded-[10px] bg-alt p-3">
          {payment.breakdown.map((child, idx) => (
            <div
              key={child.childId}
              className={idx > 0 ? 'mt-3 border-t border-subtle pt-3' : ''}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold"
                    style={{
                      backgroundColor: `${child.childAvatarColor}29`,
                      color: child.childAvatarColor,
                    }}
                  >
                    {child.childInitials}
                  </span>
                  <span className="text-[13px] font-extrabold text-primary">
                    {child.childName}
                  </span>
                </div>
                <span className="text-[13px] font-extrabold text-primary">
                  {formatAmount(child.childSubtotal)} zł
                </span>
              </div>
              <div className="mt-1.5 flex flex-col gap-1 pl-8 text-[12px] text-secondary">
                {child.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      {item.subjectColor && <SubjectDot color={item.subjectColor} />}
                      <span className="truncate">
                        {item.description}
                        {item.lessonsPerWeek !== null && ` (${item.lessonsPerWeek}×/tydz)`}
                      </span>
                    </div>
                    <span className="shrink-0 font-extrabold text-primary">
                      {formatAmount(item.amount)} zł
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {payment.reminders.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-dim">
            🔔 Przypomnienia
          </div>
          <div className="flex flex-wrap gap-2">
            {payment.reminders.map((r, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={
                  r.sent
                    ? { backgroundColor: '#22C55E18', color: '#22C55E' }
                    : { backgroundColor: '#232840', color: '#8B879D' }
                }
              >
                <span aria-hidden>{r.sent ? '✓' : '○'}</span>
                <span>{r.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

function formatAmount(n: number): string {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(n)
}
