import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", secondary: "#FF6F4A", tertiary: "#FFCA28",
  accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4", danger: "#EF4444",
  cardBorder: "rgba(59,143,240,0.10)",
};

const days = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
const hours = [9,10,11,12,13,14,15,16,17,18,19,20];

// Confirmed plan - READ ONLY, set by admin
const confirmedPlan = {
  Pon: [{from:14,to:20, lessons:["14:00 Kacper N.", "15:15 Grupa A", "16:30 Alicja W.", "18:15 Tomek Z."]}],
  Wt:  [{from:14,to:19, lessons:["14:00 Tomek Z.", "15:30 Julia K.", "17:00 Michał L."]}],
  Śr:  [{from:14,to:18, lessons:["14:00 Kacper N.", "15:15 Grupa B", "17:00 Ola S."]}],
  Czw: [{from:14,to:19, lessons:["14:00 Kacper N.", "15:15 Grupa A", "16:30 Alicja W.", "18:15 Tomek Z."]}],
  Pt:  [{from:14,to:19, lessons:["14:00 Tomek Z.", "15:30 Michał L.", "17:30 Julia K. (odr.)"]}],
  Sob: [{from:9,to:12, lessons:["9:00 Kacper N.", "10:15 Grupa C"]}],
  Nd:  [{from:10,to:12, lessons:["10:00 Tomek Z."]}],
};

const extraSlots = [
  { id: 1, date: "Sob 28.06", hours: "14:00–17:00", reason: "Dodatkowy czas na odrabianie", status: "active" },
];

const absenceRequests = [
  { id: 1, type: "planned", label: "Urlop", icon: "🏖️", from: "1 lipca", to: "14 lipca", note: "Wakacje — dwutygodniowe", status: "pending", statusLabel: "Oczekuje na admina", statusColor: T.tertiary, affectedLessons: 28 },
  { id: 2, type: "planned", label: "Dzień wolny", icon: "📅", from: "18 sierpnia", to: "18 sierpnia", note: "Sprawy urzędowe", status: "approved", statusLabel: "Zatwierdzona", statusColor: T.success, affectedLessons: 3 },
  { id: 3, type: "urgent", label: "Nagła", icon: "⚠️", from: "Pt 27.06", to: "Pt 27.06", note: "Sprawy osobiste — proszę o zastępstwo lub odwołanie", status: "pending", statusLabel: "Oczekuje na admina", statusColor: T.tertiary, affectedLessons: 3 },
];

const changeRequests = [
  { id: 1, type: "schedule_change", description: "Przeniesienie środowych zajęć (14:00–18:00) na 15:00–19:00 od następnego miesiąca", status: "pending", statusLabel: "Oczekuje", statusColor: T.tertiary, requestedAt: "18.06" },
];

const sidebarItems = [
  { icon: "📊", label: "Dashboard" }, { icon: "📅", label: "Harmonogram" },
  { icon: "📝", label: "Lekcje i wpisy" }, { icon: "🔄", label: "Odrabianie", badge: 2 },
  { icon: "🕐", label: "Dostępność", active: true }, { icon: "👥", label: "Moi uczniowie" },
];

function Sidebar() {
  return (
    <div style={{ width: 240, flexShrink: 0, background: T.bgAlt, borderRight: `1px solid ${T.cardBorder}`, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 10, minHeight: 56 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: -2, fontStyle: "italic" }}>Ez</div>
        <span style={{ fontSize: 15, fontWeight: 900 }}>EDU <span style={{ color: T.primary }}>LUZ</span></span>
      </div>
      <div style={{ padding: "12px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {sidebarItems.map((item, i) => {
          const [h, setH] = useState(false);
          return (<div key={i} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s", background: item.active ? T.primary + "18" : h ? T.surfaceHover : "transparent" }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span style={{ fontSize: 13, fontWeight: item.active ? 800 : 600, color: item.active ? T.primary : h ? T.text : T.textMuted }}>{item.label}</span>
            {item.badge && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 10, background: T.secondary + "20", color: T.secondary }}>{item.badge}</span>}
          </div>);
        })}
      </div>
    </div>
  );
}

// Extra slots shown ON the grid (dashed green)
const extraOnGrid = [
  { day: "Sob", from: 14, to: 17, label: "Dodatkowe (odrabianie)" },
];

// Unavailable blocks shown ON the grid (red striped)
const unavailOnGrid = [
  { day: "Pt", from: 14, to: 20, label: "Niedostępny — sprawy osobiste", dateNote: "Pt 27.06" },
];

function PlanGrid() {
  return (
    <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.cardBorder}`, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "50px repeat(7, 1fr)", borderBottom: `1px solid ${T.cardBorder}` }}>
        <div style={{ padding: "10px 4px", fontSize: 10, color: T.textDim, fontWeight: 700, textAlign: "center" }}>⏰</div>
        {days.map(d => {
          const blocks = confirmedPlan[d] || [];
          const totalH = blocks.reduce((s, b) => s + (b.to - b.from), 0);
          const hasExtra = extraOnGrid.some(e => e.day === d);
          const hasUnavail = unavailOnGrid.some(u => u.day === d);
          return (
            <div key={d} style={{ padding: "8px 4px", textAlign: "center", borderLeft: `1px solid ${T.cardBorder}`, background: hasUnavail ? T.danger + "04" : "transparent" }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: hasUnavail ? T.danger : T.textMuted, margin: 0 }}>{d}</p>
              <div style={{ display: "flex", gap: 3, justifyContent: "center", marginTop: 2 }}>
                {totalH > 0 && <span style={{ fontSize: 9, color: T.success, fontWeight: 600 }}>{totalH}h</span>}
                {hasExtra && <span style={{ fontSize: 9, color: T.success, fontWeight: 800 }}>+3h</span>}
                {hasUnavail && <span style={{ fontSize: 9, color: T.danger, fontWeight: 800 }}>🚫</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "50px repeat(7, 1fr)" }}>
        <div>
          {hours.map(h => (
            <div key={h} style={{ height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: T.textDim, fontWeight: 600 }}>{h}:00</div>
          ))}
        </div>
        {days.map(d => {
          const blocks = confirmedPlan[d] || [];
          const extras = extraOnGrid.filter(e => e.day === d);
          const unavails = unavailOnGrid.filter(u => u.day === d);
          return (
            <div key={d} style={{ position: "relative", borderLeft: `1px solid ${T.cardBorder}`, minHeight: hours.length * 36 }}>
              {hours.map(h => (
                <div key={h} style={{ position: "absolute", top: (h - hours[0]) * 36, left: 0, right: 0, height: 1, background: T.cardBorder }} />
              ))}

              {/* Unavailable blocks - red striped */}
              {unavails.map((u, ui) => {
                const top = (u.from - hours[0]) * 36;
                const height = (u.to - u.from) * 36;
                return (
                  <div key={`u${ui}`} style={{
                    position: "absolute", top, left: 0, right: 0, height,
                    background: `repeating-linear-gradient(135deg, ${T.danger}08, ${T.danger}08 4px, ${T.danger}14 4px, ${T.danger}14 8px)`,
                    border: `1px solid ${T.danger}20`, zIndex: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: T.danger, background: T.surface, padding: "2px 6px", borderRadius: 4 }}>🚫 Niedostępny</span>
                  </div>
                );
              })}

              {/* Confirmed lesson blocks - blue */}
              {blocks.map((b, bi) => {
                const top = (b.from - hours[0]) * 36;
                const height = (b.to - b.from) * 36;
                const isOverlapped = unavails.some(u => b.from < u.to && b.to > u.from);
                const [bh, setBh] = useState(false);
                return (
                  <div key={`b${bi}`} onMouseEnter={() => setBh(true)} onMouseLeave={() => setBh(false)}
                    style={{
                      position: "absolute", top, left: 2, right: 2, height: height - 2,
                      background: isOverlapped ? T.danger + "15" : bh ? T.primary + "20" : T.primary + "12",
                      border: `1px solid ${isOverlapped ? T.danger + "30" : T.primary + "25"}`,
                      borderLeft: `3px solid ${isOverlapped ? T.danger : T.primary}`,
                      borderRadius: 6, padding: "3px 5px", overflow: "hidden",
                      transition: "background .15s", zIndex: 2,
                      opacity: isOverlapped ? 0.6 : 1,
                      textDecoration: isOverlapped ? "line-through" : "none",
                    }}>
                    {b.lessons.map((l, li) => (
                      <p key={li} style={{ fontSize: 7, fontWeight: 600, color: isOverlapped ? T.danger : T.primary, margin: 0, lineHeight: 1.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l}</p>
                    ))}
                    {isOverlapped && <span style={{ position: "absolute", top: 2, right: 3, fontSize: 7, fontWeight: 900, color: T.danger }}>⚠</span>}
                  </div>
                );
              })}

              {/* Extra available blocks - green dashed */}
              {extras.map((e, ei) => {
                const top = (e.from - hours[0]) * 36;
                const height = (e.to - e.from) * 36;
                const [eh, setEh] = useState(false);
                return (
                  <div key={`e${ei}`} onMouseEnter={() => setEh(true)} onMouseLeave={() => setEh(false)}
                    style={{
                      position: "absolute", top, left: 2, right: 2, height: height - 2,
                      background: eh ? T.success + "20" : T.success + "10",
                      border: `1.5px dashed ${T.success}50`,
                      borderRadius: 6, padding: "3px 5px", overflow: "hidden",
                      transition: "background .15s", zIndex: 1,
                      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                    }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: T.success, textAlign: "center" }}>➕ Dodatkowe</span>
                    <span style={{ fontSize: 7, color: T.success, fontWeight: 500 }}>{e.from}:00–{e.to}:00</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TutorAvailability() {
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [showAddAbsence, setShowAddAbsence] = useState(false);
  const [showChangeReq, setShowChangeReq] = useState(false);
  const [absType, setAbsType] = useState("planned");
  const [absCategory, setAbsCategory] = useState("Urlop");

  const totalWeeklyH = Object.values(confirmedPlan).reduce((s, blocks) => s + blocks.reduce((bs, b) => bs + (b.to - b.from), 0), 0);
  const pendingCount = absenceRequests.filter(a => a.status === "pending").length + changeRequests.filter(c => c.status === "pending").length;

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes fd{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ height: 56, padding: "0 24px", display: "flex", alignItems: "center", background: T.bgAlt, borderBottom: `1px solid ${T.cardBorder}`, justifyContent: "space-between", flexShrink: 0 }}>
          <h1 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>Dostępność i plan</h1>
          {pendingCount > 0 && <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 10, background: T.tertiary + "20", color: T.tertiary }}>{pendingCount} oczekuje na admina</span>}
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>

          {/* === CONFIRMED PLAN === */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Stały plan zajęć</h2>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: T.success + "15", color: T.success, display: "flex", alignItems: "center", gap: 3 }}>🔒 Zatwierdzony</span>
                </div>
                <p style={{ fontSize: 12, color: T.textDim, fontWeight: 500, margin: 0 }}>
                  {totalWeeklyH}h tygodniowo · Zmiana wymaga zatwierdzenia admina
                </p>
              </div>
              <button onClick={() => setShowChangeReq(!showChangeReq)}
                onMouseEnter={e => e.target.style.background = T.accent + "25"}
                onMouseLeave={e => e.target.style.background = T.accent + "15"}
                style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: T.accent + "15", color: T.accent, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>📋 Poproś o zmianę planu</button>
            </div>

            {/* Week navigation */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <button onMouseEnter={e => e.target.style.background = T.surfaceHover} onMouseLeave={e => e.target.style.background = T.surface} style={{ background: T.surface, border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: T.textDim, fontSize: 14, fontFamily: "inherit", transition: "background .15s" }}>←</button>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>16–22 czerwca 2026</span>
              <button onMouseEnter={e => e.target.style.background = T.surfaceHover} onMouseLeave={e => e.target.style.background = T.surface} style={{ background: T.surface, border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: T.textDim, fontSize: 14, fontFamily: "inherit", transition: "background .15s" }}>→</button>
              <button onMouseEnter={e => e.target.style.background = T.primary + "18"} onMouseLeave={e => e.target.style.background = T.surface} style={{ background: T.surface, border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "5px 14px", cursor: "pointer", color: T.primary, fontSize: 12, fontWeight: 700, fontFamily: "inherit", transition: "all .15s" }}>Dziś</button>
              <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: T.primary }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: T.primary + "20", border: `1px solid ${T.primary}30` }} /> Stałe lekcje
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: T.success }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: T.success + "25", border: `1.5px dashed ${T.success}50` }} /> Dodatkowe
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: T.danger }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: T.danger + "15", border: `1px solid ${T.danger}25` }} /> Niedostępny
                </span>
              </div>
            </div>

            {showChangeReq && (
              <div style={{ background: T.surface, borderRadius: 16, padding: "20px 22px", border: `1px solid ${T.accent}20`, marginBottom: 12, animation: "fd .2s ease" }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: T.accent, marginBottom: 10 }}>Opisz jaką zmianę chcesz wprowadzić:</p>
                <textarea placeholder="Np. 'Chciałbym przenieść środowe zajęcia z 14:00–18:00 na 15:00–19:00 od lipca' albo 'Proszę o dodanie slotu w czwartki 19:00–20:00'" rows={3}
                  style={{ width: "100%", background: T.bg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 12, padding: "10px 14px", color: T.text, fontSize: 12, fontWeight: 500, fontFamily: "inherit", resize: "vertical", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = T.accent + "50"} onBlur={e => e.target.style.borderColor = T.cardBorder} />
                <p style={{ fontSize: 9, color: T.textDim, fontWeight: 500, margin: "6px 0 12px", fontStyle: "italic" }}>Admin dostanie powiadomienie i zatwierdzi lub skontaktuje się z Tobą.</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => setShowChangeReq(false)} onMouseEnter={e => e.target.style.background = T.surfaceHover} onMouseLeave={e => e.target.style.background = "transparent"} style={{ padding: "8px 18px", borderRadius: 10, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>Anuluj</button>
                  <button onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; }} onMouseLeave={e => { e.target.style.transform = "none"; }} style={{ padding: "8px 22px", borderRadius: 10, border: "none", background: T.accent, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>Wyślij prośbę</button>
                </div>
              </div>
            )}

            {/* Pending change requests */}
            {changeRequests.filter(c => c.status === "pending").map(c => (
              <div key={c.id} style={{ background: T.surface, borderRadius: 14, padding: "14px 18px", border: `1px solid ${T.accent}15`, marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 16 }}>📋</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: 0 }}>{c.description}</p>
                  <p style={{ fontSize: 10, color: T.textDim, fontWeight: 500, margin: "2px 0 0" }}>Wysłano: {c.requestedAt}</p>
                </div>
                <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: c.statusColor + "15", color: c.statusColor }}>{c.statusLabel}</span>
              </div>
            ))}

            <PlanGrid />
          </div>

          {/* === EXTRA AVAILABLE SLOTS === */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, margin: "0 0 2px" }}>Dodatkowe wolne terminy</h2>
                <p style={{ fontSize: 12, color: T.textDim, fontWeight: 500, margin: 0 }}>Dodatkowe godziny poza stałym planem — np. na odrabianie</p>
              </div>
              <button onClick={() => setShowAddExtra(!showAddExtra)}
                onMouseEnter={e => e.target.style.background = T.success + "25"}
                onMouseLeave={e => e.target.style.background = T.success + "15"}
                style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: T.success + "15", color: T.success, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>+ Dodaj termin</button>
            </div>

            {showAddExtra && (
              <div style={{ background: T.surface, borderRadius: 16, padding: "20px 22px", border: `1px solid ${T.success}20`, marginBottom: 12, animation: "fd .2s ease" }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  <div style={{ flex: "1 1 160px" }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: T.textDim, display: "block", marginBottom: 4 }}>Data</label>
                    <input placeholder="Np. Sob 28.06" style={{ width: "100%", background: T.bg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 10, padding: "9px 12px", color: T.text, fontSize: 12, fontFamily: "inherit", outline: "none" }} />
                  </div>
                  <div style={{ flex: "1 1 160px" }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: T.textDim, display: "block", marginBottom: 4 }}>Godziny</label>
                    <input placeholder="Np. 14:00–17:00" style={{ width: "100%", background: T.bg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 10, padding: "9px 12px", color: T.text, fontSize: 12, fontFamily: "inherit", outline: "none" }} />
                  </div>
                </div>
                <input placeholder="Uwaga (opcjonalna, np. 'Tylko na odrabianie')" style={{ width: "100%", background: T.bg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 10, padding: "9px 12px", color: T.text, fontSize: 12, fontFamily: "inherit", outline: "none", marginBottom: 12 }} />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => setShowAddExtra(false)} onMouseEnter={e => e.target.style.background = T.surfaceHover} onMouseLeave={e => e.target.style.background = "transparent"} style={{ padding: "8px 18px", borderRadius: 10, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>Anuluj</button>
                  <button onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; }} onMouseLeave={e => { e.target.style.transform = "none"; }} style={{ padding: "8px 22px", borderRadius: 10, border: "none", background: T.success, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>Dodaj</button>
                </div>
              </div>
            )}

            {extraSlots.length === 0 ? (
              <p style={{ fontSize: 12, color: T.textDim, fontWeight: 500, fontStyle: "italic" }}>Brak dodatkowych terminów</p>
            ) : extraSlots.map(e => {
              const [h, setH] = useState(false);
              return (
                <div key={e.id} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 14,
                  background: h ? T.surfaceHover : T.surface, border: `1px solid ${T.cardBorder}`,
                  borderLeft: `4px solid ${T.success}`, borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
                  transition: "all .15s", transform: h ? "translateY(-1px)" : "none",
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: T.success + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>➕</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: 0 }}>{e.date} · {e.hours}</p>
                    <p style={{ fontSize: 11, color: T.textDim, fontWeight: 500, margin: "2px 0 0" }}>{e.reason}</p>
                  </div>
                  <button onMouseEnter={ev => { ev.target.style.color = T.danger; }} onMouseLeave={ev => { ev.target.style.color = T.textDim; }} style={{ background: "transparent", border: "none", color: T.textDim, fontSize: 14, cursor: "pointer", transition: "color .15s", padding: "4px 8px" }}>✕</button>
                </div>
              );
            })}
          </div>

          {/* === ABSENCE REQUESTS === */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, margin: "0 0 2px" }}>Zgłoszenia nieobecności</h2>
                <p style={{ fontSize: 12, color: T.textDim, fontWeight: 500, margin: 0 }}>Po zatwierdzeniu przez admina system automatycznie odwoła lekcje w tych terminach</p>
              </div>
              <button onClick={() => setShowAddAbsence(!showAddAbsence)}
                onMouseEnter={e => e.target.style.background = T.danger + "20"}
                onMouseLeave={e => e.target.style.background = T.danger + "12"}
                style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: T.danger + "12", color: T.danger, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>🚫 Zgłoś nieobecność</button>
            </div>

            {showAddAbsence && (
              <div style={{ background: T.surface, borderRadius: 16, padding: "20px 22px", border: `1px solid ${T.danger}15`, marginBottom: 12, animation: "fd .2s ease" }}>
                {/* Type toggle */}
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  {[{k:"urgent",l:"⚠️ Nagła",c:T.danger},{k:"planned",l:"📅 Zaplanowana",c:T.tertiary}].map(opt => (
                    <button key={opt.k} onClick={() => setAbsType(opt.k)} style={{
                      padding: "8px 18px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                      border: `1.5px solid ${absType === opt.k ? opt.c + "50" : T.cardBorder}`,
                      background: absType === opt.k ? opt.c + "15" : "transparent",
                      color: absType === opt.k ? opt.c : T.textMuted,
                      cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
                    }}>{opt.l}</button>
                  ))}
                </div>
                {/* Category */}
                {absType === "planned" && (
                  <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                    {["Urlop", "Dzień wolny", "Szkolenie", "Inne"].map(c => (
                      <button key={c} onClick={() => setAbsCategory(c)} style={{
                        padding: "5px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                        border: `1.5px solid ${absCategory === c ? T.tertiary + "50" : T.cardBorder}`,
                        background: absCategory === c ? T.tertiary + "12" : "transparent",
                        color: absCategory === c ? T.tertiary : T.textDim,
                        cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
                      }}>{c}</button>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  <div style={{ flex: "1 1 140px" }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: T.textDim, display: "block", marginBottom: 4 }}>Od</label>
                    <input placeholder={absType === "urgent" ? "Np. Dziś" : "Np. 1 lipca"} style={{ width: "100%", background: T.bg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 10, padding: "9px 12px", color: T.text, fontSize: 12, fontFamily: "inherit", outline: "none" }} />
                  </div>
                  <div style={{ flex: "1 1 140px" }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: T.textDim, display: "block", marginBottom: 4 }}>Do</label>
                    <input placeholder={absType === "urgent" ? "Np. Dziś" : "Np. 14 lipca"} style={{ width: "100%", background: T.bg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 10, padding: "9px 12px", color: T.text, fontSize: 12, fontFamily: "inherit", outline: "none" }} />
                  </div>
                  {absType === "urgent" && (
                    <div style={{ flex: "1 1 140px" }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: T.textDim, display: "block", marginBottom: 4 }}>Godziny (opcj.)</label>
                      <input placeholder="Cały dzień lub np. 16:00–20:00" style={{ width: "100%", background: T.bg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 10, padding: "9px 12px", color: T.text, fontSize: 12, fontFamily: "inherit", outline: "none" }} />
                    </div>
                  )}
                </div>
                <textarea placeholder="Opisz powód — admin musi zatwierdzić" rows={2} style={{ width: "100%", background: T.bg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 12, padding: "10px 14px", color: T.text, fontSize: 12, fontWeight: 500, fontFamily: "inherit", resize: "vertical", outline: "none", marginBottom: 10 }} />

                <div style={{ background: T.danger + "08", borderRadius: 12, padding: "10px 14px", border: `1px solid ${T.danger}12`, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>⚠️</span>
                  <p style={{ fontSize: 11, color: T.danger, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                    Po zatwierdzeniu przez admina system automatycznie odwoła dotknięte lekcje i powiadomi rodziców.
                    {absType === "urgent" && " Przy nagłej nieobecności admin zostanie powiadomiony natychmiast."}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => setShowAddAbsence(false)} onMouseEnter={e => e.target.style.background = T.surfaceHover} onMouseLeave={e => e.target.style.background = "transparent"} style={{ padding: "8px 18px", borderRadius: 10, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>Anuluj</button>
                  <button onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; }} onMouseLeave={e => { e.target.style.transform = "none"; }} style={{ padding: "8px 22px", borderRadius: 10, border: "none", background: absType === "urgent" ? T.danger : T.tertiary, color: absType === "urgent" ? "#fff" : "#1a1400", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                    {absType === "urgent" ? "Zgłoś pilnie" : "Zgłoś nieobecność"}
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {absenceRequests.map(a => {
                const [h, setH] = useState(false);
                return (
                  <div key={a.id} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 14,
                    background: h ? T.surfaceHover : T.surface,
                    border: `1px solid ${a.status === "pending" ? a.statusColor + "20" : T.cardBorder}`,
                    borderLeft: `4px solid ${a.type === "urgent" ? T.danger : T.tertiary}`,
                    borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
                    transition: "all .15s", transform: h ? "translateY(-1px)" : "none",
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: (a.type === "urgent" ? T.danger : T.tertiary) + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{a.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 800 }}>{a.from === a.to ? a.from : `${a.from} — ${a.to}`}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: T.textDim + "12", color: T.textDim }}>{a.label}</span>
                        {a.type === "urgent" && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: T.danger + "15", color: T.danger }}>PILNE</span>}
                      </div>
                      {a.note && <p style={{ fontSize: 11, color: T.textDim, fontWeight: 500, margin: "2px 0 0" }}>{a.note}</p>}
                      <p style={{ fontSize: 10, color: T.danger, fontWeight: 600, margin: "4px 0 0" }}>Dotyczy {a.affectedLessons} lekcji</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 12px", borderRadius: 8, background: a.statusColor + "15", color: a.statusColor, whiteSpace: "nowrap" }}>{a.statusLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
