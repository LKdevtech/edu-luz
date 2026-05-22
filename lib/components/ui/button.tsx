import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

// Interactive animations follow CLAUDE.md sekcja 3.6:
// primary -> hover scale 1.03 + glow, active scale 0.98, 0.25s transition.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-btn font-extrabold whitespace-nowrap transition-all duration-[250ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-main active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white hover:bg-primary-dark hover:scale-[1.03] hover:shadow-glow",
        secondary:
          "bg-secondary text-white hover:scale-[1.03] hover:brightness-105",
        outline:
          "border border-primary/60 bg-transparent text-link hover:border-primary hover:bg-primary/10",
        ghost:
          "bg-transparent text-secondary hover:bg-surface hover:text-primary",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-[15px]",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
