import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", primaryDark: "#2D7DE8", secondary: "#FF6F4A",
  tertiary: "#FFCA28", accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4",
  danger: "#EF4444", pink: "#E84393", orange: "#F59E0B",
  cardBorder: "rgba(59,143,240,0.10)",
};

const subjectColors = { Matematyka: "#3B8FF0", Angielski: "#06B6D4", Fizyka: "#F59E0B", Chemia: "#22C55E", Polski: "#E84393" };
const levelColors = { SP: "#06B6D4", E8: "#FFCA28", "ŚR": "#3B8FF0", "ŚR★": "#7C5CFC", EM: "#EF4444", "EM★": "#E84393" };

const childrenData = [
  { id: "kacper", name: "Kacper Nowak", initials: "KN", color: "#3B8FF0", cls: "2 LO", level: "ŚR★", lessonsPerWeek: "3 lek/tydz", freq: "95%" },
  { id: "ola", name: "Ola Nowak", initials: "ON", color: "#E84393", cls: "kl. 7", level: "SP", lessonsPerWeek: "2 lek/tydz + grupa", freq: "100%" },
];

const upcomingLessons = [
  { id: 1, child: "kacper", date: "Dziś", day: "Czwartek 22.05", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", type: "indyw.", level: "ŚR★", status: "next", under24h: true },
  { id: 2, child: "ola", date: "Dziś", day: "Czwartek 22.05", time: "15:15–16:15", subject: "Angielski", tutor: "Maria Zielińska", room: "Sala 2", type: "indyw.", level: "SP", status: "planned", under24h: true },
  { id: 3, child: "kacper", date: "Jutro", day: "Piątek 23.05", time: "10:00–11:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", type: "indyw.", level: "ŚR★", status: "planned", under24h: false },
  { id: 4, child: "ola", date: "Sob 24.05", day: "Sobota 24.05", time: "10:00–11:00", subject: "Angielski", tutor: "Maria Zielińska", room: "Sala 3", type: "grupa", level: "SP", status: "planned", under24h: false },
  { id: 5, child: "kacper", date: "Sob 24.05", day: "Sobota 24.05", time: "9:00–10:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", type: "indyw.", level: "ŚR★", status: "planned", under24h: false },
  { id: 6, child: "kacper", date: "Pon 26.05", day: "Poniedziałek 26.05", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", type: "indyw.", level: "ŚR★", status: "planned", under24h: false },
  { id: 7, child: "ola", date: "Pon 26.05", day: "Poniedziałek 26.05", time: "15:15–16:15", subject: "Angielski", tutor: "Maria Zielińska", room: "Sala 2", type: "indyw.", level: "SP", status: "planned", under24h: false },
];

const recentEntries = [
  { id: 1, child: "kacper", date: "Wt 20.05", subject: "Matematyka", tutor: "Tomasz Kowalski", level: "ŚR★", topic: "Ciągi geometryczne — obliczanie sumy", noteForParent: "Kacper robi duże postępy. Opanował wzory na sumę ciągu, ćwiczymy zastosowania.", noteForStudent: "Pamiętaj o wzorze na sumę n wyrazów!", homework: "Zad. 5.1–5.10 str. 94", hwDone: null },
  { id: 2, child: "ola", date: "Wt 20.05", subject: "Angielski", tutor: "Maria Zielińska", level: "SP", topic: "Present Perfect — ćwiczenia z 'since' i 'for'", noteForParent: "Ola bardzo dobrze radzi sobie z czasami. Proszę zachęcić do czytania po angielsku.", noteForStudent: "Great job today! Remember: 'since' = punkt w czasie, 'for' = okres.", homework: "Ćwiczenie 3A–3D str. 45", hwDone: null },
  { id: 3, child: "kacper", date: "Sob 17.05", subject: "Matematyka", tutor: "Tomasz Kowalski", level: "ŚR★", topic: "Ciągi arytmetyczne — wzory i zadania", noteForParent: null, noteForStudent: "Powtórz wzór na n-ty wyraz ciągu arytmetycznego.", homework: "Zad. 4.1–4.8 str. 87", hwDone: "checked" },
  { id: 4, child: "ola", date: "Czw 15.05", subject: "Angielski", tutor: "Maria Zielińska", level: "SP", topic: "Past Simple vs Present Perfect — różnice", noteForParent: "Ola miała drobne trudności z rozróżnianiem czasów, ale po ćwiczeniach jest dużo lepiej.", noteForStudent: "Focus on signal words: 'yesterday' = Past Simple, 'already' = Present Perfect.", homework: null, hwDone: null },
];

const paymentData = {
  month: "Maj 2026", status: "oczekuje", total: 1680, delayNumber: 1,
  breakdown: [
    { child: "kacper", items: [{ desc: "Matematyka — indyw. (ŚR★)", amount: 1080 }] },
    { child: "ola", items: [{ desc: "Angielski — indyw. (SP)", amount: 420 }, { desc: "Angielski — grupa (SP)", amount: 180 }] },
  ],
  history: [
    { month: "Kwiecień 2026", status: "opłacone", date: "08.04", amount: 1680 },
    { month: "Marzec 2026", status: "opłacone", date: "10.03", amount: 1680 },
    { month: "Luty 2026", status: "opłacone", date: "07.02", amount: 1680 },
  ],
};

const makeupItems = [
  { id: 1, child: "ola", subject: "Angielski", tutor: "Maria Zielińska", originalDate: "Czw 08.05", reason: "Choroba (>24h)", status: "waiting_for_parent", proposedSlots: ["Pon 26.05, 16:30", "Śr 28.05, 16:30", "Sob 31.05, 11:00"], deadline: "07.06.2026", daysLeft: 16 },
  { id: 2, child: "kacper", subject: "Matematyka", tutor: "Tomasz Kowalski", originalDate: "Pon 12.05", reason: "Odwołana przez rodzica (>24h)", status: "proposed", proposedDate: "Śr 28.05, 18:15–19:15", deadline: "11.06.2026", daysLeft: 20 },
];

/* ═══════════════════════════ SHARED UI ═══════════════════════════ */

const Card = ({ children, style, onClick, className }) => (
  <div onClick={onClick} className={className || (onClick ? "card-click" : "card-hover")} style={{
    background: T.surface, borderRadius: 14, border: `1px solid ${T.cardBorder}`,
    padding: 16, cursor: onClick ? "pointer" : "default", ...style,
  }}>{children}</div>
);

const SectionTitle = ({ icon, title, count, badge, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{title}</span>
      {count != null && <span style={{ fontSize: 11, fontWeight: 700, color: T.textDim, background: T.surface, padding: "2px 8px", borderRadius: 6 }}>{count}</span>}
      {badge && <span style={{ fontSize: 10, fontWeight: 800, color: badge.color, background: badge.color + "22", padding: "2px 8px", borderRadius: 6 }}>{badge.text}</span>}
    </div>
    {right}
  </div>
);

const LevelBadge = ({ level }) => {
  const c = levelColors[level] || T.textDim;
  return <span style={{ fontSize: 10, fontWeight: 800, color: c, background: c + "18", padding: "2px 7px", borderRadius: 5 }}>{level}</span>;
};

const SubjectDot = ({ subject }) => (
  <span style={{ width: 8, height: 8, borderRadius: "50%", background: subjectColors[subject] || T.textDim, display: "inline-block", flexShrink: 0 }} />
);

/* ═══════════════════════════ SIDEBAR ═══════════════════════════ */

function Sidebar({ collapsed, onToggle }) {
  const items = [
    { icon: "📊", label: "Dashboard", active: true, badge: null },
    { icon: "📚", label: "Zajęcia", active: false, badge: null },
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

/* ═══════════════════════════ TOPBAR ═══════════════════════════ */

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

/* ═══════════════════════════ CHILD SWITCHER ═══════════════════════════ */

function ChildSwitcher({ active, onChange }) {
  const tabs = [
    { id: "all", label: "Wszystkie", icon: "👨‍👩‍👧‍👦", color: T.primary, initials: null },
    ...childrenData.map(c => ({ id: c.id, label: c.name.split(" ")[0], icon: null, color: c.color, initials: c.initials })),
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, background: T.bgAlt, borderRadius: 12, padding: 4, border: `1px solid ${T.cardBorder}`, marginBottom: 20, width: "fit-content" }}>
      {tabs.map(tab => {
        const on = active === tab.id;
        return (
          <div key={tab.id} onClick={() => onChange(tab.id)} className="tab-hover" style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, background: on ? tab.color + "18" : "transparent", cursor: "pointer" }}>
            {tab.icon
              ? <span style={{ fontSize: 14 }}>{tab.icon}</span>
              : <div style={{ width: 22, height: 22, borderRadius: 6, background: (on ? tab.color : T.textDim) + "22", color: on ? tab.color : T.textDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800 }}>{tab.initials}</div>
            }
            <span style={{ fontSize: 13, fontWeight: on ? 800 : 600, color: on ? tab.color : T.textMuted }}>{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════ UPCOMING LESSONS ═══════════════════════════ */

function UpcomingLessons({ childFilter }) {
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [cancelledIds, setCancelledIds] = useState([]);

  const filtered = upcomingLessons.filter(l => !cancelledIds.includes(l.id) && (childFilter === "all" || l.child === childFilter));

  const groups = [];
  const seen = new Set();
  filtered.forEach(l => {
    if (!seen.has(l.date)) { seen.add(l.date); groups.push({ label: l.date, day: l.day, lessons: [] }); }
    groups.find(g => g.label === l.date).lessons.push(l);
  });

  const doCancel = (id) => { setCancelledIds(p => [...p, id]); setCancelConfirm(null); };

  return (
    <div>
      <SectionTitle icon="📅" title="Nadchodzące lekcje" count={filtered.length} right={<span className="link-hover" style={{ fontSize: 12, color: T.primary, fontWeight: 700, cursor: "pointer" }}>Zajęcia →</span>} />

      {filtered.length === 0 && <Card style={{ padding: "20px 16px", textAlign: "center" }}><span style={{ fontSize: 13, color: T.textDim, fontWeight: 600 }}>Brak nadchodzących lekcji</span></Card>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {groups.map((group, gi) => (
          <div key={gi}>
            <div style={{ fontSize: 11, fontWeight: 700, color: group.label === "Dziś" ? T.primary : T.textDim, marginBottom: 6, display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: .8 }}>
              {group.label === "Dziś" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.success, animation: "pulse 2s infinite" }} />}
              {group.day}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {group.lessons.map(lesson => {
                const ch = childrenData.find(c => c.id === lesson.child);
                const sC = subjectColors[lesson.subject] || T.textDim;
                const isNext = lesson.status === "next";
                return (
                  <Card key={lesson.id} style={{ padding: "12px 14px", borderLeft: `3px solid ${sC}`, background: isNext ? T.primary + "08" : T.surface, position: "relative" }}>
                    {isNext && <span style={{ position: "absolute", top: 8, right: 10, fontSize: 9, fontWeight: 800, color: T.success, background: T.success + "18", padding: "2px 8px", borderRadius: 5, animation: "pulse 2s infinite" }}>NASTĘPNA</span>}

                    {cancelConfirm === lesson.id && (
                      <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: "rgba(21,24,39,.92)", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 16 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text, textAlign: "center" }}>Odwołać lekcję {lesson.subject} ({lesson.time})?</span>
                        {lesson.under24h ? (
                          <span style={{ fontSize: 11, color: T.danger, fontWeight: 600, textAlign: "center", background: T.danger + "15", padding: "4px 10px", borderRadius: 6 }}>⚠ Mniej niż 24h do lekcji — lekcja przepadnie bez możliwości odrobienia</span>
                        ) : (
                          <span style={{ fontSize: 11, color: T.success, fontWeight: 600, textAlign: "center" }}>Ponad 24h do lekcji — będzie można ją odrobić w innym terminie</span>
                        )}
                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                          <button onClick={() => setCancelConfirm(null)} className="btn-ghost" style={{ padding: "6px 16px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, background: T.surface, color: T.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Nie</button>
                          <button onClick={() => doCancel(lesson.id)} className="btn-danger" style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: T.danger, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{lesson.under24h ? "Odwołaj (przepadnie)" : "Tak, odwołaj"}</button>
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: ch.color + "22", color: ch.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{ch.initials}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{ch.name.split(" ")[0]}</span>
                          <SubjectDot subject={lesson.subject} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted }}>{lesson.subject}</span>
                          <LevelBadge level={lesson.level} />
                          {lesson.type === "grupa" && <span style={{ fontSize: 9, fontWeight: 700, color: T.accent, background: T.accent + "18", padding: "1px 6px", borderRadius: 4 }}>GRUPA</span>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: T.textDim, fontWeight: 600 }}>
                          <span style={{ color: isNext ? T.primary : T.textMuted, fontWeight: 700 }}>🕐 {lesson.time}</span>
                          <span>👤 {lesson.tutor}</span>
                          <span>📍 {lesson.room}</span>
                        </div>
                      </div>
                      {lesson.status !== "in_progress" && (
                        <button onClick={(e) => { e.stopPropagation(); setCancelConfirm(lesson.id); }} className="btn-cancel" style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${lesson.under24h ? T.orange : T.danger}30`, background: (lesson.under24h ? T.orange : T.danger) + "10", color: lesson.under24h ? T.orange : T.danger, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Odwołaj</button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════ RECENT ENTRIES ═══════════════════════════ */

function RecentEntries({ childFilter }) {
  const [expanded, setExpanded] = useState(null);
  const filtered = recentEntries.filter(e => childFilter === "all" || e.child === childFilter);

  return (
    <div>
      <SectionTitle icon="📝" title="Ostatnie wpisy" count={filtered.length} right={<span className="link-hover" style={{ fontSize: 12, color: T.primary, fontWeight: 700, cursor: "pointer" }}>Wszystkie →</span>} />

      {filtered.length === 0 && <Card style={{ padding: "20px 16px", textAlign: "center" }}><span style={{ fontSize: 13, color: T.textDim, fontWeight: 600 }}>Brak wpisów</span></Card>}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map(entry => {
          const ch = childrenData.find(c => c.id === entry.child);
          const sC = subjectColors[entry.subject] || T.textDim;
          const isOpen = expanded === entry.id;
          return (
            <Card key={entry.id} onClick={() => setExpanded(isOpen ? null : entry.id)} className="entry-expand" style={{ padding: 0, cursor: "pointer", border: isOpen ? `1px solid ${sC}30` : `1px solid ${T.cardBorder}` }}>
              <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: ch.color + "22", color: ch.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{ch.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 2 }}>{entry.topic}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: T.textDim, fontWeight: 600 }}>
                    <span>{entry.date}</span><SubjectDot subject={entry.subject} /><span>{entry.subject}</span><span>• {entry.tutor}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {entry.homework && <span style={{ fontSize: 9, fontWeight: 700, color: T.tertiary, background: T.tertiary + "18", padding: "2px 6px", borderRadius: 4 }}>📝 PD</span>}
                  {entry.hwDone === "checked" && <span style={{ fontSize: 9, fontWeight: 700, color: T.success, background: T.success + "18", padding: "2px 6px", borderRadius: 4 }}>✓ Spr.</span>}
                  <span style={{ fontSize: 11, color: T.textDim, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", display: "inline-block" }}>▼</span>
                </div>
              </div>
              {isOpen && (
                <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${T.cardBorder}` }}>
                  <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.success, background: T.success + "18", padding: "2px 8px", borderRadius: 5 }}>✓ Obecny/a</span>
                      <LevelBadge level={entry.level} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>Notatka dla ucznia</div>
                      <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5, fontWeight: 500, background: T.bgAlt, padding: "8px 10px", borderRadius: 8, borderLeft: `2px solid ${T.primary}40` }}>{entry.noteForStudent}</div>
                    </div>
                    {entry.noteForParent && <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>Uwaga dla rodzica</div>
                      <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5, fontWeight: 500, background: T.accent + "0A", padding: "8px 10px", borderRadius: 8, borderLeft: `2px solid ${T.accent}40` }}>{entry.noteForParent}</div>
                    </div>}
                    {entry.homework && <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>Praca domowa</div>
                      <div style={{ fontSize: 12, color: T.tertiary, lineHeight: 1.5, fontWeight: 600, background: T.tertiary + "0A", padding: "8px 10px", borderRadius: 8, borderLeft: `2px solid ${T.tertiary}40`, display: "flex", alignItems: "center", gap: 6 }}>
                        📝 {entry.homework}
                        {entry.hwDone === "checked" && <span style={{ fontSize: 10, fontWeight: 700, color: T.success, background: T.success + "18", padding: "2px 6px", borderRadius: 4, marginLeft: "auto" }}>✓ Sprawdzona</span>}
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

/* ═══════════════════════════ PAYMENT STATUS ═══════════════════════════ */

function PaymentStatus({ childFilter }) {
  const fb = childFilter === "all" ? paymentData.breakdown : paymentData.breakdown.filter(b => b.child === childFilter);
  const ft = fb.reduce((s, b) => s + b.items.reduce((a, i) => a + i.amount, 0), 0);
  const cfg = { opłacone: { color: T.success, label: "Opłacone", icon: "✓" }, oczekuje: { color: T.orange, label: "Oczekuje na wpłatę", icon: "⏳" }, zaległość: { color: T.danger, label: "Zaległość", icon: "⚠" } };
  const s = cfg[paymentData.status];

  return (
    <div>
      <SectionTitle icon="💳" title="Płatności" badge={paymentData.status !== "opłacone" ? { text: s.label, color: s.color } : null} right={<span className="link-hover" style={{ fontSize: 12, color: T.primary, fontWeight: 700, cursor: "pointer" }}>Szczegóły →</span>} />
      <Card style={{ borderLeft: `3px solid ${s.color}`, background: s.color + "06" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textDim }}>{paymentData.month}{childFilter !== "all" && (" — " + (childrenData.find(c => c.id === childFilter) || {}).name)}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: T.text }}>{ft.toLocaleString("pl-PL")}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.textDim }}>zł</span>
              {childFilter !== "all" && <span style={{ fontSize: 11, fontWeight: 600, color: T.textDim }}>z {paymentData.total.toLocaleString("pl-PL")} zł</span>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: s.color, background: s.color + "18", padding: "4px 10px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>{s.icon} {s.label}</div>
            {paymentData.delayNumber > 0 && paymentData.status !== "opłacone" && <div style={{ fontSize: 10, color: T.danger, fontWeight: 700, marginTop: 4 }}>{paymentData.delayNumber}. opóźnienie</div>}
            <div style={{ fontSize: 10, color: T.textDim, fontWeight: 600, marginTop: 2 }}>Termin: do 10. dnia miesiąca</div>
          </div>
        </div>
        <div style={{ background: T.bgAlt, borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          {fb.map((b, i) => {
            const ch = childrenData.find(c => c.id === b.child);
            const sub = b.items.reduce((a, it) => a + it.amount, 0);
            return (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, background: ch.color + "22", color: ch.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800 }}>{ch.initials}</div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{ch.name.split(" ")[0]}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{sub} zł</span>
                </div>
                {b.items.map((it, j) => <div key={j} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textDim, fontWeight: 500, paddingLeft: 24, marginTop: 1 }}><span>{it.desc}</span><span>{it.amount} zł</span></div>)}
              </div>
            );
          })}
          {childFilter === "all" && <div style={{ borderTop: `1px solid ${T.cardBorder}`, paddingTop: 6, marginTop: 4, display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800, color: T.text }}><span>Łącznie</span><span>{ft.toLocaleString("pl-PL")} zł</span></div>}
        </div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: T.textDim }}>Ostatnie:</span>
          {paymentData.history.map((h, i) => <div key={i} title={h.month + ": " + h.status} style={{ width: 10, height: 10, borderRadius: "50%", background: h.status === "opłacone" ? T.success : T.danger }} />)}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════ MAKEUP OVERVIEW ═══════════════════════════ */

function MakeupOverview({ childFilter }) {
  const [respondingTo, setRespondingTo] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const filtered = makeupItems.filter(m => childFilter === "all" || m.child === childFilter);

  return (
    <div>
      <SectionTitle icon="↻" title="Odrabianie" count={filtered.length} badge={filtered.length > 0 ? { text: "Wymaga reakcji", color: T.orange } : null} right={<span className="link-hover" style={{ fontSize: 12, color: T.primary, fontWeight: 700, cursor: "pointer" }}>Zajęcia →</span>} />

      {filtered.length === 0 ? (
        <Card style={{ padding: "20px 16px", textAlign: "center" }}><span style={{ fontSize: 13, color: T.textDim, fontWeight: 600 }}>Brak odrabiań</span></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(item => {
            const ch = childrenData.find(c => c.id === item.child);
            const isR = respondingTo === item.id;
            return (
              <Card key={item.id} style={{ borderLeft: `3px solid ${T.accent}`, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: ch.color + "22", color: ch.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>{ch.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{ch.name.split(" ")[0]}</span>
                      <SubjectDot subject={item.subject} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted }}>{item.subject}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: T.accent, background: T.accent + "18", padding: "1px 6px", borderRadius: 4 }}>ODR</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500, marginBottom: 4 }}>Odwołana: {item.originalDate} • {item.reason}</div>

                    {item.status === "proposed" && (
                      <div style={{ background: T.success + "0A", borderRadius: 8, padding: "8px 10px", marginTop: 6, borderLeft: `2px solid ${T.success}40` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, marginBottom: 3, textTransform: "uppercase", letterSpacing: .5 }}>Propozycja od korepetytora</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>📅 {item.proposedDate}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                          <button className="btn-success" style={{ padding: "5px 14px", borderRadius: 7, border: "none", background: T.success, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✓ Akceptuj</button>
                          <button className="btn-ghost" style={{ padding: "5px 14px", borderRadius: 7, border: `1px solid ${T.cardBorder}`, background: T.surface, color: T.textMuted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Kontropropozycja</button>
                          <button className="btn-danger" style={{ padding: "5px 14px", borderRadius: 7, border: `1px solid ${T.danger}30`, background: "transparent", color: T.danger, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Odrzuć</button>
                        </div>
                      </div>
                    )}

                    {item.status === "waiting_for_parent" && !isR && (
                      <div style={{ background: T.orange + "0A", borderRadius: 8, padding: "8px 10px", marginTop: 6, borderLeft: `2px solid ${T.orange}40` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.orange, marginBottom: 4 }}>⏳ Czeka na Twoją propozycję terminu</div>
                        <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>Termin: do {item.deadline} ({item.daysLeft} dni)</div>
                        <button onClick={() => setRespondingTo(item.id)} className="btn-primary" style={{ marginTop: 8, padding: "5px 14px", borderRadius: 7, border: "none", background: T.primary, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>📅 Wybierz termin</button>
                      </div>
                    )}

                    {item.status === "waiting_for_parent" && isR && (
                      <div style={{ background: T.primary + "0A", borderRadius: 8, padding: "10px 12px", marginTop: 6, borderLeft: `2px solid ${T.primary}40` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, marginBottom: 6, textTransform: "uppercase", letterSpacing: .5 }}>Dostępne terminy u {item.tutor}</div>
                        {item.proposedSlots.map((slot, si) => (
                          <div key={si} onClick={() => setSelectedSlot(si)} className="slot-hover" style={{ padding: "7px 10px", borderRadius: 7, marginBottom: 4, background: selectedSlot === si ? T.primary + "22" : T.bgAlt, border: `1px solid ${selectedSlot === si ? T.primary + "50" : T.cardBorder}`, fontSize: 12, fontWeight: 600, color: selectedSlot === si ? T.primary : T.textMuted, cursor: "pointer" }}>
                            📅 {slot}
                          </div>
                        ))}
                        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                          <button disabled={selectedSlot === null} className="btn-success" style={{ padding: "5px 14px", borderRadius: 7, border: "none", background: selectedSlot != null ? T.success : T.surface, color: selectedSlot != null ? "#fff" : T.textDim, fontSize: 11, fontWeight: 700, cursor: selectedSlot != null ? "pointer" : "default", fontFamily: "inherit", opacity: selectedSlot != null ? 1 : .5 }}>Zaproponuj termin</button>
                          <button onClick={() => { setRespondingTo(null); setSelectedSlot(null); }} style={{ padding: "5px 14px", borderRadius: 7, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.textDim, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Anuluj</button>
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
      )}
    </div>
  );
}

/* ═══════════════════════════ QUICK INFO ═══════════════════════════ */

function QuickInfo({ activeChild }) {
  const shown = activeChild === "all" ? childrenData : childrenData.filter(c => c.id === activeChild);
  return (
    <Card style={{ background: T.bgAlt, padding: "12px 14px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: .5 }}>{activeChild === "all" ? "Twoje dzieci" : "Wybrane dziecko"}</div>
      {shown.map((ch, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i > 0 ? `1px solid ${T.cardBorder}` : "none" }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: ch.color + "22", color: ch.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>{ch.initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{ch.name}</div>
            <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600 }}>{ch.cls} • <span style={{ color: levelColors[ch.level] }}>{ch.level}</span></div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted }}>{ch.lessonsPerWeek}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.textDim }}>Frekw. {ch.freq}</div>
          </div>
        </div>
      ))}
    </Card>
  );
}

/* ═══════════════════════════ CONTACT ═══════════════════════════ */

const ContactInfo = () => (
  <Card style={{ background: T.bgAlt, padding: "12px 14px" }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: .5 }}>Kontakt z centrum</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>📞</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>+48 123 456 789</div>
          <div style={{ fontSize: 10, color: T.textDim, fontWeight: 600 }}>Pon–Sob 7:30–21:00, Ndz 9:00–14:00</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>✉️</span>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.primary }}>kontakt@eduluz.pl</div>
      </div>
    </div>
    <button className="btn-primary" style={{ marginTop: 10, width: "100%", padding: "8px 0", borderRadius: 8, border: `1px solid ${T.primary}30`, background: T.primary + "10", color: T.primary, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>💬 Wyślij wiadomość</button>
  </Card>
);

/* ═══════════════════════════ MAIN ═══════════════════════════ */

export default function ParentDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeChild, setActiveChild] = useState("all");

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
        .tab-hover:hover { background: rgba(59,143,240,0.10) !important; transform: scale(1.02); }
        
        .slot-hover { transition: all .15s ease !important; }
        .slot-hover:hover { border-color: rgba(59,143,240,0.40) !important; background: rgba(59,143,240,0.08) !important; }
        
        .link-hover { transition: all .15s ease !important; }
        .link-hover:hover { filter: brightness(1.2); text-decoration: underline; }
        
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
          <ChildSwitcher active={activeChild} onChange={setActiveChild} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, maxWidth: 1200 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <UpcomingLessons childFilter={activeChild} />
              <RecentEntries childFilter={activeChild} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <QuickInfo activeChild={activeChild} />
              <PaymentStatus childFilter={activeChild} />
              <MakeupOverview childFilter={activeChild} />
              <ContactInfo />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
