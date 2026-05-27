"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

// Logowanie — TYLKO UI (sekcja 6.6). Bez podpięcia do Supabase Auth:
// logowanie zwraca przykładowy błąd, "Nie pamiętam hasła" symuluje wysyłkę.

function Input({
  label,
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
  right,
}: {
  label: string;
  type?: string;
  placeholder: string;
  icon: string;
  value: string;
  onChange: (v: string) => void;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[13px] font-bold text-secondary">{label}</label>
      <div className="flex items-center gap-2.5 rounded-[14px] border-[1.5px] border-subtle bg-main px-3.5 transition-colors focus-within:border-primary/60 focus-within:shadow-[0_0_0_3px_rgba(59,143,240,0.08)]">
        <span className="text-[16px] opacity-40">{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-3.5 text-[15px] font-medium text-primary outline-none placeholder:text-dim"
        />
        {right}
      </div>
    </div>
  );
}

function InfoChip({
  icon,
  title,
  desc,
  color,
}: {
  icon: string;
  title: string;
  desc: string;
  color: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-[14px] border border-subtle bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left"
      >
        <span
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] text-[15px]"
          style={{ background: `${color}18` }}
        >
          {icon}
        </span>
        <span className="flex-1 text-[13px] font-bold text-primary">{title}</span>
        <span
          className="text-[10px] text-dim transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        >
          ▼
        </span>
      </button>
      <div
        className="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
        style={{ maxHeight: open ? 120 : 0, opacity: open ? 1 : 0 }}
      >
        <div className="pb-3 pl-14 pr-3.5 text-[12px] font-medium leading-[1.7] text-secondary">
          {desc}
        </div>
      </div>
    </div>
  );
}

const primaryBtn =
  "w-full rounded-[14px] bg-primary py-3.5 text-[16px] font-extrabold text-white shadow-[0_4px_16px_rgba(59,143,240,0.31)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_6px_24px_rgba(59,143,240,0.5)] disabled:cursor-wait disabled:opacity-80";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"login" | "forgot" | "sent">("login");

  function handleLogin() {
    setError("");
    if (!email || !password) {
      setError("Uzupełnij email i hasło");
      return;
    }
    setLoading(true);
    // UI-only: brak prawdziwego auth — pokazujemy przykładowy błąd.
    setTimeout(() => {
      setLoading(false);
      setError("Nieprawidłowy email lub hasło");
    }, 1200);
  }

  function handleForgot() {
    if (!email) {
      setError("Wpisz email");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("sent");
    }, 1000);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-main p-5">
      {/* Blur blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute h-80 w-80 rounded-full bg-primary opacity-[0.08] blur-[80px]"
        style={{ top: "-12%", right: "-8%" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute h-60 w-60 rounded-full bg-accent opacity-[0.06] blur-[60px]"
        style={{ bottom: "-8%", left: "-6%" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute h-44 w-44 rounded-full bg-secondary opacity-[0.04] blur-[70px]"
        style={{ top: "50%", left: "60%" }}
      />

      <div className="relative z-[1] w-full max-w-[400px]">
        {/* Logo + tagline */}
        <div className="mb-5 text-center">
          <Image
            src="/logo-ez.png"
            alt="EDU LUZ"
            width={56}
            height={56}
            priority
            className="mx-auto mb-2"
          />
          <div>
            <span className="text-[20px] font-black text-primary">
              EDU <span className="text-link">LUZ</span>
            </span>
          </div>
          <p className="mt-1.5 text-[13px] font-medium leading-[1.5] text-secondary">
            Panel korepetytorów, rodziców i uczniów.
            <br />
            Harmonogram, notatki, płatności — wszystko w jednym miejscu.
          </p>
        </div>

        {/* Rozwijane info */}
        <div className="mb-6 flex flex-col gap-1.5">
          <InfoChip
            icon="📝"
            color="#3B8FF0"
            title="Notatki po każdej lekcji"
            desc="Korepetytor uzupełnia wpis po zajęciach — uczeń i rodzic widzą co było przerabiane, jaki jest postęp i co powtórzyć w domu."
          />
          <InfoChip
            icon="📅"
            color="#7C5CFC"
            title="Harmonogram i odrabianie"
            desc="Stały grafik zajęć, odwoływanie z wyprzedzeniem i propozycje odrobienia — wszystko bez telefonowania i pisania SMS-ów."
          />
          <InfoChip
            icon="💳"
            color="#FFCA28"
            title="Płatności pod kontrolą"
            desc="Rodzic widzi bieżące należności, historię wpłat i terminy. Automatyczne przypomnienia, zero niespodzianek."
          />
        </div>

        {step === "login" && (
          <>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-[12px] border border-danger/25 bg-danger/[0.12] px-3.5 py-2.5 text-[13px] font-semibold text-danger">
                ⚠️ {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="jan@example.com"
              icon="✉️"
              value={email}
              onChange={(v) => {
                setEmail(v);
                setError("");
              }}
            />
            <Input
              label="Hasło"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              icon="🔒"
              value={password}
              onChange={(v) => {
                setPassword(v);
                setError("");
              }}
              right={
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="whitespace-nowrap text-[12px] font-bold text-dim transition-colors hover:text-link"
                >
                  {showPw ? "Ukryj" : "Pokaż"}
                </button>
              }
            />

            <div className="mb-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setStep("forgot");
                  setError("");
                }}
                className="text-[12px] font-bold text-link hover:underline"
              >
                Nie pamiętam hasła
              </button>
            </div>

            <button type="button" onClick={handleLogin} disabled={loading} className={primaryBtn}>
              {loading ? "Logowanie..." : "Zaloguj się"}
            </button>

            <div className="mt-5 text-center">
              <p className="text-[11px] font-medium text-dim">
                Nie masz konta? Skontaktuj się z centrum —{" "}
                <span className="font-bold text-link">kontakt@edu-luz.com</span>
              </p>
            </div>
          </>
        )}

        {step === "forgot" && (
          <>
            <button
              type="button"
              onClick={() => {
                setStep("login");
                setError("");
              }}
              className="mb-3 flex items-center gap-1 text-[13px] font-bold text-secondary"
            >
              ← Wróć
            </button>
            <p className="mb-5 text-[14px] font-medium text-secondary">
              Podaj email — wyślemy link do zmiany hasła.
            </p>
            {error && (
              <div className="mb-4 rounded-[12px] bg-danger/[0.12] px-3.5 py-2.5 text-[13px] font-semibold text-danger">
                ⚠️ {error}
              </div>
            )}
            <Input
              label="Email"
              type="email"
              placeholder="jan@example.com"
              icon="✉️"
              value={email}
              onChange={(v) => {
                setEmail(v);
                setError("");
              }}
            />
            <button type="button" onClick={handleForgot} disabled={loading} className={primaryBtn}>
              {loading ? "Wysyłanie..." : "Wyślij link"}
            </button>
          </>
        )}

        {step === "sent" && (
          <div className="text-center">
            <div className="mb-4 text-[40px]">✉️</div>
            <h2 className="mb-1.5 text-[20px] font-black text-primary">Sprawdź skrzynkę</h2>
            <p className="mb-6 text-[13px] font-medium leading-[1.6] text-secondary">
              Link wysłany na <strong className="text-primary">{email}</strong>
            </p>
            <button
              type="button"
              onClick={() => {
                setStep("login");
                setError("");
              }}
              className="rounded-[14px] border border-subtle bg-surface px-7 py-3 text-[14px] font-bold text-primary transition-colors hover:bg-surface-hover"
            >
              Wróć do logowania
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
