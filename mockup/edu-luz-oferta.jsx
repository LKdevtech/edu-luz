import { useState } from "react";

const T = {
  bg: "#151827", bgAlt: "#1C2035", surface: "#232840", surfaceHover: "#2A3050",
  text: "#F0EDE6", textMuted: "#9B97AF", textDim: "#6B6780",
  primary: "#3B8FF0", primaryDark: "#2D7DE8", secondary: "#FF6F4A",
  tertiary: "#FFCA28", accent: "#7C5CFC",
  cardBorder: "rgba(59,143,240,0.10)",
};

const subjects = [
  { name: "Matematyka", icon: "∑", color: "#3B8FF0" },
  { name: "Angielski", icon: "🇬🇧", color: "#06B6D4" },
  { name: "Fizyka", icon: "⚡", color: "#F59E0B" },
  { name: "Chemia", icon: "⚗️", color: "#22C55E" },
  { name: "Polski", icon: "📖", color: "#E84393" },
  { name: "Elektrotechnika", icon: "🔌", color: "#FF6F4A" },
];

const levels = [
  { key: "podstawowa", label: "Szkoła podstawowa", short: "Podstawówka" },
  { key: "srednia_p", label: "Średnia — podstawa", short: "Średnia podst." },
  { key: "srednia_r", label: "Średnia — rozszerzenie", short: "Średnia rozsz." },
];
const forms = [
  { key: "individual", label: "Indywidualnie", icon: "👤", multi: 1 },
  { key: "pair", label: "W parze", icon: "👥", multi: 0.7 },
  { key: "group", label: "Mała grupa", icon: "👨‍👩‍👧‍👦", multi: 0.5 },
];
const durations = [45, 60, 90, 120];
const LESSONS_PER_MONTH = 3.5;

const basePrices = {
  "Matematyka": [80, 100], "Angielski": [75, 95], "Fizyka": [85, 110],
  "Chemia": [85, 105], "Polski": [70, 90], "Elektrotechnika": [90, 120],
};

function getPrice(subject, levelKey, form, duration) {
  const base = basePrices[subject] || [80, 100];
  const levelMul = levelKey === "srednia_r" ? 1.2 : levelKey === "srednia_p" ? 1.1 : 1;
  const formMul = form.multi;
  const durMul = duration / 60;
  const perLesson = [
    Math.round(base[0] * levelMul * formMul * durMul),
    Math.round(base[1] * levelMul * formMul * durMul),
  ];
  const perMonth = [
    Math.round(perLesson[0] * LESSONS_PER_MONTH / 5) * 5,
    Math.round(perLesson[1] * LESSONS_PER_MONTH / 5) * 5,
  ];
  return { perLesson, perMonth };
}

function Blob({ color, size, top, left, right, bottom, opacity = 0.06 }) {
  return <div style={{ position: "absolute", width: size, height: size, borderRadius: "50%", background: color, opacity, filter: "blur(80px)", pointerEvents: "none", top, left, right, bottom }} />;
}

function Section({ children, alt = false, style = {} }) {
  return (
    <section style={{ background: alt ? T.bgAlt : T.bg, padding: "56px 0", position: "relative", overflow: "hidden", ...style }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>{children}</div>
    </section>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: T.text, marginBottom: 8, letterSpacing: -0.3 }}>{children}</h2>
      {sub && <p style={{ fontSize: 15, color: T.textMuted, fontWeight: 500, maxWidth: 560, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

function Chip({ active, onClick, children, color }) {
  return (
    <button onClick={onClick} style={{
      padding: "9px 18px", borderRadius: 12, fontSize: 13, fontWeight: 700,
      border: `1.5px solid ${active ? (color || T.primary) + "60" : T.cardBorder}`,
      background: active ? (color || T.primary) + "18" : T.surface,
      color: active ? (color || T.primary) : T.textMuted,
      cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
      display: "inline-flex", alignItems: "center", gap: 6,
    }}>
      {children}
    </button>
  );
}

function ExpandableCard({ children, title, icon, color, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: T.surface, borderRadius: 18, overflow: "hidden",
      border: `1px solid ${T.cardBorder}`,
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "18px 20px", background: "transparent", border: "none",
        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
      }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 16, fontWeight: 800, color: T.text }}>{title}</span>
        <span style={{ fontSize: 10, color: T.textDim, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>▼</span>
      </button>
      <div style={{
        maxHeight: open ? 400 : 0, overflow: "hidden",
        transition: "max-height 0.35s ease, opacity 0.3s ease",
        opacity: open ? 1 : 0,
      }}>
        <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${T.cardBorder}` }}>
          <div style={{ paddingTop: 16 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function NavLink({ children, active }) {
  const [h, setH] = useState(false);
  return (
    <span onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ fontSize: 13, fontWeight: 600, color: active ? T.primary : h ? T.text : T.textMuted, cursor: "pointer", transition: "color 0.2s" }}>
      {children}
    </span>
  );
}

function HoverBtn({ children, primary = false, style = {}, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: primary ? T.primary : "transparent",
        color: primary ? "#fff" : T.textMuted,
        border: primary ? "none" : `1.5px solid ${T.cardBorder}`,
        borderRadius: 14, padding: "13px 28px", fontSize: 14, fontWeight: 800,
        cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
        transform: h ? "scale(1.03)" : "none",
        boxShadow: h && primary ? `0 6px 24px ${T.primary}40` : "none",
        ...style,
      }}>
      {children}
    </button>
  );
}

function HoverCard({ children, style = {} }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: h ? T.surfaceHover : T.surface,
        borderRadius: 20, padding: "28px 24px",
        border: `1px solid ${T.cardBorder}`,
        transition: "all 0.25s", transform: h ? "translateY(-2px)" : "none",
        ...style,
      }}>
      {children}
    </div>
  );
}

const subjectsFull = [
  { name: "Matematyka", icon: "∑", color: "#3B8FF0", levels: ["Podstawówka", "Średnia podst.", "Średnia rozsz."], schoolLevels: ["Szkoła podstawowa", "Szkoła średnia"], desc: "Od ułamków po rachunek różniczkowy. Przygotowanie do egzaminu ósmoklasisty i matury na obu poziomach.", topics: ["Algebra", "Geometria", "Trygonometria", "Analiza", "Statystyka", "Matura"] },
  { name: "Angielski", icon: "🇬🇧", color: "#06B6D4", levels: ["Podstawówka", "Średnia podst.", "Średnia rozsz."], schoolLevels: ["Szkoła podstawowa", "Szkoła średnia"], desc: "Gramatyka, konwersacje, słuchanie i pisanie. Egzaminy Cambridge, matura, zajęcia wyrównawcze.", topics: ["Gramatyka", "Konwersacje", "Słuchanie", "Pisanie", "Cambridge", "Matura"] },
  { name: "Fizyka", icon: "⚡", color: "#F59E0B", levels: ["Podstawówka", "Średnia podst.", "Średnia rozsz."], schoolLevels: ["Szkoła podstawowa", "Szkoła średnia"], desc: "Teoria i zadania obliczeniowe. Mechanika, elektryczność, fale, optyka, fizyka jądrowa.", topics: ["Mechanika", "Elektryczność", "Fale", "Optyka", "Termodynamika", "Matura"] },
  { name: "Chemia", icon: "⚗️", color: "#22C55E", levels: ["Podstawówka", "Średnia podst.", "Średnia rozsz."], schoolLevels: ["Szkoła podstawowa", "Szkoła średnia"], desc: "Chemia ogólna, organiczna i nieorganiczna. Równania reakcji, stechiometria, budowa materii.", topics: ["Chemia ogólna", "Organiczna", "Nieorganiczna", "Stechiometria", "Matura"] },
  { name: "Polski", icon: "📖", color: "#E84393", levels: ["Podstawówka", "Średnia podst.", "Średnia rozsz."], schoolLevels: ["Szkoła podstawowa", "Szkoła średnia"], desc: "Gramatyka, ortografia, lektury, rozprawki. Przygotowanie do egzaminu ósmoklasisty i matury.", topics: ["Gramatyka", "Lektury", "Rozprawka", "Ortografia", "Retoryka", "Matura"] },
  { name: "Elektrotechnika", icon: "🔌", color: "#FF6F4A", levels: ["Średnia podst.", "Średnia rozsz."], schoolLevels: ["Szkoła średnia"], desc: "Obwody elektryczne, pomiary, instalacje, maszyny. Teoria i rozwiązywanie zadań technicznych.", topics: ["Obwody", "Pomiary", "Instalacje", "Maszyny elektryczne", "Zadania"] },
];

export default function OfertaPage() {
  const [selSubject, setSelSubject] = useState("Matematyka");
  const [selLevel, setSelLevel] = useState(levels[0]);
  const [selForm, setSelForm] = useState(forms[0]);
  const [selDuration, setSelDuration] = useState(60);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [priceMode, setPriceMode] = useState("month");

  const price = getPrice(selSubject, selLevel.key, selForm, selDuration);
  const selSubjectData = subjects.find(s => s.name === selSubject);

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={{ background: "rgba(21,24,39,0.85)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${T.cardBorder}`, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: -2, fontStyle: "italic" }}>Ez</div>
            <span style={{ fontSize: 16, fontWeight: 900 }}>EDU <span style={{ color: T.primary }}>LUZ</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {["Strona główna", "Oferta i cennik", "O nas", "Kontakt"].map((l, i) => (
              <NavLink key={l} active={i === 1}>{l}</NavLink>
            ))}
            <HoverBtn primary style={{ padding: "8px 18px", fontSize: 12 }}>Zaloguj się</HoverBtn>
          </div>
        </div>
      </nav>

      {/* ===== 1. HERO ===== */}
      <section style={{ padding: "48px 0 40px", position: "relative", overflow: "hidden", background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bgAlt} 100%)` }}>
        <Blob color={T.primary} size={280} top={-60} right={-40} opacity={0.06} />
        <Blob color={T.secondary} size={180} bottom={-30} left={-20} opacity={0.04} />
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 800, padding: "5px 14px", borderRadius: 50, background: T.primary + "20", color: T.primary }}>Szkoła podstawowa</span>
            <span style={{ fontSize: 12, fontWeight: 800, padding: "5px 14px", borderRadius: 50, background: T.accent + "20", color: T.accent }}>Szkoła średnia</span>
            <span style={{ fontSize: 12, fontWeight: 800, padding: "5px 14px", borderRadius: 50, background: T.tertiary + "20", color: T.tertiary }}>Stacjonarnie</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.15, letterSpacing: -0.5, marginBottom: 12 }}>
            Oferta i <span style={{ color: T.primary }}>cennik</span>
          </h1>
          <p style={{ fontSize: 16, color: T.textMuted, fontWeight: 500, maxWidth: 520, lineHeight: 1.7, marginBottom: 16 }}>
            Trzy poziomy: szkoła podstawowa, średnia podstawa i średnia rozszerzenie. Zajęcia indywidualne, w parach lub małych grupach.
          </p>
          <a href="#kalkulator" style={{ fontSize: 13, fontWeight: 700, color: T.primary, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            Oblicz orientacyjną cenę w kalkulatorze ↓
          </a>
        </div>
      </section>

      {/* ===== 2. DLACZEGO WARTO ===== */}
      <Section alt>
        <SectionTitle sub="Inwestycja w edukację, która się zwraca.">
          Dlaczego warto <span style={{ color: T.primary }}>wybrać nas</span>
        </SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { icon: "📝", title: "Notatka po każdej lekcji", desc: "Rodzic i uczeń widzą co było przerabiane, jaki jest postęp i co powtórzyć. Zero zgadywania.", color: T.primary },
            { icon: "🔄", title: "Odrabianie odwołanych zajęć", desc: "Odwołujesz z wyprzedzeniem — lekcja nie przepada. Umawiasz nowy termin przez panel.", color: T.accent },
            { icon: "📊", title: "Przejrzyste rozliczenia", desc: "Wiesz ile płacisz, za co i kiedy. Przypomnienia, historia wpłat, brak niespodzianek.", color: T.tertiary },
            { icon: "🎯", title: "Dopasowane podejście", desc: "Każdy uczeń jest inny. Korepetytor dostosowuje tempo, materiał i metody do potrzeb.", color: T.secondary },
          ].map((item, i) => (
            <HoverCard key={i} style={{ padding: "24px 22px" }}>
              <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>{item.icon}</span>
              <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{item.title}</p>
              <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.7, fontWeight: 500 }}>{item.desc}</p>
            </HoverCard>
          ))}
        </div>
      </Section>

      {/* ===== 3. FORMY ZAJĘĆ ===== */}
      <Section>
        <SectionTitle sub="Trzy formy zajęć — każda z innym podejściem i stawką.">
          Formy <span style={{ color: T.primary }}>zajęć</span>
        </SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            {
              icon: "👤", title: "Indywidualnie", color: T.primary,
              priceMonth: "od 245 zł", perMonth: "/ miesiąc",
              features: ["Pełna personalizacja tempa", "Dopasowany materiał", "Notatka po każdej lekcji", "45 / 60 / 90 / 120 min"],
            },
            {
              icon: "👥", title: "W parze", color: T.accent, popular: true,
              priceMonth: "od 170 zł", perMonth: "/ miesiąc / os.",
              features: ["2 osoby na podobnym poziomie", "Wspólna nauka motywuje", "Niższa cena na osobę", "60 / 90 / 120 min"],
            },
            {
              icon: "👨‍👩‍👧‍👦", title: "Mała grupa", color: T.secondary,
              priceMonth: "od 120 zł", perMonth: "/ miesiąc / os.",
              features: ["Maks. 4 osoby", "Dynamika grupowa", "Najniższa stawka", "60 / 90 / 120 min"],
            },
          ].map((item, i) => {
            const [h, setH] = useState(false);
            return (
            <div key={i} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
              background: h ? T.surfaceHover : T.surface, borderRadius: 20, padding: "28px 24px",
              border: item.popular ? `2px solid ${item.color}40` : `1px solid ${T.cardBorder}`,
              position: "relative", overflow: "hidden",
              transition: "all 0.25s", transform: h ? "translateY(-3px)" : "none",
              boxShadow: h ? `0 8px 30px ${item.color}15` : "none",
            }}>
              {item.popular && (
                <div style={{
                  position: "absolute", top: 14, right: -28, background: item.color,
                  color: "#fff", fontSize: 10, fontWeight: 900, padding: "4px 36px",
                  transform: "rotate(35deg)", letterSpacing: 0.5, textTransform: "uppercase",
                }}>Popularne</div>
              )}
              <span style={{ fontSize: 36, display: "block", marginBottom: 12 }}>{item.icon}</span>
              <p style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{item.title}</p>
              <p style={{ fontSize: 28, fontWeight: 900, color: item.color, marginBottom: 2 }}>
                {item.priceMonth}
                <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, marginLeft: 4 }}>{item.perMonth}</span>
              </p>
              <div style={{ margin: "16px 0", height: 1, background: T.cardBorder }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {item.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.textMuted, fontWeight: 500 }}>
                    <span style={{ color: item.color, fontSize: 14, fontWeight: 900 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <HoverBtn primary={item.popular} style={{
                width: "100%", marginTop: 22, padding: "12px 0", borderRadius: 12,
                background: item.popular ? item.color : "transparent",
                color: item.popular ? "#fff" : item.color,
                border: item.popular ? "none" : `1.5px solid ${item.color}40`,
              }}>Umów spotkanie</HoverBtn>
            </div>
            );
          })}
        </div>
        <p style={{ fontSize: 11, color: T.textDim, fontWeight: 500, marginTop: 16, textAlign: "center", fontStyle: "italic" }}>
          Podane ceny orientacyjne — dokładna stawka zależy od przedmiotu, poziomu i korepetytora.
        </p>
      </Section>

      {/* ===== 4. KURSY SPECJALNE ===== */}
      <Section alt>
        <div style={{
          background: `linear-gradient(135deg, ${T.accent}15, ${T.secondary}10)`,
          borderRadius: 22, padding: "36px 32px",
          border: `1px solid ${T.accent}20`, position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${T.tertiary}, ${T.secondary})` }} />
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 400px" }}>
              <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>🚀</span>
              <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Kursy specjalne i okazyjne</h3>
              <p style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.7, fontWeight: 500, marginBottom: 16 }}>
                Intensywne programy sezonowe — powtórki przed maturą, przygotowanie do egzaminu ósmoklasisty, warsztaty wakacyjne. Zamknięte grupy z konkretnym celem i harmonogramem.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Maturalne", "Egzamin 8-kl.", "Wakacyjne", "Weekendowe"].map(tag => (
                  <span key={tag} style={{ fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 10, background: T.tertiary + "18", color: T.tertiary }}>{tag}</span>
                ))}
              </div>
            </div>
            <div style={{ flex: "0 0 auto" }}>
              <button style={{
                background: T.tertiary, color: "#1a1400", border: "none", borderRadius: 14,
                padding: "14px 32px", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
              }}>Zapytaj o terminy →</button>
            </div>
          </div>
        </div>
      </Section>

      {/* ===== 5. KALKULATOR ===== */}
      <Section id="kalkulator">
        <SectionTitle sub="Wybierz przedmiot, poziom i formę — zobaczysz orientacyjną cenę.">
          Kalkulator <span style={{ color: T.primary }}>ceny</span>
        </SectionTitle>

        <div style={{ background: T.surface, borderRadius: 22, border: `1px solid ${T.cardBorder}`, padding: "28px 24px" }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: T.textDim, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>Przedmiot</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
            {subjects.map(s => (
              <Chip key={s.name} active={selSubject === s.name} color={s.color} onClick={() => setSelSubject(s.name)}>
                <span style={{ fontSize: 15 }}>{s.icon}</span> {s.name}
              </Chip>
            ))}
          </div>

          <p style={{ fontSize: 12, fontWeight: 800, color: T.textDim, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>Poziom</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
            {levels.map(l => (
              <Chip key={l.key} active={selLevel.key === l.key} onClick={() => setSelLevel(l)}>{l.short}</Chip>
            ))}
          </div>

          <p style={{ fontSize: 12, fontWeight: 800, color: T.textDim, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>Forma zajęć</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
            {forms.map(f => (
              <Chip key={f.key} active={selForm.key === f.key} onClick={() => setSelForm(f)}>
                <span style={{ fontSize: 15 }}>{f.icon}</span> {f.label}
              </Chip>
            ))}
          </div>

          <p style={{ fontSize: 12, fontWeight: 800, color: T.textDim, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>Czas trwania</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {durations.map(d => (
              <Chip key={d} active={selDuration === d} onClick={() => setSelDuration(d)}>{d} min</Chip>
            ))}
          </div>

          {/* Result */}
          <div style={{
            background: `linear-gradient(135deg, ${(selSubjectData?.color || T.primary)}12, ${T.accent}08)`,
            borderRadius: 16, padding: "24px 28px",
            border: `1px solid ${(selSubjectData?.color || T.primary)}20`,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, margin: 0 }}>
                {selSubject} · {selLevel.short} · {selForm.label} · {selDuration} min
              </p>
              <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: `1px solid ${T.cardBorder}` }}>
                <button onClick={() => setPriceMode("month")} style={{
                  padding: "5px 14px", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit",
                  background: priceMode === "month" ? T.primary + "25" : "transparent",
                  color: priceMode === "month" ? T.primary : T.textDim,
                }}>/ miesiąc</button>
                <button onClick={() => setPriceMode("lesson")} style={{
                  padding: "5px 14px", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit",
                  background: priceMode === "lesson" ? T.primary + "25" : "transparent",
                  color: priceMode === "lesson" ? T.primary : T.textDim,
                  borderLeft: `1px solid ${T.cardBorder}`,
                }}>/ lekcja</button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <p style={{ fontSize: 36, fontWeight: 900, color: T.text, margin: 0 }}>
                  {priceMode === "month"
                    ? `${price.perMonth[0]}–${price.perMonth[1]}`
                    : `${price.perLesson[0]}–${price.perLesson[1]}`}{" "}
                  <span style={{ fontSize: 16, fontWeight: 600, color: T.textMuted }}>
                    zł {priceMode === "month" ? "/ miesiąc" : "/ lekcja"}
                  </span>
                </p>
                <p style={{ fontSize: 11, color: T.textDim, fontWeight: 500, marginTop: 6, fontStyle: "italic" }}>
                  Dokładna cena ustalana indywidualnie
                </p>
              </div>
              <button style={{
                background: T.primary, color: "#fff", border: "none", borderRadius: 14,
                padding: "13px 28px", fontSize: 14, fontWeight: 800, cursor: "pointer",
                fontFamily: "inherit", boxShadow: `0 4px 16px ${T.primary}30`, whiteSpace: "nowrap",
              }}>Umów spotkanie →</button>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 11, color: T.textDim, fontWeight: 500, textAlign: "center", marginTop: 12, fontStyle: "italic" }}>
          Podane ceny mają charakter orientacyjny. Ostateczna stawka ustalana jest na spotkaniu organizacyjnym.
        </p>
      </Section>

      {/* ===== 6. NASZE PRZEDMIOTY ===== */}
      <Section alt>
        <SectionTitle sub="Kliknij przedmiot, żeby zobaczyć szczegóły — zakres materiału, dostępne poziomy i szkoły.">
          Nasze <span style={{ color: T.primary }}>przedmioty</span>
        </SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {subjectsFull.map((s, i) => {
            const isOpen = expandedSubject === i;
            return (
              <div key={i} style={{
                background: T.surface, borderRadius: "4px 18px 18px 4px", overflow: "hidden",
                border: `1px solid ${T.cardBorder}`, borderLeft: `4px solid ${s.color}`,
              }}>
                <button onClick={() => setExpandedSubject(isOpen ? null : i)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "18px 20px", background: "transparent", border: "none",
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <span style={{ flex: 1, fontSize: 16, fontWeight: 800, color: T.text }}>{s.name}</span>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {s.levels.map(l => (
                      <span key={l} style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                        background: s.color + "15", color: s.color, textTransform: "uppercase", letterSpacing: 0.3,
                      }}>{l}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: 10, color: T.textDim, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none", marginLeft: 4 }}>▼</span>
                </button>
                <div style={{
                  maxHeight: isOpen ? 300 : 0, overflow: "hidden",
                  transition: "max-height 0.35s ease, opacity 0.3s ease",
                  opacity: isOpen ? 1 : 0,
                }}>
                  <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${T.cardBorder}` }}>
                    <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.7, fontWeight: 500, marginTop: 16, marginBottom: 14 }}>{s.desc}</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      {s.schoolLevels.map(sl => (
                        <span key={sl} style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 8, background: T.accent + "15", color: T.accent }}>{sl}</span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {s.topics.map(t => (
                        <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 8, background: T.bgAlt, color: T.textMuted }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { name: "Włoski", icon: "🇮🇹", color: "#EF4444", status: "W planie" },
            { name: "Niemiecki", icon: "🇩🇪", color: "#FBBF24", status: "W przygotowaniu" },
          ].map((s, i) => (
            <div key={i} style={{
              background: T.surface, borderRadius: 14, padding: "14px 18px",
              border: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 12,
              opacity: 0.65, flex: "1 1 240px",
            }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: T.text, flex: 1 }}>{s.name}</span>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 12px", borderRadius: 20, background: T.tertiary + "20", color: T.tertiary, textTransform: "uppercase" }}>{s.status}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ===== CTA ===== */}
      <section style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, padding: "56px 0" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 8 }}>Nie wiesz co wybrać?</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 28, fontWeight: 500, maxWidth: 420, margin: "0 auto 28px" }}>
            Umów bezpłatne spotkanie — pomożemy dobrać przedmiot, formę i korepetytora.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; }} onMouseLeave={e => { e.target.style.transform = "none"; }} style={{ background: "#fff", color: T.primaryDark, border: "none", borderRadius: 14, padding: "14px 32px", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "transform 0.15s" }}>Umów spotkanie →</button>
            <button onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; e.target.style.background = "rgba(255,255,255,0.25)"; }} onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.background = "rgba(255,255,255,0.15)"; }} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 14, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>Zadzwoń</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0F1120", padding: "24px 0", borderTop: `1px solid ${T.cardBorder}` }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 900 }}>EDU <span style={{ color: T.primary }}>LUZ</span></span>
          <span style={{ fontSize: 11, color: T.textDim }}>© 2026 EDU LUZ Edukacja Na Luzie</span>
        </div>
      </footer>
    </div>
  );
}
