import type { Metadata } from "next";

import { LoginScreen } from "@/lib/components/sections/login-screen";

export const metadata: Metadata = {
  title: "Logowanie — EDU LUZ",
  description: "Zaloguj się do panelu EDU LUZ — korepetytorzy, rodzice i uczniowie.",
};

// Logowanie (/login) — poza grupą (public): bez navbara i footera.
export default function LoginPage() {
  return <LoginScreen />;
}
