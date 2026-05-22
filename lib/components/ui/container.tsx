import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

// Centered, responsive content wrapper. Horizontal padding is mobile-first
// (sekcja 3.1); vertical section padding stays with each section.
const containerVariants = cva("mx-auto w-full px-6 sm:px-8 lg:px-12", {
  variants: {
    size: {
      sm: "max-w-3xl",
      md: "max-w-5xl",
      lg: "max-w-6xl",
      full: "max-w-none",
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, ...props }, ref) => (
    <div ref={ref} className={cn(containerVariants({ size }), className)} {...props} />
  ),
);
Container.displayName = "Container";

export { Container, containerVariants };
