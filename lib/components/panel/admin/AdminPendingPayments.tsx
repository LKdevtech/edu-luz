'use client'

import { useState } from 'react'

type PendingPayment = {
  paymentId: string
  parentName: string
  childrenNames: string
  subjects: string
  amount: number
  delayNumber: number
  status: 'paid' | 'pending' | 'overdue' | 'paid_late'
}

function fmt(n: number): string {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(n)
}

export function AdminPendingPayments({ payments }: { payments: PendingPayment[] }) {
  const [expanded, setExpanded] = useState(false)
  const total = payments.reduce((s, p) => s + p.amount, 0)
  const lateCount = payments.filter((p) => p.delayNumber > 0).length

  return (
    <div className="mb-7">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[16px]" aria-hidden>💳</span>
          <span className="text-[16px] font-black text-primary">Oczekiwane wpłaty</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF6F4A] px-1.5 text-[10px] font-extrabold text-white">
            {payments.length}
          </span>
        </div>
        <span className="text-[10px] text-dim">termin: do 10. dnia miesiąca</span>
      </div>

      <div
        className="overflow-hidden rounded-[14px] bg-surface"
        style={{ border: '1px solid rgba(59,143,240,0.10)' }}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4"
        >
          <div className="flex items-baseline gap-3">
            <span className="text-[24px] font-black" style={{ color: '#FF6F4A' }}>
              {fmt(total)} zł
            </span>
            <span className="text-[12px] text-dim">od {payments.length} rodziców</span>
          </div>
          <div className="flex items-center gap-2.5">
            {lateCount > 0 && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: '#EF444415', color: '#EF4444' }}
              >
                {lateCount} z opóźnieniem
              </span>
            )}
            <span
              className="text-[12px] text-dim transition-transform"
              style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
              aria-hidden
            >
              ▼
            </span>
          </div>
        </button>

        {expanded && (
          <div className="border-t border-subtle px-5 py-3">
            {payments.map((p, i) => (
              <div
                key={p.paymentId}
                className="flex items-center justify-between py-2.5"
                style={{
                  borderBottom: i < payments.length - 1 ? '1px solid rgba(59,143,240,0.10)' : 'none',
                }}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-primary">{p.parentName}</span>
                    {p.delayNumber > 0 && (
                      <span
                        className="rounded-full px-1.5 py-px text-[9px] font-extrabold"
                        style={{
                          color: p.delayNumber >= 3 ? '#EF4444' : '#FFCA28',
                          backgroundColor: `${p.delayNumber >= 3 ? '#EF4444' : '#FFCA28'}15`,
                        }}
                      >
                        {p.delayNumber}. opóźnienie
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-dim">{p.childrenNames}</span>
                  {p.subjects && <span className="text-[10px] text-secondary">{p.subjects}</span>}
                </div>
                <div className="ml-3 shrink-0 text-[15px] font-extrabold" style={{ color: '#FF6F4A' }}>
                  {fmt(p.amount)} zł
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
