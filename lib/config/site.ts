/**
 * Konfiguracja strony publicznej — nawigacja i dane kontaktowe.
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

// Linki prawne — podstrony regulamin + polityka prywatności.
export const LEGAL_LINKS: readonly NavLink[] = [
  { href: "/regulamin", label: "Regulamin" },
  { href: "/polityka-prywatnosci", label: "Polityka prywatności" },
];

// Dane firmy i kontakt — jedyne źródło prawdy.
export const SITE = {
  name: "EDU LUZ",
  tagline: "Nowoczesna edukacja, zero stresu",
  city: "Tomaszów Mazowiecki",
  addressLine1: "Tomax lok. 209C (drugie piętro)",
  addressLine2: "ul. P.O.W. 17, 97-200 Tomaszów Mazowiecki",
  phone: "604 607 934",
  phoneTel: "+48604607934",
  email: "kontakt@edu-luz.com",
  hours: {
    weekdays: "Poniedziałek – Piątek: 7:30 – 22:00",
    saturday: "Sobota: 9:00 – 21:00",
    sunday: "Niedziela: 10:00 – 21:00",
  },
} as const;

// Dane podmiotu prowadzącego — administrator danych (RODO) i strona umowy
// świadczenia usług elektronicznych. Używane w polityce prywatności i regulaminie.
export const COMPANY = {
  legalName: "LK&P Services Sp. z o.o.",
  nip: "7732515612",
  krs: "0001221728",
  regon: "543892038",
  representative: "Kacper Luchowski, Prezes Zarządu",
  // Adres rejestrowy — jeśli różny od adresu siedziby, podmień osobno.
  registeredAddress: {
    line1: "Tomax lok. 209C (drugie piętro)",
    line2: "ul. P.O.W. 17, 97-200 Tomaszów Mazowiecki",
  },
} as const;

// Data ostatniej aktualizacji dokumentów prawnych — wyświetlana na obu podstronach.
// Aktualizuj przy każdej znaczącej zmianie regulaminu lub polityki.
export const LEGAL_UPDATED_AT = "2026-05-27";

/** Czy dany link nawigacji jest aktywny dla bieżącej ścieżki. */
export function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
