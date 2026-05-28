import { getCurrentParentId } from '@/lib/auth/getCurrentParentId'
import { LevelBadge } from '@/lib/components/panel/Badges'
import { PaymentCard } from '@/lib/components/panel/PaymentCard'
import { getParentPayments, type PaymentSummary } from '@/lib/queries/parent'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatPolishDate } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

export default async function ParentPaymentsPage() {
  const parentId = await getCurrentParentId()
  const supabase = createSupabaseServerClient()
  const data = await getParentPayments(supabase, parentId)

  return (
    <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
      {/* ───────── LEFT ───────── */}
      <div className="flex min-w-0 flex-col gap-7">
        {/* Bieżący miesiąc */}
        <section>
          <h1 className="mb-3 flex items-center gap-2 text-[15px] font-extrabold text-primary">
            <span aria-hidden>💳</span>
            Bieżący miesiąc
          </h1>
          {data.current ? (
            <>
              <PaymentCard payment={data.current} variant="current" showBreakdown />
              <BankTransferBox
                payment={data.current}
                bankAccount={data.contract.bankAccount}
                bankName={data.contract.bankName}
                titleTemplate={data.contract.titleTemplate}
              />
            </>
          ) : (
            <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">
              Brak wystawionego rachunku za bieżący miesiąc.
            </div>
          )}
        </section>

        {/* Historia wpłat */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span aria-hidden>📖</span>
            <h2 className="text-[15px] font-extrabold text-primary">Historia wpłat</h2>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
              style={{ backgroundColor: '#232840', color: '#9B97AF' }}
            >
              {data.history.length} msc
            </span>
          </div>
          {data.history.length === 0 ? (
            <div className="rounded-card bg-surface p-5 text-center text-[12px] text-dim">
              Brak wpłat w historii.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data.history.map((p) => (
                <PaymentCard key={p.id} payment={p} variant="history" />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ───────── RIGHT ───────── */}
      <div className="flex flex-col gap-4">
        {/* Next payment / status */}
        {data.current && <NextPaymentBox payment={data.current} />}

        {/* Contract */}
        <aside className="rounded-card bg-alt p-4">
          <div className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-secondary">
            📄 Informacje o umowie
          </div>
          <div className="flex flex-col gap-2 text-[12px]">
            <ContractRow
              label="Umowa od"
              value={data.contract.startDate ? formatPolishDate(data.contract.startDate) : '—'}
            />
            <ContractRow
              label="Opłata miesięczna"
              value={`${formatAmount(data.contract.monthlyTotal)} zł`}
            />
            <ContractRow
              label="Termin płatności"
              value={`do ${data.contract.paymentDeadlineDay}. dnia miesiąca`}
            />
          </div>

          {data.contract.children.length > 0 && (
            <div className="mt-3 border-t border-subtle pt-3">
              <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-dim">
                Dzieci w umowie
              </div>
              <div className="flex flex-col gap-2">
                {data.contract.children.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold"
                      style={{
                        backgroundColor: `${c.avatarColor}29`,
                        color: c.avatarColor,
                      }}
                    >
                      {c.initials}
                    </span>
                    <span className="text-[12px] font-bold text-primary">{c.fullName}</span>
                    <span className="text-[11px] text-dim">{c.schoolClass}</span>
                    <LevelBadge level={c.level} label={c.levelLabel} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Internal
// ════════════════════════════════════════════════════════════════════════════

function BankTransferBox({
  payment,
  bankAccount,
  bankName,
  titleTemplate,
}: {
  payment: PaymentSummary
  bankAccount: string | null
  bankName: string | null
  titleTemplate: string
}) {
  if (!bankAccount) return null
  const monthLabel = payment.monthLabel
  const title = titleTemplate
    .replace('{miesiąc}', monthLabel.split(' ')[0]!.toLowerCase())
    .replace('{rok}', monthLabel.split(' ')[1] ?? '')
    .replace('{uczeń}',
      payment.breakdown.map((b) => b.childName.split(' ')[0]).join(', '))

  return (
    <div
      className="mt-3 rounded-card p-4"
      style={{
        backgroundColor: 'rgba(59,143,240,0.08)',
        border: '1px solid rgba(59,143,240,0.15)',
      }}
    >
      <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-link">
        💳 Dane do przelewu
      </div>
      <div className="flex flex-col gap-1.5 text-[12px]">
        {bankName && (
          <div className="flex justify-between gap-3">
            <span className="text-dim">Odbiorca</span>
            <span className="font-extrabold text-primary">{bankName}</span>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <span className="text-dim">Nr konta</span>
          <span className="font-mono text-[11px] font-bold text-primary">{bankAccount}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-dim">Tytuł</span>
          <span className="font-bold text-link">{title}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-dim">Kwota</span>
          <span className="font-extrabold text-primary">
            {formatAmount(payment.totalAmount)} zł
          </span>
        </div>
      </div>
    </div>
  )
}

function NextPaymentBox({ payment }: { payment: PaymentSummary }) {
  const isPaid = payment.status === 'paid' || payment.status === 'paid_late'
  const color = isPaid ? '#22C55E' : '#F59E0B'
  const nextReminder = payment.reminders.find((r) => !r.sent)

  return (
    <aside
      className="rounded-card p-4"
      style={{
        backgroundColor: `${color}0A`,
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider" style={{ color }}>
        {isPaid ? '✓ Bieżący miesiąc' : '⏳ Oczekiwana wpłata'}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[26px] font-black text-primary leading-none">
          {formatAmount(payment.totalAmount)}
        </span>
        <span className="text-[13px] font-bold text-secondary">zł</span>
      </div>
      <div className="mt-2 text-[11px] text-secondary">
        {payment.monthLabel} • termin: {formatPolishDate(payment.dueDate)}
      </div>
      {!isPaid && nextReminder && (
        <div className="mt-2 text-[11px]" style={{ color }}>
          Następne przypomnienie: {nextReminder.label}
        </div>
      )}
    </aside>
  )
}

function ContractRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-subtle pb-1.5 last:border-b-0 last:pb-0">
      <span className="text-dim">{label}</span>
      <span className="font-extrabold text-primary">{value}</span>
    </div>
  )
}

function formatAmount(n: number): string {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(n)
}
