import { Badge, type BadgeProps } from "@/lib/components/ui/badge";
import { Container } from "@/lib/components/ui/container";

interface Subject {
  variant: NonNullable<BadgeProps["variant"]>;
  label: string;
}

// Przedmioty — kolory z sekcji 3.4.
const SUBJECTS: Subject[] = [
  { variant: "matematyka", label: "Matematyka" },
  { variant: "angielski", label: "Angielski" },
  { variant: "fizyka", label: "Fizyka" },
  { variant: "chemia", label: "Chemia" },
  { variant: "polski", label: "Polski" },
  { variant: "elektrotechnika", label: "Elektrotechnika" },
];

// Formy zajęć — sekcja 6.2.2.
const FORMS = [
  {
    title: "Zajęcia indywidualne",
    description:
      "Jeden na jeden z korepetytorem — maksymalne skupienie i tempo dopasowane do ucznia.",
  },
  {
    title: "Zajęcia w parze",
    description:
      "Nauka we dwoje — niższa cena za osobę, większa motywacja i zdrowa rywalizacja.",
  },
  {
    title: "Zajęcia grupowe (3–4 osoby)",
    description:
      "Małe grupy, wspólne rozwiązywanie zadań i najlepszy stosunek ceny do efektu.",
  },
  {
    title: "Kursy specjalne",
    description:
      "Intensywne przygotowanie do egzaminu ósmoklasisty oraz matury.",
  },
];

// Przedmioty + rozwijane formy zajęć — sekcja 6.1.3.
export function Subjects() {
  return (
    <section className="py-20 md:py-24">
      <Container>
        <div className="mb-10 text-center">
          <h2 className="text-h2">Czego uczymy</h2>
          <p className="mt-3 text-body text-secondary">
            Sześć przedmiotów, od szkoły podstawowej po maturę rozszerzoną.
          </p>
        </div>

        <ul className="mb-16 flex flex-wrap justify-center gap-3">
          {SUBJECTS.map((subject) => (
            <li key={subject.variant}>
              <Badge variant={subject.variant} className="text-sm normal-case">
                {subject.label}
              </Badge>
            </li>
          ))}
        </ul>

        <div className="mx-auto max-w-2xl">
          <h3 className="mb-5 text-center text-h3 text-primary">Formy zajęć</h3>
          <div className="flex flex-col gap-3">
            {FORMS.map((form) => (
              <details
                key={form.title}
                className="group rounded-card border border-subtle bg-surface px-5 transition-colors hover:border-primary/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-bold text-primary [&::-webkit-details-marker]:hidden">
                  {form.title}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0 text-secondary transition-transform duration-200 group-open:rotate-180"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-secondary">
                  {form.description}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
