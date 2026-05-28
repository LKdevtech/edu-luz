import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", secondary: "#FF6F4A", tertiary: "#FFCA28",
  accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4", danger: "#EF4444",
  cardBorder: "rgba(59,143,240,0.10)",
};

const tabs = [
  { key: "pending", label: "Oczekujące", icon: "📥" },
  { key: "sent", label: "Wysłane", icon: "📤" },
  { key: "accepted", label: "Zaakceptowane", icon: "✅" },
  { key: "history", label: "Historia", icon: "📋" },
];

const pending = [
  {
    id: 1, student: "Julia Kowalska", cls: "kl. 8", subj: "Matematyka", level: "E8",
    originalDate: "Wt 17.06, 15:30", cancelReason: "Choroba — zgłoszono >24h",
    proposedDate: "Czw 26.06, 16:00", proposedBy: "Anna Kowalska (rodzic)",
    proposedAt: "20.06, 09:15", round: 1,
    history: [],
  },
  {
    id: 2, student: "Michał Lis", cls: "2 LO", subj: "Fizyka", level: "★ŚR",
    originalDate: "Pt 13.06, 17:00", cancelReason: "Wyjazd rodzinny — zgłoszono >24h",
    proposedDate: "Sob 28.06, 11:00", proposedBy: "Tomasz Lis (rodzic)",
    proposedAt: "18.06, 14:30", round: 2,
    history: [
      { date: "16.06", who: "Korepetytor", action: "Zaproponował", proposed: "Śr 25.06, 17:00" },
      { date: "18.06", who: "Rodzic", action: "Kontropropozycja", proposed: "Sob 28.06, 11:00", reason: "Środy nie pasują — syn ma inne zajęcia" },
    ],
  },
];

const sent = [
  {
    id: 3, student: "Kacper Nowak", cls: "2 LO", subj: "Matematyka", level: "★ŚR",
    originalDate: "Czw 05.06, 14:00", cancelReason: "Korepetytor niedostępny",
    proposedDate: "Pon 23.06, 18:15", proposedBy: "Ty",
    proposedAt: "19.06, 20:00", round: 1,
    waitingSince: "2 dni",
    history: [],
  },
];

const accepted = [
  {
    id: 4, student: "Alicja Wiśniewska", cls: "1 LO", subj: "Fizyka", level: "ŚR",
    originalDate: "Pon 09.06, 16:30", proposedDate: "Pt 20.06, 16:30",
    acceptedAt: "15.06", acceptedBy: "Rodzic",
    daysUntil: 0, isToday: true,
  },
  {
    id: 5, student: "Tomek Zieliński", cls: "3 LO", subj: "Matematyka", level: "★EM",
    originalDate: "Śr 11.06, 18:15", proposedDate: "Pon 30.06, 14:00",
    acceptedAt: "17.06", acceptedBy: "Korepetytor",
    daysUntil: 10, isToday: false,
  },
];

const historyItems = [
  { id: 6, student: "Ola Szymańska", subj: "Fizyka", level: "★EM", originalDate: "Pon 02.06", result: "Odrobiona", resultDate: "Sob 07.06", color: T.success },
  { id: 7, student: "Grupa B", subj: "Matematyka", level: "SP", originalDate: "Śr 04.06", result: "Wygasła (brak odpowiedzi)", resultDate: "—", color: T.textDim },
  { id: 8, student: "Julia Kowalska", subj: "Matematyka", level: "E8", originalDate: "Pt 30.05", result: "Odrobiona", resultDate: "Wt 03.06", color: T.success },
  { id: 9, student: "Michał Lis", subj: "Fizyka", level: "★ŚR", originalDate: "Pon 26.05", result: "Odrzucona przez rodzica", resultDate: "28.05", color: T.danger },
];

const sidebarItems = [
  { icon: "📊", label: "Dashboard" }, { icon: "📅", label: "Harmonogram" },
  { icon: "📝", label: "Lekcje i wpisy" }, { icon: "🔄", label: "Odrabianie", active: true, badge: pending.length },
  { icon: "🕐", label: "Dostępność" }, { icon: "👥", label: "Moi uczniowie" },
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

function LevelTag({ level }) {
  const isR = level.includes("★");
  return <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 5, background: isR ? T.secondary + "15" : T.textDim + "12", color: isR ? T.secondary : T.textDim }}>{level}</span>;
}

function PingPongTimeline({ history }) {
  if (!history.length) return null;
  return (
    <div style={{ background: T.bgAlt, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
      <p style={{ fontSize: 9, fontWeight: 800, color: T.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: .5 }}>Historia negocjacji</p>
      {history.map((h, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < history.length - 1 ? 8 : 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: h.who === "Rodzic" ? T.accent : T.primary, flexShrink: 0 }} />
            {i < history.length - 1 && <div style={{ width: 1, flex: 1, background: T.cardBorder, minHeight: 16 }} />}
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.text, margin: 0 }}>
              <span style={{ color: h.who === "Rodzic" ? T.accent : T.primary }}>{h.who}</span> — {h.action}: <span style={{ color: T.textMuted }}>{h.proposed}</span>
            </p>
            {h.reason && <p style={{ fontSize: 10, color: T.textDim, fontWeight: 500, margin: "2px 0 0", fontStyle: "italic" }}>„{h.reason}"</p>}
            <p style={{ fontSize: 9, color: T.textDim, fontWeight: 500, margin: "1px 0 0" }}>{h.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PendingCard({ item }) {
  const [h, setH] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [counterDate, setCounterDate] = useState("");
  const [counterNote, setCounterNote] = useState("");
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: h ? T.surfaceHover : T.surface, borderRadius: 18, padding: "20px 22px",
      border: `1px solid ${T.tertiary}20`, borderLeft: `4px solid ${T.tertiary}`,
      borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
      transition: "all .2s", transform: h ? "translateY(-1px)" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 16, fontWeight: 900 }}>{item.student}</span>
        <LevelTag level={item.level} />
        <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 500 }}>{item.subj} · {item.cls}</span>
        {item.round > 1 && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: T.accent + "15", color: T.accent }}>Runda {item.round}</span>}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ background: T.danger + "08", borderRadius: 10, padding: "8px 12px", flex: "1 1 180px", border: `1px solid ${T.danger}12` }}>
          <p style={{ fontSize: 9, fontWeight: 800, color: T.danger, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: .5 }}>Odwołana lekcja</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: 0 }}>{item.originalDate}</p>
          <p style={{ fontSize: 10, color: T.textDim, fontWeight: 500, margin: "2px 0 0" }}>{item.cancelReason}</p>
        </div>
        <div style={{ background: T.success + "08", borderRadius: 10, padding: "8px 12px", flex: "1 1 180px", border: `1px solid ${T.success}12` }}>
          <p style={{ fontSize: 9, fontWeight: 800, color: T.success, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: .5 }}>Proponowany termin</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: 0 }}>{item.proposedDate}</p>
          <p style={{ fontSize: 10, color: T.textDim, fontWeight: 500, margin: "2px 0 0" }}>Od: {item.proposedBy} · {item.proposedAt}</p>
        </div>
      </div>

      <PingPongTimeline history={item.history} />

      {!showCounter ? (
        <div style={{ display: "flex", gap: 8 }}>
          <button onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; e.target.style.boxShadow = `0 4px 12px ${T.success}30`; }} onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }} style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", background: T.success, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>✓ Akceptuj termin</button>
          <button onClick={() => setShowCounter(true)} onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; }} onMouseLeave={e => { e.target.style.transform = "none"; }} style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: `1.5px solid ${T.accent}40`, background: "transparent", color: T.accent, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>↩ Kontropropozycja</button>
          <button onMouseEnter={e => { e.target.style.borderColor = T.danger; }} onMouseLeave={e => { e.target.style.borderColor = T.cardBorder; }} style={{ padding: "10px 18px", borderRadius: 12, border: `1.5px solid ${T.cardBorder}`, background: "transparent", color: T.danger, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>✗</button>
        </div>
      ) : (
        <div style={{ background: T.bgAlt, borderRadius: 14, padding: "16px 18px", animation: "fd .2s ease" }}>
          <style>{`@keyframes fd{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <p style={{ fontSize: 11, fontWeight: 800, color: T.accent, marginBottom: 10 }}>Zaproponuj inny termin:</p>
          <input value={counterDate} onChange={e => setCounterDate(e.target.value)} placeholder="Np. Pon 30.06, 16:00"
            style={{ width: "100%", background: T.bg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 13, fontWeight: 500, fontFamily: "inherit", outline: "none", marginBottom: 8 }}
            onFocus={e => e.target.style.borderColor = T.accent + "50"} onBlur={e => e.target.style.borderColor = T.cardBorder} />
          <textarea value={counterNote} onChange={e => setCounterNote(e.target.value)} placeholder="Opcjonalna uwaga (np. dlaczego ten termin nie pasuje)" rows={2}
            style={{ width: "100%", background: T.bg, border: `1.5px solid ${T.cardBorder}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 12, fontWeight: 500, fontFamily: "inherit", outline: "none", resize: "vertical", marginBottom: 10 }}
            onFocus={e => e.target.style.borderColor = T.accent + "50"} onBlur={e => e.target.style.borderColor = T.cardBorder} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => setShowCounter(false)} onMouseEnter={e => e.target.style.background = T.surfaceHover} onMouseLeave={e => e.target.style.background = "transparent"} style={{ padding: "8px 18px", borderRadius: 10, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>Anuluj</button>
            <button onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; }} onMouseLeave={e => { e.target.style.transform = "none"; }} style={{ padding: "8px 22px", borderRadius: 10, border: "none", background: T.accent, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "all .15s", opacity: counterDate ? 1 : .5 }}>Wyślij propozycję</button>
          </div>
        </div>
      )}
    </div>
  );
}

function SentCard({ item }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: h ? T.surfaceHover : T.surface, borderRadius: 18, padding: "20px 22px",
      border: `1px solid ${T.primary}15`, borderLeft: `4px solid ${T.primary}`,
      borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
      transition: "all .2s", transform: h ? "translateY(-1px)" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 16, fontWeight: 900 }}>{item.student}</span>
        <LevelTag level={item.level} />
        <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 500 }}>{item.subj} · {item.cls}</span>
        <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: T.primary + "15", color: T.primary }}>Oczekuje na rodzica · {item.waitingSince}</span>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ background: T.danger + "08", borderRadius: 10, padding: "8px 12px", flex: "1 1 180px", border: `1px solid ${T.danger}12` }}>
          <p style={{ fontSize: 9, fontWeight: 800, color: T.danger, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: .5 }}>Odwołana</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: 0 }}>{item.originalDate}</p>
        </div>
        <div style={{ background: T.primary + "08", borderRadius: 10, padding: "8px 12px", flex: "1 1 180px", border: `1px solid ${T.primary}12` }}>
          <p style={{ fontSize: 9, fontWeight: 800, color: T.primary, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: .5 }}>Twoja propozycja</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: 0 }}>{item.proposedDate}</p>
          <p style={{ fontSize: 10, color: T.textDim, fontWeight: 500, margin: "2px 0 0" }}>Wysłano: {item.proposedAt}</p>
        </div>
      </div>
      <PingPongTimeline history={item.history} />
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onMouseEnter={e => e.target.style.background = T.surfaceHover} onMouseLeave={e => e.target.style.background = "transparent"} style={{ padding: "8px 18px", borderRadius: 10, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.textMuted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>Przypomnij rodzica</button>
        <button onMouseEnter={e => { e.target.style.borderColor = T.danger; }} onMouseLeave={e => { e.target.style.borderColor = T.cardBorder; }} style={{ padding: "8px 18px", borderRadius: 10, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.danger, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>Wycofaj propozycję</button>
      </div>
    </div>
  );
}

function AcceptedCard({ item }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: h ? T.surfaceHover : T.surface, borderRadius: 18, padding: "18px 22px",
      border: `1px solid ${T.success}15`, borderLeft: `4px solid ${T.success}`,
      borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
      transition: "all .2s", transform: h ? "translateY(-1px)" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, fontWeight: 900 }}>{item.student}</span>
          <LevelTag level={item.level} />
          <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 500 }}>{item.subj}</span>
        </div>
        {item.isToday ? (
          <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 12px", borderRadius: 8, background: T.success + "20", color: T.success, animation: "pulse 2s infinite" }}>📍 Dziś!</span>
        ) : (
          <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 8, background: T.primary + "12", color: T.primary }}>Za {item.daysUntil} dni</span>
        )}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
        <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>
          <span style={{ color: T.danger, textDecoration: "line-through" }}>{item.originalDate}</span> → <span style={{ color: T.success, fontWeight: 700 }}>{item.proposedDate}</span>
        </div>
      </div>
      <p style={{ fontSize: 10, color: T.textDim, fontWeight: 500, margin: "6px 0 0" }}>Zaakceptowano {item.acceptedAt} przez {item.acceptedBy.toLowerCase()}</p>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}`}</style>
    </div>
  );
}

function HistoryRow({ item }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
      background: h ? T.surfaceHover : "transparent", borderBottom: `1px solid ${T.cardBorder}`,
      transition: "all .15s",
    }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{item.student}</span>
          <LevelTag level={item.level} />
          <span style={{ fontSize: 10, color: T.textDim, fontWeight: 500 }}>{item.subj}</span>
        </div>
        <p style={{ fontSize: 11, color: T.textDim, fontWeight: 500, margin: "2px 0 0" }}>Odwołana: {item.originalDate}</p>
      </div>
      <div style={{ textAlign: "right" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: item.color }}>{item.result}</span>
        {item.resultDate !== "—" && <p style={{ fontSize: 9, color: T.textDim, fontWeight: 500, margin: "2px 0 0" }}>{item.resultDate}</p>}
      </div>
    </div>
  );
}

export default function TutorMakeup() {
  const [activeTab, setActiveTab] = useState("pending");

  const counts = { pending: pending.length, sent: sent.length, accepted: accepted.length, history: historyItems.length };

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ height: 56, padding: "0 24px", display: "flex", alignItems: "center", background: T.bgAlt, borderBottom: `1px solid ${T.cardBorder}`, justifyContent: "space-between", flexShrink: 0 }}>
          <h1 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>Odrabianie</h1>
          <button onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; e.target.style.boxShadow = `0 4px 12px ${T.primary}30`; }} onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }} style={{ background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>+ Zaproponuj termin</button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20, background: T.bgAlt, borderRadius: 14, padding: 4, border: `1px solid ${T.cardBorder}` }}>
            {tabs.map(t => {
              const [th, setTh] = useState(false);
              const isActive = activeTab === t.key;
              return (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  onMouseEnter={() => setTh(true)} onMouseLeave={() => setTh(false)}
                  style={{
                    flex: 1, padding: "10px 12px", borderRadius: 10, border: "none",
                    background: isActive ? T.surface : th ? T.surfaceHover : "transparent",
                    color: isActive ? T.text : th ? T.text : T.textMuted,
                    fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                    transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    boxShadow: isActive ? `0 2px 8px rgba(0,0,0,.15)` : "none",
                  }}>
                  {t.icon} {t.label}
                  <span style={{
                    fontSize: 10, fontWeight: 900, padding: "1px 7px", borderRadius: 8,
                    background: isActive ? (t.key === "pending" ? T.secondary + "20" : T.primary + "15") : T.textDim + "12",
                    color: isActive ? (t.key === "pending" ? T.secondary : T.primary) : T.textDim,
                  }}>{counts[t.key]}</span>
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {activeTab === "pending" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pending.length === 0 ? (
                <div style={{ background: T.surface, borderRadius: 18, padding: "40px", textAlign: "center", border: `1px solid ${T.cardBorder}` }}>
                  <span style={{ fontSize: 28, display: "block", marginBottom: 8 }}>✅</span>
                  <p style={{ fontSize: 14, fontWeight: 800 }}>Brak oczekujących propozycji</p>
                  <p style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>Wszystko ogarnięte!</p>
                </div>
              ) : pending.map(p => <PendingCard key={p.id} item={p} />)}
            </div>
          )}

          {activeTab === "sent" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sent.length === 0 ? (
                <div style={{ background: T.surface, borderRadius: 18, padding: "40px", textAlign: "center", border: `1px solid ${T.cardBorder}` }}>
                  <p style={{ fontSize: 14, fontWeight: 800 }}>Nie masz wysłanych propozycji</p>
                </div>
              ) : sent.map(s => <SentCard key={s.id} item={s} />)}
            </div>
          )}

          {activeTab === "accepted" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {accepted.map(a => <AcceptedCard key={a.id} item={a} />)}
            </div>
          )}

          {activeTab === "history" && (
            <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.cardBorder}`, overflow: "hidden" }}>
              <div style={{ display: "flex", gap: 14, padding: "10px 16px", borderBottom: `1px solid ${T.cardBorder}`, background: T.bgAlt }}>
                <span style={{ flex: 1, fontSize: 10, fontWeight: 800, color: T.textDim, textTransform: "uppercase", letterSpacing: .5 }}>Uczeń</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: T.textDim, textTransform: "uppercase", letterSpacing: .5 }}>Wynik</span>
              </div>
              {historyItems.map(h => <HistoryRow key={h.id} item={h} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
