import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4",
  danger: "#EF4444", pink: "#E84393", orange: "#F59E0B", tertiary: "#FFCA28",
  cardBorder: "rgba(59,143,240,0.10)",
};

const subjectColors = { Matematyka: "#3B8FF0", Angielski: "#06B6D4" };
const levelColors = { SP: "#06B6D4", "ŚR★": "#7C5CFC" };

const LevelBadge = ({ level }) => {
  const c = levelColors[level] || T.textDim;
  return <span style={{ fontSize: 10, fontWeight: 800, color: c, background: c + "18", padding: "2px 7px", borderRadius: 5 }}>{level}</span>;
};

const SubjectDot = ({ subject }) => (
  <span style={{ width: 8, height: 8, borderRadius: "50%", background: subjectColors[subject] || T.textDim, display: "inline-block", flexShrink: 0 }} />
);

const Card = ({ children, style, className }) => (
  <div className={className || "card-hover"} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.cardBorder}`, padding: 16, ...style }}>{children}</div>
);

const FormField = ({ label, children, required }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 5 }}>
      {label}{required && <span style={{ color: T.danger, marginLeft: 3 }}>*</span>}
    </div>
    {children}
  </div>
);

const Input = ({ placeholder, value, type = "text", style: s }) => (
  <input defaultValue={value} placeholder={placeholder} type={type} style={{
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: `1px solid ${T.cardBorder}`, background: T.bgAlt,
    color: T.text, fontSize: 13, fontWeight: 600, fontFamily: "inherit", outline: "none", ...s,
  }} />
);

const Select = ({ options, value, placeholder }) => (
  <select defaultValue={value || ""} style={{
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: `1px solid ${T.cardBorder}`, background: T.bgAlt,
    color: value ? T.text : T.textDim, fontSize: 13, fontWeight: 600,
    fontFamily: "inherit", outline: "none", appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236B6780' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
  }}>
    {placeholder && <option value="" disabled>{placeholder}</option>}
    {options.map((o, i) => <option key={i} value={o.value || o}>{o.label || o}</option>)}
  </select>
);

const BtnPrimary = ({ children, onClick, color }) => (
  <button onClick={onClick} className="btn-primary" style={{
    padding: "8px 20px", borderRadius: 8, border: "none",
    background: color || T.primary, color: "#fff",
    fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
  }}>{children}</button>
);

const BtnGhost = ({ children, onClick }) => (
  <button onClick={onClick} className="btn-ghost" style={{
    padding: "8px 20px", borderRadius: 8, border: `1px solid ${T.cardBorder}`,
    background: "transparent", color: T.textMuted,
    fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
  }}>{children}</button>
);

/* ═══════════════ GROUP CARD ═══════════════ */

function GroupCard() {
  const [expanded, setExpanded] = useState(null);
  const [members, setMembers] = useState([
    { id: 1, name: "Ola Nowak", info: "kl. 7, SP", parent: "Monika Nowak", rate: "180 zł/msc" },
    { id: 2, name: "Zuzia Kowalczyk", info: "kl. 7, SP", parent: "Katarzyna Kowalczyk", rate: "180 zł/msc" },
    { id: 3, name: "Maja Wiśniewska", info: "kl. 8, E8", parent: "Anna Wiśniewska", rate: "180 zł/msc" },
  ]);
  const [searchVal, setSearchVal] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(null);

  const allStudents = [
    { id: 4, name: "Bartek Wójcik", info: "kl. 6, SP", parent: "Piotr Wójcik" },
    { id: 5, name: "Hania Lewandowska", info: "kl. 7, SP", parent: "Ewa Lewandowska" },
    { id: 6, name: "Kuba Jankowski", info: "kl. 8, E8", parent: "Marek Jankowski" },
    { id: 7, name: "Lena Szymańska", info: "kl. 7, SP", parent: "Dorota Szymańska" },
  ];

  const searchResults = searchVal.length >= 2
    ? allStudents.filter(s => s.name.toLowerCase().includes(searchVal.toLowerCase()))
    : [];

  const addMember = (s) => {
    setMembers(prev => [...prev, { ...s, rate: "180 zł/msc" }]);
    setSearchVal("");
  };

  const removeMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setConfirmRemove(null);
  };

  return (
    <Card style={{ padding: 0 }}>
      {/* ── GROUP HEADER (collapsed view) ── */}
      <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 11, background: T.accent + "22", color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800 }}>A</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Grupa A — Angielski SP</span>
            <LevelBadge level="SP" />
            <span style={{ fontSize: 9, fontWeight: 700, color: T.accent, background: T.accent + "18", padding: "1px 6px", borderRadius: 4 }}>GRUPA</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: T.textDim, fontWeight: 600 }}>
            <span>👤 Maria Zielińska</span>
            <span>📅 Śr 16:30–17:30</span>
            <span>📍 Sala 3</span>
            <span>👥 {members.length}/6 os.</span>
            <span>💰 180 zł/os./msc</span>
          </div>
        </div>
      </div>

      {/* ── MEMBERS LIST (always visible when expanded) ── */}
      <div style={{ padding: "0 18px", borderTop: `1px solid ${T.cardBorder}` }}>
        <div style={{ padding: "12px 0 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5 }}>
            Członkowie ({members.length})
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
          {members.map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: T.bgAlt, borderRadius: 8, position: "relative" }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: T.cyan + "18", color: T.cyan, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>{m.name.split(" ").map(w => w[0]).join("")}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{m.name}</div>
                <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>{m.info} • Rodzic: {m.parent}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted }}>{m.rate}</span>

              {confirmRemove === m.id ? (
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => removeMember(m.id)} className="btn-primary" style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: T.danger, color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Usuń</button>
                  <button onClick={() => setConfirmRemove(null)} className="btn-ghost" style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.textDim, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Nie</button>
                </div>
              ) : (
                <div onClick={() => setConfirmRemove(m.id)} className="icon-btn" style={{ width: 22, height: 22, borderRadius: 6, background: T.danger + "10", color: T.danger, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>✕</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div style={{ padding: "8px 18px 12px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[
          { id: "edit", label: "Edytuj grupę", icon: "✏️", color: T.primary },
          { id: "add_member", label: "Dodaj członka", icon: "➕", color: T.success },
          { id: "dissolve", label: "Rozwiąż grupę", icon: "🗑", color: T.danger },
        ].map(action => (
          <button key={action.id} onClick={() => setExpanded(expanded === action.id ? null : action.id)} className="btn-ghost" style={{
            padding: "6px 14px", borderRadius: 8,
            border: `1px solid ${expanded === action.id ? action.color + "40" : T.cardBorder}`,
            background: expanded === action.id ? action.color + "10" : "transparent",
            color: expanded === action.id ? action.color : T.textMuted,
            fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span>{action.icon}</span> {action.label}
          </button>
        ))}
      </div>

      {/* ── EXPANSION: Edytuj grupę ── */}
      {expanded === "edit" && (
        <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${T.cardBorder}` }}>
          <div style={{ paddingTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.primary, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>✏️ Edytuj grupę — Grupa A</div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <FormField label="Nazwa grupy" required><Input value="Grupa A — Angielski SP" /></FormField>
              <FormField label="Max. osób"><Input value="6" type="number" /></FormField>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="Przedmiot" required>
                <Select value="Angielski" options={["Matematyka", "Angielski", "Fizyka", "Chemia", "Polski"]} />
              </FormField>
              <FormField label="Poziom" required>
                <Select value="SP" options={["SP", "E8", "ŚR", "ŚR★", "EM", "EM★"]} />
              </FormField>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="Korepetytor" required>
                <Select value="Maria Zielińska" options={["Tomasz Kowalski", "Maria Zielińska", "Jan Wiśniewski"]} />
              </FormField>
              <FormField label="Opłata/os./msc" required><Input value="180" type="number" /></FormField>
            </div>

            <FormField label="Harmonogram" required>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Select value="Śr" options={["Pon", "Wt", "Śr", "Czw", "Pt", "Sob"]} />
                <Input value="16:30" style={{ width: 80 }} />
                <span style={{ color: T.textDim }}>–</span>
                <Input value="17:30" style={{ width: 80 }} />
                <Select value="Sala 3" options={["Sala 1", "Sala 2", "Sala 3", "Sala 4"]} />
              </div>
            </FormField>

            <div style={{ background: T.orange + "08", borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 11, color: T.orange, fontWeight: 600, border: `1px solid ${T.orange}15` }}>
              ⚠ Zmiana harmonogramu lub korepetytora wpłynie na plan zajęć wszystkich {members.length} członków grupy.
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <BtnPrimary>Zapisz zmiany</BtnPrimary>
              <BtnGhost onClick={() => setExpanded(null)}>Anuluj</BtnGhost>
            </div>
          </div>
        </div>
      )}

      {/* ── EXPANSION: Dodaj członka ── */}
      {expanded === "add_member" && (
        <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${T.cardBorder}` }}>
          <div style={{ paddingTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.success, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>➕ Dodaj członka do Grupy A</div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="🔍 Wyszukaj ucznia po imieniu lub nazwisku..."
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10,
                  border: `1px solid ${searchVal ? T.success + "50" : T.cardBorder}`, background: T.bgAlt,
                  color: T.text, fontSize: 13, fontWeight: 600, fontFamily: "inherit", outline: "none",
                }}
              />

              {searchResults.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10, background: T.surface, border: `1px solid ${T.success}30`, borderRadius: 10, marginTop: 4, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
                  {searchResults.map(s => (
                    <div key={s.id} onClick={() => addMember(s)} className="tab-hover" style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>{s.info} • Rodzic: {s.parent}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.success }}>+ Dodaj</span>
                    </div>
                  ))}
                </div>
              )}

              {searchVal.length >= 2 && searchResults.length === 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10, background: T.surface, border: `1px solid ${T.cardBorder}`, borderRadius: 10, marginTop: 4, padding: "12px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
                  <span style={{ fontSize: 12, color: T.textDim }}>Brak wyników dla „{searchVal}"</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ background: T.success + "08", borderRadius: 8, padding: "10px 12px", marginBottom: 12, border: `1px solid ${T.success}15` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.success, marginBottom: 3 }}>ℹ Automatyczne przypisanie</div>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 500, lineHeight: 1.5 }}>Dodanie ucznia automatycznie doda mu zajęcia grupowe (Śr 16:30–17:30) oraz opłatę 180 zł/msc do miesięcznego rachunku rodzica.</div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <BtnGhost onClick={() => setExpanded(null)}>Zamknij</BtnGhost>
            </div>
          </div>
        </div>
      )}

      {/* ── EXPANSION: Rozwiąż grupę ── */}
      {expanded === "dissolve" && (
        <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${T.cardBorder}` }}>
          <div style={{ paddingTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.danger, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>🗑 Rozwiąż grupę — Grupa A</div>

            <div style={{ background: T.danger + "08", borderRadius: 10, padding: "14px 16px", marginBottom: 14, border: `1px solid ${T.danger}15` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.danger, marginBottom: 8 }}>⚠ Ta operacja jest nieodwracalna</div>
              <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, lineHeight: 1.6 }}>
                Rozwiązanie grupy spowoduje:
              </div>
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  "Usunięcie zajęć grupowych z harmonogramu wszystkich " + members.length + " członków",
                  "Usunięcie opłaty za grupę (180 zł/msc/os.) z rachunków rodziców",
                  "Odwołanie wszystkich zaplanowanych lekcji grupowych",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11, color: T.textMuted, fontWeight: 500 }}>
                    <span style={{ color: T.danger, flexShrink: 0 }}>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, marginBottom: 6 }}>Dotknięci uczniowie:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {members.map(m => (
                  <span key={m.id} style={{ fontSize: 11, fontWeight: 600, color: T.text, background: T.bgAlt, padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.cardBorder}` }}>{m.name}</span>
                ))}
              </div>
            </div>

            <FormField label="Powód rozwiązania">
              <textarea placeholder="Opcjonalny powód..." rows={2} style={{
                width: "100%", padding: "8px 12px", borderRadius: 8,
                border: `1px solid ${T.cardBorder}`, background: T.bgAlt,
                color: T.text, fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                outline: "none", resize: "vertical", lineHeight: 1.5,
              }} />
            </FormField>

            <div style={{ display: "flex", gap: 8 }}>
              <BtnPrimary color={T.danger}>🗑 Rozwiąż grupę</BtnPrimary>
              <BtnGhost onClick={() => setExpanded(null)}>Anuluj</BtnGhost>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ═══════════════ MAIN ═══════════════ */

export default function AdminGroupInteractions() {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito', sans-serif", color: T.text, padding: "24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.cardBorder}; border-radius: 50px; }
        .card-hover { transition: all .18s ease !important; }
        .card-hover:hover { transform: translateY(-2px); border-color: rgba(59,143,240,0.22) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.18); }
        .btn-primary { transition: all .15s ease !important; }
        .btn-primary:hover { filter: brightness(1.15); transform: scale(1.02); }
        .btn-primary:active { transform: scale(0.98); }
        .btn-ghost { transition: all .15s ease !important; }
        .btn-ghost:hover { background: ${T.surfaceHover} !important; }
        .btn-ghost:active { transform: scale(0.98); }
        .tab-hover { transition: all .15s ease !important; }
        .tab-hover:hover { background: rgba(59,143,240,0.10) !important; }
        .icon-btn { transition: all .15s ease !important; }
        .icon-btn:hover { background: ${T.bgAlt} !important; transform: scale(1.08); }
      `}</style>

      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: T.text, marginBottom: 4 }}>Panel admina — Grupy — Rozwinięcia</div>
          <div style={{ fontSize: 13, color: T.textDim, fontWeight: 600 }}>Karta grupy z listą członków + 3 akcje inline: edytuj grupę, dodaj członka, rozwiąż grupę</div>
        </div>

        <GroupCard />
      </div>
    </div>
  );
}
