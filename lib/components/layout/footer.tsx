import Link from "next/link";

import { Container } from "@/lib/components/ui/container";
import { LEGAL_LINKS, NAV_LINKS, SITE } from "@/lib/config/site";

import { Logo } from "./logo";

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-caption uppercase tracking-wide text-dim">{children}</h3>
  );
}

const footerLinkClass =
  "text-sm text-secondary transition-colors hover:text-white";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-subtle bg-alt">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + adres */}
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="text-sm text-secondary">{SITE.tagline}</p>
            <p className="text-sm text-dim">
              {SITE.address}
              <br />
              {SITE.city}
            </p>
          </div>

          {/* Nawigacja */}
          <nav aria-label="Nawigacja w stopce">
            <FooterHeading>Nawigacja</FooterHeading>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kontakt */}
          <div>
            <FooterHeading>Kontakt</FooterHeading>
            <ul className="flex flex-col gap-2 text-sm text-secondary">
              <li>
                <a href={`tel:${SITE.phone.replace(/\s+/g, "")}`} className={footerLinkClass}>
                  {SITE.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className={footerLinkClass}>
                  {SITE.email}
                </a>
              </li>
              <li className="text-dim">{SITE.hours}</li>
            </ul>
          </div>

          {/* Informacje prawne */}
          <div>
            <FooterHeading>Informacje prawne</FooterHeading>
            <ul className="flex flex-col gap-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-subtle pt-6 text-caption text-dim">
          © {year} {SITE.name}. Wszelkie prawa zastrzeżone.
        </div>
      </Container>
    </footer>
  );
}
