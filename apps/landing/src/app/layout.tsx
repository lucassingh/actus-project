import type { Metadata } from "next";
import { Baloo_Bhaina_2, Nunito } from "next/font/google";
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
  description: "Actus IA: El agente inteligente que captura, organiza y aplica el conocimiento de mantenimiento industrial. Evite la pérdida de know-how y reduzca el MTTR.",
  keywords: ["Mantenimiento Industrial", "Inteligencia Artificial", "Gestión del Conocimiento", "Actus IA", "Mantenimiento Predictivo", "SaaS Industrial"],
  openGraph: {
    title: "Actus IA | El Conocimiento Industrial Permanente",
    description: "Transforme la experiencia de sus técnicos en un activo digital permanente.",
    type: "website",
    locale: "es_ES",
    siteName: "Actus IA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${baloo.variable} ${nunito.variable} antialiased font-sans bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
