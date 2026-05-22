import Link from "next/link";

import { buttonVariants } from "@/lib/components/ui/button";
import { Card } from "@/lib/components/ui/card";
import { Container } from "@/lib/components/ui/container";
import { cn } from "@/lib/utils/cn";

// CTA końcowe — sekcja 6.1.5.
export function FinalCta() {
  return (
    <section className="py-20 md:py-24">
      <Container size="md">
        <Card className="relative overflow-hidden p-10 text-center md:p-16">
          {/* Dekoracyjny blob — sekcja 3.6 */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary opacity-[0.10] blur-[70px]"
          />
          <h2 className="text-h2">Umów bezpłatną konsultację</h2>
          <p className="mx-auto mt-3 max-w-md text-body text-secondary">
            Porozmawiajmy o celach Twojego dziecka i dobierzmy korepetytora bez
            żadnych zobowiązań.
          </p>
          <Link
            href="/kontakt"
            className={cn(buttonVariants({ size: "lg" }), "mt-8")}
          >
            Umów bezpłatną konsultację
          </Link>
        </Card>
      </Container>
    </section>
  );
}
