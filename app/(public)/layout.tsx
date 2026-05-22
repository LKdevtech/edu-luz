import type { ReactNode } from "react";

import { Footer } from "@/lib/components/layout/footer";
import { Navbar } from "@/lib/components/layout/navbar";

// Layout strony publicznej — navbar + footer wokół treści podstron (sekcja 4).
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
