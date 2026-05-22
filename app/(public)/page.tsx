import Link from "next/link";

import { Badge } from "@/lib/components/ui/badge";
import { buttonVariants } from "@/lib/components/ui/button";
import { Container } from "@/lib/components/ui/container";

// Landing page (/). Pełna implementacja w Kroku 4 (sekcja 6.1).
// Na razie placeholder demonstrujący komponenty bazowe z Kroku 2.
export default function HomePage() {
  return (
    <Container
      size="sm"
      className="flex min-h-screen flex-col items-center justify-center gap-5 text-center"
    >
      <Badge variant="primary">EDU LUZ</Badge>
      <h1 className="text-h1">Korepetycje bez stresu, na serio</h1>
      <p className="text-body text-secondary">
        Nowoczesna edukacja, zero stresu. Strona w budowie — landing page
        powstanie w Kroku 4.
      </p>
      {/* CTA jako link ostylowany wariantami przycisku (wzorzec shadcn/ui). */}
      <Link href="/oferta" className={buttonVariants({ size: "lg" })}>
        Sprawdź ofertę
      </Link>
    </Container>
  );
}
