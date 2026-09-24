"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Inbox, MessageSquareText, FileText, BookOpen } from "lucide-react";

const Grainient = dynamic(() => import("@/components/reactbits/Grainient"), { ssr: false });

const CAPABILITIES = [
  { icon: Inbox, title: "Incidentes en tiempo real", text: "Cada falla que reportan por WhatsApp llega ordenada por estado y prioridad." },
  { icon: MessageSquareText, title: "La conversación completa", text: "Leé qué preguntó el técnico, qué respondió el agente y cómo se resolvió." },
  { icon: FileText, title: "Manuales que el agente usa", text: "Subí los PDFs de sus máquinas y el agente responde con esa información." },
  { icon: BookOpen, title: "Conocimiento que queda", text: "Cada solución confirmada se guarda para el próximo técnico que la necesite." },
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[100dvh] bg-canvas lg:grid-cols-[7fr_3fr]">
      {/* Brand panel */}
      <section
        aria-label="Qué podés hacer en Actus"
        className="relative isolate hidden overflow-hidden bg-[#161D3A] lg:flex lg:flex-col lg:justify-between"
      >
        <div className="absolute inset-0 -z-20">
          <Grainient
            color1="#EA580E"
            color2="#242F5B"
            color3="#0A0D1A"
            timeSpeed={0.12}
            warpSpeed={1.2}
            warpAmplitude={60}
            rotationAmount={320}
            contrast={1.15}
            saturation={1.05}
            grainAmount={0.07}
            grainScale={2.4}
            zoom={0.85}
            colorBalance={0.12}
          />
        </div>
        {/* Scrim: keeps the copy above AA contrast wherever the orange drifts */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(10,13,26,0.55)_0%,rgba(10,13,26,0.15)_35%,rgba(10,13,26,0.7)_100%)]"
        />

        <div className="p-10 xl:p-14">
          <Image src="/logos/logo-bg-black.svg" alt="Actus" width={110} height={36} className="h-8 w-auto" priority />
        </div>

        <div className="max-w-2xl p-10 xl:p-14">
          <h1 className="font-heading text-[clamp(2rem,3.2vw,3rem)] font-extrabold leading-[1.08] tracking-[-0.02em] text-white">
            El conocimiento de su planta, en un solo panel.
          </h1>
          <ul className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {CAPABILITIES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/10">
                  <Icon className="h-4 w-4 text-white" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/80">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Form panel */}
      <section className="flex min-h-[100dvh] flex-col px-6 py-8 sm:px-10">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1.5 rounded-md text-[13px] text-fg-subtle transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Volver al sitio
        </Link>

        <div className="flex flex-1 flex-col items-center justify-center py-10">
          <Image src="/logos/logo-bg-white.svg" alt="Actus" width={122} height={40} className="mb-8 h-10 w-auto" priority />
          <div className="w-full max-w-[400px]">{children}</div>
        </div>

        <p className="text-center text-xs text-fg-subtle">Gestión de incidentes y conocimiento de mantenimiento industrial.</p>
      </section>
    </div>
  );
}
