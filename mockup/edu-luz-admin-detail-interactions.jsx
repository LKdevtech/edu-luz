import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4",
  danger: "#EF4444", pink: "#E84393", orange: "#F59E0B", tertiary: "#FFCA28",
  cardBorder: "rgba(59,143,240,0.10)",
};

const subjectColors = { Matematyka: "#3B8FF0", Angielski: "#06B6D4", Fizyka: "#F59E0B", Chemia: "#22C55E", Polski: "#E84393" };
const levelColors = { SP: "#06B6D4", E8: "#FFCA28", "ŚR": "#3B8FF0", "ŚR★": "#7C5CFC", EM: "#EF4444", "EM★": "#E84393" };

/* ═══════════════ SHARED ═══════════════ */

const Card = ({ children, style, className }) => (
  <div className={className || "card-hover"} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.cardBorder}`, padding: 16, ...style }}>{children}</div>
);

const FormField = ({ label, children, required }) => (
  <div style={{ marginBottom: 14 }}>
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

const Textarea = ({ placeholder, rows = 3 }) => (
  <textarea placeholder={placeholder} rows={rows} style={{
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: `1px solid ${T.cardBorder}`, background: T.bgAlt,
    color: T.text, fontSize: 13, fontWeight: 500, fontFamily: "inherit",
    outline: "none", resize: "vertical", lineHeight: 1.5,
  }} />
);

const BtnPrimary = ({ children, onClick, disabled, color }) => (
  <button onClick={onClick} disabled={disabled} className="btn-primary" style={{
    padding: "8px 20px", borderRadius: 8, border: "none",
    background: color || T.primary, color: "#fff",
    fontSize: 13, fontWeight: 700, cursor: disabled ? "default" : "pointer",
    fontFamily: "inherit", opacity: disabled ? 0.5 : 1,
  }}>{children}</button>
);

const BtnGhost = ({ children, onClick }) => (
  <button onClick={onClick} className="btn-ghost" style={{
    padding: "8px 20px", borderRadius: 8, border: `1px solid ${T.cardBorder}`,
    background: "transparent", color: T.textMuted,
    fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
  }}>{children}</button>
);

const CheckboxRow = ({ label, checked, sub }) => {
  const [on, setOn] = useState(checked || false);
  return (
    <div onClick={() => setOn(!on)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", cursor: "pointer" }}>
      <div style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
        border: `2px solid ${on ? T.primary : T.cardBorder}`,
        background: on ? T.primary + "22" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: T.primary, fontSize: 11, fontWeight: 800,
      }}>{on ? "✓" : ""}</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>{sub}</div>}
      </div>
    </div>
  );
};

/* ═══════════════ MODAL WRAPPER ═══════════════ */

function Modal({ title, icon, onClose, children, width }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,12,20,.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{
        background: T.surface, borderRadius: 18, border: `1px solid ${T.cardBorder}`,
        width: width || 520, maxHeight: "85vh", overflow: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{title}</span>
          </div>
          <div onClick={onClose} className="icon-btn" style={{ width: 28, height: 28, borderRadius: 7, background: T.bgAlt, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: T.textDim }}>✕</div>
        </div>
        {/* Content */}
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════ 1. DODAJ UCZNIA ═══════════════ */

function DodajUcznia({ onClose }) {
  const [step, setStep] = useState(1);
  return (
    <Modal title="Dodaj ucznia" icon="🎓" onClose={onClose} width={560}>
      {/* Step indicator */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {["Dane ucznia", "Rodzic", "Zajęcia"].map((s, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: "100%", height: 3, borderRadius: 2, background: i + 1 <= step ? T.primary : T.cardBorder }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: i + 1 <= step ? T.primary : T.textDim }}>{i + 1}. {s}</span>
          </div>
        ))}
      </div>

      {step === 1 && <>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Imię" required><Input placeholder="np. Kacper" /></FormField>
          <FormField label="Nazwisko" required><Input placeholder="np. Nowak" /></FormField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Klasa / rocznik"><Input placeholder="np. 2 LO" /></FormField>
          <FormField label="Poziom" required>
            <Select placeholder="Wybierz poziom" options={["SP", "E8", "ŚR", "ŚR★", "EM", "EM★"]} />
          </FormField>
        </div>
        <FormField label="Data urodzenia"><Input placeholder="DD.MM.RRRR" /></FormField>
      </>}

      {step === 2 && <>
        <div style={{ background: T.bgAlt, borderRadius: 10, padding: "12px 14px", marginBottom: 16, border: `1px dashed ${T.cardBorder}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, marginBottom: 8 }}>Istniejący rodzic?</div>
          <Select placeholder="Wyszukaj rodzica..." options={["Monika Nowak (+48 602 345 678)", "Anna Kowalska (+48 501 234 567)", "— Nowy rodzic —"]} />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>Lub dodaj nowego</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Imię i nazwisko rodzica" required><Input placeholder="np. Monika Nowak" /></FormField>
          <FormField label="Telefon" required><Input placeholder="+48 ..." /></FormField>
        </div>
        <FormField label="Email"><Input placeholder="email@example.com" type="email" /></FormField>
        <FormField label="Adres"><Input placeholder="ul. Kwiatowa 15/3, Warszawa" /></FormField>
      </>}

      {step === 3 && <>
        <div style={{ background: T.bgAlt, borderRadius: 10, padding: "12px 14px", marginBottom: 14, border: `1px solid ${T.cardBorder}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.textMuted }}>Ten krok jest <span style={{ color: T.primary, fontWeight: 800 }}>opcjonalny</span>. Jeśli uczeń dołącza tylko do grupy — pomiń i dodaj go do grupy później z ekranu „Nowa grupa".</div>
        </div>

        <Card style={{ padding: "14px", border: `1px dashed ${T.primary}30`, background: T.primary + "05" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>Zajęcia indywidualne #1</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FormField label="Przedmiot" required>
              <Select placeholder="Wybierz" options={["Matematyka", "Angielski", "Fizyka", "Chemia", "Polski"]} />
            </FormField>
            <FormField label="Korepetytor" required>
              <Select placeholder="Wybierz" options={["Tomasz Kowalski", "Maria Zielińska", "Jan Wiśniewski"]} />
            </FormField>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <FormField label="Typ">
              <Select options={["Indywidualne", "Grupowe"]} value="Indywidualne" />
            </FormField>
            <FormField label="Opłata/msc" required><Input placeholder="np. 360" type="number" /></FormField>
            <FormField label="Lekcji/tydz"><Input placeholder="np. 3" type="number" /></FormField>
          </div>
          <FormField label="Harmonogram">
            <Textarea placeholder="np. Pon 14:00, Śr 14:00, Sob 9:00 — Sala 1" rows={2} />
          </FormField>
        </Card>
        <button className="btn-ghost" style={{ marginTop: 10, width: "100%", padding: "8px", borderRadius: 8, border: `1px dashed ${T.primary}30`, background: "transparent", color: T.primary, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Dodaj kolejne zajęcia</button>
      </>}

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.cardBorder}` }}>
        <div>{step > 1 && <BtnGhost onClick={() => setStep(step - 1)}>← Wstecz</BtnGhost>}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <BtnGhost onClick={onClose}>Anuluj</BtnGhost>
          {step < 3
            ? <BtnPrimary onClick={() => setStep(step + 1)}>Dalej →</BtnPrimary>
            : <>
                <BtnGhost onClick={onClose}>Pomiń — dodaj bez zajęć</BtnGhost>
                <BtnPrimary color={T.success}>✓ Dodaj ucznia z zajęciami</BtnPrimary>
              </>
          }
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════ 2. DODAJ ZAJĘCIA ═══════════════ */

function DodajZajecia({ onClose }) {
  return (
    <Modal title="Dodaj zajęcia" icon="📚" onClose={onClose}>
      <FormField label="Uczeń" required>
        <Select placeholder="Wyszukaj ucznia..." options={["Kacper Nowak (2 LO, ŚR★)", "Ola Nowak (kl. 7, SP)", "Piotr Zieliński (3 LO, EM)", "Maja Wiśniewska (kl. 8, E8)"]} />
      </FormField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Przedmiot" required>
          <Select placeholder="Wybierz" options={["Matematyka", "Angielski", "Fizyka", "Chemia", "Polski"]} />
        </FormField>
        <FormField label="Korepetytor" required>
          <Select placeholder="Wybierz" options={["Tomasz Kowalski", "Maria Zielińska", "Jan Wiśniewski"]} />
        </FormField>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <FormField label="Typ">
          <Select options={["Indywidualne", "Grupowe"]} value="Indywidualne" />
        </FormField>
        <FormField label="Sala">
          <Select placeholder="Wybierz" options={["Sala 1", "Sala 2", "Sala 3", "Sala 4"]} />
        </FormField>
        <FormField label="Opłata/msc" required><Input placeholder="360" type="number" /></FormField>
      </div>

      <FormField label="Harmonogram tygodniowy" required>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {["Pon", "Wt", "Śr", "Czw", "Pt", "Sob"].map(day => (
            <div key={day} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckboxRow label={day} />
              <Input placeholder="14:00" style={{ width: 80 }} />
              <span style={{ color: T.textDim, fontSize: 12 }}>–</span>
              <Input placeholder="15:00" style={{ width: 80 }} />
            </div>
          ))}
        </div>
      </FormField>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.cardBorder}` }}>
        <BtnGhost onClick={onClose}>Anuluj</BtnGhost>
        <BtnPrimary color={T.success}>✓ Dodaj zajęcia</BtnPrimary>
      </div>
    </Modal>
  );
}

/* ═══════════════ 3. NOWA GRUPA ═══════════════ */

function NowaGrupa({ onClose }) {
  const [members, setMembers] = useState([
    { name: "Ola Nowak", info: "kl. 7, SP", id: 1 },
    { name: "Zuzia Kowalczyk", info: "kl. 7, SP", id: 2 },
  ]);
  const [searchVal, setSearchVal] = useState("");

  const allStudents = [
    { name: "Ola Nowak", info: "kl. 7, SP — Angielski", id: 1 },
    { name: "Zuzia Kowalczyk", info: "kl. 7, SP — Angielski", id: 2 },
    { name: "Maja Wiśniewska", info: "kl. 8, E8 — Angielski", id: 3 },
    { name: "Bartek Wójcik", info: "kl. 6, SP — Angielski", id: 4 },
    { name: "Kacper Nowak", info: "2 LO, ŚR★ — Matematyka", id: 5 },
    { name: "Piotr Zieliński", info: "3 LO, EM — Matematyka", id: 6 },
  ];

  const searchResults = searchVal.length >= 2
    ? allStudents.filter(s => s.name.toLowerCase().includes(searchVal.toLowerCase()) && !members.find(m => m.id === s.id))
    : [];

  const addMember = (s) => { setMembers(prev => [...prev, s]); setSearchVal(""); };
  const removeMember = (id) => setMembers(prev => prev.filter(m => m.id !== id));

  return (
    <Modal title="Nowa grupa" icon="👥" onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <FormField label="Nazwa grupy" required><Input placeholder="np. Grupa A — Angielski SP" /></FormField>
        <FormField label="Max. osób"><Input placeholder="6" type="number" /></FormField>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Przedmiot" required>
          <Select placeholder="Wybierz" options={["Matematyka", "Angielski", "Fizyka", "Chemia", "Polski"]} />
        </FormField>
        <FormField label="Poziom" required>
          <Select placeholder="Wybierz" options={["SP", "E8", "ŚR", "ŚR★", "EM", "EM★"]} />
        </FormField>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Korepetytor" required>
          <Select placeholder="Wybierz" options={["Tomasz Kowalski", "Maria Zielińska", "Jan Wiśniewski"]} />
        </FormField>
        <FormField label="Opłata/os./msc" required><Input placeholder="180" type="number" /></FormField>
      </div>

      <FormField label="Harmonogram" required>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Select placeholder="Dzień" options={["Pon", "Wt", "Śr", "Czw", "Pt", "Sob"]} />
          <Input placeholder="16:30" style={{ width: 80 }} />
          <span style={{ color: T.textDim }}>–</span>
          <Input placeholder="17:30" style={{ width: 80 }} />
          <Select placeholder="Sala" options={["Sala 1", "Sala 2", "Sala 3", "Sala 4"]} />
        </div>
      </FormField>

      {/* Members with search */}
      <FormField label="Członkowie grupy">
        {/* Search input */}
        <div style={{ position: "relative", marginBottom: 8 }}>
          <input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="🔍 Wyszukaj ucznia po imieniu lub nazwisku..."
            style={{
              width: "100%", padding: "8px 12px", borderRadius: 8,
              border: `1px solid ${searchVal ? T.primary + "50" : T.cardBorder}`, background: T.bgAlt,
              color: T.text, fontSize: 13, fontWeight: 600, fontFamily: "inherit", outline: "none",
            }}
          />
          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10, background: T.surface, border: `1px solid ${T.primary}30`, borderRadius: 10, marginTop: 4, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
              {searchResults.map(s => (
                <div key={s.id} onClick={() => addMember(s)} className="tab-hover" style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>{s.info}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.primary }}>+ Dodaj</span>
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

        {/* Selected members */}
        {members.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {members.map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: T.bgAlt, borderRadius: 8, border: `1px solid ${T.cardBorder}` }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{m.name}</span>
                  <span style={{ fontSize: 11, color: T.textDim, marginLeft: 8 }}>{m.info}</span>
                </div>
                <div onClick={() => removeMember(m.id)} className="icon-btn" style={{ width: 22, height: 22, borderRadius: 6, background: T.danger + "15", color: T.danger, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>✕</div>
              </div>
            ))}
          </div>
        )}

        {members.length === 0 && (
          <div style={{ padding: "12px", textAlign: "center", background: T.bgAlt, borderRadius: 8, border: `1px dashed ${T.cardBorder}` }}>
            <span style={{ fontSize: 12, color: T.textDim }}>Wyszukaj i dodaj uczniów do grupy</span>
          </div>
        )}
      </FormField>

      {/* Auto-create note */}
      <div style={{ background: T.primary + "08", borderRadius: 10, padding: "10px 14px", marginTop: 4, border: `1px solid ${T.primary}15` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.primary, marginBottom: 3 }}>ℹ Automatyczne przypisanie</div>
        <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 500, lineHeight: 1.5 }}>Utworzenie grupy automatycznie doda zajęcia grupowe w harmonogramie każdego wpisanego ucznia. Opłata za grupę ({members.length > 0 ? "180 zł/os./msc" : "—"}) zostanie doliczona do ich miesięcznego rachunku.</div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.cardBorder}` }}>
        <BtnGhost onClick={onClose}>Anuluj</BtnGhost>
        <BtnPrimary color={T.success}>✓ Utwórz grupę ({members.length} os.)</BtnPrimary>
      </div>
    </Modal>
  );
}

/* ═══════════════ 4. WYŚLIJ KOMUNIKAT ═══════════════ */

function WyslijKomunikat({ onClose }) {
  return (
    <Modal title="Wyślij komunikat" icon="📢" onClose={onClose} width={560}>
      <FormField label="Odbiorcy" required>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 6 }}>
          <CheckboxRow label="Wszyscy rodzice" sub="12 odbiorców" />
          <CheckboxRow label="Rodzice z zaległościami" sub="2 odbiorców" />
          <CheckboxRow label="Wszyscy korepetytorzy" sub="4 odbiorców" />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, marginTop: 8, marginBottom: 6 }}>Lub wybierz indywidualnie:</div>
        <Select placeholder="Wyszukaj rodzica / korepetytora..." options={["Monika Nowak (rodzic)", "Anna Kowalska (rodzic)", "Tomasz Kowalski (korepetytor)", "Maria Zielińska (korepetytor)"]} />
      </FormField>

      <FormField label="Kanał">
        <div style={{ display: "flex", gap: 8 }}>
          {["Email", "Push", "Email + Push"].map(ch => (
            <div key={ch} className="tab-hover" style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
              background: ch === "Email + Push" ? T.primary + "18" : T.surface,
              color: ch === "Email + Push" ? T.primary : T.textMuted,
              border: `1px solid ${ch === "Email + Push" ? T.primary + "30" : T.cardBorder}`,
            }}>{ch}</div>
          ))}
        </div>
      </FormField>

      <FormField label="Temat" required><Input placeholder="np. Zmiana godzin pracy w święta" /></FormField>
      <FormField label="Treść" required><Textarea placeholder="Treść komunikatu..." rows={5} /></FormField>

      <div style={{ background: T.bgAlt, borderRadius: 10, padding: "10px 14px", marginTop: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, marginBottom: 6 }}>Dostępne zmienne (wklej w treść):</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["{rodzic}", "{uczeń}", "{miesiąc}", "{kwota}"].map(v => (
            <span key={v} className="tab-hover" style={{ fontSize: 11, fontWeight: 700, color: T.primary, background: T.primary + "12", padding: "3px 8px", borderRadius: 5, cursor: "pointer" }}>{v}</span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.cardBorder}` }}>
        <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, display: "flex", alignItems: "center" }}>Podgląd przed wysyłką</div>
        <div style={{ display: "flex", gap: 8 }}>
          <BtnGhost onClick={onClose}>Anuluj</BtnGhost>
          <BtnPrimary>📤 Wyślij komunikat</BtnPrimary>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════ 5–7. TUTOR CARD EXPANSIONS ═══════════════ */

function TutorExpansions() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .8, marginBottom: 12 }}>
        Karta korepetytora — rozwinięcia akcji
      </div>

      {/* Tutor card header */}
      <Card style={{ padding: 0 }}>
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${T.cardBorder}` }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: T.primary + "22", color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800 }}>TK</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Tomasz Kowalski</div>
            <div style={{ fontSize: 12, color: T.textDim, fontWeight: 600 }}>Matematyka • 8 uczniów • 12 lek/tydz • <span style={{ color: T.success }}>Aktywny</span></div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: T.success, background: T.success + "18", padding: "3px 10px", borderRadius: 6 }}>AKTYWNY</span>
        </div>

        {/* Action buttons */}
        <div style={{ padding: "10px 16px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "absence", label: "Zgłoś nieobecność", icon: "🤒", color: T.danger },
            { id: "rates", label: "Zmień stawki", icon: "💰", color: T.tertiary },
            { id: "message", label: "Wyślij wiadomość", icon: "💬", color: T.primary },
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

        {/* ── EXPANSION: Zgłoś nieobecność ── */}
        {expanded === "absence" && (
          <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${T.cardBorder}` }}>
            <div style={{ paddingTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.danger, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>🤒 Zgłoś nieobecność — Tomasz Kowalski</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FormField label="Typ" required>
                  <Select options={["Choroba", "Urlop", "Inne"]} value="Choroba" />
                </FormField>
                <FormField label="Czas trwania" required>
                  <Select options={["Jeden dzień", "Kilka dni", "Do odwołania"]} placeholder="Wybierz" />
                </FormField>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FormField label="Od dnia" required><Input placeholder="22.05.2026" /></FormField>
                <FormField label="Do dnia"><Input placeholder="23.05.2026" /></FormField>
              </div>

              {/* Affected lessons preview */}
              <div style={{ background: T.danger + "08", borderRadius: 10, padding: "12px 14px", marginBottom: 12, border: `1px solid ${T.danger}15` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.danger, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Lekcje do odwołania (3)</div>
                {[
                  { date: "Czw 22.05", time: "14:00", student: "Kacper Nowak" },
                  { date: "Czw 22.05", time: "15:15", student: "Piotr Zieliński" },
                  { date: "Pt 23.05", time: "10:00", student: "Kacper Nowak" },
                ].map((l, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: i < 2 ? `1px solid ${T.danger}10` : "none" }}>
                    <span style={{ color: T.textMuted, fontWeight: 600 }}>{l.date}, {l.time}</span>
                    <span style={{ color: T.text, fontWeight: 600 }}>{l.student}</span>
                  </div>
                ))}
              </div>

              <FormField label="Komentarz"><Textarea placeholder="Opcjonalny komentarz..." rows={2} /></FormField>

              <div style={{ display: "flex", gap: 8 }}>
                <BtnPrimary color={T.danger}>Zatwierdź i odwołaj lekcje</BtnPrimary>
                <BtnGhost onClick={() => setExpanded(null)}>Anuluj</BtnGhost>
              </div>
            </div>
          </div>
        )}

        {/* ── EXPANSION: Zmień stawki ── */}
        {expanded === "rates" && (
          <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${T.cardBorder}` }}>
            <div style={{ paddingTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.tertiary, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>💰 Zmień stawki — Tomasz Kowalski</div>

              <div style={{ background: T.bgAlt, borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Obecne stawki</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                  <span style={{ color: T.textDim, fontWeight: 600 }}>Indywidualne</span>
                  <span style={{ color: T.text, fontWeight: 800 }}>60 zł/h</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0" }}>
                  <span style={{ color: T.textDim, fontWeight: 600 }}>Grupowe</span>
                  <span style={{ color: T.text, fontWeight: 800 }}>45 zł/h</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FormField label="Nowa stawka indyw. (zł/h)" required><Input value="60" type="number" /></FormField>
                <FormField label="Nowa stawka grupa (zł/h)" required><Input value="45" type="number" /></FormField>
              </div>

              <FormField label="Obowiązuje od" required>
                <Select options={["Natychmiast", "Od następnego miesiąca", "Od wybranej daty"]} value="Od następnego miesiąca" />
              </FormField>

              <div style={{ background: T.orange + "08", borderRadius: 8, padding: "10px 12px", marginBottom: 12, fontSize: 11, color: T.orange, fontWeight: 600, border: `1px solid ${T.orange}15` }}>
                ⚠ Zmiana stawek wpłynie na rozliczenia od wybranego momentu. Istniejące umowy uczniów nie zostaną zmienione automatycznie.
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <BtnPrimary color={T.tertiary}>Zapisz nowe stawki</BtnPrimary>
                <BtnGhost onClick={() => setExpanded(null)}>Anuluj</BtnGhost>
              </div>
            </div>
          </div>
        )}

        {/* ── EXPANSION: Wyślij wiadomość ── */}
        {expanded === "message" && (
          <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${T.cardBorder}` }}>
            <div style={{ paddingTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.primary, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>💬 Wiadomość do Tomasza Kowalskiego</div>

              <FormField label="Kanał">
                <div style={{ display: "flex", gap: 6 }}>
                  {["Email", "Push", "Oba"].map(ch => (
                    <div key={ch} className="tab-hover" style={{
                      padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer",
                      background: ch === "Oba" ? T.primary + "18" : T.surface,
                      color: ch === "Oba" ? T.primary : T.textMuted,
                      border: `1px solid ${ch === "Oba" ? T.primary + "30" : T.cardBorder}`,
                    }}>{ch}</div>
                  ))}
                </div>
              </FormField>

              <FormField label="Temat"><Input placeholder="np. Przypomnienie o wpisach" /></FormField>
              <FormField label="Treść" required><Textarea placeholder="Treść wiadomości..." rows={4} /></FormField>

              <div style={{ display: "flex", gap: 8 }}>
                <BtnPrimary>📤 Wyślij</BtnPrimary>
                <BtnGhost onClick={() => setExpanded(null)}>Anuluj</BtnGhost>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════ MAIN — SHOWCASE ═══════════════ */

export default function AdminDetailInteractions() {
  const [activeModal, setActiveModal] = useState(null);

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

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: T.text, marginBottom: 4 }}>Panel admina — Szczegółowe interakcje</div>
          <div style={{ fontSize: 13, color: T.textDim, fontWeight: 600 }}>4 modale szybkich akcji + 3 rozwinięcia w karcie korepetytora</div>
        </div>

        {/* Quick actions grid */}
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: .8, marginBottom: 12 }}>
          Szybkie akcje z dashboardu admina
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 32 }}>
          {[
            { id: "student", label: "Dodaj ucznia", icon: "🎓", color: T.primary },
            { id: "classes", label: "Dodaj zajęcia", icon: "📚", color: T.success },
            { id: "group", label: "Nowa grupa", icon: "👥", color: T.accent },
            { id: "broadcast", label: "Wyślij komunikat", icon: "📢", color: T.orange },
          ].map(action => (
            <button key={action.id} onClick={() => setActiveModal(action.id)} className="btn-primary" style={{
              padding: "14px 8px", borderRadius: 12, border: "none",
              background: action.color + "15", color: action.color,
              fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 22 }}>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>

        {/* Tutor card with expansions */}
        <TutorExpansions />
      </div>

      {/* Modals */}
      {activeModal === "student" && <DodajUcznia onClose={() => setActiveModal(null)} />}
      {activeModal === "classes" && <DodajZajecia onClose={() => setActiveModal(null)} />}
      {activeModal === "group" && <NowaGrupa onClose={() => setActiveModal(null)} />}
      {activeModal === "broadcast" && <WyslijKomunikat onClose={() => setActiveModal(null)} />}
    </div>
  );
}
