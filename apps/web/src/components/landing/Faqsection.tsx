"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus, ArrowRight } from "lucide-react";

interface Faq {
  id: string;
  q: string;
  a: string;
}

// Honest FAQ for the pilot — only what Actus actually does today. (Removed the old claims about
// SAP/Maximo/Fiix integrations, on-premise, "ROI in month one / 40-60% less time", 24/7 support,
// predictive-maintenance module, offline queueing, and customers across automotive/mining/pharma.)
const faqs: Faq[] = [
  {
    id: "a1",
    q: "¿Qué necesitan mis técnicos para usarlo?",
    a: "Solo WhatsApp, en el teléfono que ya tienen. No se instala ninguna app ni hay usuario y contraseña: el supervisor los da de alta por su número y ya pueden reportar.",
  },
  {
    id: "a2",
    q: "¿Qué puede entender el bot?",
    a: "Mensajes de texto, notas de voz y fotos del problema. Responde con pasos concretos, apoyándose en los manuales que haya cargado y en los casos que su equipo ya resolvió.",
  },
  {
    id: "a3",
    q: "¿Cómo aprende de mi planta?",
    a: "Cada incidente que se resuelve queda guardado como un caso. Con el tiempo, la base de conocimiento de su planta crece sola y el bot responde cada vez mejor, con la experiencia real de su equipo.",
  },
  {
    id: "a4b",
    q: "¿Qué ve el supervisor en el panel?",
    a: "Todos los incidentes de su planta en un solo lugar: estado, prioridad, máquina y la conversación completa de cada caso, más la base de conocimiento que se va formando. Desde ahí también da de alta a sus operarios y sube los manuales.",
  },
  {
    id: "a4",
    q: "¿Se integra con mi ERP o CMMS (SAP, Maximo…)?",
    a: "Hoy no. Actus funciona de forma independiente, por WhatsApp y su panel web. Las integraciones con otros sistemas son algo que evaluamos a futuro según la demanda.",
  },
  {
    id: "a5",
    q: "¿Cuánto cuesta?",
    a: "Estamos en etapa de piloto, todavía sin cobro automático. Lo definimos según el tamaño de su planta: escribinos y armamos una propuesta a medida.",
  },
  {
    id: "b1",
    q: "¿Qué documentación puedo cargar?",
    a: "Manuales y procedimientos en PDF con texto seleccionable. El supervisor los sube desde el panel y el bot los usa para responder. Todavía no procesamos PDFs escaneados (solo imagen); estamos trabajando en eso.",
  },
  {
    id: "b2",
    q: "¿Dónde se guardan los datos? ¿Son míos?",
    a: "Los datos son de su empresa. Se alojan en la nube (PostgreSQL en Neon, cifrado en tránsito y en reposo) y cada empresa queda aislada del resto. Si en algún momento quiere llevarse sus datos, se los entregamos.",
  },
  {
    id: "b2b",
    q: "¿Y si el bot no puede resolver el problema?",
    a: "Si le falta información, pide lo que necesita: máquina, sector, síntoma. Y como cada incidente queda registrado y visible en el panel, el supervisor puede seguirlo e intervenir cuando haga falta.",
  },
  {
    id: "b3",
    q: "¿Cuánto tarda ponerlo en marcha?",
    a: "Muy poco. Damos de alta un supervisor, él carga a sus operarios y suben los primeros manuales. En el mismo día pueden empezar a reportar por WhatsApp.",
  },
  {
    id: "b4",
    q: "¿Mis técnicos veteranos lo van a usar?",
    a: "Es tan simple como mandar un WhatsApp: un texto, un audio o una foto. No hay que llenar informes. Y en lugar de depender de que el “técnico estrella” esté, su conocimiento queda disponible para todo el equipo.",
  },
  {
    id: "b5",
    q: "¿En qué idioma responde?",
    a: "En español, pensado para el piso de planta (es-AR).",
  },
];

function AccordionItem({
  faq,
  open,
  onToggle,
  reduce,
}: {
  faq: Faq;
  open: boolean;
  onToggle: () => void;
  reduce: boolean | null;
}) {
  return (
    <div
      className={`rounded-2xl border transition-colors duration-300 ${
        open ? "border-accent/40 bg-white shadow-[0_18px_40px_-24px_rgba(234,88,14,0.35)]" : "border-line bg-white hover:border-ink-300"
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`${faq.id}-panel`}
        id={`${faq.id}-trigger`}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className={`font-heading text-[15px] font-bold leading-snug ${open ? "text-accent" : "text-fg"}`}>
          {faq.q}
        </span>
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ring-1 transition-all duration-300 ${
            open ? "rotate-45 bg-accent text-white ring-accent" : "bg-canvas text-fg-muted ring-line"
          }`}
          aria-hidden="true"
        >
          <Plus className="h-4 w-4" />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${faq.id}-panel`}
            role="region"
            aria-labelledby={`${faq.id}-trigger`}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-[14px] leading-relaxed text-fg-muted">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const Faqsection = () => {
  const reduce = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>("a1");

  const colA = faqs.slice(0, 6);
  const colB = faqs.slice(6);
  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <section id="faq" className="relative overflow-hidden bg-canvas py-28 md:py-36">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 md:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
        {/* Left — contact / info card */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl bg-ink-950 p-8 md:p-10">
            <h2 className="font-heading text-[clamp(1.8rem,3.2vw,2.75rem)] font-black leading-[1.1] tracking-tight text-white">
              ¿Preguntas que necesitan <span className="text-accent">una persona?</span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-white/70">
              Acá están las básicas. Para una propuesta, una demo o cualquier duda puntual de su planta,
              escribinos con su contexto real: le responde una persona del equipo.
            </p>

            <div className="my-8 grid grid-cols-2 gap-6 border-y border-white/10 py-6">
              <div>
                <p className="font-heading text-2xl font-black text-white">es-AR</p>
                <p className="mt-1 text-[13px] text-white/50">Atención en español</p>
              </div>
              <div>
                <p className="font-heading text-2xl font-black text-white">Directo</p>
                <p className="mt-1 text-[13px] text-white/50">Con el equipo fundador</p>
              </div>
            </div>

            <a
              href="#contacto"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-ink-950 transition-[transform,background-color] duration-200 hover:bg-accent-light active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Agendar demo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <p className="mt-4 text-center text-[13px] text-white/40">Respondemos en el día, de lunes a viernes.</p>
          </div>
        </div>

        {/* Right — accordion grid (two independent columns) */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            {colA.map((faq) => (
              <AccordionItem key={faq.id} faq={faq} open={openId === faq.id} onToggle={() => toggle(faq.id)} reduce={reduce} />
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {colB.map((faq) => (
              <AccordionItem key={faq.id} faq={faq} open={openId === faq.id} onToggle={() => toggle(faq.id)} reduce={reduce} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
