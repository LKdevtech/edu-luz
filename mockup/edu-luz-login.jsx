import { useState } from "react";

const T = {
  bg: "#151827",
  surface: "#232840",
  surfaceHover: "#2A3050",
  text: "#F0EDE6",
  textMuted: "#9B97AF",
  textDim: "#6B6780",
  primary: "#3B8FF0",
  primaryDark: "#2D7DE8",
  accent: "#7C5CFC",
  secondary: "#FF6F4A",
  tertiary: "#FFCA28",
  cardBorder: "rgba(59,143,240,0.10)",
  danger: "#EF4444",
};

function Input({ label, type = "text", placeholder, icon, value, onChange, right }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: T.textMuted, marginBottom: 6 }}>{label}</label>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: T.bg, borderRadius: 14,
        border: `1.5px solid ${focused ? T.primary + "60" : T.cardBorder}`,
        padding: "0 14px", transition: "border-color 0.2s",
        boxShadow: focused ? `0 0 0 3px ${T.primary}15` : "none",
      }}>
        <span style={{ fontSize: 16, opacity: 0.4 }}>{icon}</span>
        <input
          type={type} placeholder={placeholder} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            background: "transparent", border: "none", outline: "none",
            color: T.text, fontSize: 15, fontWeight: 500, padding: "13px 0",
            width: "100%", fontFamily: "inherit",
          }}
        />
        {right}
      </div>
    </div>
  );
}

function InfoChip({ icon, title, desc, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: T.surface, borderRadius: 14,
      border: `1px solid ${T.cardBorder}`,
      overflow: "hidden", transition: "all 0.2s",
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", background: "transparent", border: "none",
        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
      }}>
        <span style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: color + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15,
        }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: T.text }}>{title}</span>
        <span style={{
          fontSize: 10, color: T.textDim, transition: "transform 0.2s",
          transform: open ? "rotate(180deg)" : "none",
        }}>▼</span>
      </button>
      <div style={{
        maxHeight: open ? 120 : 0, overflow: "hidden",
        transition: "max-height 0.3s ease, opacity 0.25s ease",
        opacity: open ? 1 : 0,
      }}>
        <div style={{
          padding: "0 14px 12px 56px",
          fontSize: 12, color: T.textMuted, lineHeight: 1.7, fontWeight: 500,
        }}>{desc}</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("login");

  const handleLogin = () => {
    setError("");
    if (!email || !password) { setError("Uzupełnij email i hasło"); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setError("Nieprawidłowy email lub hasło"); }, 1200);
  };

  const handleForgot = () => {
    if (!email) { setError("Wpisz email"); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("sent"); }, 1000);
  };

  return (
    <div style={{
      fontFamily: "'Nunito', sans-serif",
      minHeight: "100vh", background: T.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, position: "relative", overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={{ position: "absolute", top: "-12%", right: "-8%", width: 320, height: 320, borderRadius: "50%", background: T.primary, opacity: 0.08, filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-8%", left: "-6%", width: 240, height: 240, borderRadius: "50%", background: T.accent, opacity: 0.06, filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "50%", left: "60%", width: 180, height: 180, borderRadius: "50%", background: T.secondary, opacity: 0.04, filter: "blur(70px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }}>

        {/* Logo + tagline */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: T.primary,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -2, fontStyle: "italic",
            marginBottom: 8,
          }}>Ez</div>
          <div>
            <span style={{ fontSize: 20, fontWeight: 900, color: T.text }}>
              EDU <span style={{ color: T.primary }}>LUZ</span>
            </span>
          </div>
          <p style={{ fontSize: 13, color: T.textMuted, fontWeight: 500, marginTop: 6, lineHeight: 1.5 }}>
            Panel korepetytorów, rodziców i uczniów.
            <br />Harmonogram, notatki, płatności — wszystko w jednym miejscu.
          </p>
        </div>

        {/* Expandable info chips */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
          <InfoChip
            icon="📝" color={T.primary} title="Notatki po każdej lekcji"
            desc="Korepetytor uzupełnia wpis po zajęciach — uczeń i rodzic widzą co było przerabiane, jaki jest postęp i co powtórzyć w domu."
          />
          <InfoChip
            icon="📅" color={T.accent} title="Harmonogram i odrabianie"
            desc="Stały grafik zajęć, odwoływanie z wyprzedzeniem i propozycje odrobienia — wszystko bez telefonowania i pisania SMS-ów."
          />
          <InfoChip
            icon="💳" color={T.tertiary} title="Płatności pod kontrolą"
            desc="Rodzic widzi bieżące należności, historię wpłat i terminy. Automatyczne przypomnienia, zero niespodzianek."
          />
        </div>

        {step === "login" && (
          <>
            {error && (
              <div style={{
                background: T.danger + "12", border: `1px solid ${T.danger}25`,
                borderRadius: 12, padding: "10px 14px", marginBottom: 16,
                fontSize: 13, color: T.danger, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 8,
              }}>⚠️ {error}</div>
            )}

            <Input
              label="Email" type="email" placeholder="jan@example.com" icon="✉️"
              value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
            />
            <Input
              label="Hasło" type={showPw ? "text" : "password"} placeholder="••••••••" icon="🔒"
              value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
              right={
                <button onClick={() => setShowPw(!showPw)}
                  onMouseEnter={e => e.target.style.color = T.primary}
                  onMouseLeave={e => e.target.style.color = T.textDim}
                  style={{
                  background: "transparent", border: "none", color: T.textDim,
                  fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "color 0.2s",
                }}>{showPw ? "Ukryj" : "Pokaż"}</button>
              }
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <button onClick={() => { setStep("forgot"); setError(""); }}
                onMouseEnter={e => e.target.style.textDecoration = "underline"}
                onMouseLeave={e => e.target.style.textDecoration = "none"}
                style={{
                background: "transparent", border: "none", color: T.primary,
                fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
              }}>Nie pamiętam hasła</button>
            </div>

            <button onClick={handleLogin} disabled={loading}
              onMouseEnter={e => { if(!loading) { e.target.style.transform = "scale(1.02)"; e.target.style.boxShadow = `0 6px 24px ${T.primary}50`; }}}
              onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = `0 4px 16px ${T.primary}30`; }}
              style={{
              width: "100%", padding: "14px 0", borderRadius: 14,
              background: T.primary, color: "#fff", border: "none",
              fontSize: 16, fontWeight: 800, cursor: loading ? "wait" : "pointer",
              fontFamily: "inherit", boxShadow: `0 4px 16px ${T.primary}30`,
              opacity: loading ? 0.8 : 1, transition: "all 0.2s",
            }}>
              {loading ? "Logowanie..." : "Zaloguj się"}
            </button>

            {/* Expandable "no account" */}
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <p style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>
                Nie masz konta? Skontaktuj się z centrum —{" "}
                <span style={{ color: T.primary, fontWeight: 700 }}>kontakt@eduluz.pl</span>
              </p>
            </div>
          </>
        )}

        {step === "forgot" && (
          <>
            <button onClick={() => { setStep("login"); setError(""); }} style={{
              background: "transparent", border: "none", color: T.textMuted,
              fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 12,
              fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4,
            }}>← Wróć</button>
            <p style={{ fontSize: 14, color: T.textMuted, marginBottom: 20, fontWeight: 500 }}>
              Podaj email — wyślemy link do zmiany hasła.
            </p>
            {error && (
              <div style={{ background: T.danger + "12", borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: T.danger, fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}
            <Input label="Email" type="email" placeholder="jan@example.com" icon="✉️"
              value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
            />
            <button onClick={handleForgot} disabled={loading} style={{
              width: "100%", padding: "14px 0", borderRadius: 14,
              background: T.primary, color: "#fff", border: "none",
              fontSize: 15, fontWeight: 800, cursor: loading ? "wait" : "pointer",
              fontFamily: "inherit", opacity: loading ? 0.8 : 1,
            }}>{loading ? "Wysyłanie..." : "Wyślij link"}</button>
          </>
        )}

        {step === "sent" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: T.text, marginBottom: 6 }}>Sprawdź skrzynkę</h2>
            <p style={{ fontSize: 13, color: T.textMuted, fontWeight: 500, marginBottom: 24, lineHeight: 1.6 }}>
              Link wysłany na <strong style={{ color: T.text }}>{email}</strong>
            </p>
            <button onClick={() => { setStep("login"); setError(""); }} style={{
              background: T.surface, color: T.text, border: `1px solid ${T.cardBorder}`,
              borderRadius: 14, padding: "12px 28px", fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}>Wróć do logowania</button>
          </div>
        )}
      </div>
    </div>
  );
}
