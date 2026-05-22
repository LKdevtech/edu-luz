import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

// Nunito (Google Fonts), wagi 400–900 — sekcja 1 / 3.5 CLAUDE.md.
// latin-ext = poprawne polskie znaki diakrytyczne (ą, ę, ł, ...).
const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EDU LUZ — Korepetycje w Tomaszowie Mazowieckim",
  description:
    "Centrum korepetycji EDU LUZ. Nowoczesna edukacja, zero stresu — matematyka, angielski, fizyka, chemia, polski i elektrotechnika.",
};

// Strona publiczna = ZAWSZE tryb ciemny (sekcja 3.1) → klasa `dark` na <html>.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${nunito.variable} dark`}>
      <body className="min-h-screen bg-main font-sans text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
