import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", primaryDark: "#2D7DE8", secondary: "#FF6F4A",
  tertiary: "#FFCA28", accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4",
  cardBorder: "rgba(59,143,240,0.10)",
};

function Blob({ color, size, top, left, right, bottom, opacity = 0.06 }) {
  return <div style={{ position: "absolute", width: size, height: size, borderRadius: "50%", background: color, opacity, filter: "blur(80px)", pointerEvents: "none", top, left, right, bottom }} />;
}

function Input({ label, type = "text", placeholder, value, onChange, multiline = false }) {
  const [focused, setFocused] = useState(false);
  const shared = {
    background: "transparent", border: "none", outline: "none",
    color: T.text, fontSize: 14, fontWeight: 500, padding: "12px 14px",
    width: "100%", fontFamily: "inherit", resize: "none",
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.textMuted, marginBottom: 6 }}>{label}</label>
      <div style={{
        background: T.bg, borderRadius: 14,
        border: `1.5px solid ${focused ? T.primary + "60" : T.cardBorder}`,
        transition: "border-color 0.2s",
        boxShadow: focused ? `0 0 0 3px ${T.primary}15` : "none",
      }}>
        {multiline ? (
          <textarea rows={4} placeholder={placeholder} value={value} onChange={onChange}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={shared} />
        ) : (
          <input type={type} placeholder={placeholder} value={value} onChange={onChange}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={shared} />
        )}
      </div>
    </div>
  );
}

function ContactItem({ icon, label, value, href, color }) {
  const [hovered, setHovered] = useState(false);
  const content = (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", gap: 14, alignItems: "flex-start",
        padding: "14px 16px", borderRadius: 16,
        background: hovered ? color + "10" : "transparent",
        border: `1px solid ${hovered ? color + "25" : "transparent"}`,
        transition: "all 0.2s", cursor: href ? "pointer" : "default",
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 14, flexShrink: 0,
        background: color + "18", border: `1px solid ${color}20`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
      }}>{icon}</div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: T.textDim, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: 0 }}>{value}</p>
      </div>
    </div>
  );
  if (href) return <a href={href} style={{ textDecoration: "none", display: "block" }}>{content}</a>;
  return content;
}

export default function KontaktPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const topics = [
    { label: "Zapytanie o ofertę", color: T.primary },
    { label: "Umówienie spotkania", color: T.success },
    { label: "Pytanie o cenę", color: T.tertiary },
    { label: "Inne", color: T.textDim },
  ];

  const handleSend = () => {
    if (!name || !email || !message) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1200);
  };

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={{ background: "rgba(21,24,39,0.85)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${T.cardBorder}`, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: -2, fontStyle: "italic" }}>Ez</div>
            <span style={{ fontSize: 16, fontWeight: 900 }}>EDU <span style={{ color: T.primary }}>LUZ</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {["Strona główna", "Oferta i cennik", "O nas", "Kontakt"].map((l, i) => {
              const [h, setH] = useState(false);
              return <span key={l} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
                style={{ fontSize: 13, fontWeight: 600, color: i === 3 ? T.primary : h ? T.text : T.textMuted, cursor: "pointer", transition: "color 0.2s" }}>{l}</span>;
            })}
            <button style={{ background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "transform 0.15s" }}
              onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; e.target.style.boxShadow = `0 4px 16px ${T.primary}40`; }}
              onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}
            >Zaloguj się</button>
          </div>
        </div>
      </nav>

      {/* HERO — more colorful */}
      <section style={{ padding: "52px 0 20px", position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${T.bg} 0%, #171A30 50%, ${T.bgAlt} 100%)` }}>
        <Blob color={T.primary} size={320} top={-80} right={-60} opacity={0.08} />
        <Blob color={T.secondary} size={200} top={20} left={-40} opacity={0.05} />
        <Blob color={T.accent} size={160} bottom={-40} right={120} opacity={0.04} />
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 800, padding: "5px 14px", borderRadius: 50, background: T.secondary + "20", color: T.secondary }}>📍 Tomaszów Mazowiecki</span>
            <span style={{ fontSize: 12, fontWeight: 800, padding: "5px 14px", borderRadius: 50, background: T.success + "20", color: T.success }}>Odpowiadamy szybko</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.15, letterSpacing: -0.5, marginBottom: 12 }}>
            Skontaktuj <span style={{ color: T.primary }}>się z nami</span>
          </h1>
          <p style={{ fontSize: 16, color: T.textMuted, fontWeight: 500, maxWidth: 480, lineHeight: 1.7 }}>
            Masz pytania? Chcesz umówić spotkanie organizacyjne? Napisz lub zadzwoń.
          </p>
        </div>
      </section>

      {/* FORM + INFO */}
      <section style={{ padding: "40px 0 56px", background: T.bgAlt, position: "relative", overflow: "hidden" }}>
        <Blob color={T.tertiary} size={250} bottom={-60} right={-30} opacity={0.03} />
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", display: "flex", gap: 28, flexWrap: "wrap", position: "relative", zIndex: 1 }}>

          {/* LEFT — form */}
          <div style={{ flex: "1 1 440px" }}>
            <div style={{
              background: `linear-gradient(160deg, ${T.surface} 0%, #1F2440 100%)`,
              borderRadius: 22, padding: "32px 28px",
              border: `1px solid ${T.cardBorder}`,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${T.primary}, ${T.accent})` }} />

              {!sent ? (
                <>
                  <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>Napisz do nas ✉️</h2>
                  <p style={{ fontSize: 13, color: T.textMuted, fontWeight: 500, marginBottom: 24 }}>Odpowiadamy zazwyczaj w ciągu kilku godzin.</p>

                  <p style={{ fontSize: 12, fontWeight: 700, color: T.textDim, marginBottom: 8 }}>Temat</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                    {topics.map(t => (
                      <button key={t.label} onClick={() => setTopic(t.label)} style={{
                        padding: "7px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                        border: `1.5px solid ${topic === t.label ? t.color + "60" : T.cardBorder}`,
                        background: topic === t.label ? t.color + "18" : "transparent",
                        color: topic === t.label ? t.color : T.textMuted,
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                      }}>{t.label}</button>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 200px" }}>
                      <Input label="Imię i nazwisko *" placeholder="Jan Kowalski" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div style={{ flex: "1 1 200px" }}>
                      <Input label="Telefon" type="tel" placeholder="+48 123 456 789" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                  </div>
                  <Input label="Email *" type="email" placeholder="jan@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                  <Input label="Wiadomość *" placeholder="W czym możemy pomóc?" value={message} onChange={e => setMessage(e.target.value)} multiline />

                  <button onClick={handleSend} disabled={loading || !name || !email || !message} style={{
                    width: "100%", padding: "14px 0", borderRadius: 14,
                    background: (!name || !email || !message) ? T.textDim : `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
                    color: "#fff", border: "none", fontSize: 15, fontWeight: 800,
                    cursor: (!name || !email || !message) ? "not-allowed" : loading ? "wait" : "pointer",
                    fontFamily: "inherit", transition: "all 0.2s",
                    boxShadow: (name && email && message) ? `0 4px 20px ${T.primary}35` : "none",
                    opacity: loading ? 0.8 : 1,
                  }}>
                    {loading ? "Wysyłanie..." : "Wyślij wiadomość →"}
                  </button>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px",
                    background: `linear-gradient(135deg, ${T.success}30, ${T.cyan}20)`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                  }}>✓</div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Wiadomość wysłana!</h2>
                  <p style={{ fontSize: 14, color: T.textMuted, fontWeight: 500, marginBottom: 20, lineHeight: 1.6 }}>
                    Dziękujemy, {name.split(" ")[0]}. Odezwiemy się najszybciej jak to możliwe.
                  </p>
                  <button onClick={() => { setSent(false); setName(""); setEmail(""); setPhone(""); setMessage(""); setTopic(""); }} style={{
                    background: T.surface, color: T.text, border: `1px solid ${T.cardBorder}`,
                    borderRadius: 12, padding: "10px 24px", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>Wyślij kolejną</button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — contact info */}
          <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Contact details — each with its own color */}
            <div style={{
              background: `linear-gradient(160deg, ${T.surface} 0%, #1E2540 100%)`,
              borderRadius: 22, padding: "20px 8px",
              border: `1px solid ${T.cardBorder}`,
            }}>
              <ContactItem icon="📞" label="Telefon" value="+48 [numer placeholder]" href="tel:+48000000000" color={T.success} />
              <ContactItem icon="✉️" label="Email" value="kontakt@eduluz.pl" href="mailto:kontakt@eduluz.pl" color={T.primary} />
              <ContactItem icon="📍" label="Adres" value={<>[adres placeholder]<br />Tomaszów Mazowiecki</>} color={T.secondary} />
              <ContactItem icon="🕐" label="Godziny zajęć" value={<>Pon–Pt: 14:00–20:00<br />Sob: 9:00–14:00</>} color={T.accent} />
            </div>

            {/* Social media */}
            <div style={{
              background: T.surface, borderRadius: 18, padding: "20px 22px",
              border: `1px solid ${T.cardBorder}`,
            }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: T.textDim, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.8 }}>Social media</p>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { name: "Facebook", icon: "f", color: "#1877F2" },
                  { name: "Instagram", icon: "ig", color: "#E4405F" },
                  { name: "TikTok", icon: "tt", color: "#ff0050" },
                ].map(s => (
                  <div key={s.name} style={{
                    flex: 1, padding: "12px 0", borderRadius: 14,
                    background: s.color + "12", border: `1.5px solid ${s.color}20`,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    cursor: "pointer", transition: "transform 0.15s",
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: s.color + "CC" }}>{s.name}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 10, color: T.textDim, fontWeight: 500, marginTop: 10, textAlign: "center", fontStyle: "italic" }}>
                Wkrótce — śledź nas po aktualizacje
              </p>
            </div>

            {/* CTA card */}
            <div style={{
              background: `linear-gradient(135deg, ${T.primary}18, ${T.secondary}12)`,
              borderRadius: 18, padding: "24px 22px",
              border: `1px solid ${T.primary}18`,
              position: "relative", overflow: "hidden",
            }}>
              <Blob color={T.primary} size={120} top={-30} right={-20} opacity={0.1} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>Wolisz porozmawiać? 📞</p>
                <p style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, marginBottom: 14, lineHeight: 1.6 }}>
                  Zadzwoń — chętnie odpowiemy na pytania i umówimy bezpłatne spotkanie.
                </p>
                <button
                  onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; e.target.style.boxShadow = `0 6px 24px ${T.primary}50`; }}
                  onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = `0 4px 16px ${T.primary}30`; }}
                  style={{
                  background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
                  color: "#fff", border: "none", borderRadius: 12,
                  padding: "11px 24px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                  boxShadow: `0 4px 16px ${T.primary}30`, transition: "all 0.15s",
                }}>Zadzwoń teraz →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAP */}
      <section style={{ padding: "56px 0", background: T.bg, position: "relative", overflow: "hidden" }}>
        <Blob color={T.cyan} size={200} top={-40} left={-30} opacity={0.04} />
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Gdzie <span style={{ color: T.primary }}>jesteśmy</span></h2>
          <p style={{ fontSize: 14, color: T.textMuted, fontWeight: 500, marginBottom: 24 }}>Zajęcia stacjonarne w centrum Tomaszowa Mazowieckiego.</p>

          <div style={{
            width: "100%", height: 340, borderRadius: 22, overflow: "hidden",
            background: `linear-gradient(160deg, #1A1E35 0%, #14182A 100%)`,
            border: `1px solid ${T.cardBorder}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            {/* Grid pattern */}
            <div style={{ position: "absolute", inset: 0, opacity: 0.03 }}>
              {Array(14).fill(0).map((_, i) => (
                <div key={`h${i}`} style={{ position: "absolute", left: 0, right: 0, top: `${i * 25}px`, height: 1, background: T.primary }} />
              ))}
              {Array(22).fill(0).map((_, i) => (
                <div key={`v${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: `${i * 50}px`, width: 1, background: T.primary }} />
              ))}
            </div>

            {/* "Roads" */}
            <div style={{ position: "absolute", top: "45%", left: 0, right: 0, height: 3, background: T.textDim, opacity: 0.12 }} />
            <div style={{ position: "absolute", left: "55%", top: 0, bottom: 0, width: 3, background: T.textDim, opacity: 0.12 }} />

            {/* Pin with glow */}
            <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%", margin: "0 auto 10px",
                background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, boxShadow: `0 0 30px ${T.primary}50, 0 0 60px ${T.primary}20`,
              }}>📍</div>
              <p style={{ fontSize: 15, fontWeight: 900, color: T.text }}>EDU <span style={{ color: T.primary }}>LUZ</span></p>
              <p style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>Tomaszów Mazowiecki</p>
              <p style={{ fontSize: 11, color: T.textDim, fontWeight: 500, marginTop: 10, fontStyle: "italic" }}>
                Google Maps embed po podaniu adresu
              </p>
            </div>
          </div>

          {/* Directions */}
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            {[
              { icon: "🚗", text: "Parking przy budynku", color: T.primary },
              { icon: "🚌", text: "Przystanek [placeholder] — 2 min pieszo", color: T.accent },
              { icon: "🚶", text: "Centrum miasta — 5 min spacerem", color: T.success },
            ].map((d, i) => (
              <div key={i} style={{
                flex: "1 1 200px", borderRadius: 14,
                padding: "14px 18px", border: `1px solid ${d.color}15`,
                background: d.color + "08",
                display: "flex", alignItems: "center", gap: 10,
                fontSize: 13, color: T.textMuted, fontWeight: 500,
              }}>
                <span style={{ fontSize: 18 }}>{d.icon}</span> {d.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0F1120", padding: "24px 0", borderTop: `1px solid ${T.cardBorder}` }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 900 }}>EDU <span style={{ color: T.primary }}>LUZ</span></span>
          <span style={{ fontSize: 11, color: T.textDim }}>© 2026 EDU LUZ Edukacja Na Luzie</span>
        </div>
      </footer>
    </div>
  );
}
