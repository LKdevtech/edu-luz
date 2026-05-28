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


const subjectAbbr = { "Matematyka": "MAT", "Angielski": "ANG", "Fizyka": "FIZ", "Chemia": "CHE", "Polski": "POL", "Elektrotechnika": "ELE" };
const levelColor = { "SP": T.cyan, "E8": T.tertiary, "ŚR": T.primary, "ŚR★": T.accent, "EM": T.danger, "EM★": T.pink };

const subjectColor = { "Matematyka": T.primary, "Angielski": T.cyan, "Fizyka": "#F59E0B", "Chemia": T.success, "Polski": T.pink, "Elektrotechnika": T.secondary };

const STATUS = {
  "done":         { symbol: "✓", label: "Zrealizowana (z wpisem)", color: T.success, bg: T.success+"15" },
  "done-no-note": { symbol: "✓", label: "Zrealizowana (brak wpisu)", color: T.tertiary, bg: T.tertiary+"12" },
  "active":       { symbol: "●", label: "W trakcie", color: T.tertiary, bg: T.tertiary+"15" },
  "upcoming":     { symbol: "○", label: "Zaplanowana", color: T.primary, bg: T.primary+"12" },
  "cancelled":    { symbol: "✕", label: "Odwołana", color: T.danger, bg: T.danger+"12" },
  "no-show":      { symbol: "⊘", label: "No-show", color: T.secondary, bg: T.secondary+"12" },
  "makeup":       { symbol: "↻", label: "Odrabianie", color: T.accent, bg: T.accent+"12" },
};

const tutorsList = [
  { id: "TK", name: "Tomasz Krawczyk", subjects: ["Matematyka","Fizyka"] },
  { id: "MZ", name: "Marta Zielińska", subjects: ["Angielski"] },
  { id: "KW", name: "Karol Wiśniewski", subjects: ["Chemia"] },
  { id: "ED", name: "Ewa Dąbrowska", subjects: ["Polski","Angielski"] },
  { id: "PA", name: "Piotr Adamczyk", subjects: ["Matematyka","Elektrotechnika"] },
];

const roomsList = ["Sala 1", "Sala 2", "Sala 3", "Sala 4"];
const weekDays = ["Pon 16.06", "Wt 17.06", "Śr 18.06", "Czw 19.06", "Pt 20.06", "Sob 21.06"];
const weekDaysFull = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
const TODAY_IDX = 3;

/* Dostępność: null = wolny dzień, [[od,do], ...] = bloki godzinowe (możliwe przerwy) */
/* Dostępność: null = wolny dzień, [[od,do], ...] = bloki godzinowe */
const defaultAvailability = {
  "TK": [[[9,16]],[[9,16]],[[9,16]],[[9,16]],[[10,15]],null],
  "MZ": [[[9,14]],[[9,15]],[[10,13]],[[9,18]],[[14,18]],[[10,13]]],
  "KW": [[[10,13]],null,[[10,15]],[[15,18]],[[10,12]],null],
  "ED": [[[11,16]],[[9,13]],[[9,11],[13,16]],[[11,18]],[[16,18]],null],
  "PA": [null,[[12,17]],null,[[12,18]],[[15,19]],null],
};

const allLessons = [
  {day:0,tutor:"TK",room:"Sala 1",student:"Kacper Nowak",subject:"Matematyka",type:"indyw.",lvl:"ŚR",start:9,end:10,status:"done"},
  {day:0,tutor:"TK",room:"Sala 1",student:"Julia Kowalska",subject:"Matematyka",type:"indyw.",lvl:"E8",start:10.25,end:11.25,status:"done"},
  {day:0,tutor:"TK",room:"Sala 1",student:"Grupa A (3os.)",subject:"Matematyka",type:"grupa",lvl:"E8",start:11.5,end:13,status:"done-no-note"},
  {day:0,tutor:"TK",room:"Sala 1",student:"Tomek Zieliński",subject:"Fizyka",type:"indyw.",lvl:"ŚR★",start:14,end:15,status:"done"},
  {day:0,tutor:"MZ",room:"Sala 2",student:"Grupa B (4os.)",subject:"Angielski",type:"grupa",lvl:"ŚR",start:9,end:10.5,status:"done"},
  {day:0,tutor:"MZ",room:"Sala 2",student:"Alicja Wiśniewska",subject:"Angielski",type:"indyw.",lvl:"EM",start:11,end:12,status:"no-show"},
  {day:0,tutor:"MZ",room:"Sala 2",student:"Michał Lis",subject:"Angielski",type:"indyw.",lvl:"SP",start:12.25,end:13.25,status:"done"},
  {day:0,tutor:"KW",room:"Sala 3",student:"Jan Kowalczyk",subject:"Chemia",type:"indyw.",lvl:"ŚR",start:10,end:11,status:"done"},
  {day:0,tutor:"KW",room:"Sala 3",student:"Ola Zielińska",subject:"Chemia",type:"indyw.",lvl:"ŚR",start:11.25,end:12.25,status:"done"},
  {day:0,tutor:"ED",room:"Sala 4",student:"Ola Wiśniewska",subject:"Polski",type:"indyw.",lvl:"SP",start:11,end:12,status:"done"},
  {day:0,tutor:"ED",room:"Sala 4",student:"Kasia Zielińska",subject:"Polski",type:"indyw.",lvl:"ŚR★",start:12.25,end:13.25,status:"cancelled"},
  {day:0,tutor:"ED",room:"Sala 2",student:"Michał Lis",subject:"Angielski",type:"indyw.",lvl:"SP",start:14,end:15,status:"done"},
  {day:1,tutor:"TK",room:"Sala 1",student:"Kacper Nowak",subject:"Matematyka",type:"indyw.",lvl:"ŚR",start:9,end:10,status:"done"},
  {day:1,tutor:"TK",room:"Sala 1",student:"Alicja Wiśniewska",subject:"Fizyka",type:"indyw.",lvl:"EM★",start:10.25,end:11.25,status:"done-no-note"},
  {day:1,tutor:"TK",room:"Sala 1",student:"Grupa B (2os.)",subject:"Matematyka",type:"grupa",lvl:"ŚR",start:12,end:13.5,status:"done"},
  {day:1,tutor:"TK",room:"Sala 1",student:"Jan Kowalczyk",subject:"Matematyka",type:"indyw.",lvl:"ŚR",start:14,end:15,status:"done"},
  {day:1,tutor:"MZ",room:"Sala 2",student:"Ola Wiśniewska",subject:"Angielski",type:"indyw.",lvl:"SP",start:9,end:10,status:"done"},
  {day:1,tutor:"MZ",room:"Sala 2",student:"Grupa A (3os.)",subject:"Angielski",type:"grupa",lvl:"E8",start:10.25,end:11.75,status:"done"},
  {day:1,tutor:"MZ",room:"Sala 2",student:"Kasia Zielińska",subject:"Angielski",type:"indyw.",lvl:"ŚR★",start:12,end:13,status:"done"},
  {day:1,tutor:"MZ",room:"Sala 2",student:"Michał Lis",subject:"Angielski",type:"indyw.",lvl:"SP",start:13.25,end:14.25,status:"makeup"},
  {day:1,tutor:"ED",room:"Sala 3",student:"Julia Kowalska",subject:"Polski",type:"indyw.",lvl:"E8",start:9,end:10,status:"done"},
  {day:1,tutor:"ED",room:"Sala 3",student:"Ola Wiśniewska",subject:"Polski",type:"indyw.",lvl:"SP",start:10.25,end:11.25,status:"done"},
  {day:1,tutor:"ED",room:"Sala 3",student:"Tomek Zieliński",subject:"Polski",type:"indyw.",lvl:"ŚR",start:11.5,end:12.5,status:"done"},
  {day:1,tutor:"PA",room:"Sala 4",student:"Grupa C (4os.)",subject:"Matematyka",type:"grupa",lvl:"EM",start:12,end:13.5,status:"done"},
  {day:1,tutor:"PA",room:"Sala 4",student:"Ola Zielińska",subject:"Elektrotechnika",type:"indyw.",lvl:"ŚR",start:14,end:15,status:"done"},
  {day:1,tutor:"PA",room:"Sala 4",student:"Kacper Nowak",subject:"Matematyka",type:"indyw.",lvl:"ŚR",start:15.25,end:16.25,status:"done"},
  {day:2,tutor:"TK",room:"Sala 1",student:"Julia Kowalska",subject:"Matematyka",type:"indyw.",lvl:"E8",start:9,end:10,status:"done"},
  {day:2,tutor:"TK",room:"Sala 1",student:"Tomek Zieliński",subject:"Fizyka",type:"indyw.",lvl:"ŚR★",start:10.25,end:11.25,status:"no-show"},
  {day:2,tutor:"TK",room:"Sala 1",student:"Kacper Nowak",subject:"Matematyka",type:"indyw.",lvl:"ŚR",start:12,end:13,status:"done"},
  {day:2,tutor:"TK",room:"Sala 1",student:"Alicja Wiśniewska",subject:"Fizyka",type:"indyw.",lvl:"EM★",start:14,end:15,status:"done-no-note"},
  {day:2,tutor:"MZ",room:"Sala 2",student:"Grupa B (4os.)",subject:"Angielski",type:"grupa",lvl:"ŚR",start:10,end:11.5,status:"done"},
  {day:2,tutor:"MZ",room:"Sala 2",student:"Alicja Wiśniewska",subject:"Angielski",type:"indyw.",lvl:"EM",start:12,end:13,status:"done"},
  {day:2,tutor:"KW",room:"Sala 3",student:"Jan Kowalczyk",subject:"Chemia",type:"indyw.",lvl:"ŚR",start:10,end:11,status:"done"},
  {day:2,tutor:"KW",room:"Sala 3",student:"Michał Lis",subject:"Chemia",type:"indyw.",lvl:"SP",start:11.25,end:12.25,status:"done"},
  {day:2,tutor:"KW",room:"Sala 3",student:"Ola Zielińska",subject:"Chemia",type:"indyw.",lvl:"ŚR",start:13,end:14,status:"done"},
  {day:2,tutor:"ED",room:"Sala 4",student:"Kasia Zielińska",subject:"Angielski",type:"indyw.",lvl:"ŚR★",start:13,end:14,status:"done"},
  {day:2,tutor:"ED",room:"Sala 4",student:"Michał Lis",subject:"Angielski",type:"indyw.",lvl:"SP",start:14.25,end:15.25,status:"done"},
  {day:3,tutor:"TK",room:"Sala 1",student:"Kacper Nowak",subject:"Matematyka",type:"indyw.",lvl:"ŚR",start:9,end:10,status:"done"},
  {day:3,tutor:"TK",room:"Sala 1",student:"Julia Kowalska",subject:"Matematyka",type:"indyw.",lvl:"E8",start:10.25,end:11.25,status:"done"},
  {day:3,tutor:"TK",room:"Sala 1",student:"Tomek Zieliński",subject:"Fizyka",type:"indyw.",lvl:"ŚR★",start:13,end:14,status:"done"},
  {day:3,tutor:"TK",room:"Sala 1",student:"Kacper Nowak",subject:"Matematyka",type:"indyw.",lvl:"ŚR",start:14,end:15,status:"active"},
  {day:3,tutor:"TK",room:"Sala 1",student:"Grupa B (2os.)",subject:"Matematyka",type:"grupa",lvl:"ŚR",start:15.25,end:16.25,status:"upcoming"},
  {day:3,tutor:"MZ",room:"Sala 2",student:"Grupa A (3os.)",subject:"Angielski",type:"grupa",lvl:"E8",start:9,end:10.5,status:"done"},
  {day:3,tutor:"MZ",room:"Sala 2",student:"Kasia Zielińska",subject:"Angielski",type:"indyw.",lvl:"ŚR★",start:11,end:12,status:"done-no-note"},
  {day:3,tutor:"MZ",room:"Sala 2",student:"Alicja Wiśniewska",subject:"Angielski",type:"indyw.",lvl:"EM",start:14.25,end:15.25,status:"active"},
  {day:3,tutor:"MZ",room:"Sala 2",student:"Michał Lis",subject:"Angielski",type:"indyw.",lvl:"SP",start:16,end:17,status:"upcoming"},
  {day:3,tutor:"KW",room:"Sala 3",student:"Jan Kowalczyk",subject:"Chemia",type:"indyw.",lvl:"ŚR",start:15,end:16,status:"upcoming"},
  {day:3,tutor:"KW",room:"Sala 3",student:"Julia Kowalska",subject:"Chemia",type:"indyw.",lvl:"E8",start:17,end:18,status:"upcoming"},
  {day:3,tutor:"ED",room:"Sala 1",student:"Ola Wiśniewska",subject:"Polski",type:"indyw.",lvl:"SP",start:11.5,end:12.5,status:"done"},
  {day:3,tutor:"ED",room:"Sala 2",student:"Kasia Zielińska",subject:"Angielski",type:"indyw.",lvl:"ŚR★",start:13,end:14,status:"done"},
  {day:3,tutor:"ED",room:"Sala 1",student:"Alicja Wiśniewska",subject:"Polski",type:"indyw.",lvl:"EM",start:16.5,end:17.5,status:"upcoming"},
  {day:3,tutor:"PA",room:"Sala 4",student:"Grupa C (4os.)",subject:"Matematyka",type:"grupa",lvl:"EM",start:12,end:13.5,status:"done"},
  {day:3,tutor:"PA",room:"Sala 4",student:"Ola Zielińska",subject:"Elektrotechnika",type:"indyw.",lvl:"ŚR",start:15,end:16,status:"upcoming"},
  {day:3,tutor:"PA",room:"Sala 4",student:"Kacper Nowak",subject:"Matematyka",type:"indyw.",lvl:"ŚR",start:17,end:18,status:"upcoming"},
  {day:4,tutor:"TK",room:"Sala 1",student:"Julia Kowalska",subject:"Matematyka",type:"indyw.",lvl:"E8",start:10,end:11,status:"upcoming"},
  {day:4,tutor:"TK",room:"Sala 1",student:"Tomek Zieliński",subject:"Fizyka",type:"indyw.",lvl:"ŚR★",start:11.25,end:12.25,status:"upcoming"},
  {day:4,tutor:"TK",room:"Sala 1",student:"Alicja Wiśniewska",subject:"Matematyka",type:"indyw.",lvl:"EM★",start:13,end:14,status:"upcoming"},
  {day:4,tutor:"MZ",room:"Sala 2",student:"Ola Wiśniewska",subject:"Angielski",type:"indyw.",lvl:"SP",start:14,end:15,status:"upcoming"},
  {day:4,tutor:"MZ",room:"Sala 2",student:"Grupa B (4os.)",subject:"Angielski",type:"grupa",lvl:"ŚR",start:15.25,end:16.75,status:"upcoming"},
  {day:4,tutor:"MZ",room:"Sala 2",student:"Michał Lis",subject:"Angielski",type:"indyw.",lvl:"SP",start:17,end:18,status:"upcoming"},
  {day:4,tutor:"KW",room:"Sala 3",student:"Ola Zielińska",subject:"Chemia",type:"indyw.",lvl:"ŚR",start:10,end:11,status:"upcoming"},
  {day:4,tutor:"ED",room:"Sala 3",student:"Kasia Zielińska",subject:"Polski",type:"indyw.",lvl:"ŚR★",start:16,end:17,status:"upcoming"},
  {day:4,tutor:"PA",room:"Sala 4",student:"Kacper Nowak",subject:"Matematyka",type:"indyw.",lvl:"ŚR",start:15,end:16,status:"upcoming"},
  {day:4,tutor:"PA",room:"Sala 4",student:"Jan Kowalczyk",subject:"Elektrotechnika",type:"indyw.",lvl:"ŚR",start:17,end:18,status:"upcoming"},
  {day:5,tutor:"MZ",room:"Sala 2",student:"Grupa A (3os.)",subject:"Angielski",type:"grupa",lvl:"E8",start:10,end:11.5,status:"upcoming"},
  {day:5,tutor:"MZ",room:"Sala 2",student:"Alicja Wiśniewska",subject:"Angielski",type:"indyw.",lvl:"EM",start:12,end:13,status:"upcoming"},
];

const sidebarItems = [
  { icon: "📊", label: "Dashboard" },
  { icon: "📅", label: "Harmonogram", active: true },
  { icon: "👨‍🏫", label: "Korepetytorzy", badge: 1 },
  { icon: "🎓", label: "Uczniowie i grupy" },
  { icon: "💳", label: "Płatności", badge: 5 },
  { icon: "⚙️", label: "Ustawienia" },
];


function isAvailHour(ranges, h) {
  if (!ranges) return false;
  return ranges.some(([s, e]) => h >= s && h < e);
}
function fmtAvailRanges(ranges) {
  if (!ranges || ranges.length === 0) return "";
  return ranges.map(([s, e]) => s + ":00" + DASH + e + ":00").join(", ");
}

function fmtTime(dec) {
  const h = Math.floor(dec);
  const m = Math.round((dec - h) * 60);
  return h + ":" + String(m).padStart(2, "0");
}
function fmtRange(s, e) { return fmtTime(s) + DASH + fmtTime(e); }

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

function SB({ status, size }) {
  const s = STATUS[status];
  return s ? <span title={s.label} style={{ fontSize: size || 11, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.symbol}</span> : null;
}

function Legend() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 12px", padding: "6px 0", alignItems: "center" }}>
      {Object.entries(STATUS).map(([k, s]) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: s.color, width: 14, textAlign: "center" }}>{s.symbol}</span>
          <span style={{ fontSize: 9, color: T.textDim }}>{s.label}</span>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: 8 }}>
        <div style={{ width: 16, height: 10, background: T.danger + "0C", borderRadius: 2 }} />
        <span style={{ fontSize: 9, color: T.textDim }}>{"Poza dost\u0119pno\u015bci\u0105"}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8, borderLeft: "1px solid " + T.cardBorder, paddingLeft: 8 }}>
        <span style={{ fontSize: 9, color: T.textDim, fontWeight: 600 }}>{"Poziomy:"}</span>
        {[["SP","Podstawowa",T.cyan],["E8","Egz.8kl.",T.tertiary],["\u015aR","\u015arednia",T.primary],["\u015aR*","\u015ar.rozsz.",T.accent],["EM","Matura",T.danger],["EM★","Mat.rozsz.",T.pink]].map(([k,v,col],i) => (
          <span key={i} style={{ fontSize: 8, color: T.textDim }}>
            <span style={{ fontWeight: 800, color: col, background: col + "15", padding: "0 3px", borderRadius: 2, marginRight: 2 }}>{k}</span>
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

function FilterBar({ viewMode, setViewMode, filterBy, setFilterBy, filterValue, setFilterValue, detailLevel, setDetailLevel }) {
  const Btn = (active) => ({
    fontSize: 11, fontWeight: active ? 800 : 500, fontFamily: "Nunito, sans-serif",
    padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer",
    background: active ? T.primary : "transparent", color: active ? "#fff" : T.textMuted,
    transition: "all 0.12s",
  });
  const Sel = {
    fontSize: 11, fontWeight: 700, fontFamily: "Nunito, sans-serif",
    padding: "5px 10px", borderRadius: 8, border: "1px solid " + T.cardBorder,
    background: T.surface, color: T.text, cursor: "pointer", outline: "none",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", flexWrap: "wrap" }}>
      <div style={{ display: "flex", background: T.surface, borderRadius: 8, padding: 2, gap: 2 }}>
        {[["day","Dzień"],["week","Tydzień"],["avail","Dostępność"]].map(([v,lb]) => (
          <button key={v} onClick={() => setViewMode(v)} style={Btn(viewMode === v)}>{lb}</button>
        ))}
      </div>
      <div style={{ width: 1, height: 22, background: T.cardBorder }} />
      {viewMode !== "avail" && (<>
        <span style={{ fontSize: 10, color: T.textDim, fontWeight: 600 }}>{"Widok wg:"}</span>
        <div style={{ display: "flex", background: T.surface, borderRadius: 8, padding: 2, gap: 2 }}>
          <button onClick={() => { setFilterBy("tutor"); setFilterValue(tutorsList[0].id); }} style={Btn(filterBy === "tutor")}>Korepetytor</button>
          <button onClick={() => { setFilterBy("room"); setFilterValue(roomsList[0]); }} style={Btn(filterBy === "room")}>Sala</button>
        </div>
        <select value={filterValue} onChange={e => setFilterValue(e.target.value)} style={Sel}>
          {filterBy === "tutor" ? tutorsList.map(t => <option key={t.id} value={t.id}>{t.name}</option>) : roomsList.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </>)}
      {viewMode === "week" && (<>
        <div style={{ width: 1, height: 22, background: T.cardBorder }} />
        <div style={{ display: "flex", background: T.surface, borderRadius: 8, padding: 2, gap: 2 }}>
          <button onClick={() => setDetailLevel("detailed")} style={Btn(detailLevel === "detailed")}>{"Szczegółowy"}</button>
          <button onClick={() => setDetailLevel("compact")} style={Btn(detailLevel === "compact")}>Uproszczony</button>
        </div>
      </>)}
      {filterBy === "tutor" && viewMode !== "avail" && (<>
        <div style={{ width: 1, height: 22, background: T.cardBorder }} />
        <button onClick={() => setViewMode("editAvail")} style={{ fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "4px 10px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: "transparent", color: T.tertiary, cursor: "pointer" }}>{"Edytuj dostępność"}</button>
      </>)}
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ cursor: "pointer", color: T.textDim, fontSize: 13, userSelect: "none" }}>{"←"}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.text, fontFamily: "Nunito, sans-serif" }}>{viewMode === "day" ? "Czw 19.06.2026" : "16" + DASH + "21.06.2026"}</span>
        <span style={{ cursor: "pointer", color: T.textDim, fontSize: 13, userSelect: "none" }}>{"→"}</span>
        <button style={{ fontSize: 9, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "3px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: "transparent", color: T.primary, cursor: "pointer" }}>{"Dziś"}</button>
      </div>
    </div>
  );
}

function DayView({ filterBy, filterValue, avail, onSelect }) {
  const dayIdx = TODAY_IDX;
  let lessons = allLessons.filter(l => l.day === dayIdx);
  if (filterBy === "tutor") lessons = lessons.filter(l => l.tutor === filterValue);
  else lessons = lessons.filter(l => l.room === filterValue);
  const tutorData = filterBy === "tutor" ? tutorsList.find(t => t.id === filterValue) : null;
  const dayAvail = filterBy === "tutor" ? (avail[filterValue] || [])[dayIdx] : null;
  const HH = 54, S = 8, E = 19, totalH = (E - S) * HH, nowTop = (14.5 - S) * HH;
  const hours = Array.from({ length: E - S + 1 }, (_, i) => S + i);
  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      {filterBy === "tutor" && tutorData && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0 10px" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{tutorData.name}</span>
          {tutorData.subjects.map((s,i) => <span key={i} style={{ fontSize: 9, fontWeight: 700, color: subjectColor[s], background: subjectColor[s] + "15", padding: "2px 7px", borderRadius: 50 }}>{s}</span>)}
          {dayAvail && <span style={{ fontSize: 10, color: T.textDim }}>{"Dostępność: " + dayAvail[0] + ":00" + DASH + dayAvail[1] + ":00"}</span>}
          {!dayAvail && <span style={{ fontSize: 10, color: T.danger, fontWeight: 700 }}>{"Niedostępny"}</span>}
          <span style={{ fontSize: 10, color: T.textMuted, marginLeft: "auto" }}>{"Lekcji: " + lessons.length}</span>
        </div>
      )}
      {filterBy === "room" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0 10px" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{filterValue}</span>
          <span style={{ fontSize: 10, color: T.textMuted }}>{"Lekcji: " + lessons.length}</span>
        </div>
      )}
      <div style={{ display: "flex", borderRadius: 10, border: "1px solid " + T.cardBorder, background: T.surface, overflow: "hidden" }}>
        <div style={{ width: 46, flexShrink: 0, borderRight: "1px solid " + T.cardBorder, position: "relative" }}>
          {hours.map(h => <div key={h} style={{ position: "absolute", top: (h - S) * HH, right: 4, fontSize: 9, fontWeight: 700, color: T.textMuted, transform: "translateY(-5px)" }}>{h + ":00"}</div>)}
        </div>
        <div style={{ flex: 1, position: "relative", height: totalH, minWidth: 280 }}>
          {hours.map(h => <div key={h} style={{ position: "absolute", top: (h - S) * HH, left: 0, right: 0, borderTop: "1px solid rgba(59,143,240,0.18)" }} />)}
          
          {hours.slice(0, -1).map(h => <div key={"half" + h} style={{ position: "absolute", top: (h - S + 0.5) * HH, left: 0, right: 0, borderTop: "1px dashed rgba(59,143,240,0.08)" }} />)}
          {filterBy === "tutor" && dayAvail && Array.from({ length: E - S }, (_, i) => S + i).map(h => (
            !isAvailHour(dayAvail, h) ? <div key={"ua"+h} style={{ position: "absolute", top: (h - S) * HH, left: 0, right: 0, height: HH, background: T.danger + "0C" }} /> : null
          ))}
          {filterBy === "tutor" && !dayAvail && <div style={{ position: "absolute", inset: 0, background: T.danger + "0C" }} />}
          <div style={{ position: "absolute", top: nowTop, left: 0, right: 0, zIndex: 15, pointerEvents: "none", display: "flex", alignItems: "center" }}>
            <div style={{ width: 6, height: 6, borderRadius: 50, background: T.danger }} />
            <div style={{ flex: 1, height: 2, background: T.danger }} />
          </div>
          {lessons.map((l, i) => {
            const top = (l.start - S) * HH, ht = (l.end - l.start) * HH - 2;
            const st = STATUS[l.status] || {}, isCan = l.status === "cancelled" || l.status === "no-show", isDone = l.status.startsWith("done");
            return (
              <div key={i} onClick={() => onSelect(l)}
                style={{ position: "absolute", top, left: 6, right: 6, height: ht, background: st.bg, borderLeft: "3px solid " + st.color, borderRadius: 7, padding: "4px 8px", cursor: "pointer", overflow: "hidden", opacity: isCan ? 0.45 : isDone ? 0.72 : 1, display: "flex", alignItems: "flex-start", gap: 6, textDecoration: isCan ? "line-through" : "none", transition: "all 0.1s", zIndex: 1 }}
                onMouseEnter={e => { e.currentTarget.style.zIndex = 10; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.zIndex = 1; e.currentTarget.style.boxShadow = "none"; }}>
                <SB status={l.status} size={12} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.student}</span>
                    {l.lvl && <span style={{ fontSize: 7, fontWeight: 800, color: levelColor[l.lvl] || T.textDim, background: (levelColor[l.lvl] || T.textDim) + "15", padding: "0px 4px", borderRadius: 3, flexShrink: 0 }}>{l.lvl}</span>}
                  </div>
                  <div style={{ fontSize: 9, color: T.textMuted }}>{(subjectAbbr[l.subject] || l.subject) + " " + DOT + " " + fmtRange(l.start, l.end) + (filterBy === "room" ? " " + DOT + " " + l.tutor : "")}</div>
                </div>
                {l.status === "makeup" && <span style={{ fontSize: 8, fontWeight: 800, color: T.accent, background: T.accent + "15", padding: "1px 4px", borderRadius: 3 }}>ODR</span>}
                {filterBy === "tutor" && <span style={{ fontSize: 8, color: T.textDim }}>{l.room}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeekDetailed({ filterBy, filterValue, avail, onSelect }) {
  const HH = 42, S = 8, E = 19, totalH = (E - S) * HH;
  const hours = Array.from({ length: E - S + 1 }, (_, i) => S + i);
  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ display: "flex", borderRadius: 10, border: "1px solid " + T.cardBorder, background: T.surface, overflow: "hidden" }}>
        <div style={{ width: 40, flexShrink: 0, borderRight: "1px solid " + T.cardBorder }}>
          <div style={{ height: 30 }} />
          <div style={{ position: "relative", height: totalH }}>
            {hours.map(h => <div key={h} style={{ position: "absolute", top: (h - S) * HH, right: 3, fontSize: 8, fontWeight: 700, color: T.textMuted, transform: "translateY(-5px)" }}>{h + ":00"}</div>)}
          </div>
        </div>
        {weekDays.map((dayLabel, di) => {
          let lessons = allLessons.filter(l => l.day === di);
          if (filterBy === "tutor") lessons = lessons.filter(l => l.tutor === filterValue);
          else lessons = lessons.filter(l => l.room === filterValue);
          const isToday = di === TODAY_IDX;
          const dayAvail = filterBy === "tutor" ? (avail[filterValue] || [])[di] : null;
          return (
            <div key={di} style={{ flex: 1, minWidth: 100, borderRight: di < 5 ? "1px solid " + T.cardBorder : "none", background: isToday ? T.primary + "04" : "transparent" }}>
              <div style={{ height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid " + T.cardBorder, background: isToday ? T.primary + "10" : T.bgAlt }}>
                <span style={{ fontSize: 10, fontWeight: isToday ? 800 : 600, color: isToday ? T.primary : T.textMuted }}>{dayLabel}</span>
                <span style={{ fontSize: 8, color: T.textDim, marginLeft: 4 }}>{"(" + lessons.length + ")"}</span>
              </div>
              <div style={{ position: "relative", height: totalH }}>
                {hours.map(h => <div key={h} style={{ position: "absolute", top: (h - S) * HH, left: 0, right: 0, borderTop: "1px solid rgba(59,143,240,0.18)" }} />)}
                {filterBy === "tutor" && dayAvail && Array.from({ length: E - S }, (_, i) => S + i).map(h => (
                  !isAvailHour(dayAvail, h) ? <div key={"ua"+h} style={{ position: "absolute", top: (h - S) * HH, left: 0, right: 0, height: HH, background: T.danger + "0C" }} /> : null
                ))}
                {filterBy === "tutor" && !dayAvail && <div style={{ position: "absolute", inset: 0, background: T.danger + "0C" }} />}
                {isToday && <div style={{ position: "absolute", top: (14.5 - S) * HH, left: 0, right: 0, height: 2, background: T.danger, zIndex: 15 }} />}
                {lessons.map((l, li) => {
                  const top = (l.start - S) * HH, ht = (l.end - l.start) * HH - 2;
                  const st = STATUS[l.status] || {}, isCan = l.status === "cancelled" || l.status === "no-show";
                  return (
                    <div key={li} onClick={() => onSelect(l)}
                      style={{ position: "absolute", top, left: 2, right: 2, height: ht, background: st.bg, borderLeft: "3px solid " + st.color, borderRadius: 5, padding: "2px 4px", cursor: "pointer", overflow: "hidden", opacity: isCan ? 0.4 : l.status.startsWith("done") ? 0.7 : 1, fontSize: 9, transition: "all 0.1s", zIndex: 1 }}
                      onMouseEnter={e => { e.currentTarget.style.zIndex = 10; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.zIndex = 1; e.currentTarget.style.boxShadow = "none"; }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <SB status={l.status} size={9} />
                        <span style={{ fontWeight: 700, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.student}</span>
                      </div>
                      <div style={{ color: T.textDim, display: "flex", alignItems: "center", gap: 2 }}>
                        <span style={{ fontWeight: 700, color: subjectColor[l.subject] || T.textDim }}>{subjectAbbr[l.subject] || l.subject.slice(0,3)}</span>
                        {l.lvl && <span style={{ fontSize: 7, fontWeight: 800, color: levelColor[l.lvl] || T.textDim }}>{l.lvl}</span>}
                        <span style={{ marginLeft: 2 }}>{fmtRange(l.start, l.end)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekCompact({ filterBy, filterValue, avail }) {
  const thSt = { padding: "7px 5px", textAlign: "center", background: T.bgAlt, position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid " + T.cardBorder };
  const slots = new Map();
  for (const l of allLessons) {
    const ok = filterBy === "tutor" ? l.tutor === filterValue : l.room === filterValue;
    if (!ok) continue;
    const key = fmtRange(l.start, l.end);
    if (!slots.has(key)) slots.set(key, { time: key, start: l.start, days: {} });
    if (!slots.get(key).days[l.day]) slots.get(key).days[l.day] = [];
    slots.get(key).days[l.day].push(l);
  }
  const sorted = [...slots.values()].sort((a, b) => a.start - b.start);
  const fLessons = allLessons.filter(l => filterBy === "tutor" ? l.tutor === filterValue : l.room === filterValue);
  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ borderRadius: 10, border: "1px solid " + T.cardBorder, background: T.surface, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            <th style={{ ...thSt, width: 75, textAlign: "left", paddingLeft: 8 }}>Godziny</th>
            {weekDays.map((d, i) => <th key={i} style={{ ...thSt, background: i === TODAY_IDX ? T.primary + "10" : T.bgAlt }}><span style={{ fontSize: 10, fontWeight: i === TODAY_IDX ? 800 : 600, color: i === TODAY_IDX ? T.primary : T.textMuted }}>{d}</span></th>)}
          </tr></thead>
          <tbody>
            {sorted.map((slot, si) => (
              <tr key={si} style={{ borderTop: "1px solid rgba(59,143,240,0.18)" }}>
                <td style={{ padding: "6px 8px", fontSize: 10, fontWeight: 700, color: T.textDim, verticalAlign: "top", whiteSpace: "nowrap" }}>{slot.time}</td>
                {weekDays.map((_, di) => {
                  const dls = slot.days[di] || [];
                  return (
                    <td key={di} style={{ padding: "5px 6px", verticalAlign: "top", background: di === TODAY_IDX ? T.primary + "04" : "transparent" }}>
                      {dls.length === 0 ? <span style={{ fontSize: 9, color: T.textDim + "40" }}>{DASH}</span> : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          {dls.map((l, li) => {
                            const st = STATUS[l.status] || {}, isCan = l.status === "cancelled" || l.status === "no-show";
                            return (
                              <div key={li} style={{ display: "flex", alignItems: "center", gap: 3, opacity: isCan ? 0.4 : 1 }}>
                                <SB status={l.status} size={10} />
                                <span style={{ fontSize: 9, fontWeight: 600, color: T.text, textDecoration: isCan ? "line-through" : "none" }}>{l.student.length > 11 ? l.student.slice(0, 11) + "…" : l.student}</span>
                                <span style={{ fontSize: 7, color: subjectColor[l.subject] || T.textDim, fontWeight: 700 }}>{subjectAbbr[l.subject] || l.subject.slice(0, 3)}</span>
                                {l.lvl && <span style={{ fontSize: 6, fontWeight: 800, color: levelColor[l.lvl] || T.textDim }}>{l.lvl}</span>}
                                {filterBy === "room" && <span style={{ fontSize: 7, color: T.textDim }}>{l.tutor}</span>}
                                {filterBy === "tutor" && <span style={{ fontSize: 7, color: T.textDim }}>{l.room.replace("Sala ", "S")}</span>}
                                {l.status === "makeup" && <span style={{ fontSize: 6, fontWeight: 800, color: T.accent }}>ODR</span>}
                              </div>);
                          })}
                        </div>)}
                    </td>);
                })}
              </tr>))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "10px 0", flexWrap: "wrap" }}>
        {Object.entries(STATUS).map(([k, s]) => { const c = fLessons.filter(l => l.status === k).length; return c === 0 ? null : (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 3, background: T.surface, padding: "3px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: s.color }}>{s.symbol}</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: s.color }}>{c}</span>
            <span style={{ fontSize: 9, color: T.textDim }}>{s.label}</span>
          </div>); })}
      </div>
    </div>
  );
}

function AvailView({ avail }) {
  const hours = Array.from({ length: 12 }, (_, i) => 8 + i);
  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: T.text, padding: "8px 0 12px" }}>{"Dostępność korepetytorów i sal " + DASH + " tydzień 16" + DASH + "21.06"}</div>
      <div style={{ borderRadius: 10, border: "1px solid " + T.cardBorder, background: T.surface, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "8px 12px", background: T.bgAlt, borderBottom: "1px solid " + T.cardBorder, fontSize: 11, fontWeight: 800, color: T.text }}>{"Korepetytorzy " + DASH + " wolne godziny"}</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, color: T.textDim, borderBottom: "1px solid " + T.cardBorder, width: 120 }}>Korepetytor</th>
            {weekDays.map((d, i) => <th key={i} style={{ padding: "6px 4px", textAlign: "center", fontSize: 10, color: i === TODAY_IDX ? T.primary : T.textDim, fontWeight: i === TODAY_IDX ? 800 : 600, borderBottom: "1px solid " + T.cardBorder, background: i === TODAY_IDX ? T.primary + "06" : "transparent" }}>{d}</th>)}
          </tr></thead>
          <tbody>
            {tutorsList.map((tut, ti) => {
              const ta = avail[tut.id] || [];
              return (
                <tr key={ti} style={{ borderTop: ti > 0 ? "1px solid " + T.cardBorder : "none" }}>
                  <td style={{ padding: "8px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: T.primary + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: T.primary }}>{tut.initials}</div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.text }}>{tut.name.split(" ")[0]}</span>
                    </div>
                  </td>
                  {weekDays.map((_, di) => {
                    const dayA = ta[di];
                    const dayLessons = allLessons.filter(l => l.day === di && l.tutor === tut.id && l.status !== "cancelled");
                    const busyHours = new Set();
                    dayLessons.forEach(l => { for (let h = Math.floor(l.start); h < Math.ceil(l.end); h++) busyHours.add(h); });
                    if (!dayA) return <td key={di} style={{ padding: "6px 4px", textAlign: "center", background: di === TODAY_IDX ? T.primary + "04" : "transparent" }}><span style={{ fontSize: 9, color: T.danger + "60" }}>Wolne</span></td>;
                    const freeSlots = [];
                    dayA.forEach(([s, e]) => { for (let h = s; h < e; h++) { if (!busyHours.has(h)) freeSlots.push(h); } });
                    return (
                      <td key={di} style={{ padding: "4px 3px", verticalAlign: "top", background: di === TODAY_IDX ? T.primary + "04" : "transparent" }}>
                        {freeSlots.length === 0 ? <div style={{ fontSize: 8, color: T.danger, textAlign: "center", fontWeight: 700 }}>{"Pełny"}</div> : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                            {freeSlots.map(h => <span key={h} style={{ fontSize: 8, fontWeight: 700, color: T.success, background: T.success + "12", padding: "1px 4px", borderRadius: 3 }}>{h + ":00"}</span>)}
                          </div>)}
                      </td>);
                  })}
                </tr>);
            })}
          </tbody>
        </table>
      </div>
      <div style={{ borderRadius: 10, border: "1px solid " + T.cardBorder, background: T.surface, overflow: "hidden" }}>
        <div style={{ padding: "8px 12px", background: T.bgAlt, borderBottom: "1px solid " + T.cardBorder, fontSize: 11, fontWeight: 800, color: T.text }}>{"Sale " + DASH + " wolne godziny"}</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, color: T.textDim, borderBottom: "1px solid " + T.cardBorder, width: 120 }}>Sala</th>
            {weekDays.map((d, i) => <th key={i} style={{ padding: "6px 4px", textAlign: "center", fontSize: 10, color: i === TODAY_IDX ? T.primary : T.textDim, fontWeight: i === TODAY_IDX ? 800 : 600, borderBottom: "1px solid " + T.cardBorder, background: i === TODAY_IDX ? T.primary + "06" : "transparent" }}>{d}</th>)}
          </tr></thead>
          <tbody>
            {roomsList.map((room, ri) => (
              <tr key={ri} style={{ borderTop: ri > 0 ? "1px solid " + T.cardBorder : "none" }}>
                <td style={{ padding: "8px 8px", fontSize: 11, fontWeight: 700, color: T.text }}>{room}</td>
                {weekDays.map((_, di) => {
                  const dayLessons = allLessons.filter(l => l.day === di && l.room === room && l.status !== "cancelled");
                  const busyHours = new Set();
                  dayLessons.forEach(l => { for (let h = Math.floor(l.start); h < Math.ceil(l.end); h++) busyHours.add(h); });
                  const freeSlots = hours.filter(h => !busyHours.has(h));
                  return (
                    <td key={di} style={{ padding: "4px 3px", verticalAlign: "top", background: di === TODAY_IDX ? T.primary + "04" : "transparent" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                        {freeSlots.map(h => <span key={h} style={{ fontSize: 8, fontWeight: 700, color: T.success, background: T.success + "12", padding: "1px 4px", borderRadius: 3 }}>{h + ":00"}</span>)}
                        {freeSlots.length === 0 && <span style={{ fontSize: 8, color: T.danger, fontWeight: 700 }}>{"Pełna"}</span>}
                      </div>
                    </td>);
                })}
              </tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditAvailView({ avail, setAvail, filterValue, onBack }) {
  const tut = tutorsList.find(t => t.id === filterValue);
  const ta = avail[filterValue] || [null,null,null,null,null,null];
  const hoursOpts = Array.from({ length: 14 }, (_, i) => 7 + i);

  function updateAvail(newArr) {
    setAvail({ ...avail, [filterValue]: newArr });
  }

  function toggleDay(di) {
    const arr = [...ta];
    arr[di] = arr[di] ? null : [[9, 17]];
    updateAvail(arr);
  }

  function setBlock(di, bi, field, val) {
    const arr = [...ta];
    const blocks = arr[di].map(b => [...b]);
    blocks[bi][field] = parseInt(val);
    if (blocks[bi][0] >= blocks[bi][1]) blocks[bi][1] = blocks[bi][0] + 1;
    arr[di] = blocks;
    updateAvail(arr);
  }

  function addBlock(di) {
    const arr = [...ta];
    const blocks = [...arr[di]];
    const lastEnd = blocks[blocks.length - 1][1];
    blocks.push([lastEnd + 1, lastEnd + 3 > 20 ? 20 : lastEnd + 3]);
    arr[di] = blocks;
    updateAvail(arr);
  }

  function removeBlock(di, bi) {
    const arr = [...ta];
    const blocks = [...arr[di]];
    blocks.splice(bi, 1);
    arr[di] = blocks.length > 0 ? blocks : null;
    updateAvail(arr);
  }

  const selSt = { fontSize: 11, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "4px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.surface, color: T.text, cursor: "pointer", outline: "none" };

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0 16px" }}>
        <button onClick={onBack} style={{ fontSize: 11, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "5px 12px", borderRadius: 8, border: "1px solid " + T.cardBorder, background: "transparent", color: T.primary, cursor: "pointer" }}>{"← Wróć"}</button>
        <span style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{"Edycja dostępności: " + (tut ? tut.name : filterValue)}</span>
      </div>
      <div style={{ borderRadius: 10, border: "1px solid " + T.cardBorder, background: T.surface, overflow: "hidden", maxWidth: 650 }}>
        {weekDaysFull.map((dayName, di) => {
          const dayBlocks = ta[di];
          return (
            <div key={di} style={{ padding: "12px 16px", borderTop: di > 0 ? "1px solid " + T.cardBorder : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: dayBlocks ? 8 : 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text, width: 100 }}>{dayName}</span>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input type="checkbox" checked={!!dayBlocks} onChange={() => toggleDay(di)} style={{ accentColor: T.primary }} />
                  <span style={{ fontSize: 11, color: dayBlocks ? T.success : T.textDim, fontWeight: 600 }}>{dayBlocks ? "Dostępny" : "Wolne"}</span>
                </label>
              </div>
              {dayBlocks && dayBlocks.map((block, bi) => (
                <div key={bi} style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 112, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, width: 50 }}>{"Blok " + (bi + 1)}</span>
                  <span style={{ fontSize: 10, color: T.textDim }}>od</span>
                  <select value={block[0]} onChange={e => setBlock(di, bi, 0, e.target.value)} style={selSt}>
                    {hoursOpts.map(h => <option key={h} value={h}>{h + ":00"}</option>)}
                  </select>
                  <span style={{ fontSize: 10, color: T.textDim }}>do</span>
                  <select value={block[1]} onChange={e => setBlock(di, bi, 1, e.target.value)} style={selSt}>
                    {hoursOpts.filter(h => h > block[0]).map(h => <option key={h} value={h}>{h + ":00"}</option>)}
                  </select>
                  {dayBlocks.length > 1 && (
                    <button onClick={() => removeBlock(di, bi)} style={{ fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "3px 8px", borderRadius: 6, border: "none", background: T.danger + "15", color: T.danger, cursor: "pointer" }}>{"✕"}</button>
                  )}
                </div>
              ))}
              {dayBlocks && (
                <button onClick={() => addBlock(di)} style={{ fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "3px 10px", borderRadius: 6, border: "1px dashed " + T.cardBorder, background: "transparent", color: T.primary, cursor: "pointer", marginLeft: 112, marginTop: 2 }}>{"+ Dodaj blok"}</button>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ padding: "14px 0", fontSize: 10, color: T.textDim }}>{"Wiele bloków na dzień = przerwy w dostępności (np. zajęcia na uczelni w środku dnia)."}</div>
    </div>
  );
}

function DetailPanel({ lesson, onClose }) {
  if (!lesson) return null;
  const st = STATUS[lesson.status] || {};
  const tut = tutorsList.find(t => t.id === lesson.tutor);
  const col = subjectColor[lesson.subject] || T.textDim;
  const isDone = lesson.status.startsWith("done") || lesson.status === "cancelled" || lesson.status === "no-show";
  const isUpcoming = lesson.status === "upcoming", isActive = lesson.status === "active";
  const actions = [];
  if (isUpcoming) { actions.push({ label: "Edytuj lekcję", color: T.primary }); actions.push({ label: "Odwołaj lekcję", color: T.danger }); actions.push({ label: "Zmień salę", color: T.tertiary }); }
  if (isActive) { actions.push({ label: "Zmień salę", color: T.tertiary }); }
  if (lesson.status === "done") { actions.push({ label: "Zobacz wpis", color: T.success }); }
  if (lesson.status === "done-no-note") { actions.push({ label: "Brak wpisu — przypomnij", color: T.tertiary }); }
  if (lesson.status === "no-show" || lesson.status === "cancelled") { actions.push({ label: "Zaplanuj odrabianie", color: T.accent }); }
  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 300, background: T.bgAlt, borderLeft: "1px solid " + T.cardBorder, zIndex: 100, display: "flex", flexDirection: "column", boxShadow: "-6px 0 24px rgba(0,0,0,0.4)", animation: "slideIn 0.2s ease" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid " + T.cardBorder, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 900, color: T.text, fontFamily: "Nunito, sans-serif" }}>{"Szczegóły lekcji"}</span>
        <span onClick={onClose} style={{ cursor: "pointer", fontSize: 16, color: T.textDim }}>{"×"}</span>
      </div>
      <div style={{ padding: 16, flex: 1, overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
          <SB status={lesson.status} size={14} />
          <span style={{ fontSize: 11, fontWeight: 700, color: st.color, background: st.bg, padding: "2px 8px", borderRadius: 50 }}>{st.label}</span>
        </div>
        {[
          { label: "Uczeń / Grupa", value: lesson.student },
          { label: "Przedmiot", value: lesson.subject + " (" + lesson.type + ")", color: col },
          { label: "Poziom", value: lesson.lvl || "\u2014" },
          { label: "Godzina", value: fmtRange(lesson.start, lesson.end) },
          { label: "Dzień", value: weekDays[lesson.day] },
          { label: "Korepetytor", value: tut ? tut.name : lesson.tutor },
          { label: "Sala", value: lesson.room },
        ].map((d, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 8, color: T.textDim, marginBottom: 1, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{d.label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: d.color || T.text }}>{d.value}</div>
          </div>
        ))}
        {actions.length > 0 && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
            {actions.map((a, i) => (
              <button key={i} style={{ width: "100%", padding: "8px", fontSize: 11, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 7, border: "none", cursor: "pointer", background: a.color + "12", color: a.color, transition: "all 0.12s" }}
                onMouseEnter={e => { e.currentTarget.style.background = a.color; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = a.color + "12"; e.currentTarget.style.color = a.color; }}>
                {a.label}
              </button>))}
          </div>)}
      </div>
    </div>
  );
}

export default function AdminSchedule() {
  const [collapsed, setCollapsed] = useState(true);
  const [viewMode, setViewMode] = useState("week");
  const [filterBy, setFilterBy] = useState("tutor");
  const [filterValue, setFilterValue] = useState("TK");
  const [detailLevel, setDetailLevel] = useState("detailed");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [avail, setAvail] = useState(defaultAvailability);
  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, fontFamily: "Nunito, sans-serif", color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.cardBorder}; border-radius: 50px; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        select { appearance: none; -webkit-appearance: none; }
        select option { background: ${T.surface}; color: ${T.text}; }
      `}</style>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: 44, background: T.bgAlt, borderBottom: "1px solid " + T.cardBorder, display: "flex", alignItems: "center", padding: "0 18px", flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: T.text, fontFamily: "Nunito, sans-serif" }}>Harmonogram</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", cursor: "pointer" }}><span style={{ fontSize: 15 }}>{"🔔"}</span><span style={{ position: "absolute", top: -3, right: -5, fontSize: 7, fontWeight: 800, color: "#fff", background: T.danger, borderRadius: 50, width: 13, height: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>7</span></div>
            <div style={{ width: 26, height: 26, borderRadius: 50, background: T.tertiary + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: T.tertiary, cursor: "pointer" }}>AD</div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden", padding: "0 18px 18px", display: "flex", flexDirection: "column" }}>
          {viewMode !== "editAvail" && (<><FilterBar viewMode={viewMode} setViewMode={setViewMode} filterBy={filterBy} setFilterBy={setFilterBy} filterValue={filterValue} setFilterValue={setFilterValue} detailLevel={detailLevel} setDetailLevel={setDetailLevel} /><Legend /></>)}
          {viewMode === "day" && <DayView filterBy={filterBy} filterValue={filterValue} avail={avail} onSelect={setSelectedLesson} />}
          {viewMode === "week" && detailLevel === "detailed" && <WeekDetailed filterBy={filterBy} filterValue={filterValue} avail={avail} onSelect={setSelectedLesson} />}
          {viewMode === "week" && detailLevel === "compact" && <WeekCompact filterBy={filterBy} filterValue={filterValue} avail={avail} />}
          {viewMode === "avail" && <AvailView avail={avail} />}
          {viewMode === "editAvail" && <EditAvailView avail={avail} setAvail={setAvail} filterValue={filterValue} onBack={() => setViewMode("week")} />}
        </div>
      </div>
      {selectedLesson && (<>
        <div onClick={() => setSelectedLesson(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 99 }} />
        <DetailPanel lesson={selectedLesson} onClose={() => setSelectedLesson(null)} />
      </>)}
    </div>
  );
}
