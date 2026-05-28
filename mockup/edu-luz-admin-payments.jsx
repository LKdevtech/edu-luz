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

const months = ["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];

const payments = [
  { id: "P01", parent: "Marek Nowak", children: [{ name: "Kacper Nowak", fee: 880 }],
    total: 880,
    history: [
      { month: "Sty", status: "paid", paidDate: "08.01", onTime: true },
      { month: "Lut", status: "paid", paidDate: "09.02", onTime: true },
      { month: "Mar", status: "paid", paidDate: "10.03", onTime: true },
      { month: "Kwi", status: "paid", paidDate: "07.04", onTime: true },
      { month: "Maj", status: "paid", paidDate: "09.05", onTime: true },
      { month: "Cze", status: "paid", paidDate: "08.06", onTime: true },
    ], lateCount: 0, remindersOff: [] },
  { id: "P02", parent: "Anna Kowalska", children: [{ name: "Julia Kowalska", fee: 1360 }],
    total: 1360,
    history: [
      { month: "Sty", status: "paid", paidDate: "10.01", onTime: true },
      { month: "Lut", status: "paid", paidDate: "12.02", onTime: false },
      { month: "Mar", status: "paid", paidDate: "09.03", onTime: true },
      { month: "Kwi", status: "paid", paidDate: "10.04", onTime: true },
      { month: "Maj", status: "paid", paidDate: "08.05", onTime: true },
      { month: "Cze", status: "pending", paidDate: null, onTime: null },
    ], lateCount: 1, remindersOff: [] },
  { id: "P03", parent: "Ewa Zielińska", children: [
      { name: "Tomek Zieliński", fee: 1320 },
      { name: "Ola Zielińska", fee: 620 },
      { name: "Kasia Zielińska", fee: 780 },
    ], total: 2720,
    history: [
      { month: "Sty", status: "paid", paidDate: "09.01", onTime: true },
      { month: "Lut", status: "paid", paidDate: "10.02", onTime: true },
      { month: "Mar", status: "paid", paidDate: "15.03", onTime: false },
      { month: "Kwi", status: "paid", paidDate: "08.04", onTime: true },
      { month: "Maj", status: "paid", paidDate: "14.05", onTime: false },
      { month: "Cze", status: "paid", paidDate: "12.06", onTime: false },
    ], lateCount: 3, remindersOff: [] },
  { id: "P04", parent: "Joanna Wiśniewska", children: [
      { name: "Alicja Wiśniewska", fee: 1560 },
      { name: "Ola Wiśniewska", fee: 520 },
    ], total: 2080,
    history: [
      { month: "Sty", status: "paid", paidDate: "07.01", onTime: true },
      { month: "Lut", status: "paid", paidDate: "14.02", onTime: false },
      { month: "Mar", status: "paid", paidDate: "16.03", onTime: false },
      { month: "Kwi", status: "paid", paidDate: "09.04", onTime: true },
      { month: "Maj", status: "paid", paidDate: "08.05", onTime: true },
      { month: "Cze", status: "overdue", paidDate: null, onTime: null },
    ], lateCount: 2, remindersOff: [20, 30] },
  { id: "P05", parent: "Tomasz Lis", children: [{ name: "Michał Lis", fee: 680 }],
    total: 680,
    history: [
      { month: "Lut", status: "paid", paidDate: "08.02", onTime: true },
      { month: "Mar", status: "paid", paidDate: "10.03", onTime: true },
      { month: "Kwi", status: "paid", paidDate: "09.04", onTime: true },
      { month: "Maj", status: "paid", paidDate: "07.05", onTime: true },
      { month: "Cze", status: "pending", paidDate: null, onTime: null },
    ], lateCount: 0, remindersOff: [10, 20, 30] },
  { id: "P06", parent: "Robert Kowalczyk", children: [{ name: "Jan Kowalczyk", fee: 1080 }],
    total: 1080,
    history: [
      { month: "Sty", status: "paid", paidDate: "10.01", onTime: true },
      { month: "Lut", status: "paid", paidDate: "09.02", onTime: true },
      { month: "Mar", status: "paid", paidDate: "08.03", onTime: true },
      { month: "Kwi", status: "paid", paidDate: "10.04", onTime: true },
      { month: "Maj", status: "paid", paidDate: "09.05", onTime: true },
      { month: "Cze", status: "paid", paidDate: "07.06", onTime: true },
    ], lateCount: 0, remindersOff: [] },
];

const sidebarItems = [
  { icon: "\ud83d\udcca", label: "Dashboard" },
  { icon: "\ud83d\udcc5", label: "Harmonogram" },
  { icon: "\ud83d\udc68\u200d\ud83c\udfeb", label: "Korepetytorzy" },
  { icon: "\ud83c\udf93", label: "Uczniowie i grupy" },
  { icon: "\ud83d\udcb3", label: "Płatności", active: true },
  { icon: "⚙\ufe0f", label: "Ustawienia" },
];

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
      <div onClick={onToggle} style={{ padding: 10, borderTop: "1px solid " + T.cardBorder, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.textDim, fontSize: 12 }}>{collapsed ? "▶" : "◀"}</div>
    </div>
  );
}

function PaymentRow({ p, expanded, onToggle }) {
  const [hov, setHov] = useState(false);
  const lastH = p.history[p.history.length - 1];
  const currentStatus = lastH?.status || "paid";
  const sc = { paid: T.success, pending: T.tertiary, overdue: T.danger };
  const sl = { paid: "Opłacone", pending: "Oczekuje", overdue: "Zaległość" };

  return (
    <div style={{ background: hov && !expanded ? T.surfaceHover : T.surface, borderRadius: 14, border: "1px solid " + (currentStatus === "overdue" ? T.danger + "30" : T.cardBorder), overflow: "hidden", transition: "all 0.15s" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div onClick={onToggle} style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
        {/* Avatar */}
        <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: T.primary + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: T.primary }}>
          {p.parent.split(" ").map(w => w[0]).join("")}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{p.parent}</span>
            <span style={{ fontSize: 8, fontWeight: 700, color: sc[currentStatus], background: sc[currentStatus] + "15", padding: "2px 8px", borderRadius: 50 }}>{sl[currentStatus]}</span>
            {p.lateCount > 0 && <span style={{ fontSize: 8, fontWeight: 700, color: p.lateCount >= 3 ? T.danger : T.tertiary }}>{p.lateCount + ". opóźnienie"}</span>}
          </div>
          <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>
            {p.children.map(ch => ch.name).join(", ")}
          </div>
        </div>

        {/* Amount + history dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {p.history.map((h, i) => (
              <div key={i} title={h.month + ": " + (h.status === "paid" ? "opłacone" + (h.onTime ? "" : " (po terminie)") : h.status)} style={{
                width: 8, height: 8, borderRadius: 50,
                background: h.status === "paid" ? (h.onTime ? T.success : T.tertiary) : h.status === "pending" ? T.tertiary + "50" : T.danger,
                border: h.status !== "paid" ? "1px solid " + (h.status === "overdue" ? T.danger : T.tertiary) : "none",
              }} />
            ))}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: T.text, fontFamily: "Nunito, sans-serif" }}>{p.total.toLocaleString("pl-PL") + " zł"}</div>
            <div style={{ fontSize: 8, color: T.textDim }}>miesięcznie</div>
          </div>
        </div>
        <span style={{ fontSize: 11, color: T.textDim, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block", flexShrink: 0 }}>{"▼"}</span>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid " + T.cardBorder, padding: "14px 16px", animation: "fadeIn 0.15s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Left: dzieci + kwoty */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 8 }}>{"Składowe opłaty"}</div>
              {p.children.map((ch, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: T.bg, borderRadius: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{ch.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: T.tertiary }}>{ch.fee + " zł"}</span>
                </div>
              ))}
              {p.children.length > 1 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", marginTop: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: T.text }}>{"Łącznie"}</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: T.tertiary }}>{p.total.toLocaleString("pl-PL") + " zł"}</span>
                </div>
              )}
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 5 }}>
                {[
                  currentStatus === "pending" && { label: "Oznacz jako opłacone", color: T.success },
                  currentStatus === "overdue" && { label: "Oznacz jako opłacone", color: T.success },
                  (currentStatus === "pending" || currentStatus === "overdue") && { label: "Wyślij przypomnienie", color: T.tertiary },
                  { label: "Historia rozliczeń", color: T.primary },
                ].filter(Boolean).map((a, i) => (
                  <button key={i} style={{ width: "100%", padding: "7px", fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 7, border: "none", cursor: "pointer", background: a.color + "12", color: a.color, transition: "all 0.12s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = a.color; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = a.color + "12"; e.currentTarget.style.color = a.color; }}>
                    {a.label}
                  </button>
                ))}
              </div>

              {/* Przypomnienia automatyczne */}
              <div style={{ marginTop: 12, borderTop: "1px solid " + T.cardBorder, paddingTop: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: T.text, marginBottom: 6 }}>{"Przypomnienia automatyczne"}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[
                    { day: 10, label: "10. dnia (termin wpłaty)" },
                    { day: 20, label: "20. dnia (pierwsze przypomnienie)" },
                    { day: 30, label: "Ostatni dzień miesiąca" },
                  ].map((r, ri) => {
                    const isOff = (p.remindersOff || []).includes(r.day);
                    return (
                      <label key={ri} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "3px 0" }}>
                        <input type="checkbox" checked={!isOff} readOnly style={{ accentColor: T.primary }} />
                        <span style={{ fontSize: 10, color: isOff ? T.textDim : T.textMuted }}>{r.label}</span>
                        {isOff && <span style={{ fontSize: 8, color: T.danger, fontWeight: 700 }}>{"wyłączone"}</span>}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: historia */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 8 }}>{"Historia wpłat 2026"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {p.history.map((h, i) => {
                  const hc = h.status === "paid" ? (h.onTime ? T.success : T.tertiary) : h.status === "pending" ? T.tertiary : T.danger;
                  const hl = h.status === "paid" ? (h.onTime ? "W terminie" : "Po terminie") : h.status === "pending" ? "Oczekuje" : "Zaległość";
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", background: T.bg, borderRadius: 6, borderLeft: "3px solid " + hc }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.text, width: 32 }}>{h.month}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: hc }}>{hl}</span>
                      <div style={{ flex: 1 }} />
                      {h.paidDate && <span style={{ fontSize: 9, color: T.textDim }}>{h.paidDate}</span>}
                      <span style={{ fontSize: 10, fontWeight: 800, color: T.textMuted }}>{p.total.toLocaleString("pl-PL") + " zł"}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: T.bg, borderRadius: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: T.textDim }}>{"Wpłacone łącznie"}</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: T.success }}>{(p.history.filter(h => h.status === "paid").length * p.total).toLocaleString("pl-PL") + " zł"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPayments() {
  const [collapsed, setCollapsed] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const totalExpected = payments.reduce((s, p) => s + p.total, 0);
  const paidThisMonth = payments.filter(p => p.history[p.history.length - 1]?.status === "paid");
  const pendingThisMonth = payments.filter(p => p.history[p.history.length - 1]?.status === "pending");
  const overdueThisMonth = payments.filter(p => p.history[p.history.length - 1]?.status === "overdue");
  const collectedThisMonth = paidThisMonth.reduce((s, p) => s + p.total, 0);
  const pendingAmount = pendingThisMonth.reduce((s, p) => s + p.total, 0);
  const overdueAmount = overdueThisMonth.reduce((s, p) => s + p.total, 0);
  const collPct = totalExpected > 0 ? Math.round((collectedThisMonth / totalExpected) * 100) : 0;

  const filtered = payments.filter(p => {
    const ms = p.parent.toLowerCase().includes(search.toLowerCase()) || p.children.some(ch => ch.name.toLowerCase().includes(search.toLowerCase()));
    const lastStatus = p.history[p.history.length - 1]?.status;
    const mf = filter === "all" || lastStatus === filter || (filter === "late" && p.lateCount > 0);
    return ms && mf;
  });

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, fontFamily: "Nunito, sans-serif", color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.cardBorder}; border-radius: 50px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: 48, background: T.bgAlt, borderBottom: "1px solid " + T.cardBorder, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: T.text, fontFamily: "Nunito, sans-serif" }}>{"Płatności"}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", cursor: "pointer" }}><span style={{ fontSize: 15 }}>{"\ud83d\udd14"}</span><span style={{ position: "absolute", top: -3, right: -5, fontSize: 7, fontWeight: 800, color: "#fff", background: T.danger, borderRadius: 50, width: 13, height: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>7</span></div>
            <div style={{ width: 26, height: 26, borderRadius: 50, background: T.tertiary + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: T.tertiary, cursor: "pointer" }}>AD</div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
          {/* Month selector + summary */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ cursor: "pointer", color: T.textDim, fontSize: 14 }}>{"←"}</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: T.text }}>Czerwiec 2026</span>
            <span style={{ cursor: "pointer", color: T.textDim, fontSize: 14 }}>{"→"}</span>
            <span style={{ fontSize: 10, color: T.textDim, marginLeft: 4 }}>{"Termin wpłat: do 10. dnia miesiąca"}
            <span style={{ fontSize: 9, color: T.danger + "90", marginLeft: 8 }}>{"Po 10. oczekujące → zaległość automatycznie"}</span></span>
          </div>

          {/* Summary cards */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, background: T.surface, borderRadius: 12, padding: "14px 18px", border: "1px solid " + T.cardBorder }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: T.textDim, fontWeight: 600 }}>Zebrane</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: collPct >= 90 ? T.success : collPct >= 60 ? T.tertiary : T.secondary }}>{collPct + "%"}</span>
              </div>
              <div style={{ height: 8, borderRadius: 50, background: T.primary + "15", overflow: "hidden", marginBottom: 6 }}>
                <div style={{ width: collPct + "%", height: "100%", borderRadius: 50, background: "linear-gradient(90deg, " + T.primary + ", " + T.success + ")", transition: "width 0.5s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                <span style={{ fontWeight: 800, color: T.success }}>{collectedThisMonth.toLocaleString("pl-PL") + " zł"}</span>
                <span style={{ color: T.textDim }}>{"z " + totalExpected.toLocaleString("pl-PL") + " zł"}</span>
              </div>
            </div>
            {[
              { label: "Oczekujące", value: pendingAmount, count: pendingThisMonth.length, color: T.tertiary },
              { label: "Zaległe", value: overdueAmount, count: overdueThisMonth.length, color: T.danger },
              { label: "Opóźnieni (ogółem)", value: payments.filter(p => p.lateCount > 0).length + " rodziców", count: null, color: T.secondary, isText: true },
            ].map((s, i) => (
              <div key={i} style={{ background: T.surface, borderRadius: 12, padding: "14px 18px", border: "1px solid " + T.cardBorder, minWidth: 140 }}>
                <div style={{ fontSize: 10, color: T.textDim, marginBottom: 4, fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color, fontFamily: "Nunito, sans-serif" }}>
                  {s.isText ? s.value : s.value.toLocaleString("pl-PL") + " zł"}
                </div>
                {s.count !== null && <div style={{ fontSize: 9, color: T.textDim }}>{s.count + " rodziców"}</div>}
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={"Szukaj rodzica lub ucznia..."}
              style={{ fontSize: 11, fontFamily: "Nunito, sans-serif", padding: "6px 12px", borderRadius: 8, border: "1px solid " + T.cardBorder, background: T.surface, color: T.text, outline: "none", width: 240 }} />
            <div style={{ display: "flex", background: T.surface, borderRadius: 8, padding: 2, gap: 2 }}>
              {[["all","Wszyscy"],["paid","Opłacone"],["pending","Oczekujące"],["overdue","Zaległe"],["late","Spóźnieni"]].map(([k, lb]) => {
                const colors = { all: T.primary, paid: T.success, pending: T.tertiary, overdue: T.danger, late: T.secondary };
                return (
                  <button key={k} onClick={() => setFilter(k)} style={{ fontSize: 10, fontWeight: filter === k ? 800 : 500, fontFamily: "Nunito, sans-serif", padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: filter === k ? (colors[k] || T.primary) : "transparent", color: filter === k ? "#fff" : T.textMuted, transition: "all 0.12s" }}>{lb}</button>
                );
              })}
            </div>
            <div style={{ flex: 1 }} />
            <button style={{ fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: T.tertiary, color: T.bg }}>{"Wyślij przypomnienia"}</button>
            <button style={{ fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "6px 14px", borderRadius: 8, border: "1px solid " + T.cardBorder, cursor: "pointer", background: "transparent", color: T.textMuted }}>{"⚙ Ustawienia przypomnień"}</button>
          </div>

          {/* Payment legend */}
          <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 9, color: T.textDim }}>
            <span>{"Historia wpłat:"}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 8, height: 8, borderRadius: 50, background: T.success }} /><span>w terminie</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 8, height: 8, borderRadius: 50, background: T.tertiary }} /><span>po terminie</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 8, height: 8, borderRadius: 50, background: T.tertiary + "50", border: "1px solid " + T.tertiary }} /><span>oczekuje</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 8, height: 8, borderRadius: 50, background: T.danger }} /><span>{"zaległość"}</span></div>
          </div>

          {/* Payment list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(p => (
              <PaymentRow key={p.id} p={p} expanded={expandedId === p.id} onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)} />
            ))}
            {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.textDim }}>{"Brak wyników"}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
