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
const levelColor = { "SP": T.cyan, "E8": T.tertiary, "ŚR": T.primary, "ŚR★": T.accent, "EM": T.danger, "EM★": T.pink };
const payStatusColor = { paid: T.success, pending: T.tertiary, overdue: T.danger };
const payStatusLabel = { paid: "Opłacone", pending: "Oczekuje", overdue: "Zaległość" };

const students = [
  { id: "S01", name: "Kacper Nowak", parent: "Marek Nowak", phone: "601 111 222", email: "marek.nowak@mail.pl",
    lvl: "ŚR", contractStart: "01.09.2025", monthlyFee: 880,
    subjects: [
      { subject: "Matematyka", tutor: "Tomasz Krawczyk", tutorId: "TK", hours: "Pon+Czw 9:00", room: "Sala 1", type: "indyw." },
      { subject: "Matematyka", tutor: "Piotr Adamczyk", tutorId: "PA", hours: "Wt 15:15, Czw 17:00", room: "Sala 4", type: "indyw." },
      { subject: "Angielski", tutor: "Anna Nowak", tutorId: "AN", hours: "Wt 10:00", room: "Sala 2", type: "indyw." },
    ],
    lessonsPerMonth: 20, contractMonths: 10, totalRealized: 182, totalCancelled: 8, totalNoShow: 3, madeUp: 6, pendingMakeup: 2, attendance: 96, payStatus: "paid", lateCount: 0 },
  { id: "S02", name: "Julia Kowalska", parent: "Anna Kowalska", phone: "602 222 333", email: "anna.kow@mail.pl",
    lvl: "E8", contractStart: "15.09.2025", monthlyFee: 1360,
    subjects: [
      { subject: "Matematyka", tutor: "Tomasz Krawczyk", tutorId: "TK", hours: "Pon+Śr 9:00", room: "Sala 1", type: "indyw." },
      { subject: "Chemia", tutor: "Karol Wiśniewski", tutorId: "KW", hours: "Czw 17:00", room: "Sala 3", type: "indyw." },
      { subject: "Angielski", tutor: "Anna Nowak", tutorId: "AN", hours: "Pon+Śr 10:00", room: "Sala 2", type: "indyw." },
    ],
    lessonsPerMonth: 20, contractMonths: 9, totalRealized: 164, totalCancelled: 6, totalNoShow: 2, madeUp: 4, pendingMakeup: 2, attendance: 95, payStatus: "pending", lateCount: 1 },
  { id: "S03", name: "Tomek Zieliński", exceptions: [{date:"12.06",type:"odwołane",subject:"Fizyka",reason:"Choroba korepetytora"},{date:"5.06",type:"odrabianie",subject:"Polski",reason:"Odrobienie z 28.05"}], parent: "Ewa Zielińska", phone: "603 333 444", email: "ewa.ziel@mail.pl",
    lvl: "ŚR★", contractStart: "01.10.2025", monthlyFee: 1320,
    subjects: [
      { subject: "Fizyka", tutor: "Tomasz Krawczyk", tutorId: "TK", hours: "Pon+Śr 14:00", room: "Sala 1", type: "indyw." },
      { subject: "Polski", tutor: "Ewa Dąbrowska", tutorId: "ED", hours: "Wt 10:15", room: "Sala 3", type: "indyw." },
      { subject: "Angielski", tutor: "Anna Nowak", tutorId: "AN", hours: "Pon+Śr 11:15", room: "Sala 2", type: "indyw." },
    ],
    monthDone: 18, lessonsPerMonth: 20, contractMonths: 8, totalRealized: 142, totalCancelled: 10, totalNoShow: 4, madeUp: 8, pendingMakeup: 2, attendance: 91, payStatus: "paid", lateCount: 0 },
  { id: "S04", name: "Alicja Wiśniewska", exceptions: [{date:"18.06",type:"no-show",subject:"Angielski",reason:""},{date:"10.06",type:"zmiana sali",subject:"Fizyka",reason:"Sala 1 → Sala 3"}], parent: "Joanna Wiśniewska", phone: "604 444 555", email: "j.wisniewska@mail.pl",
    lvl: "EM★", contractStart: "01.09.2025", monthlyFee: 1560,
    subjects: [
      { subject: "Fizyka", tutor: "Tomasz Krawczyk", tutorId: "TK", hours: "Wt+Śr 10:15", room: "Sala 1", type: "indyw." },
      { subject: "Matematyka", tutor: "Tomasz Krawczyk", tutorId: "TK", hours: "Pt 13:00", room: "Sala 1", type: "indyw." },
      { subject: "Angielski", tutor: "Marta Zielińska", tutorId: "MZ", hours: "Pon+Śr 12:00", room: "Sala 2", type: "indyw." },
      { subject: "Angielski", tutor: "Anna Nowak", tutorId: "AN", hours: "Wt 11:15", room: "Sala 2", type: "indyw." },
    ],
    monthDone: 22, lessonsPerMonth: 24, contractMonths: 10, totalRealized: 218, totalCancelled: 8, totalNoShow: 4, madeUp: 5, pendingMakeup: 3, attendance: 95, payStatus: "overdue", lateCount: 2 },
  { id: "S05", name: "Michał Lis", parent: "Tomasz Lis", phone: "605 555 666", email: "t.lis@mail.pl",
    lvl: "SP", contractStart: "01.02.2026", monthlyFee: 680,
    subjects: [
      { subject: "Angielski", tutor: "Marta Zielińska", tutorId: "MZ", hours: "Pon+Czw 16:00", room: "Sala 2", type: "indyw." },
      { subject: "Chemia", tutor: "Karol Wiśniewski", tutorId: "KW", hours: "Śr 11:15", room: "Sala 3", type: "indyw." },
    ],
    lessonsPerMonth: 12, contractMonths: 5, totalRealized: 52, totalCancelled: 3, totalNoShow: 2, madeUp: 2, pendingMakeup: 1, attendance: 91, payStatus: "pending", lateCount: 0 },
  { id: "S06", name: "Jan Kowalczyk", parent: "Robert Kowalczyk", phone: "606 666 777", email: "r.kowalczyk@mail.pl",
    lvl: "ŚR", contractStart: "15.10.2025", monthlyFee: 1080,
    subjects: [
      { subject: "Matematyka", tutor: "Tomasz Krawczyk", tutorId: "TK", hours: "Wt 14:00", room: "Sala 1", type: "indyw." },
      { subject: "Chemia", tutor: "Karol Wiśniewski", tutorId: "KW", hours: "Pon+Śr 10:00", room: "Sala 3", type: "indyw." },
      { subject: "Elektrotechnika", tutor: "Piotr Adamczyk", tutorId: "PA", hours: "Pt 17:00", room: "Sala 4", type: "indyw." },
    ],
    lessonsPerMonth: 16, contractMonths: 8, totalRealized: 116, totalCancelled: 4, totalNoShow: 3, madeUp: 3, pendingMakeup: 1, attendance: 94, payStatus: "paid", lateCount: 0 },
  { id: "S07", name: "Ola Zielińska", parent: "Ewa Zielińska", phone: "603 333 444", email: "ewa.ziel@mail.pl",
    lvl: "ŚR", contractStart: "01.09.2025", monthlyFee: 620,
    subjects: [
      { subject: "Chemia", tutor: "Karol Wiśniewski", tutorId: "KW", hours: "Śr 13:00, Pt 10:00", room: "Sala 3", type: "indyw." },
      { subject: "Elektrotechnika", tutor: "Piotr Adamczyk", tutorId: "PA", hours: "Wt 14:00, Czw 15:00", room: "Sala 4", type: "indyw." },
    ],
    lessonsPerMonth: 16, contractMonths: 10, totalRealized: 146, totalCancelled: 6, totalNoShow: 2, madeUp: 5, pendingMakeup: 1, attendance: 95, payStatus: "paid", lateCount: 0 },
  { id: "S08", name: "Ola Wiśniewska", parent: "Joanna Wiśniewska", phone: "604 444 555", email: "j.wisniewska@mail.pl",
    lvl: "SP", contractStart: "01.11.2025", monthlyFee: 520,
    subjects: [
      { subject: "Polski", tutor: "Ewa Dąbrowska", tutorId: "ED", hours: "Pon+Czw 11:00", room: "Sala 4", type: "indyw." },
      { subject: "Angielski", tutor: "Marta Zielińska", tutorId: "MZ", hours: "Wt+Czw 9:00", room: "Sala 2", type: "indyw." },
    ],
    lessonsPerMonth: 16, contractMonths: 8, totalRealized: 118, totalCancelled: 4, totalNoShow: 1, madeUp: 3, pendingMakeup: 1, attendance: 96, payStatus: "paid", lateCount: 0 },
  { id: "S09", name: "Kasia Zielińska", parent: "Ewa Zielińska", phone: "603 333 444", email: "ewa.ziel@mail.pl",
    lvl: "ŚR★", contractStart: "01.09.2025", monthlyFee: 780,
    subjects: [
      { subject: "Polski", tutor: "Ewa Dąbrowska", tutorId: "ED", hours: "Wt 9:00, Pt 16:00", room: "Sala 3", type: "indyw." },
      { subject: "Angielski", tutor: "Ewa Dąbrowska", tutorId: "ED", hours: "Czw 13:00, Śr 14:15", room: "Sala 2", type: "indyw." },
    ],
    lessonsPerMonth: 16, contractMonths: 10, totalRealized: 144, totalCancelled: 8, totalNoShow: 2, madeUp: 6, pendingMakeup: 2, attendance: 94, payStatus: "paid", lateCount: 0 },
];

const groups = [
  { id: "G01", name: "Grupa A", subject: "Matematyka", lvl: "SP8", tutor: "Tomasz Krawczyk", tutorId: "TK",
    hours: "Pon 11:30", room: "Sala 1", ratePerStudent: 50, monthlyFeePerStudent: 200,
    members: ["Kacper Nowak", "Julia Kowalska", "Michał Lis"] },
  { id: "G02", name: "Grupa A", subject: "Angielski", lvl: "SP8", tutor: "Marta Zielińska", tutorId: "MZ",
    hours: "Czw+Sob 9:00", room: "Sala 2", ratePerStudent: 45, monthlyFeePerStudent: 360,
    members: ["Kacper Nowak", "Julia Kowalska", "Michał Lis"] },
  { id: "G03", name: "Grupa B", subject: "Angielski", lvl: "ŚR", tutor: "Marta Zielińska", tutorId: "MZ",
    hours: "Pon+Śr 10:00", room: "Sala 2", ratePerStudent: 45, monthlyFeePerStudent: 360,
    members: ["Tomek Zieliński", "Alicja Wiśniewska", "Ola Zielińska", "Jan Kowalczyk"] },
  { id: "G04", name: "Grupa C", subject: "Matematyka", lvl: "EM", tutor: "Piotr Adamczyk", tutorId: "PA",
    hours: "Wt+Czw 12:00", room: "Sala 4", ratePerStudent: 42, monthlyFeePerStudent: 336,
    members: ["Alicja Wiśniewska", "Kasia Zielińska", "Jan Kowalczyk", "Tomek Zieliński"] },
];

const sidebarItems = [
  { icon: "\ud83d\udcca", label: "Dashboard" },
  { icon: "\ud83d\udcc5", label: "Harmonogram" },
  { icon: "\ud83d\udc68\u200d\ud83c\udfeb", label: "Korepetytorzy" },
  { icon: "\ud83c\udf93", label: "Uczniowie i grupy", active: true },
  { icon: "\ud83d\udcb3", label: "Płatności", badge: 5 },
  { icon: "⚙\ufe0f", label: "Ustawienia" },
];



function ExceptionsList({ exceptions }) {
  const [expanded, setExpanded] = useState(false);
  const typeColor = { "odwołane": T.danger, "no-show": T.secondary, "odrabianie": T.accent, "zmiana sali": T.tertiary };
  return (
    <div style={{ marginTop: 10 }}>
      <button onClick={() => setExpanded(!expanded)} style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, background: "transparent", border: "none", cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>{"▼"}</span>
        {"Wyjątki i zmiany (" + exceptions.length + ")"}
      </button>
      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
          {exceptions.map((ex, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: T.bg, borderRadius: 6, borderLeft: "2px solid " + (typeColor[ex.type] || T.textDim), fontSize: 9 }}>
              <span style={{ fontWeight: 700, color: T.textDim, minWidth: 40 }}>{ex.date}</span>
              <span style={{ fontWeight: 700, color: typeColor[ex.type] || T.textDim }}>{ex.type}</span>
              <span style={{ color: T.textMuted }}>{ex.subject}</span>
              {ex.reason && <span style={{ color: T.textDim, fontStyle: "italic" }}>{ex.reason}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getStudentGroups(studentName) {
  return groups.filter(g => g.members.includes(studentName));
}

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

function StudentCard({ s, expanded, onToggle }) {
  const [hov, setHov] = useState(false);
  const pc = payStatusColor[s.payStatus]; const pl = payStatusLabel[s.payStatus];
  return (
    <div style={{ background: hov && !expanded ? T.surfaceHover : T.surface, borderRadius: 14, border: "1px solid " + T.cardBorder, overflow: "hidden", transition: "all 0.15s" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div onClick={onToggle} style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: T.cyan + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: T.cyan }}>
          {s.name.split(" ").map(w => w[0]).join("")}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: "Nunito, sans-serif" }}>{s.name}</span>
            <span style={{ fontSize: 7, fontWeight: 800, color: levelColor[s.lvl] || T.textDim, background: (levelColor[s.lvl] || T.textDim) + "15", padding: "1px 5px", borderRadius: 3 }}>{s.lvl}</span>
            <span style={{ fontSize: 8, fontWeight: 700, color: pc, background: pc + "15", padding: "1px 7px", borderRadius: 50 }}>{pl}</span>
            {s.lateCount > 0 && <span style={{ fontSize: 8, fontWeight: 700, color: s.lateCount >= 3 ? T.danger : T.tertiary }}>{s.lateCount + ". opóźnienie"}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
            {[...new Set(s.subjects.map(x => x.subject))].map((subj, i) => (
              <span key={i} style={{ fontSize: 8, fontWeight: 700, color: subjectColor[subj], background: subjectColor[subj] + "15", padding: "1px 6px", borderRadius: 50 }}>{subj}</span>
            ))}
            <span style={{ fontSize: 9, color: T.textDim, marginLeft: 4 }}>{"Rodzic: " + s.parent}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 15, fontWeight: 900, color: T.primary }}>{s.lessonsPerMonth}</div><div style={{ fontSize: 7, color: T.textDim }}>{"lek/msc"}</div></div>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 15, fontWeight: 900, color: s.attendance >= 95 ? T.success : s.attendance >= 85 ? T.tertiary : T.danger }}>{s.attendance + "%"}</div><div style={{ fontSize: 7, color: T.textDim }}>{"frekw."}</div></div>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 15, fontWeight: 900, color: T.tertiary }}>{s.monthlyFee + " zł"}</div><div style={{ fontSize: 7, color: T.textDim }}>{"msc"}</div></div>
        </div>
        <span style={{ fontSize: 11, color: T.textDim, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block", flexShrink: 0 }}>{"▼"}</span>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid " + T.cardBorder, display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 0, animation: "fadeIn 0.15s ease" }}>
          {/* Dane + umowa */}
          <div style={{ padding: "14px 16px", borderRight: "1px solid " + T.cardBorder }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 8 }}>{"Dane kontaktowe"}</div>
            {[{ l: "Rodzic", v: s.parent }, { l: "Telefon", v: s.phone }, { l: "Email", v: s.email }].map((d, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 7, color: T.textDim, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{d.l}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{d.v}</div>
              </div>
            ))}
            <div style={{ borderTop: "1px solid " + T.cardBorder, marginTop: 8, paddingTop: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 6 }}>Umowa</div>
              <div style={{ display: "flex", gap: 12 }}>
                <div><div style={{ fontSize: 7, color: T.textDim }}>{"Od"}</div><div style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{s.contractStart}</div></div>
                <div><div style={{ fontSize: 7, color: T.textDim }}>{"Opłata msc"}</div><div style={{ fontSize: 14, fontWeight: 900, color: T.tertiary }}>{s.monthlyFee + " zł"}</div></div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid " + T.cardBorder, marginTop: 8, paddingTop: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 6 }}>{"Statystyki umowy (" + s.contractMonths + " msc)"}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5 }}>
                {[
                  { l: "Wg umowy/msc", v: s.lessonsPerMonth, c: T.text },
                  { l: "Zrealizowane", v: s.totalRealized, c: T.success },
                  { l: "Odwołane", v: s.totalCancelled, c: T.danger },
                  { l: "No-show", v: s.totalNoShow, c: T.secondary },
                  { l: "Odrobione", v: s.madeUp || 0, c: T.accent },
                  { l: "Do odrobienia", v: s.pendingMakeup || 0, c: s.pendingMakeup > 0 ? T.tertiary : T.textDim },
                  { l: "Oczekiwane łącznie", v: s.lessonsPerMonth * s.contractMonths, c: T.primary },
                  { l: "Frekwencja", v: s.attendance + "%", c: s.attendance >= 95 ? T.success : T.tertiary },
                ].map((x, i) => (
                  <div key={i} style={{ background: T.bg, borderRadius: 6, padding: "5px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: x.c }}>{x.v}</div>
                    <div style={{ fontSize: 7, color: T.textDim }}>{x.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stały harmonogram */}
          <div style={{ padding: "14px 16px", borderRight: "1px solid " + T.cardBorder, minWidth: 200 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.text }}>{"Stały harmonogram zajęć"}</div>
                <span style={{ fontSize: 8, color: T.textDim }}>{"Regularne wg umowy"}</span>
              </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {s.subjects.map((sub, i) => (
                <div key={i} style={{ background: T.bg, borderRadius: 8, padding: "8px 10px", borderLeft: "3px solid " + (subjectColor[sub.subject] || T.textDim) }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: subjectColor[sub.subject] }}>{sub.subject}</span>
                    <span style={{ fontSize: 7, fontWeight: 700, color: T.textDim }}>{sub.type}</span>
                  </div>
                  <div style={{ fontSize: 10, color: T.text, marginTop: 3, fontWeight: 600 }}>{sub.tutor}</div>
                  <div style={{ fontSize: 9, color: T.textDim, marginTop: 2 }}>{sub.hours + " " + DOT + " " + sub.room}</div>
                </div>
              ))}
              {(() => {
                const sg = getStudentGroups(s.name);
                if (sg.length === 0) return null;
                return (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: T.text, marginBottom: 6 }}>{"Grupy (" + sg.length + ")"}</div>
                    {sg.map((g, gi) => (
                      <div key={gi} style={{ background: T.accent + "08", borderRadius: 8, padding: "8px 10px", borderLeft: "3px solid " + T.accent, marginBottom: 4 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: 10 }}>{"👥"}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: T.accent }}>{g.name}</span>
                            <span style={{ fontSize: 9, fontWeight: 700, color: subjectColor[g.subject] }}>{g.subject}</span>
                            <span style={{ fontSize: 7, fontWeight: 800, color: levelColor[g.lvl] || T.textDim, background: (levelColor[g.lvl] || T.textDim) + "15", padding: "0 4px", borderRadius: 3 }}>{g.lvl}</span>
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 800, color: T.tertiary }}>{g.monthlyFeePerStudent + " zł/msc"}</span>
                        </div>
                        <div style={{ fontSize: 9, color: T.textDim, marginTop: 2 }}>{g.tutor + " " + DOT + " " + g.hours + " " + DOT + " " + g.room + " " + DOT + " " + g.members.length + " os."}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              {s.exceptions && s.exceptions.length > 0 && (
                <ExceptionsList exceptions={s.exceptions} />
              )}
            </div>
          </div>

          {/* Płatności + akcje */}
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 8 }}>{"Płatności"}</div>
            {(() => {
              const sg = getStudentGroups(s.name);
              const groupFee = sg.reduce((sum, g) => sum + g.monthlyFeePerStudent, 0);
              const indivFee = s.monthlyFee - groupFee;
              return (
                <div style={{ background: pc + "08", borderRadius: 8, padding: "10px 12px", border: "1px solid " + pc + "20", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: pc }}>{pl}</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: pc }}>{s.monthlyFee + " zł"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 9, color: T.textDim }}>
                    <span>{"Indywidualnie: " + indivFee + " zł"}</span>
                    {groupFee > 0 && <span>{"Grupy: " + groupFee + " zł"}</span>}
                  </div>
                  {sg.length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {sg.map((g, gi) => (
                        <span key={gi} style={{ fontSize: 8, color: T.accent, background: T.accent + "12", padding: "1px 6px", borderRadius: 4 }}>
                          {g.name + " " + g.subject.slice(0,3) + ": " + g.monthlyFeePerStudent + " zł"}
                        </span>
                      ))}
                    </div>
                  )}
                  {s.lateCount > 0 && <div style={{ fontSize: 9, color: T.danger, marginTop: 6, fontWeight: 700 }}>{s.lateCount + ". opóźnienie z kolei"}</div>}
                  <div style={{ fontSize: 8, color: T.textDim, marginTop: 4 }}>{"Termin: do 10. dnia miesiąca"}</div>
                </div>
              );
            })()}

            <div style={{ borderTop: "1px solid " + T.cardBorder, paddingTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 8 }}>Akcje</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[
                  { label: "Edytuj dane", color: T.primary },
                  { label: "Dodaj zajęcia", color: T.success },
                  { label: "Zakończ umowę", color: T.danger },
                  { label: "Wyślij wiadomość do rodzica", color: T.cyan },
                ].map((a, i) => (
                  <button key={i} style={{ width: "100%", padding: "6px", fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 7, border: "none", cursor: "pointer", background: a.color + "12", color: a.color, transition: "all 0.12s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = a.color; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = a.color + "12"; e.currentTarget.style.color = a.color; }}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupCard({ g }) {
  const [expanded, setExpanded] = useState(false);
  const [hov, setHov] = useState(false);
  const col = subjectColor[g.subject] || T.textDim;
  return (
    <div style={{ background: hov && !expanded ? T.surfaceHover : T.surface, borderRadius: 14, border: "1px solid " + T.cardBorder, overflow: "hidden", transition: "all 0.15s" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div onClick={() => setExpanded(!expanded)} style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: col + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: col }}>
          {"\ud83d\udc65"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{g.name}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: col, background: col + "15", padding: "1px 7px", borderRadius: 50 }}>{g.subject}</span>
            <span style={{ fontSize: 7, fontWeight: 800, color: levelColor[g.lvl] || T.textDim, background: (levelColor[g.lvl] || T.textDim) + "15", padding: "1px 5px", borderRadius: 3 }}>{g.lvl}</span>
          </div>
          <div style={{ fontSize: 10, color: T.textDim, marginTop: 3 }}>{g.tutor + " " + DOT + " " + g.hours + " " + DOT + " " + g.room}</div>
        </div>
        <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 15, fontWeight: 900, color: T.text }}>{g.members.length}</div><div style={{ fontSize: 7, color: T.textDim }}>{"osób"}</div></div>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 15, fontWeight: 900, color: T.tertiary }}>{g.monthlyFeePerStudent + " zł"}</div><div style={{ fontSize: 7, color: T.textDim }}>{"os/msc"}</div></div>
        </div>
        <span style={{ fontSize: 11, color: T.textDim, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block", flexShrink: 0 }}>{"▼"}</span>
      </div>
      {expanded && (
        <div style={{ borderTop: "1px solid " + T.cardBorder, padding: "12px 16px 14px 68px", animation: "fadeIn 0.15s ease" }}>
          <div style={{ display: "flex", gap: 20 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: T.text, marginBottom: 6 }}>{"Członkowie"}</div>
              {g.members.map((m, i) => (
                <div key={i} style={{ fontSize: 11, color: T.text, padding: "3px 0", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: T.textDim }}>{(i + 1) + "."}</span>
                  <span style={{ fontWeight: 600 }}>{m}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: T.text, marginBottom: 6 }}>{"Szczegóły"}</div>
              {[
                { l: "Korepetytor", v: g.tutor },
                { l: "Termin", v: g.hours },
                { l: "Sala", v: g.room },
                { l: "Stawka/os.", v: g.ratePerStudent + " zł/h" },
                { l: "Opłata msc/os.", v: g.monthlyFeePerStudent + " zł" },
              ].map((d, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 7, color: T.textDim, fontWeight: 600, textTransform: "uppercase" }}>{d.l}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{d.v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginLeft: "auto" }}>
              {[
                { label: "Edytuj grupę", color: T.primary },
                { label: "Dodaj członka", color: T.success },
                { label: "Rozwiąż grupę", color: T.danger },
              ].map((a, i) => (
                <button key={i} style={{ padding: "6px 14px", fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 7, border: "none", cursor: "pointer", background: a.color + "12", color: a.color, transition: "all 0.12s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = a.color; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = a.color + "12"; e.currentTarget.style.color = a.color; }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminStudents() {
  const [collapsed, setCollapsed] = useState(true);
  const [tab, setTab] = useState("students");
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterPay, setFilterPay] = useState("all");

  const allSubjects = [...new Set(students.flatMap(s => s.subjects.map(x => x.subject)))];
  const filteredStudents = students.filter(s => {
    const ms = s.name.toLowerCase().includes(search.toLowerCase()) || s.parent.toLowerCase().includes(search.toLowerCase());
    const mSub = filterSubject === "all" || s.subjects.some(x => x.subject === filterSubject);
    const mPay = filterPay === "all" || s.payStatus === filterPay;
    return ms && mSub && mPay;
  });

  const paid = students.filter(s => s.payStatus === "paid").length;
  const pending = students.filter(s => s.payStatus === "pending").length;
  const overdue = students.filter(s => s.payStatus === "overdue").length;

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
        <div style={{ height: 48, background: T.bgAlt, borderBottom: "1px solid " + T.cardBorder, display: "flex", alignItems: "center", padding: "0 20px", flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: T.text, fontFamily: "Nunito, sans-serif" }}>{"Uczniowie i grupy"}</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", cursor: "pointer" }}><span style={{ fontSize: 15 }}>{"\ud83d\udd14"}</span><span style={{ position: "absolute", top: -3, right: -5, fontSize: 7, fontWeight: 800, color: "#fff", background: T.danger, borderRadius: 50, width: 13, height: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>7</span></div>
            <div style={{ width: 26, height: 26, borderRadius: 50, background: T.tertiary + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: T.tertiary, cursor: "pointer" }}>AD</div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
          {/* Summary */}
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            {[
              { label: "Uczniów", v: students.length, c: T.text },
              { label: "Grup", v: groups.length, c: T.accent },
              { label: "Opłacone", v: paid, c: T.success },
              { label: "Oczekuje", v: pending, c: T.tertiary },
              { label: "Zaległości", v: overdue, c: T.danger },
            ].map((s, i) => (
              <div key={i} style={{ background: T.surface, borderRadius: 10, padding: "8px 14px", border: "1px solid " + T.cardBorder, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: s.c }}>{s.v}</span>
                <span style={{ fontSize: 9, color: T.textDim }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Tab + filters */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", background: T.surface, borderRadius: 8, padding: 2, gap: 2 }}>
              {[["students", "Uczniowie (" + students.length + ")"], ["groups", "Grupy (" + groups.length + ")"]].map(([k, lb]) => (
                <button key={k} onClick={() => setTab(k)} style={{ fontSize: 11, fontWeight: tab === k ? 800 : 500, fontFamily: "Nunito, sans-serif", padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", background: tab === k ? T.primary : "transparent", color: tab === k ? "#fff" : T.textMuted, transition: "all 0.12s" }}>{lb}</button>
              ))}
            </div>
            {tab === "students" && (<>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={"Szukaj ucznia lub rodzica..."}
                style={{ fontSize: 11, fontFamily: "Nunito, sans-serif", padding: "6px 12px", borderRadius: 8, border: "1px solid " + T.cardBorder, background: T.surface, color: T.text, outline: "none", width: 220 }} />
              <div style={{ display: "flex", background: T.surface, borderRadius: 8, padding: 2, gap: 2 }}>
                <button onClick={() => setFilterSubject("all")} style={{ fontSize: 9, fontWeight: filterSubject === "all" ? 800 : 500, fontFamily: "Nunito, sans-serif", padding: "4px 8px", borderRadius: 6, border: "none", cursor: "pointer", background: filterSubject === "all" ? T.primary : "transparent", color: filterSubject === "all" ? "#fff" : T.textMuted }}>Wszystkie</button>
                {allSubjects.map(sub => (
                  <button key={sub} onClick={() => setFilterSubject(sub)} style={{ fontSize: 9, fontWeight: filterSubject === sub ? 800 : 500, fontFamily: "Nunito, sans-serif", padding: "4px 8px", borderRadius: 6, border: "none", cursor: "pointer", background: filterSubject === sub ? (subjectColor[sub] || T.primary) : "transparent", color: filterSubject === sub ? "#fff" : T.textMuted }}>{sub}</button>
                ))}
              </div>
              <div style={{ display: "flex", background: T.surface, borderRadius: 8, padding: 2, gap: 2 }}>
                {[["all","Wszyscy"],["paid","Opłacone"],["pending","Oczekuje"],["overdue","Zaległe"]].map(([k,lb]) => (
                  <button key={k} onClick={() => setFilterPay(k)} style={{ fontSize: 9, fontWeight: filterPay === k ? 800 : 500, fontFamily: "Nunito, sans-serif", padding: "4px 8px", borderRadius: 6, border: "none", cursor: "pointer", background: filterPay === k ? (payStatusColor[k] || T.primary) : "transparent", color: filterPay === k ? "#fff" : T.textMuted }}>{lb}</button>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <button style={{ fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: T.primary, color: "#fff" }}>{"+ Dodaj ucznia"}</button>
            </>)}
            {tab === "groups" && (<>
              <div style={{ flex: 1 }} />
              <button style={{ fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: T.accent, color: "#fff" }}>{"+ Nowa grupa"}</button>
            </>)}
          </div>

          {/* Content */}
          {tab === "students" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredStudents.map(s => (
                <StudentCard key={s.id} s={s} expanded={expandedId === s.id} onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)} />
              ))}
              {filteredStudents.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: T.textDim }}>{"Brak uczniów spełniających kryteria"}</div>}
            </div>
          )}
          {tab === "groups" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {groups.map(g => <GroupCard key={g.id} g={g} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
