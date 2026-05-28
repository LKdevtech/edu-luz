import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", secondary: "#FF6F4A", tertiary: "#FFCA28",
  accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4", danger: "#EF4444",
  cardBorder: "rgba(59,143,240,0.10)",
};

const entrySC = {
  missing:   { color: T.secondary, label: "Brak wpisu",   bg: T.secondary + "15" },
  draft:     { color: T.tertiary,  label: "Szkic",        bg: T.tertiary + "12" },
  published: { color: T.success,   label: "Opublikowany", bg: T.success + "12" },
  locked:    { color: T.textDim,   label: "Zablokowany (48h)", bg: T.textDim + "12" },
  blocked:   { color: T.danger,    label: "No-show",      bg: T.danger + "10" },
};

const lessonSC = {
  completed: { color: T.success, label: "Zrealizowana" },
  cancelled: { color: T.danger, label: "Odwołana" },
  makeup:    { color: T.tertiary, label: "Odrabianie" },
  no_show:   { color: T.danger, label: "No-show" },
};

const missingEntries = [
  { id: 1, date: "Czw 19.06", time: "14:00", dur: 60, student: "Kacper Nowak", cls: "2 LO", subj: "Matematyka", room: "Sala 1", form: "indyw.", level: "★ŚR", hoursLeft: 26, lessonStatus: "completed" },
  { id: 2, date: "Czw 19.06", time: "15:15", dur: 45, student: "Grupa A", cls: "kl. 7–8", subj: "Matematyka", room: "Sala 1", form: "grupa", level: "SP", hoursLeft: 25, lessonStatus: "completed", groupStudents: ["Kasia Nowak", "Tomek Wiśniewski", "Ola Zielińska"] },
  { id: 3, date: "Śr 18.06", time: "17:00", dur: 45, student: "Ola Szymańska", cls: "3 LO", subj: "Fizyka", room: "Sala 2", form: "indyw.", level: "★EM", hoursLeft: 2, lessonStatus: "completed" },
];

const recentEntries = [
  { id: 4, date: "Śr 18.06", time: "14:00", student: "Kacper Nowak", cls: "2 LO", subj: "Matematyka", level: "★ŚR", entryStatus: "published", topic: "Ciągi geometryczne — obliczanie sumy", hasHw: true },
  { id: 5, date: "Śr 18.06", time: "15:15", student: "Grupa B", cls: "kl. 7", subj: "Matematyka", level: "SP", entryStatus: "published", topic: "Procenty — obliczanie procentu z liczby", hasHw: true },
  { id: 6, date: "Wt 17.06", time: "14:00", student: "Tomek Zieliński", cls: "3 LO", subj: "Matematyka", level: "★EM", entryStatus: "draft", topic: "Prawdopodobieństwo — zadania CKE", hasHw: true },
  { id: 7, date: "Wt 17.06", time: "17:00", student: "Michał Lis", cls: "2 LO", subj: "Fizyka", level: "★ŚR", entryStatus: "published", topic: "Prawo Ohma — obwody szeregowe", hasHw: true },
  { id: 8, date: "Pon 16.06", time: "14:00", student: "Kacper Nowak", cls: "2 LO", subj: "Matematyka", level: "★ŚR", entryStatus: "locked", topic: "Ciągi arytmetyczne — wzór na n-ty wyraz", hasHw: true },
  { id: 9, date: "Pon 16.06", time: "16:30", student: "Alicja Wiśniewska", cls: "1 LO", subj: "Fizyka", level: "ŚR", entryStatus: "published", topic: "Kinematyka — ruch j. przyspieszony", hasHw: true },
  { id: 10, date: "Wt 17.06", time: "15:30", student: "Julia Kowalska", cls: "kl. 8", subj: "Matematyka", level: "E8", entryStatus: "blocked", topic: null, hasHw: false },
];

const sidebarItems = [
  { icon: "📊", label: "Dashboard" }, { icon: "📅", label: "Harmonogram" },
  { icon: "📝", label: "Lekcje i wpisy", active: true }, { icon: "🔄", label: "Odrabianie", badge: 2 },
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

function FilterChip({ label, active, onClick, count }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      padding: "7px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
      border: `1.5px solid ${active ? T.primary + "50" : T.cardBorder}`,
      background: active ? T.primary + "18" : h ? T.surfaceHover : "transparent",
      color: active ? T.primary : h ? T.text : T.textMuted,
      cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
      display: "inline-flex", alignItems: "center", gap: 6,
    }}>
      {label}
      {count !== undefined && <span style={{ fontSize: 10, fontWeight: 900, padding: "1px 6px", borderRadius: 6, background: active ? T.primary + "25" : T.textDim + "15", color: active ? T.primary : T.textDim }}>{count}</span>}
    </button>
  );
}

function MissingEntryCard({ entry, onFill }) {
  const [h, setH] = useState(false);
  const urgent = entry.hoursLeft < 12;
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      display: "flex", gap: 14, padding: "16px 18px", borderRadius: 16,
      background: h ? T.surfaceHover : T.surface,
      border: `1px solid ${urgent ? T.danger + "25" : T.secondary + "20"}`,
      borderLeft: `4px solid ${urgent ? T.danger : T.secondary}`,
      borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
      transition: "all .2s", transform: h ? "translateY(-1px)" : "none",
    }}>
      <div style={{ width: 50, flexShrink: 0, textAlign: "center" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: T.textDim, margin: 0 }}>{entry.date}</p>
        <p style={{ fontSize: 15, fontWeight: 900, color: T.text, margin: "2px 0" }}>{entry.time}</p>
        <p style={{ fontSize: 9, color: T.textDim, fontWeight: 600 }}>{entry.dur} min</p>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 800 }}>{entry.student}</span>
          <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 5, background: entry.level.includes("★") ? T.secondary + "15" : T.textDim + "12", color: entry.level.includes("★") ? T.secondary : T.textDim }}>{entry.level}</span>
          {entry.form === "grupa" && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: T.accent + "12", color: T.accent }}>👥 Grupa</span>}
        </div>
        <p style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, margin: "0 0 6px" }}>{entry.subj} · {entry.cls} · {entry.room}</p>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {urgent ? (
            <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: T.danger + "15", color: T.danger, animation: "pulse 2s infinite" }}>⚠ Zostało {entry.hoursLeft}h!</span>
          ) : (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: T.tertiary + "12", color: T.tertiary }}>Zostało {entry.hoursLeft}h</span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
        <button onClick={() => onFill(entry)} onMouseEnter={e => { e.target.style.background = T.primary; e.target.style.color = "#fff"; }} onMouseLeave={e => { e.target.style.background = T.primary + "18"; e.target.style.color = T.primary; }} style={{
          padding: "8px 18px", borderRadius: 10, border: "none",
          background: T.primary + "18", color: T.primary,
          fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
          transition: "all .15s", whiteSpace: "nowrap",
        }}>📝 Uzupełnij</button>
      </div>
    </div>
  );
}

function EntryRow({ entry }) {
  const [h, setH] = useState(false);
  const es = entrySC[entry.entryStatus] || entrySC.missing;
  const isBlocked = entry.entryStatus === "blocked";
  const isLocked = entry.entryStatus === "locked";
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      display: "flex", gap: 14, padding: "14px 18px",
      background: h ? T.surfaceHover : "transparent",
      borderBottom: `1px solid ${T.cardBorder}`,
      transition: "all .15s", cursor: isBlocked ? "default" : "pointer",
      opacity: isBlocked ? 0.5 : 1,
    }}>
      <div style={{ width: 70, flexShrink: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: T.textDim, margin: 0 }}>{entry.date}</p>
        <p style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: "2px 0" }}>{entry.time}</p>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 800 }}>{entry.student}</span>
          <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 5, background: entry.level.includes("★") ? T.secondary + "15" : T.textDim + "12", color: entry.level.includes("★") ? T.secondary : T.textDim }}>{entry.level}</span>
          <span style={{ fontSize: 10, color: T.textMuted, fontWeight: 500 }}>{entry.subj}</span>
        </div>
        {entry.topic && <p style={{ fontSize: 11, color: T.textDim, fontWeight: 500, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.topic}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {entry.hasHw && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: T.primary + "12", color: T.primary }}>📝 PD</span>}
        <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: es.bg, color: es.color }}>{es.label}</span>
        {!isBlocked && !isLocked && (
          <button onMouseEnter={e => { e.target.style.background = T.surfaceHover; }} onMouseLeave={e => { e.target.style.background = "transparent"; }} style={{
            padding: "5px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`,
            background: "transparent", color: T.textMuted, fontSize: 10, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
          }}>{entry.entryStatus === "draft" ? "Edytuj" : "Podgląd"}</button>
        )}
      </div>
    </div>
  );
}

function EntryForm({ entry, onClose }) {
  const [topic, setTopic] = useState("");
  const [noteStudent, setNoteStudent] = useState("");
  const [noteParent, setNoteParent] = useState("");
  const [homework, setHomework] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [attendance, setAttendance] = useState(entry.groupStudents ? Object.fromEntries(entry.groupStudents.map(s => [s, "present"])) : {});
  const [parentNotes, setParentNotes] = useState(entry.groupStudents ? Object.fromEntries(entry.groupStudents.map(s => [s, ""])) : {});
  const [soloAttendance, setSoloAttendance] = useState("present");
  const [saving, setSaving] = useState(false);

  const isGroup = !!entry.groupStudents;

  function Field({ label, required, value, onChange, multiline, placeholder, hint, locked }) {
    const [f, setF] = useState(false);
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: T.textMuted, marginBottom: 6 }}>
          {label} {required && <span style={{ color: T.secondary, fontSize: 10 }}>*</span>}
          {hint && <span style={{ fontSize: 10, fontWeight: 500, color: T.textDim, fontStyle: "italic" }}>— {hint}</span>}
        </label>
        {multiline ? (
          <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
            onFocus={() => setF(true)} onBlur={() => setF(false)} disabled={locked}
            style={{ width: "100%", background: T.bg, border: `1.5px solid ${f ? T.primary + "50" : T.cardBorder}`, borderRadius: 12, padding: "10px 14px", color: T.text, fontSize: 13, fontWeight: 500, fontFamily: "inherit", resize: "vertical", outline: "none", transition: "border-color .2s", boxShadow: f ? `0 0 0 3px ${T.primary}12` : "none" }} />
        ) : (
          <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            onFocus={() => setF(true)} onBlur={() => setF(false)} disabled={locked}
            style={{ width: "100%", background: T.bg, border: `1.5px solid ${f ? T.primary + "50" : T.cardBorder}`, borderRadius: 12, padding: "10px 14px", color: T.text, fontSize: 13, fontWeight: 500, fontFamily: "inherit", outline: "none", transition: "border-color .2s", boxShadow: f ? `0 0 0 3px ${T.primary}12` : "none" }} />
        )}
      </div>
    );
  }

  return (
    <div style={{ background: T.surface, borderRadius: 20, padding: "24px", border: `1px solid ${T.primary}20`, animation: "fd .25s ease" }}>
      <style>{`@keyframes fd{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}`}</style>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 18, fontWeight: 900 }}>Wpis — {entry.student}</span>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: entry.level.includes("★") ? T.secondary + "15" : T.textDim + "12", color: entry.level.includes("★") ? T.secondary : T.textDim }}>{entry.level}</span>
          </div>
          <p style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, margin: 0 }}>{entry.date} · {entry.time} · {entry.dur} min · {entry.subj} · {entry.room}</p>
        </div>
        <button onClick={onClose} onMouseEnter={e => e.target.style.color = T.text} onMouseLeave={e => e.target.style.color = T.textDim} style={{ background: "transparent", border: "none", color: T.textDim, fontSize: 18, cursor: "pointer", fontFamily: "inherit", transition: "color .15s" }}>✕</button>
      </div>

      {/* Attendance + per-student notes for groups */}
      <div style={{ marginBottom: 20, background: T.bgAlt, borderRadius: 14, padding: "16px 18px" }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: T.textDim, marginBottom: 10, textTransform: "uppercase", letterSpacing: .5 }}>
          {isGroup ? "Obecność i uwagi indywidualne" : "Obecność"}
        </p>
        {isGroup ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {entry.groupStudents.map(s => {
              const [noteOpen, setNoteOpen] = useState(false);
              return (
                <div key={s} style={{ background: T.bg, borderRadius: 12, padding: "12px 14px", border: `1px solid ${T.cardBorder}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: noteOpen ? 10 : 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{s}</span>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {[{k:"present",l:"Obecny/a",c:T.success},{k:"absent",l:"Nieobecny/a",c:T.danger}].map(opt => (
                        <button key={opt.k} onClick={() => setAttendance(p => ({...p, [s]: opt.k}))}
                          style={{
                            padding: "4px 12px", borderRadius: 8, fontSize: 10, fontWeight: 700,
                            border: `1.5px solid ${attendance[s] === opt.k ? opt.c + "50" : T.cardBorder}`,
                            background: attendance[s] === opt.k ? opt.c + "18" : "transparent",
                            color: attendance[s] === opt.k ? opt.c : T.textDim,
                            cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
                          }}>{opt.l}</button>
                      ))}
                      <button onClick={() => setNoteOpen(!noteOpen)}
                        onMouseEnter={e => e.target.style.background = T.primary + "15"}
                        onMouseLeave={e => e.target.style.background = "transparent"}
                        style={{
                          padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 700,
                          border: `1px solid ${T.cardBorder}`, background: "transparent",
                          color: parentNotes[s] ? T.primary : T.textDim,
                          cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
                          marginLeft: 4,
                        }}>{parentNotes[s] ? "✏️ Uwaga" : "+ Uwaga"}</button>
                    </div>
                  </div>
                  {noteOpen && (
                    <div style={{ animation: "fd .2s ease" }}>
                      <textarea
                        value={parentNotes[s] || ""}
                        onChange={e => setParentNotes(p => ({...p, [s]: e.target.value}))}
                        placeholder={`Uwaga dla rodzica ${s.split(" ")[0]} — widoczna tylko dla tego rodzica`}
                        rows={2}
                        style={{ width: "100%", background: T.bgAlt, border: `1.5px solid ${T.cardBorder}`, borderRadius: 10, padding: "8px 12px", color: T.text, fontSize: 12, fontWeight: 500, fontFamily: "inherit", resize: "vertical", outline: "none", transition: "border-color .2s" }}
                        onFocus={e => e.target.style.borderColor = T.primary + "50"}
                        onBlur={e => e.target.style.borderColor = T.cardBorder}
                      />
                      <p style={{ fontSize: 9, color: T.textDim, fontWeight: 500, marginTop: 4, fontStyle: "italic" }}>Widoczna tylko dla rodzica tego ucznia</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{entry.student}</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[{k:"present",l:"Obecny/a",c:T.success},{k:"absent",l:"Nieobecny/a",c:T.danger}].map(opt => (
                <button key={opt.k} onClick={() => setSoloAttendance(opt.k)}
                  style={{
                    padding: "5px 16px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                    border: `1.5px solid ${soloAttendance === opt.k ? opt.c + "50" : T.cardBorder}`,
                    background: soloAttendance === opt.k ? opt.c + "18" : "transparent",
                    color: soloAttendance === opt.k ? opt.c : T.textDim,
                    cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
                  }}>{opt.l}</button>
              ))}
            </div>
          </div>
        )}
        <p style={{ fontSize: 9, color: T.textDim, fontWeight: 500, marginTop: 8, fontStyle: "italic" }}>
          {isGroup ? "Oznacz obecność i dodaj indywidualne uwagi dla rodziców." : "System sam zweryfikuje czy nieobecność była zgłoszona z wyprzedzeniem."}
        </p>
      </div>

      {/* Form fields */}
      <Field label="Temat lekcji" required value={topic} onChange={setTopic} placeholder="Np. Ciągi geometryczne — obliczanie sumy" />
      <Field label="Notatka dla ucznia" required value={noteStudent} onChange={setNoteStudent} multiline placeholder="Co uczeń powinien wiedzieć — widoczne w panelu ucznia" hint={isGroup ? "wspólna dla całej grupy" : "widoczna dla ucznia"} />
      {!isGroup && <Field label="Notatka dla rodzica" value={noteParent} onChange={setNoteParent} multiline placeholder="Opcjonalna uwaga dla rodzica" hint="opcjonalna, widoczna dla rodzica" />}
      {isGroup && (
        <p style={{ fontSize: 10, color: T.accent, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          ℹ️ Uwagi dla poszczególnych rodziców dodajesz wyżej, przy każdym uczniu osobno.
        </p>
      )}
      <Field label="Praca domowa" value={homework} onChange={setHomework} placeholder="Np. Zad. 5.1–5.10 str. 94" hint="widoczna dla ucznia i rodzica" />

      <div style={{ borderTop: `1px solid ${T.cardBorder}`, paddingTop: 16, marginTop: 4 }}>
        <Field label="Notatka wewnętrzna" value={internalNote} onChange={setInternalNote} multiline placeholder="Tylko dla Ciebie i admina — rodzic/uczeń NIE widzą" hint="prywatna, tylko admin i Ty" />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={onClose}
          onMouseEnter={e => e.target.style.background = T.surfaceHover}
          onMouseLeave={e => e.target.style.background = "transparent"}
          style={{ padding: "10px 22px", borderRadius: 12, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.textMuted, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>Anuluj</button>
        <button onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 1000); }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.02)"; }}
          onMouseLeave={e => { e.target.style.transform = "none"; }}
          style={{ padding: "10px 22px", borderRadius: 12, border: "none", background: T.surface, color: T.tertiary, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "all .15s", border: `1.5px solid ${T.tertiary}40` }}>Zapisz szkic</button>
        <button onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 1000); }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; e.target.style.boxShadow = `0 6px 20px ${T.success}30`; }}
          onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}
          style={{
            padding: "10px 28px", borderRadius: 12, border: "none",
            background: (!topic || !noteStudent) ? T.textDim : T.success,
            color: "#fff", fontSize: 13, fontWeight: 800,
            cursor: (!topic || !noteStudent) ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "all .15s", opacity: saving ? .7 : 1,
          }}>{saving ? "Zapisywanie..." : "Opublikuj wpis"}</button>
      </div>
      <p style={{ fontSize: 10, color: T.textDim, fontWeight: 500, marginTop: 10, textAlign: "right", fontStyle: "italic" }}>
        * Temat i notatka dla ucznia wymagane do opublikowania. Szkic można zapisać bez nich.
      </p>
    </div>
  );
}

export default function TutorLessons() {
  const [filter, setFilter] = useState("all");
  const [fillingEntry, setFillingEntry] = useState(null);

  const filteredRecent = filter === "all" ? recentEntries
    : recentEntries.filter(e => e.entryStatus === filter);

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: T.bg, color: T.text, minHeight: "100vh", display: "flex" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}`}</style>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* TOPBAR */}
        <div style={{ height: 56, padding: "0 24px", display: "flex", alignItems: "center", background: T.bgAlt, borderBottom: `1px solid ${T.cardBorder}`, justifyContent: "space-between", flexShrink: 0 }}>
          <h1 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>Lekcje i wpisy</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: T.textDim, fontWeight: 500 }}>Czerwiec 2026</span>
            <button onMouseEnter={e => e.target.style.background = T.surfaceHover} onMouseLeave={e => e.target.style.background = T.surface} style={{ background: T.surface, border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: T.textDim, fontSize: 14, fontFamily: "inherit", transition: "background .15s" }}>←</button>
            <button onMouseEnter={e => e.target.style.background = T.surfaceHover} onMouseLeave={e => e.target.style.background = T.surface} style={{ background: T.surface, border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: T.textDim, fontSize: 14, fontFamily: "inherit", transition: "background .15s" }}>→</button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>

          {/* Entry form overlay */}
          {fillingEntry && (
            <div style={{ marginBottom: 20 }}>
              <EntryForm entry={fillingEntry} onClose={() => setFillingEntry(null)} />
            </div>
          )}

          {/* MISSING ENTRIES */}
          {!fillingEntry && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Do uzupełnienia</h2>
                <span style={{ fontSize: 11, fontWeight: 900, padding: "3px 10px", borderRadius: 10, background: T.secondary + "20", color: T.secondary }}>{missingEntries.length}</span>
                <span style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>Lekcje bez wpisu — uzupełnij przed upływem 48h</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
                {missingEntries.map(e => (
                  <MissingEntryCard key={e.id} entry={e} onFill={setFillingEntry} />
                ))}
              </div>
            </>
          )}

          {/* RECENT ENTRIES */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Ostatnie wpisy</h2>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <FilterChip label="Wszystkie" active={filter === "all"} onClick={() => setFilter("all")} count={recentEntries.length} />
              <FilterChip label="Szkice" active={filter === "draft"} onClick={() => setFilter("draft")} count={recentEntries.filter(e => e.entryStatus === "draft").length} />
              <FilterChip label="Opublikowane" active={filter === "published"} onClick={() => setFilter("published")} count={recentEntries.filter(e => e.entryStatus === "published").length} />
              <FilterChip label="Zablokowane" active={filter === "locked"} onClick={() => setFilter("locked")} count={recentEntries.filter(e => e.entryStatus === "locked").length} />
            </div>
          </div>

          <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.cardBorder}`, overflow: "hidden" }}>
            {/* Table header */}
            <div style={{ display: "flex", gap: 14, padding: "10px 18px", borderBottom: `1px solid ${T.cardBorder}`, background: T.bgAlt }}>
              <span style={{ width: 70, fontSize: 10, fontWeight: 800, color: T.textDim, textTransform: "uppercase", letterSpacing: .5 }}>Data</span>
              <span style={{ flex: 1, fontSize: 10, fontWeight: 800, color: T.textDim, textTransform: "uppercase", letterSpacing: .5 }}>Uczeń / Temat</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, textAlign: "right" }}>Status</span>
            </div>
            {filteredRecent.length === 0 ? (
              <div style={{ padding: "32px 18px", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: T.textDim, fontWeight: 500 }}>Brak wpisów w tej kategorii</p>
              </div>
            ) : filteredRecent.map(e => <EntryRow key={e.id} entry={e} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
