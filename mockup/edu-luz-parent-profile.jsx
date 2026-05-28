import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", primaryDark: "#2D7DE8", secondary: "#FF6F4A",
  tertiary: "#FFCA28", accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4",
  danger: "#EF4444", pink: "#E84393", orange: "#F59E0B",
  cardBorder: "rgba(59,143,240,0.10)",
};

const subjectColors = { Matematyka: "#3B8FF0", Angielski: "#06B6D4" };
const levelColors = { SP: "#06B6D4", E8: "#FFCA28", "ŚR": "#3B8FF0", "ŚR★": "#7C5CFC", EM: "#EF4444", "EM★": "#E84393" };

/* ─── DATA ─── */

const parentData = {
  name: "Monika Nowak",
  initials: "MN",
  phone: "+48 602 345 678",
  email: "monika.nowak@gmail.com",
  address: "ul. Kwiatowa 15/3, 00-123 Warszawa",
};

const childrenData = [
  {
    id: "kacper", name: "Kacper Nowak", initials: "KN", color: "#3B8FF0",
    cls: "2 LO (Liceum nr III)", level: "ŚR★", birthDate: "12.03.2009",
    subjects: [
      { name: "Matematyka", type: "indyw.", tutor: "Tomasz Kowalski", schedule: "Pon 14:00, Śr 14:00, Sob 9:00", room: "Sala 1", rate: "360 zł/msc" },
    ],
  },
  {
    id: "ola", name: "Ola Nowak", initials: "ON", color: "#E84393",
    cls: "kl. 7 (SP nr 42)", level: "SP", birthDate: "05.09.2012",
    subjects: [
      { name: "Angielski", type: "indyw.", tutor: "Maria Zielińska", schedule: "Wt 15:15, Czw 15:15", room: "Sala 2", rate: "210 zł/msc" },
      { name: "Angielski", type: "grupa", tutor: "Maria Zielińska", schedule: "Śr 16:30", room: "Sala 3", rate: "180 zł/msc", groupName: "Grupa A" },
    ],
  },
];

const contractData = {
  startDate: "01.10.2025",
  monthlyTotal: 1680,
  paymentDeadline: "do 10. dnia miesiąca",
  minPeriod: "3 miesiące",
  noticePeriod: "1 miesiąc",
  makeupDeadline: "30 dni od odwołania",
  entryTime: "24h po lekcji",
  noShowPolicy: "Lekcja przepada, brak odrabiania",
  cancelPolicy: ">24h — do odrobienia, <24h — przepada",
};

const notificationSettings = [
  { id: "reminder_10", label: "Przypomnienie o płatności (10.)", desc: "SMS/email z przypomnieniem o zbliżającym się terminie", email: true, push: true },
  { id: "reminder_20", label: "Przypomnienie o płatności (20.)", desc: "Drugie przypomnienie jeśli brak wpłaty", email: true, push: true },
  { id: "reminder_last", label: "Przypomnienie o płatności (ost. dzień)", desc: "Ostateczne przypomnienie przed końcem miesiąca", email: true, push: false },
  { id: "lesson_cancel", label: "Odwołanie lekcji", desc: "Powiadomienie gdy lekcja zostanie odwołana", email: true, push: true },
  { id: "entry_new", label: "Nowy wpis od korepetytora", desc: "Notatka, praca domowa lub uwaga po lekcji", email: false, push: true },
  { id: "makeup_update", label: "Odrabianie — zmiana statusu", desc: "Nowa propozycja terminu, akceptacja lub odrzucenie", email: true, push: true },
  { id: "schedule_change", label: "Zmiana w harmonogramie", desc: "Zmiana sali, godziny lub korepetytora", email: true, push: true },
];

/* ═══════════════ SHARED UI ═══════════════ */

const Card = ({ children, style, onClick, className }) => (
  <div onClick={onClick} className={className || "card-hover"} style={{
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

function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} className="tab-hover" style={{
      width: 36, height: 20, borderRadius: 10, cursor: "pointer",
      background: on ? T.primary : T.bgAlt,
      border: `1px solid ${on ? T.primary + "50" : T.cardBorder}`,
      position: "relative", flexShrink: 0,
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: "50%",
        background: on ? "#fff" : T.textDim,
        position: "absolute", top: 2,
        left: on ? 19 : 2,
        transition: "all .15s ease",
      }} />
    </div>
  );
}

/* ═══════════════ SIDEBAR ═══════════════ */

function Sidebar({ collapsed, onToggle }) {
  const items = [
    { icon: "📊", label: "Dashboard", active: false },
    { icon: "📚", label: "Zajęcia", active: false },
    { icon: "💳", label: "Płatności", active: false },
    { icon: "👤", label: "Profil", active: true },
  ];
  return (
    <div style={{ width: collapsed ? 64 : 240, minWidth: collapsed ? 64 : 240, background: T.bgAlt, borderRight: `1px solid ${T.cardBorder}`, display: "flex", flexDirection: "column", transition: "all .2s", zIndex: 10 }}>
      <div style={{ padding: collapsed ? "20px 12px" : "20px 20px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${T.primary},${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff" }}>Ez</div>
        {!collapsed && <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>EDU <span style={{ color: T.primary }}>LUZ</span></div>
          <div style={{ fontSize: 9, fontWeight: 800, color: T.accent, background: T.accent + "18", padding: "2px 8px", borderRadius: 4, marginTop: 2, letterSpacing: 1.5, textAlign: "center" }}>RODZIC</div>
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
      <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Dzień dobry, </span>
      <span style={{ fontSize: 15, fontWeight: 800, color: T.primary }}>Monika</span>
      <span style={{ fontSize: 12, color: T.textDim, marginLeft: 12, fontWeight: 600 }}>Czwartek, 22 maja 2026</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div className="icon-btn" style={{ width: 36, height: 36, borderRadius: 10, background: T.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
        <span style={{ fontSize: 16 }}>🔔</span>
        <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: T.danger, border: `2px solid ${T.bgAlt}` }} />
      </div>
      <div className="icon-btn" style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${T.accent},${T.pink})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", cursor: "pointer" }}>MN</div>
    </div>
  </div>
);

/* ═══════════════ PARENT DATA ═══════════════ */

function ParentInfo() {
  const [editing, setEditing] = useState(false);

  return (
    <Card className="card-hover" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg,${T.accent},${T.pink})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff" }}>{parentData.initials}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>{parentData.name}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.accent }}>Rodzic • {childrenData.length} dzieci</div>
          </div>
        </div>
        <button onClick={() => setEditing(!editing)} className="btn-ghost" style={{
          padding: "6px 14px", borderRadius: 8,
          border: `1px solid ${editing ? T.primary + "40" : T.cardBorder}`,
          background: editing ? T.primary + "10" : "transparent",
          color: editing ? T.primary : T.textMuted,
          fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}>{editing ? "Zapisz" : "Edytuj dane"}</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { icon: "📞", label: "Telefon", value: parentData.phone },
          { icon: "✉️", label: "Email", value: parentData.email },
          { icon: "📍", label: "Adres", value: parentData.address },
        ].map((field, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{field.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 2 }}>{field.label}</div>
              {editing ? (
                <input defaultValue={field.value} style={{
                  width: "100%", padding: "6px 10px", borderRadius: 8,
                  border: `1px solid ${T.primary}30`, background: T.bgAlt,
                  color: T.text, fontSize: 13, fontWeight: 600,
                  fontFamily: "inherit", outline: "none",
                }} />
              ) : (
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{field.value}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ═══════════════ CHILDREN CARDS ═══════════════ */

function ChildrenSection() {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .8, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        👨‍👩‍👧‍👦 Dzieci
        <span style={{ fontSize: 10, fontWeight: 700, color: T.primary, background: T.primary + "15", padding: "2px 8px", borderRadius: 5 }}>{childrenData.length}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {childrenData.map(child => {
          const isOpen = expandedId === child.id;
          const totalRate = child.subjects.reduce((s, sub) => s + parseInt(sub.rate), 0);

          return (
            <Card key={child.id} onClick={() => setExpandedId(isOpen ? null : child.id)} className="entry-expand" style={{
              padding: 0, cursor: "pointer",
              border: isOpen ? `1px solid ${child.color}30` : `1px solid ${T.cardBorder}`,
            }}>
              {/* Header */}
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: child.color + "22", color: child.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{child.initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{child.name}</span>
                    <LevelBadge level={child.level} />
                  </div>
                  <div style={{ fontSize: 12, color: T.textDim, fontWeight: 600 }}>
                    {child.cls} • {child.subjects.length} {child.subjects.length === 1 ? "przedmiot" : "zajęcia"} • {totalRate} zł/msc
                  </div>
                </div>
                <span style={{ fontSize: 11, color: T.textDim, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", display: "inline-block" }}>▼</span>
              </div>

              {/* Expanded */}
              {isOpen && (
                <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${T.cardBorder}` }}>
                  <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Personal info */}
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ fontSize: 12 }}>
                        <span style={{ color: T.textDim, fontWeight: 600 }}>Data urodzenia: </span>
                        <span style={{ color: T.text, fontWeight: 700 }}>{child.birthDate}</span>
                      </div>
                    </div>

                    {/* Subjects */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Zajęcia</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {child.subjects.map((sub, si) => {
                          const sC = subjectColors[sub.name] || T.textDim;
                          return (
                            <div key={si} style={{
                              background: T.bgAlt, borderRadius: 10, padding: "10px 12px",
                              borderLeft: `3px solid ${sC}`,
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                <SubjectDot subject={sub.name} />
                                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{sub.name}</span>
                                {sub.type === "grupa" ? (
                                  <span style={{ fontSize: 9, fontWeight: 700, color: T.accent, background: T.accent + "18", padding: "1px 6px", borderRadius: 4 }}>GRUPA — {sub.groupName}</span>
                                ) : (
                                  <span style={{ fontSize: 9, fontWeight: 700, color: T.primary, background: T.primary + "18", padding: "1px 6px", borderRadius: 4 }}>INDYW.</span>
                                )}
                                <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 800, color: T.text }}>{sub.rate}</span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 11, color: T.textDim, fontWeight: 500, paddingLeft: 14 }}>
                                <div>👤 {sub.tutor}</div>
                                <div>🕐 {sub.schedule}</div>
                                <div>📍 {sub.room}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Monthly total for child */}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: child.color + "08", borderRadius: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.textMuted }}>Opłata miesięczna</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: child.color }}>{totalRate} zł</span>
                    </div>
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

/* ═══════════════ CONTRACT ═══════════════ */

function ContractSection() {
  const [open, setOpen] = useState(false);

  const fields = [
    ["Umowa od", contractData.startDate],
    ["Opłata miesięczna", contractData.monthlyTotal.toLocaleString("pl-PL") + " zł"],
    ["Termin płatności", contractData.paymentDeadline],
    ["Min. okres umowy", contractData.minPeriod],
    ["Okres wypowiedzenia", contractData.noticePeriod],
    ["Termin odrobienia", contractData.makeupDeadline],
    ["Czas na wpis", contractData.entryTime],
    ["Polityka no-show", contractData.noShowPolicy],
    ["Polityka odwołań", contractData.cancelPolicy],
  ];

  return (
    <div>
      <div onClick={() => setOpen(!open)} className="tab-hover" style={{
        fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .8,
        marginBottom: 12, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 0",
      }}>
        📄 Regulamin i warunki centrum
        <span style={{ fontSize: 11, color: T.textDim, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", display: "inline-block", marginLeft: "auto" }}>▼</span>
      </div>

      {open && (
        <Card className="card-hover" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500, marginBottom: 10, fontStyle: "italic" }}>Warunki obowiązujące wszystkich uczniów centrum EDU LUZ</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {fields.map(([label, val], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: 12, padding: "4px 0", borderBottom: i < fields.length - 1 ? `1px solid ${T.cardBorder}` : "none" }}>
                <span style={{ color: T.textDim, fontWeight: 600, flexShrink: 0, marginRight: 16 }}>{label}</span>
                <span style={{ color: T.text, fontWeight: 700, textAlign: "right" }}>{val}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════ NOTIFICATIONS ═══════════════ */

function NotificationSettings() {
  const [settings, setSettings] = useState(
    Object.fromEntries(notificationSettings.map(n => [n.id, { email: n.email, push: n.push }]))
  );

  const isPaymentReminder = (id) => id.startsWith("reminder_");

  const toggle = (id, type) => {
    const current = settings[id];
    const other = type === "email" ? "push" : "email";

    // Dla przypomnień o płatnościach — nie pozwól wyłączyć obu
    if (isPaymentReminder(id) && current[type] && !current[other]) return;

    setSettings(prev => ({
      ...prev,
      [id]: { ...prev[id], [type]: !prev[id][type] },
    }));
  };

  const paymentNotifs = notificationSettings.filter(n => isPaymentReminder(n.id));
  const otherNotifs = notificationSettings.filter(n => !isPaymentReminder(n.id));

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .8, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        🔔 Powiadomienia
      </div>

      {/* Payment reminders — always active */}
      <Card className="card-hover" style={{ padding: "4px 16px", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0 6px", borderBottom: `1px solid ${T.cardBorder}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.orange, textTransform: "uppercase", letterSpacing: .5 }}>Przypomnienia o płatnościach — zawsze aktywne</div>
          <div style={{ display: "flex" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, width: 50, textAlign: "center" }}>Email</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, width: 50, textAlign: "center" }}>Push</span>
          </div>
        </div>

        {paymentNotifs.map((n, i) => {
          const s = settings[n.id];
          const cantToggleEmail = isPaymentReminder(n.id) && s.email && !s.push;
          const cantTogglePush = isPaymentReminder(n.id) && s.push && !s.email;
          return (
            <div key={n.id} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 0",
              borderBottom: i < paymentNotifs.length - 1 ? `1px solid ${T.cardBorder}` : "none",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 1 }}>{n.label}</div>
                <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>{n.desc}</div>
              </div>
              <div style={{ width: 50, display: "flex", justifyContent: "center", opacity: cantToggleEmail ? 0.4 : 1 }}>
                <Toggle on={s.email} onToggle={() => toggle(n.id, "email")} />
              </div>
              <div style={{ width: 50, display: "flex", justifyContent: "center", opacity: cantTogglePush ? 0.4 : 1 }}>
                <Toggle on={s.push} onToggle={() => toggle(n.id, "push")} />
              </div>
            </div>
          );
        })}
        <div style={{ fontSize: 10, color: T.textDim, fontStyle: "italic", padding: "6px 0 8px" }}>
          Minimum jeden kanał musi pozostać włączony
        </div>
      </Card>

      {/* Other notifications — freely toggleable */}
      <Card className="card-hover" style={{ padding: "4px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0 6px", borderBottom: `1px solid ${T.cardBorder}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5 }}>Pozostałe powiadomienia</div>
          <div style={{ display: "flex" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, width: 50, textAlign: "center" }}>Email</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, width: 50, textAlign: "center" }}>Push</span>
          </div>
        </div>

        {otherNotifs.map((n, i) => {
          const s = settings[n.id];
          return (
            <div key={n.id} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 0",
              borderBottom: i < otherNotifs.length - 1 ? `1px solid ${T.cardBorder}` : "none",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 1 }}>{n.label}</div>
                <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>{n.desc}</div>
              </div>
              <div style={{ width: 50, display: "flex", justifyContent: "center" }}>
                <Toggle on={s.email} onToggle={() => toggle(n.id, "email")} />
              </div>
              <div style={{ width: 50, display: "flex", justifyContent: "center" }}>
                <Toggle on={s.push} onToggle={() => toggle(n.id, "push")} />
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

/* ═══════════════ CENTER INFO ═══════════════ */

function CenterContact() {
  return (
    <Card className="card-hover" style={{ background: T.bgAlt, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>🏢 Centrum EDU LUZ</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>📍</span>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>ul. Szkolna 8, 00-456 Warszawa</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>📞</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>+48 123 456 789</div>
            <div style={{ fontSize: 10, color: T.textDim, fontWeight: 600 }}>Pon–Sob 7:30–21:00, Ndz 9:00–14:00</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>✉️</span>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.primary }}>kontakt@eduluz.pl</div>
        </div>
      </div>
      <button className="btn-primary" style={{ marginTop: 12, width: "100%", padding: "8px 0", borderRadius: 8, border: "none", background: T.primary + "15", color: T.primary, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>💬 Wyślij wiadomość</button>
    </Card>
  );
}

/* ═══════════════ ACCOUNT ACTIONS ═══════════════ */

function AccountActions() {
  return (
    <Card className="card-hover" style={{ background: T.bgAlt, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>⚙ Konto</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <button className="btn-ghost" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>🔒 Zmień hasło</button>
        <button className="btn-ghost" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.danger}20`, background: "transparent", color: T.danger, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textAlign: "left", opacity: 0.7 }}>🚪 Wyloguj się</button>
      </div>
    </Card>
  );
}

/* ═══════════════ MAIN ═══════════════ */

export default function ParentProfile() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: T.bg, fontFamily: "'Nunito', sans-serif", color: T.text, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.cardBorder}; border-radius: 50px; }
        .card-hover { transition: all .18s ease !important; }
        .card-hover:hover { transform: translateY(-2px); border-color: rgba(59,143,240,0.22) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.18); }
        .entry-expand { transition: all .18s ease !important; cursor: pointer !important; }
        .entry-expand:hover { border-color: rgba(59,143,240,0.18) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.12); }
        .nav-item { transition: all .15s ease !important; }
        .nav-item:hover { background: rgba(59,143,240,0.08) !important; }
        .tab-hover { transition: all .15s ease !important; }
        .tab-hover:hover { background: rgba(59,143,240,0.10) !important; }
        .icon-btn { transition: all .15s ease !important; }
        .icon-btn:hover { background: ${T.surface} !important; transform: scale(1.08); }
        .icon-btn:active { transform: scale(0.95); }
        .btn-primary { transition: all .15s ease !important; }
        .btn-primary:hover { filter: brightness(1.15); transform: scale(1.02); box-shadow: 0 2px 10px rgba(59,143,240,0.3); }
        .btn-ghost { transition: all .15s ease !important; }
        .btn-ghost:hover { background: ${T.surfaceHover} !important; transform: scale(1.01); }
        .btn-ghost:active { transform: scale(0.98); }
      `}</style>

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar />
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px 40px" }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, maxWidth: 1200 }}>
            {/* LEFT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <ParentInfo />
              <ChildrenSection />
              <ContractSection />
              <NotificationSettings />
            </div>

            {/* RIGHT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <CenterContact />
              <AccountActions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
