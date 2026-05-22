import type { Config } from "tailwindcss";

/**
 * EDU LUZ — Design System "Ciemne z życiem" (Wariant A).
 * Paleta i tokeny zgodne z sekcją 3 CLAUDE.md.
 *
 * Uwaga o przestrzeniach nazw kolorów:
 * - `colors` zawiera akcenty (primary, secondary, ...), tła i kolory przedmiotów.
 *   Klasy typu `bg-primary`, `bg-secondary`, `border-subtle` używają tej palety.
 * - `textColor` nadpisuje `text-primary` / `text-secondary` / `text-dim` na neutralną
 *   skalę tekstu czytelnego z tabeli 3.2 (kremowy / szary / przygaszony).
 *   Dla niebieskiego tekstu (linki) użyj `text-link`.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tła (tryb ciemny) — sekcja 3.2
        main: "#151827", // bg-main
        alt: "#1C2035", // bg-alt
        surface: {
          DEFAULT: "#232840", // bg-surface
          hover: "#2A3050", // bg-surface-hover
        },
        // Obramowania
        subtle: "rgba(59,143,240,0.10)", // border-subtle

        // Kolory akcentowe — sekcja 3.3
        primary: {
          DEFAULT: "#3B8FF0", // CTA, linki, akcje główne
          dark: "#2D7DE8", // hover na primary
        },
        secondary: "#FF6F4A", // pomarańczowy — wyróżnienia
        tertiary: "#FFCA28", // żółty — oczekujące
        accent: "#7C5CFC", // fioletowy — kontrpropozycje
        success: "#22C55E", // zrealizowane, aktywne
        cyan: "#06B6D4", // info
        danger: "#EF4444", // błędy
        pink: "#E84393", // polski (przedmiot)

        // Kolory przedmiotów — sekcja 3.4
        subject: {
          matematyka: "#3B8FF0",
          angielski: "#06B6D4",
          fizyka: "#F59E0B",
          chemia: "#22C55E",
          polski: "#E84393",
          elektrotechnika: "#FF6F4A",
        },
      },

      // Neutralna skala tekstu (sekcja 3.2) — nadpisuje akcenty dla utili text-*
      textColor: {
        primary: "#F0EDE6", // text-primary
        secondary: "#9B97AF", // text-secondary
        dim: "#6B6780", // text-dim
        link: "#3B8FF0", // niebieski tekst / linki
      },

      fontFamily: {
        // Nunito ładowany w app/layout.tsx przez next/font/google
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },

      // Border-radius — sekcja 3.7
      borderRadius: {
        btn: "12px",
        card: "16px",
        input: "10px",
      },

      // Cienie / poświaty — sekcja 3.6
      boxShadow: {
        card: "0 8px 24px rgba(59,143,240,0.12)",
        glow: "0 0 20px rgba(59,143,240,0.3)",
      },

      // Skala typografii — sekcja 3.5
      fontSize: {
        h1: ["3.25rem", { lineHeight: "1.1", fontWeight: "900" }], // 52px
        h2: ["2.125rem", { lineHeight: "1.2", fontWeight: "800" }], // 34px
        h3: ["1.4375rem", { lineHeight: "1.3", fontWeight: "700" }], // 23px
        body: ["1rem", { lineHeight: "1.6" }], // 16px
        caption: ["0.8125rem", { lineHeight: "1.4", fontWeight: "600" }], // 13px
        pill: ["0.75rem", { lineHeight: "1", fontWeight: "700" }], // 12px
      },
    },
  },
  plugins: [],
};
export default config;
