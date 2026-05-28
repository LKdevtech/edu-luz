import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", primaryDark: "#2D7DE8", secondary: "#FF6F4A",
  tertiary: "#FFCA28", accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4",
  danger: "#EF4444", pink: "#E84393", orange: "#F59E0B",
  cardBorder: "rgba(59,143,240,0.10)",
};

const subjectColors = { Matematyka: "#3B8FF0", Angielski: "#06B6D4", Fizyka: "#F59E0B" };
const levelColors = { SP: "#06B6D4", "ŚR": "#3B8FF0", "ŚR★": "#7C5CFC", EM: "#EF4444" };

const student = { name: "Kacper Nowak", initials: "KN", color: "#3B8FF0", cls: "2 LO", level: "ŚR★" };

/* ─── UPCOMING LESSONS ─── */
const upcomingLessons = [
  { id: 1, date: "Dziś", day: "Czwartek 22.05", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", status: "next", under24h: true },
  { id: 2, date: "Jutro", day: "Piątek 23.05", time: "10:00–11:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", status: "planned", under24h: false },
  { id: 3, date: "Sob 24.05", day: "Sobota 24.05", time: "9:00–10:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", status: "planned", under24h: false },
  { id: 4, date: "Pon 26.05", day: "Poniedziałek 26.05", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", status: "planned", under24h: false },
  { id: 5, date: "Śr 28.05", day: "Środa 28.05", time: "14:00–15:00", subject: "Matematyka", tutor: "Tomasz Kowalski", room: "Sala 1", level: "ŚR★", status: "planned", under24h: false },
];

/* ─── HOMEWORK ─── */
const homeworkData = [
  { id: 1, date: "Wt 20.05", subject: "Matematyka", topic: "Ciągi geometryczne", task: "Zad. 5.1–5.10 str. 94 (podręcznik Pazdro)", done: false, dueInfo: "Na Pt 23.05" },
  { id: 2, date: "Sob 17.05", subject: "Matematyka", topic: "Ciągi arytmetyczne", task: "Zad. 4.1–4.8 str. 87", done: true, dueInfo: "Na Wt 20.05", checked: true },
  { id: 3, date: "Śr 14.05", subject: "Matematyka", topic: "Ciąg Fibonacciego", task: "Wypisz 15 pierwszych wyrazów ciągu Fibonacciego", done: true, dueInfo: "Na Sob 17.05", checked: true },
  { id: 4, date: "Pon 12.05", subject: "Matematyka", topic: "Indukcja matematyczna", task: "Zad. 2.15–2.20 str. 63", done: true, dueInfo: "Na Śr 14.05", checked: false },
];

/* ─── RECENT ENTRIES ─── */
const recentEntries = [
  { id: 1, date: "Wt 20.05", subject: "Matematyka", tutor: "Tomasz Kowalski", level: "ŚR★", topic: "Ciągi geometryczne — obliczanie sumy", noteForStudent: "Pamiętaj o wzorze na sumę n wyrazów! Powtórz też definicję granicy ciągu.", homework: "Zad. 5.1–5.10 str. 94" },
  { id: 2, date: "Sob 17.05", subject: "Matematyka", tutor: "Tomasz Kowalski", level: "ŚR★", topic: "Ciągi arytmetyczne — wzory i zadania", noteForStudent: "Powtórz wzór na n-ty wyraz ciągu arytmetycznego.", homework: "Zad. 4.1–4.8 str. 87", hwChecked: true },
  { id: 3, date: "Śr 14.05", subject: "Matematyka", tutor: "Tomasz Kowalski", level: "ŚR★", topic: "Ciąg Fibonacciego i zastosowania", noteForStudent: "Spróbuj wypisać 15 pierwszych wyrazów ciągu.", homework: "Zad. 3.5–3.12 str. 78", hwChecked: true },
  { id: 4, date: "Pon 12.05", subject: "Matematyka", tutor: "Tomasz Kowalski", level: "ŚR★", topic: "Indukcja matematyczna — zasada i dowody", noteForStudent: "Zapamiętaj schemat dowodu: krok bazowy + krok indukcyjny.", homework: "Zad. 2.15–2.20 str. 63" },
];

/* ─── MAKEUP ─── */
const makeupItems = [
  { id: 1, subject: "Matematyka", tutor: "Tomasz Kowalski", originalDate: "Pon 12.05", reason: "Odwołana (>24h)", status: "proposed", proposedDate: "Śr 28.05, 18:15–19:15", daysLeft: 20 },
];

/* ═══════════════ SHARED UI ═══════════════ */

const Card = ({ children, style, onClick, className }) => (
  <div onClick={onClick} className={className || (onClick ? "card-click" : "card-hover")} style={{
    background: T.surface, borderRadius: 14, border: `1px solid ${T.cardBorder}`,
    padding: 16, cursor: onClick ? "pointer" : "default", ...style,
  }}>{children}</div>
);

const LevelBadge = ({ level }) => {
  const c = levelColors[level] || T.textDim;
  return <span style={{ fontSize: 10, fontWeight: 800, color: c, background: c + "18", padding: "2px 7px", borderRadius: 5 }}>{level}</span>;
};

const SubjectDot = ({ subject }) => (
  <span style={{ width: 8, height: 8, borderRadius: "50%", background: subjectColors[subject] || T.textDim, display: "inline-block", flexShrink: 0 }} />
);

/* ═══════════════ SIDEBAR ═══════════════ */

function Sidebar({ collapsed, onToggle }) {
  const items = [
    { icon: "📊", label: "Dashboard", active: true },
    { icon: "📚", label: "Zajęcia", active: false },
    { icon: "👤", label: "Profil", active: false },
  ];
  return (
    <div style={{ width: collapsed ? 64 : 240, minWidth: collapsed ? 64 : 240, background: T.bgAlt, borderRight: `1px solid ${T.cardBorder}`, display: "flex", flexDirection: "column", transition: "all .2s", zIndex: 10 }}>
      <div style={{ padding: collapsed ? "20px 12px" : "20px 20px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${T.primary},${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff" }}>Ez</div>
        {!collapsed && <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>EDU <span style={{ color: T.primary }}>LUZ</span></div>
          <div style={{ fontSize: 9, fontWeight: 800, color: T.cyan, background: T.cyan + "18", padding: "2px 8px", borderRadius: 4, marginTop: 2, letterSpacing: 1.5, textAlign: "center" }}>UCZEŃ</div>
        </div>}
      </div>
      <div style={{ padding: "12px 8px", flex: 1 }}>
        {items.map((it, i) => (
          <div key={i} className="nav-item" style={{ display: "flex", alignItems: "center", gap: 12, padding: collapsed ? "12px 0" : "12px 16px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: 10, background: it.active ? T.primary + "18" : "transparent", color: it.active ? T.primary : T.textMuted, fontWeight: it.active ? 800 : 600, fontSize: 14, cursor: "pointer", marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>{it.icon}</span>
            {!collapsed && <span>{it.label}</span>}
          </div>
        ))}
      </div>
      <div style={{ padding: "12px 8px", borderTop: `1px solid ${T.cardBorder}` }}>
        <div onClick={onToggle} className="nav-item" style={{ display: "flex", alignItems: "center", gap: 12, padding: collapsed ? "10px 0" : "10px 16px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: 10, color: T.textDim, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
          <span style={{ fontSize: 16 }}>{collapsed ? "→" : "←"}</span>
          {!collapsed && <span>Zwiń</span>}
        </div>
      </div>
    </div>
  );
}

const Topbar = () => (
  <div style={{ height: 48, padding: "0 24px", background: T.bgAlt, borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div>
      <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Cześć, </span>
      <span style={{ fontSize: 15, fontWeight: 800, color: T.primary }}>Kacper</span>
      <span style={{ fontSize: 12, color: T.textDim, marginLeft: 12, fontWeight: 600 }}>Czwartek, 22 maja 2026</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div className="icon-btn" style={{ width: 36, height: 36, borderRadius: 10, background: T.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
        <span style={{ fontSize: 16 }}>🔔</span>
      </div>
      <div className="icon-btn" style={{ width: 36, height: 36, borderRadius: 10, background: T.primary + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: T.primary, cursor: "pointer" }}>KN</div>
    </div>
  </div>
);

/* ═══════════════ UPCOMING LESSONS ═══════════════ */

function UpcomingLessons() {
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [requestedIds, setRequestedIds] = useState([]);

  const groups = [];
  const seen = new Set();
  upcomingLessons.forEach(l => {
    if (!seen.has(l.date)) { seen.add(l.date); groups.push({ label: l.date, day: l.day, lessons: [] }); }
    groups.find(g => g.label === l.date).lessons.push(l);
  });

  const doCancel = (id) => { setRequestedIds(p => [...p, id]); setCancelConfirm(null); };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>📅</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Nadchodzące lekcje</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.textDim, background: T.surface, padding: "2px 8px", borderRadius: 6 }}>{upcomingLessons.length}</span>
        </div>
        <span className="link-hover" style={{ fontSize: 12, color: T.primary, fontWeight: 700, cursor: "pointer" }}>Zajęcia →</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {groups.map((group, gi) => (
          <div key={gi}>
            <div style={{ fontSize: 11, fontWeight: 700, color: group.label === "Dziś" ? T.primary : T.textDim, marginBottom: 6, display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: .8 }}>
              {group.label === "Dziś" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.success, animation: "pulse 2s infinite" }} />}
              {group.day}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {group.lessons.map(lesson => {
                const sC = subjectColors[lesson.subject] || T.textDim;
                const isNext = lesson.status === "next";
                const requested = requestedIds.includes(lesson.id);

                return (
                  <Card key={lesson.id} style={{ padding: "12px 14px", borderLeft: `3px solid ${sC}`, background: isNext ? T.primary + "08" : T.surface, position: "relative" }}>
                    {isNext && <span style={{ position: "absolute", top: 8, right: 10, fontSize: 9, fontWeight: 800, color: T.success, background: T.success + "18", padding: "2px 8px", borderRadius: 5, animation: "pulse 2s infinite" }}>NASTĘPNA</span>}

                    {requested && <span style={{ position: "absolute", top: 8, right: 10, fontSize: 9, fontWeight: 800, color: T.orange, background: T.orange + "18", padding: "2px 8px", borderRadius: 5 }}>CZEKA NA RODZICA</span>}

                    {cancelConfirm === lesson.id && (
                      <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: "rgba(21,24,39,.92)", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 16 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text, textAlign: "center" }}>Poprosić o odwołanie lekcji ({lesson.time})?</span>
                        <span style={{ fontSize: 11, color: T.orange, fontWeight: 600, textAlign: "center", background: T.orange + "15", padding: "4px 10px", borderRadius: 6 }}>
                          ⚠ Prośba zostanie wysłana do rodzica do zatwierdzenia
                        </span>
                        {lesson.under24h && <span style={{ fontSize: 10, color: T.danger, fontWeight: 600 }}>Mniej niż 24h — lekcja przepadnie</span>}
                        {!lesson.under24h && <span style={{ fontSize: 10, color: T.success, fontWeight: 600 }}>Ponad 24h — będzie do odrobienia</span>}
                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                          <button onClick={() => setCancelConfirm(null)} className="btn-ghost" style={{ padding: "6px 16px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, background: T.surface, color: T.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Nie</button>
                          <button onClick={() => doCancel(lesson.id)} className="btn-primary" style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: T.orange, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Wyślij prośbę</button>
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                          <SubjectDot subject={lesson.subject} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{lesson.subject}</span>
                          <LevelBadge level={lesson.level} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: T.textDim, fontWeight: 600 }}>
                          <span style={{ color: isNext ? T.primary : T.textMuted, fontWeight: 700 }}>🕐 {lesson.time}</span>
                          <span>👤 {lesson.tutor}</span>
                          <span>📍 {lesson.room}</span>
                        </div>
                      </div>
                      {!isNext && !requested && (
                        <button onClick={(e) => { e.stopPropagation(); setCancelConfirm(lesson.id); }} className="btn-cancel" style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${T.orange}30`, background: T.orange + "10", color: T.orange, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Odwołaj</button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ HOMEWORK ═══════════════ */

function HomeworkSection() {
  const [hwState, setHwState] = useState(
    Object.fromEntries(homeworkData.map(h => [h.id, h.done]))
  );

  const toggleHw = (id) => setHwState(prev => ({ ...prev, [id]: !prev[id] }));

  const pending = homeworkData.filter(h => !hwState[h.id]);
  const done = homeworkData.filter(h => hwState[h.id]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>📝</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Praca domowa</span>
          {pending.length > 0 && <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: T.tertiary, borderRadius: 8, padding: "1px 7px" }}>{pending.length} do zrobienia</span>}
        </div>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: done.length > 0 ? 16 : 0 }}>
          {pending.map(hw => (
            <Card key={hw.id} style={{ padding: "12px 14px", borderLeft: `3px solid ${T.tertiary}`, background: T.tertiary + "06" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div onClick={() => toggleHw(hw.id)} className="tab-hover" style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  border: `2px solid ${T.tertiary}60`, background: "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <SubjectDot subject={hw.subject} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{hw.topic}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.tertiary, marginBottom: 3 }}>{hw.task}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: T.textDim, fontWeight: 500 }}>
                    <span>Zadane: {hw.date}</span>
                    <span style={{ color: T.orange, fontWeight: 700 }}>{hw.dueInfo}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {pending.length === 0 && (
        <Card style={{ padding: "16px", textAlign: "center", marginBottom: done.length > 0 ? 16 : 0 }}>
          <span style={{ fontSize: 13, color: T.success, fontWeight: 700 }}>🎉 Wszystko zrobione!</span>
        </Card>
      )}

      {/* Done */}
      {done.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>✓ Zrobione ({done.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {done.map(hw => (
              <Card key={hw.id} style={{ padding: "10px 14px", opacity: 0.6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div onClick={() => toggleHw(hw.id)} className="tab-hover" style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${T.success}60`, background: T.success + "22",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: T.success, fontSize: 12, fontWeight: 800,
                  }}>✓</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, textDecoration: "line-through" }}>{hw.task}</span>
                      {hw.checked && <span style={{ fontSize: 9, fontWeight: 700, color: T.success, background: T.success + "18", padding: "1px 6px", borderRadius: 4 }}>Sprawdzona ✓</span>}
                      {hw.checked === false && <span style={{ fontSize: 9, fontWeight: 700, color: T.textDim, background: T.surface, padding: "1px 6px", borderRadius: 4 }}>Niesprawdzona</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>{hw.date}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ RECENT ENTRIES ═══════════════ */

function RecentEntries() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>📖</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Notatki z lekcji</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.textDim, background: T.surface, padding: "2px 8px", borderRadius: 6 }}>{recentEntries.length}</span>
        </div>
        <span className="link-hover" style={{ fontSize: 12, color: T.primary, fontWeight: 700, cursor: "pointer" }}>Wszystkie →</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {recentEntries.map(entry => {
          const sC = subjectColors[entry.subject] || T.textDim;
          const isOpen = expanded === entry.id;
          return (
            <Card key={entry.id} onClick={() => setExpanded(isOpen ? null : entry.id)} className="entry-expand" style={{ padding: 0, border: isOpen ? `1px solid ${sC}30` : `1px solid ${T.cardBorder}` }}>
              <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: sC + "22", color: sC, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>✓</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 2 }}>{entry.topic}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: T.textDim, fontWeight: 600 }}>
                    <span>{entry.date}</span>
                    <SubjectDot subject={entry.subject} />
                    <span>{entry.subject}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {entry.homework && <span style={{ fontSize: 9, fontWeight: 700, color: T.tertiary, background: T.tertiary + "18", padding: "2px 6px", borderRadius: 4 }}>📝 PD</span>}
                  {entry.hwChecked && <span style={{ fontSize: 9, fontWeight: 700, color: T.success, background: T.success + "18", padding: "2px 6px", borderRadius: 4 }}>✓</span>}
                  <span style={{ fontSize: 11, color: T.textDim, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", display: "inline-block" }}>▼</span>
                </div>
              </div>

              {isOpen && (
                <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${T.cardBorder}` }}>
                  <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>Notatka od korepetytora</div>
                      <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5, fontWeight: 500, background: T.bgAlt, padding: "8px 10px", borderRadius: 8, borderLeft: `2px solid ${T.primary}40` }}>{entry.noteForStudent}</div>
                    </div>
                    {entry.homework && <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>Praca domowa</div>
                      <div style={{ fontSize: 12, color: T.tertiary, lineHeight: 1.5, fontWeight: 600, background: T.tertiary + "0A", padding: "8px 10px", borderRadius: 8, borderLeft: `2px solid ${T.tertiary}40` }}>📝 {entry.homework}</div>
                    </div>}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════ MAKEUP OVERVIEW ═══════════════ */

function MakeupOverview() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>↻</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Odrabianie</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: T.orange, background: T.orange + "18", padding: "2px 8px", borderRadius: 5 }}>{makeupItems.length}</span>
      </div>

      {makeupItems.map(item => (
        <Card key={item.id} style={{ borderLeft: `3px solid ${T.accent}`, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: T.accent + "22", color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>↻</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <SubjectDot subject={item.subject} />
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{item.subject}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: T.accent, background: T.accent + "18", padding: "1px 6px", borderRadius: 4 }}>ODR</span>
              </div>
              <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500, marginBottom: 4 }}>
                Odwołana: {item.originalDate} • {item.reason}
              </div>

              <div style={{ background: T.success + "0A", borderRadius: 8, padding: "8px 10px", marginTop: 6, borderLeft: `2px solid ${T.success}40` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, marginBottom: 3, textTransform: "uppercase", letterSpacing: .5 }}>Propozycja terminu</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>📅 {item.proposedDate}</div>
                <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500, marginTop: 2 }}>Rodzic musi zaakceptować termin</div>
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, background: T.textDim + "18", padding: "2px 8px", borderRadius: 5 }}>{item.daysLeft} dni</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ═══════════════ QUICK INFO ═══════════════ */

function QuickInfo() {
  return (
    <Card className="card-hover" style={{ background: T.bgAlt, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: student.color + "22", color: student.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>{student.initials}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{student.name}</div>
          <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600 }}>{student.cls} • <span style={{ color: levelColors[student.level] }}>{student.level}</span></div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          ["Przedmiot", "Matematyka"],
          ["Korepetytor", "Tomasz Kowalski"],
          ["Lekcji/tydzień", "3"],
          ["Frekwencja", "95%"],
        ].map(([label, val], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: T.textDim, fontWeight: 600 }}>{label}</span>
            <span style={{ color: T.text, fontWeight: 700 }}>{val}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ═══════════════ SCHEDULE MINI ═══════════════ */

function ScheduleMini() {
  const schedule = [
    { day: "Pon", time: "14:00–15:00", room: "Sala 1" },
    { day: "Śr", time: "14:00–15:00", room: "Sala 1" },
    { day: "Sob", time: "9:00–10:00", room: "Sala 1" },
  ];
  return (
    <Card className="card-hover" style={{ background: T.bgAlt, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>📋 Stały plan zajęć</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {schedule.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", background: T.surface, borderRadius: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: T.primary, width: 32 }}>{s.day}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>🕐 {s.time}</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: T.textDim }}>📍 {s.room}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: T.textDim, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
        <SubjectDot subject="Matematyka" />
        Matematyka • <span style={{ color: T.textMuted }}>Tomasz Kowalski</span>
      </div>
    </Card>
  );
}

/* ═══════════════ TUTOR CONTACT ═══════════════ */

function TutorContact() {
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => { setSent(true); setMessage(""); setTimeout(() => { setSent(false); setMessageOpen(false); }, 2000); };

  return (
    <Card className="card-hover" style={{ background: T.bgAlt, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>💬 Moi korepetytorzy</div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: T.primary + "18", color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>TK</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Tomasz Kowalski</div>
          <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <SubjectDot subject="Matematyka" />
            Matematyka
          </div>
        </div>
        <button onClick={() => setMessageOpen(!messageOpen)} className="btn-primary" style={{
          padding: "6px 12px", borderRadius: 8, border: "none",
          background: messageOpen ? T.textDim + "30" : T.primary + "18",
          color: messageOpen ? T.textDim : T.primary,
          fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}>{messageOpen ? "Anuluj" : "💬 Napisz"}</button>
      </div>

      {messageOpen && (
        <div style={{ marginTop: 8, animation: "fadeIn .2s ease" }}>
          {sent ? (
            <div style={{ padding: "12px", textAlign: "center", background: T.success + "0A", borderRadius: 8, border: `1px solid ${T.success}20` }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.success }}>✓ Wiadomość wysłana!</span>
            </div>
          ) : (
            <>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Napisz wiadomość do korepetytora..."
                style={{
                  width: "100%", minHeight: 72, padding: "10px 12px", borderRadius: 10,
                  border: `1px solid ${T.primary}30`, background: T.surface,
                  color: T.text, fontSize: 12, fontWeight: 500, fontFamily: "inherit",
                  outline: "none", resize: "vertical", lineHeight: 1.5,
                }}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="btn-primary"
                style={{
                  marginTop: 6, width: "100%", padding: "8px 0", borderRadius: 8,
                  border: "none", background: message.trim() ? T.primary : T.surface,
                  color: message.trim() ? "#fff" : T.textDim,
                  fontSize: 12, fontWeight: 700, cursor: message.trim() ? "pointer" : "default",
                  fontFamily: "inherit", opacity: message.trim() ? 1 : 0.5,
                }}
              >Wyślij wiadomość</button>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

/* ═══════════════ MAIN ═══════════════ */

export default function StudentDashboard() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: T.bg, fontFamily: "'Nunito', sans-serif", color: T.text, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.cardBorder}; border-radius: 50px; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        .card-hover { transition: all .18s ease !important; }
        .card-hover:hover { transform: translateY(-2px); border-color: rgba(59,143,240,0.22) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.18); }
        .card-click { transition: all .18s ease !important; cursor: pointer !important; }
        .card-click:hover { transform: translateY(-2px); border-color: rgba(59,143,240,0.22) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.18); background: ${T.surfaceHover} !important; }
        .entry-expand { transition: all .18s ease !important; cursor: pointer !important; }
        .entry-expand:hover { border-color: rgba(59,143,240,0.18) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.12); }
        .nav-item { transition: all .15s ease !important; }
        .nav-item:hover { background: rgba(59,143,240,0.08) !important; }
        .tab-hover { transition: all .15s ease !important; }
        .tab-hover:hover { background: rgba(59,143,240,0.10) !important; }
        .icon-btn { transition: all .15s ease !important; }
        .icon-btn:hover { background: ${T.surface} !important; transform: scale(1.08); }
        .icon-btn:active { transform: scale(0.95); }
        .link-hover { transition: all .15s ease !important; }
        .link-hover:hover { filter: brightness(1.2); text-decoration: underline; }
        .btn-primary { transition: all .15s ease !important; }
        .btn-primary:hover { filter: brightness(1.15); transform: scale(1.03); box-shadow: 0 2px 10px rgba(59,143,240,0.3); }
        .btn-primary:active { transform: scale(0.98); }
        .btn-ghost { transition: all .15s ease !important; }
        .btn-ghost:hover { background: ${T.surfaceHover} !important; transform: scale(1.02); }
        .btn-ghost:active { transform: scale(0.98); }
        .btn-cancel { transition: all .15s ease !important; }
        .btn-cancel:hover { filter: brightness(1.1); transform: scale(1.05); }
        .btn-cancel:active { transform: scale(0.97); }
      `}</style>

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar />
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, maxWidth: 1200 }}>
            {/* LEFT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <UpcomingLessons />
              <HomeworkSection />
              <RecentEntries />
            </div>

            {/* RIGHT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <QuickInfo />
              <TutorContact />
              <ScheduleMini />
              <MakeupOverview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
