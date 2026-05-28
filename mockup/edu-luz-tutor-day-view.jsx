import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", secondary: "#FF6F4A", tertiary: "#FFCA28",
  accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4", danger: "#EF4444",
  cardBorder: "rgba(59,143,240,0.10)",
};

const SC = {
  planned:   { color: T.primary,  label: "Planowana",    bg: T.primary + "15" },
  completed: { color: T.success,  label: "Zrealizowana", bg: T.success + "12" },
  cancelled: { color: T.danger,   label: "Odwołana",     bg: T.danger + "10" },
  makeup:    { color: T.tertiary, label: "Odrabianie",   bg: T.tertiary + "12" },
};

const days = ["Pon 16.06", "Wt 17.06", "Śr 18.06", "Czw 19.06", "Pt 20.06", "Sob 21.06", "Nd 22.06"];
const daysFull = ["Poniedziałek, 16.06", "Wtorek, 17.06", "Środa, 18.06", "Czwartek, 19.06", "Piątek, 20.06", "Sobota, 21.06", "Niedziela, 22.06"];

const allLessons = {
  0: [
    { h:14,m:0,dur:60,subj:"Matematyka",student:"Kacper Nowak",cls:"2 LO",room:"Sala 1",form:"indyw.",status:"completed",isRozsz:true,level:"sr",
      prev:{topic:"Ciągi arytmetyczne — suma",note:"Kacper dobrze opanował wzory. Ćwiczyć zastosowania.",hw:"Zad. 3.8–3.15 str. 72"}},
    { h:15,m:15,dur:60,subj:"Matematyka",student:"Grupa A",cls:"kl. 7–8",room:"Sala 1",form:"grupa",status:"completed",isRozsz:false,level:"sp",
      prev:{topic:"Ułamki — mnożenie i dzielenie",note:"Kasia słabo z dzieleniem. Tomek OK.",hw:null}},
    { h:16,m:30,dur:90,subj:"Fizyka",student:"Alicja Wiśniewska",cls:"1 LO",room:"Sala 2",form:"indyw.",status:"completed",isRozsz:false,level:"sr",
      prev:{topic:"Kinematyka — ruch jednostajny",note:"Rozumie wzory, problem z wykresami v(t).",hw:"Wykres v(t) dla 3 zadań"}},
  ],
  1: [
    { h:14,m:0,dur:60,subj:"Matematyka",student:"Tomek Zieliński",cls:"3 LO",room:"Sala 1",form:"indyw.",status:"completed",isRozsz:true,level:"em",
      prev:{topic:"Prawdopodobieństwo — zadania CKE",note:"6 zadań z arkuszy. Tomek robi postępy.",hw:"Arkusz maj 2023, zad. 25–30"}},
    { h:15,m:30,dur:45,subj:"Matematyka",student:"Julia Kowalska",cls:"kl. 8",room:"Sala 1",form:"indyw.",status:"cancelled",isRozsz:false,level:"e8",
      prev:{topic:"Geometria — pola figur",note:"Powtórka pola trójkątów konieczna.",hw:null}},
    { h:17,m:0,dur:120,subj:"Fizyka",student:"Michał Lis",cls:"2 LO",room:"Sala 2",form:"indyw.",status:"completed",isRozsz:true,level:"sr",
      prev:{topic:"Prawo Ohma — obwody szeregowe",note:"Zaczyna rozumieć. Następne: obwody równoległe.",hw:"Zad. 1–8 karta 'Obwody'"}},
  ],
  2: [
    { h:14,m:0,dur:60,subj:"Matematyka",student:"Kacper Nowak",cls:"2 LO",room:"Sala 1",form:"indyw.",status:"completed",isRozsz:true,level:"sr",
      prev:{topic:"Ciągi geometryczne — obliczanie sumy",note:"Opanował wzory, ćwiczymy zastosowania.",hw:"Zad. 5.1–5.10 str. 94"}},
    { h:15,m:15,dur:90,subj:"Matematyka",student:"Grupa B",cls:"kl. 7",room:"Sala 3",form:"grupa",status:"completed",isRozsz:false,level:"sp",
      prev:{topic:"Procenty — obliczanie z liczby",note:"Mateusz i Ola OK. Filip wymaga uwagi.",hw:"Karta pracy 'Procenty'"}},
    { h:17,m:0,dur:45,subj:"Fizyka",student:"Ola Szymańska",cls:"3 LO",room:"Sala 2",form:"indyw.",status:"completed",isRozsz:true,level:"em",
      prev:{topic:"Optyka — soczewki skupiające",note:"Świetnie rysuje biegi promieni.",hw:"Powtórka: fale mechaniczne"}},
  ],
  3: [
    { h:14,m:0,dur:60,subj:"Matematyka",student:"Kacper Nowak",cls:"2 LO",room:"Sala 1",form:"indyw.",status:"planned",isRozsz:true,level:"sr",
      prev:{topic:"Ciągi geometryczne — obliczanie sumy",note:"Opanował wzory, ćwiczymy zastosowania.",hw:"Zad. 5.1–5.10 str. 94"}},
    { h:15,m:15,dur:45,subj:"Matematyka",student:"Grupa A",cls:"kl. 7–8",room:"Sala 1",form:"grupa",status:"planned",isRozsz:false,level:"sp",
      prev:{topic:"Ułamki zwykłe — dodawanie i odejmowanie",note:"Powtórka NWW konieczna.",hw:null}},
    { h:16,m:30,dur:90,subj:"Fizyka",student:"Alicja Wiśniewska",cls:"1 LO",room:"Sala 2",form:"indyw.",status:"planned",isRozsz:false,level:"sr",
      prev:{topic:"Kinematyka — ruch j. przyspieszony",note:"Rozumie wzory, problem z wykresami.",hw:"Wykres v(t) i s(t) dla 3 zadań"}},
    { h:18,m:15,dur:45,subj:"Matematyka",student:"Tomek Zieliński",cls:"3 LO",room:"Sala 1",form:"indyw.",status:"planned",isRozsz:true,level:"em",
      prev:{topic:"Prawdopodobieństwo — zadania maturalne",note:"Przeszliśmy 6 zadań z CKE 2024.",hw:"Arkusz maj 2023 — zad. 25–30"}},
  ],
  4: [
    { h:14,m:0,dur:60,subj:"Matematyka",student:"Tomek Zieliński",cls:"3 LO",room:"Sala 1",form:"indyw.",status:"planned",isRozsz:true,level:"em",prev:null},
    { h:15,m:30,dur:90,subj:"Fizyka",student:"Michał Lis",cls:"2 LO",room:"Sala 2",form:"indyw.",status:"planned",isRozsz:true,level:"sr",
      prev:{topic:"Prawo Ohma — obwody szeregowe",note:"Zaczyna rozumieć obwody.",hw:"Zad. 1–8 karta 'Obwody'"}},
    { h:17,m:30,dur:60,subj:"Matematyka",student:"Julia Kowalska",cls:"kl. 8",room:"Sala 1",form:"indyw.",status:"makeup",isRozsz:false,level:"e8",
      prev:{topic:"Geometria — pola figur złożonych",note:"Wymaga powtórki pola trójkątów.",hw:null}},
  ],
  5: [
    { h:9,m:0,dur:45,subj:"Matematyka",student:"Kacper Nowak",cls:"2 LO",room:"Sala 1",form:"indyw.",status:"planned",isRozsz:true,level:"sr",prev:null},
    { h:10,m:15,dur:90,subj:"Fizyka",student:"Grupa C",cls:"1–2 LO",room:"Sala 1",form:"grupa",status:"planned",isRozsz:false,level:"sr",prev:null},
  ],
  6: [
    { h:10,m:0,dur:60,subj:"Matematyka",student:"Tomek Zieliński",cls:"3 LO",room:"Sala 1",form:"indyw.",status:"planned",isRozsz:true,level:"em",
      prev:{topic:"Funkcje trygonometryczne — wykresy",note:"Tomek potrzebuje powtórki z okresów funkcji.",hw:"Zad. z karty 'Trygonometria'"}},
  ],
};

const sidebarItems = [
  { icon: "📊", label: "Dashboard" }, { icon: "📅", label: "Harmonogram", active: true },
  { icon: "📝", label: "Lekcje i wpisy" }, { icon: "🔄", label: "Odrabianie", badge: 2 },
  { icon: "🕐", label: "Dostępność" }, { icon: "👥", label: "Moi uczniowie" },
];

function LevelTag({ level, isRozsz }) {
  const tags = { sp: "SP", e8: "E8", sr: "ŚR", em: "EM" };
  const tag = tags[level] || "";
  const lbl = (isRozsz ? "★" : "") + tag;
  if (!lbl) return null;
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
      background: isRozsz ? T.secondary + "15" : T.textDim + "12",
      color: isRozsz ? T.secondary : T.textDim,
    }}>{lbl}</span>
  );
}

function PrevPanel({ lesson, onClose }) {
  const sc = SC[lesson.status];
  const p = lesson.prev;
  return (
    <div style={{
      background: T.surface, borderRadius: 16, padding: "18px 20px",
      border: `1px solid ${sc.color}25`, borderLeft: `4px solid ${sc.color}`,
      borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
      marginTop: 6, animation: "fd .2s ease",
    }}>
      <style>{`@keyframes fd{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, fontWeight: 900 }}>{lesson.student}</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: sc.bg, color: sc.color }}>{sc.label}</span>
          <LevelTag level={lesson.level} isRozsz={lesson.isRozsz} />
          <span style={{ fontSize: 10, color: T.textDim, fontWeight: 600 }}>{lesson.subj} · {lesson.cls} · {lesson.room}</span>
        </div>
        <button onClick={onClose}
          onMouseEnter={e => e.target.style.color = T.text}
          onMouseLeave={e => e.target.style.color = T.textDim}
          style={{ background: "transparent", border: "none", color: T.textDim, fontSize: 16, cursor: "pointer", transition: "color .15s", fontFamily: "inherit", padding: "0 4px" }}>✕</button>
      </div>
      <p style={{ fontSize: 10, fontWeight: 800, color: T.accent, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Z poprzednich zajęć:</p>
      {p ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ background: T.bgAlt, borderRadius: 12, padding: "11px 14px" }}>
            <p style={{ fontSize: 9, fontWeight: 800, color: T.textDim, marginBottom: 3, textTransform: "uppercase", letterSpacing: .5 }}>Temat</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0, lineHeight: 1.5 }}>{p.topic}</p>
          </div>
          <div style={{ background: T.bgAlt, borderRadius: 12, padding: "11px 14px" }}>
            <p style={{ fontSize: 9, fontWeight: 800, color: T.textDim, marginBottom: 3, textTransform: "uppercase", letterSpacing: .5 }}>Notatka</p>
            <p style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, margin: 0, lineHeight: 1.7 }}>{p.note}</p>
          </div>
          <div style={{
            background: p.hw ? T.primary + "08" : T.danger + "06",
            borderRadius: 12, padding: "10px 14px",
            border: `1px solid ${p.hw ? T.primary + "12" : T.danger + "10"}`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 14 }}>{p.hw ? "📝" : "—"}</span>
            <div>
              <p style={{ fontSize: 9, fontWeight: 800, color: T.textDim, marginBottom: 2, textTransform: "uppercase", letterSpacing: .5 }}>Praca domowa do sprawdzenia</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: p.hw ? T.text : T.textDim, margin: 0, fontStyle: p.hw ? "normal" : "italic" }}>{p.hw || "Nie zadano"}</p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: T.bgAlt, borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: T.textDim, fontWeight: 500, margin: 0 }}>Brak poprzednich zajęć z tym uczniem</p>
        </div>
      )}
    </div>
  );
}

export default function TutorDayView() {
  const [selDay, setSelDay] = useState(3);
  const [selIdx, setSelIdx] = useState(null);

  const lessons = allLessons[selDay] || [];

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* SIDEBAR */}
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

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* TOPBAR */}
        <div style={{ height: 56, padding: "0 24px", display: "flex", alignItems: "center", background: T.bgAlt, borderBottom: `1px solid ${T.cardBorder}`, justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>Harmonogram — widok dzienny</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onMouseEnter={e => e.target.style.background = T.surfaceHover} onMouseLeave={e => e.target.style.background = T.surface} style={{ background: T.surface, border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: T.textDim, fontSize: 14, fontFamily: "inherit", transition: "background .15s" }}>←</button>
            <button onMouseEnter={e => e.target.style.background = T.primary + "18"} onMouseLeave={e => e.target.style.background = T.surface} style={{ background: T.surface, border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "5px 14px", cursor: "pointer", color: T.primary, fontSize: 12, fontWeight: 700, fontFamily: "inherit", transition: "all .15s" }}>Dziś</button>
            <button onMouseEnter={e => e.target.style.background = T.surfaceHover} onMouseLeave={e => e.target.style.background = T.surface} style={{ background: T.surface, border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: T.textDim, fontSize: 14, fontFamily: "inherit", transition: "background .15s" }}>→</button>
            <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: `1px solid ${T.cardBorder}`, marginLeft: 6 }}>
              <button style={{ padding: "6px 16px", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit", background: "transparent", color: T.textDim }}>Tydzień</button>
              <button style={{ padding: "6px 16px", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit", background: T.primary + "25", color: T.primary }}>Dzień</button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
          {/* Legend */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
            {Object.entries(SC).map(([k, v]) => (<span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9, fontWeight: 700, color: v.color }}><span style={{ width: 7, height: 7, borderRadius: 3, background: v.color }} /> {v.label}</span>))}
            <span style={{ marginLeft: 6, fontSize: 9, color: T.textDim, fontWeight: 700 }}>|</span>
            {["SP", "E8", "ŚR", "EM"].map(t => (<span key={t} style={{ fontSize: 9, fontWeight: 800, color: T.textDim, padding: "1px 5px", borderRadius: 3, background: T.textDim + "12" }}>{t}</span>))}
            <span style={{ fontSize: 9, color: T.secondary, fontWeight: 800 }}>★ = rozszerzenie</span>
            <span style={{ marginLeft: "auto", fontSize: 10, color: T.textDim }}>Kliknij → dane z poprzednich zajęć</span>
          </div>

          {/* Day selector */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {days.map((d, i) => {
              const [dh, setDh] = useState(false);
              const count = (allLessons[i] || []).length;
              const isToday = i === 3;
              return (
                <button key={d} onClick={() => { setSelDay(i); setSelIdx(null); }}
                  onMouseEnter={() => setDh(true)} onMouseLeave={() => setDh(false)}
                  style={{
                    padding: "10px 18px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
                    border: isToday ? `2px solid ${T.primary}40` : `1.5px solid ${T.cardBorder}`,
                    background: selDay === i ? T.primary + "20" : dh ? T.surfaceHover : T.surface,
                    color: selDay === i ? T.primary : dh ? T.text : T.textMuted,
                    fontSize: 13, fontWeight: 800, transition: "all .15s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  }}>
                  <span>{d}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: selDay === i ? T.primary : T.textDim }}>{count} lekcji</span>
                </button>
              );
            })}
          </div>

          {/* Selected day title */}
          <h2 style={{ fontSize: 18, fontWeight: 900, margin: "0 0 14px" }}>
            {daysFull[selDay]}
            {selDay === 3 && <span style={{ fontSize: 12, fontWeight: 700, color: T.primary, marginLeft: 10 }}>— dziś</span>}
            <span style={{ fontSize: 12, fontWeight: 500, color: T.textDim, marginLeft: 10 }}>{lessons.length} lekcji · {Math.round(lessons.reduce((a, l) => a + l.dur, 0) / 60)}h</span>
          </h2>

          {/* Lessons */}
          {lessons.length === 0 ? (
            <div style={{ background: T.surface, borderRadius: 18, padding: "48px 24px", textAlign: "center", border: `1px solid ${T.cardBorder}` }}>
              <span style={{ fontSize: 36, display: "block", marginBottom: 12 }}>🏖️</span>
              <p style={{ fontSize: 16, fontWeight: 800 }}>Brak lekcji tego dnia</p>
              <p style={{ fontSize: 13, color: T.textMuted, fontWeight: 500 }}>Wolne — odpoczywaj!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {lessons.map((l, i) => {
                const [h, setH] = useState(false);
                const sc = SC[l.status];
                const isSel = selIdx === i;
                const isCan = l.status === "cancelled";
                const s = `${l.h}:${String(l.m).padStart(2, "0")}`;
                const em = l.h * 60 + l.m + l.dur;
                const e = `${Math.floor(em / 60)}:${String(em % 60).padStart(2, "0")}`;

                return (
                  <div key={i}>
                    <div onClick={() => setSelIdx(isSel ? null : i)}
                      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
                      style={{
                        display: "flex", gap: 14, padding: "16px 18px", borderRadius: 16,
                        background: isSel ? sc.color + "10" : h ? T.surfaceHover : T.surface,
                        border: `1px solid ${isSel ? sc.color + "30" : T.cardBorder}`,
                        borderLeft: `4px solid ${sc.color}`,
                        borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
                        transition: "all .2s", transform: h ? "translateY(-1px)" : "none",
                        cursor: "pointer", opacity: isCan ? 0.6 : 1,
                      }}>
                      {/* Time */}
                      <div style={{ width: 50, flexShrink: 0, textAlign: "center" }}>
                        <p style={{ fontSize: 16, fontWeight: 900, color: sc.color, margin: 0 }}>{s}</p>
                        <p style={{ fontSize: 10, color: T.textDim, fontWeight: 500, margin: "2px 0" }}>{e}</p>
                        <p style={{ fontSize: 9, color: T.textDim, fontWeight: 600 }}>{l.dur} min</p>
                      </div>

                      <div style={{ width: 4, borderRadius: 4, background: sc.color, flexShrink: 0 }} />

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 15, fontWeight: 800, textDecoration: isCan ? "line-through" : "none" }}>{l.student}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: sc.bg, color: sc.color }}>{sc.label}</span>
                          <LevelTag level={l.level} isRozsz={l.isRozsz} />
                        </div>
                        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>{l.subj} · {l.cls}</span>
                        </div>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: T.bgAlt, color: T.textDim }}>🚪 {l.room}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: T.bgAlt, color: T.textDim }}>{l.form === "grupa" ? "👥 Grupa" : "👤 Indyw."}</span>
                          {l.status === "makeup" && <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 7px", borderRadius: 5, background: T.tertiary + "18", color: T.tertiary }}>🔄 Odrabianie</span>}
                          {l.prev?.hw && <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: T.primary + "12", color: T.primary }}>📝 Sprawdź PD</span>}
                        </div>
                      </div>

                      {/* Expand arrow */}
                      <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 12, color: T.textDim, transition: "transform .2s", transform: isSel ? "rotate(180deg)" : "none" }}>▼</span>
                      </div>
                    </div>

                    {isSel && <PrevPanel lesson={l} onClose={() => setSelIdx(null)} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
