import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

// Pill / badge — sekcja 3.5 (12px, waga 700) + paleta z 3.3 / 3.4.
// Soft style: kolorowy tekst na półprzezroczystym tle z subtelnym obramowaniem.
// Uwaga: text-primary/secondary są nadpisane na neutralne (sekcja 3.2),
// więc dla niebieskiego/pomarańczowego używamy text-link / wartości arbitralnej.
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-pill uppercase tracking-wide",
  {
    variants: {
      variant: {
        primary: "border-primary/20 bg-primary/10 text-link",
        secondary: "border-secondary/20 bg-secondary/10 text-[#FF6F4A]",
        tertiary: "border-tertiary/20 bg-tertiary/10 text-tertiary",
        accent: "border-accent/20 bg-accent/10 text-accent",
        success: "border-success/20 bg-success/10 text-success",
        cyan: "border-cyan/20 bg-cyan/10 text-cyan",
        danger: "border-danger/20 bg-danger/10 text-danger",
        pink: "border-pink/20 bg-pink/10 text-pink",
        neutral: "border-subtle bg-surface text-secondary",
        // Kolory przedmiotów — sekcja 3.4
        matematyka:
          "border-subject-matematyka/20 bg-subject-matematyka/10 text-subject-matematyka",
        angielski:
          "border-subject-angielski/20 bg-subject-angielski/10 text-subject-angielski",
        fizyka: "border-subject-fizyka/20 bg-subject-fizyka/10 text-subject-fizyka",
        chemia: "border-subject-chemia/20 bg-subject-chemia/10 text-subject-chemia",
        polski: "border-subject-polski/20 bg-subject-polski/10 text-subject-polski",
        elektrotechnika:
          "border-subject-elektrotechnika/20 bg-subject-elektrotechnika/10 text-subject-elektrotechnika",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
