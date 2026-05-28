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
const levelColors = { SP: "#06B6D4", "ŚR": "#3B8FF0", "ŚR★": "#7C5CFC", EM: "#EF4444" };

const student = { name: "Kacper Nowak", initials: "KN", color: "#3B8FF0", cls: "2 LO", level: "ŚR★" };

/* ─── DATA ─── */
const scheduleData = [
  { day: "Poniedziałek", dayShort: "Pon", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", type: "indyw." },
  { day: "Środa", dayShort: "Śr", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", type: "indyw." },
  { day: "Sobota", dayShort: "Sob", time: "9:00–10:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", type: "indyw." },
];

const scheduleExceptions = [
  { date: "Pon 12.05", type: "odwołana", subject: "Matematyka", reason: "Odwołana przez rodzica (>24h)", result: "Do odrobienia" },
  { date: "Sob 03.05", type: "zmiana sali", subject: "Matematyka", reason: "Remont Sali 1", result: "Sala 2" },
];

const statusIcons = {
  completed: { symbol: "✓", color: T.success, label: "Zrealizowana" },
  completed_no_entry: { symbol: "✓", color: T.tertiary, label: "Bez wpisu" },
  planned: { symbol: "○", color: T.primary, label: "Zaplanowana" },
  cancelled: { symbol: "✕", color: T.danger, label: "Odwołana" },
  no_show: { symbol: "⊘", color: T.orange, label: "No-show" },
  cancel_requested: { symbol: "⏳", color: T.orange, label: "Czeka na rodzica" },
};

const historyData = [
  { id: 101, date: "Czw 22.05", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", status: "planned", under24h: true, entry: null },
  { id: 102, date: "Pt 23.05", time: "10:00–11:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", status: "planned", under24h: false, entry: null },
  { id: 1, date: "Wt 20.05", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", status: "completed",
    entry: { topic: "Ciągi geometryczne — obliczanie sumy", note: "Pamiętaj o wzorze na sumę n wyrazów!", homework: "Zad. 5.1–5.10 str. 94", hwDone: null }},
  { id: 2, date: "Sob 17.05", time: "9:00–10:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", status: "completed",
    entry: { topic: "Ciągi arytmetyczne — wzory i zadania", note: "Powtórz wzór na n-ty wyraz.", homework: "Zad. 4.1–4.8 str. 87", hwDone: "checked" }},
  { id: 3, date: "Śr 14.05", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", status: "completed",
    entry: { topic: "Ciąg Fibonacciego i zastosowania", note: "Spróbuj wypisać 15 pierwszych wyrazów ciągu.", homework: "Zad. 3.5–3.12 str. 78", hwDone: "checked" }},
  { id: 4, date: "Pon 12.05", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", status: "cancelled", cancelReason: "Odwołana przez rodzica (>24h)", entry: null },
  { id: 5, date: "Sob 10.05", time: "9:00–10:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", status: "no_show", entry: null },
  { id: 6, date: "Śr 07.05", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", status: "completed",
    entry: { topic: "Indukcja matematyczna — zasada i dowody", note: "Schemat dowodu: krok bazowy + krok indukcyjny.", homework: "Zad. 2.15–2.20 str. 63", hwDone: null }},
];

const makeupData = [
  { id: 1, subject: "Matematyka", tutor: "Tomasz Kowalski", level: "ŚR★", originalDate: "Pon 12.05", reason: "Odwołana przez rodzica (>24h)", status: "proposed", proposedDate: "Śr 28.05, 18:15–19:15", deadline: "11.06.2026", daysLeft: 20 },
  { id: 2, subject: "Matematyka", tutor: "Tomasz Kowalski", level: "ŚR★", originalDate: "Śr 16.04", reason: "Odwołana przez centrum", status: "completed", completedDate: "Sob 26.04, 10:00–11:00", daysLeft: null },
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

/* ═══════════════ SIDEBAR ═══════════════ */

function Sidebar({ collapsed, onToggle }) {
  const items = [
    { icon: "📊", label: "Dashboard", active: false },
    { icon: "📚", label: "Zajęcia", active: true },
    { icon: "👤", label: "Profil", active: false },
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

/* ═══════════════ SUB-TABS ═══════════════ */

function SubTabs({ active, onChange }) {
  const tabs = [
    { id: "schedule", label: "Harmonogram", icon: "📋" },
    { id: "history", label: "Historia lekcji", icon: "📖" },
    { id: "makeup", label: "Odrabianie", icon: "↻", count: makeupData.filter(m => m.status !== "completed").length },
  ];
  return (
    <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${T.cardBorder}`, marginBottom: 0 }}>
      {tabs.map(tab => {
        const on = active === tab.id;
        return (
          <div key={tab.id} onClick={() => onChange(tab.id)} className="tab-hover" style={{
            padding: "10px 20px", cursor: "pointer", borderBottom: `2px solid ${on ? T.primary : "transparent"}`,
            display: "flex", alignItems: "center", gap: 6, marginBottom: -1,
          }}>
            <span style={{ fontSize: 14 }}>{tab.icon}</span>
            <span style={{ fontSize: 13, fontWeight: on ? 800 : 600, color: on ? T.primary : T.textMuted }}>{tab.label}</span>
            {tab.count > 0 && <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: T.orange, borderRadius: 8, padding: "1px 6px" }}>{tab.count}</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════ TAB: SCHEDULE ═══════════════ */

function ScheduleTab() {
  const [excOpen, setExcOpen] = useState(false);
  return (
    <div style={{ paddingTop: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .8, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        📋 Regularne zajęcia wg umowy
        <span style={{ fontSize: 11, fontWeight: 700, color: T.primary, background: T.primary + "15", padding: "2px 10px", borderRadius: 6 }}>{scheduleData.length}×/tydz</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {scheduleData.map((lesson, i) => {
          const sC = subjectColors[lesson.subject] || T.textDim;
          return (
            <Card key={i} style={{ padding: "12px 14px", borderLeft: `3px solid ${sC}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, borderRadius: 8, background: T.primary + "12", padding: "6px 0", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.primary }}>{lesson.dayShort}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <SubjectDot subject={lesson.subject} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{lesson.subject}</span>
                    <LevelBadge level={lesson.level} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: T.textDim, fontWeight: 600 }}>
                    <span style={{ fontWeight: 700, color: T.textMuted }}>🕐 {lesson.time}</span>
                    <span>👤 {lesson.tutor}</span>
                    <span>📍 {lesson.room}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {scheduleExceptions.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div onClick={() => setExcOpen(!excOpen)} className="tab-hover" style={{
            fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .8,
            display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 0",
          }}>
            ⚠ Wyjątki i zmiany
            <span style={{ fontSize: 10, fontWeight: 700, color: T.orange, background: T.orange + "18", padding: "2px 8px", borderRadius: 5 }}>{scheduleExceptions.length}</span>
            <span style={{ fontSize: 11, color: T.textDim, transform: excOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", display: "inline-block", marginLeft: "auto" }}>▼</span>
          </div>
          {excOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {scheduleExceptions.map((exc, i) => {
                const tc = exc.type === "odwołana" ? T.danger : T.orange;
                return (
                  <Card key={i} style={{ padding: "10px 14px", borderLeft: `3px solid ${tc}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{exc.date}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, color: tc, background: tc + "18", padding: "1px 6px", borderRadius: 4, textTransform: "uppercase" }}>{exc.type}</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>{exc.reason} → <span style={{ color: T.textMuted, fontWeight: 600 }}>{exc.result}</span></div>
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

/* ═══════════════ TAB: HISTORY ═══════════════ */

function HistoryTab() {
  const [expanded, setExpanded] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [requestedIds, setRequestedIds] = useState([]);

  const statuses = [
    { id: "all", label: "Wszystkie" },
    { id: "completed", label: "Zrealizowane" },
    { id: "planned", label: "Zaplanowane" },
    { id: "cancelled", label: "Odwołane" },
  ];

  const filtered = historyData.filter(h => {
    const realStatus = requestedIds.includes(h.id) ? "cancel_requested" : h.status;
    if (statusFilter === "all") return true;
    if (statusFilter === "completed") return realStatus === "completed" || realStatus === "completed_no_entry";
    return realStatus === statusFilter;
  });

  const doCancel = (id) => { setRequestedIds(p => [...p, id]); setCancelConfirm(null); };

  return (
    <div style={{ paddingTop: 16 }}>
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

      {filtered.length === 0 && <Card style={{ textAlign: "center", padding: 24 }}><span style={{ color: T.textDim, fontSize: 13 }}>Brak lekcji</span></Card>}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map(lesson => {
          const realStatus = requestedIds.includes(lesson.id) ? "cancel_requested" : lesson.status;
          const si = statusIcons[realStatus] || statusIcons[lesson.status];
          const isOpen = expanded === lesson.id;

          return (
            <Card key={lesson.id} onClick={() => lesson.entry ? setExpanded(isOpen ? null : lesson.id) : null} className={lesson.entry ? "entry-expand" : "card-hover"} style={{
              padding: 0, cursor: lesson.entry ? "pointer" : "default",
              border: isOpen ? `1px solid ${T.primary}30` : `1px solid ${T.cardBorder}`,
              opacity: realStatus === "cancelled" || realStatus === "no_show" ? 0.7 : 1,
            }}>
              <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: si.color + "18", color: si.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{si.symbol}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{lesson.date}</span>
                    <span style={{ fontSize: 11, color: T.textDim, fontWeight: 600 }}>{lesson.time}</span>
                    <SubjectDot subject={lesson.subject} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted }}>{lesson.subject}</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>
                    {lesson.tutor} • {lesson.room}
                    {lesson.cancelReason && <span style={{ color: T.danger, marginLeft: 6 }}>— {lesson.cancelReason}</span>}
                    {realStatus === "no_show" && <span style={{ color: T.orange, marginLeft: 6 }}>— Nieobecność</span>}
                    {realStatus === "cancel_requested" && <span style={{ color: T.orange, marginLeft: 6 }}>— Czeka na rodzica</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {lesson.entry?.homework && <span style={{ fontSize: 9, fontWeight: 700, color: T.tertiary, background: T.tertiary + "18", padding: "2px 6px", borderRadius: 4 }}>📝 PD</span>}
                  {lesson.entry?.hwDone === "checked" && <span style={{ fontSize: 9, fontWeight: 700, color: T.success, background: T.success + "18", padding: "2px 6px", borderRadius: 4 }}>✓</span>}
                  {realStatus === "planned" && (
                    <button onClick={(e) => { e.stopPropagation(); setCancelConfirm(lesson.id); }} className="btn-cancel" style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${T.orange}30`, background: T.orange + "10", color: T.orange, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Odwołaj</button>
                  )}
                  {lesson.entry && <span style={{ fontSize: 11, color: T.textDim, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", display: "inline-block" }}>▼</span>}
                </div>

                {cancelConfirm === lesson.id && (
                  <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: "rgba(21,24,39,.92)", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 16 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Poprosić o odwołanie?</span>
                    <span style={{ fontSize: 11, color: T.orange, fontWeight: 600, background: T.orange + "15", padding: "3px 10px", borderRadius: 6 }}>⚠ Prośba trafi do rodzica</span>
                    {lesson.under24h ? <span style={{ fontSize: 10, color: T.danger }}>Mniej niż 24h — przepadnie</span> : <span style={{ fontSize: 10, color: T.success }}>Ponad 24h — do odrobienia</span>}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={(e) => { e.stopPropagation(); setCancelConfirm(null); }} className="btn-ghost" style={{ padding: "5px 14px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, background: T.surface, color: T.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Nie</button>
                      <button onClick={(e) => { e.stopPropagation(); doCancel(lesson.id); }} className="btn-primary" style={{ padding: "5px 14px", borderRadius: 8, border: "none", background: T.orange, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Wyślij prośbę</button>
                    </div>
                  </div>
                )}
              </div>

              {isOpen && lesson.entry && (
                <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${T.cardBorder}` }}>
                  <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{lesson.entry.topic}</div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>Notatka od korepetytora</div>
                      <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5, fontWeight: 500, background: T.bgAlt, padding: "8px 10px", borderRadius: 8, borderLeft: `2px solid ${T.primary}40` }}>{lesson.entry.note}</div>
                    </div>
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

/* ═══════════════ TAB: MAKEUP ═══════════════ */

function MakeupTab() {
  const pending = makeupData.filter(m => m.status !== "completed");
  const done = makeupData.filter(m => m.status === "completed");

  return (
    <div style={{ paddingTop: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .8, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        ⏳ Oczekujące
        {pending.length > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: T.orange, background: T.orange + "18", padding: "2px 8px", borderRadius: 5 }}>{pending.length}</span>}
      </div>

      {pending.length === 0 && <Card style={{ textAlign: "center", padding: 20 }}><span style={{ color: T.textDim, fontSize: 13 }}>Brak oczekujących odrabiań</span></Card>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {pending.map(item => (
          <Card key={item.id} style={{ borderLeft: `3px solid ${T.accent}`, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: T.accent + "22", color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>↻</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <SubjectDot subject={item.subject} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{item.subject}</span>
                  <LevelBadge level={item.level} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: T.accent, background: T.accent + "18", padding: "1px 6px", borderRadius: 4 }}>ODR</span>
                </div>
                <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500, marginBottom: 6 }}>Odwołana: {item.originalDate} • {item.reason}</div>
                <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>Termin: do <span style={{ color: T.textMuted, fontWeight: 700 }}>{item.deadline}</span></div>

                <div style={{ background: T.success + "0A", borderRadius: 10, padding: "10px 12px", marginTop: 10, borderLeft: `2px solid ${T.success}40` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>Proponowany termin</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>📅 {item.proposedDate}</div>
                  <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500, marginTop: 4 }}>Rodzic musi zaakceptować termin</div>
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, background: T.textDim + "18", padding: "2px 8px", borderRadius: 5 }}>{item.daysLeft} dni</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {done.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .8, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            ✓ Odrobione <span style={{ fontSize: 10, fontWeight: 700, color: T.success, background: T.success + "18", padding: "2px 8px", borderRadius: 5 }}>{done.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {done.map(item => (
              <Card key={item.id} style={{ padding: "10px 14px", opacity: 0.7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: T.success + "18", color: T.success, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>✓</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <SubjectDot subject={item.subject} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{item.subject}</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>Odwołana: {item.originalDate} → Odrobiona: <span style={{ color: T.success, fontWeight: 600 }}>{item.completedDate}</span></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ MAIN ═══════════════ */

export default function StudentClasses() {
  const [collapsed, setCollapsed] = useState(false);
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
        .entry-expand { transition: all .18s ease !important; cursor: pointer !important; }
        .entry-expand:hover { border-color: rgba(59,143,240,0.18) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.12); }
        .nav-item { transition: all .15s ease !important; }
        .nav-item:hover { background: rgba(59,143,240,0.08) !important; }
        .tab-hover { transition: all .15s ease !important; }
        .tab-hover:hover { background: rgba(59,143,240,0.10) !important; }
        .icon-btn { transition: all .15s ease !important; }
        .icon-btn:hover { background: ${T.surface} !important; transform: scale(1.08); }
        .btn-primary { transition: all .15s ease !important; }
        .btn-primary:hover { filter: brightness(1.15); transform: scale(1.03); }
        .btn-ghost { transition: all .15s ease !important; }
        .btn-ghost:hover { background: ${T.surfaceHover} !important; }
        .btn-cancel { transition: all .15s ease !important; }
        .btn-cancel:hover { filter: brightness(1.1); transform: scale(1.05); }
      `}</style>

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar />
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px 40px" }}>
          <SubTabs active={activeTab} onChange={setActiveTab} />
          <div style={{ maxWidth: 900 }}>
            {activeTab === "schedule" && <ScheduleTab />}
            {activeTab === "history" && <HistoryTab />}
            {activeTab === "makeup" && <MakeupTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
