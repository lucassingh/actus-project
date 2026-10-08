"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  MessageSquareText,
  Mic,
  Image as ImageIcon,
  Brain,
  Wrench,
  Database,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import AnimatedList from "@/components/reactbits/AnimatedList";

// ── Chat bubbles ─────────────────────────────────────────────────────────────
function OperatorBubble({ children, time }: { children: React.ReactNode; time: string }) {
  return (
    <div className="flex max-w-[85%] flex-col gap-1 self-start">
      <span className="pl-1 text-[11px] font-medium text-ink-400">Operario</span>
      <div className="rounded-2xl rounded-tl-sm border border-ink-700/70 bg-ink-800 px-3.5 py-2.5 text-[14px] leading-snug text-ink-100">
        {children}
        <span className="mt-1 block text-right text-[10px] text-ink-400">{time}</span>
      </div>
    </div>
  );
}

function BotBubble({ children, time }: { children: React.ReactNode; time: string }) {
  return (
    <div className="flex max-w-[85%] flex-col gap-1 self-end">
      <span className="pr-1 text-right text-[11px] font-medium text-accent">Actus Bot</span>
      <div className="rounded-2xl rounded-tr-sm bg-accent-dark px-3.5 py-2.5 text-[14px] leading-snug text-white">
        {children}
        <span className="mt-1 block text-right text-[10px] text-white/70">{time} ✓✓</span>
      </div>
    </div>
  );
}

function Waveform() {
  const bars = [8, 14, 20, 12, 22, 16, 10, 18, 24, 12, 8, 16, 20, 10];
  return (
    <span className="flex items-center gap-2">
      <Mic className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      <span className="flex h-6 items-center gap-[2px]">
        {bars.map((h, i) => (
          <span key={i} className="w-[2px] rounded-full bg-ink-400" style={{ height: `${h}px` }} />
        ))}
      </span>
      <span className="shrink-0 text-[11px] text-ink-400">0:14</span>
    </span>
  );
}

// ── Step cards ───────────────────────────────────────────────────────────────
interface Step {
  n: string;
  title: string;
  desc: string;
  icon?: LucideIcon;
  modes?: LucideIcon[];
}

const steps: Step[] = [
  {
    n: "01",
    title: "Reporta la falla",
    desc: "Texto, un audio o una foto. Con lo que tenga a mano, sin instalar nada.",
    modes: [MessageSquareText, Mic, ImageIcon],
  },
  {
    n: "02",
    title: "Actus diagnostica",
    desc: "Cruza el problema con los manuales y los casos ya resueltos de su planta.",
    icon: Brain,
  },
  {
    n: "03",
    title: "Resuelve en minutos",
    desc: "Recibe 2-3 pasos concretos, ordenados por probabilidad de éxito.",
    icon: Wrench,
  },
  {
    n: "04",
    title: "Queda en la planta",
    desc: "Cada solución se guarda en la base de conocimiento, lista para la próxima.",
    icon: Database,
  },
];

function StepCard({
  step,
  delay,
  reduce,
  className = "",
}: {
  step: Step;
  delay: number;
  reduce: boolean | null;
  className?: string;
}) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20, scale: 0.98 }}
      whileInView={reduce ? {} : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-900/50 p-6 md:min-h-45 transition-colors duration-300 hover:border-ink-600 ${className}`}
    >
      <span
        aria-hidden="true"
        className="select-none font-serif text-4xl font-bold leading-none text-white/10 md:text-5xl"
      >
        {step.n}
      </span>

      <div className="mt-auto pt-4 md:pt-6">
        {step.modes ? (
          <div className="mb-4 flex gap-2">
            {step.modes.map((Icon, i) => (
              <span
                key={i}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 ring-1 ring-accent/20"
              >
                <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
              </span>
            ))}
          </div>
        ) : step.icon ? (
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
            <step.icon className="h-5 w-5 text-accent" aria-hidden="true" />
          </div>
        ) : null}
        <h3 className="font-heading text-lg font-bold text-white">{step.title}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-white/60">{step.desc}</p>
      </div>
    </motion.div>
  );
}

// ── Section ──────────────────────────────────────────────────────────────────
export function OperatorsSubsection() {
  const reduce = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden bg-ink-950 py-24 md:py-32">
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Desde WhatsApp
            </p>
            <h2 className="mt-3 font-heading text-[clamp(1.8rem,4vw,3rem)] font-black leading-[1.08] tracking-tight text-white">
              El asistente que sus operarios{" "}
              <span className="text-accent">ya tienen en el bolsillo.</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/70">
              Sin instalar nada, sin capacitación: reportan por WhatsApp y resuelven junto a Actus Bot.
            </p>
          </div>
          <a
            href="#contacto"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Agendar demo
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        {/* Bento — DOM in reading order (chat, 01, 02, 03, 04): on a phone it stacks like that;
            from md, a grid puts 01/03 left, the chat in the middle spanning both rows, 02/04
            right. The chat's feed is absolutely filled, so its changing content never drives
            the height: the step cards size the rows and the block never jumps. */}
        <div className="grid gap-4 md:grid-cols-[1fr_360px_1fr] md:grid-rows-2">
          {/* Live WhatsApp chat, fixed height on mobile, no phone frame */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20, scale: 0.98 }}
            whileInView={reduce ? {} : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-110 w-full flex-col overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-900/70 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.8)] md:col-start-2 md:row-span-2 md:row-start-1 md:h-auto"
          >
            {/* chat header */}
            <div className="flex items-center gap-3 border-b border-ink-800 bg-ink-900 px-4 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent/15 ring-1 ring-accent/30">
                <img src="/logos/isologo-light.svg" alt="" className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-ink-100">Actus Bot</p>
                <p className="text-xs text-emerald-400">en línea</p>
              </div>
              <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            </div>

            {/* feed — absolutely filled so its changing content never drives the box height;
                the box stretches (items-stretch) to match the side card columns instead */}
            <div className="relative min-h-0 flex-1">
              <div className="absolute inset-0 flex flex-col justify-end overflow-hidden p-4">
                <AnimatedList delay={2000} max={4}>
                <div key="m1">
                  <OperatorBubble time="09:14">Se trabó la cinta transportadora 3</OperatorBubble>
                </div>
                <div key="m2">
                  <OperatorBubble time="09:14">
                    <Waveform />
                  </OperatorBubble>
                </div>
                <div key="m3">
                  <OperatorBubble time="09:15">
                    <img
                      src="/landing/maquina-rota.jpg"
                      alt="Foto de la máquina averiada enviada por el operario"
                      className="mb-1 h-28 w-full rounded-lg object-cover"
                    />
                    Así quedó el rodillo
                  </OperatorBubble>
                </div>
                <div key="m4">
                  <BotBubble time="09:15">
                    Revisá la cinta 3 en este orden:
                    <span className="mt-1.5 block font-medium">
                      1. Cortá y destrabá el material.
                      <br />
                      2. Verificá la alineación del rodillo.
                      <br />
                      3. Si sigue, cambiá el sensor S2.
                    </span>
                  </BotBubble>
                </div>
                <div key="m5">
                  <OperatorBubble time="09:21">Listo, era el sensor 💪</OperatorBubble>
                </div>
                <div key="m6">
                  <BotBubble time="09:21">
                    Lo guardé en la base de conocimiento de la planta.
                  </BotBubble>
                </div>
                </AnimatedList>
              </div>
            </div>
          </motion.div>

          <StepCard step={steps[0]} delay={0} reduce={reduce} className="md:col-start-1 md:row-start-1" />
          <StepCard step={steps[1]} delay={0.08} reduce={reduce} className="md:col-start-3 md:row-start-1" />
          <StepCard step={steps[2]} delay={0.16} reduce={reduce} className="md:col-start-1 md:row-start-2" />
          <StepCard step={steps[3]} delay={0.24} reduce={reduce} className="md:col-start-3 md:row-start-2" />
        </div>
      </div>
    </section>
  );
}
