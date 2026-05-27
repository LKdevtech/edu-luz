import type { Metadata } from "next";

import { LoginScreen } from "@/lib/components/sections/login-screen";

export const metadata: Metadata = {
  title: "Logowanie",
  description: "Zaloguj się do panelu EDU LUZ — korepetytorzy, rodzice i uczniowie.",
  // Panel logowania nie powinien trafiać do wyszukiwarek.
  robots: { index: false, follow: false },
};

// Logowanie (/login) — poza grupą (public): bez navbara i footera.
export default function LoginPage() {
  return (
    <main>
      <LoginScreen />
    </main>
  );
}
