"use client";
import CardNav, { type CardNavItem } from "@/components/reactbits/CardNav";

const items: CardNavItem[] = [
  {
    label: "Producto",
    bgColor: "#181F3B",
    textColor: "#E6E8F2",
    links: [
      { label: "El desafío", href: "#desafio", ariaLabel: "Ir a El desafío" },
      { label: "La solución", href: "#solucion", ariaLabel: "Ir a La solución" },
    ],
  },
  {
    label: "Empresa",
    bgColor: "#242F5B",
    textColor: "#FFFFFF",
    links: [
      { label: "Preguntas frecuentes", href: "#faq", ariaLabel: "Ir a Preguntas frecuentes" },
      { label: "Contacto", href: "#contacto", ariaLabel: "Ir a Contacto" },
    ],
  },
  {
    label: "Cuenta",
    bgColor: "#EA580E",
    textColor: "#0A0D1A",
    links: [
      { label: "Iniciar sesión", href: "/sign-in", ariaLabel: "Iniciar sesión en Actus" },
      { label: "Agendar demo", href: "#contacto", ariaLabel: "Agendar una demo" },
    ],
  },
];

export function Navbar() {
  return (
    <CardNav
      logo="/logos/logo-bg-black.svg"
      logoAlt="Actus IA"
      items={items}
      ctaLabel="Agendar demo"
      ctaHref="#contacto"
      baseColor="rgba(16, 21, 42, 0.92)"
      menuColor="#E6E8F2"
      buttonBgColor="#EA580E"
      buttonTextColor="#0A0D1A"
      className="[&_nav]:ring-1 [&_nav]:ring-white/10"
    />
  );
}
