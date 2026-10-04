import Link from "next/link";

// Shared chrome for the public legal pages (privacy, terms). Light, readable, self-contained
// (explicit colors so it doesn't depend on dashboard/landing design tokens). Section styling is
// applied to descendant tags so each page can write plain <h2>/<p>/<ul> content.
export function LegalDoc({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-[#23262F]">
      <header className="border-b border-[#E6E7EE]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/logo-bg-white.svg" alt="Actus" className="h-7 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-[#6B7084] transition-colors hover:text-[#15183A]">
            ← Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-[#15183A]">{title}</h1>
        <p className="mt-2 text-sm text-[#6B7084]">Última actualización: {updated}</p>

        <div
          className="mt-8 [&_a]:text-[#C94B0B] [&_a]:underline [&_h2]:mt-9 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[#15183A] [&_li]:mt-1.5 [&_li]:text-[#3A3E4D] [&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-[#3A3E4D] [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
        >
          {children}
        </div>

        <p className="mt-12 border-t border-[#E6E7EE] pt-6 text-sm text-[#6B7084]">
          ¿Dudas sobre esta página? Escribinos a{" "}
          <a href="mailto:hola@actus.ai" className="text-[#C94B0B] underline">
            hola@actus.ai
          </a>
          .
        </p>
      </main>
    </div>
  );
}
