import type { Metadata } from "next";
import { Baloo_Bhaina_2, Nunito } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const baloo = Baloo_Bhaina_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["600"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Actus IA | El Conocimiento Industrial Permanente",
  description: "Actus IA: El agente inteligente que captura, organiza y aplica el conocimiento de mantenimiento industrial.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es" className={`${baloo.variable} ${nunito.variable} h-full antialiased`}>
        <body className="min-h-full">{children}</body>
      </html>
    </ClerkProvider>
  );
}
