import type { ReactNode } from "react";

import { Card } from "@/lib/components/ui/card";
import { Container } from "@/lib/components/ui/container";
import { cn } from "@/lib/utils/cn";

interface UspItem {
  title: string;
  description: string;
  icon: ReactNode;
  /** Tailwind classes for the icon tile (tint bg + matching text). */
  accent: string;
}

const iconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const USP_ITEMS: UspItem[] = [
  {
    title: "Indywidualne podejście",
    description:
      "Plan nauki dopasowany do tempa, poziomu i celów każdego ucznia.",
    accent: "bg-primary/10 text-link",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
      </svg>
    ),
  },
  {
    title: "Wykwalifikowani korepetytorzy",
    description:
      "Doświadczeni nauczyciele i studenci kierunków ścisłych oraz humanistycznych.",
    accent: "bg-success/10 text-success",
    icon: (
      <svg {...iconProps}>
        <path d="M22 9 12 5 2 9l10 4 10-4z" />
        <path d="M6 11v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
      </svg>
    ),
  },
  {
    title: "Elastyczny harmonogram",
    description:
      "Zajęcia stacjonarne i online, terminy dopasowane do planu rodziny.",
    accent: "bg-tertiary/10 text-tertiary",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    title: "Przyjazna atmosfera",
    description:
      "Luz, motywacja i zero stresu — nauka, na którą uczniowie chcą wracać.",
    accent: "bg-accent/10 text-accent",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <path d="M9 9h.01M15 9h.01" />
      </svg>
    ),
  },
];

// USP — sekcja 6.1.2.
export function Usp() {
  return (
    <section className="bg-alt py-20 md:py-24">
      <Container>
        <div className="mb-12 text-center">
          <h2 className="text-h2">Dlaczego EDU LUZ</h2>
          <p className="mt-3 text-body text-secondary">
            Cztery rzeczy, które robimy inaczej niż klasyczne korepetycje.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {USP_ITEMS.map((item) => (
            <Card key={item.title} interactive className="p-6">
              <div
                className={cn(
                  "mb-4 grid h-12 w-12 place-items-center rounded-input",
                  item.accent,
                )}
              >
                {item.icon}
              </div>
              <h3 className="mb-2 text-h3 text-primary">{item.title}</h3>
              <p className="text-sm leading-relaxed text-secondary">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
