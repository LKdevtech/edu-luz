import { ExpandableFormatCard, type LessonFormat } from "./expandable-format-card";
import { Section, SectionTitle } from "./section";

// "Jak pracujemy" — formy zajęć (mockup FORMY ZAJĘĆ).
const FORMATS: LessonFormat[] = [
  {
    emoji: "👤",
    title: "Indywidualnie",
    desc: "1 na 1 z korepetytorem. Pełna personalizacja tempa, materiału i podejścia.",
    tags: ["45 min", "60 min", "90 min", "120 min"],
    color: "#3B8FF0",
    details:
      "Korepetytor dopasowuje materiał do poziomu i celów ucznia. Idealne dla osób potrzebujących intensywnego nadrobienia zaległości lub przygotowania do poprawy sprawdzianów i testów. Personalizacja całego planu nauczania i zajęć.",
  },
  {
    emoji: "👥",
    title: "W parze",
    desc: "2 osoby na podobnym poziomie. Wspólna nauka motywuje, a cena jest niższa.",
    tags: ["60 min", "90 min", "120 min"],
    color: "#7C5CFC",
    details:
      "Dobieramy pary o zbliżonym poziomie i celach. Uczą się nie tylko od korepetytora, ale też od siebie nawzajem — koszt dzieli się na dwie osoby. Świetna opcja dla znajomych lub osób, które przygotowują się do egzaminów ósmoklasisty lub maturalnych.",
  },
  {
    emoji: "👨‍👩‍👧‍👦",
    title: "Mała grupa",
    desc: "Do 4 osób. Dynamika grupowa, dyskusja i najniższa stawka za godzinę.",
    tags: ["60 min", "90 min", "120 min"],
    color: "#FF6F4A",
    details:
      "Grupy maksymalnie 4-osobowe. Każdemu poświęcamy uwagę i dbamy o wszystkich członków grupy. Idealne na bieżące powtórki jako dodatek do zajęć w szkole i przygotowania do egzaminów ósmoklasisty oraz matur.",
  },
  {
    emoji: "🚀",
    title: "Kursy specjalne",
    desc: "Intensywne programy sezonowe — przed maturą, na wakacje, przed egzaminem ósmoklasisty.",
    tags: ["weekendowe", "wakacyjne", "maturalne", "egzamin 8-kl."],
    color: "#FFCA28",
    details:
      "Kursy zamknięte z konkretnym celem i harmonogramem. Intensywne powtórki przed maturą, przygotowanie do egzaminu ósmoklasisty, letnie warsztaty uzupełniające braki. O terminy i dostępne w najbliższym czasie kursy można wysłać zapytanie lub zapisać się na listę oczekujących.",
    special: true,
  },
];

export function LessonFormats() {
  return (
    <Section alt>
      <SectionTitle sub="Dopasowujemy formę zajęć do potrzeb ucznia i budżetu rodzica. Wszystkie zajęcia stacjonarnie w naszym centrum.">
        Jak pracujemy
      </SectionTitle>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {FORMATS.map((item) => (
          <ExpandableFormatCard key={item.title} item={item} />
        ))}
      </div>
    </Section>
  );
}
