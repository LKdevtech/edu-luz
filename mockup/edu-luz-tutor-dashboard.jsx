import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", primaryDark: "#2D7DE8", secondary: "#FF6F4A",
  tertiary: "#FFCA28", accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4",
  danger: "#EF4444", pink: "#E84393",
  cardBorder: "rgba(59,143,240,0.10)",
};

const subjectColors = {
  "Matematyka": "#3B8FF0", "Angielski": "#06B6D4", "Fizyka": "#F59E0B",
  "Chemia": "#22C55E", "Polski": "#E84393", "Elektrotechnika": "#FF6F4A",
};

const todayLessons = [
  { time: "14:00", end: "15:00", subject: "Matematyka", student: "Kacper Nowak", room: "Sala 1", type: "individual", status: "next", level: "Średnia rozsz." },
  { time: "15:15", end: "16:15", subject: "Matematyka", student: "Grupa A (3 os.)", room: "Sala 1", type: "group", status: "planned", level: "Podstawówka" },
  { time: "16:30", end: "18:00", subject: "Fizyka", student: "Alicja Wiśniewska", room: "Sala 2", type: "individual", status: "planned", level: "Średnia podst." },
  { time: "18:15", end: "19:15", subject: "Matematyka", student: "Tomek Zieliński", room: "Sala 1", type: "individual", status: "planned", level: "Średnia rozsz." },
];

const makeupProposals = [
  { student: "Julia Kowalska", subject: "Matematyka", proposed: "Czw 20.06, 16:00", original: "Pon 17.06", parent: "Anna Kowalska", daysAgo: 1 },
  { student: "Michał Lis", subject: "Fizyka", proposed: "Pt 21.06, 14:00", original: "Śr 12.06", parent: "Tomasz Lis", daysAgo: 3 },
];

const missingEntries = [
  { date: "Pon 17.06", subject: "Matematyka", student: "Julia Kowalska", hoursLeft: 26 },
  { date: "Wt 18.06", subject: "Fizyka", student: "Grupa B (2 os.)", hoursLeft: 2 },
  { date: "Śr 19.06", subject: "Matematyka", student: "Kacper Nowak", hoursLeft: null },
];

const sidebarItems = [
  { icon: "📊", label: "Dashboard", active: true },
  { icon: "📅", label: "Harmonogram" },
  { icon: "📝", label: "Lekcje i wpisy" },
  { icon: "🔄", label: "Odrabianie", badge: 2 },
  { icon: "🕐", label: "Dostępność" },
  { icon: "👥", label: "Moi uczniowie" },
];

function Sidebar({ collapsed, onToggle }) {
  return (
    <div style={{
      width: collapsed ? 64 : 240, flexShrink: 0,
      background: T.bgAlt, borderRight: `1px solid ${T.cardBorder}`,
      display: "flex", flexDirection: "column", transition: "width 0.25s",
      overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? "16px 12px" : "16px 20px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 10, minHeight: 56 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: -2, fontStyle: "italic", flexShrink: 0 }}>Ez</div>
        {!collapsed && <span style={{ fontSize: 15, fontWeight: 900, whiteSpace: "nowrap" }}>EDU <span style={{ color: T.primary }}>LUZ</span></span>}
      </div>

      {/* Nav items */}
      <div style={{ padding: "12px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {sidebarItems.map((item, i) => {
          const [h, setH] = useState(false);
          return (
            <div key={i} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: collapsed ? "10px 16px" : "10px 14px",
                borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                background: item.active ? T.primary + "18" : h ? T.surfaceHover : "transparent",
                justifyContent: collapsed ? "center" : "flex-start",
                position: "relative",
              }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ fontSize: 13, fontWeight: item.active ? 800 : 600, color: item.active ? T.primary : h ? T.text : T.textMuted, whiteSpace: "nowrap" }}>{item.label}</span>}
              {item.badge && !collapsed && (
                <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 10, background: T.secondary + "20", color: T.secondary }}>{item.badge}</span>
              )}
              {item.badge && collapsed && (
                <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: T.secondary }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Collapse toggle */}
      <div style={{ padding: "12px 8px", borderTop: `1px solid ${T.cardBorder}` }}>
        <div onClick={onToggle} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "8px", borderRadius: 10, cursor: "pointer",
          fontSize: 12, color: T.textDim, fontWeight: 600,
        }}>
          {collapsed ? "→" : "← Zwiń"}
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, sub, color, icon }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: h ? T.surfaceHover : T.surface, borderRadius: 18, padding: "20px 20px",
      border: `1px solid ${T.cardBorder}`, flex: "1 1 140px",
      transition: "all 0.2s", transform: h ? "translateY(-2px)" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
        <span style={{ fontSize: 16 }}>{icon}</span>
      </div>
      <p style={{ fontSize: 28, fontWeight: 900, color, margin: "0 0 2px", letterSpacing: -0.5 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: T.textDim, fontWeight: 500, margin: 0 }}>{sub}</p>}
    </div>
  );
}

function LessonCard({ lesson }) {
  const [h, setH] = useState(false);
  const color = subjectColors[lesson.subject] || T.primary;
  const isNext = lesson.status === "next";
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      display: "flex", gap: 16, padding: "16px 18px", borderRadius: 16,
      background: isNext ? color + "10" : h ? T.surfaceHover : T.surface,
      border: `1px solid ${isNext ? color + "30" : T.cardBorder}`,
      transition: "all 0.2s", transform: h ? "translateY(-1px)" : "none",
      cursor: "pointer",
    }}>
      {/* Time column */}
      <div style={{ width: 52, flexShrink: 0, textAlign: "center" }}>
        <p style={{ fontSize: 16, fontWeight: 900, color: isNext ? color : T.text, margin: 0 }}>{lesson.time}</p>
        <p style={{ fontSize: 11, color: T.textDim, fontWeight: 500, margin: 0 }}>{lesson.end}</p>
      </div>

      {/* Color bar */}
      <div style={{ width: 4, borderRadius: 4, background: color, flexShrink: 0 }} />

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{lesson.subject}</span>
          {isNext && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: color + "25", color, textTransform: "uppercase", letterSpacing: 0.5 }}>Następna</span>}
        </div>
        <p style={{ fontSize: 13, color: T.textMuted, fontWeight: 500, margin: "0 0 6px" }}>{lesson.student}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: T.bgAlt, color: T.textDim }}>🚪 {lesson.room}</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: T.bgAlt, color: T.textDim }}>
            {lesson.type === "group" ? "👥 Grupa" : "👤 Indyw."}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: color + "12", color }}>{lesson.level}</span>
        </div>
      </div>
    </div>
  );
}

function MakeupCard({ proposal }) {
  const [h, setH] = useState(false);
  const color = subjectColors[proposal.subject] || T.primary;
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: h ? T.surfaceHover : T.surface, borderRadius: 16,
      border: `1px solid ${T.tertiary}20`, padding: "16px 18px",
      transition: "all 0.2s", transform: h ? "translateY(-1px)" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: T.text, margin: "0 0 2px" }}>{proposal.student}</p>
          <p style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, margin: 0 }}>{proposal.subject} · odwołane: {proposal.original}</p>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: T.tertiary + "15", color: T.tertiary }}>{proposal.daysAgo === 1 ? "Wczoraj" : `${proposal.daysAgo} dni temu`}</span>
      </div>
      <div style={{
        background: T.bgAlt, borderRadius: 12, padding: "10px 14px", marginBottom: 12,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 14 }}>📅</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>Proponowany: {proposal.proposed}</p>
          <p style={{ fontSize: 11, color: T.textDim, fontWeight: 500, margin: 0 }}>Propozycja od: {proposal.parent}</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; e.target.style.boxShadow = `0 4px 12px ${T.success}30`; }}
          onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}
          style={{
            flex: 1, padding: "9px 0", borderRadius: 10, border: "none",
            background: T.success, color: "#fff", fontSize: 12, fontWeight: 800,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>✓ Akceptuj</button>
        <button
          onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; e.target.style.borderColor = T.danger; }}
          onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.borderColor = T.cardBorder; }}
          style={{
            flex: 1, padding: "9px 0", borderRadius: 10,
            background: "transparent", border: `1.5px solid ${T.cardBorder}`,
            color: T.danger, fontSize: 12, fontWeight: 800,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>✗ Odrzuć</button>
      </div>
    </div>
  );
}

function MissingEntryRow({ entry }) {
  const [h, setH] = useState(false);
  const color = subjectColors[entry.subject] || T.primary;
  const urgent = entry.hoursLeft !== null && entry.hoursLeft < 12;
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
      borderRadius: 14, background: h ? T.surfaceHover : "transparent",
      transition: "all 0.15s", cursor: "pointer",
      borderBottom: `1px solid ${T.cardBorder}`,
    }}>
      <div style={{ width: 4, height: 36, borderRadius: 4, background: urgent ? T.danger : color, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{entry.subject} — {entry.student}</p>
        <p style={{ fontSize: 11, color: T.textDim, fontWeight: 500, margin: 0 }}>{entry.date}</p>
      </div>
      {entry.hoursLeft !== null ? (
        <span style={{
          fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 8,
          background: urgent ? T.danger + "15" : T.tertiary + "15",
          color: urgent ? T.danger : T.tertiary,
        }}>Zostało {entry.hoursLeft}h</span>
      ) : (
        <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: T.danger + "15", color: T.danger }}>ZABLOKOWANY</span>
      )}
      <button
        onMouseEnter={e => { e.target.style.background = T.primary; e.target.style.color = "#fff"; }}
        onMouseLeave={e => { e.target.style.background = T.primary + "18"; e.target.style.color = T.primary; }}
        style={{
          padding: "6px 14px", borderRadius: 8, border: "none",
          background: T.primary + "18", color: T.primary,
          fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
          transition: "all 0.15s", whiteSpace: "nowrap",
        }}>Uzupełnij →</button>
    </div>
  );
}

export default function TutorDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* SIDEBAR */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* TOPBAR */}
        <div style={{
          height: 56, padding: "0 24px", display: "flex", alignItems: "center",
          background: T.bgAlt, borderBottom: `1px solid ${T.cardBorder}`,
          justifyContent: "space-between", flexShrink: 0,
        }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Cześć, <span style={{ color: T.primary }}>[Imię]</span> 👋</span>
            <span style={{ fontSize: 12, color: T.textDim, fontWeight: 500, marginLeft: 12 }}>Czwartek, 20 czerwca 2026</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <div
                onClick={() => setNotifOpen(!notifOpen)}
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                style={{
                  width: 36, height: 36, borderRadius: 10, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, transition: "background 0.15s", position: "relative",
                }}>
                🔔
                <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: T.secondary }} />
              </div>
            </div>

            {/* Avatar */}
            <div
              onMouseEnter={e => e.currentTarget.style.borderColor = T.primary}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.cardBorder}
              style={{
                width: 36, height: 36, borderRadius: 10, cursor: "pointer",
                background: `linear-gradient(135deg, ${T.primary}25, ${T.accent}15)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 900, color: T.primary,
                border: `1.5px solid ${T.cardBorder}`, transition: "border-color 0.2s",
              }}>KN</div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>

          {/* === 1. DZISIEJSZE LEKCJE === */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 2px" }}>Dzisiejsze lekcje</h2>
                <p style={{ fontSize: 12, color: T.textDim, fontWeight: 500, margin: 0 }}>{todayLessons.length} lekcje · {todayLessons.length} godzin</p>
              </div>
              <button
                onMouseEnter={e => { e.target.style.background = T.primary + "18"; }}
                onMouseLeave={e => { e.target.style.background = "transparent"; }}
                style={{
                  background: "transparent", border: `1.5px solid ${T.cardBorder}`,
                  color: T.primary, borderRadius: 10, padding: "7px 16px",
                  fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}>📅 Pełny harmonogram →</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {todayLessons.map((l, i) => <LessonCard key={i} lesson={l} />)}
            </div>
          </div>

          {/* === 2. PROPOZYCJE ODRABIANIA === */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Propozycje odrabiania</h2>
              <span style={{ fontSize: 11, fontWeight: 900, padding: "3px 10px", borderRadius: 10, background: T.secondary + "20", color: T.secondary }}>{makeupProposals.length} oczekujące</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
              {makeupProposals.map((p, i) => <MakeupCard key={i} proposal={p} />)}
            </div>
          </div>

          {/* === 3. BRAKUJĄCE WPISY === */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Brakujące wpisy</h2>
              <span style={{ fontSize: 11, fontWeight: 900, padding: "3px 10px", borderRadius: 10, background: T.danger + "20", color: T.danger }}>{missingEntries.length} do uzupełnienia</span>
            </div>
            <div style={{
              background: T.surface, borderRadius: 18, overflow: "hidden",
              border: `1px solid ${T.cardBorder}`,
            }}>
              {missingEntries.map((e, i) => <MissingEntryRow key={i} entry={e} />)}
            </div>
            <p style={{ fontSize: 10, color: T.textDim, fontWeight: 500, marginTop: 8, fontStyle: "italic" }}>
              Wpis blokuje się 48h po lekcji. Lekcje no-show mają status ZABLOKOWANY.
            </p>
          </div>

          {/* === 4. STATYSTYKI MIESIĘCZNE === */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Czerwiec 2026</h2>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onMouseEnter={e => e.target.style.background = T.surfaceHover}
                  onMouseLeave={e => e.target.style.background = T.surface}
                  style={{ background: T.surface, border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: T.textDim, fontSize: 14, fontFamily: "inherit", transition: "background 0.15s" }}>←</button>
                <button
                  onMouseEnter={e => e.target.style.background = T.surfaceHover}
                  onMouseLeave={e => e.target.style.background = T.surface}
                  style={{ background: T.surface, border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: T.textDim, fontSize: 14, fontFamily: "inherit", transition: "background 0.15s" }}>→</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <StatCard value="32h" label="Zrealizowane" sub="z 38h planowanych" color={T.primary} icon="📚" />
              <StatCard value="3 840 zł" label="Zarobek" sub="brutto, ten miesiąc" color={T.success} icon="💰" />
              <StatCard value="6" label="Planowanych" sub="lekcji do końca miesiąca" color={T.accent} icon="📅" />
              <StatCard value="2" label="Odwołane" sub="1 do odrobienia, 1 no-show" color={T.secondary} icon="🚫" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
