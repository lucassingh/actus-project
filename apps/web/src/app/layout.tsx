import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esUY } from "@clerk/localizations";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Actus IA | El Conocimiento Industrial Permanente",
  description: "Actus IA: El agente inteligente que captura, organiza y aplica el conocimiento de mantenimiento industrial.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={esUY}
      appearance={{
        cssLayerName: "clerk",
        variables: {
          colorPrimary: "#242F5B",
          colorForeground: "#0E1123",
          colorMutedForeground: "#6B7085",
          colorBorder: "#E4E4E9",
          colorInput: "#FFFFFF",
          colorBackground: "#FFFFFF",
          colorDanger: "#B42626",
          fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
          borderRadius: "0.375rem",
          fontSize: "14px",
        },
      }}
    >
      <html lang="es" className={`${montserrat.variable} ${inter.variable} h-full antialiased`}>
        <body className="min-h-full">{children}</body>
      </html>
    </ClerkProvider>
  );
}
