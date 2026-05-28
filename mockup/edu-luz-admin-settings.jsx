import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", secondary: "#FF6F4A", tertiary: "#FFCA28",
  accent: "#7C5CFC", success: "#22C55E", cyan: "#06B6D4",
  danger: "#EF4444", pink: "#E84393",
  cardBorder: "rgba(59,143,240,0.10)",
};

const sidebarItems = [
  { icon: "\ud83d\udcca", label: "Dashboard" },
  { icon: "\ud83d\udcc5", label: "Harmonogram" },
  { icon: "\ud83d\udc68\u200d\ud83c\udfeb", label: "Korepetytorzy" },
  { icon: "\ud83c\udf93", label: "Uczniowie i grupy" },
  { icon: "\ud83d\udcb3", label: "Płatności" },
  { icon: "⚙\ufe0f", label: "Ustawienia", active: true },
];

const settingSections = [
  { id: "center", icon: "\ud83c\udfe2", label: "Centrum" },
  { id: "rooms", icon: "\ud83d\udccd", label: "Sale" },
  { id: "subjects", icon: "\ud83d\udcda", label: "Przedmioty" },
  { id: "hours", icon: "\ud83d\udd52", label: "Godziny pracy" },
  { id: "reminders", icon: "\ud83d\udd14", label: "Przypomnienia" },
  { id: "contracts", icon: "\ud83d\udcc4", label: "Umowy" },
  { id: "accounts", icon: "\ud83d\udc64", label: "Konta" },
  { id: "notifications", icon: "\ud83d\udce2", label: "Powiadomienia" },
];

/* ====== MOCK DATA ====== */
const centerData = {
  name: "EDU LUZ",
  fullName: "Centrum Korepetycji EDU LUZ",
  address: "ul. Przykładowa 15, 00-001 Warszawa",
  phone: "22 123 45 67",
  email: "kontakt@edu-luz.pl",
  nip: "123-456-78-90",
  bankAccount: "PL 12 3456 7890 1234 5678 9012 3456",
};

const roomsData = [
  { id: 1, name: "Sala 1", capacity: 6, equipment: "Tablica, projektor", status: "active" },
  { id: 2, name: "Sala 2", capacity: 4, equipment: "Tablica", status: "active" },
  { id: 3, name: "Sala 3", capacity: 4, equipment: "Tablica, komputer", status: "active" },
  { id: 4, name: "Sala 4", capacity: 8, equipment: "Tablica, projektor, nagłośnienie", status: "active" },
];

const subjectsData = [
  { id: 1, name: "Matematyka", color: "#3B8FF0", tutors: 2, students: 6 },
  { id: 2, name: "Angielski", color: "#06B6D4", tutors: 3, students: 7 },
  { id: 3, name: "Fizyka", color: "#F59E0B", tutors: 1, students: 3 },
  { id: 4, name: "Chemia", color: "#22C55E", tutors: 1, students: 4 },
  { id: 5, name: "Polski", color: "#E84393", tutors: 1, students: 4 },
  { id: 6, name: "Elektrotechnika", color: "#FF6F4A", tutors: 1, students: 3 },
];


const workingHoursLessons = [
  { day: "Poniedziałek", open: "8:00", close: "20:00", active: true },
  { day: "Wtorek", open: "8:00", close: "20:00", active: true },
  { day: "Środa", open: "8:00", close: "20:00", active: true },
  { day: "Czwartek", open: "8:00", close: "20:00", active: true },
  { day: "Piątek", open: "9:00", close: "19:00", active: true },
  { day: "Sobota", open: "9:00", close: "14:00", active: true },
  { day: "Niedziela", open: "9:00", close: "14:00", active: true },
];

const workingHoursPhone = [
  { day: "Poniedziałek", open: "7:30", close: "21:00", active: true },
  { day: "Wtorek", open: "7:30", close: "21:00", active: true },
  { day: "Środa", open: "7:30", close: "21:00", active: true },
  { day: "Czwartek", open: "7:30", close: "21:00", active: true },
  { day: "Piątek", open: "8:00", close: "20:00", active: true },
  { day: "Sobota", open: "8:00", close: "15:00", active: true },
  { day: "Niedziela", open: "9:00", close: "13:00", active: true },
];

const remindersConfig = {
  autoEnabled: true,
  schedule: [
    { day: 10, time: "9:00", label: "Termin płatności", template: "Szanowni Państwo, przypominamy o terminie płatności za zajęcia w {miesiąc}. Kwota: {kwota} zł. Prosimy o wpłatę do końca dnia.", enabled: true },
    { day: 20, time: "10:00", label: "Pierwsze przypomnienie", template: "Szanowni Państwo, informujemy o braku wpłaty za {miesiąc}. Kwota: {kwota} zł. Prosimy o uregulowanie należności.", enabled: true },
    { day: 0, time: "10:00", label: "Ostatni dzień miesiąca", template: "Szanowni Państwo, płatność za {miesiąc} w wysokości {kwota} zł jest nadal nieureg. Prosimy o pilny kontakt.", enabled: true },
  ],
};

const contractDefaults = {
  paymentDeadline: 10,
  minContractMonths: 1,
  cancellationNoticeDays: 14,
  makeupDeadlineDays: 30,
  lateEntryHours: 48,
  noShowPolicy: "Lekcja nieodbyra z winy ucznia (no-show) nie podlega odrabianiu. Odwołanie lekcji możliwe min. 24h przed terminem.",
};

const accountsData = [
  { id: 1, name: "Admin Główny", email: "admin@edu-luz.pl", role: "admin", lastLogin: "20.06.2026 14:30" },
  { id: 2, name: "Anna Kowalska", email: "anna.k@edu-luz.pl", role: "manager", lastLogin: "20.06.2026 09:15" },
];

const notifSettings = [
  { id: "new_absence", label: "Nowa nieobecność korepetytora", email: true, push: true },
  { id: "plan_change", label: "Prośba o zmianę planu", email: true, push: true },
  { id: "entry_blocked", label: "Zablokowany wpis (>48h)", email: false, push: true },
  { id: "payment_received", label: "Wpłata zaksiegowana", email: true, push: false },
  { id: "payment_overdue", label: "Nowa zaległość", email: true, push: true },
  { id: "makeup_no_response", label: "Odrabianie bez odpowiedzi >3 dni", email: false, push: true },
  { id: "contract_ending", label: "Umowa kończy się w ciągu 30 dni", email: true, push: false },
];

/* ====== COMPONENTS ====== */

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
          </div>
        ))}
      </div>
      <div onClick={onToggle} style={{ padding: 10, borderTop: "1px solid " + T.cardBorder, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.textDim, fontSize: 12 }}>{collapsed ? "▶" : "◀"}</div>
    </div>
  );
}

function Field({ label, value, editable }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 8, color: T.textDim, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
      {editable ? (
        <input defaultValue={value} style={{ fontSize: 12, fontWeight: 600, color: T.text, fontFamily: "Nunito, sans-serif", padding: "6px 10px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, width: "100%", outline: "none" }} />
      ) : (
        <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{value}</div>
      )}
    </div>
  );
}

function Toggle({ checked, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <div style={{ width: 36, height: 20, borderRadius: 50, background: checked ? T.success : T.textDim + "40", position: "relative", transition: "background 0.2s" }}>
        <div style={{ width: 16, height: 16, borderRadius: 50, background: "#fff", position: "absolute", top: 2, left: checked ? 18 : 2, transition: "left 0.2s" }} />
      </div>
      <span style={{ fontSize: 11, color: T.text, fontWeight: 600 }}>{label}</span>
    </label>
  );
}

/* ====== SECTION RENDERERS ====== */

function CenterSection() {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 900, color: T.text, marginBottom: 16 }}>{"Dane centrum"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 600 }}>
        <div>
          <Field label="Nazwa" value={centerData.name} editable />
          <Field label="Pełna nazwa" value={centerData.fullName} editable />
          <Field label="Adres" value={centerData.address} editable />
        </div>
        <div>
          <Field label="Telefon" value={centerData.phone} editable />
          <Field label="Email" value={centerData.email} editable />
          <Field label="NIP" value={centerData.nip} editable />
          <Field label="Nr konta bankowego" value={centerData.bankAccount} editable />
        </div>
      </div>
      <button style={{ marginTop: 16, padding: "8px 24px", fontSize: 11, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 8, border: "none", cursor: "pointer", background: T.primary, color: "#fff" }}>{"Zapisz zmiany"}</button>
    </div>
  );
}

function RoomsSection() {
  const [editId, setEditId] = useState(null);
  const [adding, setAdding] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>{"Sale (" + roomsData.length + ")"}</div>
        <button onClick={() => setAdding(!adding)} style={{ fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: adding ? T.textDim : T.primary, color: "#fff" }}>{adding ? "Anuluj" : "+ Dodaj salę"}</button>
      </div>
      {adding && (
        <div style={{ padding: "14px 16px", background: T.surface, borderRadius: 10, border: "1px dashed " + T.primary + "50", marginBottom: 10, maxWidth: 600 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.primary, marginBottom: 8 }}>{"Nowa sala"}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <div><div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>Nazwa</div><input placeholder="Sala 5" style={{ width: 120, fontSize: 11, padding: "5px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, color: T.text, outline: "none" }} /></div>
            <div><div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>Pojemność</div><input placeholder="4" style={{ width: 60, fontSize: 11, padding: "5px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, color: T.text, outline: "none", textAlign: "center" }} /></div>
            <div><div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>Wyposażenie</div><input placeholder="Tablica, projektor" style={{ width: 200, fontSize: 11, padding: "5px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, color: T.text, outline: "none" }} /></div>
          </div>
          <button style={{ padding: "6px 16px", fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 6, border: "none", cursor: "pointer", background: T.success, color: "#fff" }}>{"Dodaj salę"}</button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 600 }}>
        {roomsData.map(r => (
          <div key={r.id} style={{ background: T.surface, borderRadius: 10, border: "1px solid " + T.cardBorder, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: T.primary + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: T.primary }}>{r.id}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{r.name}</div>
                <div style={{ fontSize: 10, color: T.textDim }}>{r.equipment + " · max " + r.capacity + " os."}</div>
              </div>
              <button onClick={() => setEditId(editId === r.id ? null : r.id)} style={{ fontSize: 9, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer", background: editId === r.id ? T.textDim + "30" : T.primary + "12", color: editId === r.id ? T.textDim : T.primary }}>{editId === r.id ? "Zwiń" : "Edytuj"}</button>
              <button style={{ fontSize: 9, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer", background: T.danger + "12", color: T.danger }}>{"Usuń"}</button>
            </div>
            {editId === r.id && (
              <div style={{ padding: "0 16px 14px 64px", borderTop: "1px solid " + T.cardBorder, paddingTop: 12 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  <div><div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>Nazwa</div><input defaultValue={r.name} style={{ width: 120, fontSize: 11, padding: "5px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, color: T.text, outline: "none" }} /></div>
                  <div><div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>Pojemność</div><input defaultValue={r.capacity} style={{ width: 60, fontSize: 11, padding: "5px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, color: T.text, outline: "none", textAlign: "center" }} /></div>
                  <div><div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>Wyposażenie</div><input defaultValue={r.equipment} style={{ width: 200, fontSize: 11, padding: "5px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, color: T.text, outline: "none" }} /></div>
                </div>
                <button style={{ padding: "6px 16px", fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 6, border: "none", cursor: "pointer", background: T.success, color: "#fff" }}>{"Zapisz"}</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SubjectsSection() {
  const [editId, setEditId] = useState(null);
  const [adding, setAdding] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>{"Przedmioty (" + subjectsData.length + ")"}</div>
        <button onClick={() => setAdding(!adding)} style={{ fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: adding ? T.textDim : T.primary, color: "#fff" }}>{adding ? "Anuluj" : "+ Dodaj przedmiot"}</button>
      </div>
      {adding && (
        <div style={{ padding: "14px 16px", background: T.surface, borderRadius: 10, border: "1px dashed " + T.primary + "50", marginBottom: 10, maxWidth: 600 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.primary, marginBottom: 8 }}>{"Nowy przedmiot"}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 8 }}>
            <div><div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>Nazwa</div><input placeholder="Biologia" style={{ width: 160, fontSize: 11, padding: "5px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, color: T.text, outline: "none" }} /></div>
            <div><div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>Kolor</div><input type="color" defaultValue="#9B59B6" style={{ width: 36, height: 28, padding: 0, border: "1px solid " + T.cardBorder, borderRadius: 6, cursor: "pointer" }} /></div>
          </div>
          <button style={{ padding: "6px 16px", fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 6, border: "none", cursor: "pointer", background: T.success, color: "#fff" }}>{"Dodaj przedmiot"}</button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 600 }}>
        {subjectsData.map(s => (
          <div key={s.id} style={{ background: T.surface, borderRadius: 10, border: "1px solid " + T.cardBorder, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px" }}>
              <div style={{ width: 12, height: 12, borderRadius: 50, background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: T.text, flex: 1 }}>{s.name}</span>
              <span style={{ fontSize: 9, color: T.textDim }}>{s.tutors + " kor."}</span>
              <span style={{ fontSize: 9, color: T.textDim }}>{s.students + " ucz."}</span>
              <button onClick={() => setEditId(editId === s.id ? null : s.id)} style={{ fontSize: 9, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer", background: editId === s.id ? T.textDim + "30" : T.primary + "12", color: editId === s.id ? T.textDim : T.primary }}>{editId === s.id ? "Zwiń" : "Edytuj"}</button>
            </div>
            {editId === s.id && (
              <div style={{ padding: "0 16px 12px 40px", borderTop: "1px solid " + T.cardBorder, paddingTop: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 8 }}>
                  <div><div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>Nazwa</div><input defaultValue={s.name} style={{ width: 160, fontSize: 11, padding: "5px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, color: T.text, outline: "none" }} /></div>
                  <div><div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>Kolor</div><input type="color" defaultValue={s.color} style={{ width: 36, height: 28, padding: 0, border: "1px solid " + T.cardBorder, borderRadius: 6, cursor: "pointer" }} /></div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ padding: "6px 16px", fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 6, border: "none", cursor: "pointer", background: T.success, color: "#fff" }}>{"Zapisz"}</button>
                  <button style={{ padding: "6px 16px", fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 6, border: "none", cursor: "pointer", background: T.danger + "12", color: T.danger }}>{"Usuń przedmiot"}</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}



function HoursTable({ data, label, color }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: color, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {data.map((wh, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: T.surface, borderRadius: 6, border: "1px solid " + T.cardBorder, opacity: wh.active ? 1 : 0.5 }}>
            <input type="checkbox" checked={wh.active} readOnly style={{ accentColor: color }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: T.text, width: 90 }}>{wh.day}</span>
            {wh.active ? (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input defaultValue={wh.open} style={{ width: 52, fontSize: 10, fontWeight: 700, color: T.text, fontFamily: "Nunito, sans-serif", padding: "3px 6px", borderRadius: 5, border: "1px solid " + T.cardBorder, background: T.bg, textAlign: "center", outline: "none" }} />
                <span style={{ fontSize: 9, color: T.textDim }}>{"–"}</span>
                <input defaultValue={wh.close} style={{ width: 52, fontSize: 10, fontWeight: 700, color: T.text, fontFamily: "Nunito, sans-serif", padding: "3px 6px", borderRadius: 5, border: "1px solid " + T.cardBorder, background: T.bg, textAlign: "center", outline: "none" }} />
              </div>
            ) : (
              <span style={{ fontSize: 10, color: T.textDim }}>Nieczynne</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HoursSection() {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 900, color: T.text, marginBottom: 6 }}>{"Godziny pracy centrum"}</div>
      <div style={{ fontSize: 10, color: T.textDim, marginBottom: 16 }}>{"Dwa osobne harmonogramy — godziny zajęć i godziny kontaktu telefonicznego"}</div>
      <div style={{ display: "flex", gap: 24, maxWidth: 700 }}>
        <HoursTable data={workingHoursLessons} label={"📚 Godziny zajęć (korepetycje)"} color={T.primary} />
        <HoursTable data={workingHoursPhone} label={"📞 Kontakt telefoniczny"} color={T.cyan} />
      </div>
      <button style={{ marginTop: 16, padding: "8px 24px", fontSize: 11, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 8, border: "none", cursor: "pointer", background: T.primary, color: "#fff" }}>{"Zapisz godziny"}</button>
    </div>
  );
}

function RemindersSection() {
  const [editing, setEditing] = useState(null);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>{"Przypomnienia o płatnościach"}</div>
        <Toggle checked={remindersConfig.autoEnabled} label="Automatyczne wysyłanie" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 650 }}>
        {remindersConfig.schedule.map((s, i) => (
          <div key={i} style={{ background: T.surface, borderRadius: 10, border: "1px solid " + T.cardBorder, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={s.enabled} readOnly style={{ accentColor: T.primary }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{s.label}</span>
                <span style={{ fontSize: 9, color: T.textDim }}>{"(" + (s.day === 0 ? "ostatni dzień" : s.day + ". dzień") + " o " + s.time + ")"}</span>
              </div>
              <button onClick={() => setEditing(editing === i ? null : i)} style={{ fontSize: 9, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer", background: T.primary + "12", color: T.primary }}>
                {editing === i ? "Zwiń" : "Edytuj szablon"}
              </button>
            </div>
            {editing === i ? (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>{"Dzień miesiąca"}</div>
                    <input defaultValue={s.day === 0 ? "ostatni" : s.day} style={{ width: 70, fontSize: 11, fontWeight: 700, color: T.text, fontFamily: "Nunito, sans-serif", padding: "4px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, outline: "none" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>{"Godzina wysyłki"}</div>
                    <input defaultValue={s.time} style={{ width: 70, fontSize: 11, fontWeight: 700, color: T.text, fontFamily: "Nunito, sans-serif", padding: "4px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, outline: "none" }} />
                  </div>
                </div>
                <div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>{"Treść wiadomości"}</div>
                <textarea defaultValue={s.template} style={{ width: "100%", height: 80, fontSize: 11, color: T.text, fontFamily: "Nunito, sans-serif", padding: "8px 10px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, outline: "none", resize: "vertical" }} />
                <div style={{ fontSize: 8, color: T.textDim, marginTop: 4 }}>{"Zmienne: {miesiąc}, {kwota}, {rodzic}, {uczeń}, {termin}"}</div>
                <button style={{ marginTop: 8, padding: "6px 16px", fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 6, border: "none", cursor: "pointer", background: T.success, color: "#fff" }}>{"Zapisz szablon"}</button>
              </div>
            ) : (
              <div style={{ fontSize: 10, color: T.textMuted, background: T.bg, padding: "8px 10px", borderRadius: 6, lineHeight: 1.5 }}>{s.template}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContractsSection() {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 900, color: T.text, marginBottom: 16 }}>{"Domyślne warunki umów"}</div>
      <div style={{ maxWidth: 500, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { label: "Termin płatności (dzień miesiąca)", value: contractDefaults.paymentDeadline, suffix: "." },
          { label: "Minimalny okres umowy (miesiące)", value: contractDefaults.minContractMonths },
          { label: "Wypowiedzenie umowy (dni)", value: contractDefaults.cancellationNoticeDays },
          { label: "Termin na odrobienie (dni)", value: contractDefaults.makeupDeadlineDays },
          { label: "Czas na wpis po lekcji (godziny)", value: contractDefaults.lateEntryHours },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: T.surface, borderRadius: 8, border: "1px solid " + T.cardBorder }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{f.label}</span>
            <input defaultValue={f.value} style={{ width: 60, fontSize: 12, fontWeight: 800, color: T.tertiary, fontFamily: "Nunito, sans-serif", padding: "4px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, textAlign: "center", outline: "none" }} />
          </div>
        ))}
        <div style={{ padding: "10px 14px", background: T.surface, borderRadius: 8, border: "1px solid " + T.cardBorder }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.text, marginBottom: 4 }}>{"Polityka no-show"}</div>
          <textarea defaultValue={contractDefaults.noShowPolicy} style={{ width: "100%", height: 60, fontSize: 10, color: T.textMuted, fontFamily: "Nunito, sans-serif", padding: "6px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, outline: "none", resize: "vertical" }} />
        </div>
      </div>
      <button style={{ marginTop: 16, padding: "8px 24px", fontSize: 11, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 8, border: "none", cursor: "pointer", background: T.primary, color: "#fff" }}>{"Zapisz warunki"}</button>
    </div>
  );
}

function AccountsSection() {
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const roles = ["admin", "manager"];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>{"Konta administracyjne"}</div>
        <button onClick={() => setAdding(!adding)} style={{ fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: adding ? T.textDim : T.primary, color: "#fff" }}>{adding ? "Anuluj" : "+ Dodaj konto"}</button>
      </div>
      {adding && (
        <div style={{ padding: "14px 16px", background: T.surface, borderRadius: 10, border: "1px dashed " + T.primary + "50", marginBottom: 10, maxWidth: 600 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.primary, marginBottom: 8 }}>{"Nowe konto"}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <div><div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>{"Imię i nazwisko"}</div><input placeholder="Jan Kowalski" style={{ width: 160, fontSize: 11, padding: "5px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, color: T.text, outline: "none" }} /></div>
            <div><div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>Email</div><input placeholder="jan@edu-luz.pl" style={{ width: 180, fontSize: 11, padding: "5px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, color: T.text, outline: "none" }} /></div>
            <div><div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>Rola</div>
              <select defaultValue="manager" style={{ fontSize: 11, padding: "5px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, color: T.text, outline: "none" }}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div><div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>{"Hasło tymczasowe"}</div><input type="password" placeholder="••••••" style={{ width: 120, fontSize: 11, padding: "5px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, color: T.text, outline: "none" }} /></div>
          </div>
          <button style={{ padding: "6px 16px", fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 6, border: "none", cursor: "pointer", background: T.success, color: "#fff" }}>{"Utwórz konto"}</button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 600 }}>
        {accountsData.map(a => (
          <div key={a.id} style={{ background: T.surface, borderRadius: 10, border: "1px solid " + T.cardBorder, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
              <div style={{ width: 36, height: 36, borderRadius: 50, background: T.accent + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: T.accent }}>{a.name.split(" ").map(w => w[0]).join("")}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{a.name}</div>
                <div style={{ fontSize: 9, color: T.textDim }}>{a.email + " · " + a.role + " · Ostatnie logowanie: " + a.lastLogin}</div>
              </div>
              <button onClick={() => setEditId(editId === a.id ? null : a.id)} style={{ fontSize: 9, fontWeight: 700, fontFamily: "Nunito, sans-serif", padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer", background: editId === a.id ? T.textDim + "30" : T.primary + "12", color: editId === a.id ? T.textDim : T.primary }}>{editId === a.id ? "Zwiń" : "Edytuj"}</button>
            </div>
            {editId === a.id && (
              <div style={{ padding: "0 16px 14px 64px", borderTop: "1px solid " + T.cardBorder, paddingTop: 12 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  <div><div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>{"Imię i nazwisko"}</div><input defaultValue={a.name} style={{ width: 160, fontSize: 11, padding: "5px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, color: T.text, outline: "none" }} /></div>
                  <div><div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>Email</div><input defaultValue={a.email} style={{ width: 180, fontSize: 11, padding: "5px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, color: T.text, outline: "none" }} /></div>
                  <div><div style={{ fontSize: 8, color: T.textDim, marginBottom: 2 }}>Rola</div>
                    <select defaultValue={a.role} style={{ fontSize: 11, padding: "5px 8px", borderRadius: 6, border: "1px solid " + T.cardBorder, background: T.bg, color: T.text, outline: "none" }}>
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ padding: "6px 16px", fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 6, border: "none", cursor: "pointer", background: T.success, color: "#fff" }}>Zapisz</button>
                  <button style={{ padding: "6px 16px", fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 6, border: "none", cursor: "pointer", background: T.tertiary + "15", color: T.tertiary }}>{"Resetuj hasło"}</button>
                  <button style={{ padding: "6px 16px", fontSize: 10, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 6, border: "none", cursor: "pointer", background: T.danger + "12", color: T.danger }}>{"Usuń konto"}</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsSection() {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 900, color: T.text, marginBottom: 6 }}>{"Powiadomienia"}</div>
      <div style={{ fontSize: 10, color: T.textDim, marginBottom: 16 }}>{"Jakie zdarzenia wywołują powiadomienia dla administratora"}</div>
      <div style={{ maxWidth: 550 }}>
        <div style={{ display: "flex", gap: 8, padding: "6px 12px", borderBottom: "1px solid " + T.cardBorder, marginBottom: 4 }}>
          <span style={{ flex: 1, fontSize: 10, fontWeight: 700, color: T.textDim }}>Zdarzenie</span>
          <span style={{ width: 60, fontSize: 10, fontWeight: 700, color: T.textDim, textAlign: "center" }}>Email</span>
          <span style={{ width: 60, fontSize: 10, fontWeight: 700, color: T.textDim, textAlign: "center" }}>Push</span>
        </div>
        {notifSettings.map((n, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: i % 2 === 0 ? T.surface : "transparent", borderRadius: 6 }}>
            <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: T.text }}>{n.label}</span>
            <div style={{ width: 60, display: "flex", justifyContent: "center" }}><input type="checkbox" checked={n.email} readOnly style={{ accentColor: T.primary }} /></div>
            <div style={{ width: 60, display: "flex", justifyContent: "center" }}><input type="checkbox" checked={n.push} readOnly style={{ accentColor: T.primary }} /></div>
          </div>
        ))}
      </div>
      <button style={{ marginTop: 16, padding: "8px 24px", fontSize: 11, fontWeight: 700, fontFamily: "Nunito, sans-serif", borderRadius: 8, border: "none", cursor: "pointer", background: T.primary, color: "#fff" }}>{"Zapisz ustawienia"}</button>
    </div>
  );
}

/* ====== MAIN ====== */
export default function AdminSettings() {
  const [collapsed, setCollapsed] = useState(true);
  const [activeSection, setActiveSection] = useState("center");

  const renderSection = () => {
    switch (activeSection) {
      case "center": return <CenterSection />;
      case "rooms": return <RoomsSection />;
      case "subjects": return <SubjectsSection />;
      case "hours": return <HoursSection />;
      case "reminders": return <RemindersSection />;
      case "contracts": return <ContractsSection />;
      case "accounts": return <AccountsSection />;
      case "notifications": return <NotificationsSection />;
      default: return <CenterSection />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, fontFamily: "Nunito, sans-serif", color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.cardBorder}; border-radius: 50px; }
      `}</style>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: 48, background: T.bgAlt, borderBottom: "1px solid " + T.cardBorder, display: "flex", alignItems: "center", padding: "0 20px", flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: T.text, fontFamily: "Nunito, sans-serif" }}>Ustawienia</span>
        </div>
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Settings nav */}
          <div style={{ width: 200, flexShrink: 0, borderRight: "1px solid " + T.cardBorder, padding: "12px 8px", overflow: "auto" }}>
            {settingSections.map(s => (
              <div key={s.id} onClick={() => setActiveSection(s.id)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 8, cursor: "pointer", background: activeSection === s.id ? T.primary + "15" : "transparent", marginBottom: 2, transition: "all 0.12s" }}
                onMouseEnter={e => { if (activeSection !== s.id) e.currentTarget.style.background = T.primary + "08"; }}
                onMouseLeave={e => { if (activeSection !== s.id) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ fontSize: 11, fontWeight: activeSection === s.id ? 800 : 500, color: activeSection === s.id ? T.primary : T.textMuted }}>{s.label}</span>
              </div>
            ))}
          </div>
          {/* Content */}
          <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
