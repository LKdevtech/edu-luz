import 'server-only'

import { Resend } from 'resend'

// Fundament wysyłki email (Resend). Na razie nigdzie nie podpięty w UI — kolejne
// etapy (przypomnienia płatności, odwołania lekcji, powiadomienia admina) będą
// wołać te helpery z Server Actions / cron jobów.

// Instancja Resend z klucza środowiskowego. Konstruktor Resend RZUCA przy braku
// klucza, więc gdy go nie ma podajemy placeholder — `sendEmail` i tak najpierw
// sprawdza obecność RESEND_API_KEY i zwraca czytelny błąd, nie wysyłając nic.
export const resend = new Resend(process.env.RESEND_API_KEY ?? 'RESEND_API_KEY_NOT_SET')

// Nadawca — konfigurowalny z env, z sensownym domyślnym (zweryfikowana domena).
const FROM_EMAIL = process.env.EMAIL_FROM ?? 'EDU LUZ <noreply@edu-luz.com>'

// Dane centrum do stopki maili.
const CENTER = {
  name: 'EDU LUZ',
  address: 'TOMAX lok. 209C, ul. P.O.W. 17, 97-200 Tomaszów Mazowiecki',
  phone: '604 607 934',
  email: 'kontakt@edu-luz.com',
} as const

// Kolory marki (sekcja 3.3 CLAUDE.md) — używane inline (klienty pocztowe
// wymagają stylów inline, nie wspierają zewnętrznego CSS).
const COLOR = {
  primary: '#3B8FF0',
  text: '#1F2433',
  muted: '#6B6780',
  border: '#E6E8EF',
  bg: '#F4F6FB',
  danger: '#EF4444',
} as const

// ════════════════════════════════════════════════════════════════════════════
// Typy
// ════════════════════════════════════════════════════════════════════════════

export type SendEmailParams = {
  to: string | string[]
  subject: string
  html: string
  /** Opcjonalna wersja tekstowa (poprawia dostarczalność). */
  text?: string
  /** Opcjonalny adres do odpowiedzi. */
  replyTo?: string
}

export type SendEmailResult = { ok: true; id: string } | { ok: false; error: string }

export type PaymentReminderParams = {
  parentEmail: string
  parentName: string
  studentName: string
  /** Kwota w złotych (np. 1680 lub 1680.5). */
  amount: number
  /** Czytelna etykieta miesiąca, np. "Maj 2026". */
  monthLabel: string
}

export type LessonCancellationParams = {
  recipientEmail: string
  recipientName: string
  /** Data lekcji, np. "12 maja 2026" lub "2026-05-12". */
  lessonDate: string
  /** Godzina lekcji, np. "16:00–17:00". */
  lessonTime: string
  /** Nazwa przedmiotu, np. "Matematyka". */
  subject: string
  tutorName: string
  /** Powód odwołania (opcjonalny). */
  reason?: string
}

export type GenericNotificationParams = {
  to: string | string[]
  name: string
  title: string
  message: string
}

// ════════════════════════════════════════════════════════════════════════════
// Helpery wewnętrzne
// ════════════════════════════════════════════════════════════════════════════

/** Escape danych użytkownika wstawianych do HTML maila. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const plnFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
})

function formatPln(amount: number): string {
  return plnFormatter.format(amount)
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Wspólny layout maila: nagłówek z marką + treść + stopka z danymi centrum.
 * `bodyHtml` musi już być bezpieczny (escapowany tam gdzie trzeba).
 */
function wrapTemplate(bodyHtml: string): string {
  return `<!doctype html>
<html lang="pl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:${COLOR.bg};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${COLOR.text};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.bg};padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid ${COLOR.border};border-radius:16px;overflow:hidden;">
        <tr><td style="background:${COLOR.primary};padding:24px 32px;">
          <span style="font-size:22px;font-weight:800;color:#FFFFFF;letter-spacing:0.5px;">EDU&nbsp;LUZ</span>
        </td></tr>
        <tr><td style="padding:32px;font-size:15px;line-height:1.65;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid ${COLOR.border};font-size:12px;line-height:1.6;color:${COLOR.muted};">
          <strong style="color:${COLOR.text};">${CENTER.name}</strong><br>
          ${esc(CENTER.address)}<br>
          tel. ${esc(CENTER.phone)} &middot; <a href="mailto:${CENTER.email}" style="color:${COLOR.primary};text-decoration:none;">${CENTER.email}</a>
        </td></tr>
      </table>
      <p style="max-width:560px;margin:16px auto 0;font-size:11px;color:${COLOR.muted};text-align:center;">
        Wiadomość wysłana automatycznie z systemu EDU LUZ. Prosimy nie odpowiadać na ten adres.
      </p>
    </td></tr>
  </table>
</body>
</html>`
}

// ════════════════════════════════════════════════════════════════════════════
// Rdzeń: sendEmail (wrapper z logowaniem i jednym retry)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Wysyła maila przez Resend. Obsługuje błędy, loguje wynik i ponawia JEDEN raz
 * przy niepowodzeniu (łącznie max 2 próby). Nigdy nie rzuca — zwraca wynik.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { to, subject, html, text, replyTo } = params

  if (!process.env.RESEND_API_KEY) {
    const error = 'Brak RESEND_API_KEY — wysyłka maili nie jest skonfigurowana.'
    console.error(`[email] ${error}`)
    return { ok: false, error }
  }

  const maxAttempts = 2 // pierwsza próba + 1 retry
  let lastError = 'Nieznany błąd wysyłki.'

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        ...(text ? { text } : {}),
        ...(replyTo ? { replyTo } : {}),
      })

      if (error) {
        lastError = error.message
        console.error(`[email] Próba ${attempt}/${maxAttempts} nieudana: ${error.message}`)
      } else if (data) {
        console.info(`[email] Wysłano "${subject}" (id=${data.id}) do ${String(to)}`)
        return { ok: true, id: data.id }
      } else {
        lastError = 'Resend nie zwrócił identyfikatora wiadomości.'
        console.error(`[email] Próba ${attempt}/${maxAttempts}: ${lastError}`)
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
      console.error(`[email] Próba ${attempt}/${maxAttempts} wyjątek: ${lastError}`)
    }

    if (attempt < maxAttempts) await sleep(400)
  }

  return { ok: false, error: lastError }
}

// ════════════════════════════════════════════════════════════════════════════
// Szablony domenowe
// ════════════════════════════════════════════════════════════════════════════

/** Przypomnienie o płatności miesięcznej (rodzic). */
export async function sendPaymentReminder(
  params: PaymentReminderParams,
): Promise<SendEmailResult> {
  const { parentEmail, parentName, studentName, amount, monthLabel } = params
  const subject = `Przypomnienie o płatności — ${monthLabel}`

  const body = `
    <p style="margin:0 0 16px;">Dzień dobry, ${esc(parentName)},</p>
    <p style="margin:0 0 16px;">
      przypominamy o płatności za zajęcia w centrum EDU LUZ dla
      <strong>${esc(studentName)}</strong> za okres <strong>${esc(monthLabel)}</strong>.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;border-collapse:collapse;">
      <tr>
        <td style="padding:16px 20px;background:${COLOR.bg};border-radius:12px;">
          <span style="display:block;font-size:12px;color:${COLOR.muted};text-transform:uppercase;letter-spacing:1px;">Kwota do zapłaty</span>
          <span style="display:block;margin-top:4px;font-size:28px;font-weight:800;color:${COLOR.primary};">${formatPln(amount)}</span>
          <span style="display:block;margin-top:4px;font-size:13px;color:${COLOR.muted};">za ${esc(monthLabel)} · ${esc(studentName)}</span>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px;">
      Prosimy o uregulowanie należności zgodnie z warunkami umowy. W razie pytań
      dotyczących płatności jesteśmy do dyspozycji pod numerem tel.
      <strong>${esc(CENTER.phone)}</strong>.
    </p>
    <p style="margin:0;">Dziękujemy i pozdrawiamy,<br>zespół EDU LUZ</p>
  `

  const text = [
    `Dzień dobry, ${parentName},`,
    '',
    `przypominamy o płatności za zajęcia EDU LUZ dla ${studentName} za okres ${monthLabel}.`,
    `Kwota do zapłaty: ${formatPln(amount)}.`,
    '',
    `W razie pytań: tel. ${CENTER.phone}.`,
    '',
    'Zespół EDU LUZ',
    CENTER.address,
  ].join('\n')

  return sendEmail({ to: parentEmail, subject, html: wrapTemplate(body), text })
}

/** Informacja o odwołaniu lekcji (rodzic / uczeń). */
export async function sendLessonCancellation(
  params: LessonCancellationParams,
): Promise<SendEmailResult> {
  const { recipientEmail, recipientName, lessonDate, lessonTime, subject, tutorName, reason } =
    params
  const emailSubject = `Odwołana lekcja — ${subject}, ${lessonDate}`

  const reasonRow = reason
    ? `<tr>
         <td style="padding:6px 0;color:${COLOR.muted};width:120px;">Powód</td>
         <td style="padding:6px 0;font-weight:600;">${esc(reason)}</td>
       </tr>`
    : ''

  const body = `
    <p style="margin:0 0 16px;">Dzień dobry, ${esc(recipientName)},</p>
    <p style="margin:0 0 16px;">
      informujemy, że poniższa lekcja została <strong style="color:${COLOR.danger};">odwołana</strong>:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;padding:16px 20px;background:${COLOR.bg};border-radius:12px;border-collapse:collapse;font-size:14px;">
      <tr>
        <td style="padding:6px 0;color:${COLOR.muted};width:120px;">Przedmiot</td>
        <td style="padding:6px 0;font-weight:600;">${esc(subject)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:${COLOR.muted};">Data</td>
        <td style="padding:6px 0;font-weight:600;">${esc(lessonDate)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:${COLOR.muted};">Godzina</td>
        <td style="padding:6px 0;font-weight:600;">${esc(lessonTime)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:${COLOR.muted};">Korepetytor</td>
        <td style="padding:6px 0;font-weight:600;">${esc(tutorName)}</td>
      </tr>
      ${reasonRow}
    </table>
    <p style="margin:0 0 16px;">
      W sprawie odrobienia lekcji skontaktujemy się z Państwem przez panel EDU LUZ
      lub telefonicznie pod numerem <strong>${esc(CENTER.phone)}</strong>.
    </p>
    <p style="margin:0;">Pozdrawiamy,<br>zespół EDU LUZ</p>
  `

  const text = [
    `Dzień dobry, ${recipientName},`,
    '',
    'informujemy, że poniższa lekcja została odwołana:',
    `Przedmiot: ${subject}`,
    `Data: ${lessonDate}`,
    `Godzina: ${lessonTime}`,
    `Korepetytor: ${tutorName}`,
    ...(reason ? [`Powód: ${reason}`] : []),
    '',
    `Kontakt: tel. ${CENTER.phone}.`,
    '',
    'Zespół EDU LUZ',
  ].join('\n')

  return sendEmail({ to: recipientEmail, subject: emailSubject, html: wrapTemplate(body), text })
}

/** Uniwersalne powiadomienie (np. komunikat od admina). */
export async function sendGenericNotification(
  params: GenericNotificationParams,
): Promise<SendEmailResult> {
  const { to, name, title, message } = params

  // Zachowaj łamanie linii z treści w HTML.
  const messageHtml = esc(message).replace(/\n/g, '<br>')

  const body = `
    <p style="margin:0 0 16px;">Dzień dobry, ${esc(name)},</p>
    <h2 style="margin:0 0 12px;font-size:18px;font-weight:800;color:${COLOR.text};">${esc(title)}</h2>
    <div style="margin:0 0 16px;color:${COLOR.text};">${messageHtml}</div>
    <p style="margin:0;">Pozdrawiamy,<br>zespół EDU LUZ</p>
  `

  const text = [`Dzień dobry, ${name},`, '', title, '', message, '', 'Zespół EDU LUZ'].join('\n')

  return sendEmail({ to, subject: title, html: wrapTemplate(body), text })
}
