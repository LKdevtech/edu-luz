"use client";

import { useState } from "react";

import { submitContact } from "@/app/(public)/kontakt/actions";

const TOPICS = [
  { label: "Zapytanie o ofertę", color: "#3B8FF0" },
  { label: "Umówienie spotkania", color: "#22C55E" },
  { label: "Pytanie o cenę", color: "#FFCA28" },
  { label: "Inne", color: "#6B6780" },
];

type Status = "idle" | "sending" | "sent" | "error";

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const cls =
    "w-full resize-none bg-transparent px-3.5 py-3 text-[14px] font-medium text-primary outline-none placeholder:text-dim";
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[12px] font-bold text-secondary">{label}</label>
      <div className="rounded-[14px] border-[1.5px] border-subtle bg-main transition-colors focus-within:border-primary/60 focus-within:shadow-[0_0_0_3px_rgba(59,143,240,0.08)]">
        {multiline ? (
          <textarea
            rows={4}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cls}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cls}
          />
        )}
      </div>
    </div>
  );
}

export function KontaktForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const valid = name.trim() !== "" && email.trim() !== "" && message.trim() !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || status === "sending") return;
    setStatus("sending");
    setError(null);
    const res = await submitContact({
      name,
      email,
      phone: phone || undefined,
      topic: topic || undefined,
      message,
    });
    if (res.ok) {
      setStatus("sent");
    } else {
      setStatus("error");
      setError(res.error);
    }
  }

  function reset() {
    setName("");
    setEmail("");
    setPhone("");
    setTopic("");
    setMessage("");
    setError(null);
    setStatus("idle");
  }

  const sending = status === "sending";

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-subtle bg-[linear-gradient(160deg,#232840_0%,#1F2440_100%)] px-7 py-8">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#3B8FF0,#7C5CFC)]" />

      {status === "sent" ? (
        <div className="py-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,rgba(34,197,94,0.3),rgba(6,182,212,0.2))] text-[28px] text-success">
            ✓
          </div>
          <h2 className="mb-1.5 text-[22px] font-black text-primary">Wiadomość wysłana!</h2>
          <p className="mb-5 text-[14px] font-medium leading-[1.6] text-secondary">
            Dziękujemy, {name.trim().split(" ")[0]}. Odezwiemy się najszybciej jak to możliwe.
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-[12px] border border-subtle bg-surface px-6 py-2.5 text-[13px] font-bold text-primary transition-colors hover:bg-surface-hover"
          >
            Wyślij kolejną
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2 className="mb-1 text-[20px] font-black text-primary">Napisz do nas ✉️</h2>
          <p className="mb-6 text-[13px] font-medium text-secondary">
            Odpowiadamy zazwyczaj w ciągu kilku godzin.
          </p>

          <p className="mb-2 text-[12px] font-bold text-dim">Temat</p>
          <div className="mb-5 flex flex-wrap gap-1.5">
            {TOPICS.map((t) => {
              const active = topic === t.label;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setTopic(active ? "" : t.label)}
                  className="rounded-[10px] px-4 py-[7px] text-[12px] font-bold transition-all duration-200"
                  style={
                    active
                      ? { border: `1.5px solid ${t.color}60`, background: `${t.color}18`, color: t.color }
                      : {
                          border: "1.5px solid rgba(59,143,240,0.10)",
                          background: "transparent",
                          color: "#9B97AF",
                        }
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex-[1_1_200px]">
              <Field label="Imię i nazwisko *" placeholder="Jan Kowalski" value={name} onChange={setName} />
            </div>
            <div className="flex-[1_1_200px]">
              <Field label="Telefon" type="tel" placeholder="+48 123 456 789" value={phone} onChange={setPhone} />
            </div>
          </div>
          <Field label="Email *" type="email" placeholder="jan@example.com" value={email} onChange={setEmail} />
          <Field
            label="Wiadomość *"
            placeholder="W czym możemy pomóc?"
            value={message}
            onChange={setMessage}
            multiline
          />

          <button
            type="submit"
            disabled={!valid || sending}
            className="w-full rounded-[14px] py-3.5 text-[15px] font-extrabold text-white transition-all duration-200 disabled:cursor-not-allowed"
            style={
              valid
                ? {
                    background: "linear-gradient(135deg,#3B8FF0,#7C5CFC)",
                    boxShadow: "0 4px 20px rgba(59,143,240,0.21)",
                    opacity: sending ? 0.8 : 1,
                  }
                : { background: "#6B6780" }
            }
          >
            {sending ? "Wysyłanie..." : "Wyślij wiadomość →"}
          </button>

          {status === "error" && error && (
            <p className="mt-3 text-center text-[12px] font-semibold text-danger">{error}</p>
          )}
        </form>
      )}
    </div>
  );
}
