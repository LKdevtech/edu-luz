import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", secondary: "#FF6F4A", tertiary: "#FFCA28",
  accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4",
  danger: "#EF4444", pink: "#E84393",
  cardBorder: "rgba(59,143,240,0.10)",
};
const DASH = "–";
const DOT = "·";
const subjectColor = { "Matematyka": T.primary, "Angielski": T.cyan, "Fizyka": "#F59E0B", "Chemia": T.success, "Polski": T.pink, "Elektrotechnika": T.secondary };

const tutors = [
  {
    id: "TK", name: "Tomasz Krawczyk", phone: "601 234 567", email: "t.krawczyk@edu-luz.pl",
    subjects: ["Matematyka", "Fizyka"], status: "active",
    rate: 70, rateGroup: 50,
    studentsIndiv: 6, groups: 1, groupStudents: 3,
    weekLessons: 18, weekHours: 22,
    monthDone: 62, monthCancelled: 1, monthNoShow: 1,
    entryRate: 94,
    availSummary: "Pon–Czw 9–16, Pt 10–15",
    absences: [
      { type: "sick", dates: "5–6.06", days: 2, lessonsAffected: 8, status: "resolved" },
    ],
    upcomingAbsence: null,
    students: [
      { name: "Kacper Nowak", subject: "Matematyka", lvl: "LO2", type: "indyw.", hours: "Pon+Czw 9:00" },
      { name: "Julia Kowalska", subject: "Matematyka", lvl: "SP8", type: "indyw.", hours: "Pon+Śr 9:00" },
      { name: "Tomek Zieliński", subject: "Fizyka", lvl: "ŚR★", type: "indyw.", hours: "Pon+Śr 14:00" },
      { name: "Alicja Wiśniewska", subject: "Fizyka", lvl: "EM★", type: "indyw.", hours: "Wt+Śr 10:15" },
      { name: "Jan Kowalczyk", subject: "Matematyka", lvl: "ŚR", type: "indyw.", hours: "Wt 14:00" },
      { name: "Alicja Wiśniewska", subject: "Matematyka", lvl: "EM★", type: "indyw.", hours: "Pt 13:00" },
      { name: "Grupa A (3os.)", subject: "Matematyka", lvl: "SP8", type: "grupa", hours: "Pon 11:30" },
    ],
  },
  {
    id: "MZ", name: "Marta Zielińska", phone: "602 345 678", email: "m.zielinska@edu-luz.pl",
    subjects: ["Angielski"], status: "active",
    rate: 65, rateGroup: 45,
    studentsIndiv: 5, groups: 2, groupStudents: 7,
    weekLessons: 16, weekHours: 19,
    monthDone: 54, monthCancelled: 0, monthNoShow: 1,
    entryRate: 100,
    availSummary: "Pon–Czw 9–15, Pt 14–18, Sob 10–13",
    absences: [],
    upcomingAbsence: null,
    students: [
      { name: "Ola Wiśniewska", subject: "Angielski", lvl: "SP", type: "indyw.", hours: "Wt+Czw 9:00" },
      { name: "Kasia Zielińska", subject: "Angielski", lvl: "ŚR★", type: "indyw.", hours: "Wt+Czw 12:00" },
      { name: "Alicja Wiśniewska", subject: "Angielski", lvl: "EM", type: "indyw.", hours: "Pon+Śr 12:00" },
      { name: "Michał Lis", subject: "Angielski", lvl: "SP", type: "indyw.", hours: "Pon+Czw 16:00" },
      { name: "Ola Wiśniewska", subject: "Angielski", lvl: "SP", type: "indyw.", hours: "Pt 14:00" },
      { name: "Grupa A (3os.)", subject: "Angielski", lvl: "SP8", type: "grupa", hours: "Czw+Sob 9:00" },
      { name: "Grupa B (4os.)", subject: "Angielski", lvl: "ŚR", type: "grupa", hours: "Pon+Śr 10:00" },
    ],
  },
  {
    id: "KW", name: "Karol Wiśniewski", phone: "603 456 789", email: "k.wisniewski@edu-luz.pl",
    subjects: ["Chemia"], status: "active",
    rate: 65, rateGroup: 45,
    studentsIndiv: 4, groups: 0, groupStudents: 0,
    weekLessons: 8, weekHours: 9,
    monthDone: 28, monthCancelled: 2, monthNoShow: 0,
    entryRate: 88,
    availSummary: "Pon 10–13, Śr 10–15, Czw 15–18, Pt 10–12",
    absences: [],
    upcomingAbsence: null,
    students: [
      { name: "Jan Kowalczyk", subject: "Chemia", lvl: "ŚR", type: "indyw.", hours: "Pon+Śr 10:00" },
      { name: "Michał Lis", subject: "Chemia", lvl: "SP", type: "indyw.", hours: "Śr 11:15" },
      { name: "Ola Zielińska", subject: "Chemia", lvl: "ŚR", type: "indyw.", hours: "Śr 13:00, Pt 10:00" },
      { name: "Julia Kowalska", subject: "Chemia", lvl: "E8", type: "indyw.", hours: "Czw 17:00" },
    ],
  },
  {
    id: "ED", name: "Ewa Dąbrowska", phone: "604 567 890", email: "e.dabrowska@edu-luz.pl",
    subjects: ["Polski", "Angielski"], status: "active",
    rate: 60, rateGroup: 42,
    studentsIndiv: 5, groups: 0, groupStudents: 0,
    weekLessons: 12, weekHours: 14,
    monthDone: 42, monthCancelled: 1, monthNoShow: 0,
    entryRate: 97,
    availSummary: "Pon+Czw 11–16, Wt 9–13, Śr 9–11+13–16, Pt 16–18",
    absences: [
      { type: "vacation", dates: "1–5.07", days: 5, lessonsAffected: 12, status: "approved" },
    ],
    upcomingAbsence: { type: "vacation", dates: "1–5.07", days: 5, lessonsAffected: 12 },
    students: [
      { name: "Ola Wiśniewska", subject: "Polski", lvl: "SP", type: "indyw.", hours: "Pon+Czw 11:00" },
      { name: "Kasia Zielińska", subject: "Polski", lvl: "ŚR★", type: "indyw.", hours: "Wt 9:00, Pt 16:00" },
      { name: "Tomek Zieliński", subject: "Polski", lvl: "ŚR", type: "indyw.", hours: "Wt 10:15" },
      { name: "Michał Lis", subject: "Angielski", lvl: "SP", type: "indyw.", hours: "Pon 14:00" },
      { name: "Kasia Zielińska", subject: "Angielski", lvl: "ŚR★", type: "indyw.", hours: "Czw 13:00, Śr 14:15" },
    ],
  },
  {
    id: "PA", name: "Piotr Adamczyk", phone: "605 678 901", email: "p.adamczyk@edu-luz.pl",
    subjects: ["Matematyka", "Elektrotechnika"], status: "active",
    rate: 60, rateGroup: 42,
    studentsIndiv: 3, groups: 1, groupStudents: 4,
    weekLessons: 8, weekHours: 10,
    monthDone: 26, monthCancelled: 0, monthNoShow: 1,
    entryRate: 92,
    availSummary: "Wt+Czw 12–17, Pt 15–19",
    absences: [],
    upcomingAbsence: null,
    students: [
      { name: "Ola Zielińska", subject: "Elektrotechnika", lvl: "ŚR", type: "indyw.", hours: "Wt 14:00, Czw 15:00" },
      { name: "Kacper Nowak", subject: "Matematyka", lvl: "ŚR", type: "indyw.", hours: "Wt 15:15, Czw 17:00" },
      { name: "Jan Kowalczyk", subject: "Elektrotechnika", lvl: "ŚR", type: "indyw.", hours: "Pt 17:00" },
      { name: "Grupa C (4os.)", subject: "Matematyka", lvl: "EM", type: "grupa", hours: "Wt+Czw 12:00" },
    ],
  },
  {
    id: "AN", name: "Anna Nowak", phone: "606 789 012", email: "a.nowak@edu-luz.pl",
    subjects: ["Angielski"], status: "absence",
    rate: 65, rateGroup: 45,
    studentsIndiv: 4, groups: 0, groupStudents: 0,
    weekLessons: 0, weekHours: 0,
    monthDone: 18, monthCancelled: 3, monthNoShow: 0,
    entryRate: 85,
    availSummary: "Pon–Śr 10–15",
    absences: [
      { type: "sick", dates: "15–17.06", days: 3, lessonsAffected: 9, status: "resolved" },
      { type: "vacation", dates: "20–22.06", days: 3, lessonsAffected: 9, status: "active" },
    ],
    upcomingAbsence: { type: "vacation", dates: "20–22.06", days: 3, lessonsAffected: 9 },
    students: [
      { name: "Julia Kowalska", subject: "Angielski", lvl: "E8", type: "indyw.", hours: "Pon+Śr 10:00" },
      { name: "Tomek Zieliński", subject: "Angielski", lvl: "ŚR", type: "indyw.", hours: "Pon+Śr 11:15" },
      { name: "Kacper Nowak", subject: "Angielski", lvl: "ŚR", type: "indyw.", hours: "Wt 10:00" },
      { name: "Alicja Wiśniewska", subject: "Angielski", lvl: "EM", type: "indyw.", hours: "Wt 11:15" },
    ],
  },
];

const levelColor = { "SP": T.cyan, "E8": T.tertiary, "ŚR": T.primary, "ŚR★": T.accent, "EM": T.danger, "EM★": T.pink };


const monthlyHistory = {
  "TK": [
    { month: "Kwiecień 2026", planned: 72, done: 68, cancelled: 3, noShow: 1, indivH: 52, groupH: 16, rate: 70, rateG: 50 },
    { month: "Maj 2026", planned: 76, done: 72, cancelled: 2, noShow: 2, indivH: 56, groupH: 16, rate: 70, rateG: 50 },
    { month: "Czerwiec 2026", planned: 78, done: 62, cancelled: 1, noShow: 1, indivH: 48, groupH: 14, rate: 70, rateG: 50 },
  ],
  "MZ": [
    { month: "Kwiecień 2026", planned: 64, done: 60, cancelled: 2, noShow: 2, indivH: 36, groupH: 24, rate: 65, rateG: 45 },
    { month: "Maj 2026", planned: 68, done: 65, cancelled: 1, noShow: 2, indivH: 40, groupH: 25, rate: 65, rateG: 45 },
    { month: "Czerwiec 2026", planned: 66, done: 54, cancelled: 0, noShow: 1, indivH: 34, groupH: 20, rate: 65, rateG: 45 },
  ],
  "KW": [
    { month: "Kwiecień 2026", planned: 32, done: 30, cancelled: 1, noShow: 1, indivH: 30, groupH: 0, rate: 65, rateG: 45 },
    { month: "Maj 2026", planned: 34, done: 32, cancelled: 1, noShow: 1, indivH: 32, groupH: 0, rate: 65, rateG: 45 },
    { month: "Czerwiec 2026", planned: 36, done: 28, cancelled: 2, noShow: 0, indivH: 28, groupH: 0, rate: 65, rateG: 45 },
  ],
  "ED": [
    { month: "Kwiecień 2026", planned: 48, done: 46, cancelled: 1, noShow: 1, indivH: 46, groupH: 0, rate: 60, rateG: 42 },
    { month: "Maj 2026", planned: 52, done: 50, cancelled: 1, noShow: 1, indivH: 50, groupH: 0, rate: 60, rateG: 42 },
    { month: "Czerwiec 2026", planned: 50, done: 42, cancelled: 1, noShow: 0, indivH: 42, groupH: 0, rate: 60, rateG: 42 },
  ],
  "PA": [
    { month: "Kwiecień 2026", planned: 32, done: 30, cancelled: 1, noShow: 1, indivH: 18, groupH: 12, rate: 60, rateG: 42 },
    { month: "Maj 2026", planned: 36, done: 33, cancelled: 2, noShow: 1, indivH: 20, groupH: 13, rate: 60, rateG: 42 },
    { month: "Czerwiec 2026", planned: 34, done: 26, cancelled: 0, noShow: 1, indivH: 16, groupH: 10, rate: 60, rateG: 42 },
  ],
  "AN": [
    { month: "Kwiecień 2026", planned: 40, done: 38, cancelled: 1, noShow: 1, indivH: 38, groupH: 0, rate: 65, rateG: 45 },
    { month: "Maj 2026", planned: 44, done: 40, cancelled: 2, noShow: 2, indivH: 40, groupH: 0, rate: 65, rateG: 45 },
    { month: "Czerwiec 2026", planned: 42, done: 18, cancelled: 3, noShow: 0, indivH: 18, groupH: 0, rate: 65, rateG: 45 },
  ],
};

const sidebarItems = [
  { icon: "\ud83d\udcca", label: "Dashboard" },
  { icon: "\ud83d\udcc5", label: "Harmonogram" },
  { icon: "\ud83d\udc68\u200d\ud83c\udfeb", label: "Korepetytorzy", active: true },
  { icon: "\ud83c\udf93", label: "Uczniowie i grupy" },
  { icon: "\ud83d\udcb3", label: "Płatności", badge: 5 },
  { icon: "⚙\ufe0f", label: "Ustawienia" },
];

function Sidebar({ collapsed, onToggle }) {
  return (
    <div style={{ width: collapsed ? 60 : 210, flexShrink: 0, background: T.bgAlt, borderRight: "1px solid " + T.cardBorder, display: "flex", flexDirection: "column", transition: "width 0.25s", overflow: "hidden" }}>
      <div style={{ padding: collapsed ? "14px 10px" : "14px 16px", borderBottom: "1px solid " + T.cardBorder, display: "flex", alignItems: "center", gap: 8, minHeight: 50 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: -2, fontStyle: "italic", flexShrink: 0 }}>Ez</div>
        {!collapsed && <span style={{ fontSize: 14, fontWeight: 900, color: T.text, fontFamily: "Nunito, sans-serif" }}>EDU <span style={{ color: T.primary }}>LUZ</span></span>}
      </div>
      {!collapsed && <div style={{ padding: "10px 16px 2px" }}><span style={{ fontSize: 8, fontWeight: 800, color: T.tertiary, background: T.tertiary + "18", padding: "2px 6px", borderRadius: 50, letterSpacing: 1 }}>ADMIN</span></div>}
      <div style={{ padding: 6, flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        {sidebarItems.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: collapsed ? "8px 12px" : "8px 10px", borderRadius: 8, cursor: "pointer", background: item.active ? T.primary + "18" : "transparent" }}>
            <span style={{ fontSize: 15, flexShrink: 0, width: 20, textAlign: "center" }}>{item.icon}</span>
            {!collapsed && <span style={{ fontSize: 11, fontWeight: item.active ? 800 : 500, color: item.active ? T.primary : T.textMuted, fontFamily: "Nunito, sans-serif", flex: 1 }}>{item.label}</span>}
            {!collapsed && item.badge && <span style={{ fontSize: 8, fontWeight: 800, color: "#fff", background: T.danger, borderRadius: 50, minWidth: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{item.badge}</span>}
          </div>
        ))}
      </div>
      <div onClick={onToggle} style={{ padding: 10, borderTop: "1px solid " + T.cardBorder, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.textDim, fontSize: 12 }}>
        {collapsed ? "▶" : "◀"}
      </div>
    </div>
  );
}



function StudentList({ students }) {
  const [showAll, setShowAll] = useState(false);
  const LIMIT = 5;
  const visible = showAll ? students : students.slice(0, LIMIT);
  const hasMore = students.length > LIMIT;

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: showAll ? 300 : "none", overflow: showAll ? "auto" : "visible" }}>
        {visible.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", background: T.bg, borderRadius: 8, fontSize: 10 }}>
            <span style={{ fontWeight: 700, color: T.text, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
            <span style={{ fontSize: 8, fontWeight: 700, color: subjectColor[s.subject], flexShrink: 0 }}>{s.subject.slice(0, 3).toUpperCase()}</span>
            <span style={{ fontSize: 7, fontWeight: 800, color: levelColor[s.lvl] || T.textDim, background: (levelColor[s.lvl] || T.textDim) + "15", padding: "0 4px", borderRadius: 3, flexShrink: 0 }}>{s.lvl}</span>
            <span style={{ fontSize: 8, color: T.textDim, flexShrink: 0 }}>{s.type === "grupa" ? "\ud83d\udc65" : ""}</span>
            <span style={{ fontSize: 8, color: T.textDim, flexShrink: 0 }}>{s.hours}</span>
          </div>
        ))}
      </div>
      {hasMore && (
        <button onClick={() => setShowAll(!showAll)}
          style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: T.primary, background: "transparent", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", padding: "2px 0" }}
          onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
          onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
          {showAll ? "Zwiń ▲" : "Pokaż wszystkich (" + students.length + ") ▼"}
        </button>
      )}
    </div>
  );
}

function MonthlyStats({ tutorId, rate, rateGroup }) {
  const [monthIdx, setMonthIdx] = useState(2); // current month
  const history = monthlyHistory[tutorId] || [];
  const m = history[monthIdx];
  if (!m) return null;
  const payout = m.indivH * m.rate + m.groupH * m.rateG;

  return (
    <div style={{ borderTop: "1px solid " + T.cardBorder, marginTop: 10, paddingTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: T.text }}>{"Rozliczenie miesięczne"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span onClick={() => setMonthIdx(Math.max(0, monthIdx - 1))} style={{ cursor: monthIdx > 0 ? "pointer" : "default", color: monthIdx > 0 ? T.textMuted : T.textDim + "40", fontSize: 12, userSelect: "none" }}>{"←"}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: T.text, minWidth: 90, textAlign: "center" }}>{m.month.split(" ")[0]}</span>
          <span onClick={() => setMonthIdx(Math.min(history.length - 1, monthIdx + 1))} style={{ cursor: monthIdx < history.length - 1 ? "pointer" : "default", color: monthIdx < history.length - 1 ? T.textMuted : T.textDim + "40", fontSize: 12, userSelect: "none" }}>{"→"}</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
        {[
          { label: "Planowane", v: m.planned, c: T.primary },
          { label: "Zrealizowane", v: m.done, c: T.success },
          { label: "Odwołane", v: m.cancelled, c: T.danger },
          { label: "No-show", v: m.noShow, c: T.secondary },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center", background: T.bg, borderRadius: 6, padding: "6px 4px" }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 7, color: T.textDim }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: T.tertiary + "10", borderRadius: 8, padding: "8px 12px", border: "1px solid " + T.tertiary + "20" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 8, color: T.textDim }}>{"Wypłata brutto"}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: T.tertiary, fontFamily: "Nunito, sans-serif" }}>{payout.toLocaleString("pl-PL") + " zł"}</div>
          </div>
          <div style={{ textAlign: "right", fontSize: 9, color: T.textDim }}>
            <div>{m.indivH + "h indyw. × " + m.rate + " zł"}</div>
            {m.groupH > 0 && <div>{m.groupH + "h grupa × " + m.rateG + " zł"}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function TutorCard({ tutor, expanded, onToggle }) {
  const [hov, setHov] = useState(false);
  const isAbsent = tutor.status === "absence";
  const statusLabel = { active: "Aktywny", absence: "Nieobecny" };
  const statusColor = { active: T.success, absence: T.danger };

  return (
    <div style={{ background: hov && !expanded ? T.surfaceHover : T.surface, borderRadius: 14, border: "1px solid " + (isAbsent ? T.danger + "25" : T.cardBorder), overflow: "hidden", transition: "all 0.15s", opacity: isAbsent ? 0.85 : 1 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>

      {/* Header row - always visible */}
      <div onClick={onToggle} style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
        {/* Avatar */}
        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: (isAbsent ? T.danger : T.primary) + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: isAbsent ? T.danger : T.primary }}>
          {tutor.id}
        </div>

        {/* Name + subjects + status */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.text, fontFamily: "Nunito, sans-serif" }}>{tutor.name}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: statusColor[tutor.status], background: statusColor[tutor.status] + "15", padding: "2px 8px", borderRadius: 50 }}>{statusLabel[tutor.status]}</span>
            {tutor.upcomingAbsence && <span style={{ fontSize: 9, fontWeight: 700, color: T.tertiary, background: T.tertiary + "12", padding: "2px 8px", borderRadius: 50 }}>{"Planowana nieob.: " + tutor.upcomingAbsence.dates}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            {tutor.subjects.map((s, i) => (
              <span key={i} style={{ fontSize: 9, fontWeight: 700, color: subjectColor[s], background: subjectColor[s] + "15", padding: "1px 7px", borderRadius: 50 }}>{s}</span>
            ))}
            <span style={{ fontSize: 10, color: T.textDim, marginLeft: 4 }}>{tutor.availSummary}</span>
          </div>
        </div>

        {/* Quick metrics */}
        <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: T.text, fontFamily: "Nunito, sans-serif" }}>{tutor.studentsIndiv + tutor.groupStudents}</div>
            <div style={{ fontSize: 8, color: T.textDim }}>{"uczniów"}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: T.primary, fontFamily: "Nunito, sans-serif" }}>{tutor.weekLessons}</div>
            <div style={{ fontSize: 8, color: T.textDim }}>{"lek./tydz."}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: tutor.entryRate >= 95 ? T.success : tutor.entryRate >= 85 ? T.tertiary : T.danger, fontFamily: "Nunito, sans-serif" }}>{tutor.entryRate + "%"}</div>
            <div style={{ fontSize: 8, color: T.textDim }}>{"wpisy"}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: T.tertiary, fontFamily: "Nunito, sans-serif" }}>{tutor.rate + " zł"}</div>
            <div style={{ fontSize: 8, color: T.textDim }}>{"stawka/h"}</div>
          </div>
        </div>

        <span style={{ fontSize: 12, color: T.textDim, transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block", flexShrink: 0, marginLeft: 4 }}>{"▼"}</span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop: "1px solid " + T.cardBorder, animation: "fadeIn 0.15s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>

            {/* Col 1: Dane + stawki */}
            <div style={{ padding: "16px 18px", borderRight: "1px solid " + T.cardBorder }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 10 }}>{"Dane kontaktowe"}</div>
              {[
                { label: "Telefon", value: tutor.phone },
                { label: "Email", value: tutor.email },
              ].map((d, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 8, color: T.textDim, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{d.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{d.value}</div>
                </div>
              ))}
              <div style={{ borderTop: "1px solid " + T.cardBorder, marginTop: 10, paddingTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 8 }}>Stawki</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div><div style={{ fontSize: 8, color: T.textDim }}>{"Indywidualnie"}</div><div style={{ fontSize: 14, fontWeight: 900, color: T.tertiary }}>{tutor.rate + " zł/h"}</div></div>
                  <div><div style={{ fontSize: 8, color: T.textDim }}>{"Grupa"}</div><div style={{ fontSize: 14, fontWeight: 900, color: T.tertiary }}>{tutor.rateGroup + " zł/h"}</div></div>
                </div>
              </div>
              <MonthlyStats tutorId={tutor.id} rate={tutor.rate} rateGroup={tutor.rateGroup} />
            </div>

            {/* Col 2: Uczniowie */}
            <div style={{ padding: "16px 18px", borderRight: "1px solid " + T.cardBorder }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.text }}>{"Uczniowie (" + tutor.students.length + ")"}</div>
                <span style={{ fontSize: 9, color: T.textDim }}>{tutor.studentsIndiv + " indyw. " + DOT + " " + tutor.groups + " grup"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 220, overflow: "auto" }}>
                {tutor.students.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", background: T.bg, borderRadius: 8, fontSize: 10 }}>
                    <span style={{ fontWeight: 700, color: T.text, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: subjectColor[s.subject], flexShrink: 0 }}>{s.subject.slice(0, 3).toUpperCase()}</span>
                    <span style={{ fontSize: 7, fontWeight: 800, color: levelColor[s.lvl] || T.textDim, background: (levelColor[s.lvl] || T.textDim) + "15", padding: "0 4px", borderRadius: 3, flexShrink: 0 }}>{s.lvl}</span>
                    <span style={{ fontSize: 8, color: T.textDim, flexShrink: 0 }}>{s.type === "grupa" ? "\ud83d\udc65" : ""}</span>
                    <span style={{ fontSize: 8, color: T.textDim, flexShrink: 0 }}>{s.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 3: Nieobecnosci + akcje */}
            <div style={{ padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 10 }}>{"Nieobecności"}</div>
              {tutor.absences.length === 0 ? (
                <div style={{ fontSize: 10, color: T.textDim, padding: "8px 0" }}>{"Brak nieobecności w tym miesiącu"}</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {tutor.absences.map((a, i) => {
                    const typeLabel = { sick: "Choroba", vacation: "Urlop", personal: "Osobiste" };
                    const typeColor = { sick: T.danger, vacation: T.primary, personal: T.tertiary };
                    const statusLbl = { resolved: "Rozliczona", active: "Trwa", approved: "Zatwierdzona" };
                    const statusClr = { resolved: T.textDim, active: T.danger, approved: T.success };
                    return (
                      <div key={i} style={{ background: T.bg, borderRadius: 8, padding: "8px 10px", borderLeft: "3px solid " + (typeColor[a.type] || T.textDim) }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: typeColor[a.type] }}>{typeLabel[a.type]}</span>
                          <span style={{ fontSize: 8, fontWeight: 700, color: statusClr[a.status], background: statusClr[a.status] + "15", padding: "1px 6px", borderRadius: 50 }}>{statusLbl[a.status]}</span>
                        </div>
                        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>{a.dates + " (" + a.days + " dni, " + a.lessonsAffected + " lekcji)"}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ borderTop: "1px solid " + T.cardBorder, marginTop: 14, paddingTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 10 }}>Akcje</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { label: "Zgłoś nieobecność", color: T.danger },
                    { label: "Edytuj dostępność", color: T.tertiary },
                    { label: "Zmień stawki", color: T.accent },
                    { label: "Wyślij wiadomość", color: T.cyan },
                  ].map((a, i) => (
                    <button key={i} style={{ width: "100%", padding: "7px", fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 7, border: "none", cursor: "pointer", background: a.color + "12", color: a.color, transition: "all 0.12s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = a.color; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = a.color + "12"; e.currentTarget.style.color = a.color; }}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminTutors() {
  const [collapsed, setCollapsed] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");

  const allSubjects = [...new Set(tutors.flatMap(t => t.subjects))];
  const filtered = tutors.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === "all" || t.subjects.includes(filterSubject);
    return matchSearch && matchSubject;
  });

  const totalStudents = tutors.reduce((s, t) => s + t.studentsIndiv + t.groupStudents, 0);
  const totalWeekLessons = tutors.reduce((s, t) => s + t.weekLessons, 0);
  const absentCount = tutors.filter(t => t.status === "absence").length;

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, fontFamily: "Nunito, sans-serif", color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.cardBorder}; border-radius: 50px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{ height: 48, background: T.bgAlt, borderBottom: "1px solid " + T.cardBorder, display: "flex", alignItems: "center", padding: "0 20px", flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: T.text, fontFamily: "Nunito, sans-serif" }}>Korepetytorzy</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", cursor: "pointer" }}><span style={{ fontSize: 15 }}>{"\ud83d\udd14"}</span><span style={{ position: "absolute", top: -3, right: -5, fontSize: 7, fontWeight: 800, color: "#fff", background: T.danger, borderRadius: 50, width: 13, height: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>7</span></div>
            <div style={{ width: 26, height: 26, borderRadius: 50, background: T.tertiary + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: T.tertiary, cursor: "pointer" }}>AD</div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
          {/* Summary strip */}
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            {[
              { label: "Korepetytorzy", v: tutors.length, c: T.text },
              { label: "Aktywni", v: tutors.length - absentCount, c: T.success },
              { label: "Nieobecni", v: absentCount, c: T.danger },
              { label: "Uczniów łącznie", v: totalStudents, c: T.cyan },
              { label: "Lekcji / tydzień", v: totalWeekLessons, c: T.primary },
            ].map((s, i) => (
              <div key={i} style={{ background: T.surface, borderRadius: 10, padding: "10px 16px", border: "1px solid " + T.cardBorder, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: s.c, fontFamily: "Nunito, sans-serif" }}>{s.v}</span>
                <span style={{ fontSize: 10, color: T.textDim }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={"Szukaj korepetytora..."}
              style={{ fontSize: 12, fontFamily: "Nunito, sans-serif", padding: "7px 14px", borderRadius: 8, border: "1px solid " + T.cardBorder, background: T.surface, color: T.text, outline: "none", width: 240 }} />
            <div style={{ display: "flex", background: T.surface, borderRadius: 8, padding: 2, gap: 2 }}>
              <button onClick={() => setFilterSubject("all")} style={{ fontSize: 10, fontWeight: filterSubject === "all" ? 800 : 500, fontFamily: "Nunito, sans-serif", padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: filterSubject === "all" ? T.primary : "transparent", color: filterSubject === "all" ? "#fff" : T.textMuted }}>Wszyscy</button>
              {allSubjects.map(s => (
                <button key={s} onClick={() => setFilterSubject(s)} style={{ fontSize: 10, fontWeight: filterSubject === s ? 800 : 500, fontFamily: "Nunito, sans-serif", padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: filterSubject === s ? (subjectColor[s] || T.primary) : "transparent", color: filterSubject === s ? "#fff" : T.textMuted }}>{s}</button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <button style={{ fontSize: 11, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: T.primary, color: "#fff" }}>{"+ Dodaj korepetytora"}</button>
          </div>

          {/* Tutor list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(t => (
              <TutorCard key={t.id} tutor={t} expanded={expandedId === t.id}
                onToggle={() => setExpandedId(expandedId === t.id ? null : t.id)} />
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: T.textDim, fontSize: 13 }}>{"Brak korepetytorów spełniających kryteria"}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
