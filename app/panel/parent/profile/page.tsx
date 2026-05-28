import { getCurrentParentId } from '@/lib/auth/getCurrentParentId'
import { LevelBadge, SubjectDot } from '@/lib/components/panel/Badges'
import { ContactCenter } from '@/lib/components/panel/ContactCenter'
import { ParentNotificationRow } from '@/lib/components/panel/ParentNotificationRow'
import {
  getParentProfile,
  type ChildProfileSection,
} from '@/lib/queries/parent'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Enums } from '@/lib/types/database.types'
import { DAY_NAMES_SHORT } from '@/lib/queries/_helpers'
import { formatBirthDate } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

const NOTIFICATION_LABELS: Partial<
  Record<Enums<'notification_type'>, { label: string; description: string }>
> = {
  payment_reminder_10: {
    label: 'Termin płatności (10. dzień)',
    description: 'Przypomnienie w dniu terminu',
  },
  payment_reminder_20: {
    label: 'Drugie przypomnienie (20. dzień)',
    description: 'Jeśli nie odnotowano wpłaty',
  },
  payment_reminder_last: {
    label: 'Ostatnie przypomnienie',
    description: 'Ostatni dzień miesiąca',
  },
  new_entry: {
    label: 'Nowy wpis z lekcji',
    description: 'Temat, notatki, praca domowa',
  },
  schedule_change: {
    label: 'Zmiana harmonogramu',
    description: 'Odwołania, zmiany sal/godzin',
  },
  makeup_proposal: {
    label: 'Odrabianie',
    description: 'Propozycje i aktualizacje terminów',
  },
  message_received: {
    label: 'Wiadomości',
    description: 'Komunikaty od centrum lub korepetytora',
  },
}

export default async function ParentProfilePage() {
  const parentId = await getCurrentParentId()
  const supabase = createSupabaseServerClient()
  const data = await getParentProfile(supabase, parentId)

  return (
    <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
      {/* ───────── LEFT ───────── */}
      <div className="flex min-w-0 flex-col gap-6">
        {/* Parent info */}
        <section className="rounded-card bg-surface p-5">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-[14px] text-[18px] font-extrabold text-white"
              style={{ background: 'linear-gradient(135deg, #7C5CFC, #E84393)' }}
            >
              {data.parent.initials}
            </div>
            <div className="min-w-0">
              <div className="text-[20px] font-extrabold text-primary">{data.parent.fullName}</div>
              <div className="mt-0.5 text-[12px] font-bold text-accent">
                Rodzic • {data.children.length} {pluralizeChildren(data.children.length)}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <ProfileInfoRow icon="📞" label="Telefon" value={data.parent.phone ?? '—'} />
            <ProfileInfoRow icon="✉" label="Email" value={data.parent.email ?? '—'} />
            <ProfileInfoRow icon="📍" label="Adres" value={data.parent.address ?? '—'} />
          </div>
        </section>

        {/* Children */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span aria-hidden>👨‍👩‍👧‍👦</span>
            <h2 className="text-[15px] font-extrabold text-primary">Dzieci</h2>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
              style={{ backgroundColor: '#232840', color: '#9B97AF' }}
            >
              {data.children.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {data.children.map((section) => (
              <ChildSection key={section.child.id} section={section} />
            ))}
          </div>
        </section>

        {/* Contract terms */}
        <section>
          <details className="rounded-card bg-surface p-4">
            <summary className="cursor-pointer text-[13px] font-extrabold text-primary">
              📄 Regulamin i warunki centrum
            </summary>
            <div className="mt-3 flex flex-col">
              <ContractRow
                label="Termin płatności"
                value={`do ${data.contract.paymentDeadlineDay}. dnia miesiąca`}
              />
              <ContractRow
                label="Minimalny okres umowy"
                value={`${data.contract.minContractMonths} mies.`}
              />
              <ContractRow
                label="Okres wypowiedzenia"
                value={`${data.contract.cancellationNoticeDays} dni`}
              />
              <ContractRow
                label="Termin odrobienia"
                value={`${data.contract.makeupDeadlineDays} dni`}
              />
              <ContractRow
                label="Czas na wpis"
                value={`${data.contract.lateEntryHours} godzin`}
              />
              <ContractRow label="Polityka odwołań" value={data.contract.cancellationPolicy} />
              <ContractRow label="Polityka no-show" value={data.contract.noShowPolicy} />
            </div>
            <p className="mt-3 text-[10px] italic text-dim">
              Warunki obowiązujące wszystkich uczniów centrum EDU LUZ.
            </p>
          </details>
        </section>

        {/* Notifications */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span aria-hidden>🔔</span>
            <h2 className="text-[15px] font-extrabold text-primary">Powiadomienia</h2>
          </div>

          {/* Payment reminders */}
          <div className="mb-3 rounded-card bg-surface p-4">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider"
                style={{ backgroundColor: '#F59E0B22', color: '#F59E0B' }}
              >
                Przypomnienia o płatnościach
              </span>
              <span className="text-[10px] text-dim">— zawsze aktywne</span>
            </div>
            <div>
              {data.notifications.paymentReminders.map((p) => {
                const meta = NOTIFICATION_LABELS[p.type]
                if (!meta) return null
                return (
                  <ParentNotificationRow
                    key={p.type}
                    parentId={parentId}
                    notifType={p.type}
                    initialEmail={p.emailEnabled}
                    initialPush={p.pushEnabled}
                    label={meta.label}
                    description={meta.description}
                    requireAtLeastOne
                  />
                )
              })}
            </div>
            <p className="mt-2 text-[10px] italic text-dim">
              Minimum jeden kanał (email lub push) musi pozostać włączony.
            </p>
          </div>

          {/* Other notifications */}
          <div className="rounded-card bg-surface p-4">
            <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-secondary">
              Pozostałe powiadomienia
            </div>
            <div>
              {data.notifications.others.map((p) => {
                const meta = NOTIFICATION_LABELS[p.type]
                if (!meta) return null
                return (
                  <ParentNotificationRow
                    key={p.type}
                    parentId={parentId}
                    notifType={p.type}
                    initialEmail={p.emailEnabled}
                    initialPush={p.pushEnabled}
                    label={meta.label}
                    description={meta.description}
                  />
                )
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ───────── RIGHT ───────── */}
      <div className="flex flex-col gap-4">
        <aside className="rounded-card bg-alt p-4">
          <div className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-secondary">
            🏢 Centrum {data.center.name}
          </div>
          <div className="flex flex-col gap-2 text-[12px]">
            <div className="flex items-start gap-2">
              <span aria-hidden>📍</span>
              <span className="text-primary">{data.center.address}</span>
            </div>
            <div className="flex items-start gap-2">
              <span aria-hidden>📞</span>
              <span className="font-extrabold text-primary">{data.center.phone}</span>
            </div>
            <div className="flex items-start gap-2">
              <span aria-hidden>✉</span>
              <span className="text-primary">{data.center.email}</span>
            </div>
          </div>
          <ContactCenter parentId={parentId} adminId={data.center.adminId} />
        </aside>

        <aside className="rounded-card bg-alt p-4">
          <div className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-secondary">
            ⚙ Konto
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="rounded-[8px] border border-subtle bg-transparent px-3 py-2 text-left text-[12px] font-semibold text-secondary hover:bg-surface-hover"
            >
              🔒 Zmień hasło
            </button>
            <button
              type="button"
              className="rounded-[8px] border px-3 py-2 text-left text-[12px] font-semibold opacity-80 hover:opacity-100"
              style={{ borderColor: '#EF444433', color: '#EF4444' }}
            >
              🚪 Wyloguj się
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Internal
// ════════════════════════════════════════════════════════════════════════════

function ChildSection({ section }: { section: ChildProfileSection }) {
  const { child, classes, totalMonthly } = section
  const classCount = classes.length

  return (
    <details className="rounded-card bg-surface p-4">
      <summary className="flex cursor-pointer items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-extrabold"
          style={{ backgroundColor: `${child.avatarColor}29`, color: child.avatarColor }}
        >
          {child.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-extrabold text-primary">{child.fullName}</span>
            <LevelBadge level={child.level} label={child.levelLabel} />
          </div>
          <div className="text-[11px] text-secondary">
            {child.schoolClass} • {classCount} {pluralizeClasses(classCount)} •{' '}
            <span className="font-extrabold" style={{ color: child.avatarColor }}>
              {formatAmount(totalMonthly)} zł/msc
            </span>
          </div>
        </div>
      </summary>

      <div className="mt-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-dim">
              Data urodzenia
            </div>
            <div className="mt-0.5 font-bold text-primary">{formatBirthDate(child.birthDate)}</div>
          </div>
          {child.schoolName && (
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-dim">
                Szkoła
              </div>
              <div className="mt-0.5 font-bold text-primary">{child.schoolName}</div>
            </div>
          )}
        </div>

        {classes.length > 0 ? (
          <div>
            <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-dim">
              Zajęcia
            </div>
            <div className="flex flex-col gap-2">
              {classes.map((cls) => (
                <article
                  key={cls.classId}
                  className="rounded-[10px] bg-alt p-3"
                  style={{ borderLeft: `3px solid ${cls.subjectColor}` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <SubjectDot color={cls.subjectColor} />
                      <span className="text-[13px] font-extrabold text-primary">
                        {cls.subjectName}
                      </span>
                      <span
                        className="rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase"
                        style={
                          cls.form === 'group'
                            ? { backgroundColor: '#7C5CFC22', color: '#7C5CFC' }
                            : { backgroundColor: '#3B8FF022', color: '#3B8FF0' }
                        }
                      >
                        {cls.form === 'group' ? `GRUPA${cls.groupName ? ` · ${cls.groupName}` : ''}` : 'INDYW.'}
                      </span>
                    </div>
                    <span className="text-[13px] font-extrabold text-primary">
                      {formatAmount(cls.monthlyFee)} zł/msc
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-secondary">
                    <span>👤 {cls.tutorName}</span>
                    <span>
                      🕐{' '}
                      {cls.weeklySlots.map((s, i) => (
                        <span key={i}>
                          {i > 0 && ', '}
                          {DAY_NAMES_SHORT[s.dayOfWeek]} {s.startTime}
                        </span>
                      ))}
                    </span>
                    {cls.roomName && <span>📍 {cls.roomName}</span>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-[12px] italic text-dim">Brak zajęć.</div>
        )}
      </div>
    </details>
  )
}

function ProfileInfoRow({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-5 shrink-0 text-[14px]" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-dim">{label}</div>
        <div className="text-[13px] font-semibold text-primary">{value}</div>
      </div>
    </div>
  )
}

function ContractRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-subtle py-2 text-[12px] last:border-b-0">
      <span className="text-secondary">{label}</span>
      <span className="max-w-[60%] text-right font-bold text-primary">{value}</span>
    </div>
  )
}

function pluralizeChildren(n: number): string {
  if (n === 1) return 'dziecko'
  if (n >= 2 && n <= 4) return 'dzieci'
  return 'dzieci'
}

function pluralizeClasses(n: number): string {
  if (n === 1) return 'zajęcia'
  return 'zajęć'
}

function formatAmount(n: number): string {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(n)
}
