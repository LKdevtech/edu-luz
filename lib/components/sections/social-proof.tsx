import { Container } from "@/lib/components/ui/container";

// PLACEHOLDER (sekcja 7) — właściciel uzupełni rzeczywiste liczby.
const STATS = [
  { value: "200+", label: "zadowolonych uczniów" },
  { value: "8 lat", label: "doświadczenia" },
  { value: "95%", label: "zdawalności matur" },
  { value: "6", label: "przedmiotów w ofercie" },
];

// Social proof — sekcja 6.1.4.
export function SocialProof() {
  return (
    <section className="bg-alt py-20 md:py-24">
      <Container>
        <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-4xl font-black text-transparent md:text-5xl">
                {stat.value}
              </span>
              <span className="text-sm text-secondary">{stat.label}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
