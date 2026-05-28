import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", primaryDark: "#2D7DE8", secondary: "#FF6F4A",
  tertiary: "#FFCA28", accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4",
  danger: "#EF4444", pink: "#E84393",
  cardBorder: "rgba(59,143,240,0.10)",
};

/* ═══ DANE MOCKUPOWE ═══ */

const stats = [
  { label: "Lekcje dzis", value: "18", sub: "3 w trakcie \u00b7 6 zrealizowanych", icon: "\ud83d\udcda", color: T.primary, trend: "+2 vs wczoraj" },
  { label: "Aktywni uczniowie", value: "47", sub: "38 indyw. \u00b7 9 w grupach", icon: "\ud83c\udf93", color: T.cyan, trend: "+3 w tym msc", extra: "6 aktywnych grup" },
  { label: "Korepetytorzy dzis", value: "5/6", sub: "1 nieobecnosc (Anna \u2014 urlop)", icon: "\ud83d\udc68\u200d\ud83c\udfeb", color: T.success },
];

const monthLessons = { month: "Czerwiec 2026", realized: 62, planned: 24, cancelled: 4, noShow: 2, total: 92 };

const alerts = [
  {
    type: "absence", icon: "\u26a0\ufe0f", color: T.danger,
    title: "Nagla nieobecnosc \u2014 Tomasz Krawczyk",
    desc: "Jutro (Pt 21.06) \u2014 4 lekcje do odwolania", time: "12 min temu",
    details: {
      lessons: [
        { time: "14:00\u201315:00", student: "Kacper Nowak", subject: "Matematyka", room: "Sala 1" },
        { time: "15:15\u201316:15", student: "Grupa A (3 os.)", subject: "Matematyka", room: "Sala 1" },
        { time: "16:30\u201318:00", student: "Alicja Wisniewska", subject: "Fizyka", room: "Sala 2" },
        { time: "18:15\u201319:15", student: "Tomek Zielinski", subject: "Matematyka", room: "Sala 1" },
      ],
      note: "Powod: choroba. Rodzice zostana powiadomieni automatycznie po zatwierdzeniu."
    },
    actions: [
      { label: "Zatwierdz i odwolaj lekcje", primary: true },
      { label: "Odrzuc \u2014 wyjasni", primary: false },
    ],
  },
  {
    type: "plan", icon: "\ud83d\udcc5", color: T.tertiary,
    title: "Prosba o zmiane planu \u2014 Marta Zielinska",
    desc: "Przeniesienie piatku 15:00\u201317:00 na sobote od lipca", time: "2h temu",
    details: {
      message: `Prosze o przeniesienie moich piatkowych lekcji (15:00-17:00, Sala 2) na soboty od 5 lipca. Powod: zmiana grafiku na uczelni. Soboty 10:00-12:00 bylyby idealne.`,
      affected: "2 lekcje/tydzien: Grupa B (Ang) + Ola W. (Ang)",
      conflict: "Sala 2 wolna w soboty 10:00\u201312:00 \u2713"
    },
    actions: [
      { label: "Zatwierdz zmiane", primary: true },
      { label: "Zaproponuj inny termin", primary: false },
      { label: "Odrzuc", primary: false },
    ],
  },
  {
    type: "entry", icon: "\ud83d\udcdd", color: T.secondary,
    title: "3 zablokowane wpisy",
    desc: "Tomasz K. (2) \u00b7 Anna N. (1) \u2014 minal termin 48h", time: "dzis rano",
    details: {
      entries: [
        { tutor: "Tomasz K.", date: "Pon 17.06", student: "Julia Kowalska", subject: "Mat", overdue: "72h" },
        { tutor: "Tomasz K.", date: "Wt 18.06", student: "Grupa B (2 os.)", subject: "Fiz", overdue: "48h" },
        { tutor: "Anna N.", date: "Pon 17.06", student: "Michal Lis", subject: "Ang", overdue: "72h" },
      ],
    },
    actions: [{ label: "Otworz dziennik wpisow \u2192", primary: true }],
  },
  {
    type: "makeup", icon: "\ud83d\udd04", color: T.cyan,
    title: "2 odrabiania bez reakcji >3 dni",
    desc: "Propozycje od rodzicow czekaja na korepetytorów", time: "3 dni",
    details: {
      items: [
        { student: "Julia Kowalska", tutor: "Tomasz K.", proposed: "Sr 25.06, 16:00", waiting: "4 dni" },
        { student: "Michal Lis", tutor: "Tomasz K.", proposed: "Czw 26.06, 14:00", waiting: "3 dni" },
      ],
    },
    actions: [{ label: "Przypomnij korepetytorom", primary: true }],
  },
];

const todayByTutor = [
  { name: "Tomasz Krawczyk", initials: "TK", subjects: ["Matematyka", "Fizyka"], lessons: 5, done: 2, current: "14:00\u201315:00 \u00b7 Kacper N. \u00b7 Mat", room: "Sala 1", nextGap: null },
  { name: "Marta Zielinska", initials: "MZ", subjects: ["Angielski"], lessons: 4, done: 1, current: "14:15\u201315:15 \u00b7 Grupa A \u00b7 Ang", room: "Sala 2", nextGap: "16:00\u201317:00" },
  { name: "Karol Wisniewski", initials: "KW", subjects: ["Chemia"], lessons: 3, done: 0, current: null, room: "Sala 3", nextGap: null },
  { name: "Ewa Dabrowska", initials: "ED", subjects: ["Polski", "Angielski"], lessons: 4, done: 3, current: "13:45\u201314:45 \u00b7 Ola W. \u00b7 Pol", room: "Sala 1", nextGap: null },
  { name: "Piotr Adamczyk", initials: "PA", subjects: ["Matematyka", "Elektrotechnika"], lessons: 2, done: 0, current: null, room: "Sala 4", nextGap: "15:00\u201316:00" },
];

const absentTutor = { name: "Anna Nowak", initials: "AN", reason: "Urlop (20\u201322.06)", lessons: 3, status: "odwolane" };

/*
  SALE - dodawanie nowych:
  1. Dodaj obiekt do tablicy roomsNow: { name: "Sala N", status: "free"|"occupied", tutor, until, next }
  2. Produkcja: INSERT INTO rooms (name, capacity) VALUES ('Sala 5', 4);
  3. Dashboard renderuje dynamicznie - brak limitu sal.
*/
const roomsNow = [
  { name: "Sala 1", status: "occupied", tutor: "Ewa D.", until: "14:45", next: "Tomasz K. 15:00" },
  { name: "Sala 2", status: "occupied", tutor: "Marta Z.", until: "15:15", next: "Piotr A. 15:30" },
  { name: "Sala 3", status: "free", tutor: null, until: null, next: "Karol W. 15:00" },
  { name: "Sala 4", status: "free", tutor: null, until: null, next: "Piotr A. 17:00" },
];

const monthlyFinance = {
  month: "Czerwiec 2026",
  revenueCollected: 21200, revenueExpected: 28000,
  tutorCostsPlanned: 14200, tutorCostsActual: 10800,
};

const pendingPayments = [
  { parent: "Anna Kowalska", child: "Julia K.", amount: 680, subjects: "Matematyka (indyw.)", lateStreak: 1 },
  { parent: "Tomasz Lis", child: "Michal L.", amount: 520, subjects: "Fizyka (indyw.)", lateStreak: 0 },
  { parent: "Ewa Zielinska", child: "Ola Z. + Kasia Z.", amount: 1240, subjects: "Angielski (indyw.) + Angielski (grupa)", lateStreak: 3 },
  { parent: "Marek Nowak", child: "Kacper N.", amount: 440, subjects: "Matematyka (indyw.)", lateStreak: 0 },
  { parent: "Joanna Wisniewska", child: "Alicja W.", amount: 780, subjects: "Fizyka (indyw.) + Chemia (indyw.)", lateStreak: 2 },
  { parent: "Robert Kowalczyk", child: "Jan K.", amount: 360, subjects: "Matematyka (para)", lateStreak: 0 },
];

const subjectColors = {
  "Matematyka": T.primary, "Angielski": T.cyan, "Fizyka": "#F59E0B",
  "Chemia": T.success, "Polski": T.pink, "Elektrotechnika": T.secondary,
};

const sidebarItems = [
  { icon: "\ud83d\udcca", label: "Dashboard", active: true },
  { icon: "\ud83d\udcc5", label: "Harmonogram", badge: null },
  { icon: "\ud83d\udc68\u200d\ud83c\udfeb", label: "Korepetytorzy", badge: 1 },
  { icon: "\ud83c\udf93", label: "Uczniowie i grupy" },
  { icon: "\ud83d\udcb3", label: "Platnosci", badge: 5 },
  { icon: "\u2699\ufe0f", label: "Ustawienia" },
];

/* ═══════════ KOMPONENTY ═══════════ */

function Sidebar({ collapsed, onToggle }) {
  return (
    <div style={{ width: collapsed ? 64 : 240, flexShrink: 0, background: T.bgAlt, borderRight: `1px solid ${T.cardBorder}`, display: "flex", flexDirection: "column", transition: "width 0.25s ease", overflow: "hidden" }}>
      <div style={{ padding: collapsed ? "16px 12px" : "16px 20px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 10, minHeight: 56 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: -2, fontStyle: "italic", flexShrink: 0 }}>Ez</div>
        {!collapsed && <span style={{ fontSize: 15, fontWeight: 900, color: T.text, fontFamily: "Nunito, sans-serif", whiteSpace: "nowrap" }}>EDU <span style={{ color: T.primary }}>LUZ</span></span>}
      </div>
      {!collapsed && <div style={{ padding: "12px 20px 4px" }}><span style={{ fontSize: 9, fontWeight: 800, color: T.tertiary, background: `${T.tertiary}18`, padding: "2px 8px", borderRadius: 50, letterSpacing: 1 }}>ADMIN</span></div>}
      <div style={{ padding: "8px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {sidebarItems.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 16px" : "10px 12px", borderRadius: 10, cursor: "pointer", background: item.active ? `${T.primary}18` : "transparent", transition: "all 0.15s" }}
            onMouseEnter={e => { if (!item.active) e.currentTarget.style.background = `${T.primary}0A`; }}
            onMouseLeave={e => { if (!item.active) e.currentTarget.style.background = "transparent"; }}>
            <span style={{ fontSize: 18, flexShrink: 0, width: 24, textAlign: "center" }}>{item.icon}</span>
            {!collapsed && <span style={{ fontSize: 13, fontWeight: item.active ? 800 : 500, color: item.active ? T.primary : T.textMuted, fontFamily: "Nunito, sans-serif", whiteSpace: "nowrap", flex: 1 }}>{item.label}</span>}
            {!collapsed && item.badge && <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: T.danger, borderRadius: 50, minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>{item.badge}</span>}
          </div>
        ))}
      </div>
      <div onClick={onToggle} style={{ padding: "12px", borderTop: `1px solid ${T.cardBorder}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.textDim, fontSize: 16, transition: "color 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.color = T.text}
        onMouseLeave={e => e.currentTarget.style.color = T.textDim}>
        {collapsed ? "\u25b6" : "\u25c0"}
      </div>
    </div>
  );
}

function Topbar() {
  return (
    <div style={{ height: 56, background: T.bgAlt, borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
      <div>
        <span style={{ fontSize: 16, fontWeight: 900, color: T.text, fontFamily: "Nunito, sans-serif" }}>Panel Administratora</span>
        <span style={{ fontSize: 12, color: T.textDim, marginLeft: 12 }}>Czwartek, 20 czerwca 2026</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", cursor: "pointer" }}>
          <span style={{ fontSize: 18 }}>{"\ud83d\udd14"}</span>
          <span style={{ position: "absolute", top: -4, right: -6, fontSize: 9, fontWeight: 800, color: "#fff", background: T.danger, borderRadius: 50, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>7</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <div style={{ width: 32, height: 32, borderRadius: 50, background: `${T.tertiary}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: T.tertiary }}>AD</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "Nunito, sans-serif" }}>Admin</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ stat }) {
  const [h, sH] = useState(false);
  return (
    <div onMouseEnter={() => sH(true)} onMouseLeave={() => sH(false)}
      style={{ flex: "1 1 200px", background: h ? T.surfaceHover : T.surface, borderRadius: 16, border: `1px solid ${T.cardBorder}`, padding: "20px", display: "flex", flexDirection: "column", gap: 8, transition: "all 0.2s", cursor: "pointer", transform: h ? "translateY(-2px)" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 22 }}>{stat.icon}</span>
        {stat.trend && <span style={{ fontSize: 10, fontWeight: 700, color: stat.color, background: `${stat.color}15`, padding: "2px 8px", borderRadius: 50 }}>{stat.trend}</span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: T.text, fontFamily: "Nunito, sans-serif", lineHeight: 1 }}>{stat.value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted }}>{stat.label}</div>
      <div style={{ fontSize: 11, color: T.textDim }}>{stat.sub}</div>
      {stat.extra && <div style={{ fontSize: 11, fontWeight: 700, color: stat.color, marginTop: -2 }}>{stat.extra}</div>}
    </div>
  );
}

function MonthLessonsCard() {
  const m = monthLessons;
  const segments = [
    { label: "Zrealizowane", value: m.realized, color: T.success },
    { label: "Zaplanowane", value: m.planned, color: T.primary },
    { label: "Odwolane", value: m.cancelled, color: T.danger },
    { label: "No-show", value: m.noShow, color: T.secondary },
  ];
  return (
    <div style={{ flex: "1 1 200px", background: T.surface, borderRadius: 16, border: `1px solid ${T.cardBorder}`, padding: "20px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 22 }}>{"\ud83d\udcca"}</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 14, cursor: "pointer", color: T.textDim, userSelect: "none" }}>{"\u2190"}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: T.textMuted }}>{m.month}</span>
          <span style={{ fontSize: 14, cursor: "pointer", color: T.textDim, userSelect: "none" }}>{"\u2192"}</span>
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: T.text, fontFamily: "Nunito, sans-serif", lineHeight: 1 }}>{m.total}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted }}>Lekcje w miesiacu</div>
      <div style={{ display: "flex", height: 8, borderRadius: 50, overflow: "hidden", gap: 2 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ flex: s.value, background: s.color, borderRadius: i === 0 ? "50px 0 0 50px" : i === segments.length - 1 ? "0 50px 50px 0" : 0, minWidth: s.value > 0 ? 4 : 0 }} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 50, background: s.color }} />
            <span style={{ fontSize: 10, color: T.textDim }}>{s.label}:</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ALERT ─── */
function AlertCard({ alert }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? T.surfaceHover : T.surface, borderRadius: 14, border: `1px solid ${T.cardBorder}`, borderLeft: `3px solid ${alert.color}`, overflow: "hidden", transition: "all 0.15s" }}>
      <div onClick={() => setExpanded(!expanded)} style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{alert.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: "Nunito, sans-serif" }}>{alert.title}</span>
            <span style={{ fontSize: 10, color: T.textDim, flexShrink: 0 }}>{alert.time}</span>
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>{alert.desc}</div>
        </div>
        <span style={{ fontSize: 12, color: T.textDim, flexShrink: 0, marginTop: 2, transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>{"\u25bc"}</span>
      </div>
      {expanded && (
        <div style={{ padding: "0 18px 16px 48px", borderTop: `1px solid ${T.cardBorder}`, paddingTop: 14, animation: "fadeIn 0.15s ease" }}>
          {alert.type === "absence" && alert.details?.lessons && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {alert.details.lessons.map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: T.textMuted }}>
                  <span style={{ fontWeight: 700, color: T.text, minWidth: 90 }}>{l.time}</span>
                  <span>{l.student}</span>
                  <span style={{ fontSize: 10, color: subjectColors[l.subject] || T.textDim, background: `${(subjectColors[l.subject] || T.textDim)}15`, padding: "1px 6px", borderRadius: 50 }}>{l.subject}</span>
                  <span style={{ fontSize: 10, color: T.textDim }}>{l.room}</span>
                </div>
              ))}
              {alert.details.note && <div style={{ fontSize: 11, color: T.textDim, marginTop: 6, fontStyle: "italic" }}>{alert.details.note}</div>}
            </div>
          )}
          {alert.type === "plan" && alert.details && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5, background: `${T.tertiary}08`, padding: "10px 14px", borderRadius: 10, borderLeft: `2px solid ${T.tertiary}40` }}>{alert.details.message}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Dotyczy: <span style={{ color: T.text, fontWeight: 700 }}>{alert.details.affected}</span></div>
              <div style={{ fontSize: 11, color: T.success, fontWeight: 600 }}>{alert.details.conflict}</div>
            </div>
          )}
          {alert.type === "entry" && alert.details?.entries && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {alert.details.entries.map((e, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: T.textMuted }}>
                  <span style={{ fontWeight: 700, color: T.text, minWidth: 80 }}>{e.tutor}</span>
                  <span>{e.date}</span><span>{e.student}</span>
                  <span style={{ fontSize: 10, color: T.danger, fontWeight: 700 }}>+{e.overdue}</span>
                </div>
              ))}
            </div>
          )}
          {alert.type === "makeup" && alert.details?.items && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {alert.details.items.map((m2, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: T.textMuted }}>
                  <span style={{ fontWeight: 700, color: T.text }}>{m2.student}</span>
                  <span>{"\u2192"} {m2.tutor}</span>
                  <span style={{ color: T.cyan }}>{m2.proposed}</span>
                  <span style={{ fontSize: 10, color: T.danger, fontWeight: 700 }}>czeka {m2.waiting}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {alert.actions.map((a, i) => <ActionBtn key={i} label={a.label} color={alert.color} primary={a.primary} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ label, color, primary }) {
  const [h, sH] = useState(false);
  return (
    <button onMouseEnter={() => sH(true)} onMouseLeave={() => sH(false)}
      style={{ fontSize: 11, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: primary ? (h ? color : `${color}20`) : (h ? `${T.textDim}20` : "transparent"), color: primary ? (h ? "#fff" : color) : T.textMuted, transition: "all 0.15s", transform: h ? "scale(1.03)" : "scale(1)" }}>
      {label}
    </button>
  );
}

/* ─── TUTOR ROW ─── */
function TutorRow({ tutor }) {
  const [h, sH] = useState(false);
  const pct = tutor.lessons > 0 ? (tutor.done / tutor.lessons) * 100 : 0;
  return (
    <div onMouseEnter={() => sH(true)} onMouseLeave={() => sH(false)}
      style={{ background: h ? T.surfaceHover : T.surface, borderRadius: 14, border: `1px solid ${T.cardBorder}`, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, transition: "all 0.15s", cursor: "pointer" }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: `${T.primary}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: T.primary }}>{tutor.initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: "Nunito, sans-serif" }}>{tutor.name}</span>
          {tutor.subjects.map((s, i) => <span key={i} style={{ fontSize: 9, fontWeight: 700, color: subjectColors[s] || T.textDim, background: `${(subjectColors[s] || T.textDim)}15`, padding: "1px 7px", borderRadius: 50 }}>{s}</span>)}
        </div>
        {tutor.current
          ? <div style={{ fontSize: 11, color: T.success, marginTop: 4, fontWeight: 600 }}>{"\u25b6"} {tutor.current} {"\u00b7"} {tutor.room}</div>
          : <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>Nastepna lekcja wkrotce {"\u00b7"} {tutor.room}</div>
        }
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{tutor.done}/{tutor.lessons}</span>
        <div style={{ width: 80, height: 5, borderRadius: 50, background: `${T.primary}20` }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 50, background: pct === 100 ? T.success : T.primary, transition: "width 0.3s" }} />
        </div>
        {tutor.nextGap && <span style={{ fontSize: 9, color: T.tertiary, fontWeight: 700 }}>{"\ud83d\udd50"} Okienko: {tutor.nextGap}</span>}
      </div>
    </div>
  );
}

function AbsentRow({ tutor }) {
  return (
    <div style={{ background: `${T.danger}08`, borderRadius: 14, border: `1px solid ${T.danger}20`, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, opacity: 0.7 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: `${T.danger}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: T.danger }}>{tutor.initials}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: "Nunito, sans-serif", textDecoration: "line-through", opacity: 0.6 }}>{tutor.name}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: T.danger, background: `${T.danger}15`, padding: "1px 7px", borderRadius: 50 }}>NIEOBECNA</span>
        </div>
        <div style={{ fontSize: 11, color: T.textDim, marginTop: 3 }}>{tutor.reason} {"\u00b7"} {tutor.lessons} lekcje {tutor.status}</div>
      </div>
    </div>
  );
}

function RoomCard({ room }) {
  const isFree = room.status === "free";
  const [h, sH] = useState(false);
  return (
    <div onMouseEnter={() => sH(true)} onMouseLeave={() => sH(false)}
      style={{ flex: "1 1 120px", background: h ? T.surfaceHover : T.surface, borderRadius: 14, border: `1px solid ${isFree ? `${T.success}30` : T.cardBorder}`, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6, transition: "all 0.15s", cursor: "pointer", transform: h ? "translateY(-1px)" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: "Nunito, sans-serif" }}>{room.name}</span>
        <span style={{ fontSize: 9, fontWeight: 700, borderRadius: 50, padding: "2px 8px", color: isFree ? T.success : T.primary, background: isFree ? `${T.success}15` : `${T.primary}15` }}>{isFree ? "WOLNA" : "ZAJETA"}</span>
      </div>
      {!isFree && <div style={{ fontSize: 11, color: T.textMuted }}>{room.tutor} {"\u2014"} do {room.until}</div>}
      <div style={{ fontSize: 10, color: T.textDim }}>Nastepna: {room.next}</div>
    </div>
  );
}

/* ─── FINANSE (PRZYCHOD + KOSZTY + MARZA) ─── */
function FinanceSection() {
  const f = monthlyFinance;
  const revPct = Math.round((f.revenueCollected / f.revenueExpected) * 100);
  const costPct = f.tutorCostsPlanned > 0 ? Math.round((f.tutorCostsActual / f.tutorCostsPlanned) * 100) : 0;
  const margin = f.revenueCollected - f.tutorCostsActual;
  const marginPlan = f.revenueExpected - f.tutorCostsPlanned;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{"\ud83d\udcb0"}</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: T.text, fontFamily: "Nunito, sans-serif" }}>Finanse {"\u2014"} {f.month}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ fontSize: 14, cursor: "pointer", color: T.textDim, userSelect: "none" }}>{"\u2190"}</span>
          <span style={{ fontSize: 14, cursor: "pointer", color: T.textDim, userSelect: "none" }}>{"\u2192"}</span>
        </div>
      </div>

      {/* Pasek przychodu */}
      <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.cardBorder}`, padding: "16px 20px", marginBottom: 10, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.textMuted }}>Przychod</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{f.revenueCollected.toLocaleString("pl-PL")} <span style={{ color: T.textDim, fontWeight: 500 }}>/ {f.revenueExpected.toLocaleString("pl-PL")} zl</span></span>
          </div>
          <div style={{ height: 10, borderRadius: 50, background: `${T.primary}15`, overflow: "hidden" }}>
            <div style={{ width: `${revPct}%`, height: "100%", borderRadius: 50, background: `linear-gradient(90deg, ${T.primary}, ${T.success})`, transition: "width 0.5s" }} />
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: revPct >= 90 ? T.success : revPct >= 70 ? T.tertiary : T.secondary, fontFamily: "Nunito, sans-serif", minWidth: 55, textAlign: "right" }}>{revPct}%</div>
      </div>

      {/* Koszty + Marza (2 kolumny) */}
      <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.cardBorder}`, padding: "18px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Koszty */}
        <div>
          <div style={{ fontSize: 11, color: T.textDim, marginBottom: 10, fontWeight: 600 }}>Koszty korepetytorów</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: T.textMuted }}>Planowane</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: T.textMuted }}>{f.tutorCostsPlanned.toLocaleString("pl-PL")} zl</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: T.textMuted }}>Obecne</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: T.accent }}>{f.tutorCostsActual.toLocaleString("pl-PL")} zl</span>
          </div>
          <div style={{ height: 6, borderRadius: 50, background: `${T.accent}15` }}>
            <div style={{ width: `${costPct}%`, height: "100%", borderRadius: 50, background: T.accent, transition: "width 0.3s" }} />
          </div>
          <div style={{ fontSize: 10, color: T.textDim, marginTop: 4, textAlign: "right" }}>{costPct}% planu</div>
        </div>

        {/* Marza */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderLeft: `1px solid ${T.cardBorder}`, paddingLeft: 20 }}>
          <div style={{ fontSize: 10, color: T.textDim, marginBottom: 6, fontWeight: 600 }}>Marza (obecna)</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: margin >= 0 ? T.success : T.danger, fontFamily: "Nunito, sans-serif" }}>{margin.toLocaleString("pl-PL")} zl</div>
          <div style={{ fontSize: 10, color: T.textDim, marginTop: 6 }}>Plan: {marginPlan.toLocaleString("pl-PL")} zl</div>
        </div>
      </div>

      {/* Wskazniki - osobny kafelek */}
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        {[
          { label: "Sr. przychod / lekcja", value: `${Math.round(f.revenueCollected / monthLessons.realized)} zl`, color: T.primary },
          { label: "Sr. koszt / lekcja", value: `${Math.round(f.tutorCostsActual / monthLessons.realized)} zl`, color: T.accent },
          { label: "Sr. marza / lekcja", value: `${Math.round(margin / monthLessons.realized)} zl`, color: T.success },
        ].map((w, i) => (
          <div key={i} style={{ flex: 1, background: T.surface, borderRadius: 12, border: `1px solid ${T.cardBorder}`, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: w.color, fontFamily: "Nunito, sans-serif" }}>{w.value}</div>
            <div style={{ fontSize: 10, color: T.textDim, marginTop: 4 }}>{w.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── OCZEKIWANE WPLATY ─── */
function PendingPaymentsSection() {
  const [expanded, setExpanded] = useState(false);
  const total = pendingPayments.reduce((s, p) => s + p.amount, 0);
  const lateCount = pendingPayments.filter(p => p.lateStreak > 0).length;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{"\ud83d\udcb3"}</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: T.text, fontFamily: "Nunito, sans-serif" }}>Oczekiwane wplaty</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: T.secondary, borderRadius: 50, minWidth: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>{pendingPayments.length}</span>
        </div>
        <span style={{ fontSize: 10, color: T.textDim }}>termin: do 10. dnia miesiaca</span>
      </div>

      <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.cardBorder}`, overflow: "hidden" }}>
        <div onClick={() => setExpanded(!expanded)}
          style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: T.secondary, fontFamily: "Nunito, sans-serif" }}>{total.toLocaleString("pl-PL")} zl</span>
            <span style={{ fontSize: 12, color: T.textDim }}>od {pendingPayments.length} rodzicow</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {lateCount > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: T.danger, background: `${T.danger}15`, padding: "2px 8px", borderRadius: 50 }}>{lateCount} z opoznieniem</span>}
            <span style={{ fontSize: 12, color: T.textDim, transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>{"\u25bc"}</span>
          </div>
        </div>

        {expanded && (
          <div style={{ borderTop: `1px solid ${T.cardBorder}`, padding: "12px 20px", animation: "fadeIn 0.15s ease" }}>
            {pendingPayments.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < pendingPayments.length - 1 ? `1px solid ${T.cardBorder}` : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{p.parent}</span>
                    {p.lateStreak > 0 && (
                      <span style={{ fontSize: 9, fontWeight: 800, color: p.lateStreak >= 3 ? T.danger : T.tertiary, background: `${p.lateStreak >= 3 ? T.danger : T.tertiary}15`, padding: "1px 7px", borderRadius: 50 }}>
                        {p.lateStreak}. opoznienie
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: T.textDim }}>{p.child}</span>
                  <span style={{ fontSize: 10, color: T.textMuted }}>{p.subjects}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.secondary, flexShrink: 0, marginLeft: 12 }}>{p.amount.toLocaleString("pl-PL")} zl</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, badge, rightEl, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: T.text, fontFamily: "Nunito, sans-serif" }}>{title}</span>
          {badge != null && <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: T.danger, borderRadius: 50, minWidth: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>{badge}</span>}
        </div>
        {rightEl}
      </div>
      {children}
    </div>
  );
}

function QuickAction({ label, icon, color }) {
  const [h, sH] = useState(false);
  return (
    <button onMouseEnter={() => sH(true)} onMouseLeave={() => sH(false)}
      style={{ flex: "1 1 130px", display: "flex", alignItems: "center", gap: 8, background: h ? T.surfaceHover : T.surface, border: `1px solid ${h ? `${color}40` : T.cardBorder}`, borderRadius: 12, padding: "12px 16px", cursor: "pointer", transition: "all 0.15s", fontFamily: "Nunito, sans-serif", transform: h ? "translateY(-1px)" : "none" }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: h ? color : T.textMuted }}>{label}</span>
    </button>
  );
}

/* ═══════════ MAIN ═══════════ */
export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  const visibleAlerts = alertsExpanded ? alerts : alerts.slice(0, 3);

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, fontFamily: "Nunito, sans-serif", color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.cardBorder}; border-radius: 50px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar />
        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>

          {/* KAFELKI STATYSTYK */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
            {stats.map((s, i) => <StatCard key={i} stat={s} />)}
            <MonthLessonsCard />
          </div>

          {/* LAYOUT 2 KOLUMNY */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* LEWA */}
            <div>
              <Section title="Wymagaja uwagi" icon={"\ud83d\udea8"} badge={alerts.length}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {visibleAlerts.map((a, i) => <AlertCard key={i} alert={a} />)}
                </div>
                {alerts.length > 3 && (
                  <button onClick={() => setAlertsExpanded(!alertsExpanded)}
                    style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: T.primary, background: "transparent", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                    {alertsExpanded ? "Zwin \u25b2" : `Pokaz wszystkie (${alerts.length}) \u25bc`}
                  </button>
                )}
              </Section>

              <FinanceSection />
              <PendingPaymentsSection />
            </div>

            {/* PRAWA */}
            <div>
              <Section title="Korepetytorzy dzis" icon={"\ud83d\udc68\u200d\ud83c\udfeb"}
                rightEl={<span style={{ fontSize: 11, fontWeight: 700, color: T.textDim }}>{todayByTutor.reduce((s, t) => s + t.done, 0)}/{todayByTutor.reduce((s, t) => s + t.lessons, 0)} lekcji zrealizowanych</span>}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {todayByTutor.map((t, i) => <TutorRow key={i} tutor={t} />)}
                  <AbsentRow tutor={absentTutor} />
                </div>
              </Section>

              <Section title="Sale \u2014 teraz" icon={"\ud83c\udfe0"}
                rightEl={<span style={{ fontSize: 11, fontWeight: 700, color: T.textDim }}>14:30</span>}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {roomsNow.map((r, i) => <RoomCard key={i} room={r} />)}
                </div>
              </Section>

              <Section title="Szybkie akcje" icon={"\u26a1"}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[
                    { label: "Dodaj ucznia", icon: "\u2795", color: T.primary },
                    { label: "Dodaj zajecia", icon: "\ud83d\udcda", color: T.success },
                    { label: "Nowa grupa", icon: "\ud83d\udc65", color: T.accent },
                    { label: "Wyslij komunikat", icon: "\ud83d\udce7", color: T.cyan },
                  ].map((a, i) => <QuickAction key={i} {...a} />)}
                </div>
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
