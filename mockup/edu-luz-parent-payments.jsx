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

const childrenData = [
  { id: "kacper", name: "Kacper Nowak", initials: "KN", color: "#3B8FF0", cls: "2 LO", level: "ŚR★" },
  { id: "ola", name: "Ola Nowak", initials: "ON", color: "#E84393", cls: "kl. 7", level: "SP" },
];

/* ─── PAYMENT DATA ─── */

const months = [
  {
    id: "2026-05", label: "Maj 2026", status: "oczekuje", total: 1680, dueDate: "10.05.2026", delayNumber: 1,
    breakdown: [
      { child: "kacper", items: [{ desc: "Matematyka — indyw. (ŚR★)", subject: "Matematyka", lessonsWeek: 3, amount: 1080 }] },
      { child: "ola", items: [
        { desc: "Angielski — indyw. (SP)", subject: "Angielski", lessonsWeek: 2, amount: 420 },
        { desc: "Angielski — grupa (SP)", subject: "Angielski", lessonsWeek: 1, amount: 180 },
      ]},
    ],
    paidDate: null, paidAmount: null,
    reminders: [
      { day: "10.05", sent: true, label: "Przypomnienie 1 (10.)" },
      { day: "20.05", sent: true, label: "Przypomnienie 2 (20.)" },
      { day: "31.05", sent: false, label: "Przypomnienie 3 (ost. dzień)" },
    ],
  },
  {
    id: "2026-04", label: "Kwiecień 2026", status: "opłacone", total: 1680, dueDate: "10.04.2026", delayNumber: 0,
    breakdown: [
      { child: "kacper", items: [{ desc: "Matematyka — indyw. (ŚR★)", subject: "Matematyka", lessonsWeek: 3, amount: 1080 }] },
      { child: "ola", items: [
        { desc: "Angielski — indyw. (SP)", subject: "Angielski", lessonsWeek: 2, amount: 420 },
        { desc: "Angielski — grupa (SP)", subject: "Angielski", lessonsWeek: 1, amount: 180 },
      ]},
    ],
    paidDate: "08.04.2026", paidAmount: 1680, reminders: [],
  },
  {
    id: "2026-03", label: "Marzec 2026", status: "opłacone", total: 1680, dueDate: "10.03.2026", delayNumber: 0,
    breakdown: [
      { child: "kacper", items: [{ desc: "Matematyka — indyw. (ŚR★)", subject: "Matematyka", lessonsWeek: 3, amount: 1080 }] },
      { child: "ola", items: [
        { desc: "Angielski — indyw. (SP)", subject: "Angielski", lessonsWeek: 2, amount: 420 },
        { desc: "Angielski — grupa (SP)", subject: "Angielski", lessonsWeek: 1, amount: 180 },
      ]},
    ],
    paidDate: "10.03.2026", paidAmount: 1680, reminders: [],
  },
  {
    id: "2026-02", label: "Luty 2026", status: "opłacone", total: 1680, dueDate: "10.02.2026", delayNumber: 0,
    breakdown: [
      { child: "kacper", items: [{ desc: "Matematyka — indyw. (ŚR★)", subject: "Matematyka", lessonsWeek: 3, amount: 1080 }] },
      { child: "ola", items: [
        { desc: "Angielski — indyw. (SP)", subject: "Angielski", lessonsWeek: 2, amount: 420 },
        { desc: "Angielski — grupa (SP)", subject: "Angielski", lessonsWeek: 1, amount: 180 },
      ]},
    ],
    paidDate: "07.02.2026", paidAmount: 1680, reminders: [],
  },
  {
    id: "2026-01", label: "Styczeń 2026", status: "opłacone-po-terminie", total: 1680, dueDate: "10.01.2026", delayNumber: 1,
    breakdown: [
      { child: "kacper", items: [{ desc: "Matematyka — indyw. (ŚR★)", subject: "Matematyka", lessonsWeek: 3, amount: 1080 }] },
      { child: "ola", items: [
        { desc: "Angielski — indyw. (SP)", subject: "Angielski", lessonsWeek: 2, amount: 420 },
        { desc: "Angielski — grupa (SP)", subject: "Angielski", lessonsWeek: 1, amount: 180 },
      ]},
    ],
    paidDate: "18.01.2026", paidAmount: 1680, reminders: [],
  },
];

const contractInfo = {
  startDate: "01.10.2025",
  monthlyTotal: 1680,
  paymentDeadline: "do 10. dnia miesiąca",
  bankAccount: "PL 12 3456 7890 1234 5678 9012 3456",
  bankName: "EDU LUZ Sp. z o.o.",
  title: "Opłata za zajęcia — Nowak — {miesiąc} {rok}",
};

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
    { icon: "📊", label: "Dashboard", active: false, badge: null },
    { icon: "📚", label: "Zajęcia", active: false, badge: null },
    { icon: "💳", label: "Płatności", active: true, badge: null },
    { icon: "👤", label: "Profil", active: false, badge: null },
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
          <div key={i} className="nav-item" style={{ display: "flex", alignItems: "center", gap: 12, padding: collapsed ? "12px 0" : "12px 16px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: 10, background: it.active ? T.primary + "18" : "transparent", color: it.active ? T.primary : T.textMuted, fontWeight: it.active ? 800 : 600, fontSize: 14, cursor: "pointer", marginBottom: 4, position: "relative" }}>
            <span style={{ fontSize: 18 }}>{it.icon}</span>
            {!collapsed && <span>{it.label}</span>}
            {it.badge && <span style={{ position: collapsed ? "absolute" : "relative", top: collapsed ? 6 : "auto", right: collapsed ? 8 : "auto", marginLeft: collapsed ? 0 : "auto", background: T.danger, color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 8, padding: "1px 6px" }}>{it.badge}</span>}
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

/* ═══════════════ CHILD SWITCHER ═══════════════ */

function ChildSwitcher({ active, onChange }) {
  const tabs = [
    { id: "all", label: "Wszystkie", icon: "👨‍👩‍👧‍👦", color: T.primary },
    ...childrenData.map(c => ({ id: c.id, label: c.name.split(" ")[0], icon: null, color: c.color, initials: c.initials })),
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, background: T.bgAlt, borderRadius: 12, padding: 4, border: `1px solid ${T.cardBorder}`, width: "fit-content" }}>
      {tabs.map(tab => {
        const on = active === tab.id;
        return (
          <div key={tab.id} onClick={() => onChange(tab.id)} className="tab-hover" style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, background: on ? tab.color + "18" : "transparent", cursor: "pointer" }}>
            {tab.icon ? <span style={{ fontSize: 14 }}>{tab.icon}</span>
              : <div style={{ width: 22, height: 22, borderRadius: 6, background: (on ? tab.color : T.textDim) + "22", color: on ? tab.color : T.textDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800 }}>{tab.initials}</div>}
            <span style={{ fontSize: 13, fontWeight: on ? 800 : 600, color: on ? tab.color : T.textMuted }}>{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════ CURRENT MONTH ═══════════════ */

function CurrentMonth({ childFilter }) {
  const m = months[0]; // maj 2026 — bieżący
  const fb = childFilter === "all" ? m.breakdown : m.breakdown.filter(b => b.child === childFilter);
  const ft = fb.reduce((s, b) => s + b.items.reduce((a, i) => a + i.amount, 0), 0);

  const cfg = {
    opłacone: { color: T.success, label: "Opłacone", icon: "✓", desc: null },
    oczekuje: { color: T.orange, label: "Oczekuje na wpłatę", icon: "⏳", desc: "Przelew jeszcze nie wpłynął" },
    zaległość: { color: T.danger, label: "Zaległość", icon: "⚠", desc: "Termin płatności minął" },
    "opłacone-po-terminie": { color: T.success, label: "Opłacone (po terminie)", icon: "✓", desc: null },
  };
  const s = cfg[m.status];

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .8, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        💳 Bieżący miesiąc
        <span style={{ fontSize: 11, fontWeight: 800, color: s.color, background: s.color + "18", padding: "2px 10px", borderRadius: 6 }}>{s.icon} {s.label}</span>
      </div>

      <Card className="card-hover" style={{ borderLeft: `4px solid ${s.color}`, background: s.color + "04", padding: 20 }}>
        {/* Top: amount + status */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textDim, marginBottom: 4 }}>
              {m.label}{childFilter !== "all" && (" — " + childrenData.find(c => c.id === childFilter)?.name)}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: T.text }}>{ft.toLocaleString("pl-PL")}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: T.textDim }}>zł</span>
              {childFilter !== "all" && <span style={{ fontSize: 12, fontWeight: 600, color: T.textDim }}>z {m.total.toLocaleString("pl-PL")} zł łącznie</span>}
            </div>
            {m.delayNumber > 0 && m.status !== "opłacone" && (
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: T.danger, background: T.danger + "12", padding: "3px 10px", borderRadius: 6, display: "inline-block" }}>
                {m.delayNumber}. opóźnienie w tym roku szkolnym
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textDim }}>Termin płatności</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: m.status !== "opłacone" ? s.color : T.textMuted }}>{contractInfo.paymentDeadline}</div>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ background: T.bgAlt, borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Składowe opłaty</div>
          {fb.map((b, i) => {
            const ch = childrenData.find(c => c.id === b.child);
            const sub = b.items.reduce((a, it) => a + it.amount, 0);
            return (
              <div key={i} style={{ marginBottom: i < fb.length - 1 ? 10 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: ch.color + "22", color: ch.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800 }}>{ch.initials}</div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{ch.name.split(" ")[0]}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{sub} zł</span>
                </div>
                {b.items.map((it, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 28, marginTop: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.textDim, fontWeight: 500 }}>
                      <SubjectDot subject={it.subject} />
                      <span>{it.desc}</span>
                      <span style={{ fontSize: 10, color: T.textDim }}>({it.lessonsWeek}×/tydz)</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.textMuted }}>{it.amount} zł</span>
                  </div>
                ))}
              </div>
            );
          })}
          {childFilter === "all" && fb.length > 1 && (
            <div style={{ borderTop: `1px solid ${T.cardBorder}`, paddingTop: 8, marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: T.text }}>
              <span>Łącznie</span><span>{ft.toLocaleString("pl-PL")} zł</span>
            </div>
          )}
        </div>

        {/* Bank transfer info */}
        <div style={{ background: T.primary + "08", borderRadius: 10, padding: "12px 14px", border: `1px solid ${T.primary}15` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Dane do przelewu</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: T.textDim, fontWeight: 600 }}>Odbiorca</span>
              <span style={{ color: T.text, fontWeight: 700 }}>{contractInfo.bankName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: T.textDim, fontWeight: 600 }}>Nr konta</span>
              <span style={{ color: T.text, fontWeight: 700, fontFamily: "monospace", fontSize: 11 }}>{contractInfo.bankAccount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: T.textDim, fontWeight: 600 }}>Tytuł</span>
              <span style={{ color: T.primary, fontWeight: 700 }}>{contractInfo.title.replace("{miesiąc}", "maj").replace("{rok}", "2026")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: T.textDim, fontWeight: 600 }}>Kwota</span>
              <span style={{ color: T.text, fontWeight: 800 }}>{(childFilter === "all" ? m.total : ft).toLocaleString("pl-PL")} zł</span>
            </div>
          </div>
        </div>

        {/* Reminders */}
        {m.reminders && m.reminders.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>Przypomnienia</div>
            <div style={{ display: "flex", gap: 8 }}>
              {m.reminders.map((r, i) => (
                <div key={i} style={{
                  fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                  background: r.sent ? T.textDim + "18" : T.surface,
                  color: r.sent ? T.textDim : T.textMuted,
                  border: `1px solid ${r.sent ? "transparent" : T.cardBorder}`,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  {r.sent ? <span style={{ color: T.success, fontSize: 10 }}>✓</span> : <span style={{ color: T.textDim, fontSize: 10 }}>○</span>}
                  {r.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════ PAYMENT HISTORY ═══════════════ */

function PaymentHistory({ childFilter }) {
  const [expandedId, setExpandedId] = useState(null);
  const past = months.slice(1); // bez bieżącego

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .8, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        📖 Historia wpłat
        <span style={{ fontSize: 10, fontWeight: 700, color: T.textDim, background: T.surface, padding: "2px 8px", borderRadius: 5 }}>{past.length} msc</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {past.map(m => {
          const fb = childFilter === "all" ? m.breakdown : m.breakdown.filter(b => b.child === childFilter);
          const ft = fb.reduce((s, b) => s + b.items.reduce((a, i) => a + i.amount, 0), 0);
          const isOpen = expandedId === m.id;
          const isLate = m.status === "opłacone-po-terminie";

          const dotColor = m.status === "opłacone" ? T.success : isLate ? T.orange : T.danger;

          return (
            <Card key={m.id} onClick={() => setExpandedId(isOpen ? null : m.id)} className="entry-expand" style={{
              padding: 0, cursor: "pointer",
              border: isOpen ? `1px solid ${T.primary}25` : `1px solid ${T.cardBorder}`,
            }}>
              <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                {/* Status dot */}
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{m.label}</span>
                    {isLate && <span style={{ fontSize: 9, fontWeight: 700, color: T.orange, background: T.orange + "18", padding: "1px 6px", borderRadius: 4 }}>PO TERMINIE</span>}
                  </div>
                  <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500, marginTop: 2 }}>
                    Wpłata: {m.paidDate}
                    {isLate && <span style={{ color: T.orange }}> ({m.delayNumber}. opóźnienie)</span>}
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{ft.toLocaleString("pl-PL")} zł</span>
                  {childFilter !== "all" && <div style={{ fontSize: 10, color: T.textDim }}>z {m.total} zł</div>}
                </div>

                <span style={{ fontSize: 11, color: T.textDim, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", display: "inline-block", marginLeft: 4 }}>▼</span>
              </div>

              {isOpen && (
                <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${T.cardBorder}` }}>
                  <div style={{ paddingTop: 10 }}>
                    <div style={{ background: T.bgAlt, borderRadius: 8, padding: "10px 12px" }}>
                      {fb.map((b, i) => {
                        const ch = childrenData.find(c => c.id === b.child);
                        const sub = b.items.reduce((a, it) => a + it.amount, 0);
                        return (
                          <div key={i} style={{ marginBottom: i < fb.length - 1 ? 8 : 0 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ width: 18, height: 18, borderRadius: 5, background: ch.color + "22", color: ch.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800 }}>{ch.initials}</div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{ch.name.split(" ")[0]}</span>
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{sub} zł</span>
                            </div>
                            {b.items.map((it, j) => (
                              <div key={j} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textDim, fontWeight: 500, paddingLeft: 24, marginTop: 1 }}>
                                <span>{it.desc}</span><span>{it.amount} zł</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
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

/* ═══════════════ NEXT PAYMENT ═══════════════ */

function NextPayment() {
  const current = months[0];
  const isPending = current.status === "oczekuje" || current.status === "zaległość";
  const cfg = {
    oczekuje: { color: T.orange, label: "Do zapłaty", bg: T.orange },
    zaległość: { color: T.danger, label: "Zaległość!", bg: T.danger },
    opłacone: { color: T.success, label: "Opłacone", bg: T.success },
  };
  const s = cfg[current.status] || cfg.oczekuje;

  // Days until next reminder
  const nextReminder = current.reminders?.find(r => !r.sent);

  return (
    <Card className="card-hover" style={{ background: isPending ? s.bg + "08" : T.bgAlt, borderLeft: `4px solid ${s.color}`, padding: "16px 16px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>{isPending ? "⏳ Oczekiwana wpłata" : "✓ Bieżący miesiąc"}</div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 26, fontWeight: 900, color: T.text }}>{current.total.toLocaleString("pl-PL")}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: T.textDim }}>zł</span>
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: isPending ? s.color : T.textMuted, marginBottom: 10 }}>
        {current.label} • termin {contractInfo.paymentDeadline}
      </div>

      {isPending && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {current.delayNumber > 0 && (
            <div style={{ fontSize: 11, fontWeight: 700, color: T.danger, background: T.danger + "12", padding: "4px 10px", borderRadius: 6 }}>
              {current.delayNumber}. opóźnienie
            </div>
          )}
          {nextReminder && (
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textDim }}>
              Następne przypomnienie: <span style={{ color: T.textMuted }}>{nextReminder.label}</span>
            </div>
          )}
        </div>
      )}

      {!isPending && (
        <div style={{ fontSize: 12, fontWeight: 600, color: T.success, display: "flex", alignItems: "center", gap: 4 }}>
          ✓ Zapłacone {current.paidDate}
        </div>
      )}
    </Card>
  );
}

/* ═══════════════ CONTRACT INFO ═══════════════ */

function ContractBox() {
  return (
    <Card className="card-hover" style={{ background: T.bgAlt, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>📄 Informacje o umowie</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          ["Umowa od", contractInfo.startDate],
          ["Opłata miesięczna", contractInfo.monthlyTotal.toLocaleString("pl-PL") + " zł"],
          ["Termin płatności", contractInfo.paymentDeadline],
        ].map(([label, val], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: T.textDim, fontWeight: 600 }}>{label}</span>
            <span style={{ color: T.text, fontWeight: 700 }}>{val}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, borderTop: `1px solid ${T.cardBorder}`, paddingTop: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>Dzieci w umowie</div>
        {childrenData.map((ch, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: ch.color + "22", color: ch.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800 }}>{ch.initials}</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{ch.name}</span>
            <span style={{ fontSize: 11, color: T.textDim }}>• {ch.cls}</span>
            <LevelBadge level={ch.level} />
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ═══════════════ TIMELINE DOT STRIP ═══════════════ */

function TimelineDots() {
  return (
    <Card className="card-hover" style={{ background: T.bgAlt, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>Rok szkolny 2025/2026</div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        {["Paź", "Lis", "Gru", "Sty", "Lut", "Mar", "Kwi", "Maj"].map((label, i) => {
          const colors = [T.success, T.success, T.success, T.orange, T.success, T.success, T.success, T.orange];
          const statuses = ["✓", "✓", "✓", "!", "✓", "✓", "✓", "⏳"];
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: colors[i] + "22", color: colors[i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, border: i === 7 ? `2px solid ${colors[i]}` : "none" }}>{statuses[i]}</div>
              <span style={{ fontSize: 9, fontWeight: 600, color: i === 7 ? T.text : T.textDim }}>{label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 10, color: T.textDim, fontWeight: 600 }}>
        <span><span style={{ color: T.success }}>●</span> Terminowo</span>
        <span><span style={{ color: T.orange }}>●</span> Opóźnienie</span>
        <span style={{ border: `1.5px solid ${T.orange}`, borderRadius: "50%", width: 10, height: 10, display: "inline-block" }} /> Bieżący
      </div>
    </Card>
  );
}

/* ═══════════════ MAIN ═══════════════ */

export default function ParentPayments() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeChild, setActiveChild] = useState("all");

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: T.bg, fontFamily: "'Nunito', sans-serif", color: T.text, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.cardBorder}; border-radius: 50px; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        .card-hover { transition: all .18s ease !important; }
        .card-hover:hover { transform: translateY(-2px); border-color: rgba(59,143,240,0.22) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.18); }
        .card-click { transition: all .18s ease !important; cursor: pointer !important; }
        .card-click:hover { transform: translateY(-2px); border-color: rgba(59,143,240,0.22) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.18); background: ${T.surfaceHover} !important; }
        .card-click:active { transform: translateY(0); }
        .nav-item { transition: all .15s ease !important; }
        .nav-item:hover { background: rgba(59,143,240,0.08) !important; }
        .tab-hover { transition: all .15s ease !important; }
        .tab-hover:hover { background: rgba(59,143,240,0.10) !important; }
        .icon-btn { transition: all .15s ease !important; }
        .icon-btn:hover { background: ${T.surface} !important; transform: scale(1.08); }
        .icon-btn:active { transform: scale(0.95); }
        .entry-expand { transition: all .18s ease !important; cursor: pointer !important; }
        .entry-expand:hover { border-color: rgba(59,143,240,0.18) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.12); }
      `}</style>

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar />
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px 40px" }}>
          <ChildSwitcher active={activeChild} onChange={setActiveChild} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, maxWidth: 1200, marginTop: 20 }}>
            {/* LEFT: current month + history */}
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <CurrentMonth childFilter={activeChild} />
              <PaymentHistory childFilter={activeChild} />
            </div>

            {/* RIGHT: next payment + timeline + contract */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <NextPayment />
              <TimelineDots />
              <ContractBox />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
