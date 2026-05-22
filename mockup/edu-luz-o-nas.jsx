import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", primaryDark: "#2D7DE8", secondary: "#FF6F4A",
  tertiary: "#FFCA28", accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4",
  pink: "#E84393",
  cardBorder: "rgba(59,143,240,0.10)",
};

function Blob({ color, size, top, left, right, bottom, opacity = 0.06 }) {
  return <div style={{ position: "absolute", width: size, height: size, borderRadius: "50%", background: color, opacity, filter: "blur(80px)", pointerEvents: "none", top, left, right, bottom }} />;
}

function Section({ children, alt = false, style = {} }) {
  return (
    <section style={{ background: alt ? T.bgAlt : T.bg, padding: "56px 0", position: "relative", overflow: "hidden", ...style }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>{children}</div>
    </section>
  );
}

function StatCard({ value, label, color, icon }) {
  return (
    <div style={{
      background: `linear-gradient(160deg, ${color}12, ${color}06)`,
      borderRadius: 20, padding: "28px 24px", textAlign: "center",
      border: `1px solid ${color}18`,
      flex: "1 1 150px",
    }}>
      <span style={{ fontSize: 24, display: "block", marginBottom: 8 }}>{icon}</span>
      <p style={{ fontSize: 36, fontWeight: 900, color, margin: "0 0 4px", letterSpacing: -1 }}>{value}</p>
      <p style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
    </div>
  );
}

function TutorCard({ tutor }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? T.surfaceHover : T.surface,
        borderRadius: 20, padding: "28px 24px",
        border: `1px solid ${T.cardBorder}`,
        borderTop: `3px solid ${tutor.color}`,
        transition: "all 0.25s", transform: hovered ? "translateY(-3px)" : "none",
      }}
    >
      {/* Avatar initials */}
      <div style={{
        width: 56, height: 56, borderRadius: 16, marginBottom: 16,
        background: `linear-gradient(135deg, ${tutor.color}30, ${tutor.color}10)`,
        border: `1.5px solid ${tutor.color}25`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, fontWeight: 900, color: tutor.color, letterSpacing: -1,
      }}>
        {tutor.initials}
      </div>
      <p style={{ fontSize: 18, fontWeight: 900, marginBottom: 2 }}>{tutor.name}</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {tutor.subjects.map(s => (
          <span key={s.name} style={{
            fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
            background: s.color + "15", color: s.color, letterSpacing: 0.3,
          }}>{s.name}</span>
        ))}
      </div>
      <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.7, fontWeight: 500, marginBottom: 12 }}>{tutor.bio}</p>
      {tutor.highlight && (
        <div style={{
          fontSize: 11, fontWeight: 700, padding: "6px 14px", borderRadius: 10,
          background: tutor.color + "12", color: tutor.color,
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          ⭐ {tutor.highlight}
        </div>
      )}
    </div>
  );
}

function ValueCard({ icon, title, desc, color }) {
  return (
    <div style={{
      display: "flex", gap: 16, alignItems: "flex-start",
      padding: "20px 22px", borderRadius: 18,
      background: T.surface, border: `1px solid ${T.cardBorder}`,
      borderLeft: `4px solid ${color}`, borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 14, flexShrink: 0,
        background: color + "15", border: `1px solid ${color}20`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>{icon}</div>
      <div>
        <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{title}</p>
        <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.7, fontWeight: 500, margin: 0 }}>{desc}</p>
      </div>
    </div>
  );
}

const tutors = [
  {
    name: "[Imię Nazwisko]", initials: "KN", color: T.primary,
    subjects: [{ name: "Matematyka", color: "#3B8FF0" }, { name: "Fizyka", color: "#F59E0B" }],
    bio: "Placeholder — krótki opis doświadczenia, podejścia do nauczania i co wyróżnia tego korepetytora.",
    highlight: "X lat doświadczenia",
  },
  {
    name: "[Imię Nazwisko]", initials: "AW", color: T.cyan,
    subjects: [{ name: "Angielski", color: "#06B6D4" }],
    bio: "Placeholder — krótki opis doświadczenia, certyfikatów, specjalizacji w nauczaniu języka.",
    highlight: "Certyfikat Cambridge",
  },
  {
    name: "[Imię Nazwisko]", initials: "MK", color: T.secondary,
    subjects: [{ name: "Chemia", color: "#22C55E" }, { name: "Elektrotechnika", color: "#FF6F4A" }],
    bio: "Placeholder — krótki opis doświadczenia, podejścia, co sprawia że uczniowie lubią jego zajęcia.",
    highlight: "Praktyk z branży",
  },
  {
    name: "[Imię Nazwisko]", initials: "JZ", color: T.pink,
    subjects: [{ name: "Polski", color: "#E84393" }],
    bio: "Placeholder — krótki opis podejścia do lektur, wypracowań, przygotowania do matury z polskiego.",
    highlight: "Pasjonat literatury",
  },
];

export default function ONasPage() {
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
                style={{ fontSize: 13, fontWeight: 600, color: i === 2 ? T.primary : h ? T.text : T.textMuted, cursor: "pointer", transition: "color 0.2s" }}>{l}</span>;
            })}
            <button style={{ background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "transform 0.15s" }}
              onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; e.target.style.boxShadow = `0 4px 16px ${T.primary}40`; }}
              onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}
            >Zaloguj się</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "52px 0 20px", position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${T.bg} 0%, #171A30 50%, ${T.bgAlt} 100%)` }}>
        <Blob color={T.accent} size={300} top={-70} right={-50} opacity={0.07} />
        <Blob color={T.secondary} size={200} bottom={-40} left={-30} opacity={0.05} />
        <Blob color={T.primary} size={160} top={40} left={200} opacity={0.04} />
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.15, letterSpacing: -0.5, marginBottom: 12 }}>
            O <span style={{ color: T.primary }}>nas</span>
          </h1>
          <p style={{ fontSize: 16, color: T.textMuted, fontWeight: 500, maxWidth: 500, lineHeight: 1.7 }}>
            Kim jesteśmy, skąd się wzięliśmy i dlaczego uczymy tak, a nie inaczej.
          </p>
        </div>
      </section>

      {/* HISTORIA */}
      <Section alt>
        <div style={{ display: "flex", gap: 36, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1 1 480px" }}>
            <div style={{ display: "inline-flex", gap: 6, marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 800, padding: "5px 14px", borderRadius: 50, background: T.secondary + "20", color: T.secondary }}>Nasza historia</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 16, lineHeight: 1.25 }}>
              Jak powstało{" "}
              <span style={{ color: T.primary }}>EDU LUZ</span>
            </h2>
            <div style={{ fontSize: 15, color: T.textMuted, lineHeight: 1.85, fontWeight: 500 }}>
              <p style={{ marginBottom: 16 }}>
                [Placeholder — Tu opowiedz swoją historię. Jak wpadłeś na pomysł? Co Cię frustrowało w tradycyjnych korepetycjach? Dlaczego „na luzie"?]
              </p>
              <p style={{ marginBottom: 16 }}>
                [Placeholder — Co chciałeś zmienić? Może sam byłeś uczniem który nienawidził korepetycji? Może widziałeś jak znajomi biegają po mieście od jednego korepetytora do drugiego?]
              </p>
              <p style={{ margin: 0 }}>
                [Placeholder — Jakie jest Twoje podejście? Co odróżnia EDU LUZ od typowej „pani od matmy"? Dlaczego Tomaszów Mazowiecki potrzebuje czegoś takiego?]
              </p>
            </div>
          </div>
          <div style={{ flex: "1 1 320px" }}>
            <div style={{
              width: "100%", aspectRatio: "4/3", borderRadius: 22,
              background: `linear-gradient(160deg, ${T.surface} 0%, #1E2440 100%)`,
              border: `1px solid ${T.cardBorder}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 8, color: T.textDim, fontSize: 13,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: `linear-gradient(135deg, ${T.primary}20, ${T.accent}15)`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
              }}>📸</div>
              <span style={{ fontWeight: 600 }}>Zdjęcie centrum / zespołu</span>
              <span style={{ fontSize: 11 }}>Placeholder</span>
            </div>
          </div>
        </div>
      </Section>

      {/* STATYSTYKI */}
      <Section>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
            EDU LUZ <span style={{ color: T.primary }}>w liczbach</span>
          </h2>
          <p style={{ fontSize: 14, color: T.textMuted, fontWeight: 500 }}>Placeholder — uzupełnij realnymi danymi</p>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <StatCard value="50+" label="Uczniów" color={T.primary} icon="🎓" />
          <StatCard value="5" label="Lat doświadczenia" color={T.accent} icon="📅" />
          <StatCard value="95%" label="Zdanych matur" color={T.success} icon="✅" />
          <StatCard value="6" label="Przedmiotów" color={T.secondary} icon="📚" />
        </div>
      </Section>

      {/* NASZE WARTOŚCI */}
      <Section alt>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
            Nasze <span style={{ color: T.primary }}>podejście</span>
          </h2>
          <p style={{ fontSize: 14, color: T.textMuted, fontWeight: 500, maxWidth: 480, margin: "0 auto" }}>
            To nie tylko korepetycje. To filozofia nauki bez stresu — z efektami.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
          <ValueCard icon="🧘" title="Bez stresu" desc="Uczeń uczy się lepiej kiedy się nie boi. Zero oceniania, zero presji — tempo dostosowane do człowieka, nie do programu." color={T.cyan} />
          <ValueCard icon="🎯" title="Cel, nie program" desc="Pracujemy pod konkretny cel: zdanie matury, nadrobienie zaległości, zrozumienie tematu. Nie przerabiamy podręcznika od deski do deski." color={T.secondary} />
          <ValueCard icon="📝" title="Transparentność" desc="Rodzic wie co było na lekcji, co uczeń powinien powtórzyć i ile płaci. Notatka po każdych zajęciach, przejrzysty cennik." color={T.primary} />
          <ValueCard icon="🤝" title="Relacja" desc="Korepetytor to nie automat do zadawania zadań. To człowiek, który zna ucznia, jego mocne strony i słabości. I lubi to co robi." color={T.accent} />
          <ValueCard icon="🔄" title="Elastyczność" desc="Odwołujesz z wyprzedzeniem — lekcja nie przepada. Nowy termin umawiasz przez panel, nie przez telefon." color={T.success} />
          <ValueCard icon="📊" title="Mierzalne efekty" desc="Nie obiecujemy cudów. Ale śledzimy postępy, reagujemy na problemy i dostosowujemy podejście na bieżąco." color={T.tertiary} />
        </div>
      </Section>

      {/* ZESPÓŁ */}
      <Section>
        <div style={{ position: "relative" }}>
          <Blob color={T.accent} size={200} top={-40} right={-20} opacity={0.05} />
          <Blob color={T.primary} size={160} bottom={-30} left={-20} opacity={0.04} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
                Nasz <span style={{ color: T.primary }}>zespół</span>
              </h2>
              <p style={{ fontSize: 14, color: T.textMuted, fontWeight: 500, maxWidth: 420, margin: "0 auto" }}>
                Ludzie, dzięki którym „na luzie" działa. Każdy z pasją, każdy z podejściem.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              {tutors.map((t, i) => <TutorCard key={i} tutor={t} />)}
            </div>
          </div>
        </div>
      </Section>

      {/* TIMELINE — historia w punktach */}
      <Section alt>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
            Nasza <span style={{ color: T.tertiary }}>droga</span>
          </h2>
        </div>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {[
            { year: "[rok]", text: "Pomysł — pierwszy uczeń, pierwsze zajęcia, pierwsze wnioski.", color: T.primary },
            { year: "[rok]", text: "Pierwsi korepetytorzy dołączają — tworzymy zespół z podejściem.", color: T.accent },
            { year: "[rok]", text: "Stałe centrum — jedno miejsce, stały grafik, pierwsze grupy.", color: T.secondary },
            { year: "2026", text: "EDU LUZ v2 — panel online, notatki po lekcjach, system odrabiania.", color: T.tertiary },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 20, marginBottom: i < 3 ? 8 : 0 }}>
              {/* Timeline line */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: item.color, border: `3px solid ${item.color}30`, flexShrink: 0 }} />
                {i < 3 && <div style={{ width: 2, flex: 1, background: `linear-gradient(${item.color}40, ${T.cardBorder})`, minHeight: 40 }} />}
              </div>
              {/* Content */}
              <div style={{ paddingBottom: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: item.color }}>{item.year}</span>
                <p style={{ fontSize: 14, color: T.textMuted, fontWeight: 500, lineHeight: 1.65, margin: "4px 0 0" }}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, padding: "56px 0", position: "relative", overflow: "hidden" }}>
        <Blob color="#fff" size={280} top={-80} right={-60} opacity={0.06} />
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 8 }}>Chcesz nas poznać osobiście?</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 28, fontWeight: 500, maxWidth: 420, margin: "0 auto 28px" }}>
            Umów bezpłatne spotkanie organizacyjne — porozmawiamy o potrzebach i dobierzemy korepetytora.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; }} onMouseLeave={e => { e.target.style.transform = "none"; }} style={{ background: "#fff", color: T.primaryDark, border: "none", borderRadius: 14, padding: "14px 32px", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "transform 0.15s" }}>Umów spotkanie →</button>
            <button onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; e.target.style.background = "rgba(255,255,255,0.25)"; }} onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.background = "rgba(255,255,255,0.15)"; }} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 14, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>Kontakt</button>
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
