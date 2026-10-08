import { ArrowUp } from "lucide-react";

type FooterLink = { label: string; href?: string };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Producto",
    links: [
      { label: "El desafío", href: "#desafio" },
      { label: "La solución", href: "#solucion" },
      { label: "Preguntas frecuentes", href: "#faq" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Agendar demo", href: "#contacto" },
      { label: "Iniciar sesión", href: "/sign-in" },
      { label: "Crear cuenta", href: "/sign-up" },
    ],
  },
  {
    title: "Contacto",
    links: [
      { label: "soporte@actusagent.io", href: "mailto:soporte@actusagent.io" },
      { label: "Argentina" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-ink-950">
      <div className="relative z-10 mx-auto max-w-6xl px-5 pt-20 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-12">
          {/* Branding */}
          <div className="flex flex-col items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/logo-bg-black.svg" alt="Actus" className="h-11 w-auto" />
            <p className="mt-7 max-w-xs font-heading text-lg font-bold leading-snug text-ink-100">
              El conocimiento de su planta,
              <br />
              siempre disponible.
            </p>
          </div>

          {/* Link columns in an outlined box */}
          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-ink-700/60 sm:grid-cols-3">
            {columns.map((col, i) => (
              <div
                key={col.title}
                className={`p-6 md:p-8 ${i > 0 ? "border-t border-ink-700/60 sm:border-l sm:border-t-0" : ""}`}
              >
                <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-100">
                  {col.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href ? (
                        <a
                          href={link.href}
                          className="text-[15px] text-ink-400 transition-colors duration-150 hover:text-accent focus-visible:text-accent focus-visible:outline-none"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <span className="text-[15px] text-ink-500">{link.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Full-bleed block (outside the max-w container): giant wordmark + copyright, both the
          same width with 30px side padding. The wordmark is SVG text whose viewBox is the ink box
          of "ACTUS" in Montserrat Black at 100 units (measured in the browser), so it always spans
          exactly the available width: a vw font-size overflowed and got cut on phones.
          textLength pins the advance so the fallback font fits too while Montserrat loads. */}
      <div className="px-[30px] pt-16">
        <svg
          viewBox="-4 -73 366 76"
          aria-hidden="true"
          focusable="false"
          className="mx-auto block h-auto w-full max-w-350 select-none"
        >
          <text
            x="0"
            y="0"
            fontSize="100"
            textLength="360.8"
            lengthAdjust="spacingAndGlyphs"
            className="fill-white/6 font-heading font-black"
          >
            ACTUS
          </text>
        </svg>
        <div className="mt-[30px] flex flex-col items-start justify-between gap-4 border-t border-ink-800 pb-[30px] pt-6 text-sm text-ink-500 sm:flex-row sm:items-center">
          <p>© {year} Actus. Todos los derechos reservados.</p>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="/privacidad" className="transition-colors duration-150 hover:text-ink-100 focus-visible:text-ink-100 focus-visible:outline-none">
              Privacidad
            </a>
            <a href="/terminos" className="transition-colors duration-150 hover:text-ink-100 focus-visible:text-ink-100 focus-visible:outline-none">
              Términos
            </a>
            <a
              href="#home"
              className="inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-ink-100 focus-visible:text-ink-100 focus-visible:outline-none"
            >
              Volver arriba
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
