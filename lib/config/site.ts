/**
 * Konfiguracja strony publicznej — nawigacja i dane kontaktowe.
 * Dane kontaktowe to PLACEHOLDERY (sekcja 7 CLAUDE.md) — do uzupełnienia
 * przez właściciela.
 */

export interface NavLink {
  href: string;
  label: string;
}

// Nawigacja główna. "Strona główna" jest bardziej intuicyjna niż klik w logo.
export const NAV_LINKS: readonly NavLink[] = [
  { href: "/", label: "Strona główna" },
  { href: "/oferta", label: "Oferta i cennik" },
  { href: "/o-nas", label: "O nas" },
  { href: "/kontakt", label: "Kontakt" },
];

// Linki prawne — placeholdery (strony powstaną później).
export const LEGAL_LINKS: readonly NavLink[] = [
  { href: "#", label: "Regulamin" },
  { href: "#", label: "Polityka prywatności" },
];

// Dane firmy i kontakt — PLACEHOLDERY (sekcja 7).
export const SITE = {
  name: "EDU LUZ",
  tagline: "Nowoczesna edukacja, zero stresu",
  city: "Tomaszów Mazowiecki",
  address: "ul. — (do uzupełnienia)",
  phone: "+48 — (do uzupełnienia)",
  email: "kontakt@eduluz.pl",
  hours: "Godziny otwarcia — (do uzupełnienia)",
} as const;

/** Czy dany link nawigacji jest aktywny dla bieżącej ścieżki. */
export function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
