import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", primaryDark: "#2D7DE8", secondary: "#FF6F4A",
  tertiary: "#FFCA28", accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4",
  danger: "#EF4444", pink: "#E84393", orange: "#F59E0B",
  cardBorder: "rgba(59,143,240,0.10)",
};

const subjectColors = { Matematyka: "#3B8FF0", Angielski: "#06B6D4", Fizyka: "#F59E0B" };
const levelColors = { SP: "#06B6D4", E8: "#FFCA28", "ŚR": "#3B8FF0", "ŚR★": "#7C5CFC", EM: "#EF4444", "EM★": "#E84393" };

const childrenData = [
  { id: "kacper", name: "Kacper Nowak", initials: "KN", color: "#3B8FF0", cls: "2 LO", level: "ŚR★" },
  { id: "ola", name: "Ola Nowak", initials: "ON", color: "#E84393", cls: "kl. 7", level: "SP" },
];

/* ─── SCHEDULE DATA (stały plan wg umowy) ─── */
const scheduleData = [
  { child: "kacper", day: "Poniedziałek", dayShort: "Pon", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", type: "indyw.", level: "ŚR★" },
  { child: "kacper", day: "Środa", dayShort: "Śr", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", type: "indyw.", level: "ŚR★" },
  { child: "kacper", day: "Sobota", dayShort: "Sob", time: "9:00–10:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", type: "indyw.", level: "ŚR★" },
  { child: "ola", day: "Wtorek", dayShort: "Wt", time: "15:15–16:15", subject: "Angielski", tutor: "Maria Zielińska", room: "Sala 2", type: "indyw.", level: "SP" },
  { child: "ola", day: "Czwartek", dayShort: "Czw", time: "15:15–16:15", subject: "Angielski", tutor: "Maria Zielińska", room: "Sala 2", type: "indyw.", level: "SP" },
  { child: "ola", day: "Środa", dayShort: "Śr", time: "16:30–17:30", subject: "Angielski", tutor: "Maria Zielińska", room: "Sala 3", type: "grupa", level: "SP", groupName: "Grupa A (3 os.)" },
];

const scheduleExceptions = [
  { child: "ola", date: "Czw 08.05", type: "odwołana", subject: "Angielski", reason: "Choroba ucznia (>24h)", result: "Do odrobienia" },
  { child: "kacper", date: "Pon 12.05", type: "odwołana", subject: "Matematyka", reason: "Odwołana przez rodzica (>24h)", result: "Do odrobienia" },
  { child: "kacper", date: "Sob 03.05", type: "zmiana sali", subject: "Matematyka", reason: "Remont Sali 1", result: "Sala 2 zamiast Sala 1" },
];

/* ─── HISTORY DATA ─── */
const statusIcons = {
  completed: { symbol: "✓", color: T.success, label: "Zrealizowana z wpisem" },
  completed_no_entry: { symbol: "✓", color: T.tertiary, label: "Zrealizowana BEZ wpisu" },
  planned: { symbol: "○", color: T.primary, label: "Zaplanowana" },
  in_progress: { symbol: "●", color: T.tertiary, label: "W trakcie" },
  cancelled: { symbol: "✕", color: T.danger, label: "Odwołana" },
  no_show: { symbol: "⊘", color: T.orange, label: "No-show" },
  makeup: { symbol: "↻", color: T.accent, label: "Odrabianie" },
};

const historyData = [
  // Przyszłe / dziś
  { id: 101, child: "kacper", date: "Czw 22.05", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", type: "indyw.", status: "planned", under24h: true, entry: null },
  { id: 102, child: "ola", date: "Czw 22.05", time: "15:15–16:15", subject: "Angielski", tutor: "Maria Zielińska", room: "Sala 2", level: "SP", type: "indyw.", status: "planned", under24h: true, entry: null },
  { id: 103, child: "kacper", date: "Pt 23.05", time: "10:00–11:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", type: "indyw.", status: "planned", under24h: false, entry: null },
  // Przeszłe
  { id: 1, child: "kacper", date: "Wt 20.05", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", type: "indyw.", status: "completed",
    entry: { topic: "Ciągi geometryczne — obliczanie sumy", noteForParent: "Kacper robi duże postępy. Opanował wzory na sumę ciągu.", noteForStudent: "Pamiętaj o wzorze na sumę n wyrazów!", homework: "Zad. 5.1–5.10 str. 94", hwDone: null }},
  { id: 2, child: "ola", date: "Wt 20.05", time: "15:15–16:15", subject: "Angielski", tutor: "Maria Zielińska", room: "Sala 2", level: "SP", type: "indyw.", status: "completed",
    entry: { topic: "Present Perfect — ćwiczenia z 'since' i 'for'", noteForParent: "Ola bardzo dobrze radzi sobie z czasami.", noteForStudent: "Great job! 'since' = punkt w czasie, 'for' = okres.", homework: "Ćwiczenie 3A–3D str. 45", hwDone: null }},
  { id: 3, child: "kacper", date: "Sob 17.05", time: "9:00–10:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", type: "indyw.", status: "completed",
    entry: { topic: "Ciągi arytmetyczne — wzory i zadania", noteForParent: null, noteForStudent: "Powtórz wzór na n-ty wyraz.", homework: "Zad. 4.1–4.8 str. 87", hwDone: "checked" }},
  { id: 4, child: "ola", date: "Czw 15.05", time: "15:15–16:15", subject: "Angielski", tutor: "Maria Zielińska", room: "Sala 2", level: "SP", type: "indyw.", status: "completed",
    entry: { topic: "Past Simple vs Present Perfect — różnice", noteForParent: "Drobne trudności, ale po ćwiczeniach dużo lepiej.", noteForStudent: "Signal words: 'yesterday' = Past, 'already' = Perfect.", homework: null, hwDone: null }},
  { id: 5, child: "kacper", date: "Śr 14.05", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", type: "indyw.", status: "completed",
    entry: { topic: "Ciąg Fibonacciego i zastosowania", noteForParent: "Świetna lekcja, Kacper bardzo zaangażowany.", noteForStudent: "Spróbuj wypisać 15 pierwszych wyrazów ciągu.", homework: "Zad. 3.5–3.12 str. 78", hwDone: "checked" }},
  { id: 6, child: "ola", date: "Śr 14.05", time: "16:30–17:30", subject: "Angielski", tutor: "Maria Zielińska", room: "Sala 3", level: "SP", type: "grupa", status: "completed",
    entry: { topic: "Grupa: Vocabulary — daily routines", noteForParent: null, noteForStudent: "Learn 10 new words from today!", homework: null, hwDone: null }},
  { id: 7, child: "kacper", date: "Pon 12.05", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", type: "indyw.", status: "cancelled",
    cancelReason: "Odwołana przez rodzica (>24h)", canMakeup: true, entry: null },
  { id: 8, child: "ola", date: "Czw 08.05", time: "15:15–16:15", subject: "Angielski", tutor: "Maria Zielińska", room: "Sala 2", level: "SP", type: "indyw.", status: "cancelled",
    cancelReason: "Choroba ucznia (>24h)", canMakeup: true, entry: null },
  { id: 9, child: "kacper", date: "Sob 10.05", time: "9:00–10:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", type: "indyw.", status: "no_show",
    entry: null },
  { id: 10, child: "ola", date: "Wt 06.05", time: "15:15–16:15", subject: "Angielski", tutor: "Maria Zielińska", room: "Sala 2", level: "SP", type: "indyw.", status: "completed_no_entry",
    entry: null },
];

/* ─── MAKEUP DATA ─── */
const makeupData = [
  { id: 1, child: "ola", subject: "Angielski", tutor: "Maria Zielińska", level: "SP", originalDate: "Czw 08.05", reason: "Choroba (>24h)", status: "waiting_for_parent", proposedSlots: ["Pon 26.05, 16:30–17:30", "Śr 28.05, 16:30–17:30", "Sob 31.05, 11:00–12:00"], deadline: "07.06.2026", daysLeft: 16 },
  { id: 2, child: "kacper", subject: "Matematyka", tutor: "Tomasz Kowalski", level: "ŚR★", originalDate: "Pon 12.05", reason: "Odwołana przez rodzica (>24h)", status: "proposed", proposedDate: "Śr 28.05, 18:15–19:15", proposedBy: "tutor", deadline: "11.06.2026", daysLeft: 20 },
  { id: 3, child: "kacper", subject: "Matematyka", tutor: "Tomasz Kowalski", level: "ŚR★", originalDate: "Śr 16.04", reason: "Odwołana przez centrum", status: "completed", completedDate: "Sob 26.04, 10:00–11:00", deadline: null, daysLeft: null },
];

/* ═══════════════ SHARED UI ═══════════════ */

const Card = ({ children, style, onClick, className }) => (
  <div onClick={onClick} className={className || (onClick ? "card-click" : "card-hover")} style={{
    background: T.surface, borderRadius: 14, border: `1px solid ${T.cardBorder}`,
    padding: 16, cursor: onClick ? "pointer" : "default", ...style,
  }}>{children}</div>
);

const LevelBadge = ({ level }) => {
  const c = levelColors[level] || T.textDim;
  return <span style={{ fontSize: 10, fontWeight: 800, color: c, background: c + "18", padding: "2px 7px", borderRadius: 5 }}>{level}</span>;
};

const SubjectDot = ({ subject }) => (
  <span style={{ width: 8, height: 8, borderRadius: "50%", background: subjectColors[subject] || T.textDim, display: "inline-block", flexShrink: 0 }} />
);

const StatusBadge = ({ status }) => {
  const s = statusIcons[status];
  if (!s) return null;
  return <span style={{ fontSize: 10, fontWeight: 800, color: s.color, background: s.color + "18", padding: "2px 8px", borderRadius: 5, display: "inline-flex", alignItems: "center", gap: 4 }}>{s.symbol} {s.label}</span>;
};

/* ═══════════════ SIDEBAR ═══════════════ */

function Sidebar({ collapsed, onToggle }) {
  const items = [
    { icon: "📊", label: "Dashboard", active: false, badge: null },
    { icon: "📚", label: "Zajęcia", active: true, badge: null },
    { icon: "💳", label: "Płatności", active: false, badge: 1 },
    { icon: "👤", label: "Profil", active: false, badge: null },
  ];
  return (
    <div style={{ width: collapsed ? 64 : 240, minWidth: collapsed ? 64 : 240, background: T.bgAlt, borderRight: `1px solid ${T.cardBorder}`, display: "flex", flexDirection: "column", transition: "all .2s", zIndex: 10 }}>
      <div style={{ padding: collapsed ? "20px 12px" : "20px 20px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${T.primary},${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff" }}>Ez</div>
        {!collapsed && <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>EDU <span style={{ color: T.primary }}>LUZ</span></div>
          <div style={{ fontSize: 9, fontWeight: 800, color: T.accent, background: T.accent + "18", padding: "2px 8px", borderRadius: 4, marginTop: 2, letterSpacing: 1.5, textAlign: "center" }}>RODZIC</div>
        </div>}
      </div>
      <div style={{ padding: "12px 8px", flex: 1 }}>
        {items.map((it, i) => (
          <div key={i} className="nav-item" style={{ display: "flex", alignItems: "center", gap: 12, padding: collapsed ? "12px 0" : "12px 16px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: 10, background: it.active ? T.primary + "18" : "transparent", color: it.active ? T.primary : T.textMuted, fontWeight: it.active ? 800 : 600, fontSize: 14, cursor: "pointer", marginBottom: 4, position: "relative" }}>
            <span style={{ fontSize: 18 }}>{it.icon}</span>
            {!collapsed && <span>{it.label}</span>}
            {it.badge && <span style={{ position: collapsed ? "absolute" : "relative", top: collapsed ? 6 : "auto", right: collapsed ? 8 : "auto", marginLeft: collapsed ? 0 : "auto", background: T.danger, color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 8, padding: "1px 6px", minWidth: 18, textAlign: "center" }}>{it.badge}</span>}
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
      <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Dzień dobry, </span>
      <span style={{ fontSize: 15, fontWeight: 800, color: T.primary }}>Monika</span>
      <span style={{ fontSize: 12, color: T.textDim, marginLeft: 12, fontWeight: 600 }}>Czwartek, 22 maja 2026</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div className="icon-btn" style={{ width: 36, height: 36, borderRadius: 10, background: T.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
        <span style={{ fontSize: 16 }}>🔔</span>
        <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: T.danger, border: `2px solid ${T.bgAlt}` }} />
      </div>
      <div className="icon-btn" style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${T.accent},${T.pink})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", cursor: "pointer" }}>MN</div>
    </div>
  </div>
);

/* ═══════════════ CHILD SWITCHER ═══════════════ */

function ChildSwitcher({ active, onChange }) {
  const tabs = [
    { id: "all", label: "Wszystkie", icon: "👨‍👩‍👧‍👦", color: T.primary },
    ...childrenData.map(c => ({ id: c.id, label: c.name.split(" ")[0], icon: null, color: c.color, initials: c.initials })),
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, background: T.bgAlt, borderRadius: 12, padding: 4, border: `1px solid ${T.cardBorder}`, width: "fit-content" }}>
      {tabs.map(tab => {
        const on = active === tab.id;
        return (
          <div key={tab.id} onClick={() => onChange(tab.id)} className="tab-hover" style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, background: on ? tab.color + "18" : "transparent", cursor: "pointer" }}>
            {tab.icon ? <span style={{ fontSize: 14 }}>{tab.icon}</span>
              : <div style={{ width: 22, height: 22, borderRadius: 6, background: (on ? tab.color : T.textDim) + "22", color: on ? tab.color : T.textDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800 }}>{tab.initials}</div>}
            <span style={{ fontSize: 13, fontWeight: on ? 800 : 600, color: on ? tab.color : T.textMuted }}>{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════ SUB-TABS ═══════════════ */

function SubTabs({ active, onChange }) {
  const tabs = [
    { id: "schedule", label: "Harmonogram", icon: "📋", count: null },
    { id: "history", label: "Historia lekcji", icon: "📖", count: null },
    { id: "makeup", label: "Odrabianie", icon: "↻", count: makeupData.filter(m => m.status !== "completed").length },
  ];
  return (
    <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${T.cardBorder}`, paddingBottom: 0 }}>
      {tabs.map(tab => {
        const on = active === tab.id;
        return (
          <div key={tab.id} onClick={() => onChange(tab.id)} className="tab-hover" style={{
            padding: "10px 20px", cursor: "pointer", borderBottom: `2px solid ${on ? T.primary : "transparent"}`,
            display: "flex", alignItems: "center", gap: 6, marginBottom: -1,
          }}>
            <span style={{ fontSize: 14 }}>{tab.icon}</span>
            <span style={{ fontSize: 13, fontWeight: on ? 800 : 600, color: on ? T.primary : T.textMuted }}>{tab.label}</span>
            {tab.count > 0 && <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: T.orange, borderRadius: 8, padding: "1px 6px", minWidth: 18, textAlign: "center" }}>{tab.count}</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════ TAB: HARMONOGRAM ═══════════════ */

function ScheduleTab({ childFilter }) {
  const [exceptionsOpen, setExceptionsOpen] = useState(false);
  const filtered = scheduleData.filter(s => childFilter === "all" || s.child === childFilter);
  const filteredExc = scheduleExceptions.filter(e => childFilter === "all" || e.child === childFilter);

  const dayOrder = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
  const grouped = dayOrder.map(d => ({ day: d, lessons: filtered.filter(s => s.day === d) })).filter(g => g.lessons.length > 0);

  return (
    <div style={{ paddingTop: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .8, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        📋 Regularne zajęcia wg umowy
        <span style={{ fontSize: 11, fontWeight: 700, color: T.primary, background: T.primary + "15", padding: "2px 10px", borderRadius: 6 }}>{filtered.length} zajęć/tydz</span>
      </div>

      {filtered.length === 0 && <Card style={{ textAlign: "center", padding: 24 }}><span style={{ color: T.textDim }}>Brak zajęć dla wybranego dziecka</span></Card>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {grouped.map((group, gi) => (
          <div key={gi}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, marginBottom: 6, textTransform: "uppercase", letterSpacing: .5 }}>{group.day}</div>
            {group.lessons.map((lesson, li) => {
              const ch = childrenData.find(c => c.id === lesson.child);
              const sC = subjectColors[lesson.subject] || T.textDim;
              return (
                <Card key={li} style={{ padding: "12px 14px", borderLeft: `3px solid ${sC}`, marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: ch.color + "22", color: ch.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{ch.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                        {childFilter === "all" && <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{ch.name.split(" ")[0]}</span>}
                        <SubjectDot subject={lesson.subject} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{lesson.subject}</span>
                        <LevelBadge level={lesson.level} />
                        {lesson.type === "grupa" && <span style={{ fontSize: 9, fontWeight: 700, color: T.accent, background: T.accent + "18", padding: "1px 6px", borderRadius: 4 }}>GRUPA</span>}
                        {lesson.groupName && <span style={{ fontSize: 11, color: T.accent, fontWeight: 600 }}>{lesson.groupName}</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: T.textDim, fontWeight: 600 }}>
                        <span style={{ color: T.textMuted, fontWeight: 700 }}>🕐 {lesson.time}</span>
                        <span>👤 {lesson.tutor}</span>
                        <span>📍 {lesson.room}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ))}
      </div>

      {/* Exceptions */}
      {filteredExc.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div onClick={() => setExceptionsOpen(!exceptionsOpen)} className="tab-hover" style={{
            fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .8,
            display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 0",
          }}>
            ⚠ Wyjątki i zmiany
            <span style={{ fontSize: 10, fontWeight: 700, color: T.orange, background: T.orange + "18", padding: "2px 8px", borderRadius: 5 }}>{filteredExc.length}</span>
            <span style={{ fontSize: 11, color: T.textDim, transform: exceptionsOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", display: "inline-block", marginLeft: "auto" }}>▼</span>
          </div>

          {exceptionsOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {filteredExc.map((exc, i) => {
                const ch = childrenData.find(c => c.id === exc.child);
                const typeColors = { odwołana: T.danger, "zmiana sali": T.orange, "zmiana godziny": T.tertiary };
                const tc = typeColors[exc.type] || T.textDim;
                return (
                  <Card key={i} style={{ padding: "10px 14px", borderLeft: `3px solid ${tc}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: ch.color + "22", color: ch.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800 }}>{ch.initials}</div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{exc.date}</span>
                      <SubjectDot subject={exc.subject} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted }}>{exc.subject}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, color: tc, background: tc + "18", padding: "1px 6px", borderRadius: 4, textTransform: "uppercase" }}>{exc.type}</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500, paddingLeft: 30 }}>
                      {exc.reason} → <span style={{ color: T.textMuted, fontWeight: 600 }}>{exc.result}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ TAB: HISTORIA ═══════════════ */

function HistoryTab({ childFilter }) {
  const [expanded, setExpanded] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [cancelledIds, setCancelledIds] = useState([]);

  const statuses = [
    { id: "all", label: "Wszystkie" },
    { id: "completed", label: "Zrealizowane" },
    { id: "planned", label: "Zaplanowane" },
    { id: "cancelled", label: "Odwołane" },
    { id: "no_show", label: "No-show" },
  ];

  const filtered = historyData.filter(h => {
    if (cancelledIds.includes(h.id)) return false;
    if (childFilter !== "all" && h.child !== childFilter) return false;
    if (statusFilter === "all") return true;
    if (statusFilter === "completed") return h.status === "completed" || h.status === "completed_no_entry";
    return h.status === statusFilter;
  });

  const doCancel = (id) => { setCancelledIds(p => [...p, id]); setCancelConfirm(null); };

  return (
    <div style={{ paddingTop: 16 }}>
      {/* Status filters */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
        {statuses.map(s => {
          const on = statusFilter === s.id;
          return (
            <div key={s.id} onClick={() => setStatusFilter(s.id)} className="tab-hover" style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: on ? 800 : 600,
              background: on ? T.primary + "18" : T.surface, color: on ? T.primary : T.textMuted,
              cursor: "pointer", border: `1px solid ${on ? T.primary + "30" : T.cardBorder}`,
            }}>{s.label}</div>
          );
        })}
      </div>

      {filtered.length === 0 && <Card style={{ textAlign: "center", padding: 24 }}><span style={{ color: T.textDim, fontSize: 13 }}>Brak lekcji w tej kategorii</span></Card>}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map(lesson => {
          const ch = childrenData.find(c => c.id === lesson.child);
          const sC = subjectColors[lesson.subject] || T.textDim;
          const si = statusIcons[lesson.status];
          const isOpen = expanded === lesson.id;
          const isPast = !["planned", "in_progress"].includes(lesson.status);

          return (
            <Card key={lesson.id} onClick={() => lesson.entry ? setExpanded(isOpen ? null : lesson.id) : null} className={lesson.entry ? "entry-expand" : "card-hover"} style={{
              padding: 0, cursor: lesson.entry ? "pointer" : "default",
              border: isOpen ? `1px solid ${sC}30` : `1px solid ${T.cardBorder}`,
              opacity: lesson.status === "cancelled" || lesson.status === "no_show" ? 0.7 : 1,
            }}>
              {/* Header row */}
              <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                {/* Status indicator */}
                <div style={{ width: 28, height: 28, borderRadius: 7, background: si.color + "18", color: si.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{si.symbol}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                    {childFilter === "all" && <span style={{ fontSize: 11, fontWeight: 700, color: ch.color }}>{ch.name.split(" ")[0]}</span>}
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{lesson.date}</span>
                    <span style={{ fontSize: 11, color: T.textDim, fontWeight: 600 }}>{lesson.time}</span>
                    <SubjectDot subject={lesson.subject} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted }}>{lesson.subject}</span>
                    <LevelBadge level={lesson.level} />
                    {lesson.type === "grupa" && <span style={{ fontSize: 9, fontWeight: 700, color: T.accent, background: T.accent + "18", padding: "1px 6px", borderRadius: 4 }}>GR</span>}
                  </div>
                  <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>
                    {lesson.tutor} • {lesson.room}
                    {lesson.cancelReason && <span style={{ color: T.danger, marginLeft: 8 }}>— {lesson.cancelReason}</span>}
                    {lesson.status === "no_show" && <span style={{ color: T.orange, marginLeft: 8 }}>— Nieobecność bez odwołania</span>}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {lesson.entry?.homework && <span style={{ fontSize: 9, fontWeight: 700, color: T.tertiary, background: T.tertiary + "18", padding: "2px 6px", borderRadius: 4 }}>📝 PD</span>}
                  {lesson.entry?.hwDone === "checked" && <span style={{ fontSize: 9, fontWeight: 700, color: T.success, background: T.success + "18", padding: "2px 6px", borderRadius: 4 }}>✓</span>}

                  {/* Cancel button for planned */}
                  {lesson.status === "planned" && (
                    <button onClick={(e) => { e.stopPropagation(); setCancelConfirm(lesson.id); }} className="btn-cancel" style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${lesson.under24h ? T.orange : T.danger}30`, background: (lesson.under24h ? T.orange : T.danger) + "10", color: lesson.under24h ? T.orange : T.danger, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Odwołaj</button>
                  )}

                  {lesson.entry && <span style={{ fontSize: 11, color: T.textDim, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", display: "inline-block" }}>▼</span>}
                </div>
              </div>

              {/* Cancel confirm overlay */}
              {cancelConfirm === lesson.id && (
                <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: "rgba(21,24,39,.92)", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 16 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Odwołać {lesson.subject} ({lesson.date}, {lesson.time})?</span>
                  {lesson.under24h
                    ? <span style={{ fontSize: 11, color: T.danger, fontWeight: 600, background: T.danger + "15", padding: "4px 10px", borderRadius: 6, textAlign: "center" }}>⚠ Mniej niż 24h — lekcja przepadnie</span>
                    : <span style={{ fontSize: 11, color: T.success, fontWeight: 600, textAlign: "center" }}>Ponad 24h — będzie można odrobić</span>}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={(e) => { e.stopPropagation(); setCancelConfirm(null); }} className="btn-ghost" style={{ padding: "6px 16px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, background: T.surface, color: T.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Nie</button>
                    <button onClick={(e) => { e.stopPropagation(); doCancel(lesson.id); }} className="btn-danger" style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: T.danger, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{lesson.under24h ? "Odwołaj (przepadnie)" : "Tak, odwołaj"}</button>
                  </div>
                </div>
              )}

              {/* Expanded entry */}
              {isOpen && lesson.entry && (
                <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${T.cardBorder}` }}>
                  <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{lesson.entry.topic}</div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>Notatka dla ucznia</div>
                      <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5, fontWeight: 500, background: T.bgAlt, padding: "8px 10px", borderRadius: 8, borderLeft: `2px solid ${T.primary}40` }}>{lesson.entry.noteForStudent}</div>
                    </div>
                    {lesson.entry.noteForParent && <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>Uwaga dla rodzica</div>
                      <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5, fontWeight: 500, background: T.accent + "0A", padding: "8px 10px", borderRadius: 8, borderLeft: `2px solid ${T.accent}40` }}>{lesson.entry.noteForParent}</div>
                    </div>}
                    {lesson.entry.homework && <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>Praca domowa</div>
                      <div style={{ fontSize: 12, color: T.tertiary, lineHeight: 1.5, fontWeight: 600, background: T.tertiary + "0A", padding: "8px 10px", borderRadius: 8, borderLeft: `2px solid ${T.tertiary}40`, display: "flex", alignItems: "center", gap: 6 }}>
                        📝 {lesson.entry.homework}
                        {lesson.entry.hwDone === "checked" && <span style={{ fontSize: 10, fontWeight: 700, color: T.success, background: T.success + "18", padding: "2px 6px", borderRadius: 4, marginLeft: "auto" }}>✓ Sprawdzona</span>}
                      </div>
                    </div>}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════ TAB: ODRABIANIE ═══════════════ */

function MakeupTab({ childFilter }) {
  const [respondingTo, setRespondingTo] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const filtered = makeupData.filter(m => childFilter === "all" || m.child === childFilter);
  const pending = filtered.filter(m => m.status !== "completed");
  const done = filtered.filter(m => m.status === "completed");

  return (
    <div style={{ paddingTop: 20 }}>
      {/* Pending */}
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .8, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        ⏳ Oczekujące
        {pending.length > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: T.orange, background: T.orange + "18", padding: "2px 8px", borderRadius: 5 }}>{pending.length}</span>}
      </div>

      {pending.length === 0 && <Card style={{ textAlign: "center", padding: 20 }}><span style={{ color: T.textDim, fontSize: 13 }}>Brak oczekujących odrabiań</span></Card>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {pending.map(item => {
          const ch = childrenData.find(c => c.id === item.child);
          const sC = subjectColors[item.subject] || T.textDim;
          const isR = respondingTo === item.id;
          return (
            <Card key={item.id} style={{ borderLeft: `3px solid ${T.accent}`, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: ch.color + "22", color: ch.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>{ch.initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    {childFilter === "all" && <span style={{ fontSize: 12, fontWeight: 700, color: ch.color }}>{ch.name.split(" ")[0]}</span>}
                    <SubjectDot subject={item.subject} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{item.subject}</span>
                    <LevelBadge level={item.level} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: T.accent, background: T.accent + "18", padding: "1px 6px", borderRadius: 4 }}>ODR</span>
                  </div>

                  <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500, marginBottom: 6 }}>
                    Odwołana: {item.originalDate} • {item.reason}
                  </div>
                  <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>
                    Korepetytor: <span style={{ color: T.textMuted }}>{item.tutor}</span> • Termin odrobienia: do <span style={{ color: item.daysLeft < 7 ? T.danger : T.textMuted, fontWeight: 700 }}>{item.deadline}</span>
                  </div>

                  {/* Proposed by tutor */}
                  {item.status === "proposed" && (
                    <div style={{ background: T.success + "0A", borderRadius: 10, padding: "10px 12px", marginTop: 10, borderLeft: `2px solid ${T.success}40` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>Propozycja od korepetytora</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 8 }}>📅 {item.proposedDate}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button className="btn-success" style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: T.success, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✓ Akceptuj termin</button>
                        <button className="btn-ghost" style={{ padding: "6px 16px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, background: T.surface, color: T.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Zaproponuj inny</button>
                        <button className="btn-danger" style={{ padding: "6px 16px", borderRadius: 8, border: `1px solid ${T.danger}30`, background: "transparent", color: T.danger, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Odrzuć</button>
                      </div>
                    </div>
                  )}

                  {/* Waiting for parent */}
                  {item.status === "waiting_for_parent" && !isR && (
                    <div style={{ background: T.orange + "0A", borderRadius: 10, padding: "10px 12px", marginTop: 10, borderLeft: `2px solid ${T.orange}40` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.orange, marginBottom: 4 }}>⏳ Czeka na Twoją propozycję terminu</div>
                      <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500, marginBottom: 8 }}>Wybierz wolny termin z dostępnych u korepetytora. Pozostało {item.daysLeft} dni.</div>
                      <button onClick={() => setRespondingTo(item.id)} className="btn-primary" style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: T.primary, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>📅 Wybierz termin</button>
                    </div>
                  )}

                  {/* Slot picker */}
                  {item.status === "waiting_for_parent" && isR && (
                    <div style={{ background: T.primary + "0A", borderRadius: 10, padding: "12px 14px", marginTop: 10, borderLeft: `2px solid ${T.primary}40` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: .5 }}>Dostępne terminy u {item.tutor}</div>
                      {item.proposedSlots.map((slot, si) => (
                        <div key={si} onClick={() => setSelectedSlot(si)} className="slot-hover" style={{
                          padding: "8px 12px", borderRadius: 8, marginBottom: 4,
                          background: selectedSlot === si ? T.primary + "22" : T.bgAlt,
                          border: `1px solid ${selectedSlot === si ? T.primary + "50" : T.cardBorder}`,
                          fontSize: 12, fontWeight: selectedSlot === si ? 700 : 600,
                          color: selectedSlot === si ? T.primary : T.textMuted, cursor: "pointer",
                        }}>📅 {slot}</div>
                      ))}
                      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                        <button disabled={selectedSlot === null} className="btn-success" style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: selectedSlot != null ? T.success : T.surface, color: selectedSlot != null ? "#fff" : T.textDim, fontSize: 12, fontWeight: 700, cursor: selectedSlot != null ? "pointer" : "default", fontFamily: "inherit", opacity: selectedSlot != null ? 1 : .5 }}>Zaproponuj ten termin</button>
                        <button onClick={() => { setRespondingTo(null); setSelectedSlot(null); }} className="btn-ghost" style={{ padding: "6px 16px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.textDim, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Anuluj</button>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: item.daysLeft < 7 ? T.danger : T.textDim, background: (item.daysLeft < 7 ? T.danger : T.textDim) + "18", padding: "2px 8px", borderRadius: 5 }}>{item.daysLeft} dni</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Completed makeups */}
      {done.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .8, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            ✓ Odrobione
            <span style={{ fontSize: 10, fontWeight: 700, color: T.success, background: T.success + "18", padding: "2px 8px", borderRadius: 5 }}>{done.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {done.map(item => {
              const ch = childrenData.find(c => c.id === item.child);
              return (
                <Card key={item.id} style={{ padding: "10px 14px", opacity: 0.7 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: T.success + "18", color: T.success, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>✓</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        {childFilter === "all" && <span style={{ fontSize: 11, fontWeight: 700, color: ch.color }}>{ch.name.split(" ")[0]}</span>}
                        <SubjectDot subject={item.subject} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{item.subject}</span>
                        <LevelBadge level={item.level} />
                      </div>
                      <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>
                        Odwołana: {item.originalDate} → Odrobiona: <span style={{ color: T.success, fontWeight: 600 }}>{item.completedDate}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ MAIN ═══════════════ */

export default function ParentClasses() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeChild, setActiveChild] = useState("all");
  const [activeTab, setActiveTab] = useState("schedule");

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: T.bg, fontFamily: "'Nunito', sans-serif", color: T.text, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.cardBorder}; border-radius: 50px; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        .card-hover { transition: all .18s ease !important; }
        .card-hover:hover { transform: translateY(-2px); border-color: rgba(59,143,240,0.22) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.18); }
        .card-click { transition: all .18s ease !important; cursor: pointer !important; }
        .card-click:hover { transform: translateY(-2px); border-color: rgba(59,143,240,0.22) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.18); background: ${T.surfaceHover} !important; }
        .card-click:active { transform: translateY(0); }
        .btn-primary { transition: all .15s ease !important; }
        .btn-primary:hover { filter: brightness(1.15); transform: scale(1.03); box-shadow: 0 2px 10px rgba(59,143,240,0.3); }
        .btn-primary:active { transform: scale(0.98); }
        .btn-danger { transition: all .15s ease !important; }
        .btn-danger:hover { filter: brightness(1.15); transform: scale(1.03); box-shadow: 0 2px 10px rgba(239,68,68,0.3); }
        .btn-danger:active { transform: scale(0.98); }
        .btn-ghost { transition: all .15s ease !important; }
        .btn-ghost:hover { background: ${T.surfaceHover} !important; transform: scale(1.02); }
        .btn-ghost:active { transform: scale(0.98); }
        .btn-cancel { transition: all .15s ease !important; }
        .btn-cancel:hover { filter: brightness(1.1); transform: scale(1.05); }
        .btn-cancel:active { transform: scale(0.97); }
        .btn-success { transition: all .15s ease !important; }
        .btn-success:hover { filter: brightness(1.15); transform: scale(1.03); box-shadow: 0 2px 10px rgba(34,197,94,0.3); }
        .btn-success:active { transform: scale(0.98); }
        .nav-item { transition: all .15s ease !important; }
        .nav-item:hover { background: rgba(59,143,240,0.08) !important; }
        .tab-hover { transition: all .15s ease !important; }
        .tab-hover:hover { background: rgba(59,143,240,0.10) !important; }
        .slot-hover { transition: all .15s ease !important; }
        .slot-hover:hover { border-color: rgba(59,143,240,0.40) !important; background: rgba(59,143,240,0.08) !important; }
        .icon-btn { transition: all .15s ease !important; }
        .icon-btn:hover { background: ${T.surface} !important; transform: scale(1.08); }
        .icon-btn:active { transform: scale(0.95); }
        .entry-expand { transition: all .18s ease !important; }
        .entry-expand:hover { border-color: rgba(59,143,240,0.18) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.12); }
      `}</style>

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar />
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
            <ChildSwitcher active={activeChild} onChange={setActiveChild} />
          </div>
          <SubTabs active={activeTab} onChange={setActiveTab} />

          <div style={{ maxWidth: 900 }}>
            {activeTab === "schedule" && <ScheduleTab childFilter={activeChild} />}
            {activeTab === "history" && <HistoryTab childFilter={activeChild} />}
            {activeTab === "makeup" && <MakeupTab childFilter={activeChild} />}
          </div>
        </div>
      </div>
    </div>
  );
}
