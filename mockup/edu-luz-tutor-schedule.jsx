import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", primaryDark: "#2D7DE8", secondary: "#FF6F4A",
  tertiary: "#FFCA28", accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4",
  danger: "#EF4444",
  cardBorder: "rgba(59,143,240,0.10)",
};

const SC = {
  planned:   { color: T.primary,  label: "Planowana",    bg: T.primary + "15", border: T.primary + "35" },
  completed: { color: T.success,  label: "Zrealizowana", bg: T.success + "12", border: T.success + "30" },
  cancelled: { color: T.danger,   label: "Odwołana",     bg: T.danger + "10",  border: T.danger + "25" },
  makeup:    { color: T.tertiary, label: "Odrabianie",   bg: T.tertiary + "12", border: T.tertiary + "30" },
};

const days = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
const daysFull = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
const dates = ["16.06", "17.06", "18.06", "19.06", "20.06", "21.06", "22.06"];

// Each lesson: { day, h, m, dur, subj, student, cls, room, form, status, isRozsz, level, prev }
// level: "sp"=Szkoła Podstawowa, "e8"=Egzamin 8-kl, "sr"=Średnia, "em"=Egz. Maturalny
// prev = data from PREVIOUS lesson with this student
const L = [
  { day:0, h:14, m:0,  dur:60,  subj:"Matematyka", student:"Kacper Nowak",     cls:"2 LO",   room:"Sala 1", form:"indyw.", status:"completed", isRozsz:true, level:"sr",
    prev:{ topic:"Ciągi arytmetyczne — suma", note:"Kacper dobrze opanował wzory. Ćwiczyć zastosowania.", hw:"Zad. 3.8–3.15 str. 72" }},
  { day:0, h:15, m:15, dur:60,  subj:"Matematyka", student:"Grupa A",          cls:"kl. 7–8", room:"Sala 1", form:"grupa",  status:"completed", isRozsz:false, level:"sp",
    prev:{ topic:"Ułamki — mnożenie i dzielenie", note:"Kasia słabo z dzieleniem. Tomek OK. Powtórka NWW.", hw:null }},
  { day:0, h:16, m:30, dur:90,  subj:"Fizyka",     student:"Alicja Wiśniewska", cls:"1 LO",   room:"Sala 2", form:"indyw.", status:"completed", isRozsz:false, level:"sr",
    prev:{ topic:"Kinematyka — ruch jednostajny", note:"Alicja rozumie wzory, problem z wykresami v(t).", hw:"Wykres v(t) dla 3 zadań" }},
  { day:1, h:14, m:0,  dur:60,  subj:"Matematyka", student:"Tomek Zieliński",   cls:"3 LO",   room:"Sala 1", form:"indyw.", status:"completed", isRozsz:true, level:"em",
    prev:{ topic:"Prawdopodobieństwo — zadania CKE", note:"6 zadań z arkuszy. Tomek robi postępy.", hw:"Arkusz maj 2023, zad. 25–30" }},
  { day:1, h:15, m:30, dur:45,  subj:"Matematyka", student:"Julia Kowalska",    cls:"kl. 8",  room:"Sala 1", form:"indyw.", status:"cancelled", isRozsz:false, level:"e8",
    prev:{ topic:"Geometria — pola figur", note:"Powtórka pola trójkątów. Julia wymaga ćwiczeń.", hw:null }},
  { day:1, h:17, m:0,  dur:120, subj:"Fizyka",     student:"Michał Lis",        cls:"2 LO",   room:"Sala 2", form:"indyw.", status:"completed", isRozsz:true, level:"sr",
    prev:{ topic:"Prawo Ohma — obwody szeregowe", note:"Michał zaczyna rozumieć. Następne: obwody równoległe.", hw:"Zad. 1–8 karta 'Obwody'" }},
  { day:2, h:14, m:0,  dur:60,  subj:"Matematyka", student:"Kacper Nowak",      cls:"2 LO",   room:"Sala 1", form:"indyw.", status:"completed", isRozsz:true, level:"sr",
    prev:{ topic:"Ciągi arytmetyczne — wzór na n-ty wyraz", note:"Kontynuacja ciągów. Opanował wzory.", hw:"Zad. 4.12–4.18 str. 87" }},
  { day:2, h:15, m:15, dur:90,  subj:"Matematyka", student:"Grupa B",           cls:"kl. 7",  room:"Sala 3", form:"grupa",  status:"completed", isRozsz:false, level:"sp",
    prev:{ topic:"Procenty — obliczanie z liczby", note:"Mateusz i Ola OK. Filip — dodatkowa uwaga.", hw:"Karta pracy 'Procenty'" }},
  { day:2, h:17, m:0,  dur:45,  subj:"Fizyka",     student:"Ola Szymańska",     cls:"3 LO",   room:"Sala 2", form:"indyw.", status:"completed", isRozsz:true, level:"em",
    prev:{ topic:"Optyka — soczewki skupiające", note:"Ola świetnie rysuje biegi promieni.", hw:"Powtórka: fale mechaniczne" }},
  // Czwartek — dziś, planowane
  { day:3, h:14, m:0,  dur:60,  subj:"Matematyka", student:"Kacper Nowak",      cls:"2 LO",   room:"Sala 1", form:"indyw.", status:"planned", isRozsz:true, level:"sr",
    prev:{ topic:"Ciągi geometryczne — obliczanie sumy", note:"Kacper opanował wzory, ćwiczymy zastosowania.", hw:"Zad. 5.1–5.10 str. 94" }},
  { day:3, h:15, m:15, dur:45,  subj:"Matematyka", student:"Grupa A",           cls:"kl. 7–8", room:"Sala 1", form:"grupa", status:"planned", isRozsz:false, level:"sp",
    prev:{ topic:"Ułamki zwykłe — dodawanie i odejmowanie", note:"Powtórka NWW konieczna. Kasia i Tomek słabo.", hw:null }},
  { day:3, h:16, m:30, dur:90,  subj:"Fizyka",     student:"Alicja Wiśniewska", cls:"1 LO",   room:"Sala 2", form:"indyw.", status:"planned", isRozsz:false, level:"sr",
    prev:{ topic:"Kinematyka — ruch j. przyspieszony", note:"Rozumie wzory, problem z wykresami v(t).", hw:"Wykres v(t) i s(t) dla 3 zadań" }},
  { day:3, h:18, m:15, dur:45,  subj:"Matematyka", student:"Tomek Zieliński",   cls:"3 LO",   room:"Sala 1", form:"indyw.", status:"planned", isRozsz:true, level:"em",
    prev:{ topic:"Prawdopodobieństwo — zadania maturalne", note:"Przeszliśmy 6 zadań z CKE 2024.", hw:"Arkusz maj 2023 — zad. 25–30" }},
  // Piątek
  { day:4, h:14, m:0,  dur:60,  subj:"Matematyka", student:"Tomek Zieliński",   cls:"3 LO",   room:"Sala 1", form:"indyw.", status:"planned", isRozsz:true, level:"em",
    prev:null },
  { day:4, h:15, m:30, dur:90,  subj:"Fizyka",     student:"Michał Lis",        cls:"2 LO",   room:"Sala 2", form:"indyw.", status:"planned", isRozsz:true, level:"sr",
    prev:{ topic:"Elektryczność — prawo Ohma, obwody", note:"Zaczyna rozumieć obwody.", hw:"Zad. 1–8 karta 'Obwody'" }},
  { day:4, h:17, m:30, dur:60,  subj:"Matematyka", student:"Julia Kowalska",    cls:"kl. 8",  room:"Sala 1", form:"indyw.", status:"makeup", isRozsz:false, level:"e8",
    prev:{ topic:"Geometria — pola figur złożonych", note:"Julia wymaga powtórki pola trójkątów.", hw:null }},
  // Sobota
  { day:5, h:9,  m:0,  dur:45,  subj:"Matematyka", student:"Kacper Nowak",      cls:"2 LO",   room:"Sala 1", form:"indyw.", status:"planned", isRozsz:true, level:"sr",
    prev:null },
  { day:5, h:10, m:15, dur:90,  subj:"Fizyka",     student:"Grupa C",           cls:"1–2 LO", room:"Sala 1", form:"grupa",  status:"planned", isRozsz:false, level:"sr",
    prev:null },
  { day:6, h:10, m:0,  dur:60,  subj:"Matematyka", student:"Tomek Zieliński",   cls:"3 LO",   room:"Sala 1", form:"indyw.", status:"planned", isRozsz:true, level:"em",
    prev:{ topic:"Funkcje trygonometryczne — wykresy", note:"Tomek potrzebuje powtórki z okresów funkcji.", hw:"Zad. z karty 'Trygonometria'" }},
];

const sidebarItems = [
  { icon: "📊", label: "Dashboard" }, { icon: "📅", label: "Harmonogram", active: true },
  { icon: "📝", label: "Lekcje i wpisy" }, { icon: "🔄", label: "Odrabianie", badge: 2 },
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

function PrevDetail({ lesson, onClose }) {
  const sc = SC[lesson.status];
  const p = lesson.prev;
  return (
    <div style={{ background: T.surface, borderRadius: 16, padding: "18px 20px", border: `1px solid ${sc.border}`, borderLeft: `4px solid ${sc.color}`, borderTopLeftRadius: 4, borderBottomLeftRadius: 4, marginTop: 6, animation: "fd .2s ease" }}>
      <style>{`@keyframes fd{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 900 }}>{lesson.student}</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: sc.bg, color: sc.color }}>{sc.label}</span>
          <span style={{ fontSize: 10, color: T.textDim, fontWeight: 600 }}>{lesson.subj} · {lesson.cls} · {lesson.room}</span>
          {(()=>{ const tags={sp:"SP",e8:"E8",sr:"ŚR",em:"EM"}; const tag=tags[lesson.level]||""; const lbl=(lesson.isRozsz?"★":"")+tag; return lbl?<span style={{fontSize:10,fontWeight:800,padding:"2px 7px",borderRadius:5,background:lesson.isRozsz?T.secondary+"15":T.textDim+"15",color:lesson.isRozsz?T.secondary:T.textDim}}>{lbl}</span>:null; })()}
        </div>
        <button onClick={onClose} onMouseEnter={e => e.target.style.color = T.text} onMouseLeave={e => e.target.style.color = T.textDim} style={{ background: "transparent", border: "none", color: T.textDim, fontSize: 16, cursor: "pointer", transition: "color .15s", fontFamily: "inherit", padding: "0 4px" }}>✕</button>
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
          <div style={{ background: p.hw ? T.primary + "08" : T.danger + "06", borderRadius: 12, padding: "10px 14px", border: `1px solid ${p.hw ? T.primary + "12" : T.danger + "10"}`, display: "flex", alignItems: "center", gap: 10 }}>
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

function WeekView({ onSel, selId }) {
  const HH = 56, SH = 9, EH = 20;
  return (
    <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.cardBorder}`, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "50px repeat(7, 1fr)", borderBottom: `1px solid ${T.cardBorder}` }}>
        <div style={{ padding: "10px 4px", fontSize: 10, color: T.textDim, fontWeight: 700, textAlign: "center" }}>⏰</div>
        {days.map((d, i) => (<div key={d} style={{ padding: "8px 4px", textAlign: "center", borderLeft: `1px solid ${T.cardBorder}`, background: i === 3 ? T.primary + "06" : "transparent" }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: i === 3 ? T.primary : T.textMuted, margin: 0 }}>{d} <span style={{ fontWeight: 500, fontSize: 9 }}>{dates[i]}</span></p>
        </div>))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "50px repeat(7, 1fr)" }}>
        <div>{Array.from({length: EH-SH+1},(_,i)=>SH+i).map(h=>(<div key={h} style={{height:HH,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:3,fontSize:9,color:T.textDim,fontWeight:600}}>{h}:00</div>))}</div>
        {days.map((_,di)=>(
          <div key={di} style={{position:"relative",borderLeft:`1px solid ${T.cardBorder}`,minHeight:(EH-SH+1)*HH,background:di===3?T.primary+"03":"transparent"}}>
            {Array.from({length:EH-SH+1},(_,i)=>SH+i).map(h=>(<div key={h} style={{position:"absolute",top:(h-SH)*HH,left:0,right:0,height:1,background:T.cardBorder}}/>))}
            {L.filter(l=>l.day===di).map((l,li)=>{
              const [bh,setBh]=useState(false);
              const sc=SC[l.status];
              const top=(l.h-SH)*HH+(l.m/60)*HH;
              const height=(l.dur/60)*HH;
              const lid=`${l.day}-${l.h}-${l.m}`;
              const isSel=selId===lid;
              const tiny=height<46;
              return(
                <div key={li} onClick={()=>onSel(isSel?null:lid,l)}
                  onMouseEnter={()=>setBh(true)} onMouseLeave={()=>setBh(false)}
                  style={{
                    position:"absolute",top,left:2,right:2,height:height-3,
                    background:isSel?sc.color+"25":bh?sc.color+"22":sc.bg,
                    border:`1px solid ${isSel?sc.color+"60":sc.border}`,
                    borderLeft:`3px solid ${sc.color}`,borderRadius:6,
                    padding:tiny?"2px 4px":"3px 5px",overflow:"hidden",
                    cursor:"pointer",transition:"all .15s",
                    transform:bh?"scale(1.02)":"none",zIndex:bh||isSel?10:1,
                    opacity:l.status==="cancelled"?.5:1,
                  }}>
                  <p style={{fontSize:tiny?8:9,fontWeight:800,color:sc.color,margin:0,lineHeight:1.2,textDecoration:l.status==="cancelled"?"line-through":"none",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{l.student}</p>
                  {!tiny&&<p style={{fontSize:8,color:T.textMuted,fontWeight:600,margin:0,lineHeight:1.2}}>{l.cls}</p>}
                  {!tiny&&height>50&&<p style={{fontSize:7,color:T.textDim,margin:"1px 0 0"}}>{l.room}</p>}
                  {(()=>{ const tags={sp:"SP",e8:"E8",sr:"ŚR",em:"EM"}; const tag=tags[l.level]||""; const lbl=(l.isRozsz?"★":"")+tag; return lbl?<span style={{position:"absolute",bottom:tiny?0:1,right:3,fontSize:tiny?6:7,fontWeight:900,color:l.isRozsz?T.secondary:T.textDim,lineHeight:1,letterSpacing:.3}}>{lbl}</span>:null; })()}
                  {l.status==="makeup"&&!tiny&&<span style={{position:"absolute",top:2,right:3,fontSize:7,fontWeight:900,padding:"0 3px",borderRadius:2,background:T.tertiary+"30",color:T.tertiary}}>ODR</span>}
                  {l.prev?.hw&&!tiny&&height>50&&<span style={{position:"absolute",bottom:2,left:4,fontSize:7}}>📝</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function DayView({ dayIdx, onSel, selId, selLesson }) {
  const dl=L.filter(l=>l.day===dayIdx);
  if(!dl.length) return(<div style={{background:T.surface,borderRadius:16,padding:"40px 24px",textAlign:"center",border:`1px solid ${T.cardBorder}`}}><span style={{fontSize:32,display:"block",marginBottom:8}}>🏖️</span><p style={{fontSize:15,fontWeight:800}}>Brak lekcji</p><p style={{fontSize:13,color:T.textMuted,fontWeight:500}}>Wolne!</p></div>);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {dl.map((l,i)=>{
        const [h,setH]=useState(false);
        const sc=SC[l.status];
        const s=`${l.h}:${String(l.m).padStart(2,"0")}`;
        const em=l.h*60+l.m+l.dur;
        const e=`${Math.floor(em/60)}:${String(em%60).padStart(2,"0")}`;
        const lid=`${l.day}-${l.h}-${l.m}`;
        const isSel=selId===lid;
        return(
          <div key={i}>
            <div onClick={()=>onSel(isSel?null:lid,l)} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{
              display:"flex",gap:14,padding:"14px 16px",borderRadius:16,
              background:isSel?sc.color+"10":h?T.surfaceHover:T.surface,
              border:`1px solid ${isSel?sc.color+"30":T.cardBorder}`,
              borderLeft:`4px solid ${sc.color}`,borderTopLeftRadius:4,borderBottomLeftRadius:4,
              transition:"all .2s",transform:h?"translateY(-1px)":"none",
              cursor:"pointer",opacity:l.status==="cancelled"?.6:1,
            }}>
              <div style={{width:48,flexShrink:0,textAlign:"center"}}>
                <p style={{fontSize:15,fontWeight:900,color:sc.color,margin:0}}>{s}</p>
                <p style={{fontSize:10,color:T.textDim,fontWeight:500,margin:"2px 0"}}>{e}</p>
                <p style={{fontSize:9,color:T.textDim,fontWeight:600}}>{l.dur} min</p>
              </div>
              <div style={{width:4,borderRadius:4,background:sc.color,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:14,fontWeight:800,textDecoration:l.status==="cancelled"?"line-through":"none"}}>{l.student}</span>
                  <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:6,background:sc.bg,color:sc.color}}>{sc.label}</span>
                  {(()=>{ const tags={sp:"SP",e8:"E8",sr:"ŚR",em:"EM"}; const tag=tags[l.level]||""; const lbl=(l.isRozsz?"★":"")+tag; return lbl?<span style={{fontSize:10,fontWeight:800,padding:"2px 7px",borderRadius:5,background:l.isRozsz?T.secondary+"15":T.textDim+"15",color:l.isRozsz?T.secondary:T.textDim}}>{lbl}</span>:null; })()}
                </div>
                <div style={{display:"flex",gap:8,marginBottom:4}}>
                  <span style={{fontSize:11,color:T.textMuted,fontWeight:600}}>{l.subj} · {l.cls}</span>
                </div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:5,background:T.bgAlt,color:T.textDim}}>🚪 {l.room}</span>
                  <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:5,background:T.bgAlt,color:T.textDim}}>{l.form==="grupa"?"👥 Grupa":"👤 Indyw."}</span>
                  {l.status==="makeup"&&<span style={{fontSize:8,fontWeight:800,padding:"2px 6px",borderRadius:4,background:T.tertiary+"18",color:T.tertiary}}>🔄 ODR</span>}
                  {l.prev?.hw&&<span style={{fontSize:8,fontWeight:700,padding:"2px 6px",borderRadius:4,background:T.primary+"12",color:T.primary}}>📝 Sprawdź PD</span>}
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center"}}>
                <span style={{fontSize:11,color:T.textDim,transition:"transform .2s",transform:isSel?"rotate(180deg)":"none"}}>▼</span>
              </div>
            </div>
            {isSel&&selLesson&&<PrevDetail lesson={selLesson} onClose={()=>onSel(null,null)}/>}
          </div>
        );
      })}
    </div>
  );
}

export default function TutorScheduleV3() {
  const [view,setView]=useState("week");
  const [selDay,setSelDay]=useState(3);
  const [selId,setSelId]=useState(null);
  const [selLesson,setSelLesson]=useState(null);
  const sel=(id,l)=>{setSelId(id);setSelLesson(l);};

  return(
    <div style={{fontFamily:"'Nunito', sans-serif",background:T.bg,color:T.text,minHeight:"100vh",display:"flex"}}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <Sidebar/>
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {/* TOPBAR */}
        <div style={{height:56,padding:"0 24px",display:"flex",alignItems:"center",background:T.bgAlt,borderBottom:`1px solid ${T.cardBorder}`,justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <h1 style={{fontSize:17,fontWeight:900,margin:0}}>Harmonogram</h1>
            <span style={{fontSize:12,color:T.textDim,fontWeight:500}}>16–21 czerwca 2026</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onMouseEnter={e=>e.target.style.background=T.surfaceHover} onMouseLeave={e=>e.target.style.background=T.surface} style={{background:T.surface,border:`1px solid ${T.cardBorder}`,borderRadius:8,padding:"5px 10px",cursor:"pointer",color:T.textDim,fontSize:14,fontFamily:"inherit",transition:"background .15s"}}>←</button>
            <button onMouseEnter={e=>e.target.style.background=T.primary+"18"} onMouseLeave={e=>e.target.style.background=T.surface} style={{background:T.surface,border:`1px solid ${T.cardBorder}`,borderRadius:8,padding:"5px 14px",cursor:"pointer",color:T.primary,fontSize:12,fontWeight:700,fontFamily:"inherit",transition:"all .15s"}}>Dziś</button>
            <button onMouseEnter={e=>e.target.style.background=T.surfaceHover} onMouseLeave={e=>e.target.style.background=T.surface} style={{background:T.surface,border:`1px solid ${T.cardBorder}`,borderRadius:8,padding:"5px 10px",cursor:"pointer",color:T.textDim,fontSize:14,fontFamily:"inherit",transition:"background .15s"}}>→</button>
            <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:`1px solid ${T.cardBorder}`,marginLeft:6}}>
              <button onClick={()=>{setView("week");setSelId(null);setSelLesson(null);}} style={{padding:"6px 16px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer",fontFamily:"inherit",transition:"all .15s",background:view==="week"?T.primary+"25":"transparent",color:view==="week"?T.primary:T.textDim}}>Tydzień</button>
              <button onClick={()=>{setView("day");setSelId(null);setSelLesson(null);}} style={{padding:"6px 16px",fontSize:12,fontWeight:700,border:"none",cursor:"pointer",fontFamily:"inherit",transition:"all .15s",background:view==="day"?T.primary+"25":"transparent",color:view==="day"?T.primary:T.textDim}}>Dzień</button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{flex:1,overflow:"auto",padding:"16px 24px"}}>
          <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:10,color:T.textDim,fontWeight:700}}>Status:</span>
            {Object.entries(SC).map(([k,v])=>(<span key={k} style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:9,fontWeight:700,color:v.color}}><span style={{width:7,height:7,borderRadius:3,background:v.color}}/> {v.label}</span>))}
            <span style={{fontSize:10,color:T.textDim,fontWeight:700,marginLeft:8}}>Poziom:</span>
            {[{l:"SP",c:T.textDim},{l:"E8",c:T.cyan},{l:"ŚR",c:T.textDim},{l:"EM",c:T.textDim}].map(v=>(<span key={v.l} style={{fontSize:9,fontWeight:800,color:v.c,padding:"1px 5px",borderRadius:3,background:v.c+"12"}}>{v.l}</span>))}
            <span style={{fontSize:9,color:T.secondary,fontWeight:800}}>★ = rozszerzenie</span>
            <span style={{marginLeft:"auto",fontSize:10,color:T.textDim}}>Kliknij lekcję → dane z poprzednich zajęć</span>
          </div>

          {view==="day"&&(
            <div style={{marginBottom:14}}>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {days.map((d,i)=>{
                  const [dh,setDh]=useState(false);
                  return(<button key={d} onClick={()=>{setSelDay(i);setSelId(null);setSelLesson(null);}} onMouseEnter={()=>setDh(true)} onMouseLeave={()=>setDh(false)} style={{
                    padding:"8px 16px",borderRadius:12,border:i===3?`1.5px solid ${T.primary}40`:`1.5px solid ${T.cardBorder}`,
                    background:selDay===i?T.primary+"20":dh?T.surfaceHover:T.surface,
                    color:selDay===i?T.primary:dh?T.text:T.textMuted,
                    fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",transition:"all .15s",
                  }}>{d} {dates[i]}</button>);
                })}
              </div>
              <h2 style={{fontSize:17,fontWeight:900,margin:"14px 0 10px"}}>{daysFull[selDay]}, {dates[selDay]}{selDay===3&&<span style={{fontSize:12,fontWeight:700,color:T.primary,marginLeft:8}}>— dziś</span>}</h2>
            </div>
          )}

          {view==="week"&&<WeekView onSel={sel} selId={selId}/>}
          {view==="day"&&<DayView dayIdx={selDay} onSel={sel} selId={selId} selLesson={selLesson}/>}
          {view==="week"&&selLesson&&<div style={{marginTop:12}}><PrevDetail lesson={selLesson} onClose={()=>sel(null,null)}/></div>}
        </div>
      </div>
    </div>
  );
}
