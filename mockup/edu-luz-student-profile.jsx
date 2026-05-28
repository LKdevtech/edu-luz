import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", primaryDark: "#2D7DE8", secondary: "#FF6F4A",
  tertiary: "#FFCA28", accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4",
  danger: "#EF4444", pink: "#E84393", orange: "#F59E0B",
  cardBorder: "rgba(59,143,240,0.10)",
};

const subjectColors = { Matematyka: "#3B8FF0" };
const levelColors = { SP: "#06B6D4", "ŚR": "#3B8FF0", "ŚR★": "#7C5CFC", EM: "#EF4444" };

const student = {
  name: "Kacper Nowak", initials: "KN", color: "#3B8FF0",
  cls: "2 LO (Liceum nr III)", level: "ŚR★", birthDate: "12.03.2009",
  parent: "Monika Nowak", parentPhone: "+48 602 345 678",
};

const schedule = [
  { day: "Poniedziałek", short: "Pon", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1" },
  { day: "Środa", short: "Śr", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1" },
  { day: "Sobota", short: "Sob", time: "9:00–10:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1" },
];

const stats = {
  totalLessons: 28, completed: 24, cancelled: 2, noShow: 1, makeupDone: 1,
  frequency: "95%", contractSince: "01.10.2025",
};

const notificationSettings = [
  { id: "entry_new", label: "Nowy wpis od korepetytora", desc: "Notatka, praca domowa po lekcji", push: true },
  { id: "homework", label: "Nowa praca domowa", desc: "Zadanie do zrobienia przed następną lekcją", push: true },
  { id: "lesson_cancel", label: "Odwołanie lekcji", desc: "Lekcja została odwołana lub zmieniona", push: true },
  { id: "makeup_update", label: "Odrabianie — aktualizacja", desc: "Nowy termin, akceptacja lub odrzucenie", push: true },
  { id: "schedule_change", label: "Zmiana w harmonogramie", desc: "Zmiana sali, godziny lub korepetytora", push: true },
];

/* ═══════════════ SHARED UI ═══════════════ */

const Card = ({ children, style, className }) => (
  <div className={className || "card-hover"} style={{
    background: T.surface, borderRadius: 14, border: `1px solid ${T.cardBorder}`,
    padding: 16, ...style,
  }}>{children}</div>
);

const LevelBadge = ({ level }) => {
  const c = levelColors[level] || T.textDim;
  return <span style={{ fontSize: 10, fontWeight: 800, color: c, background: c + "18", padding: "2px 7px", borderRadius: 5 }}>{level}</span>;
};

const SubjectDot = ({ subject }) => (
  <span style={{ width: 8, height: 8, borderRadius: "50%", background: subjectColors[subject] || T.textDim, display: "inline-block", flexShrink: 0 }} />
);

function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} className="tab-hover" style={{
      width: 36, height: 20, borderRadius: 10, cursor: "pointer",
      background: on ? T.primary : T.bgAlt,
      border: `1px solid ${on ? T.primary + "50" : T.cardBorder}`,
      position: "relative", flexShrink: 0,
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: "50%",
        background: on ? "#fff" : T.textDim,
        position: "absolute", top: 2,
        left: on ? 19 : 2,
        transition: "all .15s ease",
      }} />
    </div>
  );
}

/* ═══════════════ SIDEBAR ═══════════════ */

function Sidebar({ collapsed, onToggle }) {
  const items = [
    { icon: "📊", label: "Dashboard", active: false },
    { icon: "📚", label: "Zajęcia", active: false },
    { icon: "👤", label: "Profil", active: true },
  ];
  return (
    <div style={{ width: collapsed ? 64 : 240, minWidth: collapsed ? 64 : 240, background: T.bgAlt, borderRight: `1px solid ${T.cardBorder}`, display: "flex", flexDirection: "column", transition: "all .2s", zIndex: 10 }}>
      <div style={{ padding: collapsed ? "20px 12px" : "20px 20px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${T.primary},${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff" }}>Ez</div>
        {!collapsed && <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>EDU <span style={{ color: T.primary }}>LUZ</span></div>
          <div style={{ fontSize: 9, fontWeight: 800, color: T.cyan, background: T.cyan + "18", padding: "2px 8px", borderRadius: 4, marginTop: 2, letterSpacing: 1.5, textAlign: "center" }}>UCZEŃ</div>
        </div>}
      </div>
      <div style={{ padding: "12px 8px", flex: 1 }}>
        {items.map((it, i) => (
          <div key={i} className="nav-item" style={{ display: "flex", alignItems: "center", gap: 12, padding: collapsed ? "12px 0" : "12px 16px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: 10, background: it.active ? T.primary + "18" : "transparent", color: it.active ? T.primary : T.textMuted, fontWeight: it.active ? 800 : 600, fontSize: 14, cursor: "pointer", marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>{it.icon}</span>
            {!collapsed && <span>{it.label}</span>}
          </div>
        ))}
      </div>
      <div style={{ padding: "12px 8px", borderTop: `1px solid ${T.cardBorder}` }}>
        <div onClick={onToggle} className="nav-item" style={{ display: "flex", alignItems: "center", gap: 12, padding: collapsed ? "10px 0" : "10px 16px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: 10, color: T.textDim, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
          <span style={{ fontSize: 16 }}>{collapsed ? "→" : "←"}</span>
          {!collapsed && <span>Zwiń</span>}
        </div>
      </div>
    </div>
  );
}

const Topbar = () => (
  <div style={{ height: 48, padding: "0 24px", background: T.bgAlt, borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div>
      <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Cześć, </span>
      <span style={{ fontSize: 15, fontWeight: 800, color: T.primary }}>Kacper</span>
      <span style={{ fontSize: 12, color: T.textDim, marginLeft: 12, fontWeight: 600 }}>Czwartek, 22 maja 2026</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div className="icon-btn" style={{ width: 36, height: 36, borderRadius: 10, background: T.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <span style={{ fontSize: 16 }}>🔔</span>
      </div>
      <div className="icon-btn" style={{ width: 36, height: 36, borderRadius: 10, background: T.primary + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: T.primary, cursor: "pointer" }}>KN</div>
    </div>
  </div>
);

/* ═══════════════ STUDENT INFO ═══════════════ */

function StudentInfo() {
  return (
    <Card className="card-hover" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: student.color + "22", color: student.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800 }}>{student.initials}</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>{student.name}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.textDim, display: "flex", alignItems: "center", gap: 6 }}>
            {student.cls} • <LevelBadge level={student.level} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { icon: "🎂", label: "Data urodzenia", value: student.birthDate },
          { icon: "👩", label: "Rodzic", value: student.parent },
          { icon: "📞", label: "Kontakt do rodzica", value: student.parentPhone },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{f.icon}</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 1 }}>{f.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{f.value}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ═══════════════ SCHEDULE ═══════════════ */

function ScheduleSection() {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .8, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        📋 Stały plan zajęć
        <span style={{ fontSize: 11, fontWeight: 700, color: T.primary, background: T.primary + "15", padding: "2px 10px", borderRadius: 6 }}>{schedule.length}×/tydz</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {schedule.map((s, i) => {
          const sC = subjectColors[s.subject] || T.textDim;
          return (
            <Card key={i} style={{ padding: "12px 14px", borderLeft: `3px solid ${sC}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, borderRadius: 8, background: T.primary + "12", padding: "6px 0", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.primary }}>{s.short}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <SubjectDot subject={s.subject} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{s.subject}</span>
                    <LevelBadge level={student.level} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: T.textDim, fontWeight: 600 }}>
                    <span style={{ fontWeight: 700, color: T.textMuted }}>🕐 {s.time}</span>
                    <span>👤 {s.tutor}</span>
                    <span>📍 {s.room}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════ STATS ═══════════════ */

function StatsSection() {
  const items = [
    { label: "Lekcji łącznie", value: stats.totalLessons, color: T.text },
    { label: "Zrealizowane", value: stats.completed, color: T.success },
    { label: "Odwołane", value: stats.cancelled, color: T.danger },
    { label: "No-show", value: stats.noShow, color: T.orange },
    { label: "Odrobione", value: stats.makeupDone, color: T.accent },
    { label: "Frekwencja", value: stats.frequency, color: T.success },
  ];

  return (
    <Card className="card-hover" style={{ background: T.bgAlt, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>📊 Statystyki (od {stats.contractSince})</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {items.map((s, i) => (
          <div key={i} style={{ padding: "8px", borderRadius: 8, background: T.surface, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.textDim, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ═══════════════ NOTIFICATIONS ═══════════════ */

function NotificationSection() {
  const [settings, setSettings] = useState(
    Object.fromEntries(notificationSettings.map(n => [n.id, n.push]))
  );

  const toggle = (id) => setSettings(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .8, marginBottom: 12 }}>
        🔔 Powiadomienia push
      </div>
      <Card className="card-hover" style={{ padding: "4px 16px" }}>
        {notificationSettings.map((n, i) => (
          <div key={n.id} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
            borderBottom: i < notificationSettings.length - 1 ? `1px solid ${T.cardBorder}` : "none",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 1 }}>{n.label}</div>
              <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>{n.desc}</div>
            </div>
            <Toggle on={settings[n.id]} onToggle={() => toggle(n.id)} />
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ═══════════════ CENTER CONTACT ═══════════════ */

function CenterContact() {
  return (
    <Card className="card-hover" style={{ background: T.bgAlt, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>🏢 Centrum EDU LUZ</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>📍</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>ul. Szkolna 8, 00-456 Warszawa</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>📞</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>+48 123 456 789</span>
        </div>
      </div>
    </Card>
  );
}

/* ═══════════════ ACCOUNT ═══════════════ */

function AccountActions() {
  return (
    <Card className="card-hover" style={{ background: T.bgAlt, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>⚙ Konto</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <button className="btn-ghost" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>🔒 Zmień hasło</button>
        <button className="btn-ghost" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.danger}20`, background: "transparent", color: T.danger, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textAlign: "left", opacity: 0.7 }}>🚪 Wyloguj się</button>
      </div>
    </Card>
  );
}

/* ═══════════════ TUTOR CONTACT ═══════════════ */

function TutorContact() {
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => { setSent(true); setMessage(""); setTimeout(() => { setSent(false); setMessageOpen(false); }, 2000); };

  return (
    <Card className="card-hover" style={{ background: T.bgAlt, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>💬 Moi korepetytorzy</div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: T.primary + "18", color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>TK</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Tomasz Kowalski</div>
          <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <SubjectDot subject="Matematyka" />
            Matematyka
          </div>
        </div>
        <button onClick={() => setMessageOpen(!messageOpen)} className="btn-ghost" style={{
          padding: "6px 12px", borderRadius: 8,
          border: `1px solid ${messageOpen ? T.textDim + "30" : T.primary + "30"}`,
          background: messageOpen ? "transparent" : T.primary + "10",
          color: messageOpen ? T.textDim : T.primary,
          fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}>{messageOpen ? "Anuluj" : "💬 Napisz"}</button>
      </div>

      {messageOpen && (
        <div style={{ marginTop: 8 }}>
          {sent ? (
            <div style={{ padding: "12px", textAlign: "center", background: T.success + "0A", borderRadius: 8, border: `1px solid ${T.success}20` }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.success }}>✓ Wiadomość wysłana!</span>
            </div>
          ) : (
            <>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Napisz wiadomość do korepetytora..." style={{ width: "100%", minHeight: 72, padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.primary}30`, background: T.surface, color: T.text, fontSize: 12, fontWeight: 500, fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: 1.5 }} />
              <button onClick={handleSend} disabled={!message.trim()} style={{ marginTop: 6, width: "100%", padding: "8px 0", borderRadius: 8, border: "none", background: message.trim() ? T.primary : T.surface, color: message.trim() ? "#fff" : T.textDim, fontSize: 12, fontWeight: 700, cursor: message.trim() ? "pointer" : "default", fontFamily: "inherit", opacity: message.trim() ? 1 : 0.5 }}>Wyślij wiadomość</button>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

/* ═══════════════ MAIN ═══════════════ */

export default function StudentProfile() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: T.bg, fontFamily: "'Nunito', sans-serif", color: T.text, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.cardBorder}; border-radius: 50px; }
        .card-hover { transition: all .18s ease !important; }
        .card-hover:hover { transform: translateY(-2px); border-color: rgba(59,143,240,0.22) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.18); }
        .nav-item { transition: all .15s ease !important; }
        .nav-item:hover { background: rgba(59,143,240,0.08) !important; }
        .tab-hover { transition: all .15s ease !important; }
        .tab-hover:hover { background: rgba(59,143,240,0.10) !important; }
        .icon-btn { transition: all .15s ease !important; }
        .icon-btn:hover { background: ${T.surface} !important; transform: scale(1.08); }
        .btn-ghost { transition: all .15s ease !important; }
        .btn-ghost:hover { background: ${T.surfaceHover} !important; }
      `}</style>

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar />
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, maxWidth: 1200 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <StudentInfo />
              <ScheduleSection />
              <NotificationSection />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <TutorContact />
              <StatsSection />
              <CenterContact />
              <AccountActions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
