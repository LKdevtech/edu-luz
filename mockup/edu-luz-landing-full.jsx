import { useState } from "react";

const T = {
  bg: "#151827",
  bgAlt: "#1C2035",
  surface: "#232840",
  surfaceHover: "#2A3050",
  text: "#F0EDE6",
  textMuted: "#9B97AF",
  textDim: "#6B6780",
  primary: "#3B8FF0",
  primaryDark: "#2D7DE8",
  secondary: "#FF6F4A",
  tertiary: "#FFCA28",
  accent: "#7C5CFC",
  cardBorder: "rgba(59,143,240,0.10)",
  glow1: "#3B8FF0",
  glow2: "#FF6F4A",
};

const subjects = [
  { name: "Matematyka", icon: "∑", color: "#3B8FF0", desc: "Algebra, geometria, analiza — od podstawówki po maturę", levels: ["podstawowy", "rozszerzony"] },
  { name: "Angielski", icon: "🇬🇧", color: "#06B6D4", desc: "Gramatyka, konwersacje, przygotowanie do egzaminów", levels: ["podstawowy", "rozszerzony"] },
  { name: "Fizyka", icon: "⚡", color: "#F59E0B", desc: "Mechanika, elektryczność, optyka — teoria i zadania", levels: ["podstawowy", "rozszerzony"] },
  { name: "Chemia", icon: "⚗️", color: "#22C55E", desc: "Chemia organiczna i nieorganiczna, reakcje, stechiometria", levels: ["podstawowy", "rozszerzony"] },
  { name: "Polski", icon: "📖", color: "#E84393", desc: "Gramatyka, lektury, wypracowania, przygotowanie do egzaminów", levels: ["podstawowy", "rozszerzony"] },
  { name: "Elektrotechnika", icon: "🔌", color: "#FF6F4A", desc: "Obwody, instalacje, pomiary — teoria i praktyka", levels: ["podstawowy", "rozszerzony"] },
  { name: "Włoski", icon: "🇮🇹", color: "#EF4444", desc: "Podstawy języka, konwersacje, gramatyka", planned: "W planie" },
  { name: "Niemiecki", icon: "🇩🇪", color: "#FBBF24", desc: "Gramatyka, słownictwo, przygotowanie do egzaminów", planned: "W przygotowaniu" },
];

function Blob({ color, size, top, left, right, bottom, opacity = 0.06 }) {
  return (
    <div style={{
      position: "absolute", width: size, height: size, borderRadius: "50%",
      background: color, opacity, filter: "blur(80px)", pointerEvents: "none",
      top, left, right, bottom,
    }} />
  );
}

function Section({ children, alt = false, id, style = {} }) {
  return (
    <section id={id} style={{ background: alt ? T.bgAlt : T.bg, padding: "64px 0", position: "relative", overflow: "hidden", ...style }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </section>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: T.text, marginBottom: 8, letterSpacing: -0.3 }}>{children}</h2>
      {sub && <p style={{ fontSize: 15, color: T.textMuted, fontWeight: 500, maxWidth: 500 }}>{sub}</p>}
    </div>
  );
}

function Card({ children, style = {}, hover = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: hovered ? T.surfaceHover : T.surface,
        borderRadius: 18, padding: "24px 22px",
        border: `1px solid ${T.cardBorder}`,
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function ExpandableFormatCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); }}
      style={{
        background: hovered ? T.surfaceHover : T.surface,
        borderRadius: 18, padding: "24px 22px",
        border: item.special ? `1.5px solid ${item.color}40` : `1px solid ${T.cardBorder}`,
        transition: "all 0.25s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        position: "relative", overflow: "hidden",
      }}
    >
      {item.special && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${item.color}, ${T.secondary})`,
        }} />
      )}
      <div style={{ fontSize: 32, marginBottom: 12 }}>{item.emoji}</div>
      <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{item.title}</p>
      <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.7, marginBottom: 14, fontWeight: 500 }}>{item.desc}</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {item.tags.map(tag => (
          <span key={tag} style={{
            fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 8,
            background: item.color + "15", color: item.color,
          }}>{tag}</span>
        ))}
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "transparent", border: "none", color: item.color,
          fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0,
          display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit",
        }}
      >
        {expanded ? "Zwiń" : "Więcej szczegółów"}
        <span style={{ transition: "transform 0.2s", display: "inline-block", transform: expanded ? "rotate(180deg)" : "none" }}>▼</span>
      </button>
      <div style={{
        maxHeight: expanded ? 200 : 0, overflow: "hidden",
        transition: "max-height 0.3s ease, opacity 0.3s ease, margin 0.3s ease",
        opacity: expanded ? 1 : 0, marginTop: expanded ? 12 : 0,
      }}>
        <div style={{
          background: item.color + "08", borderRadius: 12, padding: "14px 16px",
          border: `1px solid ${item.color}15`, fontSize: 13, color: T.textMuted,
          lineHeight: 1.75, fontWeight: 500,
        }}>
          {item.details}
        </div>
      </div>
    </div>
  );
}

function Pill({ children, color }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 16px", borderRadius: 50, fontSize: 13, fontWeight: 700,
      background: color + "18", color, border: `1.5px solid ${color}30`,
    }}>
      {children}
    </span>
  );
}

function Btn({ children, primary = false, style = {} }) {
  const [h, setH] = useState(false);
  return (
    <button
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: primary ? T.primary : "transparent",
        color: primary ? "#fff" : T.textMuted,
        border: primary ? "none" : `2px solid ${T.cardBorder}`,
        borderRadius: 14, padding: "14px 32px", fontSize: 15, fontWeight: 800,
        cursor: "pointer", transition: "all 0.2s",
        transform: h ? "scale(1.03)" : "none",
        boxShadow: primary && h ? `0 6px 24px ${T.primary}50` : "none",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function LogoMark({ size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: T.primary,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.5, fontWeight: 900, color: "#fff",
      letterSpacing: -2, fontStyle: "italic",
      fontFamily: "'Nunito', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <span style={{ position: "relative", zIndex: 1 }}>Ez</span>
      <div style={{ position: "absolute", inset: 0, background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"40\" height=\"40\"><circle cx=\"8\" cy=\"12\" r=\"1.5\" fill=\"white\" opacity=\"0.3\"/><circle cx=\"22\" cy=\"6\" r=\"1\" fill=\"white\" opacity=\"0.25\"/><circle cx=\"15\" cy=\"28\" r=\"1.2\" fill=\"white\" opacity=\"0.2\"/><circle cx=\"32\" cy=\"18\" r=\"0.8\" fill=\"white\" opacity=\"0.3\"/><circle cx=\"5\" cy=\"35\" r=\"1\" fill=\"white\" opacity=\"0.15\"/></svg>')", backgroundSize: "cover" }} />
    </div>
  );
}

function NavLink({ children }) {
  const [h, setH] = useState(false);
  return (
    <a
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ fontSize: 14, color: h ? T.text : T.textMuted, fontWeight: 600, cursor: "pointer", transition: "color 0.2s", textDecoration: "none" }}
    >
      {children}
    </a>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* ========== NAVBAR ========== */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(21,24,39,0.85)", backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${T.cardBorder}`,
      }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LogoMark size={36} />
            <div>
              <span style={{ fontSize: 17, fontWeight: 900, letterSpacing: -0.3 }}>
                EDU <span style={{ color: T.primary }}>LUZ</span>
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="nav-desktop">
            <NavLink>Oferta i cennik</NavLink>
            <NavLink>O nas</NavLink>
            <NavLink>Blog</NavLink>
            <NavLink>Kontakt</NavLink>
            <Btn primary style={{ padding: "10px 22px", fontSize: 13 }}>Zaloguj się</Btn>
          </div>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section style={{ position: "relative", overflow: "hidden", padding: "80px 0 64px", background: `linear-gradient(180deg, ${T.bg} 0%, #111422 100%)` }}>
        <Blob color={T.glow1} size={340} top={-80} right={-60} />
        <Blob color={T.glow2} size={240} bottom={-40} left={-40} opacity={0.04} />
        <Blob color={T.accent} size={180} top={120} right={200} opacity={0.03} />

        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1, display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 480px" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: T.secondary + "20", color: T.secondary,
                fontSize: 13, fontWeight: 800, padding: "6px 16px", borderRadius: 50,
              }}>
                🎓 Tomaszów Mazowiecki
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: T.tertiary + "20", color: T.tertiary,
                fontSize: 13, fontWeight: 800, padding: "6px 16px", borderRadius: 50,
              }}>
                📍 Zajęcia stacjonarne
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 50, background: T.primary + "20", color: T.primary }}>Szkoła podstawowa</span>
              <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 50, background: T.accent + "20", color: T.accent }}>Szkoła średnia</span>
            </div>

            <h1 style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.12, letterSpacing: -1, marginBottom: 20 }}>
              Korepetycje<br />
              <span style={{ color: T.primary }}>bez stresu</span>,<br />
              efekty{" "}
              <span style={{
                background: `linear-gradient(135deg, ${T.secondary}, ${T.tertiary})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>na serio</span>
            </h1>

            <p style={{ fontSize: 17, color: T.textMuted, lineHeight: 1.75, maxWidth: 460, marginBottom: 32, fontWeight: 500 }}>
              Zajęcia z różnych przedmiotów w jednym miejscu — dla uczniów szkół podstawowych i średnich. Stały grafik, stałe ceny i notatka po każdej lekcji.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 36 }}>
              <Btn primary>Sprawdź ofertę →</Btn>
              <Btn>Kontakt</Btn>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {subjects.filter(s => !s.planned).map(s => (
                <Pill key={s.name} color={s.color}>{s.icon} {s.name}</Pill>
              ))}
              <Pill color={T.textDim}>+2 wkrótce</Pill>
            </div>
          </div>

          <div style={{ flex: "1 1 360px", display: "flex", justifyContent: "center" }}>
            <div style={{
              width: "100%", maxWidth: 380, aspectRatio: "4/3",
              background: T.surface, borderRadius: 24,
              border: `1px solid ${T.cardBorder}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 8, color: T.textDim, fontSize: 13,
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ opacity: 0.4 }}>
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
              <span style={{ fontWeight: 600 }}>Ilustracja / zdjęcie centrum</span>
              <span style={{ fontSize: 11, color: T.textDim }}>Placeholder — dodasz później</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== USP ========== */}
      <Section alt>
        <SectionTitle sub="Kilka powodów, dla których rodzice i uczniowie zostają z nami.">
          Dlaczego <span style={{ color: T.primary }}>EDU LUZ</span>?
        </SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { icon: "📍", title: "Jedno miejsce", desc: "Matematyka, angielski, fizyka, chemia — wszystko pod jednym adresem. Zero biegania.", color: T.primary },
            { icon: "📅", title: "Stały grafik", desc: "Każdy tydzień ten sam dzień i godzina. Przewidywalność dla całej rodziny.", color: T.tertiary },
            { icon: "💸", title: "Jasne ceny", desc: "Stała stawka miesięczna. Bez niespodzianek, bez drobnego druku.", color: T.secondary },
            { icon: "📱", title: "Panel online", desc: "Notatki po lekcji, odrabianie, płatności — rodzic i uczeń widzą wszystko.", color: T.accent },
          ].map((item, i) => (
            <Card key={i} hover>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
              <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, color: T.text }}>{item.title}</p>
              <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.7, fontWeight: 500 }}>{item.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ========== PRZEDMIOTY ========== */}
      <Section>
        <SectionTitle sub="Dla uczniów szkół podstawowych i średnich. Każdy przedmiot prowadzony przez doświadczonego korepetytora.">
          Czego uczymy
        </SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {subjects.map((s, i) => (
            <div key={i} style={{ position: "relative", overflow: "hidden", borderRadius: "4px 18px 18px 4px" }}>
              {s.planned && (
                <div style={{
                  position: "absolute", top: 14, right: -32, zIndex: 2,
                  background: T.tertiary, color: "#1a1400", fontSize: 10, fontWeight: 900,
                  padding: "4px 40px", transform: "rotate(35deg)", letterSpacing: 0.5,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)", textTransform: "uppercase",
                }}>
                  {s.planned}
                </div>
              )}
              <Card hover style={{ borderLeft: `4px solid ${s.color}`, borderRadius: "4px 18px 18px 4px", opacity: s.planned ? 0.75 : 1, height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <span style={{ fontSize: 16, fontWeight: 800 }}>{s.name}</span>
                </div>
                <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.7, fontWeight: 500, marginBottom: 10 }}>{s.desc}</p>
                {s.levels && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {s.levels.map(l => (
                      <span key={l} style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                        background: s.color + "15", color: s.color, textTransform: "uppercase", letterSpacing: 0.3,
                      }}>{l}</span>
                    ))}
                  </div>
                )}
                {!s.planned && (
                  <div style={{ marginTop: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.color, cursor: "pointer", borderBottom: `1.5px solid ${s.color}40` }}>
                      Szczegóły →
                    </span>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      </Section>

      {/* ========== FORMY ZAJĘĆ ========== */}
      <Section alt>
        <SectionTitle sub="Dopasowujemy formę zajęć do potrzeb ucznia i budżetu rodzica. Wszystkie zajęcia stacjonarnie w naszym centrum.">
          Jak pracujemy
        </SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            {
              emoji: "👤", title: "Indywidualnie", desc: "1 na 1 z korepetytorem. Pełna personalizacja tempa, materiału i podejścia.",
              tags: ["45 min", "60 min", "90 min", "120 min"], color: T.primary,
              details: "Korepetytor dopasowuje materiał do poziomu i celów ucznia. Idealne dla osób potrzebujących intensywnego nadrobienia zaległości lub przygotowania do egzaminu. Po każdej lekcji notatka w panelu.",
            },
            {
              emoji: "👥", title: "W parze", desc: "2 osoby na podobnym poziomie. Wspólna nauka motywuje, a cena jest niższa.",
              tags: ["60 min", "90 min", "120 min"], color: T.accent,
              details: "Dobieramy pary o zbliżonym poziomie i celach. Uczniowie uczą się od siebie nawzajem, a koszt dzieli się na dwoje. Świetna opcja dla rodzeństwa lub znajomych.",
            },
            {
              emoji: "👨‍👩‍👧‍👦", title: "Mała grupa", desc: "Do 4 osób. Dynamika grupowa, dyskusja i najniższa stawka za godzinę.",
              tags: ["60 min", "90 min", "120 min"], color: T.secondary,
              details: "Grupy max. 4 osoby — każdy uczestnik dostaje uwagę. Praca nad wspólnym materiałem, rozwiązywanie zadań w zespole. Idealne na bieżące powtórki i utrwalanie wiedzy.",
            },
            {
              emoji: "🚀", title: "Kursy specjalne", desc: "Intensywne programy sezonowe — przed maturą, na wakacje, przed egzaminem ósmoklasisty.",
              tags: ["weekendowe", "wakacyjne", "maturalne", "egzamin 8-kl."], color: T.tertiary,
              details: "Kursy zamknięte z konkretnym celem i harmonogramem. Intensywne powtórki przed maturą, letnie warsztaty uzupełniające braki, przygotowanie do egzaminu ósmoklasisty. Terminy i szczegóły na bieżąco w ofercie.",
              special: true,
            },
          ].map((item, i) => (
            <ExpandableFormatCard key={i} item={item} />
          ))}
        </div>
      </Section>

      {/* ========== SOCIAL PROOF ========== */}
      <Section>
        <SectionTitle sub="Opinie rodziców i uczniów z naszego centrum.">
          Co o nas mówią
        </SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[
            { quote: "Wreszcie jedno miejsce na wszystkie zajęcia. Nie muszę wozić syna po całym mieście.", author: "Mama ucznia, klasa 8", stars: 5 },
            { quote: "Fajne podejście, bez stresu. Notatki po lekcji naprawdę pomagają mi się powtarzać.", author: "Uczeń, 2 klasa LO", stars: 5 },
            { quote: "Panel z płatnościami to strzał w dziesiątkę — wiem ile, kiedy i za co płacę.", author: "Tata dwójki dzieci", stars: 5 },
          ].map((t, i) => (
            <Card key={i} style={{ position: "relative" }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                {Array(t.stars).fill(0).map((_, j) => (
                  <span key={j} style={{ color: T.tertiary, fontSize: 16 }}>★</span>
                ))}
              </div>
              <p style={{ fontSize: 14, color: T.text, lineHeight: 1.75, fontStyle: "italic", marginBottom: 14, fontWeight: 500 }}>
                „{t.quote}"
              </p>
              <p style={{ fontSize: 12, color: T.textDim, fontWeight: 700 }}>— {t.author}</p>
            </Card>
          ))}
        </div>
        <p style={{ fontSize: 12, color: T.textDim, marginTop: 16, fontStyle: "italic", fontWeight: 500 }}>
          💡 Sekcja opcjonalna w MVP — do uzupełnienia po pilocie prawdziwymi opiniami.
        </p>
      </Section>

      {/* ========== CTA ========== */}
      <section style={{
        background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
        padding: "72px 0", position: "relative", overflow: "hidden",
      }}>
        <Blob color="#fff" size={300} top={-100} right={-80} opacity={0.06} />
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1, textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 12 }}>
            Gotowy na naukę na luzie?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px", fontWeight: 500, lineHeight: 1.7 }}>
            Umów bezpłatne spotkanie organizacyjne. Sprawdzimy poziom, dobierzemy korepetytora i ustalimy grafik.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{
              background: "#fff", color: T.primaryDark, border: "none", borderRadius: 14,
              padding: "15px 36px", fontSize: 16, fontWeight: 800, cursor: "pointer",
              transition: "transform 0.15s", fontFamily: "inherit",
            }}>
              Umów spotkanie →
            </button>
            <button style={{
              background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)",
              borderRadius: 14, padding: "15px 36px", fontSize: 16, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              Zadzwoń do nas
            </button>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer style={{ background: "#0F1120", borderTop: `1px solid ${T.cardBorder}`, padding: "56px 0 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 36, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <LogoMark size={32} />
                <span style={{ fontSize: 16, fontWeight: 900 }}>EDU <span style={{ color: T.primary }}>LUZ</span></span>
              </div>
              <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.7, fontWeight: 500 }}>
                Edukacja Na Luzie<br />
                ul. [adres placeholder]<br />
                Tomaszów Mazowiecki
              </p>
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 800, color: T.textMuted, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Nawigacja</p>
              {["Oferta i cennik", "O nas", "Blog", "Kontakt"].map(l => (
                <a key={l} style={{ display: "block", fontSize: 13, color: T.textDim, marginBottom: 10, cursor: "pointer", fontWeight: 500, textDecoration: "none" }}>{l}</a>
              ))}
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 800, color: T.textMuted, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Kontakt</p>
              <p style={{ fontSize: 13, color: T.textDim, lineHeight: 2, fontWeight: 500 }}>
                📞 +48 [telefon]<br />
                ✉️ kontakt@eduluz.pl<br />
                📍 Tomaszów Mazowiecki
              </p>
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 800, color: T.textMuted, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Dla uczniów</p>
              <a style={{ display: "block", fontSize: 13, color: T.textDim, marginBottom: 10, cursor: "pointer", fontWeight: 500 }}>Zaloguj się do panelu</a>
              <a style={{ display: "block", fontSize: 13, color: T.textDim, marginBottom: 10, cursor: "pointer", fontWeight: 500 }}>Jak korzystać z panelu?</a>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${T.cardBorder}`, paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>© 2026 EDU LUZ Edukacja Na Luzie. Wszelkie prawa zastrzeżone.</p>
            <div style={{ display: "flex", gap: 20 }}>
              <a style={{ fontSize: 11, color: T.textDim, cursor: "pointer", fontWeight: 500 }}>Polityka prywatności</a>
              <a style={{ fontSize: 11, color: T.textDim, cursor: "pointer", fontWeight: 500 }}>Regulamin</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
