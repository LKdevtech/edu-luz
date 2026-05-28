import { SubjectDot } from '@/lib/components/panel/Badges'
import { getAdminSettings } from '@/lib/queries/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Enums } from '@/lib/types/database.types'

export const dynamic = 'force-dynamic'

const ROLE_LABEL: Record<Enums<'user_role'>, string> = {
  admin: 'Admin',
  tutor: 'Korepetytor',
  parent: 'Rodzic',
  student: 'Uczeń',
}

export default async function AdminSettingsPage() {
  const supabase = createSupabaseServerClient()
  const data = await getAdminSettings(supabase)

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <header className="mb-5">
        <h1 className="text-[20px] font-black text-primary">Ustawienia centrum</h1>
        <p className="text-[12px] text-dim">
          9 sekcji konfiguracji. Edycja inline — pojedyncze zmiany zapisz przez Supabase Studio
          dopóki UI edycji nie zostanie podpięty.
        </p>
      </header>

      <div className="flex flex-col gap-5">
        {/* 1. Centrum */}
        <Section title="🏢 Centrum">
          <KV label="Nazwa" value={data.center.name} />
          {data.center.fullName && <KV label="Pełna nazwa" value={data.center.fullName} />}
          <KV label="Adres" value={data.center.address} />
          <KV label="Telefon" value={data.center.phone} />
          <KV label="Email" value={data.center.email} />
          {data.center.nip && <KV label="NIP" value={data.center.nip} />}
          {data.center.bankAccount && <KV label="Nr konta" value={data.center.bankAccount} mono />}
          {data.center.bankName && <KV label="Bank" value={data.center.bankName} />}
          <KV label="Tytuł przelewu (template)" value={data.center.paymentTitleTemplate} />
        </Section>

        {/* 2. Sale */}
        <Section title="🚪 Sale" count={data.rooms.length}>
          <div className="grid gap-2 md:grid-cols-2">
            {data.rooms.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-[10px] bg-alt p-3"
              >
                <div>
                  <div className="text-[13px] font-extrabold text-primary">{r.name}</div>
                  <div className="text-[11px] text-dim">
                    Pojemność: {r.capacity}
                    {r.equipment && ` · ${r.equipment}`}
                  </div>
                </div>
                <StatusPill active={r.isActive} />
              </div>
            ))}
          </div>
        </Section>

        {/* 3. Przedmioty */}
        <Section title="📚 Przedmioty" count={data.subjects.length}>
          <div className="flex flex-wrap gap-2">
            {data.subjects.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[12px] font-bold"
                style={{ backgroundColor: `${s.color}22`, color: s.color }}
              >
                <SubjectDot color={s.color} />
                {s.name}
                {!s.isActive && <span className="text-[10px] text-dim">(nieaktywny)</span>}
              </span>
            ))}
          </div>
        </Section>

        {/* 4. Godziny pracy: zajęcia */}
        <Section title="⏰ Godziny pracy — zajęcia">
          <div className="grid gap-2 md:grid-cols-2">
            {data.workingHours.lessons.map((w) => (
              <div
                key={w.dayOfWeek}
                className="flex items-center justify-between rounded-[10px] bg-alt p-3"
                style={{ opacity: w.isActive ? 1 : 0.5 }}
              >
                <span className="text-[13px] font-bold text-primary">{w.dayFull}</span>
                <span className="text-[12px] text-secondary">
                  {w.isActive ? `${w.openTime}–${w.closeTime}` : 'Zamknięte'}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* 5. Godziny pracy: kontakt */}
        <Section title="📞 Godziny pracy — kontakt telefoniczny">
          <div className="grid gap-2 md:grid-cols-2">
            {data.workingHours.phone.map((w) => (
              <div
                key={w.dayOfWeek}
                className="flex items-center justify-between rounded-[10px] bg-alt p-3"
                style={{ opacity: w.isActive ? 1 : 0.5 }}
              >
                <span className="text-[13px] font-bold text-primary">{w.dayFull}</span>
                <span className="text-[12px] text-secondary">
                  {w.isActive ? `${w.openTime}–${w.closeTime}` : 'Zamknięte'}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* 6. Przypomnienia płatności */}
        <Section title="🔔 Przypomnienia o płatnościach" count={data.reminderTemplates.length}>
          <div className="flex flex-col gap-2">
            {data.reminderTemplates.map((t) => (
              <div
                key={t.id}
                className="rounded-[10px] bg-alt p-3"
                style={{ borderLeft: '3px solid #FFCA28', opacity: t.isEnabled ? 1 : 0.5 }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-extrabold text-primary">{t.label}</div>
                  <span className="text-[11px] text-secondary">
                    {t.sendDayOfMonth === 0 ? 'ostatni dzień' : `${t.sendDayOfMonth}. dnia miesiąca`} · {t.sendTime}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-dim">Temat: {t.subjectTemplate}</div>
                <pre className="mt-2 whitespace-pre-wrap text-[11px] text-secondary">
                  {t.bodyTemplate}
                </pre>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] italic text-dim">
            Zmienne: {'{rodzic}'}, {'{uczeń}'}, {'{miesiąc}'}, {'{kwota}'}, {'{termin}'}
          </p>
        </Section>

        {/* 7. Warunki umowy */}
        <Section title="📄 Warunki umowy">
          <KV label="Termin płatności" value={`${data.contractTerms.paymentDeadlineDay}. dnia miesiąca`} />
          <KV
            label="Minimalny okres umowy"
            value={`${data.contractTerms.minContractMonths} mies.`}
          />
          <KV
            label="Okres wypowiedzenia"
            value={`${data.contractTerms.cancellationNoticeDays} dni`}
          />
          <KV
            label="Termin odrobienia"
            value={`${data.contractTerms.makeupDeadlineDays} dni`}
          />
          <KV label="Czas na wpis" value={`${data.contractTerms.lateEntryHours} godzin`} />
          <KV
            label="Cutoff odwołań (h)"
            value={`${data.contractTerms.cancellationHoursCutoff} godzin`}
          />
          <KV label="Polityka no-show" value={data.contractTerms.noShowPolicy} />
          <KV label="Polityka odwołań" value={data.contractTerms.cancellationPolicy} />
        </Section>

        {/* 8. Konta */}
        <Section title="👤 Konta" count={data.accounts.length}>
          <div className="flex flex-col gap-2">
            {data.accounts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-[10px] bg-alt p-3"
                style={{ opacity: a.isActive ? 1 : 0.5 }}
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-extrabold text-primary">{a.fullName}</div>
                  <div className="text-[11px] text-dim">{a.email ?? '— bez emaila —'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider"
                    style={{
                      backgroundColor: a.role === 'admin' ? '#7C5CFC22' : '#3B8FF022',
                      color: a.role === 'admin' ? '#7C5CFC' : '#3B8FF0',
                    }}
                  >
                    {ROLE_LABEL[a.role]}
                  </span>
                  <StatusPill active={a.isActive} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <p className="mt-6 text-[11px] italic text-dim">
        ℹ Edycja inline ustawień (sale, przedmioty, przypomnienia) zostanie wpięta w kolejnej
        fazie. Na razie zmiany w Supabase Studio + odświeżenie.
      </p>
    </div>
  )
}

function Section({
  title,
  count,
  children,
}: {
  title: string
  count?: number
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-card bg-surface p-5"
      style={{ border: '1px solid rgba(59,143,240,0.10)' }}
    >
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-[15px] font-extrabold text-primary">{title}</h2>
        {typeof count === 'number' && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
            style={{ backgroundColor: '#1C2035', color: '#9B97AF' }}
          >
            {count}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  )
}

function KV({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-subtle py-2 last:border-b-0">
      <span className="text-[11px] font-bold text-dim">{label}</span>
      <span
        className={
          'max-w-[60%] text-right text-[12px] text-primary' +
          (mono ? ' font-mono text-[11px]' : ' font-semibold')
        }
      >
        {value}
      </span>
    </div>
  )
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider"
      style={
        active
          ? { backgroundColor: '#22C55E22', color: '#22C55E' }
          : { backgroundColor: '#8B879D22', color: '#8B879D' }
      }
    >
      {active ? 'Aktywny' : 'Wyłączony'}
    </span>
  )
}
