"use server";

import { z } from "zod";
import { Resend } from "resend";

// Walidacja formularza kontaktowego (sekcja 9.3 — Zod).
const contactSchema = z.object({
  name: z.string().trim().min(2, "Podaj imię i nazwisko."),
  email: z.email("Podaj poprawny adres e-mail."),
  phone: z.string().trim().max(30).optional(),
  topic: z.string().trim().max(60).optional(),
  message: z.string().trim().min(5, "Napisz treść wiadomości.").max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactResult = { ok: true } | { ok: false; error: string };

// Server Action — waliduje i wysyła wiadomość mailem przez Resend (decyzja 8).
// Bez zapisu do bazy. Wymaga zmiennych: RESEND_API_KEY, CONTACT_TO_EMAIL,
// CONTACT_FROM_EMAIL (patrz .env.example).
export async function submitContact(input: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Sprawdź dane formularza." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    return {
      ok: false,
      error:
        "Formularz nie jest jeszcze skonfigurowany. Napisz bezpośrednio na kontakt@eduluz.pl.",
    };
  }

  const { name, email, phone, topic, message } = parsed.data;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Formularz kontaktowy${topic ? ` — ${topic}` : ""}: ${name}`,
      text: [
        `Imię i nazwisko: ${name}`,
        `Email: ${email}`,
        `Telefon: ${phone || "—"}`,
        `Temat: ${topic || "—"}`,
        "",
        message,
      ].join("\n"),
    });

    if (error) {
      return { ok: false, error: "Nie udało się wysłać wiadomości. Spróbuj ponownie później." };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Nie udało się wysłać wiadomości. Spróbuj ponownie lub napisz na kontakt@eduluz.pl.",
    };
  }
}
