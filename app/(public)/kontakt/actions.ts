"use server";

import { Resend } from "resend";
import { z } from "zod";

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

// Stałe biznesowe — adresy nadawcy i odbiorcy są tu hardcoded zamiast w env,
// bo to nie sekrety, tylko dane domenowe (Resend ma zweryfikowaną edu-luz.com).
const TO_EMAIL = "kontakt@edu-luz.com";
const FROM_EMAIL = "EDU LUZ <noreply@edu-luz.com>";

// Server Action — waliduje i wysyła wiadomość mailem przez Resend (decyzja 8).
// Bez zapisu do bazy. Wymaga zmiennej środowiskowej RESEND_API_KEY.
export async function submitContact(input: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Sprawdź dane formularza." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error:
        "Formularz nie jest jeszcze skonfigurowany. Napisz bezpośrednio na kontakt@edu-luz.com.",
    };
  }

  const { name, email, phone, topic, message } = parsed.data;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
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
      error: "Nie udało się wysłać wiadomości. Spróbuj ponownie lub napisz na kontakt@edu-luz.com.",
    };
  }
}
