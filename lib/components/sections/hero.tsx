import Link from "next/link";

import { Badge } from "@/lib/components/ui/badge";
import { buttonVariants } from "@/lib/components/ui/button";
import { Container } from "@/lib/components/ui/container";

// Hero — sekcja 6.1.1. Gradientowy nagłówek + dekoracyjne blur blobs (3.6).
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Dekoracyjne blur blobs — sekcja 3.6 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary opacity-[0.07] blur-[80px]" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-accent opacity-[0.06] blur-[80px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-secondary opacity-[0.05] blur-[70px]" />
      </div>

      <Container
        size="md"
        className="flex flex-col items-center gap-6 py-24 text-center md:py-32"
      >
        <Badge variant="primary">Centrum korepetycji · Tomaszów Mazowiecki</Badge>

        <h1 className="text-h1">
          Korepetycje bez stresu,{" "}
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            na serio
          </span>
        </h1>

        <p className="max-w-xl text-body text-secondary">
          Indywidualne podejście, wykwalifikowani korepetytorzy i przyjazna
          atmosfera. Pomagamy uczniom polubić naukę i osiągać wyniki.
        </p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link href="/oferta" className={buttonVariants({ size: "lg" })}>
            Sprawdź ofertę
          </Link>
          <Link
            href="/kontakt"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Umów konsultację
          </Link>
        </div>
      </Container>
    </section>
  );
}
