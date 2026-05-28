/**
 * Stałe SEO współdzielone przez root layout, sitemap, robots i OG image.
 * SITE_URL jest brany z NEXT_PUBLIC_SITE_URL; w developmencie domyślnie edu-luz.com
 * — na produkcji ustaw zmienną na docelową domenę.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://edu-luz.com";

export const SITE_NAME = "EDU LUZ";

export const SITE_TITLE_DEFAULT = `${SITE_NAME} — Korepetycje w Tomaszowie Mazowieckim`;

export const SITE_DESCRIPTION =
  "Centrum korepetycji EDU LUZ w Tomaszowie Mazowieckim. Nowoczesna edukacja, zero stresu — matematyka, angielski, fizyka, chemia, polski i elektrotechnika.";

export const SITE_KEYWORDS = [
  "korepetycje",
  "Tomaszów Mazowiecki",
  "matematyka",
  "angielski",
  "fizyka",
  "chemia",
  "polski",
  "elektrotechnika",
  "matura",
  "egzamin ósmoklasisty",
  "korepetycje online",
  "centrum korepetycji",
];
