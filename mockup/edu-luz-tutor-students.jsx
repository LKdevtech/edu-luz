import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", secondary: "#FF6F4A", tertiary: "#FFCA28",
  accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4", danger: "#EF4444",
  pink: "#E84393",
  cardBorder: "rgba(59,143,240,0.10)",
};

const students = [
  {
    id: 1, name: "Kacper Nowak", cls: "2 LO", level: "★ŚR", levelColor: T.secondary,
    subject: "Matematyka", form: "Indywidualnie", schedule: "Pon 14:00, Śr 14:00, Sob 9:00",
    parent: "Monika Nowak", nextLesson: "Czw 19.06, 14:00",
    initials: "KN", color: T.primary,
    stats: { totalLessons: 42, attended: 40, cancelled: 2, avgPerMonth: 12 },
    lastTopic: "Ciągi geometryczne — obliczanie sumy",
    lastHomework: "Zad. 5.1–5.10 str. 94",
    lastNote: "Opanował wzory, ćwiczymy zastosowania. Dobrze rokuje na maturę.",
    internalNote: "Kacper jest ambitny ale czasem się spieszy. Trzeba pilnować dokładności.",
  },
  {
    id: 2, name: "Tomek Zieliński", cls: "3 LO", level: "★EM", levelColor: T.danger,
    subject: "Matematyka", form: "Indywidualnie", schedule: "Wt 14:00, Czw 18:15, Nd 10:00",
    parent: "Paweł Zieliński", nextLesson: "Czw 19.06, 18:15",
    initials: "TZ", color: T.danger,
    stats: { totalLessons: 38, attended: 36, cancelled: 2, avgPerMonth: 11 },
    lastTopic: "Prawdopodobieństwo — zadania maturalne CKE",
    lastHomework: "Arkusz maj 2023 — zad. 25–30",
    lastNote: "Przeszliśmy 6 zadań z arkuszy. Tomek robi postępy.",
    internalNote: "Matura w maju, trzeba przyspieszyć z analizą.",
  },
  {
    id: 3, name: "Alicja Wiśniewska", cls: "1 LO", level: "ŚR", levelColor: T.textDim,
    subject: "Fizyka", form: "Indywidualnie", schedule: "Pon 16:30, Czw 16:30",
    parent: "Ewa Wiśniewska", nextLesson: "Czw 19.06, 16:30",
    initials: "AW", color: T.cyan,
    stats: { totalLessons: 24, attended: 23, cancelled: 1, avgPerMonth: 8 },
    lastTopic: "Kinematyka — ruch jednostajnie przyspieszony",
    lastHomework: "Wykres v(t) i s(t) dla 3 zadań z karty",
    lastNote: "Rozumie wzory ale ma problem z rysowaniem wykresów.",
    internalNote: null,
  },
  {
    id: 4, name: "Julia Kowalska", cls: "kl. 8", level: "E8", levelColor: T.cyan,
    subject: "Matematyka", form: "Indywidualnie", schedule: "Wt 15:30, Pt 17:30 (odr.)",
    parent: "Anna Kowalska", nextLesson: "Pt 20.06, 17:30 (odrabianie)",
    initials: "JK", color: T.pink,
    stats: { totalLessons: 30, attended: 27, cancelled: 3, avgPerMonth: 10 },
    lastTopic: "Geometria — pola figur złożonych",
    lastHomework: null,
    lastNote: "Potrzebuje powtórki z pól trójkątów. Egzamin 8-kl. w kwietniu.",
    internalNote: "Julia bywa nieobecna — sprawdzić z mamą regularność.",
  },
  {
    id: 5, name: "Michał Lis", cls: "2 LO", level: "★ŚR", levelColor: T.secondary,
    subject: "Fizyka", form: "Indywidualnie", schedule: "Wt 17:00, Pt 15:30",
    parent: "Tomasz Lis", nextLesson: "Pt 20.06, 15:30",
    initials: "ML", color: T.accent,
    stats: { totalLessons: 18, attended: 18, cancelled: 0, avgPerMonth: 8 },
    lastTopic: "Prawo Ohma — obwody szeregowe",
    lastHomework: "Zadania 1–8 z karty pracy 'Obwody'",
    lastNote: "Zaczyna rozumieć obwody. Następne: obwody równoległe.",
    internalNote: null,
  },
  {
    id: 6, name: "Ola Szymańska", cls: "3 LO", level: "★EM", levelColor: T.danger,
    subject: "Fizyka", form: "Indywidualnie", schedule: "Śr 17:00",
    parent: "Katarzyna Szymańska", nextLesson: "Śr 25.06, 17:00",
    initials: "OS", color: T.tertiary,
    stats: { totalLessons: 35, attended: 34, cancelled: 1, avgPerMonth: 4 },
    lastTopic: "Optyka — soczewki, obrazy w soczewkach",
    lastHomework: "Powtórka: fale mechaniczne",
    lastNote: "Świetnie rysuje biegi promieni. Przygotowanie do matury idzie dobrze.",
    internalNote: "Ola jest bardzo pilna, nie wymaga dużo nadzoru.",
  },
  {
    id: 7, name: "Grupa A", cls: "kl. 7–8", level: "SP", levelColor: T.primary,
    subject: "Matematyka", form: "Grupa (3 os.)", schedule: "Pon 15:15, Czw 15:15",
    parent: null, isGroup: true,
    groupMembers: [
      { name: "Kasia Nowak", cls: "kl. 7", parent: "Robert Nowak" },
      { name: "Tomek Wiśniewski", cls: "kl. 8", parent: "Anna Wiśniewska" },
      { name: "Ola Zielińska", cls: "kl. 7", parent: "Marta Zielińska" },
    ],
    nextLesson: "Czw 19.06, 15:15",
    initials: "GA", color: T.success,
    stats: { totalLessons: 32, attended: null, cancelled: 2, avgPerMonth: 8 },
    lastTopic: "Ułamki zwykłe — dodawanie i odejmowanie",
    lastHomework: null,
    lastNote: "Grupa wymaga powtórki NWW. Kasia i Tomek słabo.",
    internalNote: "Kasia i Tomek potrzebują dodatkowej uwagi. Ola ciągnie grupę.",
  },
  {
    id: 8, name: "Grupa B", cls: "kl. 7", level: "SP", levelColor: T.primary,
    subject: "Matematyka", form: "Grupa (2 os.)", schedule: "Śr 15:15",
    parent: null, isGroup: true,
    groupMembers: [
      { name: "Mateusz Krawczyk", cls: "kl. 7", parent: "Iwona Krawczyk" },
      { name: "Filip Mazur", cls: "kl. 7", parent: "Dorota Mazur" },
    ],
    nextLesson: "Śr 25.06, 15:15",
    initials: "GB", color: T.success,
    stats: { totalLessons: 20, attended: null, cancelled: 1, avgPerMonth: 4 },
    lastTopic: "Procenty — obliczanie procentu z liczby",
    lastHomework: "Karta pracy 'Procenty'",
    lastNote: "Mateusz OK. Filip wymaga dodatkowej uwagi.",
    internalNote: null,
  },
];

const sidebarItems = [
  { icon: "📊", label: "Dashboard" }, { icon: "📅", label: "Harmonogram" },
  { icon: "📝", label: "Lekcje i wpisy" }, { icon: "🔄", label: "Odrabianie", badge: 2 },
  { icon: "🕐", label: "Dostępność" }, { icon: "👥", label: "Moi uczniowie", active: true },
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

function StudentCard({ s }) {
  const [h, setH] = useState(false);
  const [open, setOpen] = useState(false);
  const attendRate = s.stats.attended ? Math.round((s.stats.attended / s.stats.totalLessons) * 100) : null;

  return (
    <div>
      <div onClick={() => setOpen(!open)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
        display: "flex", gap: 16, padding: "18px 20px", borderRadius: 18,
        background: open ? s.color + "08" : h ? T.surfaceHover : T.surface,
        border: `1px solid ${open ? s.color + "25" : T.cardBorder}`,
        transition: "all .2s", transform: h ? "translateY(-1px)" : "none",
        cursor: "pointer",
      }}>
        {/* Avatar */}
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: `linear-gradient(135deg, ${s.color}25, ${s.color}10)`,
          border: `1.5px solid ${s.color}20`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 900, color: s.color,
        }}>{s.initials}</div>

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 900 }}>{s.name}</span>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: s.levelColor + "15", color: s.levelColor }}>{s.level}</span>
            <span style={{ fontSize: 10, color: T.textDim, fontWeight: 600 }}>{s.subject} · {s.cls}</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: T.bgAlt, color: T.textDim }}>{s.form}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: T.textMuted }}>📅 {s.schedule}</span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.primary }}>Następna: {s.nextLesson}</span>
            {s.stats.cancelled > 0 && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: T.danger + "12", color: T.danger }}>{s.stats.cancelled} odwołane</span>}
            {attendRate !== null && attendRate >= 95 && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: T.success + "12", color: T.success }}>✓ {attendRate}% obecności</span>}
          </div>
        </div>

        {/* Expand */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: T.textDim, transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }}>▼</span>
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div style={{
          background: T.surface, borderRadius: "0 0 18px 18px", padding: "20px 22px",
          border: `1px solid ${s.color}15`, borderTop: "none",
          marginTop: -8, paddingTop: 28,
          animation: "fd .2s ease",
        }}>
          <style>{`@keyframes fd{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { val: s.stats.totalLessons, label: "Lekcji łącznie", color: T.primary },
              { val: attendRate !== null ? `${attendRate}%` : "—", label: "Obecność", color: attendRate >= 90 ? T.success : T.tertiary },
              { val: s.stats.cancelled, label: "Odwołane", color: s.stats.cancelled > 2 ? T.danger : T.textDim },
              { val: `~${s.stats.avgPerMonth}/msc`, label: "Średnio", color: T.accent },
            ].map((st, i) => (
              <div key={i} style={{ flex: "1 1 80px", background: T.bgAlt, borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                <p style={{ fontSize: 18, fontWeight: 900, color: st.color, margin: 0 }}>{st.val}</p>
                <p style={{ fontSize: 9, fontWeight: 700, color: T.textDim, margin: "2px 0 0", textTransform: "uppercase", letterSpacing: .3 }}>{st.label}</p>
              </div>
            ))}
          </div>

          {/* Last lesson info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            <div style={{ background: T.bgAlt, borderRadius: 12, padding: "11px 14px" }}>
              <p style={{ fontSize: 9, fontWeight: 800, color: T.textDim, marginBottom: 3, textTransform: "uppercase", letterSpacing: .5 }}>Ostatni temat</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{s.lastTopic}</p>
            </div>
            <div style={{ background: T.bgAlt, borderRadius: 12, padding: "11px 14px" }}>
              <p style={{ fontSize: 9, fontWeight: 800, color: T.textDim, marginBottom: 3, textTransform: "uppercase", letterSpacing: .5 }}>Notatka z ostatniej lekcji</p>
              <p style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, margin: 0, lineHeight: 1.7 }}>{s.lastNote}</p>
            </div>
            <div style={{ background: s.lastHomework ? T.primary + "06" : T.bgAlt, borderRadius: 12, padding: "11px 14px", border: s.lastHomework ? `1px solid ${T.primary}10` : "none" }}>
              <p style={{ fontSize: 9, fontWeight: 800, color: T.textDim, marginBottom: 3, textTransform: "uppercase", letterSpacing: .5 }}>Ostatnia praca domowa</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: s.lastHomework ? T.text : T.textDim, margin: 0, fontStyle: s.lastHomework ? "normal" : "italic" }}>{s.lastHomework || "Nie zadano"}</p>
            </div>
          </div>

          {/* Internal note */}
          {s.internalNote && (
            <div style={{ background: T.accent + "08", borderRadius: 12, padding: "11px 14px", border: `1px solid ${T.accent}12`, marginBottom: 16 }}>
              <p style={{ fontSize: 9, fontWeight: 800, color: T.accent, marginBottom: 3, textTransform: "uppercase", letterSpacing: .5 }}>🔒 Notatka wewnętrzna</p>
              <p style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, margin: 0, lineHeight: 1.7 }}>{s.internalNote}</p>
            </div>
          )}

          {/* Group members */}
          {s.isGroup && s.groupMembers && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: T.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: .5 }}>Członkowie grupy</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {s.groupMembers.map((m, mi) => (
                  <div key={mi} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: T.bgAlt, borderRadius: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: s.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: s.color }}>{m.name.split(" ").map(n => n[0]).join("")}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{m.name}</span>
                      <span style={{ fontSize: 10, color: T.textDim, fontWeight: 500, marginLeft: 8 }}>{m.cls}</span>
                    </div>
                    <span style={{ fontSize: 10, color: T.textDim, fontWeight: 500 }}>Rodzic: {m.parent}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parent info + actions (solo only) */}
          {!s.isGroup && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: T.bgAlt, borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>👨‍👩‍👧</span>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: T.textDim, margin: 0 }}>Rodzic</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{s.parent}</p>
                </div>
              </div>
              <button
                onMouseEnter={e => { e.target.style.background = T.primary; e.target.style.color = "#fff"; }}
                onMouseLeave={e => { e.target.style.background = T.primary + "15"; e.target.style.color = T.primary; }}
                style={{ padding: "7px 16px", borderRadius: 10, border: "none", background: T.primary + "15", color: T.primary, fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>Napisz do rodzica</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TutorStudents() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = students.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.subject.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "individual" && !s.isGroup) || (filter === "group" && s.isGroup);
    return matchSearch && matchFilter;
  });

  const indivCount = students.filter(s => !s.isGroup).length;
  const groupCount = students.filter(s => s.isGroup).length;
  const totalStudents = students.filter(s => !s.isGroup).length + students.filter(s => s.isGroup).reduce((sum, g) => sum + (g.groupMembers?.length || 0), 0);

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ height: 56, padding: "0 24px", display: "flex", alignItems: "center", background: T.bgAlt, borderBottom: `1px solid ${T.cardBorder}`, justifyContent: "space-between", flexShrink: 0 }}>
          <h1 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>Moi uczniowie</h1>
          <span style={{ fontSize: 12, color: T.textDim, fontWeight: 500 }}>{totalStudents} uczniów · {indivCount} indyw. · {groupCount} grupy</span>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>

          {/* Search + filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{
              flex: "1 1 240px", display: "flex", alignItems: "center", gap: 8,
              background: T.bgAlt, borderRadius: 12, padding: "0 14px",
              border: `1.5px solid ${searchFocused ? T.primary + "50" : T.cardBorder}`,
              transition: "border-color .2s", boxShadow: searchFocused ? `0 0 0 3px ${T.primary}12` : "none",
            }}>
              <span style={{ fontSize: 14, opacity: .4 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj ucznia lub przedmiotu..."
                onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                style={{ background: "transparent", border: "none", outline: "none", color: T.text, fontSize: 13, fontWeight: 500, padding: "10px 0", width: "100%", fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { k: "all", l: "Wszyscy", c: students.length },
                { k: "individual", l: "Indywidualni", c: indivCount },
                { k: "group", l: "Grupy", c: groupCount },
              ].map(f => {
                const [fh, setFh] = useState(false);
                return (
                  <button key={f.k} onClick={() => setFilter(f.k)}
                    onMouseEnter={() => setFh(true)} onMouseLeave={() => setFh(false)}
                    style={{
                      padding: "7px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                      border: `1.5px solid ${filter === f.k ? T.primary + "50" : T.cardBorder}`,
                      background: filter === f.k ? T.primary + "18" : fh ? T.surfaceHover : "transparent",
                      color: filter === f.k ? T.primary : fh ? T.text : T.textMuted,
                      cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
                      display: "inline-flex", alignItems: "center", gap: 6,
                    }}>
                    {f.l}
                    <span style={{ fontSize: 10, fontWeight: 900, padding: "1px 6px", borderRadius: 6, background: filter === f.k ? T.primary + "25" : T.textDim + "12", color: filter === f.k ? T.primary : T.textDim }}>{f.c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student list */}
          {filtered.length === 0 ? (
            <div style={{ background: T.surface, borderRadius: 18, padding: "40px", textAlign: "center", border: `1px solid ${T.cardBorder}` }}>
              <span style={{ fontSize: 28, display: "block", marginBottom: 8 }}>🔍</span>
              <p style={{ fontSize: 14, fontWeight: 800 }}>Brak wyników</p>
              <p style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>Spróbuj zmienić wyszukiwanie lub filtr</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(s => <StudentCard key={s.id} s={s} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
