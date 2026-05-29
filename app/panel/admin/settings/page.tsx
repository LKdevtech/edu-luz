import { AdminSettingsPanel } from '@/lib/components/panel/admin/AdminSettingsPanel'
import { getAdminSettings } from '@/lib/queries/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const supabase = createSupabaseServerClient()
  const data = await getAdminSettings(supabase)

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <AdminSettingsPanel data={data} />
      <PaymentRemindersSettings />
    </div>
  )
}

// Statyczna sekcja MVP — opis działania przypomnień o płatnościach.
// Konfiguracja (dni, treść) docelowo edytowalna; na razie informacyjna.
function PaymentRemindersSettings() {
  const rows: Array<{ label: string; value: string }> = [
    { label: 'Termin wpłaty', value: 'do 10. dnia miesiąca' },
    { label: 'Przypomnienia automatyczne', value: '10. dnia, 20. dnia, ostatni dzień miesiąca' },
    { label: 'Okno deduplikacji', value: 'maks. 1 przypomnienie na 7 dni dla tej samej płatności' },
    { label: 'Wyłączenie per rodzic', value: 'checkbox „Nie wysyłaj przypomnień" przy płatności rodzica' },
    { label: 'Wysyłka ręczna', value: 'przycisk „Wyślij przypomnienia" (hurtowo) i per płatność' },
  ]
  return (
    <section className="mt-6 rounded-card border border-subtle bg-surface p-5">
      <div className="mb-3 flex items-center gap-2">
        <span aria-hidden>🔔</span>
        <h2 className="text-[15px] font-black text-primary">Przypomnienia o płatnościach</h2>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex flex-wrap justify-between gap-2 rounded-[10px] bg-main px-3.5 py-2.5"
          >
            <span className="text-[12px] font-bold text-secondary">{r.label}</span>
            <span className="text-[12px] text-primary">{r.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-dim">
        Konfiguracja treści i dni będzie edytowalna w kolejnym etapie — obecnie wartości są stałe (MVP).
      </p>
    </section>
  )
}
