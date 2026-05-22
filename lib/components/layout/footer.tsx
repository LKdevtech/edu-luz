import Link from "next/link";

import { NAV_LINKS } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

import { Logo } from "./logo";

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3.5 text-[12px] font-extrabold uppercase tracking-[1px] text-secondary">
      {children}
    </p>
  );
}

const linkClass =
  "block text-[13px] font-medium text-dim transition-colors hover:text-secondary";

// Footer — odwzorowanie mockupu (4 kolumny, ciemniejsze tło #0F1120).
export function Footer() {
  return (
    <footer className="border-t border-subtle bg-[#0F1120] pb-8 pt-14">
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="mb-10 grid gap-9 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          {/* Marka + adres */}
          <div>
            <Logo markSize={32} textClassName="text-[16px]" className="mb-4 gap-2.5" />
            <p className="text-[13px] font-medium leading-[1.7] text-dim">
              Edukacja Na Luzie
              <br />
              ul. [adres placeholder]
              <br />
              Tomaszów Mazowiecki
            </p>
          </div>

          {/* Nawigacja */}
          <div>
            <FooterHeading>Nawigacja</FooterHeading>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={cn(linkClass, "mb-2.5")}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Kontakt */}
          <div>
            <FooterHeading>Kontakt</FooterHeading>
            <p className="text-[13px] font-medium leading-[2] text-dim">
              📞 +48 [telefon]
              <br />
              ✉️ kontakt@eduluz.pl
              <br />
              📍 Tomaszów Mazowiecki
            </p>
          </div>

          {/* Dla uczniów */}
          <div>
            <FooterHeading>Dla uczniów</FooterHeading>
            <Link href="/login" className={cn(linkClass, "mb-2.5")}>
              Zaloguj się do panelu
            </Link>
            <Link href="/blog" className={cn(linkClass, "mb-2.5")}>
              Jak korzystać z panelu?
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3 border-t border-subtle pt-6">
          <p className="text-[11px] font-medium text-dim">
            © 2026 EDU LUZ Edukacja Na Luzie. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex gap-5">
            <Link href="#" className="text-[11px] font-medium text-dim transition-colors hover:text-secondary">
              Polityka prywatności
            </Link>
            <Link href="#" className="text-[11px] font-medium text-dim transition-colors hover:text-secondary">
              Regulamin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
